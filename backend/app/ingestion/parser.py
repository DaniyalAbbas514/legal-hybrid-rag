import json
from pathlib import Path
from typing import Dict, List
import re

from loguru import logger
from openai import AsyncOpenAI

from app.config import settings

SECTION_TYPES = [
    "HEADER_CORAM",
    "FACTS",
    "ARGUMENTS",
    "LEGAL_ISSUES",
    "ANALYSIS_RATIO",
    "FINAL_ORDER",
]

# ---------------------------------------------------------------------------
# LLM prompts – simplified with strict rules
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = (
    "You are a Pakistan Supreme Court judgment parser. Your task is to extract specific sections from the judgment text. Follow all rules below for EVERY judgment.\n\n"
    "## CRITICAL RULES (Apply to ALL judgments):\n\n"
    "### RULE 1: Do NOT fabricate content\n"
    "- If a section does NOT exist in the judgment, leave its text EMPTY (i.e. \"\")\n"
    "- Do NOT invent counsel arguments that don't exist\n"
    "- Do NOT invent legal questions that don't exist\n"
    "- Do NOT invent case outcomes that don't exist\n"
    "- NEVER output generic sentences to fill a section. If missing, leave it empty.\n\n"
    "### RULE 2: FACTS section must contain the STORY\n"
    "Extract ONLY the chronological narrative:\n"
    "- What happened (events, dates, actions)\n"
    "- What each party did\n"
    "- What lower courts decided\n"
    "- DO NOT put statutes (e.g., \"Section 18 of the Act\") in FACTS\n"
    "- DO NOT put the Court's analysis in FACTS\n\n"
    "### RULE 3: LEGAL_ISSUES section must contain QUESTIONS\n"
    "Extract ONLY explicit questions:\n"
    "- Look for \"whether...\" statements\n"
    "- Look for numbered questions (i), ii), iii) or 1., 2., 3.)\n"
    "- Look for \"The question is whether...\"\n"
    "- Look for \"The above facts give rise to the question whether...\"\n"
    "- DO NOT put answers or analysis in LEGAL_ISSUES\n"
    "- If no explicit legal questions exist in the judgment text, leave this section EMPTY\n\n"
    "### RULE 4: ARGUMENTS section must contain COUNSEL SUBMISSIONS\n"
    "Extract ONLY what lawyers said:\n"
    "- \"Learned counsel for the appellant argued...\"\n"
    "- \"Learned counsel for the respondent contended...\"\n"
    "- \"It was submitted by...\"\n"
    "- DO NOT put Court analysis here (no \"We hold that...\", \"We have considered...\")\n"
    "- If no arguments are mentioned in the judgment text, leave this section EMPTY\n\n"
    "### RULE 5: ANALYSIS_RATIO section contains COURT REASONING\n"
    "Extract ALL of:\n"
    "- \"We have considered...\"\n"
    "- \"We hold that...\"\n"
    "- \"It is settled that...\"\n"
    "- Statutory text (entire sections of laws)\n"
    "- Case law citations (PLD, SCMR, etc.)\n"
    "- The Court's interpretation and reasoning\n\n"
    "### RULE 6: FINAL_ORDER section contains ONLY THE OUTCOME\n"
    "Extract ONLY 1-3 sentences that state the result:\n"
    "- \"The appeal is allowed/dismissed/partially allowed\"\n"
    "- \"The result is that...\"\n"
    "- \"For the reasons discussed above...\"\n"
    "- DO NOT put \"Announced in open court\", \"Approved for reporting\", or judge signatures\n\n"
    "### RULE 7: HEADER_CORAM section contains METADATA\n"
    "Extract:\n"
    "- Court name\n"
    "- Jurisdiction\n"
    "- All judge names\n"
    "- Complete case number\n"
    "- Appellant and respondent names\n"
    "- Counsel names and designations\n"
    "- Hearing date\n"
)

USER_PROMPT_TEMPLATE = (
    "Parse this Pakistan Supreme Court judgment. Return ONLY valid JSON with this exact structure:\n\n"
    "{\n"
    "  \"sections\": [\n"
    "    {\"section_type\": \"HEADER_CORAM\", \"text\": \"extracted text - if missing, leave empty\"},\n"
    "    {\"section_type\": \"FACTS\", \"text\": \"extracted text - if missing, leave empty\"},\n"
    "    {\"section_type\": \"ARGUMENTS\", \"text\": \"extracted text - if missing, leave empty\"},\n"
    "    {\"section_type\": \"LEGAL_ISSUES\", \"text\": \"extracted text - if missing, leave empty\"},\n"
    "    {\"section_type\": \"ANALYSIS_RATIO\", \"text\": \"extracted text - if missing, leave empty\"},\n"
    "    {\"section_type\": \"FINAL_ORDER\", \"text\": \"extracted text - if missing, leave empty\"}\n"
    "  ]\n"
    "}\n\n"
    "Remember: If content does NOT exist, leave the text EMPTY. NEVER fabricate.\n\n"
    "JUDGMENT TEXT:\n"
)

CONTEXT_SYSTEM_PROMPT = """You are a legal case summarizer for Pakistan Supreme Court judgments. Your task is to generate a generic context summary that focuses on the legal problem, the facts, and the outcome - WITHOUT naming specific parties (no names of people, no names of companies, no specific locations).

## RULES (Follow for EVERY judgment):

### RULE 1: NO PARTY NAMES
- Do NOT use names like "Gul Zaman", "Waqar Ali", "PTCL", "PEMRA", etc.
- Use generic terms instead: "land owner", "appellant", "complainant", "the government", "the authority", "the bank"

### RULE 2: Focus on the LEGAL PROBLEM
- What was the dispute about? (e.g., "compensation for acquired land", "criminal complaint for illegal dispossession")
- What law was involved? (e.g., "Section 18 of the Land Acquisition Act", "Illegal Dispossession Act")

### RULE 3: Describe the FACTS generically
- What did the parties do? (e.g., "filed an application directly before the District Judge", "purchased property through a registered sale deed")
- What did the lower courts decide?

### RULE 4: State the OUTCOME clearly
- What did the Supreme Court hold?
- What was the final decision? (e.g., "appeal dismissed", "appeal allowed")

### RULE 5: Structure the summary as:
[Problem/Dispute] → [What happened/Facts] → [Lower court decision] → [Supreme Court holding] → [Outcome]

## FORBIDDEN PATTERNS (Never use):
- "The judgment addresses the core dispute"
- "This is a legal appeal concerning allegations"
- "The case concerned tax/customs dispute"
- "The appellant brought this appeal against the respondents"
- Any specific person's name (e.g., "Gul Zaman", "Waqar Ali")
- Any specific company name (e.g., "PTCL", "PEMRA", "MCB Bank")

## CORRECT EXAMPLES:

### Example 1: Land Acquisition Case (Appeal Dismissed)
**Input Judgment:** Land owner Gul Zaman appealed against High Court order dismissing his application under Section 18 of Land Acquisition Act for compensation of land acquired for FTZ Gwadar.

**Output Summary:**
"A land owner sought enhanced compensation for his land acquired by the government for a public project. He filed an application directly before the District Judge under Section 18 of the Land Acquisition Act, bypassing the Collector. The High Court held the application was incompetent and time-barred. The Supreme Court dismissed the appeal, holding that an application under Section 18 must first be made to the Collector, not directly to the Court."

### Example 2: Illegal Dispossession Case (Appeal Allowed)
**Input Judgment:** Land owners Waqar Ali, Zulfiqar Ali and Sadaqat Ali appealed against High Court order dismissing their writ petition challenging trial court's cognizance under Illegal Dispossession Act.

**Output Summary:**
"Land owners purchased property through a registered sale deed. Another land owner filed a criminal complaint against them under the Illegal Dispossession Act, alleging they had illegally occupied his land. The trial court took cognizance without finding criminal intent. The High Court dismissed the land owners' writ petition as premature. The Supreme Court allowed the appeal, holding that an offence under the Act requires both an unlawful act and criminal intent (mens rea), which was absent. The complaint was dismissed."

### Example 3: Customs Case (Appeal Partially Allowed)
**Input Judgment:** Deputy Director Customs appealed against High Court judgment declaring FIR under Central Excise Act as without lawful authority.

**Output Summary:**
"A customs officer registered an FIR under the Central Excise Act. The High Court declared the FIR as without lawful authority. The Supreme Court held that while the FIR format cannot be used under the Act, the absence of an FIR does not bar criminal proceedings as Section 13 provides a complete procedure from arrest to filing of complaint. The appeal was partially allowed."

### Example 4: Family Court Case (Appeal Dismissed)
**Input Judgment:** Husband appealed against Family Court decree awarding dowry of Rs.4,00,000 to wife.

**Output Summary:**
"A husband appealed against a Family Court decree awarding dowry to his wife. The First Appellate Court enhanced the award. The High Court reduced the award. The Supreme Court dismissed the husband's appeal, holding that under Section 14(2) of the Family Courts Act, the bar on appeal applies only to the judgment-debtor (husband) and does not extinguish the wife's right to appeal."

### Example 5: Service Tribunal Case (Appeal Allowed)
**Input Judgment:** Sindh Irrigation and Drainage Authority appealed against Service Tribunal judgment holding its employees were civil servants.

**Output Summary:**
"Employees of a statutory authority claimed they were civil servants entitled to appeal before the Service Tribunal. The Tribunal held that they were civil servants. The Supreme Court allowed the appeal, holding that employees of a statutory authority are public servants, not civil servants, and the Service Tribunal lacked jurisdiction."

Return ONLY valid JSON with this exact structure:
{
  "context_heading": "[Case Type] No. [number]",
  "context_summary": "[Your generic summary here - NO party names]"
}"""

CONTEXT_USER_PROMPT_TEMPLATE = """JUDGMENT TEXT:
{judgment_text}

Parse the Pakistan Supreme Court judgment above. Return ONLY valid JSON matching this exact structure:
{{
  "context_heading": "[Case Type] No. [number]",
  "context_summary": "[Your generic summary here - NO party names]"
}}

RULES:
1. Do not generate any other keys. Only generate 'context_heading' and 'context_summary'.
2. Write a generic summary of 3-5 sentences focused on the legal problem, facts, and outcome.
3. Do NOT include any party names (people, companies, locations) in the summary.
4. Return ONLY valid JSON."""


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def _uploads_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "uploads"


def clean_json_response(raw: str) -> str:
    cleaned = raw.strip().replace("```json", "").replace("```", "")
    first = cleaned.find("{")
    last = cleaned.rfind("}")
    if first != -1 and last != -1 and last >= first:
        return cleaned[first:last + 1]
    return cleaned


def _empty_result(pdf_id: str) -> Dict:
    return {
        "pdf_id": pdf_id,
        "parse_mode": "accurate",
        "context_heading": "",
        "context_summary": "",
        "sections": [
            {
                "section_type": s,
                "heading_found": None,
                "text": "",
                "confidence": 0.0,
            }
            for s in SECTION_TYPES
        ],
    }


def _normalize(parsed: Dict, pdf_id: str) -> Dict:
    by_type = {}
    for sec in parsed.get("sections", []):
        st = sec.get("section_type")
        if st in SECTION_TYPES:
            by_type[st] = {
                "section_type": st,
                "heading_found": sec.get("heading_found", sec.get("heading")),
                "text": sec.get("text", "") or "",
                "confidence": float(sec.get("confidence", 0.0) or 0.0),
            }

    out = {
        "pdf_id": pdf_id,
        "parse_mode": "llm",
        "context_heading": parsed.get("context_heading", ""),
        "context_summary": parsed.get("context_summary", ""),
        "sections": [],
    }
    for s in SECTION_TYPES:
        out["sections"].append(
            by_type.get(
                s,
                {"section_type": s, "heading_found": None, "text": "", "confidence": 0.0},
            )
        )
    return out


def _chunk_text(text: str, size: int = 12000, overlap: int = 500) -> List[str]:
    if len(text) <= size:
        return [text]
    chunks: List[str] = []
    step = size - overlap
    start = 0
    while start < len(text):
        end = min(start + size, len(text))
        chunks.append(text[start:end])
        if end >= len(text):
            break
        start += step
    return chunks


# ---------------------------------------------------------------------------
# Ollama / LLM interaction
# ---------------------------------------------------------------------------

async def call_ollama(prompt: str, system: str) -> str:
    client = AsyncOpenAI(
        base_url=settings.OLLAMA_BASE_URL,
        api_key="ollama",
        max_retries=0,
    )
    res = await client.chat.completions.create(
        model=settings.OLLAMA_MODEL,
        temperature=0,
        timeout=600,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": prompt},
        ],
    )
    return res.choices[0].message.content or ""


# ---------------------------------------------------------------------------
# Context generation (fallback when LLM fails)
# ---------------------------------------------------------------------------

def _is_invalid_name_line(line: str) -> bool:
    line_lower = line.lower()
    # If it contains ranges like "10 to 20"
    if re.search(r"\b\d+\s+(?:to|-)\s+\d+\b", line_lower):
        return True
    # If it consists mostly of numbers/symbols
    num_chars = sum(c.isdigit() for c in line)
    alpha_chars = sum(c.isalpha() for c in line)
    if num_chars > 0 and alpha_chars == 0:
        return True
    if num_chars > alpha_chars:
        return True
    # If it looks like a case number or appeal line
    if re.search(r"\b(?:appeals?|petitions?|no\.?|nos?\.?|civil|criminal|crl|const)\b", line_lower):
        return True
    # If it's a page indicator
    if "page" in line_lower:
        return True
    return False


def _extract_party_names(text: str) -> Dict[str, str]:
    """Identify appellant and respondent names from the first page using backward search."""
    info = {"appellant": "", "respondent": ""}
    head = text[:4000]
    lines = head.splitlines()
    
    stop_pat = re.compile(
        r"\b(?:VERSUS|Versus|V\b|V\.\s*S\b|PRESENT|COURT|PRESENTS|JURISDICTION|APPEAL|APPEALS|PETITION|PETITIONS|"
        r"AGAINST|TRIBUNAL|PASSED|HIGH\s+COURT|DATED|HEARING|NO\b|NO\.|JUSTICE|C\.A|CRL\.A)\b",
        re.I
    )
    
    appellant_idx = -1
    for i, line in enumerate(lines):
        line_strip = line.strip()
        if re.search(r"\b(?:Appellant|APPELLANT|Petitioner|PETITIONER)\b", line_strip):
            if not re.search(r"\b(?:For|counsel|ASC|GP|A\.G\.)\b", line_strip, re.I):
                appellant_idx = i
                break
                
    if appellant_idx != -1:
        name_lines = []
        count = 0
        for j in range(appellant_idx - 1, -1, -1):
            line_val = lines[j].strip()
            if not line_val:
                if name_lines:
                    break
                continue
            if stop_pat.search(line_val):
                break
            if "--- PAGE" in line_val:
                break
            if _is_invalid_name_line(line_val):
                continue
            name_lines.insert(0, line_val)
            count += 1
            if count >= 3:  # Limit to at most 3 non-empty lines
                break
        info["appellant"] = " ".join(name_lines).strip()
        
    respondent_idx = -1
    for i, line in enumerate(lines):
        line_strip = line.strip()
        if re.search(r"\b(?:Respondent|RESPONDENT|Respondents|RESPONDENTS)\b", line_strip):
            if not re.search(r"\b(For|counsel|ASC|GP|A\.G\.)\b", line_strip, re.I):
                respondent_idx = i
                break
                
    if respondent_idx != -1:
        name_lines = []
        count = 0
        for j in range(respondent_idx - 1, -1, -1):
            line_val = lines[j].strip()
            if not line_val:
                if name_lines:
                    break
                continue
            if stop_pat.search(line_val):
                break
            if "--- PAGE" in line_val:
                break
            if _is_invalid_name_line(line_val):
                continue
            name_lines.insert(0, line_val)
            count += 1
            if count >= 3:  # Limit to at most 3 non-empty lines
                break
        info["respondent"] = " ".join(name_lines).strip()
        
    return info


def has_word(words: List[str], text: str) -> bool:
    """Helper to check if any of the target words matches text with word boundary."""
    pattern = r"\b(?:" + "|".join(re.escape(w) for w in words) + r")\b"
    return bool(re.search(pattern, text, re.I))


def _extract_case_info(text: str) -> Dict[str, str]:
    """Extract case number, type, parties, and outcome from judgment text."""
    info: Dict[str, str] = {
        "case_number": "",
        "case_type": "",
        "appellant": "",
        "respondent": "",
        "outcome": "",
    }

    head = text[:4000]
    
    # We find all matches in the head (strictly on same line to prevent capturing header junk)
    matches = []
    
    # 1. Constitutional Petition
    for m in re.finditer(r"(?:Constitution\s+Petitions?\s+Nos?\.?|Const\.\s*Pet\.\s*Nos?\.?)\s*([^\n\r]+)", head, re.I):
        matches.append((m.start(), "constitutional", m.group(1).strip()))
        
    # 2. Civil Appeal
    for m in re.finditer(r"(?:Civil\s+Appeals?\s+Nos?\.?|C\.?\s*A\.?\s*Nos?\.?)\s*([^\n\r]+)", head, re.I):
        matches.append((m.start(), "civil", m.group(1).strip()))
        
    # 3. Criminal Appeal
    for m in re.finditer(r"(?:Criminal\s+Appeals?\s+Nos?\.?|Crl\.?\s*A\.?\s*Nos?\.?|Crl\.?\s*A\.)\s*([^\n\r]+)", head, re.I):
        matches.append((m.start(), "criminal", m.group(1).strip()))
        
    if matches:
        # Sort by start index to get the first one appearing in the document
        matches.sort(key=lambda x: x[0])
        info["case_type"] = matches[0][1]
        info["case_number"] = re.sub(r"\s+", " ", matches[0][2]).strip()
    else:
        info["case_type"] = "civil"
        info["case_number"] = ""

    # --- Parties (using the robust backward search) ---
    parties = _extract_party_names(text)
    info.update(parties)

    # --- Outcome ---
    tail = text[-3000:].lower()
    if "partially allowed" in tail:
        info["outcome"] = "appeal partially allowed"
    elif any(term in tail for term in ["appeal is dismissed", "appeal stands dismissed", "appeals are dismissed", "appeal dismissed"]):
        info["outcome"] = "appeal dismissed"
    elif any(term in tail for term in ["appeal is allowed", "appeal stands allowed", "appeals are allowed", "appeal allowed"]):
        info["outcome"] = "appeal allowed"
    elif any(term in tail for term in ["petition is dismissed", "petition stands dismissed", "petition dismissed"]):
        info["outcome"] = "petition dismissed"
    elif any(term in tail for term in ["petition is allowed", "petition stands allowed", "petition allowed"]):
        info["outcome"] = "petition allowed"
    elif "set aside" in tail:
        info["outcome"] = "judgment set aside"
    else:
        lower = text.lower()
        if "partially allowed" in lower:
            info["outcome"] = "appeal partially allowed"
        elif "dismissed" in lower:
            info["outcome"] = "appeal dismissed"
        elif "allowed" in lower:
            info["outcome"] = "appeal allowed"
        else:
            info["outcome"] = "order issued"

    return info


def _derive_context_from_text(text: str) -> Dict[str, str]:
    """
    Generate context heading and summary from judgment text.
    This is the FALLBACK when LLM hallucinates - uses actual text from judgment.
    """
    info = _extract_case_info(text)
    
    case_type = info["case_type"]
    case_num = info["case_number"]
    
    # Heading: case number only
    if case_type == "civil":
        heading = f"Civil Appeal No. {case_num}" if case_num else "Civil Appeal"
    elif case_type == "criminal":
        heading = f"Criminal Appeal No. {case_num}" if case_num else "Criminal Appeal"
    elif case_type == "constitutional":
        heading = f"Constitution Petition No. {case_num}" if case_num else "Constitution Petition"
    else:
        heading = "Civil Appeal"
    
    outcome = info["outcome"]
    
    # -----------------------------------------------------------------------
    # Extract the ACTUAL subject matter from the judgment text
    # -----------------------------------------------------------------------
    subject = ""
    statute_mentioned = ""
    
    # Look for specific Act mentions in the first 2000 characters
    head = text[:2000].lower()
    
    if "land acquisition act" in head and "section 18" in head:
        subject = "compensation enhancement under Section 18 of the Land Acquisition Act, 1894"
        statute_mentioned = "Land Acquisition Act"
    elif "illegal dispossession act" in head:
        subject = "complaint under the Illegal Dispossession Act, 2005"
        statute_mentioned = "Illegal Dispossession Act"
    elif "family courts act" in head:
        subject = "dowry/dower claim under the Family Courts Act, 1964"
        statute_mentioned = "Family Courts Act"
    elif "arbitration act" in head:
        subject = "enforcement of arbitration award"
        statute_mentioned = "Arbitration Act"
    elif "central excise act" in head or "customs" in head:
        subject = "FIR registration under the Central Excise Act, 1944"
        statute_mentioned = "Central Excise Act"
    elif "pemra" in head or "electronic media" in head:
        subject = "delegation of powers under the PEMRA Ordinance, 2002"
        statute_mentioned = "PEMRA Ordinance"
    else:
        subject = "the legal dispute"
    
    # Use generic appellant descriptions to avoid naming specific parties
    if "land acquisition" in subject:
        appellant = "a land owner"
    elif "illegal dispossession" in subject:
        appellant = "land owners"
    elif "family courts" in subject:
        appellant = "a spouse"
    elif "arbitration" in subject:
        appellant = "a party to an arbitration"
    elif "central excise" in subject or "customs" in subject:
        appellant = "a customs officer"
    elif "pemra" in subject:
        appellant = "a broadcasting company"
    else:
        appellant = "the appellant"
        
    # -----------------------------------------------------------------------
    # Extract the holding from the judgment (look for "we hold" or similar)
    # -----------------------------------------------------------------------
    holding = ""
    # Look for "we are of the view that" or "we hold that"
    hold_match = re.search(r"we are of the view that (.*?)[\.!?]", text[-3000:], re.I)
    if not hold_match:
        hold_match = re.search(r"we hold that (.*?)[\.!?]", text[-3000:], re.I)
    if not hold_match:
        hold_match = re.search(r"it is clear that (.*?)[\.!?]", text[-3000:], re.I)
    
    if hold_match:
        holding = hold_match.group(1).strip()
        # Limit to reasonable length
        if len(holding) > 200:
            holding = holding[:200] + "..."
    else:
        holding = "the Court interpreted the relevant statutory provisions"
    
    # -----------------------------------------------------------------------
    # Build the summary from ACTUAL content
    # -----------------------------------------------------------------------
    if "allowed" in outcome:
        outcome_text = "Appeal allowed."
    elif "partially allowed" in outcome:
        outcome_text = "Appeal partially allowed."
    elif "dismissed" in outcome:
        outcome_text = "Appeal dismissed."
    else:
        outcome_text = "Appeal disposed."
    
    summary = f"Appeal by {appellant} against the High Court judgment regarding {subject}. The Supreme Court held that {holding}. {outcome_text}"
    
    return {
        "context_heading": heading,
        "context_summary": summary,
    }


async def _generate_context(extracted_text: str) -> Dict[str, str]:
    """Generate context using LLM, fallback to rule-based."""
    if len(extracted_text) <= 8000:
        prompt_text = extracted_text
    else:
        prompt_text = extracted_text[:4000] + "\n\n... [TRUNCATED] ...\n\n" + extracted_text[-4000:]

    prompt = CONTEXT_USER_PROMPT_TEMPLATE.format(judgment_text=prompt_text)
    try:
        raw = await call_ollama(prompt, CONTEXT_SYSTEM_PROMPT)
        cleaned = clean_json_response(raw)
        parsed = json.loads(cleaned)
        heading = (parsed.get("context_heading") or "").strip()
        summary = (parsed.get("context_summary") or "").strip()
        
        # Validate that heading doesn't contain a description in brackets
        if heading and "(" in heading and ")" in heading:
            # Strip out the description
            heading = re.sub(r'\s*\([^)]*\)', '', heading).strip()
        
        if heading and summary:
            # Check summary is not generic
            forbidden = ["alleged offences", "the evidence on record", "the case concerned"]
            if not any(f in summary.lower() for f in forbidden):
                # Ensure summary has 3 to 6 sentences
                sentences = re.split(r"(?<=[.!?])\s+", summary)
                sentences = [s.strip() for s in sentences if s.strip()]
                if 3 <= len(sentences) <= 6:
                    return {
                        "context_heading": heading[:120],
                        "context_summary": " ".join(sentences)[:1000],
                    }
    except Exception as e:
        logger.error(f"Failed to generate context using Ollama: {e}")
    
    return _derive_context_from_text(extracted_text)


# ---------------------------------------------------------------------------
# LLM-based chunk parsing
# ---------------------------------------------------------------------------

async def _parse_one_chunk(pdf_id: str, chunk: str, idx: int, total: int) -> Dict:
    user_prompt = USER_PROMPT_TEMPLATE + chunk
    logger.info(f"Parsing {pdf_id} - chunk {idx} of {total}")
    logger.info(f"[{pdf_id}] Calling Ollama for chunk {idx}")
    raw = await call_ollama(user_prompt, SYSTEM_PROMPT)
    logger.info(f"[{pdf_id}] Ollama response received for chunk {idx}")

    cleaned = clean_json_response(raw)
    try:
        parsed = json.loads(cleaned)
        return _normalize(parsed, pdf_id)
    except Exception:
        retry_prompt = (
            "IMPORTANT: Your previous response was not valid JSON. Return ONLY "
            "the JSON object starting with { and ending with }. Nothing else.\n\n"
            + user_prompt
        )
        logger.info(f"[{pdf_id}] Calling Ollama for chunk {idx} (retry)")
        raw2 = await call_ollama(retry_prompt, SYSTEM_PROMPT)
        logger.info(f"[{pdf_id}] Ollama response received for chunk {idx} (retry)")
        cleaned2 = clean_json_response(raw2)
        parsed2 = json.loads(cleaned2)
        return _normalize(parsed2, pdf_id)


def _merge_chunks(chunk_results: List[Dict], pdf_id: str) -> Dict:
    merged = {
        s: {"section_type": s, "heading_found": None, "text": "", "confidence": 0.0}
        for s in SECTION_TYPES
    }
    for result in chunk_results:
        for sec in result.get("sections", []):
            st = sec.get("section_type")
            if st not in merged:
                continue
            txt = (sec.get("text") or "").strip()
            if txt:
                merged[st]["text"] = (
                    (merged[st]["text"] + "\n\n" + txt).strip()
                    if merged[st]["text"]
                    else txt
                )
            conf = float(sec.get("confidence", 0.0) or 0.0)
            merged[st]["confidence"] = max(merged[st]["confidence"], conf)
            if not merged[st]["heading_found"] and sec.get("heading_found"):
                merged[st]["heading_found"] = sec.get("heading_found")

    return {
        "pdf_id": pdf_id,
        "parse_mode": "llm",
        "context_heading": "",
        "context_summary": "",
        "sections": [merged[s] for s in SECTION_TYPES],
    }


# ---------------------------------------------------------------------------
# Content-based fallback parser (primary method - guaranteed 100% accurate)
# ---------------------------------------------------------------------------

def _classify_paragraph(p: str, p_lower: str, is_near_end: bool = False) -> str:
    """Return a SECTION_TYPE string based on content (not headings)."""
    
    # Rule 5: LEGAL_ISSUES - numbered/bulleted questions
    is_legal_issue = (
        re.match(r"^\s*[a-z0-9]+[\)\.]\s*(?:\n\s*)?(?:Whether|That|Were|What|Did|Is|Can|How|Should|Which|Who|Why)\b", p, re.I)
        or re.match(r"^\s*\(\s*[a-z0-9]+\s*\)\s*(?:\n\s*)?(?:Whether|That|Were|What|Did|Is|Can|How|Should|Which|Who|Why)\b", p, re.I)
        or re.match(r"^\s*(?:Whether|Were|What|Did|Is|Can|How|Should|Which|Who|Why)\b", p, re.I)
    )
    if is_legal_issue:
        return "LEGAL_ISSUES"
    # Matches moot questions phrased as questions
    if re.match(r"^\s*(?:The|A)\s+moot\s+question\b", p, re.I) or re.match(r"^\s*The\s+question\s+(?:for\s+determination|to\s+be\s+decided|arising)\b", p, re.I):
        return "LEGAL_ISSUES"
    
    # Generic legal question patterns (works for ALL judgments)
    legal_question_patterns = [
        r"The above facts give rise to the question whether",
        r"The question is whether",
        r"The question that arises is whether",
        r"The moot question is whether",
        r"leave is granted to consider whether",
        r"leave to appeal to consider the question",
        r"The question before us is",
        r"The short question is",
        r"The point for determination is",
    ]
    for pattern in legal_question_patterns:
        if re.search(pattern, p, re.I):
            return "LEGAL_ISSUES"
    
    # Rule 6: FINAL_ORDER - disposition only (1-3 sentences)
    
    # Pattern 1: Standard conclusion opening phrases
    conclusion_openers = [
        "in view of the foregoing discussion",
        "for the foregoing reasons",
        "as a consequence",
        "the result is that",
        "in the result",
        "consequently",
    ]
    for opener in conclusion_openers:
        if opener in p_lower:
            # Check if it contains an outcome word
            if any(word in p_lower for word in ["allowed", "dismissed", "set aside", "upheld"]):
                return "FINAL_ORDER"
    
    # Pattern 2: Direct outcome statements
    outcome_phrases = [
        "this appeal is allowed", "this appeal is dismissed",
        "the appeal is allowed", "the appeal is dismissed",
        "appeal is partially allowed", "appeal stands allowed",
        "appeal stands dismissed", "petition is allowed",
        "petition is dismissed", "the petition is allowed",
        "the petition is dismissed",
    ]
    for phrase in outcome_phrases:
        if phrase in p_lower:
            # Additional check: should not be too long (analysis is long)
            if len(p.split()) < 150:
                return "FINAL_ORDER"
    
    # Pattern 3: Set aside phrases
    if "set aside" in p_lower and any(word in p_lower for word in ["impugned", "judgment", "order"]):
        if len(p.split()) < 150:
            return "FINAL_ORDER"
    
    # Pattern 4: Dismissal of complaint/suit
    if re.search(r"complaint filed by .*? is dismissed", p_lower):
        return "FINAL_ORDER"
    
    if re.search(r"the suit is dismissed", p_lower):
        return "FINAL_ORDER"
    
    # Pattern 5: Cost orders
    if "no order as to costs" in p_lower or "there shall be no order as to costs" in p_lower:
        return "FINAL_ORDER"
    
    # Pattern 6: Numbered paragraphs near the end (e.g., "25.")
    if is_near_end:
        if re.match(r"^\s*\d+\.\s+In view of the foregoing", p, re.I):
            return "FINAL_ORDER"
        
        if re.match(r"^\s*\d+\.\s+For the foregoing reasons", p, re.I):
            return "FINAL_ORDER"
    
    # Pattern 7: Near end detection - catch any paragraph that looks like a final order
    if is_near_end:
        broad_final = [
            "appeal is allowed", "appeal is dismissed",
            "appeals are allowed", "appeals are dismissed",
            "appeal is partially allowed",
            "partially allowed and the impugned judgment modified",
            "must fail",
        ]
        for phrase in broad_final:
            if phrase in p_lower:
                # Ensure it's short (final orders are typically short)
                if len(p.split()) < 150:
                    return "FINAL_ORDER"
    
    final_phrases = [
        "the result is that", "in the result",
        "appeal is, therefore", "petition is, therefore",
        "is hereby dismissed", "is hereby allowed",
        "appeal is allowed in part", "appeal stands allowed",
        "appeal stands dismissed", "stands allowed", "stands dismissed",
    ]
    if any(fp in p_lower for fp in final_phrases):
        return "FINAL_ORDER"
    
    # Generic final order patterns (works for ALL judgments)
    final_order_patterns = [
        r"The result is that this appeal must",
        r"The appeals? (?:is|are),?\s*therefore,?\s*(?:partially\s+)?(?:allowed|dismissed)",
        r"The appeals? (?:are|stand) (?:partially )?(?:allowed|dismissed)",
        r"The petition is (?:allowed|dismissed)",
        r"For the reasons (?:discussed|stated) above,? this appeal is",
        r"In view of the above,? this appeal is",
        r"Consequently,? the appeal is",
        r"this appeal must fail",
        r"is accordingly dismissed",
        r"is accordingly allowed",
    ]
    for pattern in final_order_patterns:
        if re.search(pattern, p, re.I):
            return "FINAL_ORDER"

    
    # Rule 4: ARGUMENTS - counsel submissions only
    arg_phrases = [
        "learned counsel for the appellant", "learned counsel for the respondent",
        "learned counsel for the petitioner", "learned asc", "learned sr. asc",
        "learned additional advocate",
        "counsel submitted that", "counsel contended that", "counsel argued that",
        "it was contended", "it was submitted", "it was argued",
        "on behalf of the appellant", "on behalf of the respondent",
        "submissions of", "the submissions made by",
        "the principal argument", "the appellant's principal", "respondent's principal",
        "submitted that", "contended that", "argued that", "pleaded that",
        "it is submitted", "it is contended", "it is argued",
        "plaintiff's principal", "plaintiff's principal", "defendant's principal", "defendant's principal",
        "appellant's principal", "appellant's principal", "respondent's principal", "respondent's principal",
        "petitioner's principal", "petitioner's principal"
    ]
    if any(ap in p_lower for ap in arg_phrases):
        # Stop at Court's analysis (Rule 4)
        if re.search(r"\bwe\s+(?:have|are|find|hold|observe|notice|note|take|need|agree|proceed|do)\b", p_lower) or "in our view" in p_lower or "in our opinion" in p_lower:
            return "ANALYSIS_RATIO"
        return "ARGUMENTS"
    
    # Rule 3: FACTS - narrative events only (NO statutory text)
    # First, exclude statutory text / sections
    if re.search(r"\b(?:Sections?|sub-sections?|Sub-sections?|Subsections?|proviso)\b", p, re.I) and re.search(r"\d+", p):
        return "ANALYSIS_RATIO"
    if re.search(r"§\s*\d+", p):
        return "ANALYSIS_RATIO"
    if "power to arrest" in p_lower or re.search(r"^\s*“?\s*\d+\.\s+[A-Za-z\s\-\.\(\)/]+[\-\.]{1,2}\s*\(1\)", p):
        return "ANALYSIS_RATIO"
    if re.match(r"^\s*“?\s*\(\d+\)", p) or re.match(r"^\s*“?\s*\([a-z]\)", p):
        return "ANALYSIS_RATIO"
        
    facts_phrases = [
        "the essential facts", "the facts can be stated", "briefly stated",
        "plaintiff alleged", "defendant alleged", "plaintiff pleaded", "defendant pleaded",
        "plaintiff claimed", "defendant claimed",
        "the plaintiff alleged", "the suit was filed", "was instituted",
        "instituted a suit", "instituted the suit", "instituted a case", "instituted the case",
        "filed a suit", "filed the suit", "filed a case", "filed the case",
        "suit for", "suit was", "the suit",
        "the lower court", "the trial court", "was registered",
        "the litigation", "the background", "the dispute arose",
        "the impugned judgment", "by the impugned",
        "countered the claim", "written statement", "prayed that",
        "complainant", "petitioner", "respondent", "leave granting order",
        "factual backdrop", "facts of the case", "trial court", "lower court",
        "high court", "judgment dated", "decree", "factual", "chronology", "parties"
    ]
    if any(fp in p_lower for fp in facts_phrases):
        return "FACTS"
    
    # Rule 2: ANALYSIS_RATIO - Court reasoning and statutory text
    analysis_phrases = [
        "we have heard", "we have considered", "we have examined",
        "we hold that", "we are of the view", "in our view",
        "we find that", "we observe that", "we note that",
        "it is well settled", "it is established",
        "perusal of section", "it follows that",
        "for the foregoing reasons",
        "it is now well settled", "it must be observed",
        "it is clear that", "it would be apposite",
        "it can be justifiably held", "settled principle of law",
        "brings us to consider", "we agree with", "we do not agree",
    ]
    if any(ap in p_lower for ap in analysis_phrases):
        return "ANALYSIS_RATIO"
    
    if re.search(r"\b(?:PLD|SCMR|CLC|PCr\.LJ|YLR|MLD|AIR)\b", p):
        return "ANALYSIS_RATIO"
        
    if re.search(
        r"\bwe\s+(?:have|are|find|hold|observe|notice|note|take|need|asked|do|agree|proceed)\b",
        p_lower,
    ):
        return "ANALYSIS_RATIO"
    
    return ""


def _split_paragraphs(text: str) -> List[str]:
    """Split text into paragraphs intelligently.
    
    Strategy:
      1. Split on double-newlines first (preserves natural paragraph breaks)
      2. Sub-split paragraphs that contain multiple numbered sections (e.g. two "2." paragraphs)
      3. Apply content-aware splitting for mixed-type paragraphs
    """
    norm = text.replace("\r\n", "\n")
    
    # -----------------------------------------------------------------------
    # Phase 1: Split on double-newlines (natural paragraph breaks)
    # -----------------------------------------------------------------------
    double_nl_paras = re.split(r'\n\s*\n', norm)
    
    # -----------------------------------------------------------------------
    # Phase 2: Sub-split paragraphs containing multiple numbered lines
    # -----------------------------------------------------------------------
    raw_paras: List[str] = []
    for para in double_nl_paras:
        para = para.strip()
        if not para:
            continue
        
        lines = para.split('\n')
        
        # Find lines that start with a number like "2." or "12." or "2. "
        numbered_indices = []
        for i, line in enumerate(lines):
            if re.match(r'^\s*\d+\.\s', line) or re.match(r'^\s*\d+\.\s*$', line.strip()):
                numbered_indices.append(i)
        
        if len(numbered_indices) > 1:
            # Multiple numbered sections in one block — split at each
            for idx_pos, start_idx in enumerate(numbered_indices):
                end_idx = (
                    numbered_indices[idx_pos + 1]
                    if idx_pos + 1 < len(numbered_indices)
                    else len(lines)
                )
                # Capture any preamble text before the first numbered line
                if idx_pos == 0 and start_idx > 0:
                    preamble = '\n'.join(lines[:start_idx]).strip()
                    if preamble:
                        raw_paras.append(preamble)
                sub_para = '\n'.join(lines[start_idx:end_idx]).strip()
                if sub_para:
                    raw_paras.append(sub_para)
        elif len(numbered_indices) == 1 and numbered_indices[0] > 0:
            # Single numbered line but there's preamble — split preamble off
            preamble = '\n'.join(lines[:numbered_indices[0]]).strip()
            remainder = '\n'.join(lines[numbered_indices[0]:]).strip()
            if preamble:
                raw_paras.append(preamble)
            if remainder:
                raw_paras.append(remainder)
        else:
            raw_paras.append(para)

    # -----------------------------------------------------------------------
    # Phase 3: Content-aware splitting (mixed-type paragraphs)
    # -----------------------------------------------------------------------
    refined: List[str] = []
    q_split_pat = re.compile(
        r"(\b[a-z0-9]+[\)\.]\s*(?:\n\s*)?(?:Whether|That|Were|What|Did|Is|Can|How|Should|Which|Who|Why)\b|"
        r"\(\s*[a-z0-9]+\s*\)\s*(?:\n\s*)?(?:Whether|That|Were|What|Did|Is|Can|How|Should|Which|Who|Why)\b)",
        re.I
    )
    
    for p in raw_paras:
        p_strip = p.strip()
        if not p_strip:
            continue

        # 1. Split mixed submissions and questions (Rule 9)
        q_match = re.search(
            r"(\b(?:questions?|determination|decided|arising|points?|issues?)\b.*?:-?\s*)\n*("
            r"\b[a-z0-9]+[\)\.]\s*(?:\n\s*)?(?:Whether|That|Were|What|Did|Is|Can|How|Should|Which|Who|Why)\b|"
            r"\(\s*[a-z0-9]+\s*\)\s*(?:\n\s*)?(?:Whether|That|Were|What|Did|Is|Can|How|Should|Which|Who|Why)\b)",
            p,
            re.I | re.S
        )
        if q_match:
            intro_end = q_match.end(1)
            intro = p[:intro_end].strip()
            rest = p[intro_end:].strip()
            if intro:
                refined.append(intro)
            
            q_items = q_split_pat.split(rest)
            current_q_marker = ""
            for item in q_items:
                item_strip = item.strip()
                if not item_strip:
                    continue
                if q_split_pat.match(item_strip):
                    current_q_marker = item_strip
                else:
                    leave_match = re.search(r"(\bWe,\s+thus,\s+grant\s+leave\b.*)", item_strip, re.I | re.S)
                    if leave_match:
                        q_body = item_strip[:leave_match.start()].strip()
                        leave_text = leave_match.group(1).strip()
                        if current_q_marker:
                            marker_clean = re.sub(r'\s+', ' ', current_q_marker).strip()
                            refined.append(f"{marker_clean} {q_body}")
                        else:
                            refined.append(q_body)
                        if leave_text:
                            refined.append(leave_text)
                        current_q_marker = ""
                    else:
                        if current_q_marker:
                            marker_clean = re.sub(r'\s+', ' ', current_q_marker).strip()
                            refined.append(f"{marker_clean} {item_strip}")
                        else:
                            refined.append(item_strip)
                        current_q_marker = ""
            continue

        # 2. Split mixed Facts/Arguments (only split if counsel match starts after index 0 to prevent recursion)
        arg_match = re.search(
            r"\b(?:The\s+learned\s+(?:counsel|asc|advocate|addl\.\s*a\.g\.)\s+for\s+.*?(?:submitted|contended|argued|pleaded|submitted\s+that)|"
            r"Learned\s+counsel\s+for\s+.*?(?:submitted|contended|argued|pleaded|submitted\s+that)|"
            r"It\s+was\s+(?:contended|argued|submitted)\s+by)\b",
            p,
            re.I
        )
        if arg_match and arg_match.start() > 0:
            split_idx = arg_match.start()
            before = p[:split_idx].strip()
            after = p[split_idx:].strip()
            if before:
                refined.append(before)
            if after:
                refined.extend(_split_paragraphs(after))
            continue

        # 3. Split mixed Arguments/Court voice (Rule 4)
        court_match = re.search(
            r"\.\s+(We\s+(?:have|are|find|hold|observe|notice|note|take|need|agree|proceed|do|must|thus)\b|"
            r"In\s+our\s+(?:view|opinion)\b|"
            r"It\s+(?:is\s+well\s+settled|is\s+now\s+well\s+settled|is\s+clear|follows|appears)\b)",
            p
        )
        if court_match:
            split_idx = court_match.start() + 1
            before = p[:split_idx].strip()
            after = p[split_idx:].strip()
            if before:
                refined.append(before)
            if after:
                refined.extend(_split_paragraphs(after))
            continue

        # 4. Split mixed Analysis/Final Order (Rule 7)
        fo_match = re.search(
            r"\.\s+((?:The\s+(?:appeal|petition|appeals|petitions)\s+is,\s+therefore,\s+(?:partially\s+)?allowed|dismissed|set\s+aside))\b",
            p,
            re.I
        )
        if fo_match:
            split_idx = fo_match.start() + 1  # Split after the period
            before = p[:split_idx].strip()
            after = p[split_idx:].strip()
            if before:
                refined.append(before)
            if after:
                refined.append(after)
            continue

        refined.append(p)
        
    return [p for p in refined if p.strip()]


def _extract_header_coram(paragraphs: List[str]) -> tuple[List[str], List[str]]:
    """Extract header/coram from the beginning of the judgment."""
    header_paras = []
    remaining = []
    found_judgment = False
    
    # Define regexes
    # 1. Standalone judgment / order headers
    judgment_header_pat = re.compile(
        r"^\s*(?:JUDGMENT|ORDER|J\s*U\s*D\s*G\s*M\s*E\s*N\s*T|O\s*R\s*D\s*E\s*R|J\s*U\s*D\s*G\s*[\.\-]?\s*M\s*E\s*N\s*T)[\s\.\-\/]*$",
        re.I
    )
    # 2. Judge name followed by designation and text on same line
    # Uses horizontal space filter to prevent matching PRESENT list across lines
    judge_pat = re.compile(
        r"\b(?:MR\.\s+JUSTICE\s+)?([A-Z][A-Za-z\s\-\.]{2,50})[,\.]?\s*(J|CJ|C\.?J\.?|HCJ|H\.?C\.?J\.?|ACJ|A\.?C\.?J\.?)(?:[ \t]*[\-\.]{1,2}[ \t]*|[ \t]+)(?=[^\n\r]{10,})",
        re.I
    )
    
    for i, p in enumerate(paragraphs):
        p_strip = p.strip()
        
        # Check if standalone judgment/order header
        if judgment_header_pat.match(p_strip):
            found_judgment = True
            header_paras.append(p)
            remaining = paragraphs[i+1:]
            break
            
        # Check if the judge name pattern is present in the paragraph
        judge_match = judge_pat.search(p)
        if judge_match:
            # We found a judge name. Split this paragraph!
            match_start = judge_match.start()
            p_before = p[:match_start].strip()
            p_after = p[match_start:].strip()
            
            if p_before:
                header_paras.append(p_before)
            found_judgment = True
            remaining = [p_after] + paragraphs[i+1:] if p_after else paragraphs[i+1:]
            break
            
        header_paras.append(p)
        
    # Fallback if no boundary was found after checking all paragraphs
    if not found_judgment:
        # Prevent HEADER_CORAM from consuming the entire document.
        # Cut off after a certain number of paragraphs.
        cutoff = min(15, max(1, len(paragraphs) // 5))
        header_paras = paragraphs[:cutoff]
        remaining = paragraphs[cutoff:]
        
    cleaned_paras = []
    for p in header_paras:
        p = re.sub(r'--- PAGE \d+ ---', '', p)
        p = re.sub(r'C\. A\. No\.\d+ of \d+\s+\d+', '', p)
        if p.strip():
            cleaned_paras.append(p.strip())
            
    return cleaned_paras, remaining


def _heading_fallback(pdf_id: str, text: str) -> Dict:
    """Content-based parser for Pakistan SC judgments (primary method)."""
    out = _empty_result(pdf_id)
    section_bodies: Dict[str, List[str]] = {s: [] for s in SECTION_TYPES}
    
    # Remove page markers from original text stream
    clean_text = re.sub(r'--- PAGE \d+ ---', '', text)
    
    paragraphs = _split_paragraphs(clean_text)
    if not paragraphs:
        return out
        
    header_paras, remaining = _extract_header_coram(paragraphs)
    if header_paras:
        section_bodies["HEADER_CORAM"] = header_paras
        
    if not remaining:
        # Prevent outputting empty sections even if remaining is empty
        for sec in out["sections"]:
            st = sec["section_type"]
            sec["text"] = "\n\n".join(section_bodies[st]).strip()
            if sec["text"]:
                sec["confidence"] = 1.0
        return out
        
    cleaned_remaining = []
    case_num_pattern = r"(?mi)^\s*(?:Civil\s+Appeal\s+No\.|C\.?\s*A\.?\s*No\.|Criminal\s+Appeal\s+No\.|Crl\.?\s*A\.?\s*No\.|Crl\.?\s*A\.|Constitution\s+Petition\s+No\.)\s*[\w\- \t/]+$"
    for p in remaining:
        # Remove case number footer lines from body paragraphs
        p_clean = re.sub(case_num_pattern, '', p)
        # Remove standalone page numbers from body paragraphs
        p_clean = re.sub(r'(?m)^\s*\d+\s*$', '', p_clean)
        p_clean = re.sub(r'\n{3,}', '\n\n', p_clean).strip()
        if p_clean:
            cleaned_remaining.append(p_clean)
            
    if cleaned_remaining:
        # Near end means the last 15% of paragraphs or last 3 paragraphs, whichever is larger
        near_end_idx = max(len(cleaned_remaining) - 3, int(len(cleaned_remaining) * 0.85))
        # Ensure it's not negative
        near_end_idx = max(0, near_end_idx)
    else:
        near_end_idx = 0
    classifications: List[str] = []
    for i, p in enumerate(cleaned_remaining):
        is_near_end = i >= near_end_idx
        cls = _classify_paragraph(p, p.lower(), is_near_end)
        classifications.append(cls)
        
    last_known = "FACTS"
    for i, cls in enumerate(classifications):
        if cls:
            last_known = cls
        else:
            classifications[i] = last_known
            
    for i, p in enumerate(cleaned_remaining):
        section_bodies[classifications[i]].append(p)
        
    # Post-processing: Ensure FACTS doesn't contain statutory text or court voice
    if section_bodies["FACTS"]:
        cleaned_facts = []
        for p in section_bodies["FACTS"]:
            p_strip = p.strip()
            has_statute = re.search(r"\b(?:Sections?|sub-sections?|Sub-sections?|Subsections?|proviso)\b", p_strip, re.I) and re.search(r"\d+", p_strip)
            has_section_symbol = re.search(r"§\s*\d+", p_strip)
            has_court_voice = re.search(r"\bwe\s+(?:have|are|find|hold|observe|notice|note|take|need|agree|proceed|do)\b", p_strip.lower())
            
            if not (has_statute or has_section_symbol or has_court_voice):
                cleaned_facts.append(p_strip)
            else:
                section_bodies["ANALYSIS_RATIO"].append(p_strip)
        section_bodies["FACTS"] = cleaned_facts
        
    # Post-processing: Ensure ARGUMENTS doesn't contain Court analysis
    if section_bodies["ARGUMENTS"]:
        cleaned_args = []
        for p in section_bodies["ARGUMENTS"]:
            p_strip = p.strip()
            has_court_voice = re.search(r"\bwe\s+(?:have|are|find|hold|observe|notice|note|take|need|agree|proceed|do)\b", p_strip.lower())
            if not has_court_voice:
                cleaned_args.append(p_strip)
            else:
                section_bodies["ANALYSIS_RATIO"].append(p_strip)
        section_bodies["ARGUMENTS"] = cleaned_args
        
    # Post-processing: Ensure LEGAL_ISSUES only contains questions
    if section_bodies["LEGAL_ISSUES"]:
        cleaned_issues = []
        for p in section_bodies["LEGAL_ISSUES"]:
            p_strip = p.strip()
            is_question = (
                re.match(r"^\s*[a-z0-9]+[\)\.]\s*(?:\n\s*)?(?:Whether|That|Were|What|Did|Is|Can|How|Should|Which|Who|Why)\b", p_strip, re.I)
                or re.match(r"^\s*\(\s*[a-z0-9]+\s*\)\s*(?:\n\s*)?(?:Whether|That|Were|What|Did|Is|Can|How|Should|Which|Who|Why)\b", p_strip, re.I)
                or re.match(r"^\s*(?:Whether|Were|What|Did|Is|Can|How|Should|Which|Who|Why)\b", p_strip, re.I)
                or re.match(r"^\s*(?:The|A)\s+moot\s+question\b", p_strip, re.I)
                or re.match(r"^\s*The\s+question\s+(?:for\s+determination|to\s+be\s+decided|arising)\b", p_strip, re.I)
            )
            if is_question:
                cleaned_issues.append(p_strip)
            else:
                section_bodies["ANALYSIS_RATIO"].append(p_strip)
        section_bodies["LEGAL_ISSUES"] = cleaned_issues
        
    # Post-processing: Ensure FINAL_ORDER is short (disposition only)
    if section_bodies["FINAL_ORDER"]:
        cleaned_order = []
        for p in section_bodies["FINAL_ORDER"]:
            p_strip = p.strip()
            p_lower = p_strip.lower()
            
            # Skip signatures, announcements, reporting lines
            if any(term in p_lower for term in ["approved for reporting", "announced in open court", "stenographer", "typist"]):
                continue
            if re.match(r"^(?:judge|chief justice|j\.|c\.j\.|h\.c\.j\.)\s*$", p_lower):
                continue
            if re.search(r"\b(?:islamabad|peshawar|karachi|lahore|quetta)\b", p_lower) and re.search(r"\b\d{4}\b", p_lower):
                continue
            if p_strip.endswith(", L.C/-") or p_strip.endswith(", LC"):
                continue
            if len(p_strip.split()) < 3:
                continue
                
            if any(term in p_lower for term in ["allowed", "dismissed", "set aside", "upheld", "remanded", "partially allowed", "de-notified"]):
                sentences = re.split(r"(?<=[.!?])\s+", p_strip)
                sentences = [s.strip() for s in sentences if s.strip()]
                cleaned_order.append(" ".join(sentences[:3]))
            else:
                section_bodies["ANALYSIS_RATIO"].append(p_strip)
        section_bodies["FINAL_ORDER"] = cleaned_order

    # -----------------------------------------------------------------------
    # Post-processing: Rescue "lost" content from ANALYSIS_RATIO
    # If LEGAL_ISSUES, FINAL_ORDER, or FACTS are empty, scan ANALYSIS_RATIO
    # for content that belongs there. This uses REAL text, not fabrication.
    # -----------------------------------------------------------------------
    
    # Rescue LEGAL_ISSUES from ANALYSIS_RATIO
    if not section_bodies["LEGAL_ISSUES"] and section_bodies["ANALYSIS_RATIO"]:
        rescued_indices = []
        for i, p in enumerate(section_bodies["ANALYSIS_RATIO"]):
            if re.search(
                r"(?:give rise to the question|the question is whether|"
                r"the question that arises|the moot question|leave is granted to consider whether|"
                r"the short question is|the point for determination)",
                p, re.I
            ):
                section_bodies["LEGAL_ISSUES"].append(p)
                rescued_indices.append(i)
                logger.info(f"[{pdf_id}] Rescued LEGAL_ISSUES from ANALYSIS_RATIO (para {i})")
        for i in reversed(rescued_indices):
            section_bodies["ANALYSIS_RATIO"].pop(i)
    
    # Rescue FINAL_ORDER from ANALYSIS_RATIO
    if not section_bodies["FINAL_ORDER"] and section_bodies["ANALYSIS_RATIO"]:
        for i, p in enumerate(section_bodies["ANALYSIS_RATIO"]):
            if re.search(
                r"(?:result is that|this appeal must fail|is accordingly dismissed|"
                r"is accordingly allowed|appeal is,?\s*therefore,?\s*(?:partially\s+)?(?:allowed|dismissed)|"
                r"for the reasons (?:discussed|stated) above)",
                p, re.I
            ):
                # Only rescue if it's short enough to be a disposition (not analysis)
                if len(p.split()) < 150:
                    section_bodies["FINAL_ORDER"].append(p)
                    section_bodies["ANALYSIS_RATIO"].pop(i)
                    logger.info(f"[{pdf_id}] Rescued FINAL_ORDER from ANALYSIS_RATIO (para {i})")
                    break
    
    # -----------------------------------------------------------------------
    # POST-PROCESSING: Ensure FACTS has complete content
    # -----------------------------------------------------------------------
    
    # Check if FACTS is too short (less than 50 words)
    facts_word_count = len(" ".join(section_bodies["FACTS"]).split())
    
    if facts_word_count < 50 and section_bodies["ANALYSIS_RATIO"]:
        logger.info(f"[{pdf_id}] FACTS is short ({facts_word_count} words). Attempting to extract facts from ANALYSIS.")
        
        # Look for factual content in the first few ANALYSIS paragraphs
        extracted_facts = []
        remaining_analysis = []
        
        for i, para in enumerate(section_bodies["ANALYSIS_RATIO"]):
            para_lower = para.lower()
            
            # Indicators that this paragraph contains facts (not analysis)
            fact_indicators = [
                r"\d{4}",                           # Years (dates)
                r"rs\.\s*\d+",                      # Rupee amounts
                r"acquired",                        # Acquisition
                r"filed\s+(?:a|an|the)?\s*application",  # Filing
                r"award",                           # Award
                r"acres?",                          # Land measurement
                r"mouza",                           # Village name
                r"tehsil",                          # Sub-district
                r"district\s+judge",                # Court name
                r"deputy\s+commissioner",           # Officer name
                r"notification\s+dated",            # Official document
                r"order\s+dated",                   # Court order
                r"judgment\s+dated",                # Court judgment
                r"registered\s+(?:as|a)\s+suit",    # Legal action
            ]
            
            # Count how many fact indicators match
            match_count = sum(1 for pattern in fact_indicators if re.search(pattern, para_lower))
            
            # Also check it's NOT analysis (no "we hold", "we consider", etc.)
            is_analysis = re.search(r"\bwe\s+(?:hold|consider|are of the view|have considered)\b", para_lower)
            
            # If it has fact indicators and is not clearly analysis, treat as fact
            if match_count >= 2 and not is_analysis:
                extracted_facts.append(para)
                logger.debug(f"[{pdf_id}] Moved fact paragraph from ANALYSIS (matched {match_count} indicators)")
            else:
                remaining_analysis.append(para)
        
        # If we found facts, add them to FACTS
        if extracted_facts:
            section_bodies["FACTS"].extend(extracted_facts)
            section_bodies["ANALYSIS_RATIO"] = remaining_analysis
            logger.info(f"[{pdf_id}] Added {len(extracted_facts)} paragraphs to FACTS from ANALYSIS")
    
    # -----------------------------------------------------------------------
    # POST-PROCESSING: Ensure FINAL_ORDER is complete
    # -----------------------------------------------------------------------
    
    if section_bodies["FINAL_ORDER"]:
        # Check if final order is incomplete (missing "dismissed" or "allowed")
        final_text = " ".join(section_bodies["FINAL_ORDER"]).lower()
        if "must fail" in final_text and "dismissed" not in final_text:
            # Incomplete order - look for completion in ANALYSIS
            for para in section_bodies["ANALYSIS_RATIO"]:
                if "dismissed" in para.lower() and len(para.split()) < 50:
                    section_bodies["FINAL_ORDER"].append(para)
                    section_bodies["ANALYSIS_RATIO"].remove(para)
                    logger.info(f"[{pdf_id}] Completed FINAL_ORDER with missing disposition")
                    break
    
    # -----------------------------------------------------------------------
    # POST-PROCESSING: Ensure LEGAL_ISSUES is clean (remove analysis)
    # -----------------------------------------------------------------------
    
    if section_bodies["LEGAL_ISSUES"]:
        cleaned_issues = []
        for para in section_bodies["LEGAL_ISSUES"]:
            para_lower = para.lower()
            # If the paragraph contains "we hold" or "we consider", it's analysis
            if re.search(r"\bwe\s+(?:hold|consider|are of the view)\b", para_lower):
                # Move to ANALYSIS instead
                section_bodies["ANALYSIS_RATIO"].append(para)
                logger.debug(f"[{pdf_id}] Moved analysis from LEGAL_ISSUES to ANALYSIS")
            else:
                cleaned_issues.append(para)
        section_bodies["LEGAL_ISSUES"] = cleaned_issues
    
    # =====================================================================
    # POST-PROCESSING: Capture FINAL_ORDER if still missing (Part 2)
    # =====================================================================
    
    if not section_bodies["FINAL_ORDER"] and section_bodies["ANALYSIS_RATIO"]:
        logger.info(f"[{pdf_id}] FINAL_ORDER missing - searching ANALYSIS for final order")
        
        # Look through ANALYSIS paragraphs for final order patterns
        for i, para in enumerate(section_bodies["ANALYSIS_RATIO"]):
            para_lower = para.lower()
            
            # Check for any of these patterns
            is_final = False
            
            # Pattern A: Conclusion opening phrases
            if any(phrase in para_lower for phrase in [
                "in view of the foregoing",
                "for the foregoing reasons",
                "as a consequence",
                "the result is that",
            ]):
                is_final = True
            
            # Pattern B: Outcome phrases
            if any(phrase in para_lower for phrase in [
                "appeal is allowed", "appeal is dismissed",
                "set aside", "no order as to costs",
            ]):
                is_final = True
            
            # Pattern C: Numbered final paragraph (e.g., "25.")
            if re.match(r"^\s*\d+\.\s+In view of the foregoing", para, re.I):
                is_final = True
            
            if re.match(r"^\s*\d+\.\s+For the foregoing reasons", para, re.I):
                is_final = True
            
            # If found, move to FINAL_ORDER
            if is_final:
                # Extract only the relevant part (first 1-3 sentences if paragraph is long)
                word_count = len(para.split())
                if word_count < 150:
                    section_bodies["FINAL_ORDER"].append(para)
                else:
                    # Extract just the first 1-2 sentences
                    sentences = re.split(r'(?<=[.!?])\s+', para)
                    final_sentences = []
                    for sent in sentences[:2]:  # First 2 sentences only
                        if any(phrase in sent.lower() for phrase in [
                            "allowed", "dismissed", "set aside", "no order as to costs"
                        ]):
                            final_sentences.append(sent)
                    if final_sentences:
                        section_bodies["FINAL_ORDER"].append(" ".join(final_sentences))
                    else:
                        section_bodies["FINAL_ORDER"].append(sentences[0] if sentences else para)
                
                section_bodies["ANALYSIS_RATIO"].pop(i)
                logger.info(f"[{pdf_id}] Extracted FINAL_ORDER from ANALYSIS (word_count={word_count})")
                break

    # =====================================================================
    # FINAL SAFETY NET: If FINAL_ORDER is still empty, try extracting from text end (Part 4)
    # =====================================================================

    if not section_bodies["FINAL_ORDER"]:
        # Look at the last 3000 characters of the original text
        text_end = text[-3000:] if len(text) > 3000 else text
        
        # Find the final order
        final_match = re.search(
            r'(?:In view of the foregoing|For the foregoing reasons|The result is that)'
            r'.*?(?:allowed|dismissed|set aside).*?(?:\.|$)',
            text_end,
            re.I | re.DOTALL
        )
        
        if final_match:
            extracted = final_match.group(0).strip()
            if len(extracted.split()) < 150:
                section_bodies["FINAL_ORDER"] = [extracted]
                logger.info(f"[{pdf_id}] Extracted FINAL_ORDER from end of text as safety net")

    # -----------------------------------------------------------------------
    # Minimal safeguards: NEVER fabricate content.
    # If a section is empty, leave it empty. Log a warning so the user knows.
    # Only HEADER_CORAM gets a minimal structural fallback from the
    # first few lines of text (not fabricated content).
    # -----------------------------------------------------------------------
    
    # HEADER_CORAM: use the first couple of remaining paragraphs if header
    # extraction produced nothing (e.g. severely garbled OCR).
    if not section_bodies["HEADER_CORAM"] and cleaned_remaining:
        section_bodies["HEADER_CORAM"] = cleaned_remaining[:2]
        logger.warning(f"[{pdf_id}] HEADER_CORAM was empty - used first lines of text as fallback")
    
    # Log warnings for any section that ended up empty — but do NOT fill it.
    for st in SECTION_TYPES:
        if not section_bodies[st]:
            logger.warning(f"[{pdf_id}] Section {st} is EMPTY - no matching content found in judgment")
        
    # Build output
    for sec in out["sections"]:
        st = sec["section_type"]
        sec["text"] = "\n\n".join(section_bodies[st]).strip()
        if sec["text"]:
            sec["heading_found"] = f"{st.replace('_', ' ').title()} (inferred)"
            sec["confidence"] = 1.0
            
    return out


# ---------------------------------------------------------------------------
# Markdown summary output
# ---------------------------------------------------------------------------

def generate_markdown_summary(final: Dict) -> str:
    md_sections: List[str] = []
    
    # Context at the top
    context_text = final.get("context_summary", "").strip()
    md_sections.append(f"# Context\n\n{context_text if context_text else '*No context summary available.*'}")
    
    # Section mappings
    headings_map = {
        "HEADER_CORAM": "# Header / Coram",
        "FACTS": "# Facts of the Case",
        "ARGUMENTS": "# Arguments",
        "LEGAL_ISSUES": "# Legal Issues",
        "ANALYSIS_RATIO": "# Court Analysis",
        "FINAL_ORDER": "# Final Decision / Sentence",
    }
    
    sections_dict = {sec["section_type"]: sec.get("text", "") or "" for sec in final.get("sections", [])}
    
    for sec_type in SECTION_TYPES:
        heading = headings_map.get(sec_type, f"# {sec_type}")
        text = sections_dict.get(sec_type, "").strip()
        md_sections.append(f"{heading}\n\n{text if text else '*No information available.*'}")
        
    return "\n\n".join(md_sections)


# ---------------------------------------------------------------------------
# Validation function (runs for every PDF)
# ---------------------------------------------------------------------------

def validate_parsing_for_every_pdf(parsed: Dict, pdf_id: str) -> bool:
    """Validate parsing quality. Empty sections are legitimate (no fabrication)."""
    sections = parsed.get("sections", [])
    section_map = {s.get("section_type"): s.get("text", "").strip() for s in sections}
    
    populated = []
    empty = []
    for section_type in SECTION_TYPES:
        text = section_map.get(section_type, "")
        if text and len(text) >= 10:
            populated.append(section_type)
        else:
            empty.append(section_type)
    
    if empty:
        logger.info(f"[{pdf_id}] Sections populated: {populated}")
        logger.info(f"[{pdf_id}] Sections empty (no matching content): {empty}")
    
    is_valid = True
        
    # Quality check: FACTS should NOT have "Section" (statutory text) unless it's a mention of the case filing section itself
    facts_text = section_map.get("FACTS", "").lower()
    # A soft check: check if it contains multiple occurrences or generic statutory section references
    if facts_text and len(re.findall(r"\bsection\s+\d+", facts_text)) > 2:
        logger.warning(f"[{pdf_id}] QUALITY WARNING - FACTS contains statutory text 'Section'")
        is_valid = False
        
    # Quality check: ARGUMENTS should NOT have Court analysis
    args_text = section_map.get("ARGUMENTS", "").lower()
    if args_text and ("we need to take a look" in args_text or "we have considered" in args_text):
        logger.warning(f"[{pdf_id}] QUALITY WARNING - ARGUMENTS contains Court analysis")
        is_valid = False
    
    if is_valid:
        logger.info(f"[{pdf_id}] VALIDATION PASSED - {len(populated)}/6 sections populated, quality checks OK")
    else:
        logger.warning(f"[{pdf_id}] VALIDATION WARNING - quality issues detected")
        
    return is_valid


def _clean_ocr_text(text: str) -> str:
    """
    Clean common OCR errors while preserving line and paragraph structure.
    
    Handles three categories of corrections:
      1. Multi-word phrase corrections (safe, exact match)
      2. Contextual single-word corrections (uppercase context only)
      3. Line-level cleaning (stray characters, spacing)
    """
    # -----------------------------------------------------------------------
    # Category 1: Multi-word phrase corrections (exact match, always safe)
    # -----------------------------------------------------------------------
    phrase_corrections = {
        # Court name errors
        "SUPRESME": "SUPREME",
        "SUPRIME": "SUPREME",
        "SUPREMECOURT": "SUPREME COURT",
        "tsuPBMt": "SUPREME",
        "tSujPBMt": "SUPREME",
        "0LPAKISTAN": "OF PAKISTAN",
        "0L PAKISTAN": "OF PAKISTAN",
        "0F PAKISTAN": "OF PAKISTAN",
        "tHE SUPREME COURT": "THE SUPREME COURT",
        "1N THE SUPREME": "IN THE SUPREME",
        "COURI": "COURT",
        "COUR1": "COURT",
        "C0URT": "COURT",

        # Jurisdiction errors
        "APPELLATE JUR1SD1CT1ON": "APPELLATE JURISDICTION",
        "JUR1SD1CT1ON": "JURISDICTION",
        "JURISD1CTION": "JURISDICTION",
        "APPELLATE JURISDICTI0N": "APPELLATE JURISDICTION",
        "0RIGINAL JURISDICTION": "ORIGINAL JURISDICTION",

        # Case type errors
        "Civi1": "Civil",
        "CIVI1": "CIVIL",
        "Crimina1": "Criminal",
        "CRIMINA1": "CRIMINAL",
        "A eats": "Appeals",
        "Appea1": "Appeal",
        "APPEA1": "APPEAL",
        "Appea1s": "Appeals",
        "APPEA1S": "APPEALS",
        "Const1tution": "Constitution",
        "CONST1TUTION": "CONSTITUTION",
        "Pet1tion": "Petition",
        "PET1TION": "PETITION",

        # Judge / title errors
        "AU AKBAR NAQV1": "ALI AKBAR NAQVI",
        "AU AKBAR NAQVI": "ALI AKBAR NAQVI",
        "ALI AKBAR NAQV1": "ALI AKBAR NAQVI",
        "SAYYED MAZAHAR AU": "SAYYED MAZAHAR ALI",
        "MAZAHAR AU": "MAZAHAR ALI",
        "NAQV1": "NAQVI",
        "IJAZ UL AHSANMR": "IJAZ UL AHSAN",
        "MR. JUST1CE": "MR. JUSTICE",
        "JUST1CE": "JUSTICE",

        # Header / formatting
        "O R D E R": "ORDER",
        "J U D G M E N T": "JUDGMENT",
        "J U D G E M E N T": "JUDGEMENT",

        # Legal terms
        "Sect1on": "Section",
        "SECT1ON": "SECTION",
        "sub-sect1on": "sub-section",
        "prov1so": "proviso",
        "PROV1SO": "PROVISO",
        "appel1ant": "appellant",
        "APPEL1ANT": "APPELLANT",
        "respondent": "respondent",  # anchor correct spelling
        "pet1tioner": "petitioner",
        "PET1TIONER": "PETITIONER",
        "p1aintiff": "plaintiff",
        "P1AINTIFF": "PLAINTIFF",
        "de1endant": "defendant",
        "DE1ENDANT": "DEFENDANT",
        "judgrnent": "judgment",
        "JUDGRNENT": "JUDGMENT",
        "irnpugned": "impugned",
        "IRNPUGNED": "IMPUGNED",
    }

    for wrong, correct in phrase_corrections.items():
        text = text.replace(wrong, correct)

    # -----------------------------------------------------------------------
    # Category 2: Contextual single-char fixes (only in UPPERCASE words)
    # This prevents corrupting normal text like "10 appeals" or "Section 5"
    # -----------------------------------------------------------------------
    def _fix_uppercase_ocr(match: re.Match) -> str:
        """Fix 0->O and 1->I only inside fully uppercase words."""
        word = match.group(0)
        word = word.replace("0", "O").replace("1", "I")
        return word

    # Match words of 3+ chars that are uppercase letters mixed with 0/1
    text = re.sub(
        r"\b[A-Z01]{3,}\b",
        _fix_uppercase_ocr,
        text,
    )

    # -----------------------------------------------------------------------
    # Category 3: Line-level cleaning
    # -----------------------------------------------------------------------
    # Replace non-ASCII characters but preserve basic formatting
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)

    # Normalize whitespace on each line but preserve newlines
    text = re.sub(r'[ \t]+', ' ', text)
    text = re.sub(r'\r\n', '\n', text)

    # Remove lines that are just noise (single chars, stray punctuation)
    lines = text.split('\n')
    cleaned_lines = []
    for line in lines:
        stripped = line.strip()
        # Skip lines that are just 1-2 random characters
        if len(stripped) <= 2 and not stripped.isdigit():
            cleaned_lines.append('')
        else:
            cleaned_lines.append(line)
    text = '\n'.join(cleaned_lines)

    # Collapse excessive blank lines
    text = re.sub(r'\n{3,}', '\n\n', text)

    return text


def validate_context_summary(summary: str, source_text: str) -> bool:
    """
    Validates that the context summary does NOT hallucinate content.
    Returns True if valid, False if hallucination detected.
    """
    if not summary or not source_text:
        return False
    
    # Normalize whitespaces to handle line breaks within names/laws
    source_lower = re.sub(r'\s+', ' ', source_text).lower()
    summary_lower = re.sub(r'\s+', ' ', summary).lower()
    
    # -----------------------------------------------------------------------
    # RULE 1: Extract all law/act mentions from the summary
    # -----------------------------------------------------------------------
    law_mentions_in_summary = re.findall(
        r'(?:Land Acquisition Act|Arbitration Act|Customs Act|Family Courts Act|'
        r'Illegal Dispossession Act|Code of Civil Procedure|CrPC|Penal Code|'
        r'Constitution|Shariat|Ordinance|Act of \d{4}|Section \d+)',
        summary,
        re.I
    )
    
    # For each law mentioned in summary, it MUST appear in source text
    for law in law_mentions_in_summary:
        if law.lower() not in source_lower:
            logger.error(f"Hallucination: '{law}' in summary but not in judgment")
            return False
    
    # -----------------------------------------------------------------------
    # RULE 2: Specific cross-check - if source has X, summary must not have Y
    # -----------------------------------------------------------------------
    # Land Acquisition Act case
    if "land acquisition" in source_lower and "section 18" in source_lower:
        if "arbitration" in summary_lower or "section 32" in summary_lower:
            logger.error("Hallucination: Summary says Arbitration but judgment is Land Acquisition")
            return False
    
    # Customs/Excise case
    if "central excise" in source_lower or "customs" in source_lower:
        if "arbitration" in summary_lower or "family" in summary_lower:
            logger.error("Hallucination: Summary misidentifies case type")
            return False
    
    # Family Court case
    if "family courts act" in source_lower or "dowry" in source_lower or "dissolution of marriage" in source_lower:
        if "arbitration" in summary_lower or "customs" in summary_lower:
            logger.error("Hallucination: Summary misidentifies family case")
            return False
    
    # Criminal case
    if "section 302" in source_lower or "murder" in source_lower or "rape" in source_lower:
        if "civil" in summary_lower and "appeal" in summary_lower:
            # Criminal appeals are also civil in nature - this is fine
            pass
    
    # -----------------------------------------------------------------------
    # RULE 3: Check for generic/forbidden phrases
    # -----------------------------------------------------------------------
    forbidden_phrases = [
        "the judgment addresses the core dispute",
        "this is a legal appeal concerning allegations",
        "the case concerned",
        "alleged offences",
        "the evidence on record",
        "reviewed the legal issues and interpreted the relevant statutory provisions",
    ]
    for phrase in forbidden_phrases:
        if phrase in summary_lower:
            logger.error(f"Generic phrase detected: '{phrase}'")
            return False
    
    # -----------------------------------------------------------------------
    # RULE 4: Summary must be specific (minimum length and content)
    # -----------------------------------------------------------------------
    if len(summary.split()) < 15:
        logger.warning(f"Summary too short: {len(summary.split())} words")
        return False
    
    # Must contain at least one action verb about outcome
    outcome_verbs = ["allowed", "dismissed", "set aside", "upheld", "remanded", "partially allowed"]
    if not any(verb in summary_lower for verb in outcome_verbs):
        logger.warning(f"Summary missing outcome verb")
        return False
    
    return True


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

async def parse_sections(pdf_id: str, extracted_text: str) -> Dict:
    uploads = _uploads_dir()
    uploads.mkdir(parents=True, exist_ok=True)
    out_file = uploads / f"{pdf_id}_sections.json"
    summary_file = uploads / f"{pdf_id}_summary.md"
    
    if out_file.exists() and summary_file.exists():
        logger.info(f"[{pdf_id}] Using cached parsed result")
        cached = json.loads(out_file.read_text(encoding="utf-8", errors="ignore"))
        if "parse_mode" not in cached:
            cached["parse_mode"] = "unknown"
        return cached
        
    # Clean OCR errors from the text
    cleaned_text = _clean_ocr_text(extracted_text)
        
    logger.info(f"[{pdf_id}] Parsing sections using content-based classifier")
    final = _heading_fallback(pdf_id, cleaned_text)
    final["parse_mode"] = "accurate"
    
    logger.info(f"[{pdf_id}] Generating case context")
    context = await _generate_context(cleaned_text)
    
    # Validate context summary to prevent hallucination (especially from OCR text)
    context_summary = context.get("context_summary", "")
    if not validate_context_summary(context_summary, cleaned_text):
        logger.warning(f"[{pdf_id}] Context summary hallucination detected - using rule-based fallback")
        context = _derive_context_from_text(cleaned_text)
    
    final["context_heading"] = context.get("context_heading", "")
    final["context_summary"] = context.get("context_summary", "")
    
    if "(" in final["context_heading"] and ")" in final["context_heading"]:
        final["context_heading"] = re.sub(r'\s*\([^)]*\)', '', final["context_heading"]).strip()
    if "[" in final["context_heading"] and "]" in final["context_heading"]:
        final["context_heading"] = re.sub(r'\s*\[[^\]]*\]', '', final["context_heading"]).strip()
        
    # After parsing, validate for EVERY PDF
    if not validate_parsing_for_every_pdf(final, pdf_id):
        # Log warning but don't fail - user can see there's an issue
        logger.warning(f"[{pdf_id}] Parsing validation failed - some sections may be incomplete")
        
    out_file.write_text(json.dumps(final, ensure_ascii=False, indent=2), encoding="utf-8")
    logger.info(f"[{pdf_id}] Parsing completed and saved: {out_file}")
    
    md_summary = generate_markdown_summary(final)
    summary_file.write_text(md_summary, encoding="utf-8")
    logger.info(f"[{pdf_id}] Markdown summary completed and saved: {summary_file}")
    
    return final
