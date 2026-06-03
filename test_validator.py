import sys
from pathlib import Path
import asyncio

# Add backend directory to sys.path
backend_path = Path("c:/Projects/legal-hybrid-rag/backend")
sys.path.append(str(backend_path))

import fitz
from app.ingestion.validator import validate_judgment

def create_invalid_pdf(filename: str):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "This is a contract agreement between two companies in Europe regarding software development. There are no court matters here.")
    doc.save(filename)
    doc.close()

def main():
    # 1. Path to a known valid judgment PDF in uploads
    valid_pdf_path = backend_path / "uploads" / "b4a5017a-f0e3-493b-a35d-62db7edd904c.pdf"
    if not valid_pdf_path.exists():
        print(f"Warning: Expected test judgment PDF at {valid_pdf_path} not found.")
        # Try to find any other PDF in uploads
        pdfs = list((backend_path / "uploads").glob("*.pdf"))
        if pdfs:
            valid_pdf_path = pdfs[0]
            print(f"Using alternate PDF for testing: {valid_pdf_path}")
        else:
            print("No PDF files found in uploads directory to test.")
            return

    # 2. Test valid PDF
    print(f"Testing validation with valid PDF: {valid_pdf_path.name}")
    is_valid, msg = validate_judgment(str(valid_pdf_path))
    print(f"Result -> is_valid: {is_valid}, msg: '{msg}'")
    assert is_valid == True, "Failed to validate a valid judgment PDF!"
    print("Success: Valid PDF correctly identified.\n")

    # 3. Create and test invalid PDF
    invalid_pdf_path = Path("invalid_test_doc.pdf")
    create_invalid_pdf(str(invalid_pdf_path))
    try:
        print(f"Testing validation with invalid PDF: {invalid_pdf_path.name}")
        is_valid, msg = validate_judgment(str(invalid_pdf_path))
        print(f"Result -> is_valid: {is_valid}, msg: '{msg}'")
        assert is_valid == False, "Failed: Invalid PDF was incorrectly marked as valid!"
        print("Success: Invalid PDF correctly rejected.\n")
    finally:
        if invalid_pdf_path.exists():
            invalid_pdf_path.unlink()

if __name__ == "__main__":
    main()
