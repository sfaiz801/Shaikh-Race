from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, Uuid
from sqlalchemy.sql import func
import uuid

from database import Base

class UserCar(Base):
    __tablename__ = "user_cars"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    car_id = Column(String, nullable=False)
    speed_upgrade = Column(Integer, default=0)
    nitro_upgrade = Column(Integer, default=0)
    brake_upgrade = Column(Integer, default=0)
    color = Column(String, default="#ffffff")
    is_active = Column(Boolean, default=False)
    unlocked_at = Column(DateTime(timezone=True), server_default=func.now())
