import os
from app.utils.pdf_extractor import extract_text_from_pdf
from app.utils.chunk_text import chunk_text
from app.utils.embedding_utils import generate_embeddings

UPLOAD_DIR = "app/uploads/resumes"

def save_uploaded_file(file_content: bytes, filename: str) -> str:
    """
    Saves binary file contents to the local filesystem and returns the saved file path.
    """
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as f:
        f.write(file_content)
    return file_path

def process_document(file_path: str):
    """
    Reads a document from a local path, extracts text, chunks it, and generates embeddings.
    Returns:
        tuple: (extracted_text, chunks_list, embeddings_list)
    """
    text = extract_text_from_pdf(file_path)
    chunks = chunk_text(text)
    
    # Generate embeddings if text was extracted
    embeddings = []
    if chunks:
        embeddings = generate_embeddings(chunks)
        
    return text, chunks, embeddings
