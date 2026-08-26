from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime, timedelta

from app.db.database import get_db
from app.models import User, ApiKey, ApiRequest, Subscription, Plan, Api
from app.dependencies import get_current_user

router = APIRouter(prefix="/api/v1/dashboard", tags=["Dashboard"])


@router.get("")
async def get_dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get subscription
    sub_result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == current_user.id,
            Subscription.status == "active",
        )
    )
    subscription = sub_result.scalar_one_or_none()

    plan_name = "Free"
    plan_limit = 500
    requests_used = 0
    renewal_date = None

    if subscription:
        plan_result = await db.execute(select(Plan).where(Plan.id == subscription.plan_id))
        plan = plan_result.scalar_one_or_none()
        if plan:
            plan_name = plan.name
            plan_limit = plan.request_limit
        requests_used = subscription.requests_used
        renewal_date = subscription.current_period_end

    # Count API keys
    keys_result = await db.execute(
        select(func.count(ApiKey.id)).where(
            ApiKey.user_id == current_user.id,
            ApiKey.is_active == True,
        )
    )
    active_api_keys = keys_result.scalar() or 0

    # Count active APIs
    apis_result = await db.execute(
        select(func.count(Api.id)).where(Api.is_active == True)
    )
    active_apis = apis_result.scalar() or 0

    # Daily usage for last 7 days
    now = datetime.utcnow()
    daily_usage_7 = []
    for i in range(6, -1, -1):
        day = (now - timedelta(days=i)).date()
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())

        count_result = await db.execute(
            select(func.count(ApiRequest.id)).where(
                ApiRequest.user_id == current_user.id,
                ApiRequest.created_at >= day_start,
                ApiRequest.created_at <= day_end,
            )
        )
        count = count_result.scalar() or 0
        daily_usage_7.append({"date": day.isoformat(), "requests": count})

    # Daily usage for last 30 days
    daily_usage_30 = []
    for i in range(29, -1, -1):
        day = (now - timedelta(days=i)).date()
        day_start = datetime.combine(day, datetime.min.time())
        day_end = datetime.combine(day, datetime.max.time())

        count_result = await db.execute(
            select(func.count(ApiRequest.id)).where(
                ApiRequest.user_id == current_user.id,
                ApiRequest.created_at >= day_start,
                ApiRequest.created_at <= day_end,
            )
        )
        count = count_result.scalar() or 0
        daily_usage_30.append({"date": day.isoformat(), "requests": count})

    # Recent requests
    recent_result = await db.execute(
        select(ApiRequest)
        .where(ApiRequest.user_id == current_user.id)
        .order_by(ApiRequest.created_at.desc())
        .limit(10)
    )
    recent_requests = [
        {
            "endpoint": r.endpoint,
            "method": r.method,
            "status_code": r.status_code,
            "status": r.status,
            "date": r.created_at.isoformat(),
        }
        for r in recent_result.scalars().all()
    ]

    return {
        "user_name": current_user.first_name,
        "plan": {
            "name": plan_name,
            "status": subscription.status if subscription else "none",
        },
        "usage": {
            "used": requests_used,
            "limit": plan_limit,
            "remaining": max(0, plan_limit - requests_used),
            "renewal_date": renewal_date.isoformat() if renewal_date else None,
        },
        "stats": {
            "active_api_keys": active_api_keys,
            "active_apis": active_apis,
        },
        "chart_7_days": [{"day": d["date"], "requests": d["requests"]} for d in daily_usage_7],
        "chart_30_days": [{"day": d["date"], "requests": d["requests"]} for d in daily_usage_30],
        "recent_requests": recent_requests,
    }
