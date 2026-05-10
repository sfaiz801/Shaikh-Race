from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List
import json

from config import settings
from routers import auth, user, garage, leaderboard
from database import engine, Base

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create tables on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield

app = FastAPI(title="Shaikh Race API", version="1.0.0", lifespan=lifespan)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health Check
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Router inclusion
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(user.router, prefix="/user", tags=["User"])
app.include_router(garage.router, prefix="/garage", tags=["Garage"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])

from utils.websocket import manager

@app.websocket("/ws/leaderboard")
async def websocket_leaderboard(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # We don't necessarily need to receive data from client
            # but we keep the connection open to broadcast updates
            data = await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
