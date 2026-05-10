from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any
from uuid import UUID

class ScoreSubmit(BaseModel):
    distance: float
    coins: int
    mode: str

class ScoreResponse(BaseModel):
    id: Optional[UUID] = None
    username: str
    distance: float
    coins: int
    final_score: int
    rank: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True
