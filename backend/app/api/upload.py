from fastapi import APIRouter, UploadFile, File
import pdfplumber
import os
from sentence_transformers import SentenceTransformer

router = APIRouter(
    prefix="/upload",
    tags=["Upload"]
)

UPLOAD_DIR = "app/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


model = SentenceTransformer("all-MiniLM-L6-v2")

# ----------------------------
# Chunking Function
# ----------------------------
def chunk_text(text, chunk_size=1000, overlap=200):
    chunks = []

    start = 0

    while start < len(text):

        end = start + chunk_size

        chunk = text[start:end]

        chunks.append(chunk)

        start += chunk_size - overlap

    return chunks


@router.post("/")
async def upload_file(file: UploadFile = File(...)):

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save file
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Extract text
    text = ""

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()

            if page_text:
                text += page_text + "\n"

    # Chunk text
    chunks = chunk_text(text)

    embeddings = model.encode(chunks)

    return {
          "filename": file.filename,
        "characters_extracted": len(text),
        "total_chunks": len(chunks),
        "embedding_dimension": len(embeddings[0]),
        "first_embedding_preview": embeddings[0][:10].tolist()
    }