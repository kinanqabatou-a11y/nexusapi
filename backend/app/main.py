from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.database import init_db
from app.auth.router import router as auth_router
from app.api_keys.router import router as api_keys_router
from app.subscriptions.router import router as subscriptions_router
from app.apis.documents import router as documents_router
from app.apis.video import router as video_router
from app.apis.image import router as image_router
from app.apis.tts import router as tts_router
from app.apis.translate import router as translate_router
from app.usage.router import router as dashboard_router
from app.payments.webhooks import router as webhooks_router
from app.support.router import router as support_router
from app.admin.router import router as admin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(
    title="NexusAPI",
    description="Professional API platform for businesses.",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

ALLOWED_ORIGINS = [
    "https://nexusapi-gamma.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3000",
]
FRONTEND_URL = settings.FRONTEND_URL
if FRONTEND_URL and FRONTEND_URL != "http://localhost:3000":
    for url in FRONTEND_URL.split(","):
        url = url.strip()
        if url and url not in ALLOWED_ORIGINS:
            ALLOWED_ORIGINS.append(url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An unexpected error occurred." if settings.APP_ENV == "production" else str(exc),
            },
        },
    )


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"success": False, "error": {"code": "NOT_FOUND", "message": "Resource not found."}},
    )


app.include_router(auth_router)
app.include_router(api_keys_router)
app.include_router(subscriptions_router)
app.include_router(documents_router)
app.include_router(video_router)
app.include_router(image_router)
app.include_router(tts_router)
app.include_router(translate_router)
app.include_router(dashboard_router)
app.include_router(webhooks_router)
app.include_router(support_router)
app.include_router(admin_router)


@app.get("/api/v1/health")
async def health():
    return {"status": "healthy", "service": "NexusAPI", "version": "1.0.0"}


@app.get("/api/v1/apis")
async def list_apis():
    from sqlalchemy import select
    from app.db.database import async_session
    from app.models import Api

    async with async_session() as db:
        result = await db.execute(select(Api).where(Api.is_active == True))
        apis = result.scalars().all()
        return {
            "apis": [
                {
                    "id": a.id,
                    "name": a.name,
                    "slug": a.slug,
                    "description": a.description,
                    "version": a.version,
                    "base_path": a.base_path,
                }
                for a in apis
            ]
        }
