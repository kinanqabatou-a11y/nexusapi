from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import json

from app.db.database import get_db
from app.models import WebhookEvent, User, Subscription, Plan
from app.core.config import settings

router = APIRouter(prefix="/api/webhooks", tags=["Webhooks"])


@router.post("/stripe")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    body = await request.body()

    if settings.STRIPE_WEBHOOK_SECRET:
        import stripe
        stripe.api_key = settings.STRIPE_SECRET_KEY
        try:
            sig_header = request.headers.get("stripe-signature", "")
            event = stripe.Webhook.construct_event(
                body, sig_header, settings.STRIPE_WEBHOOK_SECRET
            )
        except Exception as e:
            return Response(
                content=json.dumps({"error": "Invalid signature"}),
                status_code=400,
                media_type="application/json",
            )
        event_id = event["id"]
        event_type = event["type"]
        event_data = event["data"]
    else:
        try:
            payload = json.loads(body)
            event_id = payload.get("id", f"evt_demo_{datetime.utcnow().timestamp()}")
            event_type = payload.get("type", "unknown")
            event_data = payload.get("data", {})
        except Exception:
            return Response(
                content=json.dumps({"error": "Invalid payload"}),
                status_code=400,
                media_type="application/json",
            )

    # Idempotency check
    existing = await db.execute(
        select(WebhookEvent).where(WebhookEvent.stripe_event_id == event_id)
    )
    if existing.scalar_one_or_none():
        return Response(
            content=json.dumps({"received": True, "message": "Event already processed"}),
            status_code=200,
            media_type="application/json",
        )

    # Store event
    webhook_event = WebhookEvent(
        stripe_event_id=event_id,
        event_type=event_type,
        payload=json.dumps(event_data) if isinstance(event_data, dict) else str(event_data),
        processed=False,
    )
    db.add(webhook_event)

    try:
        if event_type == "checkout.session.completed":
            await _handle_checkout_completed(db, event_data)
        elif event_type == "customer.subscription.created":
            await _handle_subscription_created(db, event_data)
        elif event_type == "customer.subscription.updated":
            await _handle_subscription_updated(db, event_data)
        elif event_type == "customer.subscription.deleted":
            await _handle_subscription_deleted(db, event_data)
        elif event_type == "invoice.paid":
            await _handle_invoice_paid(db, event_data)
        elif event_type == "invoice.payment_failed":
            await _handle_invoice_payment_failed(db, event_data)

        webhook_event.processed = True
    except Exception as e:
        webhook_event.error_message = str(e)

    await db.commit()

    return Response(
        content=json.dumps({"received": True}),
        status_code=200,
        media_type="application/json",
    )


async def _handle_checkout_completed(db, data):
    metadata = data.get("metadata", {})
    user_id = metadata.get("user_id")
    plan_slug = metadata.get("plan_slug")

    if not user_id or not plan_slug:
        return

    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        return

    # Create/update subscription
    plan_result = await db.execute(select(Plan).where(Plan.slug == plan_slug))
    plan = plan_result.scalar_one_or_none()
    if not plan:
        return

    sub_result = await db.execute(
        select(Subscription).where(Subscription.user_id == user_id)
    )
    sub = sub_result.scalar_one_or_none()

    if sub:
        sub.plan_id = plan.id
        sub.status = "active"
        sub.stripe_subscription_id = data.get("subscription")
        sub.stripe_customer_id = data.get("customer")
        sub.current_period_start = datetime.utcnow()
        from datetime import timedelta
        sub.current_period_end = datetime.utcnow() + timedelta(days=30)
    else:
        from datetime import timedelta
        new_sub = Subscription(
            user_id=user_id,
            plan_id=plan.id,
            status="active",
            stripe_subscription_id=data.get("subscription"),
            stripe_customer_id=data.get("customer"),
            current_period_start=datetime.utcnow(),
            current_period_end=datetime.utcnow() + timedelta(days=30),
        )
        db.add(new_sub)

    user.stripe_customer_id = data.get("customer")


async def _handle_subscription_created(db, data):
    customer_id = data.get("customer")
    if not customer_id:
        return
    user_result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
    user = user_result.scalar_one_or_none()
    if not user:
        return

    sub_id = data.get("id")
    sub_result = await db.execute(select(Subscription).where(Subscription.stripe_subscription_id == sub_id))
    sub = sub_result.scalar_one_or_none()
    if sub:
        sub.status = data.get("status", "active")


async def _handle_subscription_updated(db, data):
    sub_id = data.get("id")
    sub_result = await db.execute(select(Subscription).where(Subscription.stripe_subscription_id == sub_id))
    sub = sub_result.scalar_one_or_none()
    if sub:
        sub.status = data.get("status", sub.status)
        period = data.get("current_period")
        if period:
            sub.current_period_start = datetime.fromtimestamp(period.get("start", 0))
            sub.current_period_end = datetime.fromtimestamp(period.get("end", 0))


async def _handle_subscription_deleted(db, data):
    sub_id = data.get("id")
    sub_result = await db.execute(select(Subscription).where(Subscription.stripe_subscription_id == sub_id))
    sub = sub_result.scalar_one_or_none()
    if sub:
        sub.status = "canceled"


async def _handle_invoice_paid(db, data):
    pass  # Record payment


async def _handle_invoice_payment_failed(db, data):
    customer_id = data.get("customer")
    if customer_id:
        user_result = await db.execute(select(User).where(User.stripe_customer_id == customer_id))
        user = user_result.scalar_one_or_none()
        if user:
            sub_result = await db.execute(
                select(Subscription).where(Subscription.user_id == user.id, Subscription.status == "active")
            )
            sub = sub_result.scalar_one_or_none()
            if sub:
                sub.status = "past_due"
