from pydantic import BaseModel


class SearchRequest(BaseModel):
    query: str
    limit: int = 3



class SearchResult(BaseModel):
    file_name: str
    chunk_text: str
    score: float