from fastapi import UploadFile
from sqlalchemy.orm import Session
from app.services.upload_service import save_uploaded_file, process_document
from app.services.document_service import create_document_metadata, update_document_success, update_document_failed
from app.services.qdrant_service import store_embeddings

async def handle_upload(file: UploadFile, db: Session):
    """
    Orchestrates the resume upload flow: saves file locally, creates SQL record,
    processes document (extract/chunk/embed), stores in Qdrant, and updates SQL status.
    """
    filename = file.filename
    file_content = await file.read()

    if not file_content:
        return {"error": "No file content received"}

    # Save locally
    file_path = save_uploaded_file(file_content, filename)

    # Insert metadata DB record immediately
    doc = create_document_metadata(db, filename, file_path)

    try:
        # Extract text, chunk, and embed
        text, chunks, embeddings = process_document(file_path)

        # Store in Qdrant
        store_embeddings(doc.id, filename, chunks, embeddings)

        # Update metadata DB state to success
        update_document_success(db, doc.id, len(chunks))

        # Format chunk previews for response
        chunk_preview = []
        for i, chunk in enumerate(chunks[:3]):
            chunk_preview.append({
                "chunk_number": i + 1,
                "chunk_length": len(chunk),
                "chunk_text": chunk
            })

        # Return formatted response dict
        return {
            "filename": filename,
            "characters_extracted": len(text),
            "total_chunks": len(chunks),
            "sample_chunks": chunk_preview,
            "embedding_dimension": len(embeddings[0]) if len(embeddings) > 0 else 0,
            "processing_status": "SUCCESS",
            "first_embedding_preview": embeddings[0][:10].tolist() if len(embeddings) > 0 else []
        }

    except Exception as e:
        # Record failure state
        update_document_failed(db, doc.id, str(e))
        return {
            "error": str(e)
        }
