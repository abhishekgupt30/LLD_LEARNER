from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import current_user, db_session
from app.core.database import session_factory
from app.domain.enums import EvaluatorType
from app.schemas.evaluation import EvaluationResponse
from app.schemas.submission import SubmissionCreate, SubmissionResponse
from app.services.evaluation_service import EvaluationService
from app.services.submission_service import SubmissionService
from app.services.attempt_service import AttemptService

router = APIRouter(prefix="/api/attempts", tags=["submissions"])


async def evaluate_in_background(attempt_id: UUID) -> None:
    async with session_factory() as session:
        try:
            await EvaluationService(session).run(attempt_id, EvaluatorType.HYBRID)
        except Exception:
            # EvaluationService persists FAILED state and the API exposes it for retry.
            pass


@router.post("/{attempt_id}/submit", response_model=SubmissionResponse, status_code=201)
async def submit(attempt_id: UUID, payload: SubmissionCreate, background_tasks: BackgroundTasks, user=Depends(current_user), session: AsyncSession = Depends(db_session)):
    attempt = await AttemptService(session).get(attempt_id)
    if attempt.user_id != user.id:
        from app.core.exceptions import AttemptNotFound
        raise AttemptNotFound("Attempt was not found")
    submission = await SubmissionService(session).submit(attempt_id, payload.model_dump())
    await session.commit()
    background_tasks.add_task(evaluate_in_background, attempt_id)
    return submission


@router.put("/{attempt_id}/draft", response_model=SubmissionResponse)
async def save_draft(attempt_id: UUID, payload: SubmissionCreate, user=Depends(current_user), session: AsyncSession = Depends(db_session)):
    attempt = await AttemptService(session).get(attempt_id)
    if attempt.user_id != user.id:
        from app.core.exceptions import AttemptNotFound
        raise AttemptNotFound("Attempt was not found")
    submission = await SubmissionService(session).save_draft(attempt_id, payload.model_dump())
    await session.commit()
    return submission


@router.get("/{attempt_id}/submission", response_model=SubmissionResponse)
async def get_submission(attempt_id: UUID, user=Depends(current_user), session: AsyncSession = Depends(db_session)):
    attempt = await AttemptService(session).get(attempt_id)
    if attempt.user_id != user.id:
        from app.core.exceptions import AttemptNotFound
        raise AttemptNotFound("Attempt was not found")
    submission = await SubmissionService(session).get(attempt_id)
    if not submission:
        from app.core.exceptions import SubmissionNotFound
        raise SubmissionNotFound(f"Submission for attempt {attempt_id} was not found")
    return submission
