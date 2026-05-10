from pydantic import BaseModel
from uuid import UUID

class UserProfile(BaseModel):
    id: UUID
    username: str
    xp: int
    coins: int
    level: int

    class Config:
        from_attributes = True

class UpdateCoins(BaseModel):
    amount: int

class UpdateXP(BaseModel):
    amount: int
