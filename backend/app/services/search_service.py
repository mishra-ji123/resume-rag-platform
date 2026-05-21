from app.utils.embedding_utils import generate_embeddings
from app.services.qdrant_service import search_embeddings

def search_resumes_logic(query: str, limit: int = 5):
    """
    Encodes the query string and queries the Qdrant vector database.
    """
    # encode input query (generate_embeddings takes a list and returns a list of embeddings)
    query_vector = generate_embeddings([query])[0]
    points = search_embeddings(query_vector, limit=limit)
    
    results = []
    for point in points:
        results.append({
            "file_name": point.payload.get("file_name", "Unknown"),
            "chunk_text": point.payload.get("chunk_text", ""),
            "score": point.score
        })
    return results
