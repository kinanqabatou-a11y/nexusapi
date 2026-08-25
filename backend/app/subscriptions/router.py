from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import stripe

from app.db.database import get_db
from app.models import User, Plan, Subscription
from app.schemas import PlanResponse, SubscriptionResponse, CheckoutSessionCreate, PortalSessionCreate
from app.dependencies import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/api/v1/subscriptions", tags=["Subscriptions"])


@router.get("/plans", response_model=list[PlanResponse])
async def list_plans(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Plan).where(Plan.is_active == True).order_by(Plan.sort_order)
    )
    plans = result.scalars().all()
    return [PlanResponse.model_validate(p) for p in plans]


@router.get("/current")
async def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Subscription)
        .join(Plan)
        .where(Subscription.user_id == current_user.id, Subscription.status == "active")
    )
    sub = result.scalar_one_or_none()

    if not sub:
        result2 = await db.execute(
            select(Subscription)
            .join(Plan)
            .where(Subscription.user_id == current_user.id)
            .order_by(Subscription.created_at.desc())
        )
        sub = result2.scalar_one_or_none()

    if not sub:
        return {"subscription": None}

    plan_result = await db.execute(select(Plan).where(Plan.id == sub.plan_id))
    plan = plan_result.scalar_one_or_none()

    return {
        "subscription": {
            "id": sub.id,
            "status": sub.status,
            "requests_used": sub.requests_used,
            "current_period_start": sub.current_period_start.isoformat() if sub.current_period_start else None,
            "current_period_end": sub.current_period_end.isoformat() if sub.current_period_end else None,
            "cancel_at_period_end": sub.cancel_at_period_end,
            "plan": {
                "id": plan.id,
                "name": plan.name,
                "slug": plan.slug,
                "price_monthly": plan.price_monthly,
                "request_limit": plan.request_limit,
                "api_key_limit": plan.api_key_limit,
            } if plan else None,
        }
    }


@router.post("/checkout")
async def create_checkout_session(
    data: CheckoutSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not settings.STRIPE_SECRET_KEY:
        # Demo mode - simulate checkout
        return {
            "checkout_url": f"{settings.FRONTEND_URL}/dashboard/billing?demo=true",
            "demo": True,
        }

    plan_result = await db.execute(select(Plan).where(Plan.slug == data.plan_slug))
    plan = plan_result.scalar_one_or_none()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": {"code": "PLAN_NOT_FOUND", "message": "Plan not found."}},
        )

    if not plan.stripe_price_id_monthly:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "error": {"code": "NO_PAYMENT_CONFIGURED", "message": "This plan does not have a payment method configured."}},
        )

    stripe.api_key = settings.STRIPE_SECRET_KEY

    session = stripe.checkout.Session.create(
        mode="subscription",
        customer=current_user.stripe_customer_id,
        line_items=[{"price": plan.stripe_price_id_monthly, "quantity": 1}],
        success_url=data.success_url,
        cancel_url=data.cancel_url,
        metadata={"user_id": current_user.id, "plan_slug": data.plan_slug},
    )

    return {"checkout_url": session.url, "session_id": session.id}


@router.post("/portal")
async def create_customer_portal(
    data: PortalSessionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not settings.STRIPE_SECRET_KEY or not current_user.stripe_customer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "error": {"code": "NO_STRIPE_CUSTOMER", "message": "No Stripe customer associated."}},
        )

    stripe.api_key = settings.STRIPE_SECRET_KEY
    session = stripe.billing_portal.Session.create(
        customer=current_user.stripe_customer_id,
        return_url=data.return_url,
    )

    return {"portal_url": session.url}


@router.post("/change-plan")
async def change_plan(
    plan_slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    plan_result = await db.execute(select(Plan).where(Plan.slug == plan_slug, Plan.is_active == True))
    plan = plan_result.scalar_one_or_none()

    if not plan:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"success": False, "error": {"code": "PLAN_NOT_FOUND", "message": "Plan not found."}},
        )

    sub_result = await db.execute(
        select(Subscription).where(
            Subscription.user_id == current_user.id,
            Subscription.status == "active",
        )
    )
    sub = sub_result.scalar_one_or_none()

    if not sub:
        new_sub = Subscription(
            user_id=current_user.id,
            plan_id=plan.id,
            status="active",
        )
        db.add(new_sub)
    else:
        sub.plan_id = plan.id

    await db.commit()

    return {"success": True, "message": f"Plan changed to {plan.name}."}
