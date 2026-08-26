import asyncio
import json
from app.db.database import async_session, init_db
from app.models import Plan, Api, ApiEndpoint, User
from app.core.security import get_password_hash


async def seed():
    await init_db()

    async with async_session() as db:
        from sqlalchemy import select

        # Plans
        existing_plans = await db.execute(select(Plan))
        if not existing_plans.scalars().first():
            plans = [
                Plan(name="Free", slug="free", description="Perfecto para empezar", price_monthly=0, request_limit=500, api_key_limit=1, features=json.dumps(["500 requests/mes", "1 API Key", "Document API"]), sort_order=1),
                Plan(name="Basic", slug="basic", description="Para pequeñas empresas", price_monthly=9, request_limit=5000, api_key_limit=5, features=json.dumps(["5.000 requests/mes", "5 API Keys", "Document API", "Soporte estándar"]), sort_order=2),
                Plan(name="Pro", slug="pro", description="Para empresas en crecimiento", price_monthly=29, request_limit=25000, api_key_limit=20, features=json.dumps(["25.000 requests/mes", "20 API Keys", "Todas las APIs", "Estadísticas avanzadas", "Soporte prioritario"]), sort_order=3),
                Plan(name="Business", slug="business", description="Para grandes empresas", price_monthly=79, request_limit=100000, api_key_limit=999, features=json.dumps(["100.000 requests/mes", "API Keys ilimitadas", "Todas las APIs", "Estadísticas avanzadas", "Soporte prioritario"]), sort_order=4),
            ]
            db.add_all(plans)
            await db.flush()
            print("Plans created.")

        # APIs
        existing_apis = await db.execute(select(Api))
        existing_slugs = {a.slug for a in existing_apis.scalars().all()}

        apis_to_add = []
        if "document-api" not in existing_slugs:
            apis_to_add.append(Api(name="Document API", slug="document-api", description="Genera y gestiona documentos JSON de forma sencilla.", version="1.0.0", base_path="/api/v1/documents"))
        if "video-api" not in existing_slugs:
            apis_to_add.append(Api(name="Video Generation API", slug="video-api", description="Genera videos con inteligencia artificial a partir de texto.", version="1.0.0", base_path="/api/v1/video"))
        if "image-api" not in existing_slugs:
            apis_to_add.append(Api(name="Image Generation API", slug="image-api", description="Genera imágenes con IA desde prompts de texto.", version="1.0.0", base_path="/api/v1/image"))
        if "tts-api" not in existing_slugs:
            apis_to_add.append(Api(name="Text-to-Speech API", slug="tts-api", description="Convierte texto en voz natural con múltiples voces y idiomas.", version="1.0.0", base_path="/api/v1/tts"))
        if "translation-api" not in existing_slugs:
            apis_to_add.append(Api(name="Translation API", slug="translation-api", description="Traduce texto entre más de 18 idiomas en tiempo real.", version="1.0.0", base_path="/api/v1/translate"))

        if apis_to_add:
            db.add_all(apis_to_add)
            await db.flush()
            print(f"Added {len(apis_to_add)} new APIs.")

        all_apis = {a.slug: a for a in (await db.execute(select(Api))).scalars().all()}

        existing_endpoints = await db.execute(select(ApiEndpoint))
        existing_ep_keys = {(e.api_id, e.method, e.path) for e in existing_endpoints.scalars().all()}

        endpoints = []
        api_configs = [
            ("document-api", [
                ("POST", "/api/v1/documents", "Crear un documento."),
                ("GET", "/api/v1/documents", "Listar documentos."),
                ("GET", "/api/v1/documents/{id}", "Obtener un documento por ID."),
                ("DELETE", "/api/v1/documents/{id}", "Eliminar un documento."),
            ]),
            ("video-api", [
                ("POST", "/api/v1/video/generate", "Generar un video desde texto."),
                ("GET", "/api/v1/video/status/{id}", "Consultar estado del video."),
                ("POST", "/api/v1/video/styles", "Listar estilos disponibles."),
            ]),
            ("image-api", [
                ("POST", "/api/v1/image/generate", "Generar imagen desde texto."),
                ("POST", "/api/v1/image/variations", "Crear variaciones de imagen."),
                ("POST", "/api/v1/image/styles", "Listar estilos de imagen."),
            ]),
            ("tts-api", [
                ("POST", "/api/v1/tts/synthesize", "Sintetizar voz desde texto."),
                ("POST", "/api/v1/tts/voices", "Listar voces disponibles."),
                ("POST", "/api/v1/tts/languages", "Listar idiomas soportados."),
            ]),
            ("translation-api", [
                ("POST", "/api/v1/translate", "Traducir texto."),
                ("POST", "/api/v1/translate/detect", "Detectar idioma del texto."),
                ("POST", "/api/v1/translate/languages", "Listar idiomas disponibles."),
            ]),
        ]

        for slug, eps in api_configs:
            api = all_apis.get(slug)
            if not api:
                continue
            for method, path, desc in eps:
                if (api.id, method, path) not in existing_ep_keys:
                    endpoints.append(ApiEndpoint(api_id=api.id, method=method, path=path, description=desc))

        if endpoints:
            db.add_all(endpoints)
            print(f"Added {len(endpoints)} new endpoints.")

        # Admin user
        admin_result = await db.execute(select(User).where(User.email == "admin@nexusapi.com"))
        if not admin_result.scalar_one_or_none():
            admin = User(
                email="admin@nexusapi.com",
                first_name="Admin",
                last_name="NexusAPI",
                hashed_password=get_password_hash("Admin123!"),
                role="admin",
                is_active=True,
                is_verified=True,
            )
            db.add(admin)

            demo = User(
                email="demo@nexusapi.com",
                first_name="Demo",
                last_name="User",
                hashed_password=get_password_hash("Demo123!"),
                role="user",
                is_active=True,
                is_verified=True,
            )
            db.add(demo)
            print("Admin and demo users created.")

        await db.commit()
        print("Seed complete!")


if __name__ == "__main__":
    asyncio.run(seed())
