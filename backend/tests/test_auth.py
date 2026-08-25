import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_register_success(test_client: AsyncClient):
    resp = await test_client.post(
        "/api/v1/auth/register",
        json={
            "email": "newuser@test.com",
            "first_name": "New",
            "last_name": "User",
            "password": "StrongPass123!",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["email"] == "newuser@test.com"
    assert data["first_name"] == "New"
    assert data["role"] == "user"
    assert data["is_active"] is True


async def test_register_duplicate_email(test_client: AsyncClient, test_user):
    resp = await test_client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "first_name": "Dup",
            "last_name": "User",
            "password": "StrongPass123!",
        },
    )
    assert resp.status_code == 409
    data = resp.json()
    assert data["detail"]["success"] is False
    assert data["detail"]["error"]["code"] == "EMAIL_EXISTS"


async def test_register_weak_password(test_client: AsyncClient):
    resp = await test_client.post(
        "/api/v1/auth/register",
        json={
            "email": "weak@test.com",
            "first_name": "Weak",
            "last_name": "User",
            "password": "short",
        },
    )
    assert resp.status_code == 422


async def test_login_success(test_client: AsyncClient, test_user):
    resp = await test_client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": test_user["password"],
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


async def test_login_wrong_password(test_client: AsyncClient, test_user):
    resp = await test_client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "WrongPassword123!",
        },
    )
    assert resp.status_code == 401
    data = resp.json()
    assert data["detail"]["success"] is False
    assert data["detail"]["error"]["code"] == "INVALID_CREDENTIALS"


async def test_login_nonexistent_user(test_client: AsyncClient):
    resp = await test_client.post(
        "/api/v1/auth/login",
        json={
            "email": "nonexistent@test.com",
            "password": "SomePass123!",
        },
    )
    assert resp.status_code == 401
    data = resp.json()
    assert data["detail"]["success"] is False


async def test_get_me_authenticated(test_client: AsyncClient, auth_headers):
    resp = await test_client.get("/api/v1/auth/me", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "test@example.com"
    assert data["first_name"] == "Test"


async def test_get_me_unauthenticated(test_client: AsyncClient):
    resp = await test_client.get("/api/v1/auth/me")
    assert resp.status_code in (401, 403)


async def test_change_password(test_client: AsyncClient, auth_headers, test_user):
    resp = await test_client.post(
        "/api/v1/auth/change-password",
        headers=auth_headers,
        json={
            "current_password": test_user["password"],
            "new_password": "NewStrongPass456!",
        },
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True

    login_resp = await test_client.post(
        "/api/v1/auth/login",
        json={"email": "test@example.com", "password": "NewStrongPass456!"},
    )
    assert login_resp.status_code == 200


async def test_forgot_password(test_client: AsyncClient, test_user):
    resp = await test_client.post(
        "/api/v1/auth/forgot-password",
        json={"email": "test@example.com"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True


async def test_refresh_token(test_client: AsyncClient, test_user):
    login_resp = await test_client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": test_user["password"],
        },
    )
    refresh_token = login_resp.json()["refresh_token"]

    resp = await test_client.post(
        "/api/v1/auth/refresh",
        json={"refresh_token": refresh_token},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
