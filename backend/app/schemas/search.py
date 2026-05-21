from pydantic import BaseModel
from typing import List

class SearchRequest(BaseModel):
    query: str
    limit: int = 3

class SearchResult(BaseModel):
    file_name: str
    chunk_text: str
    score: float