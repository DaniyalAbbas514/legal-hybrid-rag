import re
import shutil
from pathlib import Path

import cv2
import easyocr
import fitz
import numpy as np
from loguru import logger
from PIL import Image
import pytesseract

# Configure Tesseract path for Windows
_TESSERACT_PATHS = [
    r"C:\Program Files\Tesseract-OCR\tesseract.exe",
    r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
]

for _path in _TESSERACT_PATHS:
    if Path(_path).exists():
        pytesseract.pytesseract.tesseract_cmd = _path
        break


def _uploads_dir() -> Path:
    return Path(__file__).resolve().parents[2] / "uploads"


def _preprocess_image_for_ocr(img_path: str) -> Image.Image:
    """Apply standard image binarization for clean OCR."""
    img = cv2.imread(img_path)
    if img is None:
        return Image.open(img_path)

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    height, width = gray.shape
    if height < 2000:
        scale_factor = 2.0
        gray = cv2.resize(
            gray,
            None,
            fx=scale_factor,
            fy=scale_factor,
            interpolation=cv2.INTER_CUBIC,
        )

    denoised = cv2.fastNlMeansDenoising(gray, h=10, templateWindowSize=7, searchWindowSize=21)
    binary = cv2.adaptiveThreshold(
        denoised, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        blockSize=15,
        C=8,
    )
    return Image.fromarray(binary)


def _ocr_first_page(pdf_path: str, temp_id: str) -> str:
    """Render page 1 to an image and run OCR."""
    ocr_dir = _uploads_dir() / f"ocr_val_tmp_{temp_id}"
    ocr_dir.mkdir(parents=True, exist_ok=True)
    img_path = ocr_dir / "page_1.png"

    try:
        with fitz.open(pdf_path) as doc:
            if len(doc) == 0:
                return ""
            page = doc[0]
            pix = page.get_pixmap(dpi=300)
            pix.save(str(img_path))

        text = ""
        # Try Tesseract
        try:
            processed_img = _preprocess_image_for_ocr(str(img_path))
            text = pytesseract.image_to_string(
                processed_img,
                lang="eng",
                config="--oem 3 --psm 6",
            )
            if len(text.strip()) < 50:
                with Image.open(img_path) as raw_img:
                    raw_text = pytesseract.image_to_string(
                        raw_img,
                        lang="eng",
                        config="--oem 3 --psm 6",
                    )
                if len(raw_text.strip()) > len(text.strip()):
                    text = raw_text
        except Exception as e:
            logger.warning(f"Tesseract failed on validation OCR: {e}. Trying EasyOCR fallback.")
            try:
                reader = easyocr.Reader(["en"], gpu=False)
                result = reader.readtext(str(img_path), detail=0)
                text = " ".join(result)
            except Exception as e2:
                logger.error(f"EasyOCR also failed on validation OCR: {e2}")

        return text
    finally:
        shutil.rmtree(ocr_dir, ignore_errors=True)


def validate_judgment(pdf_path: str) -> tuple[bool, str]:
    """
    Checks if the PDF is a Pakistan Supreme Court judgment.
    Looks at the first page for court indicators (digital or OCR).
    Returns (is_valid: bool, message: str)
    """
    try:
        # Check if file exists and is not empty
        p_path = Path(pdf_path)
        if not p_path.exists() or p_path.stat().st_size == 0:
            return False, "Uploaded file is empty or missing."

        # Extract digital text from first page
        first_page_text = ""
        with fitz.open(pdf_path) as doc:
            if len(doc) == 0:
                return False, "PDF document contains no pages."
            first_page_text = doc[0].get_text("text") or ""

        # If digital text is missing/too short, run OCR on first page
        if len(first_page_text.strip()) < 80:
            logger.info(f"Digital text on page 1 too short ({len(first_page_text)} chars). Running OCR for validation.")
            temp_id = p_path.stem
            first_page_text = _ocr_first_page(pdf_path, temp_id)

        # Normalize text for checking
        normalized = re.sub(r"\s+", " ", first_page_text.lower()).strip()
        logger.debug(f"Normalized validation text: {normalized[:300]}")

        # Define keywords matching Pakistan Supreme Court
        court_patterns = [
            r"supreme\s*court",
            r"supresme",
            r"suprime",
            r"supremecourt",
            r"tsupbmt",
            r"tsujpbmt",
            r"s\s*u\s*p\s*r\s*e\s*m\s*e",
        ]
        pakistan_patterns = [
            r"pakistan",
            r"0lpakistan",
            r"0fpakistan",
            r"0f\s*pakistan",
            r"p\s*a\s*k\s*i\s*s\s*t\s*a\s*n",
        ]

        has_court = any(re.search(pat, normalized) for pat in court_patterns)
        has_pakistan = any(re.search(pat, normalized) for pat in pakistan_patterns)

        if has_court and has_pakistan:
            logger.info("PDF validated successfully as a Pakistan Supreme Court judgment.")
            return True, ""

        logger.warning("PDF validation failed: does not appear to be a Pakistan Supreme Court judgment.")
        return False, "The uploaded PDF is not a Pakistan Supreme Court judgment."

    except Exception as e:
        logger.exception(f"Error validating PDF judgment: {e}")
        return False, f"Failed to validate PDF judgment: {e}"
