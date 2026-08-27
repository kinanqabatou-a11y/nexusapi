from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from sqlalchemy import text
from app.core.config import settings

if "sqlite" in settings.DATABASE_URL:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.APP_DEBUG,
        connect_args={
            "timeout": 30,
            "check_same_thread": False,
        },
    )
else:
    engine = create_async_engine(settings.DATABASE_URL, echo=settings.APP_DEBUG, pool_size=20, max_overflow=10)

async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


async def get_db() -> AsyncSession:
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db():
    if "sqlite" in settings.DATABASE_URL:
        async with engine.connect() as conn:
            await conn.execute(text("PRAGMA journal_mode=WAL"))
            await conn.execute(text("PRAGMA busy_timeout=30000"))
            await conn.execute(text("PRAGMA synchronous=NORMAL"))
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
