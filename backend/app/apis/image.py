from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import json
import uuid
import urllib.parse
import httpx

from app.db.database import get_db
from app.models import ApiKey, User, Subscription, Plan, ApiRequest
from app.core.security import create_api_key_hash

router = APIRouter(prefix="/api/v1/image", tags=["Image Generation API"])


async def authenticate(request: Request, db: AsyncSession):
    auth = request.headers.get("authorization", "")
    if not auth.startswith("Bearer "):
        return None, None, Response(content=json.dumps({"success": False, "error": {"code": "MISSING_API_KEY", "message": "Bearer token required."}}), status_code=401, media_type="application/json")
    key_hash = create_api_key_hash(auth[7:])
    result = await db.execute(select(ApiKey).where(ApiKey.key_hash == key_hash, ApiKey.is_active == True))
    api_key = result.scalar_one_or_none()
    if not api_key:
        return None, None, Response(content=json.dumps({"success": False, "error": {"code": "INVALID_API_KEY", "message": "Invalid API key."}}), status_code=401, media_type="application/json")
    user = (await db.execute(select(User).where(User.id == api_key.user_id))).scalar_one_or_none()
    return api_key, user, None


@router.post("/generate", status_code=200)
async def generate_image(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate(request, db)
    if err: return err

    try:
        body = await request.json()
    except Exception:
        body = {}

    prompt = body.get("prompt", "")
    if not prompt:
        return Response(content=json.dumps({"success": False, "error": {"code": "MISSING_PROMPT", "message": "Prompt is required."}}), status_code=400, media_type="application/json")

    size = body.get("size", "1024x1024")
    style = body.get("style", "vivid")
    quality = body.get("quality", "standard")
    n = min(body.get("n", 1), 4)

    image_id = str(uuid.uuid4())

    images = []
    for i in range(n):
        encoded = urllib.parse.quote(prompt[:300])
        seed = abs(hash(f"{image_id}_{i}")) % 999999
        w, h = (1024, 1024)
        if "x" in size:
            parts = size.split("x")
            try:
                w, h = int(parts[0]), int(parts[1])
            except Exception:
                pass
        url = f"https://image.pollinations.ai/prompt/{encoded}?width={w}&height={h}&nologo=true&seed={seed}&model=flux"
        images.append({
            "index": i,
            "url": url,
            "size": size,
            "style": style,
            "quality": quality,
        })

    db.add(ApiRequest(api_key_id=api_key.id, user_id=user.id, endpoint="/api/v1/image/generate", method="POST", status_code=200, status="success"))
    await db.commit()

    return {
        "id": image_id,
        "status": "completed",
        "created_at": datetime.utcnow().isoformat() if hasattr(datetime, 'utcnow') else "",
        "images": images,
    }


@router.post("/variations")
async def create_variation(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate(request, db)
    if err: return err

    try:
        body = await request.json()
    except Exception:
        body = {}

    image_url = body.get("image_url", "")
    if not image_url:
        return Response(content=json.dumps({"success": False, "error": {"code": "MISSING_IMAGE", "message": "image_url is required."}}), status_code=400, media_type="application/json")

    n = min(body.get("n", 1), 4)
    size = body.get("size", "1024x1024")
    var_id = str(uuid.uuid4())

    db.add(ApiRequest(api_key_id=api_key.id, user_id=user.id, endpoint="/api/v1/image/variations", method="POST", status_code=200, status="success"))
    await db.commit()

    return {
        "id": var_id,
        "status": "completed",
        "variations": [{"index": i, "url": f"https://image.pollinations.ai/prompt/variation?width=1024&height=1024&nologo=true&seed={abs(hash(f'{var_id}_{i}'))%999999}&model=flux", "size": size} for i in range(n)],
    }


@router.post("/styles")
async def list_image_styles(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate(request, db)
    if err: return err
    return {
        "styles": [
            {"id": "vivid", "name": "Vivid", "description": "Hyper-real and artistic"},
            {"id": "natural", "name": "Natural", "description": "More realistic look"},
            {"id": "anime", "name": "Anime", "description": "Japanese anime style"},
            {"id": "oil-painting", "name": "Oil Painting", "description": "Classic oil painting"},
            {"id": "pixel-art", "name": "Pixel Art", "description": "Retro pixel art style"},
            {"id": "3d-render", "name": "3D Render", "description": "3D rendered output"},
            {"id": "watercolor", "name": "Watercolor", "description": "Watercolor painting style"},
        ]
    }
