from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "NexusAPI"
    APP_ENV: str = "development"
    APP_DEBUG: bool = True
    APP_PORT: int = 8000

    DATABASE_URL: str = "sqlite+aiosqlite:///./autoapi.db"

    JWT_SECRET: str = "change-me-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    EMAIL_PROVIDER: str = "smtp"
    EMAIL_API_KEY: str = ""
    EMAIL_FROM: str = "noreply@nexusapi.com"

    REDIS_URL: str = "redis://localhost:6379/0"

    CINENOVA_URL: str = ""

    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    FREE_PLAN_REQUESTS: int = 500
    BASIC_PLAN_REQUESTS: int = 5000
    PRO_PLAN_REQUESTS: int = 25000
    BUSINESS_PLAN_REQUESTS: int = 100000

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
