from fastapi import APIRouter, Request, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
import json
import uuid

from app.db.database import get_db
from app.models import ApiKey, User, ApiRequest
from app.core.security import create_api_key_hash

router = APIRouter(prefix="/api/v1/tts", tags=["Text-to-Speech API"])


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


@router.post("/synthesize")
async def synthesize_speech(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate(request, db)
    if err: return err

    try:
        body = await request.json()
    except Exception:
        body = {}

    text = body.get("text", "")
    if not text:
        return Response(content=json.dumps({"success": False, "error": {"code": "MISSING_TEXT", "message": "Text is required."}}), status_code=400, media_type="application/json")

    voice = body.get("voice", "alloy")
    speed = max(0.25, min(body.get("speed", 1.0), 4.0))
    response_format = body.get("response_format", "mp3")

    audio_id = str(uuid.uuid4())
    db.add(ApiRequest(api_key_id=api_key.id, user_id=user.id, endpoint="/api/v1/tts/synthesize", method="POST", status_code=200, status="success"))
    await db.commit()

    return {
        "id": audio_id,
        "status": "completed",
        "created_at": datetime.utcnow().isoformat(),
        "audio": {
            "url": f"https://api.nexusapi.com/tts/{audio_id}.{response_format}",
            "format": response_format,
            "voice": voice,
            "speed": speed,
            "duration_seconds": round(len(text) * 0.08, 2),
            "size_bytes": len(text) * 1200,
        },
        "text": text,
    }


@router.post("/voices")
async def list_voices(request: Request, db: AsyncSession = Depends(get_db)):
    api_key, user, err = await authenticate(request, db)
    if err: return err
    return {
        "voices": [
            {"id": "alloy", "name": "Alloy", "gender": "neutral", "style": "Balanced and natural"},
            {"id": "echo", "name": "Echo", "gender": "male", "style": "Deep and resonant"},
            {"id": "fable", "name": "Fable", "gender": "male", "style": "Expressive storytelling"},
            {"id": "onyx", "name": "Onyx", "gender": "male", "style": "Authoritative and commanding"},
            {"id": "nova", "name": "Nova", "gender": "female", "style": "Warm and friendly"},
            {"id": "shimmer", "name": "Shimmer", "gender": "female", "style": "Soft and calming"},
        ]
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
        ]
    }
