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

    @staticmethod
    def extract_facts(paragraphs: List[str], start_idx: int, end_idx: int) -> str:
        """Extract factual background, procedural history, and trial events."""
        if start_idx > end_idx or start_idx >= len(paragraphs):
            return ""
        facts_paras = paragraphs[max(0, start_idx):min(len(paragraphs), end_idx + 1)]
        return "\n\n".join(facts_paras).strip()

    @staticmethod
    def extract_arguments(paragraphs: List[str], start_idx: int, end_idx: int) -> str:
        """Extract counsel contentions and legal submissions."""
        if start_idx > end_idx or start_idx >= len(paragraphs):
            return ""
        arg_paras = paragraphs[max(0, start_idx):min(len(paragraphs), end_idx + 1)]
        return "\n\n".join(arg_paras).strip()

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

        if issues_text:
            return issues_text

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
        """Extract the dispositive outcome sentences and final order."""
        if 0 <= start_idx <= end_idx < len(paragraphs):
            order_paras = paragraphs[start_idx:end_idx + 1]
            order_text = "\n\n".join(order_paras).strip()
            if order_text:
                return order_text

        # Fallback: find standard outcome sentences in the last few paragraphs
        last_paras = paragraphs[-3:] if len(paragraphs) >= 3 else paragraphs
        outcome_patterns = [
            r"(?i)(?:for\s+(?:the\s+)?(?:foregoing\s+)?reasons[,\s]+)?(?:this\s+)?(?:appeal|petition)\s+is\s+(?:hereby\s+)?(?:allowed|dismissed|disposed\s+of|remanded)[^\.\n]*\.",
            r"(?i)impugned\s+judgment\s+is\s+(?:hereby\s+)?(?:set\s+aside|upheld|maintained)[^\.\n]*\.",
        ]
        for p in reversed(last_paras):
            for pat in outcome_patterns:
                m = re.search(pat, p)
                if m:
                    return p.strip()

        return "\n\n".join(last_paras).strip() if last_paras else ""


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
        for p in raw_paras:
            p_clean = p.strip()
            if p_clean and not re.match(r'^\d+$', p_clean):
                paras.append(p_clean)
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
        logger.info(f"[{pdf_id}] Starting hybrid classification across {total_p} paragraphs...")

        # Step 1: Detect boundaries via LLM (1 API call) with heuristic fallback
        heuristic = self._heuristic_boundaries(total_p)
        boundaries = await self.boundary_detector.detect_boundaries(paragraphs, pdf_id, heuristic)

        # Step 2: Deterministic caption boundary alignment (prevents HEADER_CORAM leaking into FACTS)
        caption_markers = [
            "in the supreme court", "present:", "civil appeal", "criminal appeal",
            "constitution petition", "cpla", "versus", "appellant", "respondent",
            "for the appellant", "for the respondent", "date of hearing", "on appeal from",
            "against the judgment", "crl. a.", "c.a. no", "c.p. no"
        ]
        
        true_header_end = 0
        for idx in range(min(20, total_p)):
            p_lower = paragraphs[idx].lower().strip()
            # If paragraph starts with JUDGMENT or a judge name opening the narrative, stop
            if p_lower == "judgment" or re.match(r'^(?:mr\.\s+)?justice\s+[a-z\s]+(?:,\s*(?:cj|hcj|j))?\s*[\.\-:]', p_lower) or re.match(r'^[a-z\s]+,\s*(?:cj|hcj|j)\s*[\.\-:]', p_lower):
                if p_lower == "judgment":
                    true_header_end = max(true_header_end, idx - 1)
                break
            if any(m in p_lower for m in caption_markers):
                true_header_end = idx

        def get_bounds(sec_name: str) -> Tuple[int, int]:
            b = boundaries.get(sec_name, {})
            start = int(b.get("start_idx", 0) if isinstance(b, dict) else 0)
            end = int(b.get("end_idx", 0) if isinstance(b, dict) else 0)
            return max(0, min(start, total_p - 1)), max(0, min(end, total_p - 1))

        sections = {}

        # 1. HEADER_CORAM - Guaranteed to capture entire caption
        h_start, h_end = get_bounds("HEADER_CORAM")
        h_end = max(h_end, true_header_end)
        sections["HEADER_CORAM"] = self.ner_extractor.extract_header_coram(paragraphs, h_start, h_end, text)

        # 2. FACTS - Guaranteed to start strictly after caption
        f_start, f_end = get_bounds("FACTS")
        f_start = max(f_start, h_end + 1)
        f_end = max(f_start, f_end)
        sections["FACTS"] = self.ner_extractor.extract_facts(paragraphs, f_start, f_end)

        # 3. ARGUMENTS
        a_start, a_end = get_bounds("ARGUMENTS")
        a_start = max(a_start, f_start)
        sections["ARGUMENTS"] = self.ner_extractor.extract_arguments(paragraphs, a_start, a_end)

        # 4. LEGAL_ISSUES
        l_start, l_end = get_bounds("LEGAL_ISSUES")
        sections["LEGAL_ISSUES"] = self.ner_extractor.extract_legal_issues(paragraphs, l_start, l_end, text)

        # 5. ANALYSIS_RATIO
        an_start, an_end = get_bounds("ANALYSIS_RATIO")
        sections["ANALYSIS_RATIO"] = self.ner_extractor.extract_analysis_ratio(paragraphs, an_start, an_end)

        # 6. FINAL_ORDER
        o_start, o_end = get_bounds("FINAL_ORDER")
        sections["FINAL_ORDER"] = self.ner_extractor.extract_final_order(paragraphs, o_start, o_end, text)

        # Ensure no section is completely empty
        if not sections["HEADER_CORAM"] and total_p > 0:
            sections["HEADER_CORAM"] = paragraphs[0]
        if not sections["ANALYSIS_RATIO"] and total_p > 1:
            sections["ANALYSIS_RATIO"] = "\n\n".join(paragraphs[1:max(2, total_p - 1)])
        if not sections["FINAL_ORDER"] and total_p > 0:
            sections["FINAL_ORDER"] = paragraphs[-1]

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
        )

    def _heuristic_boundaries(self, total_p: int) -> Dict[str, Dict[str, int]]:
        """Heuristic boundary fallback when LLM is unavailable."""
        if total_p <= 3:
            return {
                "HEADER_CORAM": {"start_idx": 0, "end_idx": 0},
                "FACTS": {"start_idx": 0, "end_idx": 0},
                "ARGUMENTS": {"start_idx": 1, "end_idx": 1},
                "LEGAL_ISSUES": {"start_idx": 1, "end_idx": 1},
                "ANALYSIS_RATIO": {"start_idx": 1, "end_idx": max(1, total_p - 2)},
                "FINAL_ORDER": {"start_idx": max(0, total_p - 1), "end_idx": total_p - 1},
            }

        h_end = min(2, total_p - 1)
        f_end = min(max(h_end + 1, int(total_p * 0.3)), total_p - 1)
        a_end = min(max(f_end + 1, int(total_p * 0.45)), total_p - 1)
        l_end = min(max(a_end + 1, int(total_p * 0.55)), total_p - 1)
        an_end = max(l_end + 1, total_p - 2)
        o_start = max(an_end + 1, total_p - 1)

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

        # Check 6: FINAL_ORDER should have outcome verbs
        final_lower = result.final_order.lower()
        outcome_verbs = ["allowed", "dismissed", "set aside", "disposed", "remanded"]
        if not any(v in final_lower for v in outcome_verbs):
            issues.append("FINAL_ORDER missing outcome verbs")
            confidence -= 0.1

        if len(issues) > 2:
            passed = False

        return {
            "passed": passed,
            "issues": issues,
            "confidence": max(0.0, min(1.0, confidence)),
        }

