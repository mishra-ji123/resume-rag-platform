from fastapi import APIRouter, UploadFile, File
import pdfplumber
import os
from sentence_transformers import SentenceTransformer
from datetime import datetime

from app.core.database import SessionLocal
from app.models.document import Document
from app.services.qdrant_service import store_embeddings

router = APIRouter(
    tags=["Upload"]
)

UPLOAD_DIR = "app/uploads/resumes"
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

    db = SessionLocal()

    file_path = os.path.join(UPLOAD_DIR, file.filename)

    # Save file locally
    with open(file_path, "wb") as f:
        f.write(await file.read())

    # Insert DB row immediately
    doc = Document(
        file_name=file.filename,
        file_path=file_path,
        upload_status="SUCCESS",
        processing_status="PROCESSING",
        uploaded_at=datetime.utcnow()
    )

    db.add(doc)
    db.commit()
    db.refresh(doc)

    try:

        # ----------------------------
        # Extract text from PDF
        # ----------------------------
        text = ""

        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:

                page_text = page.extract_text()

                if page_text:
                    text += page_text + "\n"

        # ----------------------------
        # Create chunks
        # ----------------------------
        chunks = chunk_text(text)

        # ----------------------------
        # Generate embeddings
        # ----------------------------
        embeddings = model.encode(chunks)


        store_embeddings(
    doc.id,
    file.filename,
    chunks,
    embeddings
)

        # ----------------------------
        # Update DB after success
        # ----------------------------
        doc.processing_status = "SUCCESS"
        doc.total_chunks = len(chunks)
        doc.processed_at = datetime.utcnow()

        db.commit()

        # Label chunks clearly
        chunk_preview = []

        for i, chunk in enumerate(chunks[:3]):
            chunk_preview.append({
                "chunk_number": i + 1,
                "chunk_length": len(chunk),
                "chunk_text": chunk
            })

        return {
            "filename": file.filename,
            "characters_extracted": len(text),
            "total_chunks": len(chunks),
            "sample_chunks": chunk_preview,
            "embedding_dimension": len(embeddings[0]),
            "processing_status": doc.processing_status,
            "first_embedding_preview": embeddings[0][:10].tolist()
        }

    except Exception as e:

        doc.processing_status = "FAILED"
        doc.error_message = str(e)

        db.commit()

        return {
            "error": str(e)
        }

    finally:
        db.close()