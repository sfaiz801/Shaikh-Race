from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List

from database import get_db
from models.user import User
from models.garage import UserCar
from schemas.garage import CarUpgrade, CarUnlock, CarColor, UserCarResponse
from utils.auth import get_current_user

router = APIRouter()

@router.get("/cars", response_model=List[UserCarResponse])
async def get_user_cars(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(UserCar).where(UserCar.user_id == current_user.id))
    return result.scalars().all()

@router.post("/unlock")
async def unlock_car(request: CarUnlock, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Check if already unlocked
    result = await db.execute(select(UserCar).where((UserCar.user_id == current_user.id) & (UserCar.car_id == request.car_id)))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Car already unlocked")

    # In a real app, we'd fetch car costs from a static data config
    # For now, we'll just check if they have enough coins (dummy logic)
    unlock_cost = 500 
    if current_user.coins < unlock_cost:
        raise HTTPException(status_code=400, detail="Not enough coins")

    current_user.coins -= unlock_cost
    new_car = UserCar(user_id=current_user.id, car_id=request.car_id)
    db.add(new_car)
    await db.commit()
    return {"status": "unlocked", "car_id": request.car_id}

@router.post("/upgrade")
async def upgrade_car(request: CarUpgrade, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(UserCar).where((UserCar.user_id == current_user.id) & (UserCar.car_id == request.car_id)))
    car = result.scalar_one_or_none()
    
    if not car:
        raise HTTPException(status_code=404, detail="Car not found in garage")

    upgrade_cost = 100
    if current_user.coins < upgrade_cost:
        raise HTTPException(status_code=400, detail="Not enough coins")

    if request.stat == "speed":
        if car.speed_upgrade >= 5: raise HTTPException(status_code=400, detail="Max level reached")
        car.speed_upgrade += 1
    elif request.stat == "nitro":
        if car.nitro_upgrade >= 5: raise HTTPException(status_code=400, detail="Max level reached")
        car.nitro_upgrade += 1
    elif request.stat == "brake":
        if car.brake_upgrade >= 5: raise HTTPException(status_code=400, detail="Max level reached")
        car.brake_upgrade += 1
    
    current_user.coins -= upgrade_cost
    await db.commit()
    return {"status": "upgraded", "stat": request.stat, "level": getattr(car, f"{request.stat}_upgrade")}

@router.post("/set-color")
async def set_car_color(request: CarColor, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    await db.execute(
        update(UserCar)
        .where((UserCar.user_id == current_user.id) & (UserCar.car_id == request.car_id))
        .values(color=request.color)
    )
    await db.commit()
    return {"status": "color_updated"}

@router.post("/set-active")
async def set_active_car(car_id: str, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Set all other cars to inactive
    await db.execute(update(UserCar).where(UserCar.user_id == current_user.id).values(is_active=False))
    # Set chosen car to active
    await db.execute(update(UserCar).where((UserCar.user_id == current_user.id) & (UserCar.car_id == car_id)).values(is_active=True))
    await db.commit()
    return {"status": "active_car_set"}
