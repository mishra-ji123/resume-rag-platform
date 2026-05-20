from fastapi import APIRouter

from app.schemas.search import SearchRequest
from app.services.qdrant_service import search_similar_chunks

router = APIRouter(
    tags=["Search"]
)


@router.post("/")
def search_resumes(request: SearchRequest):

    results = search_similar_chunks(request.query, limit=request.limit)


    response = []

    for result in results:
        response.append({
            "file_name": result.payload["file_name"],
            "chunk_text": result.payload["chunk_text"],
            "score": result.score
        })

    return response