from fastapi import APIRouter, UploadFile, File, Depends
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.controllers import upload_controller

router = APIRouter()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/")
async def upload_file(file: UploadFile = File(...), db: Session = Depends(get_db)):
    """
    Endpoint for uploading a resume. Thin routing layer that delegates to the controller.
    """
    return await upload_controller.handle_upload(file, db)
