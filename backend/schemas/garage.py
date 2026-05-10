from pydantic import BaseModel

class CarUpgrade(BaseModel):
    car_id: str
    stat: str  # "speed", "nitro", "brake"

class CarUnlock(BaseModel):
    car_id: str

class CarColor(BaseModel):
    car_id: str
    color: str

class UserCarResponse(BaseModel):
    car_id: str
    speed_upgrade: int
    nitro_upgrade: int
    brake_upgrade: int
    color: str
    is_active: bool

    class Config:
        from_attributes = True
