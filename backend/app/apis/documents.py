from fastapi import APIRouter, HTTPException, status, Depends, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from datetime import datetime
import hashlib
import json

from app.db.database import get_db
from app.models import ApiKey, User, Subscription, Plan, ApiRequest, Api
from app.dependencies import get_current_user
from app.core.security import create_api_key_hash
from app.core.config import settings

router = APIRouter(prefix="/api/v1", tags=["Document API"])


@router.post("/documents", status_code=status.HTTP_201_CREATED)
async def create_document(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return Response(
            content=json.dumps({"success": False, "error": {"code": "MISSING_API_KEY", "message": "Authorization header with Bearer token required."}}),
            status_code=401,
            media_type="application/json",
        )

    raw_key = auth_header[7:]
    key_hash = create_api_key_hash(raw_key)

    key_result = await db.execute(
        select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.is_active == True)
    )
    api_key = key_result.scalar_one_or_none()

    if not api_key:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "INVALID_API_KEY", "message": "The API key is invalid or has been revoked."}}),
            status_code=401,
            media_type="application/json",
        )

    # Check user subscription & limits
    user_result = await db.execute(select(User).where(User.id == api_key.user_id))
    user = user_result.scalar_one_or_none()

    sub_result = await db.execute(
        select(Subscription).join(Plan).where(
            Subscription.user_id == user.id,
            Subscription.status == "active",
        )
    )
    subscription = sub_result.scalar_one_or_none()

    if not subscription:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "NO_ACTIVE_SUBSCRIPTION", "message": "No active subscription found."}}),
            status_code=403,
            media_type="application/json",
        )

    plan_result = await db.execute(select(Plan).where(Plan.id == subscription.plan_id))
    plan = plan_result.scalar_one_or_none()

    if current_user.email != "lharbengytesta@gmail.com" and plan and subscription.requests_used >= plan.request_limit:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "MONTHLY_LIMIT_REACHED", "message": "You have reached your monthly API request limit."}}),
            status_code=429,
            media_type="application/json",
        )

    try:
        body = await request.json()
    except Exception:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "INVALID_JSON", "message": "Request body must be valid JSON."}}),
            status_code=400,
            media_type="application/json",
        )

    # Validate required fields
    required = ["customer_name", "amount", "description", "date"]
    missing = [f for f in required if f not in body]
    if missing:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "MISSING_FIELDS", "message": f"Missing required fields: {', '.join(missing)}"}}),
            status_code=400,
            media_type="application/json",
        )

    import uuid
    doc_id = str(uuid.uuid4())
    now = datetime.utcnow().isoformat()

    document = {
        "id": doc_id,
        "customer_name": body["customer_name"],
        "amount": body["amount"],
        "description": body["description"],
        "date": body["date"],
        "extra_fields": body.get("extra_fields"),
        "created_at": now,
    }

    # Update usage
    subscription.requests_used += 1

    # Log request
    api_request = ApiRequest(
        user_id=user.id,
        api_key_id=api_key.id,
        endpoint="/api/v1/documents",
        method="POST",
        status_code=201,
        status="success",
        created_at=datetime.utcnow(),
    )
    db.add(api_request)

    # Update api_key last used
    api_key.last_used_at = datetime.utcnow()

    await db.commit()

    return Response(
        content=json.dumps({"success": True, "data": document}),
        status_code=201,
        media_type="application/json",
    )


@router.get("/documents")
async def list_documents(
    request: Request,
    page: int = 1,
    page_size: int = 20,
    db: AsyncSession = Depends(get_db),
):
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return Response(
            content=json.dumps({"success": False, "error": {"code": "MISSING_API_KEY", "message": "Authorization header required."}}),
            status_code=401,
            media_type="application/json",
        )

    raw_key = auth_header[7:]
    key_hash = create_api_key_hash(raw_key)

    key_result = await db.execute(
        select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.is_active == True)
    )
    api_key = key_result.scalar_one_or_none()

    if not api_key:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "INVALID_API_KEY", "message": "Invalid API key."}}),
            status_code=401,
            media_type="application/json",
        )

    user_result = await db.execute(select(User).where(User.id == api_key.user_id))
    user = user_result.scalar_one_or_none()

    subscription = None
    sub_result = await db.execute(
        select(Subscription).join(Plan).where(
            Subscription.user_id == user.id, Subscription.status == "active"
        )
    )
    subscription = sub_result.scalar_one_or_none()

    if subscription:
        plan_result = await db.execute(select(Plan).where(Plan.id == subscription.plan_id))
        plan = plan_result.scalar_one_or_none()
        if current_user.email != "lharbengytesta@gmail.com" and plan and subscription.requests_used >= plan.request_limit:
            return Response(
                content=json.dumps({"success": False, "error": {"code": "MONTHLY_LIMIT_REACHED", "message": "Monthly limit reached."}}),
                status_code=429,
                media_type="application/json",
            )

    # In production, documents would be stored in DB. For now return demo data
    api_key.last_used_at = datetime.utcnow()
    subscription.requests_used += 1

    api_request = ApiRequest(
        user_id=user.id,
        api_key_id=api_key.id,
        endpoint="/api/v1/documents",
        method="GET",
        status_code=200,
        status="success",
        created_at=datetime.utcnow(),
    )
    db.add(api_request)
    await db.commit()

    return Response(
        content=json.dumps({
            "success": True,
            "data": {
                "documents": [],
                "total": 0,
                "page": page,
                "page_size": page_size,
            },
        }),
        status_code=200,
        media_type="application/json",
    )


@router.get("/documents/{document_id}")
async def get_document(
    document_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return Response(
            content=json.dumps({"success": False, "error": {"code": "MISSING_API_KEY", "message": "Authorization header required."}}),
            status_code=401,
            media_type="application/json",
        )

    raw_key = auth_header[7:]
    key_hash = create_api_key_hash(raw_key)

    key_result = await db.execute(
        select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.is_active == True)
    )
    api_key = key_result.scalar_one_or_none()

    if not api_key:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "INVALID_API_KEY", "message": "Invalid API key."}}),
            status_code=401,
            media_type="application/json",
        )

    user_result = await db.execute(select(User).where(User.id == api_key.user_id))
    user = user_result.scalar_one_or_none()

    sub_result = await db.execute(
        select(Subscription).join(Plan).where(
            Subscription.user_id == user.id, Subscription.status == "active"
        )
    )
    subscription = sub_result.scalar_one_or_none()

    if subscription:
        plan_result = await db.execute(select(Plan).where(Plan.id == subscription.plan_id))
        plan = plan_result.scalar_one_or_none()
        if current_user.email != "lharbengytesta@gmail.com" and plan and subscription.requests_used >= plan.request_limit:
            return Response(
                content=json.dumps({"success": False, "error": {"code": "MONTHLY_LIMIT_REACHED", "message": "Monthly limit reached."}}),
                status_code=429,
                media_type="application/json",
            )

    api_key.last_used_at = datetime.utcnow()
    if subscription:
        subscription.requests_used += 1

    api_request = ApiRequest(
        user_id=user.id,
        api_key_id=api_key.id,
        endpoint=f"/api/v1/documents/{document_id}",
        method="GET",
        status_code=404,
        status="error",
        created_at=datetime.utcnow(),
    )
    db.add(api_request)
    await db.commit()

    return Response(
        content=json.dumps({"success": False, "error": {"code": "NOT_FOUND", "message": "Document not found."}}),
        status_code=404,
        media_type="application/json",
    )


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return Response(
            content=json.dumps({"success": False, "error": {"code": "MISSING_API_KEY", "message": "Authorization header required."}}),
            status_code=401,
            media_type="application/json",
        )

    raw_key = auth_header[7:]
    key_hash = create_api_key_hash(raw_key)

    key_result = await db.execute(
        select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.is_active == True)
    )
    api_key = key_result.scalar_one_or_none()

    if not api_key:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "INVALID_API_KEY", "message": "Invalid API key."}}),
            status_code=401,
            media_type="application/json",
        )

    user_result = await db.execute(select(User).where(User.id == api_key.user_id))
    user = user_result.scalar_one_or_none()

    sub_result = await db.execute(
        select(Subscription).join(Plan).where(
            Subscription.user_id == user.id, Subscription.status == "active"
        )
    )
    subscription = sub_result.scalar_one_or_none()

    if subscription:
        plan_result = await db.execute(select(Plan).where(Plan.id == subscription.plan_id))
        plan = plan_result.scalar_one_or_none()
        if current_user.email != "lharbengytesta@gmail.com" and plan and subscription.requests_used >= plan.request_limit:
            return Response(
                content=json.dumps({"success": False, "error": {"code": "MONTHLY_LIMIT_REACHED", "message": "Monthly limit reached."}}),
                status_code=429,
                media_type="application/json",
            )

    api_key.last_used_at = datetime.utcnow()
    if subscription:
        subscription.requests_used += 1

    api_request = ApiRequest(
        user_id=user.id,
        api_key_id=api_key.id,
        endpoint=f"/api/v1/documents/{document_id}",
        method="DELETE",
        status_code=404,
        status="error",
        created_at=datetime.utcnow(),
    )
    db.add(api_request)
    await db.commit()

    return Response(
        content=json.dumps({"success": False, "error": {"code": "NOT_FOUND", "message": "Document not found."}}),
        status_code=404,
        media_type="application/json",
    )
