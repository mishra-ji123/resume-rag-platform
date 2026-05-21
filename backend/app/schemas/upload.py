from pydantic import BaseModel
from typing import List

class SampleChunk(BaseModel):
    chunk_number: int
    chunk_length: int
    chunk_text: str

class UploadResponse(BaseModel):
    filename: str
    characters_extracted: int
    total_chunks: int
    sample_chunks: List[SampleChunk]
    embedding_dimension: int
    processing_status: str
    first_embedding_preview: List[float]

class UploadErrorResponse(BaseModel):
    error: str
