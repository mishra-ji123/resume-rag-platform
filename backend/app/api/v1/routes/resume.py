from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.controllers import document_controller, resync_controller

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/")
def list_documents(db: Session = Depends(get_db)):
    """
    Endpoint to list all parsed resumes and their metadata.
    """
    return document_controller.handle_list_documents(db)

@router.get("/{doc_id}/chunks")
def get_document_chunks(doc_id: int, db: Session = Depends(get_db)):
    """
    Endpoint to scroll and fetch all vector chunks of a resume.
    """
    return document_controller.handle_get_document_chunks(doc_id, db)

@router.post("/{doc_id}/resync")
def resync_document(doc_id: int, db: Session = Depends(get_db)):
    """
    Endpoint to trigger re-processing and re-indexing of a resume PDF.
    """
    return resync_controller.handle_resync(doc_id, db)
