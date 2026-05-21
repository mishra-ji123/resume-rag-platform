from fastapi import FastAPI

from app.api.v1.routes import upload, search, resume
from app.core.database import engine, Base
from app.models.document import Document

from app.services.qdrant_service import create_collection


from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

create_collection()


app = FastAPI(title="Resume RAG Backend")

# Enable CORS for frontend API calls
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    upload.router,
    prefix="/api/v1/upload",
    tags=["Upload"]
)

app.include_router(
    search.router,
    prefix="/api/v1/search",
    tags=["Search"]
)

app.include_router(
    resume.router,
    prefix="/api/v1/resume",
    tags=["Resume"]
)


@app.get("/")
def home():
    return {"message": "Resume RAG Backend Running"}