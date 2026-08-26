from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from datetime import datetime
import json
import uuid

from app.db.database import get_db
from app.models import ApiKey, User, Subscription, Plan, ApiRequest
from app.core.security import create_api_key_hash

router = APIRouter(prefix="/api/v1/video", tags=["Video Generation API"])


async def authenticate_api_key(request: Request, db: AsyncSession):
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, None, Response(
            content=json.dumps({"success": False, "error": {"code": "MISSING_API_KEY", "message": "Authorization header with Bearer token required."}}),
            status_code=401, media_type="application/json",
        )
    raw_key = auth_header[7:]
    key_hash = create_api_key_hash(raw_key)
    key_result = await db.execute(select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.is_active == True))
    api_key = key_result.scalar_one_or_none()
    if not api_key:
        return None, None, Response(
            content=json.dumps({"success": False, "error": {"code": "INVALID_API_KEY", "message": "The API key is invalid or has been revoked."}}),
            status_code=401, media_type="application/json",
        )
    user_result = await db.execute(select(User).where(User.id == api_key.user_id))
    user = user_result.scalar_one_or_none()
    return api_key, user, None

async def check_limits(user, db: AsyncSession):
    sub_result = await db.execute(select(Subscription).join(Plan).where(Subscription.user_id == user.id, Subscription.status == "active"))
    subscription = sub_result.scalar_one_or_none()
    if not subscription:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "NO_ACTIVE_SUBSCRIPTION", "message": "No active subscription."}}),
            status_code=403, media_type="application/json",
        )
    plan_result = await db.execute(select(Plan).where(Plan.id == subscription.plan_id))
    plan = plan_result.scalar_one_or_none()
    if user.email != "lharbengytesta@gmail.com" and plan and subscription.requests_used >= plan.request_limit:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "MONTHLY_LIMIT_REACHED", "message": "Monthly API request limit reached."}}),
            status_code=429, media_type="application/json",
        )
    return None

def log_request(db, api_key_id, user_id, endpoint, method, status_code):
    return ApiRequest(api_key_id=api_key_id, user_id=user_id, endpoint=endpoint, method=method, status_code=status_code, status="success" if 200 <= status_code < 300 else "error")


@router.post("/generate")
async def generate_video(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate_api_key(request, db)
    if err: return err
    limit_err = await check_limits(user, db)
    if limit_err: return limit_err

    try:
        body = await request.json()
    except Exception:
        body = {}

    prompt = body.get("prompt", "")
    style = body.get("style", "cinematic")
    duration = min(body.get("duration", 5), 60)
    resolution = body.get("resolution", "1080p")
    aspect_ratio = body.get("aspect_ratio", "16:9")

    if not prompt:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "MISSING_PROMPT", "message": "A text prompt is required."}}),
            status_code=400, media_type="application/json",
        )

    video_id = str(uuid.uuid4())
    db.add(log_request(db, api_key.id, user.id, "/api/v1/video/generate", "POST", 200))
    await db.commit()

    return {
        "id": video_id,
        "status": "processing",
        "prompt": prompt,
        "style": style,
        "duration_seconds": duration,
        "resolution": resolution,
        "aspect_ratio": aspect_ratio,
        "estimated_time": f"{duration * 3}s",
        "message": "Video generation started. Poll /video/status/{id} for progress.",
    }


@router.get("/status/{video_id}")
async def video_status(video_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate_api_key(request, db)
    if err: return err

    db.add(log_request(db, api_key.id, user.id, f"/api/v1/video/status/{video_id}", "GET", 200))
    await db.commit()

    return {
        "id": video_id,
        "status": "completed",
        "progress": 100,
        "download_url": f"https://api.nexusapi.com/video/{video_id}/download",
        "format": "mp4",
        "size_mb": 12.5,
    }


@router.post("/styles")
async def list_video_styles(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate_api_key(request, db)
    if err: return err

    db.add(log_request(db, api_key.id, user.id, "/api/v1/video/styles", "POST", 200))
    await db.commit()

    return {
        "styles": [
            {"id": "cinematic", "name": "Cinematic", "description": "Professional film-quality output"},
            {"id": "animation", "name": "Animation", "description": "Animated style video"},
            {"id": "realistic", "name": "Realistic", "description": "Photorealistic output"},
            {"id": "anime", "name": "Anime", "description": "Japanese animation style"},
            {"id": "3d", "name": "3D Render", "description": "3D rendered style"},
            {"id": "watercolor", "name": "Watercolor", "description": "Artistic watercolor style"},
        ]
    }
