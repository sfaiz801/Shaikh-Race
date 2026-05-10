from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from typing import List
import json

from database import get_db
from models.user import User
from models.score import Score
from schemas.score import ScoreSubmit, ScoreResponse
from utils.auth import get_current_user
from utils.websocket import manager 

router = APIRouter()

@router.get("/", response_model=List[ScoreResponse])
async def get_leaderboard(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Score, User.username)
        .join(User, Score.user_id == User.id)
        .order_by(desc(Score.final_score))
        .limit(10)
    )
    
    scores = []
    for score_obj, username in result.all():
        scores.append(ScoreResponse(
            id=score_obj.id,
            username=username,
            distance=score_obj.distance,
            coins=score_obj.coins,
            final_score=score_obj.final_score,
            created_at=score_obj.created_at
        ))
    return scores

@router.post("/submit")
async def submit_score(request: ScoreSubmit, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    final_score = int((request.distance * 10) + (request.coins * 5))
    
    new_score = Score(
        user_id=current_user.id,
        distance=request.distance,
        coins=request.coins,
        mode=request.mode,
        final_score=final_score
    )
    db.add(new_score)
    await db.commit()
    await db.refresh(new_score)

    # Get rank
    rank_result = await db.execute(
        select(Score).where(Score.final_score > final_score)
    )
    rank = len(rank_result.all()) + 1

    # Broadcast update to WebSockets
    # We fetch the new top 10 first
    top_10 = await get_leaderboard(db)
    # Convert ScoreResponse list to JSON serializable list
    top_10_data = [s.model_dump(mode="json") for s in top_10]
    await manager.broadcast(json.dumps({"type": "update", "data": top_10_data}))

    return {"final_score": final_score, "rank": rank}
