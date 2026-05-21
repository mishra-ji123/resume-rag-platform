from sqlalchemy.orm import Session
from datetime import datetime
from app.models.document import Document

def create_document_metadata(db: Session, file_name: str, file_path: str) -> Document:
    """
    Creates a new Document entry in the MySQL database with processing status.
    """
    doc = Document(
        file_name=file_name,
        file_path=file_path,
        upload_status="SUCCESS",
        processing_status="PROCESSING",
        uploaded_at=datetime.utcnow()
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc

def update_document_success(db: Session, doc_id: int, total_chunks: int) -> Document:
    """
    Updates the document status to SUCCESS and records total chunks and processed time.
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if doc:
        doc.processing_status = "SUCCESS"
        doc.total_chunks = total_chunks
        doc.processed_at = datetime.utcnow()
        db.commit()
        db.refresh(doc)
    return doc

def update_document_failed(db: Session, doc_id: int, error_message: str) -> Document:
    """
    Updates the document status to FAILED and records the error message.
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if doc:
        doc.processing_status = "FAILED"
        doc.error_message = error_message
        db.commit()
        db.refresh(doc)
    return doc

def update_document_processing(db: Session, doc_id: int) -> Document:
    """
    Resets the document status to PROCESSING and clears error messages.
    """
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if doc:
        doc.processing_status = "PROCESSING"
        doc.error_message = None
        db.commit()
        db.refresh(doc)
    return doc

def get_document_by_id(db: Session, doc_id: int) -> Document:
    """
    Retrieves a single Document record by ID.
    """
    return db.query(Document).filter(Document.id == doc_id).first()

def get_all_documents(db: Session) -> list[Document]:
    """
    Retrieves all Document records.
    """
    return db.query(Document).all()
