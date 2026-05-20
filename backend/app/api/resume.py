from fastapi import APIRouter, HTTPException
from app.core.database import SessionLocal
from app.models.document import Document
from app.services.qdrant_service import get_chunks_by_doc_id, delete_embeddings_by_doc_id, store_embeddings, model
from app.api.upload import chunk_text
import pdfplumber
import os
from datetime import datetime

router = APIRouter(
    tags=["Resume"]
)


@router.get("/")
def list_documents():
    db = SessionLocal()
    try:
        documents = db.query(Document).all()
        
        response_data = []
        for doc in documents:
            response_data.append({
                "id": doc.id,
                "file_name": doc.file_name,
                "upload_status": doc.upload_status,
                "processing_status": doc.processing_status,
                "total_chunks": doc.total_chunks,
                "uploaded_at": doc.uploaded_at,
                "processed_at": doc.processed_at,
                "error_message": doc.error_message
            })
        return response_data
    finally:
        db.close()


@router.get("/{doc_id}/chunks")
def get_document_chunks(doc_id: int):
    db = SessionLocal()
    try:
        # Check if document exists in database
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")
            
        # Get chunks from Qdrant
        points = get_chunks_by_doc_id(doc_id)
        
        chunks = []
        for point in points:
            payload = point.payload
            chunks.append({
                "point_id": point.id,
                "chunk_id": payload.get("chunk_id"),
                "chunk_text": payload.get("chunk_text"),
                "file_name": payload.get("file_name")
            })
            
        # Sort chunks by chunk_id to keep them in order of appearance in the document
        chunks.sort(key=lambda x: x["chunk_id"] if x["chunk_id"] is not None else 0)
        
        return {
            "document_id": doc.id,
            "file_name": doc.file_name,
            "total_chunks_stored": len(chunks),
            "chunks": chunks
        }
    finally:
        db.close()


@router.post("/{doc_id}/resync")
def resync_document(doc_id: int):
    db = SessionLocal()
    try:
        # 1. Fetch document record from SQL database
        doc = db.query(Document).filter(Document.id == doc_id).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document not found")

        # 2. Check if the PDF file exists on the disk
        if not doc.file_path or not os.path.exists(doc.file_path):
            doc.processing_status = "FAILED"
            doc.error_message = "File not found on disk"
            db.commit()
            raise HTTPException(status_code=400, detail="File not found on disk")

        # Set status to processing
        doc.processing_status = "PROCESSING"
        doc.error_message = None
        db.commit()

        try:
            # 3. Extract text from PDF
            text = ""
            with pdfplumber.open(doc.file_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"

            if not text.strip():
                raise Exception("No readable text found in PDF file")

            # 4. Generate new chunks
            chunks = chunk_text(text)

            # 5. Generate new embeddings
            embeddings = model.encode(chunks)

            # 6. Delete old vector points from Qdrant first (prevent duplicates)
            delete_embeddings_by_doc_id(doc.id)

            # 7. Store new vector points in Qdrant
            store_embeddings(
                doc.id,
                doc.file_name,
                chunks,
                embeddings
            )

            # 8. Update SQL database with success state
            doc.processing_status = "SUCCESS"
            doc.total_chunks = len(chunks)
            doc.processed_at = datetime.utcnow()
            db.commit()

            return {
                "message": "Document resynced successfully",
                "document_id": doc.id,
                "file_name": doc.file_name,
                "total_chunks": len(chunks)
            }

        except Exception as proc_err:
            # If reprocessing fails, record the error in DB
            doc.processing_status = "FAILED"
            doc.error_message = str(proc_err)
            db.commit()
            raise HTTPException(status_code=500, detail=f"Processing failed: {str(proc_err)}")

    finally:
        db.close()


