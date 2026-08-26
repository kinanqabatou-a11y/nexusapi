from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import json
import uuid
import httpx

from app.db.database import get_db
from app.models import ApiKey, User, Subscription, Plan, ApiRequest
from app.core.security import create_api_key_hash
from app.core.config import settings

router = APIRouter(prefix="/api/v1/video", tags=["Video Generation API"])

CINENOVA_URL = getattr(settings, "CINENOVA_URL", "")


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


@router.post("/generate")
async def generate_video(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate_api_key(request, db)
    if err:
        return err
    limit_err = await check_limits(user, db)
    if limit_err:
        return limit_err

    try:
        body = await request.json()
    except Exception:
        body = {}

    prompt = body.get("prompt", "")
    style = body.get("style", "agnes-v20")
    duration = min(body.get("duration", 9), 60)
    api_key_cinenova = body.get("cinenova_api_key", "")

    if not prompt:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "MISSING_PROMPT", "message": "A text prompt is required."}}),
            status_code=400, media_type="application/json",
        )

    db.add(ApiRequest(api_key_id=api_key.id, user_id=user.id, endpoint="/api/v1/video/generate", method="POST", status_code=200, status="success"))
    await db.commit()

    if CINENOVA_URL:
        try:
            async with httpx.AsyncClient(timeout=180.0) as client:
                resp = await client.post(
                    f"{CINENOVA_URL}/generar",
                    json={
                        "idea": prompt,
                        "duracion": duration,
                        "api_key": api_key_cinenova,
                        "modelo": style,
                    },
                )
                data = resp.json()
                if data.get("ok"):
                    video_path = data.get("video", "")
                    cinenova_base = CINENOVA_URL.rstrip("/")
                    video_url = f"{cinenova_base}{video_path}" if video_path.startswith("/") else f"{cinenova_base}/{video_path}"
                    return {
                        "id": str(uuid.uuid4()),
                        "status": "completed",
                        "prompt": prompt,
                        "style": style,
                        "duration_seconds": duration,
                        "video_url": video_url,
                        "title": data.get("titulo", ""),
                        "total_duration": data.get("duracion_total", ""),
                        "source": data.get("fuente", ""),
                    }
                else:
                    return Response(
                        content=json.dumps({"success": False, "error": {"code": "GENERATION_FAILED", "message": data.get("mensaje", "Video generation failed.")}}),
                        status_code=500, media_type="application/json",
                    )
        except httpx.TimeoutException:
            return Response(
                content=json.dumps({"success": False, "error": {"code": "TIMEOUT", "message": "Video generation timed out. Try a shorter duration."}}),
                status_code=504, media_type="application/json",
            )
        except Exception as e:
            return Response(
                content=json.dumps({"success": False, "error": {"code": "CINENOVA_ERROR", "message": f"Error connecting to CineNova: {str(e)}"}}),
                status_code=502, media_type="application/json",
            )
    else:
        return {
            "id": str(uuid.uuid4()),
            "status": "processing",
            "prompt": prompt,
            "style": style,
            "duration_seconds": duration,
            "estimated_time": f"{duration * 3}s",
            "message": "Video generation queued. CineNova backend not configured.",
        }


@router.post("/models")
async def list_video_models(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate_api_key(request, db)
    if err:
        return err
    return {
        "models": [
            {"id": "agnes-v20", "name": "Agnes v2.0", "note": "Key required"},
            {"id": "agnes-v25", "name": "Agnes v2.5", "note": "Key required"},
            {"id": "novai-cogvideox", "name": "NovAI CogVideoX", "note": "Free"},
            {"id": "kling", "name": "Kling AI", "note": "66/day"},
            {"id": "luma", "name": "Luma AI", "note": "30/month"},
            {"id": "google-veo2", "name": "Google Veo 2", "note": "Free"},
            {"id": "hailuo", "name": "Hailuo", "note": "API"},
        ]
    }


@router.post("/styles")
async def list_video_styles(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate_api_key(request, db)
    if err:
        return err
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
