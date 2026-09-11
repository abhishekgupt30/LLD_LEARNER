# LLD Lotion

LLD Lotion is a practice workbench for low-level design and machine-coding interviews. Learners solve structured design problems, save attempts, and receive deterministic checks plus optional Gemini-based architectural feedback.

## Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS
- Backend: FastAPI, SQLAlchemy 2.x, Pydantic
- Database: PostgreSQL 16 with Alembic migrations
- Evaluation: rule-based checks + Gemini hybrid evaluator

## Project structure

```text
frontend/     React/Vite application
backend/      FastAPI API, services, models, evaluators, migrations
vercel.json   Frontend/backend deployment routing
DESIGN.md     Detailed architecture and trade-offs
RESEARCH.md   Learner problem and product research
```

## Run locally with Docker

From the repository root:

```powershell
Copy-Item .env.example .env
docker compose up --build
docker compose exec backend python seed.py
```

Services:

- Frontend: run from `frontend/` at `http://localhost:3000`
- Backend API: `http://localhost:8001`
- Swagger docs: `http://localhost:8001/docs`
- API health: `http://localhost:8001/health`
- Database health: `http://localhost:8001/health/db`

## Run the frontend

```powershell
cd frontend
npm install
npm run dev
```

Production checks:

```powershell
npm run lint
npm run build
```

Set `VITE_API_BASE_URL` when the backend is not running at the default `http://localhost:8001/api`.

## Environment

Copy `.env.example` to `.env`. Important backend variables include:

```env
DATABASE_URL=postgresql+asyncpg://...
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.6-flash
GEMINI_FALLBACK_MODEL=gemini-3.5-flash-lite
JWT_SECRET=change-me-in-development
CORS_ORIGINS=http://localhost:3000
```

Keep `GEMINI_API_KEY` on the backend only. If it is empty, the application still returns transparent deterministic evaluation feedback.

## Test the backend

```powershell
cd backend
python -m pytest -q
```

Normal learner flow: choose a problem → create an attempt → save drafts → submit the 11-section design → wait for evaluation → review feedback and retry if needed.
