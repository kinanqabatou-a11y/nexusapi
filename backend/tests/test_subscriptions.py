import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_list_plans(test_client: AsyncClient, test_user):
    resp = await test_client.get("/api/v1/subscriptions/plans")
    assert resp.status_code == 200
    plans = resp.json()
    assert len(plans) == 4
    slugs = [p["slug"] for p in plans]
    assert "free" in slugs
    assert "basic" in slugs
    assert "pro" in slugs
    assert "business" in slugs


async def test_get_current_subscription(test_client: AsyncClient, auth_headers, test_user):
    resp = await test_client.get(
        "/api/v1/subscriptions/current",
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    sub = data["subscription"]
    assert sub is not None
    assert sub["status"] == "active"
    assert sub["plan"]["slug"] == "free"


async def test_change_plan(test_client: AsyncClient, auth_headers):
    resp = await test_client.post(
        "/api/v1/subscriptions/change-plan",
        headers=auth_headers,
        params={"plan_slug": "basic"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert "basic" in data["message"].lower()

    sub_resp = await test_client.get(
        "/api/v1/subscriptions/current",
        headers=auth_headers,
    )
    sub_data = sub_resp.json()
    assert sub_data["subscription"]["plan"]["slug"] == "basic"
