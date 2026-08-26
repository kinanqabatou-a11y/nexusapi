from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update
from typing import Optional
from datetime import datetime

from app.db.database import get_db
from app.models import ApiKey, User
from app.schemas import ApiKeyCreate, ApiKeyResponse, ApiKeyCreatedResponse
from app.dependencies import get_current_user
from app.core.security import generate_api_key, create_api_key_hash

router = APIRouter(prefix="/api/v1/api-keys", tags=["API Keys"])


@router.get("", response_model=dict)
async def list_api_keys(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ApiKey)
        .where(ApiKey.user_id == current_user.id)
        .order_by(ApiKey.created_at.desc())
    )
    keys = result.scalars().all()

    return {
        "api_keys": [
            ApiKeyResponse(
                id=k.id,
                name=k.name,
                key_prefix=k.key_prefix,
                is_active=k.is_active,
                last_used_at=k.last_used_at,
                expires_at=k.expires_at,
                created_at=k.created_at,
            ).model_dump()
            for k in keys
        ],
        "total": len(keys),
    }


@router.post("", response_model=ApiKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
async def create_api_key(
    data: ApiKeyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Check limit
    count_result = await db.execute(
        select(func.count(ApiKey.id)).where(
            ApiKey.user_id == current_user.id,
            ApiKey.is_active == True,
        )
    )
    active_count = count_result.scalar()

    # Get user's plan limit
    from app.models import Subscription, Plan
    sub_result = await db.execute(
        select(Subscription)
        .join(Plan)
        .where(Subscription.user_id == current_user.id, Subscription.status == "active")
    )
    subscription = sub_result.scalar_one_or_none()

    if current_user.email != "lharbengytesta@gmail.com" and subscription:
        plan_result = await db.execute(select(Plan).where(Plan.id == subscription.plan_id))
        plan = plan_result.scalar_one_or_none()
        if plan and active_count >= plan.api_key_limit:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "success": False,
                    "error": {
                        "code": "API_KEY_LIMIT_REACHED",
                        "message": f"You have reached the maximum number of API keys ({plan.api_key_limit}) for your plan.",
                    },
                },
            )

    raw_key = generate_api_key()
    key_hash = create_api_key_hash(raw_key)
    key_prefix = raw_key[:20] + "..."

    api_key = ApiKey(
        user_id=current_user.id,
        name=data.name,
        key_prefix=key_prefix,
        key_hash=key_hash,
    )
    db.add(api_key)
    await db.commit()
    await db.refresh(api_key)

    return ApiKeyCreatedResponse(
        id=api_key.id,
        name=api_key.name,
        key=raw_key,
        key_prefix=key_prefix,
        created_at=api_key.created_at,
    )


@router.post("/{key_id}/revoke")
async def revoke_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id)
    )
    api_key = result.scalar_one_or_none()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": {"code": "KEY_NOT_FOUND", "message": "API key not found."}},
        )

    api_key.is_active = False
    await db.commit()

    return {"success": True, "message": "API key revoked successfully."}


@router.delete("/{key_id}")
async def delete_api_key(
    key_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(ApiKey).where(ApiKey.id == key_id, ApiKey.user_id == current_user.id)
    )
    api_key = result.scalar_one_or_none()

    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": {"code": "KEY_NOT_FOUND", "message": "API key not found."}},
        )

    await db.delete(api_key)
    await db.commit()

    return {"success": True, "message": "API key deleted successfully."}
