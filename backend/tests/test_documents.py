import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_create_document_valid(test_client: AsyncClient, test_api_key):
    raw_key = test_api_key["raw_key"]
    resp = await test_client.post(
        "/api/v1/documents",
        headers={"Authorization": f"Bearer {raw_key}"},
        json={
            "customer_name": "Acme Corp",
            "amount": 150.00,
            "description": "Invoice for services",
            "date": "2026-01-15",
        },
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["success"] is True
    assert data["data"]["customer_name"] == "Acme Corp"
    assert data["data"]["amount"] == 150.0
    assert "id" in data["data"]


async def test_create_document_missing_fields(test_client: AsyncClient, test_api_key):
    raw_key = test_api_key["raw_key"]
    resp = await test_client.post(
        "/api/v1/documents",
        headers={"Authorization": f"Bearer {raw_key}"},
        json={"customer_name": "Acme Corp"},
    )
    assert resp.status_code == 400
    data = resp.json()
    assert data["success"] is False
    assert data["error"]["code"] == "MISSING_FIELDS"


async def test_create_document_no_auth(test_client: AsyncClient):
    resp = await test_client.post(
        "/api/v1/documents",
        json={
            "customer_name": "Acme Corp",
            "amount": 100,
            "description": "Test",
            "date": "2026-01-01",
        },
    )
    assert resp.status_code == 401
    data = resp.json()
    assert data["success"] is False
    assert data["error"]["code"] == "MISSING_API_KEY"


async def test_create_document_invalid_key(test_client: AsyncClient):
    resp = await test_client.post(
        "/api/v1/documents",
        headers={"Authorization": "Bearer autoapi_live_invalidkey123456789"},
        json={
            "customer_name": "Acme Corp",
            "amount": 100,
            "description": "Test",
            "date": "2026-01-01",
        },
    )
    assert resp.status_code == 401
    data = resp.json()
    assert data["success"] is False
    assert data["error"]["code"] == "INVALID_API_KEY"


async def test_list_documents(test_client: AsyncClient, test_api_key):
    raw_key = test_api_key["raw_key"]
    resp = await test_client.get(
        "/api/v1/documents",
        headers={"Authorization": f"Bearer {raw_key}"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "documents" in data["data"]


async def test_get_document(test_client: AsyncClient, test_api_key):
    raw_key = test_api_key["raw_key"]
    resp = await test_client.get(
        "/api/v1/documents/some-doc-id",
        headers={"Authorization": f"Bearer {raw_key}"},
    )
    assert resp.status_code == 404
    data = resp.json()
    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"


async def test_delete_document(test_client: AsyncClient, test_api_key):
    raw_key = test_api_key["raw_key"]
    resp = await test_client.delete(
        "/api/v1/documents/some-doc-id",
        headers={"Authorization": f"Bearer {raw_key}"},
    )
    assert resp.status_code == 404
    data = resp.json()
    assert data["success"] is False
    assert data["error"]["code"] == "NOT_FOUND"
