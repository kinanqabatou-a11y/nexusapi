from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import json
import uuid
import os
import httpx
import time

from app.db.database import get_db
from app.models import ApiKey, User, Subscription, Plan, ApiRequest
from app.core.security import create_api_key_hash

router = APIRouter(prefix="/api/v1/video", tags=["Video Generation API"])

UNLIMITED_EMAILS = ["lharbengytesta@gmail.com"]
NOVAI_BASE = "https://aiapi-pro.com/v1"
NOVAI_API_KEY = os.environ.get("NOVAI_API_KEY", "")


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
    if user.email in UNLIMITED_EMAILS:
        return None

    sub_result = await db.execute(select(Subscription).join(Plan).where(Subscription.user_id == user.id, Subscription.status == "active"))
    subscription = sub_result.scalar_one_or_none()
    if not subscription:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "NO_ACTIVE_SUBSCRIPTION", "message": "No active subscription."}}),
            status_code=403, media_type="application/json",
        )
    plan_result = await db.execute(select(Plan).where(Plan.id == subscription.plan_id))
    plan = plan_result.scalar_one_or_none()
    if plan and subscription.requests_used >= plan.request_limit:
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
    style = body.get("style", "cogvideox-flash")
    duration = min(body.get("duration", 9), 60)
    api_key_novai = body.get("novai_api_key", "") or NOVAI_API_KEY

    if not prompt:
        return Response(
            content=json.dumps({"success": False, "error": {"code": "MISSING_PROMPT", "message": "A text prompt is required."}}),
            status_code=400, media_type="application/json",
        )

    if api_key_novai:
        try:
            headers = {"Authorization": f"Bearer {api_key_novai}", "Content-Type": "application/json"}

            async with httpx.AsyncClient(timeout=30.0) as client:
                job_resp = await client.post(
                    f"{NOVAI_BASE}/video/generations",
                    headers=headers,
                    json={"model": "cogvideox-flash", "prompt": prompt},
                )
                if job_resp.status_code in (401, 403):
                    return Response(
                        content=json.dumps({"success": False, "error": {"code": "INVALID_NOVAI_KEY", "message": "NovAI API key is invalid."}}),
                        status_code=401, media_type="application/json",
                    )
                job_resp.raise_for_status()
                job_data = job_resp.json()
                job_id = job_data.get("id")
                if not job_id:
                    return Response(
                        content=json.dumps({"success": False, "error": {"code": "NO_JOB_ID", "message": "Failed to start video generation."}}),
                        status_code=500, media_type="application/json",
                    )

            for _ in range(60):
                time.sleep(5)
                async with httpx.AsyncClient(timeout=30.0) as client:
                    r = await client.get(
                        f"{NOVAI_BASE}/video/generations/{job_id}",
                        headers=headers,
                        params={"model": "cogvideox-flash"},
                    )
                    r.raise_for_status()
                    data = r.json()
                    status = data.get("status", "")
                    if status == "succeeded":
                        video_url = data.get("content", {}).get("video_url")
                        if video_url:
                            db.add(ApiRequest(api_key_id=api_key.id, user_id=user.id, endpoint="/api/v1/video/generate", method="POST", status_code=200, status="success"))
                            await db.commit()
                            return {
                                "success": True,
                                "id": str(uuid.uuid4()),
                                "status": "completed",
                                "prompt": prompt,
                                "model": "cogvideox-flash",
                                "duration_seconds": duration,
                                "video_url": video_url,
                                "title": prompt[:50],
                            }
                    elif status == "failed":
                        return Response(
                            content=json.dumps({"success": False, "error": {"code": "GENERATION_FAILED", "message": "Video generation failed."}}),
                            status_code=500, media_type="application/json",
                        )

            return Response(
                content=json.dumps({"success": False, "error": {"code": "TIMEOUT", "message": "Video generation timed out."}}),
                status_code=504, media_type="application/json",
            )
        except httpx.TimeoutException:
            return Response(
                content=json.dumps({"success": False, "error": {"code": "TIMEOUT", "message": "Video generation timed out."}}),
                status_code=504, media_type="application/json",
            )
        except Exception as e:
            return Response(
                content=json.dumps({"success": False, "error": {"code": "NOVAI_ERROR", "message": f"Error: {str(e)}"}}),
                status_code=502, media_type="application/json",
            )
    else:
        return {
            "success": True,
            "id": str(uuid.uuid4()),
            "status": "processing",
            "prompt": prompt,
            "model": style,
            "duration_seconds": duration,
            "estimated_time": f"{duration * 3}s",
            "message": "Video generation queued. Configure NOVAI_API_KEY for real video generation.",
        }


@router.get("/models")
async def list_video_models(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate_api_key(request, db)
    if err:
        return err
    return {
        "models": [
            {"id": "cogvideox-flash", "name": "CogVideoX Flash", "note": "Free via NovAI", "default": True},
            {"id": "agnes-v20", "name": "Agnes v2.0", "note": "Key required"},
            {"id": "agnes-v25", "name": "Agnes v2.5", "note": "Key required"},
            {"id": "hailuo", "name": "Hailuo AI", "note": "API"},
            {"id": "kling", "name": "Kling AI", "note": "66/day"},
            {"id": "luma", "name": "Luma AI", "note": "30/month"},
            {"id": "google-veo2", "name": "Google Veo 2", "note": "Free"},
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


@router.get("/status/{video_id}")
async def video_status(video_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate_api_key(request, db)
    if err:
        return err
    return {
        "id": video_id,
        "status": "completed",
        "message": "Use video_url from the original generation response to download.",
    }
