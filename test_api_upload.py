import requests
import io
import sys

URL = "http://localhost:5000/api/admin/upload"

def main():
    print("Testing API Upload Endpoint Validation...")

    # 1. Test uploading a non-PDF file extension (.txt)
    print("\n1. Uploading file with invalid extension (test.txt)...")
    files = {"file": ("test.txt", io.BytesIO(b"Hello World"), "text/plain")}
    try:
        r = requests.post(URL, files=files)
        print(f"Status Code: {r.status_code}")
        print(f"Response: {r.json()}")
        assert r.status_code == 400, "Expected 400 Bad Request for invalid extension"
        assert "Only PDF files are allowed." in r.json()["detail"]
        print("Success: Rejected invalid extension.")
    except Exception as e:
        print(f"Error connecting to server: {e}")
        print("Make sure the backend dev server is running on port 5000.")
        sys.exit(1)

    # 2. Test uploading a file named .pdf but without %PDF magic bytes
    print("\n2. Uploading renamed non-PDF file (fake.pdf with text content)...")
    files = {"file": ("fake.pdf", io.BytesIO(b"This is not a PDF file content."), "application/pdf")}
    r = requests.post(URL, files=files)
    print(f"Status Code: {r.status_code}")
    print(f"Response: {r.json()}")
    assert r.status_code == 400, "Expected 400 Bad Request for fake PDF content"
    assert "Only PDF files are allowed." in r.json()["detail"]
    print("Success: Rejected fake PDF content.")

    # 3. Test uploading a valid PDF structure but not a SC judgment
    print("\n3. Uploading valid PDF but not a Pakistan Supreme Court judgment...")
    # Generate a simple valid PDF in memory
    import fitz
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((50, 50), "This is a random document about biology and genetics.")
    pdf_bytes = doc.write()
    doc.close()

    files = {"file": ("not_judgment.pdf", io.BytesIO(pdf_bytes), "application/pdf")}
    r = requests.post(URL, files=files)
    print(f"Status Code: {r.status_code}")
    print(f"Response: {r.json()}")
    assert r.status_code == 400, "Expected 400 Bad Request for non-SC judgment"
    assert "The uploaded PDF is not a Pakistan Supreme Court judgment." in r.json()["detail"]
    print("Success: Rejected non-SC judgment PDF.")

    print("\nAPI Upload Endpoint validation tests completed successfully!")

if __name__ == "__main__":
    main()
