from fastapi import FastAPI

from app.api import upload

from app.core.database import engine, Base
from app.models.document import Document

from app.services.qdrant_service import create_collection


Base.metadata.create_all(bind=engine)

create_collection()


app = FastAPI(title="Resume RAG Backend")

app.include_router(
    upload.router,
    prefix="/api/v1/upload",
    tags=["Upload"]
)


@app.get("/")
def home():
    return {"message": "Resume RAG Backend Running"}