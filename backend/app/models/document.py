from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.core.database import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    file_name = Column(String(255))
    file_path = Column(String(500))

    upload_status = Column(String(50), default="SUCCESS")

    processing_status = Column(
        String(50),
        default="PENDING"
    )

    total_chunks = Column(Integer, nullable=True)

    uploaded_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    processed_at = Column(
        DateTime,
        nullable=True
    )

    error_message = Column(
        String(1000),
        nullable=True
    )