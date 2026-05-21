from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class DocumentResponse(BaseModel):
    id: int
    file_name: str
    upload_status: str
    processing_status: str
    total_chunks: Optional[int] = None
    uploaded_at: datetime
    processed_at: Optional[datetime] = None
    error_message: Optional[str] = None

    class Config:
        from_attributes = True

class ChunkItem(BaseModel):
    point_id: int
    chunk_id: Optional[int] = None
    chunk_text: str
    file_name: str

class DocumentChunksResponse(BaseModel):
    document_id: int
    file_name: str
    total_chunks_stored: int
    chunks: List[ChunkItem]

class ResyncResponse(BaseModel):
    message: str
    document_id: int
    file_name: str
    total_chunks: int
