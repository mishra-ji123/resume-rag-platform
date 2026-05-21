from fastapi import APIRouter
from app.schemas.search import SearchRequest
from app.controllers import search_controller

router = APIRouter()

@router.post("/")
def search_resumes(request: SearchRequest):
    """
    Endpoint for performing semantic similarity searches. Thin routing layer that delegates to search_controller.
    """
    return search_controller.handle_search(request)
