import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_create_api_key(test_client: AsyncClient, auth_headers):
    resp = await test_client.post(
        "/api/v1/api-keys",
        headers=auth_headers,
        json={"name": "My Test Key"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "My Test Key"
    assert "key" in data
    assert data["key"].startswith("autoapi_live_")
    assert "key_prefix" in data


async def test_list_api_keys(test_client: AsyncClient, auth_headers, test_api_key):
    resp = await test_client.get("/api/v1/api-keys", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "api_keys" in data
    assert data["total"] >= 1


async def test_create_key_limit(test_client: AsyncClient, auth_headers, test_api_key):
    resp = await test_client.post(
        "/api/v1/api-keys",
        headers=auth_headers,
        json={"name": "Second Key"},
    )
    assert resp.status_code == 403
    data = resp.json()
    assert data["detail"]["success"] is False
    assert data["detail"]["error"]["code"] == "API_KEY_LIMIT_REACHED"


async def test_revoke_api_key(test_client: AsyncClient, auth_headers, test_api_key):
    key_id = test_api_key["api_key"].id
    resp = await test_client.post(
        f"/api/v1/api-keys/{key_id}/revoke",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True


async def test_delete_api_key(test_client: AsyncClient, auth_headers, test_api_key):
    key_id = test_api_key["api_key"].id
    resp = await test_client.delete(
        f"/api/v1/api-keys/{key_id}",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True

    list_resp = await test_client.get("/api/v1/api-keys", headers=auth_headers)
    ids = [k["id"] for k in list_resp.json()["api_keys"]]
    assert key_id not in ids


async def test_create_key_unauthenticated(test_client: AsyncClient):
    resp = await test_client.post(
        "/api/v1/api-keys",
        json={"name": "Unauth Key"},
    )
    assert resp.status_code in (401, 403)
