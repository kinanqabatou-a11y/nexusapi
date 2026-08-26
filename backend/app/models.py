import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Boolean, Integer, Float, DateTime, Text, ForeignKey, Enum as SAEnum
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
import enum

from app.db.database import Base


def generate_uuid():
    return str(uuid.uuid4())


class UserRole(str, enum.Enum):
    USER = "user"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class SubscriptionStatus(str, enum.Enum):
    ACTIVE = "active"
    CANCELED = "canceled"
    PAST_DUE = "past_due"
    TRIALING = "trialing"
    INCOMPLETE = "incomplete"
    INCOMPLETE_EXPIRED = "incomplete_expired"
    UNPAID = "unpaid"
    NONE = "none"


class TicketStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"


class TicketCategory(str, enum.Enum):
    GENERAL = "general"
    TECHNICAL = "technical"
    BILLING = "billing"
    API_SUPPORT = "api_support"
    FEATURE_REQUEST = "feature_request"
    BUG_REPORT = "bug_report"


class ApiRequestStatus(str, enum.Enum):
    SUCCESS = "success"
    ERROR = "error"
    RATE_LIMITED = "rate_limited"


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default=UserRole.USER, nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    stripe_customer_id = Column(String(255), nullable=True, unique=True)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    organization = relationship("Organization", back_populates="owner", uselist=False)
    api_keys = relationship("ApiKey", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    support_tickets = relationship("SupportTicket", back_populates="user")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user")
    email_verification_tokens = relationship("EmailVerificationToken", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")


class Organization(Base):
    __tablename__ = "organizations"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False)
    owner_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner = relationship("User", back_populates="organization")


class Plan(Base):
    __tablename__ = "plans"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False, unique=True)
    slug = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    price_monthly = Column(Float, nullable=False, default=0.0)
    price_yearly = Column(Float, nullable=True)
    request_limit = Column(Integer, nullable=False, default=500)
    api_key_limit = Column(Integer, nullable=False, default=1)
    features = Column(Text, nullable=True)  # JSON string
    stripe_price_id_monthly = Column(String(255), nullable=True)
    stripe_price_id_yearly = Column(String(255), nullable=True)
    stripe_product_id = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    subscriptions = relationship("Subscription", back_populates="plan")


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    plan_id = Column(String(36), ForeignKey("plans.id"), nullable=False)
    status = Column(String(20), default=SubscriptionStatus.NONE)
    stripe_subscription_id = Column(String(255), nullable=True, unique=True)
    stripe_customer_id = Column(String(255), nullable=True)
    stripe_price_id = Column(String(255), nullable=True)
    current_period_start = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    cancel_at_period_end = Column(Boolean, default=False)
    requests_used = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subscriptions")
    plan = relationship("Plan", back_populates="subscriptions")


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    name = Column(String(200), nullable=False)
    key_prefix = Column(String(20), nullable=False)  # e.g. "autoapi_live_a1b2"
    key_hash = Column(String(255), nullable=False)
    api_id = Column(String(36), ForeignKey("apis.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime, nullable=True)
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="api_keys")
    api = relationship("Api")
    api_requests = relationship("ApiRequest", back_populates="api_key")


class Api(Base):
    __tablename__ = "apis"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(200), nullable=False)
    slug = Column(String(200), nullable=False, unique=True)
    description = Column(Text, nullable=True)
    version = Column(String(20), default="1.0.0")
    is_active = Column(Boolean, default=True)
    base_path = Column(String(200), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    endpoints = relationship("ApiEndpoint", back_populates="api")


class ApiEndpoint(Base):
    __tablename__ = "api_endpoints"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    api_id = Column(String(36), ForeignKey("apis.id"), nullable=False)
    method = Column(String(10), nullable=False)
    path = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    request_schema = Column(Text, nullable=True)  # JSON schema
    response_schema = Column(Text, nullable=True)  # JSON schema
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    api = relationship("Api", back_populates="endpoints")


class ApiRequest(Base):
    __tablename__ = "api_requests"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    api_key_id = Column(String(36), ForeignKey("api_keys.id"), nullable=True)
    api_id = Column(String(36), ForeignKey("apis.id"), nullable=True)
    endpoint = Column(String(500), nullable=False)
    method = Column(String(10), nullable=False)
    status_code = Column(Integer, nullable=True)
    status = Column(String(20), default=ApiRequestStatus.SUCCESS)
    duration_ms = Column(Float, nullable=True)
    ip_address = Column(String(45), nullable=True)  # Truncated/hash for privacy
    user_agent = Column(String(500), nullable=True)
    error_message = Column(Text, nullable=True)
    request_size = Column(Integer, nullable=True)
    response_size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User")
    api_key = relationship("ApiKey", back_populates="api_requests")
    api = relationship("Api")


class Payment(Base):
    __tablename__ = "payments"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    stripe_payment_intent_id = Column(String(255), nullable=True, unique=True)
    stripe_invoice_id = Column(String(255), nullable=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(3), default="EUR")
    status = Column(String(20), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User")


class WebhookEvent(Base):
    __tablename__ = "webhook_events"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    stripe_event_id = Column(String(255), nullable=False, unique=True)
    event_type = Column(String(100), nullable=False)
    payload = Column(Text, nullable=False)
    processed = Column(Boolean, default=False)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    token = Column(String(255), nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="password_reset_tokens")


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    token = Column(String(255), nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="email_verification_tokens")


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    subject = Column(String(300), nullable=False)
    category = Column(String(30), default=TicketCategory.GENERAL)
    status = Column(String(20), default=TicketStatus.OPEN)
    messages = relationship("SupportMessage", back_populates="ticket")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="support_tickets")


class SupportMessage(Base):
    __tablename__ = "support_messages"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    ticket_id = Column(String(36), ForeignKey("support_tickets.id"), nullable=False)
    sender_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    message = Column(Text, nullable=False)
    is_admin = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    ticket = relationship("SupportTicket", back_populates="messages")
    sender = relationship("User")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), nullable=False)  # info, warning, success, error
    is_read = Column(Boolean, default=False)
    link = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="notifications")


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    action = Column(String(100), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String(36), nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="audit_logs")
