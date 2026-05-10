from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Uuid
from sqlalchemy.sql import func
import uuid

from database import Base

class Score(Base):
    __tablename__ = "scores"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    distance = Column(Float, nullable=False)
    coins = Column(Integer, nullable=False)
    mode = Column(String, nullable=False)
    final_score = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
