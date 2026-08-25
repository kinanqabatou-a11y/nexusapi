import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_admin_stats(test_client: AsyncClient, admin_headers):
    resp = await test_client.get("/api/v1/admin/stats", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_users" in data
    assert "active_users" in data
    assert "total_subscriptions" in data
    assert "total_requests" in data
    assert "total_api_keys" in data
    assert data["total_users"] >= 1


async def test_admin_users_list(test_client: AsyncClient, admin_headers):
    resp = await test_client.get("/api/v1/admin/users", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "users" in data
    assert data["total"] >= 1
    emails = [u["email"] for u in data["users"]]
    assert "admin@example.com" in emails


async def test_non_admin_forbidden(test_client: AsyncClient, auth_headers):
    resp = await test_client.get("/api/v1/admin/stats", headers=auth_headers)
    assert resp.status_code == 403
    data = resp.json()
    assert data["detail"]["success"] is False
    assert data["detail"]["error"]["code"] == "FORBIDDEN"
