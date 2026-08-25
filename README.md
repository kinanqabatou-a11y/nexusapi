# AutoAPI

A production-ready SaaS platform for building, managing, and monetizing REST APIs — with built-in authentication, rate limiting, billing, and analytics.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Browser)                        │
│                    Next.js  ·  React  ·  TypeScript             │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                          │
│                    Port 3000  ·  SSR / CSR                       │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTP / API Proxy
                               ▼
┌──────────────────────────────────────────────────────────────────┐
│                      Backend (FastAPI)                           │
│                Port 8000  ·  Async  ·  Python 3.12              │
│  ┌──────────┐  ┌──────────────┐  ┌──────────┐  ┌────────────┐  │
│  │  Auth     │  │  API Gateway │  │  Billing  │  │  Analytics │  │
│  │  (JWT)    │  │  (Key check) │  │ (Stripe)  │  │  (Usage)   │  │
│  └──────────┘  └──────────────┘  └──────────┘  └────────────┘  │
└────────┬───────────────────┬───────────────────┬────────────────┘
         │                   │                   │
         ▼                   ▼                   ▼
┌──────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  PostgreSQL   │  │     Redis       │  │     Stripe      │
│  Port 5432    │  │   Port 6379     │  │     API         │
│  (primary DB) │  │  (cache/queue)  │  │   (payments)    │
└──────────────┘  └─────────────────┘  └─────────────────┘
```

---

## Tech Stack

| Layer       | Technology                                      |
| ----------- | ----------------------------------------------- |
| Frontend    | Next.js 14, React 18, TypeScript, Tailwind CSS  |
| Backend     | Python 3.12, FastAPI, SQLAlchemy 2 (async), Alembic |
| Database    | PostgreSQL 16, Redis 7                          |
| Auth        | JWT (access + refresh tokens), bcrypt           |
| Payments    | Stripe (subscriptions, invoices)                |
| Containers  | Docker, Docker Compose                          |

---

## Prerequisites

- **Python 3.12+**
- **Node.js 20+**
- **Docker & Docker Compose** (for containerized setup)
- **PostgreSQL 16** (if running locally)
- **Redis 7** (if running locally)

---

## Quick Start — Development (Local)

```bash
# Clone the repo
git clone https://github.com/your-org/autoapi.git
cd autoapi

# Backend
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env        # edit with your values
alembic upgrade head
python -m scripts.seed
uvicorn app.main:app --reload --port 8000

# Frontend (new terminal)
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open **http://localhost:3000** — you should see the AutoAPI dashboard.

---

## Docker Setup

```bash
# Production-like environment
docker compose up --build -d

# Development with hot-reload
docker compose -f docker-compose.dev.yml up --build -d

# View logs
docker compose logs -f backend
docker compose logs -f frontend

# Stop everything
docker compose down
```

| Service    | Local URL                     |
| ---------- | ----------------------------- |
| Frontend   | http://localhost:3000          |
| Backend    | http://localhost:8000          |
| API Docs   | http://localhost:8000/docs     |
| PostgreSQL | localhost:5432                |
| Redis      | localhost:6379                |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable                 | Required | Default                            | Description                         |
| ------------------------ | -------- | ---------------------------------- | ----------------------------------- |
| `DATABASE_URL`           | Yes      | —                                  | Async PostgreSQL connection string  |
| `REDIS_URL`              | Yes      | —                                  | Redis connection string              |
| `SECRET_KEY`             | Yes      | —                                  | JWT signing secret (use `openssl rand -hex 32`) |
| `STRIPE_SECRET_KEY`      | Yes      | —                                  | Stripe secret API key               |
| `STRIPE_WEBHOOK_SECRET`  | Yes      | —                                  | Stripe webhook signing secret       |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No  | 30                                 | JWT access token lifetime           |
| `DEBUG`                  | No       | false                              | Enable debug mode                   |

### Frontend (`frontend/.env.local`)

| Variable                | Required | Default                   | Description                       |
| ----------------------- | -------- | ------------------------- | --------------------------------- |
| `NEXT_PUBLIC_API_URL`   | Yes      | http://localhost:8000     | Backend API base URL              |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Yes | —               | Stripe publishable key            |
| `NEXTAUTH_SECRET`       | Yes      | —                         | NextAuth session secret           |
| `NEXTAUTH_URL`          | No       | http://localhost:3000     | Application URL                   |

---

## Database Setup & Migrations

```bash
# Create tables (Alembic)
cd backend
alembic upgrade head

# Generate a new migration after model changes
alembic revision --autogenerate -m "description of change"

# Roll back one step
alembic downgrade -1

# Seed initial data (plans + admin user)
python -m scripts.seed
```

Default admin credentials after seeding:
- **Email:** `admin@autoapi.dev`
- **Password:** `Admin123!`

---

## API Documentation

Once the backend is running, interactive API docs are available at:

| Format  | URL                               |
| ------- | --------------------------------- |
| Swagger | http://localhost:8000/docs         |
| ReDoc   | http://localhost:8000/redoc        |
| OpenAPI | http://localhost:8000/openapi.json |

---

## Stripe Configuration

1. Create a Stripe account at https://stripe.com
2. Copy your **Secret Key** (test mode) → `STRIPE_SECRET_KEY`
3. Copy your **Publishable Key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Install Stripe CLI: `brew install stripe/stripe-cli/stripe`
5. Log in: `stripe login`
6. Forward webhooks to your local backend:

```bash
stripe listen --forward-to localhost:8000/api/v1/webhooks/stripe
```

7. Copy the webhook signing secret → `STRIPE_WEBHOOK_SECRET`

### Creating Products & Prices

Plans in the database are linked to Stripe Price IDs. After creating a plan in Stripe:

1. Create a Product in the Stripe Dashboard
2. Add a recurring Price to the Product
3. Update the plan record with the Stripe price ID:

```sql
UPDATE plans SET stripe_price_id = 'price_xxx' WHERE name = 'starter';
```

---

## Testing

```bash
# Backend tests
cd backend
pytest -v

# With coverage
pytest --cov=app --cov-report=html

# Frontend tests
cd frontend
npm run test

# E2E tests
npm run test:e2e
```

---

## Deployment Notes

### Environment

- Set all environment variables in production (no `.env` files on the server)
- Use strong, unique `SECRET_KEY` and database passwords
- Enable TLS termination at the reverse proxy (nginx, Cloudflare, etc.)

### Recommended Stack

- **Hosting:** AWS ECS / DigitalOcean App Platform / Railway
- **Database:** Managed PostgreSQL (AWS RDS, Supabase, Neon)
- **Cache:** Managed Redis (Upstash, Redis Cloud)
- **CDN:** Cloudflare
- **CI/CD:** GitHub Actions

### Production Checklist

- [ ] Run `alembic upgrade head` on the production database
- [ ] Seed plans: `python -m scripts.seed`
- [ ] Configure Stripe webhooks with production URL
- [ ] Set `DEBUG=false`
- [ ] Configure CORS origins for your production domain
- [ ] Set up monitoring and alerting
- [ ] Enable database backups

---

## License

MIT License. See [LICENSE](LICENSE) for details.
