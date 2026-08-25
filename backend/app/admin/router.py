from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.db.database import get_db
from app.models import User, Subscription, ApiRequest, Api, SupportTicket, Plan, ApiKey
from app.dependencies import get_current_admin_user

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


@router.get("/stats")
async def admin_stats(
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar() or 0
    active_users = (await db.execute(
        select(func.count(User.id)).where(User.is_active == True)
    )).scalar() or 0

    total_subscriptions = (await db.execute(
        select(func.count(Subscription.id)).where(Subscription.status == "active")
    )).scalar() or 0

    total_requests = (await db.execute(
        select(func.count(ApiRequest.id))
    )).scalar() or 0

    total_apis = (await db.execute(
        select(func.count(Api.id)).where(Api.is_active == True)
    )).scalar() or 0

    total_tickets = (await db.execute(
        select(func.count(SupportTicket.id))
    )).scalar() or 0

    open_tickets = (await db.execute(
        select(func.count(SupportTicket.id)).where(SupportTicket.status == "open")
    )).scalar() or 0

    total_api_keys = (await db.execute(
        select(func.count(ApiKey.id)).where(ApiKey.is_active == True)
    )).scalar() or 0

    return {
        "total_users": total_users,
        "active_users": active_users,
        "total_subscriptions": total_subscriptions,
        "total_requests": total_requests,
        "total_apis": total_apis,
        "total_tickets": total_tickets,
        "open_tickets": open_tickets,
        "total_api_keys": total_api_keys,
    }


@router.get("/users")
async def list_users(
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()).limit(100))
    users = result.scalars().all()

    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "role": u.role,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at.isoformat(),
            }
            for u in users
        ],
        "total": len(users),
    }


@router.patch("/users/{user_id}/toggle-active")
async def toggle_user_active(
    user_id: str,
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    from fastapi import HTTPException, status
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": {"code": "USER_NOT_FOUND", "message": "User not found."}},
        )

    user.is_active = not user.is_active
    await db.commit()

    return {"success": True, "is_active": user.is_active}


@router.get("/plans")
async def admin_list_plans(
    admin: User = Depends(get_current_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Plan).order_by(Plan.sort_order))
    plans = result.scalars().all()
    return {"plans": [
        {
            "id": p.id, "name": p.name, "slug": p.slug,
            "price_monthly": p.price_monthly, "request_limit": p.request_limit,
            "api_key_limit": p.api_key_limit, "is_active": p.is_active,
        }
        for p in plans
    ]}
