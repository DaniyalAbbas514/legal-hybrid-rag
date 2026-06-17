from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field

class EmbeddingMapping(BaseModel):
    node_id: str
    file_id: str
    parent_node_id: Optional[str] = None
    level: int
    heading: str
    vector_store: str = "chroma"
    model: str = "BAAI/bge-small-en-v1.5"
    vector_id: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
