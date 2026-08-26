from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)
    organization_name: Optional[str] = None


class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class TokenRefresh(BaseModel):
    refresh_token: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordReset(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8, max_length=128)


class ChangePassword(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=8, max_length=128)


class EmailVerify(BaseModel):
    token: str


class ApiKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    api_id: Optional[str] = None


class ApiKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    is_active: bool
    api_id: Optional[str] = None
    api_name: Optional[str] = None
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ApiKeyCreatedResponse(BaseModel):
    id: str
    name: str
    key: str
    key_prefix: str
    created_at: datetime


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


class CheckoutSessionCreate(BaseModel):
    plan_slug: str
    success_url: str
    cancel_url: str


class PortalSessionCreate(BaseModel):
    return_url: str


class DocumentCreate(BaseModel):
    customer_name: str
    amount: float
    description: str
    date: str
    extra_fields: Optional[dict] = None


class DocumentResponse(BaseModel):
    id: str
    customer_name: str
    amount: float
    description: str
    date: str
    extra_fields: Optional[dict] = None
    created_at: datetime

    class Config:
        from_attributes = True


class SupportTicketCreate(BaseModel):
    subject: str
    category: str = "general"
    message: str


class SupportMessageCreate(BaseModel):
    message: str


class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    type: str
    is_read: bool
    link: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ApiResponse(BaseModel):
    success: bool = True
    data: Optional[dict] = None
    message: Optional[str] = None


class ErrorResponse(BaseModel):
    success: bool = False
    error: dict


class PaginatedResponse(BaseModel):
    items: list
    total: int
    page: int
    page_size: int
    total_pages: int
