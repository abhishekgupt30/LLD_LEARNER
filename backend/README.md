# Backend

The application is organized as a modular monolith:

- `api`: HTTP routes and dependency wiring
- `core`: configuration, database, and application exceptions
- `models`: SQLAlchemy persistence models
- `schemas`: Pydantic request/response contracts
- `repositories`: persistence queries
- `services`: business workflows and state transitions
- `evaluators`: rule-based, Gemini, and hybrid evaluation strategies
- `domain`: shared enums and result contracts

Alembic migrations run automatically when the container starts. Seed data is loaded separately with `python seed.py`.
