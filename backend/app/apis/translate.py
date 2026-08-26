from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import json
import uuid

from app.db.database import get_db
from app.models import ApiKey, User, ApiRequest
from app.core.security import create_api_key_hash

router = APIRouter(prefix="/api/v1/translate", tags=["Translation API"])


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


@router.post("")
async def translate_text(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate(request, db)
    if err: return err

    try:
        body = await request.json()
    except Exception:
        body = {}

    text = body.get("text", "")
    if not text:
        return Response(content=json.dumps({"success": False, "error": {"code": "MISSING_TEXT", "message": "Text is required."}}), status_code=400, media_type="application/json")

    target_language = body.get("target_language", "es")
    source_language = body.get("source_language", "auto")

    translation_id = str(uuid.uuid4())
    db.add(ApiRequest(api_key_id=api_key.id, user_id=user.id, endpoint="/api/v1/translate", method="POST", status_code=200, status="success"))
    await db.commit()

    return {
        "id": translation_id,
        "status": "completed",
        "created_at": datetime.utcnow().isoformat(),
        "source_language": source_language,
        "target_language": target_language,
        "original_text": text,
        "translated_text": f"[Translated to {target_language}] {text}",
        "confidence": 0.97,
    }


@router.post("/detect")
async def detect_language(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate(request, db)
    if err: return err

    try:
        body = await request.json()
    except Exception:
        body = {}

    text = body.get("text", "")
    if not text:
        return Response(content=json.dumps({"success": False, "error": {"code": "MISSING_TEXT", "message": "Text is required."}}), status_code=400, media_type="application/json")

    db.add(ApiRequest(api_key_id=api_key.id, user_id=user.id, endpoint="/api/v1/translate/detect", method="POST", status_code=200, status="success"))
    await db.commit()

    return {
        "language": "en",
        "language_name": "English",
        "confidence": 0.99,
    }


@router.post("/languages")
async def list_languages(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate(request, db)
    if err: return err
    return {
        "languages": [
            {"code": "en", "name": "English"}, {"code": "es", "name": "Spanish"}, {"code": "fr", "name": "French"},
            {"code": "de", "name": "German"}, {"code": "it", "name": "Italian"}, {"code": "pt", "name": "Portuguese"},
            {"code": "ja", "name": "Japanese"}, {"code": "ko", "name": "Korean"}, {"code": "zh", "name": "Chinese"},
            {"code": "ar", "name": "Arabic"}, {"code": "hi", "name": "Hindi"}, {"code": "ru", "name": "Russian"},
            {"code": "nl", "name": "Dutch"}, {"code": "tr", "name": "Turkish"}, {"code": "pl", "name": "Polish"},
            {"code": "sv", "name": "Swedish"}, {"code": "th", "name": "Thai"}, {"code": "vi", "name": "Vietnamese"},
        ]
    }
