from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.services.document_service import get_all_documents, get_document_by_id
from app.services.qdrant_service import get_chunks_by_doc_id

def handle_list_documents(db: Session):
    """
    Orchestrates fetching all documents from the DB and returns basic details.
    """
    documents = get_all_documents(db)
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

def handle_get_document_chunks(doc_id: int, db: Session):
    """
    Orchestrates verifying document metadata in MySQL, scrolling matching points from Qdrant,
    sorting them, and returning the ordered collection.
    """
    doc = get_document_by_id(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
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
        
    # Sort chunks by chunk_id
    chunks.sort(key=lambda x: x["chunk_id"] if x["chunk_id"] is not None else 0)
    
    return {
        "document_id": doc.id,
        "file_name": doc.file_name,
        "total_chunks_stored": len(chunks),
        "chunks": chunks
    }
