from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timedelta

from database import get_db
from models.user import User
from models.daily_reward import DailyReward
from schemas.user import UserProfile, UpdateCoins, UpdateXP
from utils.auth import get_current_user

router = APIRouter()

@router.get("/profile", response_model=UserProfile)
async def get_profile(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/update-coins")
async def update_coins(request: UpdateCoins, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.coins += request.amount
    if current_user.coins < 0:
        current_user.coins = 0
    await db.commit()
    return {"coins": current_user.coins}

@router.post("/update-xp")
async def update_xp(request: UpdateXP, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    current_user.xp += request.amount
    
    # Simple level up logic: level = floor(xp / 1000) + 1
    new_level = (current_user.xp // 1000) + 1
    leveled_up = new_level > current_user.level
    current_user.level = new_level
    
    await db.commit()
    return {"xp": current_user.xp, "level": current_user.level, "leveled_up": leveled_up}

@router.get("/daily-reward")
async def claim_daily_reward(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    result = await db.execute(select(DailyReward).where(DailyReward.user_id == current_user.id))
    reward_record = result.scalar_one_or_none()
    
    now = datetime.utcnow()
    reward_amount = 50
    
    if reward_record:
        if now - reward_record.last_claimed < timedelta(days=1):
            return {"reward": 0, "streak": reward_record.streak_count, "already_claimed": True}
        
        # Check if streak is broken (more than 48 hours)
        if now - reward_record.last_claimed > timedelta(days=2):
            reward_record.streak_count = 1
        else:
            reward_record.streak_count += 1
            
        reward_record.last_claimed = now
    else:
        reward_record = DailyReward(user_id=current_user.id, last_claimed=now, streak_count=1)
        db.add(reward_record)

    current_user.coins += reward_amount
    await db.commit()
    
    return {"reward": reward_amount, "streak": reward_record.streak_count, "already_claimed": False}
