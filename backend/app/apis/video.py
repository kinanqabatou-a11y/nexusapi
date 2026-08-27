from fastapi import APIRouter, Request, Response, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import json
import os
import httpx
import asyncio

from app.db.database import get_db, async_session
from app.models import ApiKey, User, Subscription, Plan, ApiRequest, VideoJob
from app.core.security import create_api_key_hash

router = APIRouter(prefix="/api/v1/video", tags=["Video Generation API"])

UNLIMITED_EMAILS = ["lharbengytesta@gmail.com"]
NOVAI_BASE = "https://aiapi-pro.com/v1"
NOVAI_API_KEY_FALLBACK = "nvai-bd723155687d4c369f93ddcf18f2debc5a193723c9bca2f0"
NOVAI_API_KEY = os.environ.get("NOVAI_API_KEY", "") or NOVAI_API_KEY_FALLBACK


def _json(content, status=200):
    return Response(content=json.dumps(content), status_code=status, media_type="application/json")


async def authenticate_api_key(request: Request, db: AsyncSession):
    auth_header = request.headers.get("authorization", "")
    if not auth_header.startswith("Bearer "):
        return None, None, _json({"success": False, "error": {"code": "MISSING_API_KEY", "message": "Authorization header with Bearer token required."}}, 401)
    raw_key = auth_header[7:]
    key_hash = create_api_key_hash(raw_key)
    key_result = await db.execute(select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.is_active == True))
    api_key = key_result.scalar_one_or_none()
    if not api_key:
        return None, None, _json({"success": False, "error": {"code": "INVALID_API_KEY", "message": "The API key is invalid or has been revoked."}}, 401)
    user_result = await db.execute(select(User).where(User.id == api_key.user_id))
    user = user_result.scalar_one_or_none()
    return api_key, user, None


async def authenticate_with_bypass(request: Request, db: AsyncSession):
    """Authenticate API key or auto-approve known unlimited/bypass keys."""
    api_key_obj, user, err = await authenticate_api_key(request, db)
    if err:
        auth = request.headers.get("authorization", "")
        raw_key = auth[7:] if auth.startswith("Bearer ") else ""
        bypass_markers = ["lharbengytesta", "kinanqabatou"]
        if not raw_key or not any(m in raw_key.lower() for m in bypass_markers):
            return None, None, err
        # Bypass: find the unlimited user (created by seed). No key row is created
        # to avoid DB writes on every request (SQLite on Render free tier locks).
        user_result = await db.execute(select(User).where(User.email.in_(UNLIMITED_EMAILS)))
        user = user_result.scalars().first()
        if not user:
            # Fallback: create once
            user = User(
                email=UNLIMITED_EMAILS[0],
                first_name="Unlimited",
                last_name="User",
                hashed_password="bypass",
                role="user",
                is_active=True,
                is_verified=True,
            )
            db.add(user)
            await db.flush()
        api_key_obj = None
    return api_key_obj, user, None


async def check_limits(user, db: AsyncSession):
    if user.email in UNLIMITED_EMAILS:
        return None
    sub_result = await db.execute(select(Subscription).join(Plan).where(Subscription.user_id == user.id, Subscription.status == "active"))
    subscription = sub_result.scalar_one_or_none()
    if not subscription:
        return _json({"success": False, "error": {"code": "NO_ACTIVE_SUBSCRIPTION", "message": "No active subscription."}}, 403)
    plan_result = await db.execute(select(Plan).where(Plan.id == subscription.plan_id))
    plan = plan_result.scalar_one_or_none()
    if plan and subscription.requests_used >= plan.request_limit:
        return _json({"success": False, "error": {"code": "MONTHLY_LIMIT_REACHED", "message": "Monthly API request limit reached."}}, 429)
    return None


async def start_novai_job(prompt: str, api_key_novai: str):
    """Start a NovAI video generation job, return (novai_job_id, headers)."""
    headers = {"Authorization": f"Bearer {api_key_novai}", "Content-Type": "application/json"}
    async with httpx.AsyncClient(timeout=25.0) as client:
        job_resp = await client.post(
            f"{NOVAI_BASE}/video/generations",
            headers=headers,
            json={"model": "cogvideox-flash", "prompt": prompt},
        )
        if job_resp.status_code == 429:
            raise RateLimitError("NovAI daily free video limit reached (5/day). Try again later or use a paid key.")
        if job_resp.status_code in (401, 403):
            raise PermissionError("NovAI API key is invalid.")
        job_resp.raise_for_status()
        job_data = job_resp.json()
        return job_data.get("id"), headers


class RateLimitError(Exception):
    pass


async def process_video_job(job_id: str):
    """Background worker: start NovAI job, poll until done, update DB."""
    try:
        async with async_session() as db:
            job_result = await db.execute(select(VideoJob).where(VideoJob.id == job_id))
            job = job_result.scalar_one_or_none()
            if not job:
                return
            api_key_novai = NOVAI_API_KEY

            # 1. Start the NovAI job
            for attempt in range(5):
                try:
                    novai_job_id, headers = await start_novai_job(job.prompt, api_key_novai)
                    job.novai_job_id = novai_job_id
                    job.status = "processing"
                    await db.commit()
                    break
                except RateLimitError:
                    job.status = "failed"
                    job.error = "NovAI daily free video limit reached (5/day)."
                    await db.commit()
                    return
                except PermissionError:
                    job.status = "failed"
                    job.error = "NovAI API key is invalid."
                    await db.commit()
                    return
                except Exception as e:
                    job.status = "pending"
                    job.error = f"Start attempt {attempt+1} failed: {e}"
                    await db.commit()
                    await asyncio.sleep(3)

            if not job.novai_job_id:
                return

            # 2. Poll until complete
            headers = {"Authorization": f"Bearer {api_key_novai}", "Content-Type": "application/json"}
            for _ in range(60):
                await asyncio.sleep(5)
                try:
                    async with httpx.AsyncClient(timeout=25.0) as client:
                        r = await client.get(
                            f"{NOVAI_BASE}/video/generations/{job.novai_job_id}",
                            headers=headers,
                            params={"model": "cogvideox-flash"},
                        )
                        if r.status_code == 429:
                            continue
                        r.raise_for_status()
                        data = r.json()
                        status = data.get("task_status") or data.get("status", "")
                        if status in ("SUCCESS", "succeeded"):
                            video_url = None
                            video_result = data.get("video_result", [])
                            if video_result and len(video_result) > 0:
                                video_url = video_result[0].get("url")
                            if not video_url:
                                video_url = data.get("content", {}).get("video_url")
                            if video_url:
                                job.status = "completed"
                                job.video_url = video_url
                                await db.commit()
                                db.add(ApiRequest(api_key_id=job.api_key_id, user_id=job.user_id, endpoint="/api/v1/video/generate", method="POST", status_code=200, status="success"))
                                await db.commit()
                            else:
                                job.status = "failed"
                                job.error = "NovAI returned success but no video URL."
                                await db.commit()
                            return
                        elif status in ("FAILED", "failed"):
                            job.status = "failed"
                            job.error = data.get("error") or "Video generation failed."
                            await db.commit()
                            return
                except Exception:
                    pass
            job.status = "failed"
            job.error = "Video generation timed out."
            await db.commit()
    except Exception:
        pass


@router.post("/generate")
async def generate_video(request: Request, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db)):
    api_key_obj, user, err = await authenticate_with_bypass(request, db)
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
    sync = body.get("sync", False)

    if not prompt:
        return _json({"success": False, "error": {"code": "MISSING_PROMPT", "message": "A text prompt is required."}}, 400)
    if not api_key_novai:
        return _json({"success": False, "error": {"code": "NO_NOVAI_KEY", "message": "No NovAI API key configured."}}, 500)

    job = VideoJob(
        user_id=user.id,
        api_key_id=api_key_obj.id if api_key_obj else None,
        prompt=prompt,
        model=style,
        status="pending",
    )
    db.add(job)
    await db.commit()
    await db.refresh(job)

    background_tasks.add_task(process_video_job, job.id)

    return {
        "success": True,
        "id": job.id,
        "status": "pending",
        "prompt": prompt,
        "model": style,
        "duration_seconds": duration,
        "message": "Video generation started in background. Poll GET /api/v1/video/status/{id} until status is 'completed'.",
    }


@router.get("/status/{job_id}")
async def video_status(job_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    job_result = await db.execute(select(VideoJob).where(VideoJob.id == job_id))
    job = job_result.scalar_one_or_none()
    if not job:
        return _json({"success": False, "error": {"code": "JOB_NOT_FOUND", "message": "Video job not found."}}, 404)

    return {
        "success": True,
        "id": job.id,
        "status": job.status,
        "prompt": job.prompt,
        "model": job.model,
        "video_url": job.video_url if job.status == "completed" else None,
        "error": job.error,
        "message": "Still processing in background..." if job.status not in ("completed", "failed") else None,
    }


@router.get("/models")
async def list_video_models(request: Request, db: AsyncSession = Depends(get_db)):
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
