import re

import fitz
from loguru import logger


def detect_pdf_type(pdf_path: str) -> str:
    """
    Detect if PDF is typed (text-based) or scanned (image-based).
    Returns: 'text' or 'scanned'

    Uses multiple heuristics:
      1. Extractable text volume across the first 3 pages
      2. Word quality check (real words vs OCR garble)
      3. Common OCR error pattern detection
    """
    try:
        with fitz.open(pdf_path) as doc:
            sample_pages = min(3, len(doc))
            total_chars = 0
            word_count = 0
            text_pages_with_substance = 0

            for page_index in range(sample_pages):
                text = doc[page_index].get_text() or ""
                stripped = text.strip()
                total_chars += len(stripped)

                # Count words that are purely alphabetic (real words)
                words = [w for w in stripped.split() if w.isalpha() and len(w) >= 2]
                word_count += len(words)

                # A page with >200 chars of real text is "substantial"
                if len(stripped) > 200 and len(words) >= 15:
                    text_pages_with_substance += 1

            # If at least 2 of the first 3 pages have substantial text -> typed
            if text_pages_with_substance >= 2:
                logger.info(f"PDF detected as TYPED (text_pages={text_pages_with_substance}, "
                            f"chars={total_chars}, words={word_count})")
                return "text"

            # Even 1 page with decent text + overall volume check
            if text_pages_with_substance >= 1 and total_chars > 500 and word_count >= 30:
                logger.info(f"PDF detected as TYPED (borderline: text_pages={text_pages_with_substance}, "
                            f"chars={total_chars}, words={word_count})")
                return "text"

            # Check for OCR garble patterns in whatever text was extracted
            if total_chars > 0:
                first_page_text = doc[0].get_text() or ""
                garble_patterns = [
                    r"SUPRESME", r"0LPAKISTAN", r"tsuPBMt", r"tSujPBMt",
                    r"COURI\b", r"COUR1\b", r"JUR1SD1CT1ON",
                ]
                garble_count = sum(
                    1 for pat in garble_patterns
                    if re.search(pat, first_page_text, re.I)
                )
                if garble_count >= 1:
                    logger.info(f"PDF detected as SCANNED (garbled text patterns found: {garble_count})")
                    return "scanned"

            # Simple threshold fallback
            if total_chars > 100 and word_count >= 15:
                logger.info(f"PDF detected as TYPED (fallback: chars={total_chars}, words={word_count})")
                return "text"

            logger.info(f"PDF detected as SCANNED (chars={total_chars}, words={word_count})")
            return "scanned"

    except Exception as e:
        logger.error(f"PDF detection error: {e}")
        return "scanned"  # Default to scanned if uncertain
