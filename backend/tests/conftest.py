import asyncio
import json
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import select

from app.db.database import Base, get_db
from app.main import app
from app.models import User, Plan, Subscription, ApiKey
from app.core.security import (
    get_password_hash,
    create_access_token,
    create_refresh_token,
    generate_api_key,
    create_api_key_hash,
)

TEST_DATABASE_URL = "sqlite+aiosqlite:///file::memory:?cache=shared&uri=true"

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
TestSessionLocal = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture(scope="session")
def event_loop():
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(autouse=True)
async def setup_database():
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)


@pytest_asyncio.fixture
async def test_db():
    async with TestSessionLocal() as session:
        yield session


async def override_get_db():
    async with TestSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


app.dependency_overrides[get_db] = override_get_db


@pytest_asyncio.fixture
async def test_client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://testserver") as client:
        yield client


async def _seed_plans(db: AsyncSession):
    existing = await db.execute(select(Plan))
    if existing.scalars().first():
        return
    plans = [
        Plan(
            name="Free",
            slug="free",
            description="Perfecto para empezar",
            price_monthly=0,
            request_limit=500,
            api_key_limit=1,
            features=json.dumps(["500 requests/mes", "1 API Key", "Document API"]),
            sort_order=1,
        ),
        Plan(
            name="Basic",
            slug="basic",
            description="Para pequenas empresas",
            price_monthly=9,
            request_limit=5000,
            api_key_limit=5,
            features=json.dumps(["5.000 requests/mes", "5 API Keys", "Document API"]),
            sort_order=2,
        ),
        Plan(
            name="Pro",
            slug="pro",
            description="Para empresas en crecimiento",
            price_monthly=29,
            request_limit=25000,
            api_key_limit=20,
            features=json.dumps(["25.000 requests/mes", "20 API Keys", "Todas las APIs"]),
            sort_order=3,
        ),
        Plan(
            name="Business",
            slug="business",
            description="Para grandes empresas",
            price_monthly=79,
            request_limit=100000,
            api_key_limit=999,
            features=json.dumps(["100.000 requests/mes", "API Keys ilimitadas"]),
            sort_order=4,
        ),
    ]
    db.add_all(plans)
    await db.commit()


@pytest_asyncio.fixture
async def test_user(test_db: AsyncSession):
    await _seed_plans(test_db)

    email = "test@example.com"
    password = "TestPass123!"

    result = await test_db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    if existing:
        return {"user": existing, "password": password}

    user = User(
        email=email,
        first_name="Test",
        last_name="User",
        hashed_password=get_password_hash(password),
        role="user",
        is_active=True,
        is_verified=True,
    )
    test_db.add(user)
    await test_db.flush()

    free_plan = (await test_db.execute(select(Plan).where(Plan.slug == "free"))).scalar_one()
    sub = Subscription(
        user_id=user.id,
        plan_id=free_plan.id,
        status="active",
    )
    test_db.add(sub)
    await test_db.commit()
    await test_db.refresh(user)

    return {"user": user, "password": password}


@pytest_asyncio.fixture
async def auth_headers(test_user) -> dict:
    user = test_user["user"]
    token = create_access_token(data={"sub": user.id})
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def test_admin(test_db: AsyncSession):
    await _seed_plans(test_db)

    email = "admin@example.com"
    password = "AdminPass123!"

    result = await test_db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    if existing:
        return {"user": existing, "password": password}

    user = User(
        email=email,
        first_name="Admin",
        last_name="User",
        hashed_password=get_password_hash(password),
        role="admin",
        is_active=True,
        is_verified=True,
    )
    test_db.add(user)
    await test_db.commit()
    await test_db.refresh(user)

    return {"user": user, "password": password}


@pytest_asyncio.fixture
async def admin_headers(test_admin) -> dict:
    user = test_admin["user"]
    token = create_access_token(data={"sub": user.id})
    return {"Authorization": f"Bearer {token}"}


@pytest_asyncio.fixture
async def test_api_key(test_db: AsyncSession, test_user) -> dict:
    user = test_user["user"]
    raw_key = generate_api_key()
    key_hash = create_api_key_hash(raw_key)
    key_prefix = raw_key[:20] + "..."

    api_key = ApiKey(
        user_id=user.id,
        name="Test Key",
        key_prefix=key_prefix,
        key_hash=key_hash,
        is_active=True,
    )
    test_db.add(api_key)
    await test_db.commit()
    await test_db.refresh(api_key)

    return {"api_key": api_key, "raw_key": raw_key}
