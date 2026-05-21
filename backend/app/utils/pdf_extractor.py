import pdfplumber

def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract text content from a PDF file using pdfplumber.
    """
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
    return text
