from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


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


class DocumentListResponse(BaseModel):
    documents: List[DocumentResponse]
    total: int
    page: int
    page_size: int


class DocumentStatsResponse(BaseModel):
    total_documents: int
    total_amount: float
    documents_this_month: int
    average_amount: float


class UsageStatsResponse(BaseModel):
    total_requests: int
    requests_today: int
    requests_this_month: int
    limit: int
    remaining: int
    usage_percentage: float
    top_apis: List[dict]
    top_endpoints: List[dict]
    error_rate: float
    avg_latency_ms: float
    daily_usage: List[dict]


class DashboardResponse(BaseModel):
    user_name: str
    plan_name: str
    subscription_status: str
    requests_used: int
    requests_limit: int
    requests_remaining: int
    renewal_date: Optional[datetime] = None
    active_api_keys: int
    active_apis: int
    usage_last_7_days: List[dict]
    usage_last_30_days: List[dict]
    recent_requests: List[dict]


class SupportTicketCreate(BaseModel):
    subject: str
    category: str = "general"
    message: str


class SupportMessageCreate(BaseModel):
    message: str


class SupportTicketResponse(BaseModel):
    id: str
    subject: str
    category: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SupportMessageResponse(BaseModel):
    id: str
    message: str
    sender_id: str
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True


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
