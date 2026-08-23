import json
import os
import re
import asyncio
from dataclasses import dataclass
from typing import Dict, List, Optional, Tuple, Set
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


@dataclass
class ClassifiedJudgment:
    pdf_id: str
    header_coram: str
    facts: str
    arguments: str
    legal_issues: str
    analysis_ratio: str
    final_order: str
    parse_mode: str = "hybrid_llm_ner"
    confidence_score: float = 0.95
    # Provenance of legal_issues: "extracted" (found in the judgment), "template"
    # (statute-gated synthesis) or "derived" / "generic" (framed from the impugned
    # order or boilerplate). Anything other than "extracted" is not case-specific.
    legal_issues_source: str = "extracted"


# ============================================================================
# 1. ENHANCED LLM BOUNDARY DETECTOR (1 API Call)
# ============================================================================

BOUNDARY_SYSTEM_PROMPT = """You are an expert Pakistan Supreme Court judgment structural analyzer.

Your task is to analyze the numbered paragraph outline of a judgment and identify the start and end paragraph indices (0-indexed) for ALL 6 sections.

## CRITICAL BOUNDARY RULES:

1. HEADER_CORAM MUST include:
   - ALL judge names (including the last one in the bench)
   - ALL case numbers (including Civil/Criminal/Constitution Petition/Appeal numbers)
   - ALL party names (appellant and respondent names with Versus)
   - ALL counsel names (ASC, AOR, Addl. A.G., etc.)
   - Date of Hearing
   - End BEFORE the word "JUDGMENT" or the first substantive paragraph starting with a judge's name/reasoning

2. FACTS MUST start AFTER HEADER_CORAM ends:
   - Start at the first paragraph beginning with "JUDGMENT" OR
   - Start at the first paragraph beginning with a judge's name (e.g., "MIAN SAQIB NISAR, CJ.-", "UMAR ATA BANDIAL, CJ.-") OR
   - Start at the first paragraph that contains factual narrative and background
   - FACTS MUST NOT contain party names, counsel names, or case numbers from the caption

3. ARGUMENTS MUST contain counsel submissions:
   - Starts where counsel contentions begin ("Learned counsel argued/submitted/contended that...", "It was further averred", "On the other hand")
   - End BEFORE court's legal issues or judicial analysis

4. LEGAL_ISSUES MUST contain framed legal questions:
   - Framed questions beginning with "Whether", "The question is whether", "Leave to appeal was granted to consider whether"
   - End BEFORE the court's judicial reasoning/analysis

5. ANALYSIS_RATIO:
   - Court's reasoning, "We have heard", "We have considered", "In our view", statutory interpretation (Section X), case citations (PLD, SCMR), legal principles. End BEFORE FINAL_ORDER.

6. FINAL_ORDER:
   - The operative outcome. Contains: "appeal is allowed/dismissed", "judgment set aside", "petition dismissed". Usually 1-3 sentences. Exclude judge signatures or metadata.

Return ONLY valid JSON with this exact structure:
{
  "boundaries": {
    "HEADER_CORAM": {"start_idx": 0, "end_idx": 6},
    "FACTS": {"start_idx": 7, "end_idx": 9},
    "ARGUMENTS": {"start_idx": 10, "end_idx": 11},
    "LEGAL_ISSUES": {"start_idx": 12, "end_idx": 12},
    "ANALYSIS_RATIO": {"start_idx": 13, "end_idx": 14},
    "FINAL_ORDER": {"start_idx": 15, "end_idx": 15}
  }
}"""


class LLMBoundaryDetector:
    """Detects section boundaries using a compact paragraph outline in a single LLM API call."""

    def __init__(self):
        self.api_key = getattr(settings, "GROQ_API_KEY", "") or os.getenv("GROQ_API_KEY")
        self.model = getattr(settings, "GROQ_MODEL", "llama-3.1-8b-instant")
        self.base_url = getattr(settings, "GROQ_BASE_URL", "https://api.groq.com/openai/v1")
        self.client = None

    def _get_client(self) -> AsyncOpenAI:
        if self.client is None:
            self.client = AsyncOpenAI(
                base_url=self.base_url,
                api_key=self.api_key,
                max_retries=3,
            )
        return self.client

    def _prepare_outline(self, paragraphs: List[str]) -> str:
        """
        Create a compact, sampled outline guaranteed to stay well under token/TPM limits (< 1,200 tokens).
        Uses 70-character snippets and samples strategically if document exceeds 45 paragraphs.
        """
        total = len(paragraphs)
        snippet_len = 70
        max_sampled_entries = 48

        def get_snippet(p_idx: int) -> str:
            p_text = paragraphs[p_idx].strip().replace("\n", " ")
            return p_text[:snippet_len] + ("..." if len(p_text) > snippet_len else "")

        if total <= max_sampled_entries:
            outline_lines = [f"[P{i}] {get_snippet(i)}" for i in range(total)]
            return "\n".join(outline_lines)

        # Smart Strategic Sampling for large judgments (e.g. 50 to 300+ paragraphs):
        selected_indices = set()

        # 1. First 8 paragraphs (Court header + start of facts)
        for i in range(min(8, total)):
            selected_indices.add(i)

        # 2. Key transition candidate paragraphs (arguments, legal issues, analysis markers)
        critical_keywords = [
            "learned counsel", "advocate", "submitted", "argued", "contended",
            "whether", "question", "leave to appeal", "determination", "leave was granted",
            "we have heard", "in our view", "we are of the view", "section",
            "appeal is", "petition is", "allowed", "dismissed", "set aside", "order accordingly"
        ]
        
        for i, p in enumerate(paragraphs):
            p_lower = p.lower()
            if any(k in p_lower for k in critical_keywords):
                selected_indices.add(i)

        # 3. Last 10 paragraphs (Analysis ending + final order)
        for i in range(max(0, total - 10), total):
            selected_indices.add(i)

        # 4. If we have too many selected, uniformly subsample middle indices
        sorted_indices = sorted(selected_indices)
        if len(sorted_indices) > max_sampled_entries:
            fixed_early = set(sorted_indices[:6])
            fixed_late = set(sorted_indices[-8:])
            middle_candidates = sorted_indices[6:-8]
            
            budget = max_sampled_entries - len(fixed_early) - len(fixed_late)
            step = max(1, len(middle_candidates) // max(1, budget))
            sampled_middle = middle_candidates[::step][:budget]
            
            final_indices = sorted(list(fixed_early | set(sampled_middle) | fixed_late))
        else:
            final_indices = sorted_indices
            step = max(1, total // (max_sampled_entries - len(final_indices) + 1)) if len(final_indices) < max_sampled_entries else 999
            for i in range(0, total, step):
                if len(final_indices) < max_sampled_entries:
                    if i not in final_indices:
                        final_indices.append(i)
            final_indices = sorted(final_indices)

        outline_lines = [f"[P{i}] {get_snippet(i)}" for i in final_indices]
        return "\n".join(outline_lines)

    def _parse_llm_response(self, content: str) -> Optional[Dict[str, Dict[str, int]]]:
        """Robust JSON parsing with multiple fallback strategies."""
        if not content:
            return None

        clean_content = content.strip()

        # Strategy 1: Remove markdown code blocks
        clean_content = re.sub(r'```json\s*', '', clean_content)
        clean_content = re.sub(r'```\s*', '', clean_content)

        # Strategy 2: Find JSON boundaries
        first = clean_content.find('{')
        last = clean_content.rfind('}')
        if first != -1 and last != -1 and last > first:
            json_substr = clean_content[first:last + 1]
        else:
            json_substr = clean_content

        # Strategy 3: Standard JSON parse
        try:
            data = json.loads(json_substr)
            boundaries = data.get("boundaries") or data
            if isinstance(boundaries, dict) and any(st in boundaries for st in SECTION_TYPES):
                return boundaries
        except Exception:
            pass

        # Strategy 4: Strip unescaped ASCII control characters and retry
        try:
            sanitized = re.sub(r'[\x00-\x1f\x7f-\x9f]', '', json_substr)
            data = json.loads(sanitized)
            boundaries = data.get("boundaries") or data
            if isinstance(boundaries, dict) and any(st in boundaries for st in SECTION_TYPES):
                return boundaries
        except Exception:
            pass

        # Strategy 5: Regex extraction of boundaries per section type
        boundaries = {}
        for st in SECTION_TYPES:
            pattern = rf'"{st}"\s*:\s*\{{\s*"start_idx"\s*:\s*(\d+)\s*,\s*"end_idx"\s*:\s*(\d+)\s*\}}'
            match = re.search(pattern, clean_content, re.S)
            if not match:
                pattern_alt = rf'"{st}".*?"start_idx"\s*:\s*(\d+).*?"end_idx"\s*:\s*(\d+)'
                match = re.search(pattern_alt, clean_content, re.S)

            if match:
                boundaries[st] = {
                    "start_idx": int(match.group(1)),
                    "end_idx": int(match.group(2)),
                }

        if boundaries and any(st in boundaries for st in SECTION_TYPES):
            return boundaries

        return None

    def _validate_boundaries(self, boundaries: Dict, total_p: int, heuristic: Dict) -> Dict[str, Dict[str, int]]:
        """Ensure boundaries are within valid ranges, properly clamped, and ordered."""
        validated = {}
        last_end = -1

        for st in SECTION_TYPES:
            b = boundaries.get(st) if isinstance(boundaries, dict) else None
            if not isinstance(b, dict) or "start_idx" not in b:
                b = heuristic.get(st, {"start_idx": max(0, last_end + 1), "end_idx": max(0, last_end + 1)})

            start = int(b.get("start_idx", 0))
            end = int(b.get("end_idx", start))

            # Clamp to valid array bounds
            start = max(0, min(start, total_p - 1))
            end = max(start, min(end, total_p - 1))

            # Maintain chronological sequence if inverted
            if start < last_end and st != "LEGAL_ISSUES":
                start = min(total_p - 1, last_end + 1)
                end = max(start, end)

            validated[st] = {"start_idx": start, "end_idx": end}
            last_end = max(last_end, end)

        return validated

    async def detect_boundaries(self, paragraphs: List[str], pdf_id: str, heuristic: Dict) -> Dict[str, Dict[str, int]]:
        """Detect start and end paragraph indices for each section with robust parsing."""
        total_p = len(paragraphs)
        if total_p == 0:
            return heuristic

        if not self.api_key:
            logger.warning(f"[{pdf_id}] No GROQ_API_KEY provided; using heuristic boundaries.")
            return heuristic

        outline = self._prepare_outline(paragraphs)
        user_prompt = (
            f"Analyze this Pakistan Supreme Court judgment outline ({total_p} paragraphs total, from [P0] to [P{total_p - 1}]):\n\n"
            f"{outline}\n\n"
            f"Identify the exact start_idx and end_idx for ALL 6 sections in valid JSON."
        )

        client = self._get_client()
        for attempt in range(2):
            try:
                logger.info(f"[{pdf_id}] Calling Groq ({self.model}) for single-call boundary detection...")
                response = await client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": BOUNDARY_SYSTEM_PROMPT},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.0,
                    max_tokens=600,
                    response_format={"type": "json_object"},
                    timeout=30,
                )

                content = response.choices[0].message.content or ""
                parsed_boundaries = self._parse_llm_response(content)

                if parsed_boundaries:
                    validated = self._validate_boundaries(parsed_boundaries, total_p, heuristic)
                    logger.info(f"[{pdf_id}] LLM boundary detection successful & validated: {validated}")
                    return validated
                else:
                    logger.warning(f"[{pdf_id}] Boundary parsing failed on response: {content[:200]}")

            except Exception as e:
                logger.warning(f"[{pdf_id}] LLM boundary detection attempt {attempt + 1} failed: {e}")
                await asyncio.sleep(1.0)

        logger.warning(f"[{pdf_id}] Boundary detection falling back to heuristic outline.")
        return heuristic


# ============================================================================
# 1b. DISCOURSE ANCHORS (universal structural markers, 0 API calls)
# ============================================================================

# Pakistan Supreme Court judgments follow a stable rhetorical order. These anchors
# identify where each section actually begins, independent of document length, so
# segmentation no longer relies on percentage bands of paragraph indices.

ANCHOR_PATTERNS: Dict[str, List[str]] = {
    "ARGUMENTS": [
        r"(?i)learned\s+(?:sr\.?\s+)?(?:asc|counsel|advocate)\s+(?:for|appearing)",
        r"(?i)\b(?:it\s+(?:was|is)\s+)?(?:argued|contended|submitted|urged|averred|maintained)\s+(?:by\s+)?(?:the\s+)?(?:learned\s+)?(?:counsel|asc)?\s*that\b",
        r"(?i)\bon\s+behalf\s+of\s+the\s+(?:appellant|petitioner|respondent)",
        r"(?i)\bcounsel\s+for\s+the\s+(?:appellant|petitioner|respondent)s?\s+(?:has\s+)?(?:argued|contended|submitted|urged|stated)",
        r"(?i)\blearned\s+(?:addl\.?\s+)?(?:a\.?g\.?|attorney\s+general|advocate\s+general)\b",
    ],
    "ANALYSIS_RATIO": [
        r"(?i)\bwe\s+have\s+(?:heard|considered|examined|gone\s+through|perused)",
        r"(?i)\bhaving\s+(?:heard|considered|examined|gone\s+through|perused)",
        r"(?i)\bafter\s+hearing\s+(?:the\s+)?learned\s+counsel",
        r"(?i)\bheard\s+(?:the\s+)?learned\s+counsel\b",
        r"(?i)\bin\s+our\s+(?:considered\s+)?(?:view|opinion)\b",
        r"(?i)\bwe\s+are\s+(?:of\s+the\s+(?:considered\s+)?(?:view|opinion)|not\s+persuaded|unable\s+to)",
        r"(?i)\b(?:record\s+perused|arguments\s+heard)\b",
        r"(?i)\bwe\s+have\s+(?:carefully\s+)?(?:reviewed|scrutinized|analysed|analyzed)",
        r"(?i)\bwe\s+on\s+our\s+part\b",
        r"(?i)\bwe\s+(?:find|hold|note|observe)\s+that\b",
        r"(?i)\badverting\s+to\b",
        r"(?i)\bwe\s+are\s+(?:fortified|satisfied|convinced)\b",
    ],
    "LEGAL_ISSUES": [
        r"(?i)leave\s+(?:to\s+appeal\s+)?(?:was|is|has\s+been)\s+granted",
        r"(?i)the\s+(?:following\s+)?questions?\s+(?:that\s+)?(?:arise|arises|for\s+(?:determination|consideration|our\s+consideration))",
        r"(?i)the\s+(?:short\s+)?questions?\s+(?:involved|before\s+us|requiring)",
        r"(?i)the\s+(?:controversy|issue)\s+(?:involved\s+)?(?:in\s+this\s+(?:appeal|petition)\s+)?is\b",
        r"(?i)\bwhether\s+[^\.\n]{20,200}\?",
    ],
}

# A disposal sentence: the operative outcome of the judgment.
DISPOSAL_PATTERN = re.compile(
    r"(?:[^\.\n]*?\b(?:appeals?|petitions?|c\.?p\.?l\.?a\.?)\b[^\.\n]{0,120}?"
    r"\b(?:is|are|stands?|shall\s+stand)\b[^\.\n]{0,60}?"
    r"\b(?:allowed|dismissed|disposed\s+of|remanded|accepted|converted)\b[^\.]*\.)"
    r"|(?:[^\.\n]*?\bimpugned\s+(?:judgment|order|decree)\b[^\.\n]{0,120}?"
    r"\b(?:is|are)\b[^\.\n]{0,60}?\b(?:set\s+aside|upheld|maintained|modified|quashed)\b[^\.]*\.)",
    re.IGNORECASE,
)

# Trailing court-clerk / reporting metadata that must never become FINAL_ORDER.
TRAILER_PATTERNS = [
    r"(?i)^\s*(?:chief\s+)?justice\s*$",
    r"(?i)^\s*judges?\s*$",
    r"(?i)^\s*(?:not\s+)?approved\s+for\s+reporting",
    r"(?i)^\s*announced\s+in\s+(?:the\s+)?open\s+court",
    r"(?i)^\s*announced\s+on\b",
    r"(?i)^\s*islamabad[,\s]",
    r"(?i)^\s*(?:lahore|karachi|quetta|peshawar)[,\s]",
    r"(?i)^\s*bench\s+(?:i|ii|iii|iv)\b",
    r"(?i)^\s*certified\s+to\s+be\s+true\s+copy",
    r"(?i)^\s*date\s+of\s+(?:hearing|decision)\b",
]


def _is_trailer(para: str) -> bool:
    """True when a paragraph is signature/reporting metadata rather than judgment content."""
    p = (para or "").strip()
    if not p:
        return True
    # A trailer block is short and dominated by clerk metadata lines.
    if len(p) > 400:
        return False
    lines = [ln.strip() for ln in p.split("\n") if ln.strip()]
    if not lines:
        return True
    hits = sum(1 for ln in lines if any(re.search(pat, ln) for pat in TRAILER_PATTERNS))
    return hits >= max(1, len(lines) // 2)


def find_anchor(paragraphs: List[str], section: str, from_idx: int = 0) -> Optional[int]:
    """Index of the first paragraph at/after from_idx that opens `section`, or None."""
    pats = ANCHOR_PATTERNS.get(section, [])
    for i in range(max(0, from_idx), len(paragraphs)):
        para = paragraphs[i]
        # Anchors are most reliable near the head of a paragraph; scan the first
        # 300 chars so a passing mid-paragraph mention does not open a section.
        head = para[:300]
        if any(re.search(p, head) for p in pats):
            return i
    return None


GENERIC_ISSUE_MARKER = "conforms to the established legal principles"
DERIVED_ISSUE_MARKER = "is sustainable in law?"
TEMPLATE_ISSUE_MARKERS = (
    "Election Tribunal was justified in dismissing",
    "Service Tribunal had jurisdiction",
)


def issue_source(issues_text: str) -> str:
    """Classify how legal_issues was produced, so downstream code can trust it or not."""
    t = issues_text or ""
    if GENERIC_ISSUE_MARKER in t:
        return "generic"
    if any(m in t for m in TEMPLATE_ISSUE_MARKERS):
        return "template"
    if DERIVED_ISSUE_MARKER in t:
        return "derived"
    return "extracted"


def find_disposal_idx(paragraphs: List[str]) -> Optional[int]:
    """Index of the LAST paragraph containing an operative disposal sentence."""
    for i in range(len(paragraphs) - 1, -1, -1):
        if _is_trailer(paragraphs[i]):
            continue
        if DISPOSAL_PATTERN.search(paragraphs[i]):
            return i
    return None


# ============================================================================
# 2. NER & REGEX CONTENT EXTRACTOR (0 API Calls)
# ============================================================================

class NERExtractor:
    """Extracts, formats, and refines section content deterministically using regex and rule-based patterns."""

    @staticmethod
    def extract_header_coram(paragraphs: List[str], start_idx: int, end_idx: int, full_text: str) -> str:
        """Extract and structure HEADER_CORAM court metadata."""
        header_paras = paragraphs[max(0, start_idx):min(len(paragraphs), end_idx + 1)]
        raw_header = "\n\n".join(header_paras).strip()

        # If header boundary captured too little, search beginning of full text
        if len(raw_header) < 100 and len(paragraphs) > 0:
            raw_header = "\n\n".join(paragraphs[:min(4, len(paragraphs))]).strip()

        return raw_header

    # Markers used by the fact-recovery fallback on short / election judgments
    FACT_MARKERS = [
        "election", "votes", "polling", "candidate",
        "returned candidate", "margin", "polling stations",
        "general elections", "secured", "declared returned",
        "appellant secured", "respondent secured",
        "filed a suit", "instituted", "petition was filed",
        "impugned judgment", "high court", "tribunal",
    ]

    # Markers identifying counsel submissions rather than the court's own reasoning
    ARG_MARKERS = [
        "learned counsel", "argued that", "submitted that",
        "contended that", "it was argued", "it is argued",
        "learned asc", "on behalf of the appellant", "on behalf of the respondent",
        "averred that", "urged that",
    ]

    @staticmethod
    def _is_structural_noise(para: str) -> bool:
        """True for bare headings ('JUDGMENT'), paragraph numbers ('2.') and running headers."""
        p = para.strip()
        if not p:
            return True
        if re.fullmatch(r'(?i)judgment[\s\.:\-]*', p):
            return True
        if re.fullmatch(r'\d+[\.\)]?', p):
            return True
        return len(p) < 40

    @staticmethod
    def _forward_substantive(paragraphs: List[str], from_idx: int, count: int = 2) -> str:
        """Collect the next `count` substantive paragraphs starting at from_idx."""
        picked = []
        for p in paragraphs[max(0, from_idx):max(0, from_idx) + 8]:
            if NERExtractor._is_structural_noise(p):
                continue
            picked.append(p.strip())
            if len(picked) >= count:
                break
        return "\n\n".join(picked).strip()

    @staticmethod
    def extract_facts(paragraphs: List[str], start_idx: int, end_idx: int) -> str:
        """Extract factual background, procedural history, and trial events with empty-result fallback."""
        if start_idx > end_idx or start_idx >= len(paragraphs):
            # FALLBACK: use the first substantive paragraphs after the caption
            return NERExtractor._forward_substantive(paragraphs, max(1, start_idx))

        facts_paras = paragraphs[max(0, start_idx):min(len(paragraphs), end_idx + 1)]
        facts_text = "\n\n".join(facts_paras).strip()

        # A slice that is only a "JUDGMENT" heading / paragraph number is not facts
        if all(NERExtractor._is_structural_noise(p) for p in facts_paras):
            facts_text = ""

        # FALLBACK 1: walk forward past the heading to the narrative that follows
        if not facts_text:
            facts_text = NERExtractor._forward_substantive(paragraphs, end_idx + 1)

        # FALLBACK 2: scan forward for paragraphs carrying factual markers
        if not facts_text:
            for p in paragraphs[max(1, start_idx):]:
                if NERExtractor._is_structural_noise(p):
                    continue
                if any(marker in p.lower() for marker in NERExtractor.FACT_MARKERS):
                    facts_text = p.strip()
                    break

        # LAST RESORT: first substantive paragraphs following the caption
        if not facts_text and len(paragraphs) > 1:
            facts_text = NERExtractor._forward_substantive(paragraphs, 1)

        return facts_text

    @staticmethod
    def _find_argument_paragraphs(paragraphs: List[str]) -> str:
        """Scan every paragraph for counsel-submission markers."""
        arg_paras = [
            p for p in paragraphs
            if any(m in p.lower() for m in NERExtractor.ARG_MARKERS)
        ]
        return "\n\n".join(arg_paras).strip()

    @staticmethod
    def extract_arguments(paragraphs: List[str], start_idx: int, end_idx: int) -> str:
        """Extract counsel contentions and legal submissions, filtering out court analysis."""
        if start_idx > end_idx or start_idx >= len(paragraphs):
            # FALLBACK: search the whole document for counsel submissions
            return NERExtractor._find_argument_paragraphs(paragraphs)

        arg_paras = paragraphs[max(0, start_idx):min(len(paragraphs), end_idx + 1)]
        arg_text = "\n\n".join(arg_paras).strip()

        # FILTER: drop lines that read as the court's own analysis. A line carrying a
        # counsel marker is always kept, so a submission citing a Section is not lost.
        filtered = []
        for line in arg_text.split("\n"):
            line_lower = line.lower()
            is_counsel_line = any(m in line_lower for m in NERExtractor.ARG_MARKERS)
            is_court_line = (
                "we " in line_lower
                or "in our view" in line_lower
                or "section" in line_lower
            )
            if is_court_line and not is_counsel_line:
                continue
            filtered.append(line)

        result = "\n".join(filtered).strip()

        # FALLBACK: if filtering emptied the section, or the slice carries no counsel
        # submission at all (fixed short-judgment bands can land on FACTS instead),
        # recover the counsel paragraphs by marker scan across the whole judgment.
        if not result or not any(m in result.lower() for m in NERExtractor.ARG_MARKERS):
            recovered = NERExtractor._find_argument_paragraphs(paragraphs)
            if recovered:
                result = recovered

        return result

    @staticmethod
    def extract_legal_issues(paragraphs: List[str], start_idx: int, end_idx: int, full_text: str) -> str:
        """Extract case-specific legal issues with deduplication and Roman numeral formatting."""
        issues_paras = []
        if 0 <= start_idx <= end_idx < len(paragraphs):
            issues_paras = paragraphs[start_idx:end_idx + 1]

        issues_text = "\n\n".join(issues_paras).strip()

        # Check if already cleanly formatted with numbered questions
        if "whether" in issues_text.lower() and re.search(r'\([ivx0-9]+\)', issues_text, re.I):
            return issues_text

        # Search for leave grant and question markers across text
        leave_patterns = [
            r"(?i)leave\s+(?:to\s+appeal\s+)?was\s+granted\s+to\s+consider\s+(?:whether\s+)?([^\.\n]+)",
            r"(?i)the\s+question\s+arising\s+for\s+determination\s+is\s+(?:whether\s+)?([^\.\n]+)",
            r"(?i)the\s+following\s+questions?\s+arise\s+for\s+consideration[:\s]+([^\.\n]+)",
            r"(?i)whether\s+[^\.\n]+\?",
        ]

        found_questions: List[str] = []
        for pat in leave_patterns:
            for m in re.finditer(pat, full_text):
                q = m.group(0).strip()
                q_clean = re.sub(r'\s+', ' ', q)
                if len(q_clean) > 30 and q_clean not in found_questions:
                    found_questions.append(q_clean)

        # Deduplicate similar questions
        seen: Set[str] = set()
        unique_questions: List[str] = []
        for q in found_questions:
            key = q.lower()[:50]
            if key not in seen:
                seen.add(key)
                unique_questions.append(q)

        if unique_questions:
            formatted = []
            roman = ["i", "ii", "iii", "iv", "v", "vi", "vii", "viii"]
            for i, q in enumerate(unique_questions[:6]):
                idx_str = roman[i] if i < len(roman) else str(i + 1)
                if not q.lower().startswith("whether"):
                    formatted.append(f"({idx_str}) Whether {q[0].lower() + q[1:]}")
                else:
                    formatted.append(f"({idx_str}) {q}")
            return "\n\n".join(formatted)

        # Reuse the raw slice when it reads as framed questions OR carries explicit
        # issue-framing language. Requiring the literal word "whether" discarded real
        # leave-granting paragraphs such as "Leave ... was granted vide order dated
        # 06.8.2015 to consider questions of law that had arisen ...".
        issue_framing = re.search(
            r"leave\s+(?:to\s+appeal\s+)?(?:was|is|has\s+been)\s+granted"
            r"|questions?\s+of\s+law"
            r"|questions?\s+for\s+(?:determination|consideration)"
            r"|questions?\s+(?:that\s+)?(?:arise|arose|emerge)"
            r"|moot\s+question"
            r"|controversy\s+involved",
            issues_text or "",
            re.IGNORECASE,
        )
        if issues_text and ("whether" in issues_text.lower() or issue_framing):
            return issues_text

        # SYNTHESIS FALLBACK: templates are gated on statutory evidence actually present
        # in the judgment, so issues are never asserted for an unrelated case.
        # Normalise wrapped PDF line breaks before gating, otherwise a statute name
        # split across lines ("Representation \nof the People Act") never matches.
        full_lower = re.sub(r'\s+', ' ', full_text.lower())

        if ("election petition" in full_lower
                and "representation of the people act" in full_lower):
            return (
                "The following legal issues arise for determination:\n\n"
                "(i) Whether the Election Tribunal was justified in dismissing the election petition "
                "on the ground that the allegations were of a general nature not substantiated by evidence?\n\n"
                "(ii) Whether the appellant established corrupt and illegal practices under the "
                "Representation of the People Act, 1976?\n\n"
                "(iii) Whether the applications for verification of counterfoils and for recounting "
                "of rejected votes were rightly dismissed?"
            )

        if "service tribunal" in full_lower and (
                "service appeal" in full_lower or "civil servant" in full_lower):
            return (
                "The following legal issues arise for determination:\n\n"
                "(i) Whether the Service Tribunal had jurisdiction to entertain the service appeal?\n\n"
                "(ii) Whether the appellant was afforded a fair opportunity to defend himself during "
                "the inquiry proceedings?\n\n"
                "(iii) Whether the punishment imposed was proportionate to the misconduct alleged?"
            )

        # DERIVED FALLBACK: frame the issue from this judgment's own impugned order,
        # rather than emitting generic boilerplate detached from the case.
        impugned = re.search(
            r"(?i)((?:judgment|order|decree|award)\s+dated\s+[\d\.\-/]{6,12}"
            r"(?:\s+passed\s+by\s+(?:the\s+)?[^,\.\n]{5,80})?)",
            full_text,
        )
        if impugned:
            ref = re.sub(r'\s+', ' ', impugned.group(1)).strip().rstrip('.,')
            return (
                "The following legal issue arises for determination:\n\n"
                f"(i) Whether the {ref} is sustainable in law?"
            )

        # Fallback specific issue statement
        return "The following legal issue arises for determination:\n\n(i) Whether the impugned judgment of the High Court conforms to the established legal principles and statutory provisions governing the dispute."

    @staticmethod
    def extract_analysis_ratio(paragraphs: List[str], start_idx: int, end_idx: int) -> str:
        """Extract the full judicial analysis, reasoning, case citations, and statutory application."""
        if start_idx > end_idx or start_idx >= len(paragraphs):
            return ""
        analysis_paras = paragraphs[max(0, start_idx):min(len(paragraphs), end_idx + 1)]
        return "\n\n".join(analysis_paras).strip()

    @staticmethod
    def extract_final_order(paragraphs: List[str], start_idx: int, end_idx: int, full_text: str) -> str:
        """Extract the dispositive outcome, anchored on the operative disposal sentence.

        The disposal sentence is authoritative: trailing signature/reporting blocks are
        skipped, and a disposal buried mid-paragraph is preferred over the index band.
        """
        # PRIMARY: locate the last real disposal sentence in the judgment
        disposal_idx = find_disposal_idx(paragraphs)
        if disposal_idx is not None:
            para = paragraphs[disposal_idx].strip()
            m = DISPOSAL_PATTERN.search(para)
            if m:
                # Keep the operative sentence plus any concluding sentences after it,
                # and include a leading connector ("Consequently, ...") when present.
                head = para[:m.start()]
                connector = ""
                cm = re.search(
                    r"(?i)((?:for\s+(?:the\s+)?(?:foregoing|above)\s+reasons|"
                    r"in\s+view\s+of\s+the\s+(?:foregoing|above)|consequently|resultantly|"
                    r"accordingly|therefore)[^\.]*\.?\s*)$",
                    head,
                )
                if cm:
                    connector = cm.group(1).strip() + " "
                order_text = (connector + para[m.start():]).strip()
                if order_text:
                    return order_text
            return para

        # SECONDARY: honour the detected band, but never return a trailer block
        if 0 <= start_idx <= end_idx < len(paragraphs):
            order_paras = [p for p in paragraphs[start_idx:end_idx + 1] if not _is_trailer(p)]
            order_text = "\n\n".join(order_paras).strip()
            if order_text:
                return order_text

        # LAST RESORT: last non-trailer paragraph
        for p in reversed(paragraphs):
            if not _is_trailer(p):
                return p.strip()
        return ""


# ============================================================================
# 3. HYBRID CLASSIFIER ORCHESTRATOR
# ============================================================================

class HybridClassifier:
    """
    Cost-optimized hybrid section classifier:
    1. Single LLM call for boundary detection on compact outline (~1,000 tokens)
    2. Multi-strategy robust JSON parsing with boundary validation
    3. Zero-cost deterministic NER & regex content extraction
    4. Automatic fallback to rule-based parser on any failure
    """

    def __init__(self):
        self.boundary_detector = LLMBoundaryDetector()
        self.ner_extractor = NERExtractor()

    def _split_into_paragraphs(self, text: str) -> List[str]:
        """Split text into distinct paragraphs while cleaning page markers and noise."""
        clean = re.sub(r'--- PAGE \d+ ---', '', text)
        raw_paras = re.split(r'\n\s*\n+', clean)
        paras = []
        pending_number = ""
        for p in raw_paras:
            p_clean = p.strip()
            if not p_clean or re.match(r'^\d+$', p_clean):
                continue
            # PDF extraction often orphans the paragraph number ("2.", "3)") into its
            # own block; re-attach it so paragraph indices stay meaningful.
            if re.fullmatch(r'\d+[\.\)]', p_clean):
                pending_number = p_clean + " "
                continue
            paras.append(pending_number + p_clean)
            pending_number = ""
        if pending_number:
            paras.append(pending_number.strip())
        return paras

    async def classify(self, text: str, pdf_id: str) -> Optional[ClassifiedJudgment]:
        """Classify document into 6 standard sections using hybrid LLM + NER pipeline."""
        if not text or len(text.strip()) < 100:
            logger.error(f"[{pdf_id}] Text too short for classification")
            return None

        paragraphs = self._split_into_paragraphs(text)
        if not paragraphs:
            logger.error(f"[{pdf_id}] Failed to split text into paragraphs")
            return None

        total_p = len(paragraphs)
        is_short = total_p <= 15
        is_election = "election" in text.lower() or "polling" in text.lower()
        logger.info(
            f"[{pdf_id}] Starting hybrid classification across {total_p} paragraphs "
            f"(short={is_short}, election={is_election})..."
        )

        # Step 1: Universal content-marker detection (primary, 0 API calls).
        # The LLM boundary call and the index heuristics are now fallbacks, used only
        # when the markers find too little structure to trust.
        heuristic = self._heuristic_boundaries(total_p)
        boundaries = self._detect_sections(paragraphs, text)
        detection_mode = "content_markers"

        if self._detection_is_weak(boundaries, total_p):
            logger.warning(f"[{pdf_id}] Content markers found no section spans; falling back.")
            boundaries = await self.boundary_detector.detect_boundaries(paragraphs, pdf_id, heuristic)
            detection_mode = "llm_or_heuristic"

        boundaries = self._validate_boundaries(
            boundaries, total_p, pdf_id,
            enforce_sequence=(detection_mode != "content_markers"),
        )
        logger.info(f"[{pdf_id}] Section detection mode: {detection_mode}")

        # Step 2: Deterministic caption boundary alignment (prevents HEADER_CORAM leaking into FACTS)
        caption_markers = [
            "in the supreme court", "present:", "civil appeal", "criminal appeal",
            "constitution petition", "cpla", "versus", "appellant", "respondent",
            "for the appellant", "for the respondent", "date of hearing", "on appeal from",
            "against the judgment", "crl. a.", "c.a. no", "c.p. no"
        ]
        
        true_header_end = 0
        narrative_start = None
        for idx in range(min(20, total_p)):
            p_lower = paragraphs[idx].lower().strip()
            # If paragraph starts with JUDGMENT or a judge name opening the narrative, stop
            if p_lower == "judgment" or re.match(r'^(?:mr\.\s+)?justice\s+[a-z\s]+(?:,\s*(?:cj|hcj|j))?\s*[\.\-:]', p_lower) or re.match(r'^[a-z\s]+,\s*(?:cj|hcj|j)\s*[\.\-:]', p_lower):
                if p_lower == "judgment":
                    true_header_end = max(true_header_end, idx - 1)
                    narrative_start = idx + 1
                else:
                    # The judge-name paragraph opens the narrative itself
                    narrative_start = idx
                break
            if any(m in p_lower for m in caption_markers):
                true_header_end = idx

        # Step 3: _detect_sections already located every boundary by content marker;
        # only the disposal index is still needed directly by the extractors below.
        disposal_idx = find_disposal_idx(paragraphs)

        def get_bounds(sec_name: str) -> Tuple[int, int]:
            b = boundaries.get(sec_name, {})
            start = int(b.get("start_idx", 0) if isinstance(b, dict) else 0)
            end = int(b.get("end_idx", 0) if isinstance(b, dict) else 0)
            return max(0, min(start, total_p - 1)), max(0, min(end, total_p - 1))

        sections = {}

        # 1. HEADER_CORAM - Guaranteed to capture entire caption
        h_start, h_end = get_bounds("HEADER_CORAM")
        h_end = max(h_end, true_header_end)
        # The caption terminator is authoritative: never let the header swallow the
        # opening narrative paragraph (which carries the facts on short judgments).
        if narrative_start is not None:
            h_end = min(h_end, max(true_header_end, narrative_start - 1))
        sections["HEADER_CORAM"] = self.ner_extractor.extract_header_coram(paragraphs, h_start, h_end, text)

        # 2. FACTS - Guaranteed to start strictly after caption
        f_start, f_end = get_bounds("FACTS")
        f_start = max(f_start, h_end + 1)
        if narrative_start is not None:
            f_start = min(f_start, max(narrative_start, h_end + 1))
        f_end = max(f_start, f_end)
        sections["FACTS"] = self.ner_extractor.extract_facts(paragraphs, f_start, f_end)

        # 3. ARGUMENTS - bounded by counsel/reasoning markers in _detect_sections
        a_start, a_end = get_bounds("ARGUMENTS")
        a_end = max(a_start, a_end)
        sections["ARGUMENTS"] = self.ner_extractor.extract_arguments(paragraphs, a_start, a_end)

        # 4. LEGAL_ISSUES
        l_start, l_end = get_bounds("LEGAL_ISSUES")
        sections["LEGAL_ISSUES"] = self.ner_extractor.extract_legal_issues(paragraphs, l_start, l_end, text)

        # 5. ANALYSIS_RATIO - reasoning up to the disposal sentence
        an_start, an_end = get_bounds("ANALYSIS_RATIO")
        if disposal_idx is not None and disposal_idx > an_start:
            an_end = max(an_start, disposal_idx - 1)
        an_end = max(an_start, an_end)
        sections["ANALYSIS_RATIO"] = self.ner_extractor.extract_analysis_ratio(paragraphs, an_start, an_end)

        # 6. FINAL_ORDER
        o_start, o_end = get_bounds("FINAL_ORDER")
        sections["FINAL_ORDER"] = self.ner_extractor.extract_final_order(paragraphs, o_start, o_end, text)

        # Ensure no section is completely empty
        if not sections["HEADER_CORAM"] and total_p > 0:
            sections["HEADER_CORAM"] = paragraphs[0]

        # FACTS RECOVERY: fall back to the first substantive paragraph after the caption
        if not sections["FACTS"] and total_p > 1:
            recovery_idx = min(h_end + 1, total_p - 1)
            sections["FACTS"] = self.ner_extractor._forward_substantive(paragraphs, recovery_idx)
            logger.warning(
                f"[{pdf_id}] FACTS was empty, recovered from paragraph {recovery_idx} onwards"
            )

        if not sections["ARGUMENTS"] and total_p > 1:
            sections["ARGUMENTS"] = self.ner_extractor._find_argument_paragraphs(paragraphs)
            if sections["ARGUMENTS"]:
                logger.warning(f"[{pdf_id}] ARGUMENTS was empty, recovered via counsel markers")
        if not sections["ANALYSIS_RATIO"] and total_p > 1:
            sections["ANALYSIS_RATIO"] = "\n\n".join(paragraphs[1:max(2, total_p - 1)])
        if not sections["FINAL_ORDER"] and total_p > 0:
            # Never fall back onto a signature / "approved for reporting" block
            for p in reversed(paragraphs):
                if not _is_trailer(p):
                    sections["FINAL_ORDER"] = p.strip()
                    break

        issues_source = issue_source(sections["LEGAL_ISSUES"])
        if issues_source != "extracted":
            logger.warning(f"[{pdf_id}] LEGAL_ISSUES not found in text (source={issues_source})")

        logger.info(f"[{pdf_id}] Hybrid section extraction complete.")

        return ClassifiedJudgment(
            pdf_id=pdf_id,
            header_coram=sections["HEADER_CORAM"],
            facts=sections["FACTS"],
            arguments=sections["ARGUMENTS"],
            legal_issues=sections["LEGAL_ISSUES"],
            analysis_ratio=sections["ANALYSIS_RATIO"],
            final_order=sections["FINAL_ORDER"],
            parse_mode="hybrid_llm_ner",
            confidence_score=0.95,
            legal_issues_source=issues_source,
        )

    # ========================================================================
    # UNIVERSAL CONTENT-MARKER SECTION DETECTION
    # Sections are located by what the text SAYS, not by paragraph arithmetic,
    # so the same logic serves a 5-paragraph order and a 90-paragraph judgment.
    # ========================================================================

    # NOTE: every marker list is lowercase and compared against lowercased text.
    # Mixed-case entries silently never match, which is why they are normalised here.
    COUNSEL_MARKERS = [
        "learned counsel", "learned asc", "learned sr. asc", "learned a.s.c",
        "argued that", "submitted that", "contended that", "urged that",
        "averred that", "it was argued", "it is argued", "it was submitted",
        "it was contended", "counsel for the appellant", "counsel for the respondent",
        "counsel for the petitioner", "learned additional advocate general",
        "learned advocate general", "learned dag", "learned addl. a.g.",
        "learned attorney general", "learned prosecutor general",
        "on behalf of the appellant", "on behalf of the respondent",
        "crux of the arguments", "commenced his arguments",
    ]

    # Genuine judicial-reasoning openers. "section" / "article" / "rule" are
    # deliberately EXCLUDED: they appear in almost every legal paragraph, including
    # counsel submissions, and using them as boundaries truncates ARGUMENTS to a
    # single paragraph on nearly every judgment.
    REASONING_MARKERS = [
        "we have heard", "we have considered", "we have examined",
        "we have perused", "we have gone through", "we have carefully",
        "we have reviewed", "we have scrutinized", "having heard",
        "having considered", "having examined", "having perused",
        "after hearing", "heard learned counsel", "arguments heard",
        "record perused", "in our view", "in our considered view",
        "in our opinion", "in our considered opinion", "we are of the view",
        "we are of the considered view", "we hold that", "we find that",
        "we observe that", "we note that", "we on our part",
        "it is well settled", "adverting to",
    ]

    ISSUE_MARKERS = [
        "the following issues arise", "the following questions arise",
        "the question for determination", "the questions for determination",
        "the moot question", "the issues that arise", "questions that emerge",
        "leave to appeal was granted to consider", "leave is granted to consider",
        "leave was granted to consider", "leave in this matter was granted",
        "question of law", "questions of law", "the controversy involved",
        "the short question", "arise for determination",
        "arise for our consideration", "for consideration",
    ]

    FINAL_MARKERS = [
        "in light of the above", "for the foregoing reasons",
        "for the above reasons", "for what has been discussed above",
        "in view of the foregoing", "in view of the above", "consequently",
        "resultantly", "as a result", "the result is that", "in the result",
        "therefore, for reasons recorded above", "accordingly",
    ]

    @staticmethod
    def _first_marker_idx(paragraphs: List[str], markers: List[str],
                          from_idx: int, skip_if_also: Optional[List[str]] = None) -> Optional[int]:
        """First paragraph index at/after from_idx containing any marker.

        `skip_if_also` keeps a paragraph from ending a section when it simultaneously
        belongs to it (e.g. a counsel paragraph that also reads like reasoning).
        """
        for i in range(max(0, from_idx), len(paragraphs)):
            low = paragraphs[i].lower()
            if any(m in low for m in markers):
                if skip_if_also and any(m in low for m in skip_if_also):
                    continue
                return i
        return None

    def _find_header_end(self, paragraphs: List[str]) -> int:
        """Index of the last caption paragraph (the JUDGMENT/ORDER line is part of it)."""
        for i, p in enumerate(paragraphs[:25]):
            p_clean = re.sub(r'\s+', ' ', p).strip()

            # Explicit JUDGMENT / ORDER heading terminates the caption
            if re.match(r'^(?:judgment|order)\b[\s\.\:\-]*$', p_clean, re.I):
                return i

            # A judge-name opener starts the narrative, so the header ended before it.
            # Handles ALL-CAPS ("FAISAL ARAB, J.-"), title case ("Athar Minallah, J.-")
            # and initialled names ("Qazi Muhammad Amin Ahmed, J.-").
            if re.match(r'^[A-Z][A-Za-z\.\s]{3,60},\s*(?:C\.?J|H?C?J|J)\.?\s*[-:\.]', p_clean):
                return max(0, i - 1)

            # Some judgments run "…Date of Hearing: 15.08.2018 O R D E R QAZI FAEZ ISA, J."
            # into one block; the caption still ends here.
            if re.search(r'\bO\s*R\s*D\s*E\s*R\b|\bJ\s*U\s*D\s*G\s*M\s*E\s*N\s*T\b', p_clean):
                if re.search(r'(?:date of hearing|for the (?:appellant|respondent|petitioner))', p_clean, re.I):
                    return i

        # Fallback: assume the caption occupies the opening fraction of the document
        return min(max(1, int(len(paragraphs) * 0.15)), max(0, len(paragraphs) - 1))

    def _find_facts_range(self, paragraphs: List[str], header_end: int) -> Tuple[int, int]:
        """FACTS: the narrative after the caption, ending where submissions/reasoning begin."""
        total = len(paragraphs)
        facts_start = min(header_end + 1, max(0, total - 1))

        # Advance past residual caption/noise paragraphs
        for i in range(facts_start, total):
            p_clean = re.sub(r'\s+', ' ', paragraphs[i]).strip()
            if re.match(r'^-?\s*\d+\s*-?$', p_clean):
                continue
            if re.search(r'present:|justice\s+[a-z]', p_clean, re.I):
                continue
            if re.search(r'(?:civil|criminal|constitution|jail)\s+(?:appeal|petition)\s+no\.', p_clean, re.I) \
                    and len(p_clean) < 160:
                continue
            if re.search(r'^(?:for the (?:appellant|respondent|petitioner)|date of hearing|versus)', p_clean, re.I):
                continue
            if NERExtractor._is_structural_noise(paragraphs[i]):
                continue
            facts_start = i
            break

        # FACTS ends where the next section demonstrably begins
        nxt = [x for x in (
            self._first_marker_idx(paragraphs, self.COUNSEL_MARKERS, facts_start + 1),
            self._first_marker_idx(paragraphs, self.REASONING_MARKERS, facts_start + 1),
        ) if x is not None]
        if nxt:
            facts_end = max(facts_start, min(nxt) - 1)
        else:
            # No later section detected: keep a bounded narrative rather than the
            # whole document, and never collapse to a single paragraph.
            facts_end = min(facts_start + 2, total - 1)

        return facts_start, max(facts_start, facts_end)

    def _find_arguments_range(self, paragraphs: List[str], facts_end: int) -> Tuple[int, int]:
        """ARGUMENTS: from the first counsel submission to where reasoning takes over."""
        total = len(paragraphs)
        start = self._first_marker_idx(paragraphs, self.COUNSEL_MARKERS, facts_end + 1)
        if start is None:
            # Submissions may sit inside the facts narrative on interleaved judgments
            start = self._first_marker_idx(paragraphs, self.COUNSEL_MARKERS, 0)
        if start is None:
            return min(facts_end + 1, max(0, total - 1)), min(facts_end + 1, max(0, total - 1))

        # A paragraph that is BOTH submission and reasoning stays with ARGUMENTS
        end_marker = self._first_marker_idx(
            paragraphs, self.REASONING_MARKERS, start + 1, skip_if_also=self.COUNSEL_MARKERS
        )
        if end_marker is None:
            end_marker = self._first_marker_idx(paragraphs, self.FINAL_MARKERS, start + 1)
        args_end = (end_marker - 1) if end_marker is not None else min(start + 2, total - 1)

        return start, max(start, args_end)

    def _find_issues_range(self, paragraphs: List[str], args_end: int, full_text: str) -> Tuple[int, int]:
        """LEGAL_ISSUES: framed questions. Returns an empty range when none exist."""
        total = len(paragraphs)

        # Numbered questions, or an explicit issue-framing phrase, anywhere in the body.
        for i, p in enumerate(paragraphs):
            low = p.lower()
            if re.search(r'\((?:[ivx]+|\d+)\)\s*whether', low):
                return i, i
            if any(m in low for m in self.ISSUE_MARKERS) and "whether" in low:
                return i, i

        for i, p in enumerate(paragraphs):
            low = p.lower()
            if any(m in low for m in self.ISSUE_MARKERS):
                return i, i

        # A bare "Whether …?" question outside counsel submissions
        for i, p in enumerate(paragraphs):
            low = p.lower()
            if re.search(r'whether\s+[^.\n]{15,}\?', low) and not any(
                m in low for m in self.COUNSEL_MARKERS
            ):
                return i, i

        # Genuinely absent - signal empty so the extractor synthesises honestly
        s = min(args_end + 1, max(0, total - 1))
        return s, s - 1

    def _find_analysis_range(self, paragraphs: List[str], issues_end: int) -> Tuple[int, int]:
        """ANALYSIS_RATIO: judicial reasoning, ending before the disposal."""
        total = len(paragraphs)
        start = self._first_marker_idx(paragraphs, self.REASONING_MARKERS, max(0, issues_end))
        if start is None:
            start = min(max(issues_end + 1, 0), max(0, total - 1))

        disposal = find_disposal_idx(paragraphs)
        if disposal is not None and disposal > start:
            end = disposal - 1
        else:
            fm = self._first_marker_idx(paragraphs, self.FINAL_MARKERS, start + 1)
            if fm is not None:
                end = fm - 1
            else:
                # Run to the last substantive paragraph, never a signature block
                end = total - 1
                while end > start and _is_trailer(paragraphs[end]):
                    end -= 1

        return start, max(start, end)

    def _find_final_order_range(self, paragraphs: List[str], analysis_end: int) -> Tuple[int, int]:
        """FINAL_ORDER: the operative disposal, excluding signature/reporting blocks."""
        total = len(paragraphs)

        # The disposal sentence is the most reliable signal available
        disposal = find_disposal_idx(paragraphs)
        if disposal is not None:
            start = disposal
        else:
            fm = self._first_marker_idx(paragraphs, self.FINAL_MARKERS, max(0, analysis_end))
            start = fm if fm is not None else max(0, total - 1)

        end = total - 1
        while end > start and _is_trailer(paragraphs[end]):
            end -= 1

        return start, max(start, end)

    def _detect_sections(self, paragraphs: List[str], full_text: str) -> Dict[str, Dict[str, int]]:
        """Locate all six sections by content markers. Works for any judgment structure."""
        header_end = self._find_header_end(paragraphs)
        facts_start, facts_end = self._find_facts_range(paragraphs, header_end)
        args_start, args_end = self._find_arguments_range(paragraphs, facts_end)
        issues_start, issues_end = self._find_issues_range(paragraphs, args_end, full_text)
        analysis_start, analysis_end = self._find_analysis_range(paragraphs, max(issues_end, args_end))
        final_start, final_end = self._find_final_order_range(paragraphs, analysis_end)

        return {
            "HEADER_CORAM": {"start_idx": 0, "end_idx": header_end},
            "FACTS": {"start_idx": facts_start, "end_idx": facts_end},
            "ARGUMENTS": {"start_idx": args_start, "end_idx": args_end},
            "LEGAL_ISSUES": {"start_idx": issues_start, "end_idx": issues_end},
            "ANALYSIS_RATIO": {"start_idx": analysis_start, "end_idx": analysis_end},
            "FINAL_ORDER": {"start_idx": final_start, "end_idx": final_end},
        }

    @staticmethod
    def _detection_is_weak(boundaries: Dict[str, Dict[str, int]], total_p: int) -> bool:
        """True when content markers found too little to trust (triggers LLM/heuristic fallback)."""
        args = boundaries.get("ARGUMENTS", {})
        analysis = boundaries.get("ANALYSIS_RATIO", {})
        spans = 0
        if args.get("end_idx", 0) > args.get("start_idx", 0):
            spans += 1
        if analysis.get("end_idx", 0) > analysis.get("start_idx", 0):
            spans += 1
        return spans == 0 and total_p > 8

    def _validate_boundaries(self, boundaries: Dict, total_p: int, pdf_id: str,
                             enforce_sequence: bool = True) -> Dict[str, Dict[str, int]]:
        """Clamp boundaries into range and repair degenerate FACTS spans on short judgments."""
        validated: Dict[str, Dict[str, int]] = {}
        last_end = -1

        for st in SECTION_TYPES:
            b = boundaries.get(st) if isinstance(boundaries, dict) else None
            if not isinstance(b, dict):
                b = {}

            start = int(b.get("start_idx", 0))
            end = int(b.get("end_idx", start))

            start = max(0, min(start, total_p - 1))
            end = max(start, min(end, total_p - 1))

            # Content-marker detection places sections by what the text says, so a
            # section may legitimately start before the previous one ends (LEGAL_ISSUES
            # quoted inside argument, interleaved FACTS/ARGUMENTS). Only re-sequence
            # when the bands came from index arithmetic.
            if enforce_sequence and not (total_p <= 15) and start <= last_end:
                start = min(total_p - 1, last_end + 1)
                end = max(start, end)

            validated[st] = {"start_idx": start, "end_idx": end}
            last_end = max(last_end, end)

        # FIX: on short judgments a single-paragraph FACTS span is usually the bare
        # "JUDGMENT" heading - widen it so real facts are captured.
        if total_p <= 15:
            facts = validated.get("FACTS", {})
            if facts.get("start_idx") == facts.get("end_idx"):
                facts["end_idx"] = min(facts["end_idx"] + 2, total_p - 1)
                validated["FACTS"] = facts

        logger.info(f"[{pdf_id}] Boundaries validated: {validated}")
        return validated

    def _heuristic_boundaries(self, total_p: int) -> Dict[str, Dict[str, int]]:
        """Heuristic boundary allocation, with dedicated handling for short judgments."""
        if total_p <= 3:
            return {
                "HEADER_CORAM": {"start_idx": 0, "end_idx": 0},
                "FACTS": {"start_idx": 0, "end_idx": 0},
                "ARGUMENTS": {"start_idx": 1, "end_idx": 1},
                "LEGAL_ISSUES": {"start_idx": 1, "end_idx": 1},
                "ANALYSIS_RATIO": {"start_idx": 1, "end_idx": max(1, total_p - 2)},
                "FINAL_ORDER": {"start_idx": max(0, total_p - 1), "end_idx": total_p - 1},
            }

        # SHORT JUDGMENTS (4-8 paragraphs): sections overlap because FACTS and
        # ARGUMENTS are typically interleaved in the same narrative paragraphs.
        if total_p <= 8:
            return {
                "HEADER_CORAM": {"start_idx": 0, "end_idx": min(3, total_p - 1)},
                "FACTS": {"start_idx": 1, "end_idx": min(2, total_p - 1)},
                "ARGUMENTS": {"start_idx": 2, "end_idx": min(4, total_p - 1)},
                "LEGAL_ISSUES": {"start_idx": 3, "end_idx": min(3, total_p - 1)},
                "ANALYSIS_RATIO": {"start_idx": 4, "end_idx": max(4, total_p - 2)},
                "FINAL_ORDER": {"start_idx": max(0, total_p - 1), "end_idx": total_p - 1},
            }

        # SHORT JUDGMENTS (9-15 paragraphs)
        if total_p <= 15:
            return {
                "HEADER_CORAM": {"start_idx": 0, "end_idx": min(3, total_p - 1)},
                "FACTS": {"start_idx": 1, "end_idx": min(4, total_p - 1)},
                "ARGUMENTS": {"start_idx": 3, "end_idx": min(6, total_p - 1)},
                "LEGAL_ISSUES": {"start_idx": 5, "end_idx": min(6, total_p - 1)},
                "ANALYSIS_RATIO": {"start_idx": 6, "end_idx": max(6, total_p - 2)},
                "FINAL_ORDER": {"start_idx": max(0, total_p - 1), "end_idx": total_p - 1},
            }

        # REGULAR JUDGMENTS (16+ paragraphs)
        h_end = min(10, total_p - 1)
        f_end = min(max(h_end + 1, int(total_p * 0.25)), total_p - 1)
        a_end = min(max(f_end + 1, int(total_p * 0.38)), total_p - 1)
        l_end = min(max(a_end + 1, int(total_p * 0.48)), total_p - 1)
        an_end = max(l_end + 1, total_p - 3)
        o_start = max(an_end + 1, total_p - 2)

        return {
            "HEADER_CORAM": {"start_idx": 0, "end_idx": h_end},
            "FACTS": {"start_idx": h_end + 1, "end_idx": f_end},
            "ARGUMENTS": {"start_idx": f_end + 1, "end_idx": a_end},
            "LEGAL_ISSUES": {"start_idx": a_end + 1, "end_idx": l_end},
            "ANALYSIS_RATIO": {"start_idx": l_end + 1, "end_idx": an_end},
            "FINAL_ORDER": {"start_idx": o_start, "end_idx": total_p - 1},
        }


# ============================================================================
# 4. VALIDATOR
# ============================================================================

class Validator:
    """Validates classification quality."""

    @staticmethod
    def validate_result(result: ClassifiedJudgment, source_text: str) -> Dict:
        """Validate sections against quality criteria."""
        issues = []
        passed = True
        confidence = 0.95

        # Check 1: HEADER_CORAM must contain court name
        if "SUPREME COURT" not in result.header_coram.upper():
            issues.append("HEADER_CORAM missing court name")
            confidence -= 0.1

        # Check 2: HEADER_CORAM must contain at least one judge
        judges = re.findall(r"JUSTICE", result.header_coram.upper())
        if len(judges) < 1:
            issues.append("HEADER_CORAM missing judges")
            confidence -= 0.1

        # Check 3: HEADER_CORAM must contain case number
        if not re.search(r"(?:CIVIL|CRIMINAL|CONSTITUTION)\s+(?:APPEAL|PETITION)", result.header_coram.upper()):
            issues.append("HEADER_CORAM missing case number")
            confidence -= 0.05

        # Check 4: FACTS should have minimal analysis markers
        facts_lower = result.facts.lower()
        we_patterns = ["we have", "we are", "we find", "we hold", "in our view"]
        we_found = [p for p in we_patterns if p in facts_lower]
        if we_found:
            issues.append(f"FACTS contains analysis markers: {we_found}")
            confidence -= 0.1

        # Check 5: LEGAL_ISSUES should have "Whether"
        if "whether" not in result.legal_issues.lower() and "?" not in result.legal_issues:
            issues.append("LEGAL_ISSUES missing 'Whether' questions")
            confidence -= 0.1

        # Check 5b: LEGAL_ISSUES must be case-specific, not boilerplate. The "Whether"
        # check above cannot catch this because every fallback supplies the word.
        if result.legal_issues_source == "generic":
            issues.append("LEGAL_ISSUES is generic boilerplate, not from the judgment")
            confidence -= 0.15
        elif result.legal_issues_source in ("template", "derived"):
            issues.append(f"LEGAL_ISSUES synthesized ({result.legal_issues_source}), not extracted")
            confidence -= 0.05

        # Check 6: FINAL_ORDER should have outcome verbs
        final_lower = result.final_order.lower()
        outcome_verbs = ["allowed", "dismissed", "set aside", "disposed", "remanded",
                         "accepted", "converted", "quashed", "upheld", "maintained"]
        if not any(v in final_lower for v in outcome_verbs):
            issues.append("FINAL_ORDER missing outcome verbs")
            confidence -= 0.1

        # Check 6b: FINAL_ORDER must not be a signature / reporting block
        if _is_trailer(result.final_order):
            issues.append("FINAL_ORDER is a signature/reporting block")
            confidence -= 0.15

        # Check 7: ARGUMENTS should carry an actual counsel submission
        if result.arguments.strip() and not any(
            m in result.arguments.lower() for m in NERExtractor.ARG_MARKERS
        ):
            issues.append("ARGUMENTS contains no counsel submission marker")
            confidence -= 0.1

        # Check 8: FACTS should not be caption spill-over
        caption_leak = ["versus", "date of hearing", "for the appellant", "for the respondent"]
        if sum(1 for m in caption_leak if m in result.facts.lower()) >= 2:
            issues.append("FACTS contains caption/counsel metadata")
            confidence -= 0.1

        if len(issues) > 2:
            passed = False

        return {
            "passed": passed,
            "issues": issues,
            "confidence": max(0.0, min(1.0, confidence)),
        }

