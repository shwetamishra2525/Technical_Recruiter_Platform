import fitz

def test_pdf():
    try:
        # Create a tiny valid PDF in memory
        doc = fitz.open()
        page = doc.new_page()
        page.insert_text((50, 50), "This is a test job description")
        pdf_bytes = doc.write()
        doc.close()

        # Try to read it using stream
        with fitz.open(stream=pdf_bytes, filetype="pdf") as doc_in:
            text = ""
            for page in doc_in:
                text += page.get_text()
            print("Extracted:", text)
            
    except Exception as e:
        print(f"Extraction Error: {e}")

if __name__ == "__main__":
    test_pdf()
