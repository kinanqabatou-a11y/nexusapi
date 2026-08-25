from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


class PlanResponse(BaseModel):
    id: str
    name: str
    slug: str
    description: Optional[str] = None
    price_monthly: float
    price_yearly: Optional[float] = None
    request_limit: int
    api_key_limit: int
    features: Optional[str] = None
    is_active: bool

    class Config:
        from_attributes = True


class SubscriptionResponse(BaseModel):
    id: str
    plan: PlanResponse
    status: str
    requests_used: int
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    cancel_at_period_end: bool = False

    class Config:
        from_attributes = True


class SubscriptionCreate(BaseModel):
    plan_slug: str
    payment_method_id: Optional[str] = None


class CheckoutSessionCreate(BaseModel):
    plan_slug: str
    success_url: str
    cancel_url: str


class PortalSessionCreate(BaseModel):
    return_url: str
