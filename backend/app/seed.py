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
        if not existing_apis.scalars().first():
            apis = [
                Api(
                    name="Document API",
                    slug="document-api",
                    description="Genera y gestiona documentos JSON de forma sencilla.",
                    version="1.0.0",
                    base_path="/api/v1/documents",
                ),
            ]
            db.add_all(apis)
            await db.flush()

            doc_api = (await db.execute(select(Api).where(Api.slug == "document-api"))).scalar_one()
            endpoints = [
                ApiEndpoint(api_id=doc_api.id, method="POST", path="/api/v1/documents", description="Crear un documento."),
                ApiEndpoint(api_id=doc_api.id, method="GET", path="/api/v1/documents", description="Listar documentos."),
                ApiEndpoint(api_id=doc_api.id, method="GET", path="/api/v1/documents/{id}", description="Obtener un documento por ID."),
                ApiEndpoint(api_id=doc_api.id, method="DELETE", path="/api/v1/documents/{id}", description="Eliminar un documento."),
            ]
            db.add_all(endpoints)
            print("APIs and endpoints created.")

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
