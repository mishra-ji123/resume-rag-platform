from fastapi import FastAPI
from app.api import upload

from app.core.database import engine, Base
from app.models.document import Document


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Resume RAG Backend")

app.include_router(upload.router)


@app.get("/")
def home():
    return {"message": "Resume RAG Backend Running"}