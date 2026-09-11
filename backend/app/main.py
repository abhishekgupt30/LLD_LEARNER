from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.database import check_database_connection
from app.core.config import get_settings
from app.core.exceptions import AppException, AttemptNotFound, EvaluationNotFound, InvalidAttemptState, InvalidSubmission, ProblemNotFound, SubmissionAlreadyExists, SubmissionNotFound, UserNotFound
from app.api.routes import attempts, evaluations, history, problems, submissions, users


app = FastAPI(title="LLD Practice & Evaluation Platform", version="0.1.0")
app.add_middleware(CORSMiddleware, allow_origins=[x.strip() for x in get_settings().cors_origins.split(",")], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(users.router)
app.include_router(problems.router)
app.include_router(attempts.router)
app.include_router(submissions.router)
app.include_router(evaluations.router)
app.include_router(history.router)


@app.exception_handler(AppException)
async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
    status = 400
    if isinstance(exc, (ProblemNotFound, UserNotFound, AttemptNotFound, SubmissionNotFound, EvaluationNotFound)):
        status = 404
    elif isinstance(exc, (InvalidAttemptState, SubmissionAlreadyExists, InvalidSubmission)):
        status = 409
    return JSONResponse(status_code=status, content={"detail": str(exc)})


@app.get("/health", tags=["health"])
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/health/db", tags=["health"])
async def database_health() -> dict[str, str]:
    if not await check_database_connection():
        raise HTTPException(status_code=503, detail="Database is unavailable")
    return {"status": "ok", "database": "ok"}
