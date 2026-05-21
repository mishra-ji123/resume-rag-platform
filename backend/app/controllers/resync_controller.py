import os
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.services.document_service import get_document_by_id, update_document_processing, update_document_success, update_document_failed
from app.services.upload_service import process_document
from app.services.qdrant_service import delete_embeddings_by_doc_id, store_embeddings

def handle_resync(doc_id: int, db: Session):
    """
    Orchestrates the document re-synchronization pipeline.
    """
    doc = get_document_by_id(db, doc_id)
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")

    # Check file exists on disk
    if not doc.file_path or not os.path.exists(doc.file_path):
        update_document_failed(db, doc.id, "File not found on disk")
        raise HTTPException(status_code=400, detail="File not found on disk")

    # Set status to processing
    update_document_processing(db, doc.id)

    try:
        # Extract text, chunk and generate new embeddings
        text, chunks, embeddings = process_document(doc.file_path)

        if not text.strip():
            raise Exception("No readable text found in PDF file")

        # Delete old embeddings to avoid duplicates
        delete_embeddings_by_doc_id(doc.id)

        # Store new embeddings
        store_embeddings(doc.id, doc.file_name, chunks, embeddings)

        # Update SQL metadata with success state
        update_document_success(db, doc.id, len(chunks))

        return {
            "message": "Document resynced successfully",
            "document_id": doc.id,
            "file_name": doc.file_name,
            "total_chunks": len(chunks)
        }

    except Exception as proc_err:
        update_document_failed(db, doc.id, str(proc_err))
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(proc_err)}")
