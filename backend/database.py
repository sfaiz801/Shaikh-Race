from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from config import settings
import os

# Fallback to SQLite for local development if Postgres is not available
db_url = settings.DATABASE_URL
if not db_url or "localhost" in db_url or "127.0.0.1" in db_url:
    # Check if we should use sqlite
    db_url = "sqlite+aiosqlite:///./shaikhrace.db"

engine = create_async_engine(db_url, echo=True)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
