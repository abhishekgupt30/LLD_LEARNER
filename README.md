# LLD Practice & Evaluation Platform

Backend-only modular monolith for practicing low-level design. The backend is FastAPI with async SQLAlchemy 2.x, PostgreSQL, Alembic, deterministic checks, optional Gemini reasoning, and a hybrid evaluator.

## Run

```powershell
Copy-Item .env.example .env
docker compose up --build
docker compose exec backend python seed.py
```
The API is available at `http://localhost:8000`; Swagger is at `/docs`. `GET /health` checks the process and `GET /health/db` checks PostgreSQL.

Create a user with `POST /api/users`, then create attempts with that user ID. Submit the structured Sections 0–10 to start background evaluation. Gemini is optional; without `GEMINI_API_KEY`, hybrid evaluation still returns transparent deterministic feedback and records that AI reasoning was unavailable.

Run tests inside the backend environment with `docker compose exec backend pytest`.
