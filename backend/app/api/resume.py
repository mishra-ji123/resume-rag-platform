from fastapi import APIRouter, HTTPException
from app.core.database import SessionLocal
from app.models.document import Document
from app.services.qdrant_service import get_chunks_by_doc_id

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

