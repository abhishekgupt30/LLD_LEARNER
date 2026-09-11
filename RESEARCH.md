# Research notes

The implementation uses FastAPI, Pydantic v2, SQLAlchemy 2.x, PostgreSQL 16, Alembic, pytest, and the maintained `google-genai` SDK. Provider calls are isolated in `GeminiEvaluator`; tests and local development do not require a real Gemini key.
