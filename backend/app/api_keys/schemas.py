from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field


class ApiKeyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)


class ApiKeyResponse(BaseModel):
    id: str
    name: str
    key_prefix: str
    is_active: bool
    last_used_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ApiKeyCreatedResponse(BaseModel):
    id: str
    name: str
    key: str  # Full key shown only once
    key_prefix: str
    created_at: datetime


class ApiKeyListResponse(BaseModel):
    api_keys: List[ApiKeyResponse]
    total: int
