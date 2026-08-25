from datetime import datetime, timedelta
import secrets
import hashlib
from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models import User, Organization, Subscription, Plan, PasswordResetToken, EmailVerificationToken
from app.schemas import (
    UserCreate, UserResponse, UserLogin, TokenResponse,
    TokenRefresh, PasswordResetRequest, PasswordReset,
    ChangePassword, EmailVerify
)
from app.core.security import (
    get_password_hash, verify_password, create_access_token,
    create_refresh_token, decode_token
)
from app.dependencies import get_current_user
from app.core.config import settings

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: AsyncSession = Depends(get_db)):
    existing = await db.execute(select(User).where(User.email == data.email))
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"success": False, "error": {"code": "EMAIL_EXISTS", "message": "An account with this email already exists."}},
        )

    org_name = data.organization_name or f"{data.first_name}'s Organization"
    slug = org_name.lower().replace(" ", "-").replace("'", "")[:200]

    user = User(
        email=data.email,
        first_name=data.first_name,
        last_name=data.last_name,
        hashed_password=get_password_hash(data.password),
        is_verified=True,  # Auto-verify in dev; in prod send email
    )
    db.add(user)
    await db.flush()

    org = Organization(name=org_name, slug=slug, owner_id=user.id)
    db.add(org)

    # Assign free plan
    free_plan_result = await db.execute(select(Plan).where(Plan.slug == "free"))
    free_plan = free_plan_result.scalar_one_or_none()
    if free_plan:
        sub = Subscription(
            user_id=user.id,
            plan_id=free_plan.id,
            status="active",
            current_period_start=datetime.utcnow(),
            current_period_end=datetime.utcnow() + timedelta(days=30),
        )
        db.add(sub)

    await db.commit()
    await db.refresh(user)
    return user


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "error": {"code": "INVALID_CREDENTIALS", "message": "Invalid email or password."}},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={"success": False, "error": {"code": "ACCOUNT_DISABLED", "message": "Your account has been disabled."}},
        )

    access_token = create_access_token(data={"sub": user.id})
    refresh_token = create_refresh_token(data={"sub": user.id})

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(data: TokenRefresh, db: AsyncSession = Depends(get_db)):
    payload = decode_token(data.refresh_token)

    if payload is None or payload.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "error": {"code": "INVALID_REFRESH_TOKEN", "message": "Invalid or expired refresh token."}},
        )

    user_id = payload.get("sub")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"success": False, "error": {"code": "USER_NOT_FOUND", "message": "User not found."}},
        )

    access_token = create_access_token(data={"sub": user.id})
    new_refresh_token = create_refresh_token(data={"sub": user.id})

    return TokenResponse(access_token=access_token, refresh_token=new_refresh_token)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password")
async def change_password(
    data: ChangePassword,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not verify_password(data.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "error": {"code": "WRONG_PASSWORD", "message": "Current password is incorrect."}},
        )

    current_user.hashed_password = get_password_hash(data.new_password)
    await db.commit()

    return {"success": True, "message": "Password changed successfully."}


@router.post("/forgot-password")
async def forgot_password(data: PasswordResetRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if user:
        token = secrets.token_urlsafe(48)
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=token,
            expires_at=datetime.utcnow() + timedelta(hours=1),
        )
        db.add(reset_token)
        await db.commit()

    return {"success": True, "message": "If an account exists, a password reset email has been sent."}


@router.post("/reset-password")
async def reset_password(data: PasswordReset, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token == data.token,
            PasswordResetToken.used == False,
        )
    )
    token_record = result.scalar_one_or_none()

    if not token_record or token_record.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "error": {"code": "INVALID_TOKEN", "message": "Invalid or expired reset token."}},
        )

    user_result = await db.execute(select(User).where(User.id == token_record.user_id))
    user = user_result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "error": {"code": "USER_NOT_FOUND", "message": "User not found."}},
        )

    user.hashed_password = get_password_hash(data.new_password)
    token_record.used = True
    await db.commit()

    return {"success": True, "message": "Password reset successfully."}


@router.post("/verify-email")
async def verify_email(data: EmailVerify, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(EmailVerificationToken).where(
            EmailVerificationToken.token == data.token,
            EmailVerificationToken.used == False,
        )
    )
    token_record = result.scalar_one_or_none()

    if not token_record or token_record.expires_at < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={"success": False, "error": {"code": "INVALID_TOKEN", "message": "Invalid or expired verification token."}},
        )

    user_result = await db.execute(select(User).where(User.id == token_record.user_id))
    user = user_result.scalar_one_or_none()

    if user:
        user.is_verified = True
        token_record.used = True
        await db.commit()

    return {"success": True, "message": "Email verified successfully."}


@router.post("/resend-verification")
async def resend_verification(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if current_user.is_verified:
        return {"success": True, "message": "Email is already verified."}

    token = secrets.token_urlsafe(48)
    verification_token = EmailVerificationToken(
        user_id=current_user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=24),
    )
    db.add(verification_token)
    await db.commit()

    return {"success": True, "message": "Verification email sent."}
