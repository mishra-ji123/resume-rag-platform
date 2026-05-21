from app.schemas.search import SearchRequest
from app.services.search_service import search_resumes_logic

def handle_search(request: SearchRequest):
    """
    Handles request orchestration for similarity search queries.
    """
    return search_resumes_logic(request.query, limit=request.limit)
