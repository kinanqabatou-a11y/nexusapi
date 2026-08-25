"""
Standalone seed script — populates the database with initial data.
Run: python -m scripts.seed
"""

import asyncio
import os
import sys
from pathlib import Path

import bcrypt
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.db.database import Base  # noqa: E402
from app.models.user import User  # noqa: E402
from app.models.plan import Plan  # noqa: E402
from app.models.api_key import APIKey  # noqa: E402

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://autoapi_user:autoapi_password@localhost:5432/autoapi_db",
)

engine = create_async_engine(DATABASE_URL, echo=False)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


async def seed_plans(session: AsyncSession):
    plans = [
        Plan(
            name="free",
            display_name="Free",
            price_cents=0,
            requests_per_day=100,
            rate_limit_per_minute=10,
        ),
        Plan(
            name="starter",
            display_name="Starter",
            price_cents=2900,
            requests_per_day=5000,
            rate_limit_per_minute=60,
        ),
        Plan(
            name="pro",
            display_name="Professional",
            price_cents=9900,
            requests_per_day=50000,
            rate_limit_per_minute=300,
        ),
        Plan(
            name="enterprise",
            display_name="Enterprise",
            price_cents=29900,
            requests_per_day=-1,
            rate_limit_per_minute=1000,
        ),
    ]

    for plan in plans:
        existing = await session.execute(
            __import__("sqlalchemy").select(Plan).where(Plan.name == plan.name)
        )
        if not existing.scalars().first():
            session.add(plan)

    await session.commit()
    print("✓ Plans seeded")


async def seed_admin(session: AsyncSession):
    email = "admin@autoapi.dev"
    existing = await session.execute(
        __import__("sqlalchemy").select(User).where(User.email == email)
    )
    if existing.scalars().first():
        print("✓ Admin user already exists")
        return

    admin = User(
        email=email,
        hashed_password=hash_password("Admin123!"),
        full_name="Admin User",
        is_active=True,
        is_superuser=True,
    )
    session.add(admin)
    await session.commit()
    await session.refresh(admin)

    key = APIKey(
        user_id=admin.id,
        name="default",
        key="ak_" + os.urandom(32).hex(),
        is_active=True,
    )
    session.add(key)
    await session.commit()
    print(f"✓ Admin user created ({email})")
    print(f"  API key: {key.key}")


async def main():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        await seed_plans(session)
        await seed_admin(session)

    await engine.dispose()
    print("\nSeeding complete.")


if __name__ == "__main__":
    asyncio.run(main())
