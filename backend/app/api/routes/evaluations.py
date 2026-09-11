from uuid import UUID

from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import current_user, db_session
from app.api.routes.submissions import evaluate_in_background
from app.core.exceptions import EvaluationFailed
from app.domain.enums import EvaluatorType
from app.domain.enums import AttemptStatus, EvaluationStatus
from app.schemas.evaluation import EvaluationResponse
from app.services.evaluation_service import EvaluationService
from app.services.attempt_service import AttemptService

router = APIRouter(prefix="/api/attempts", tags=["evaluations"])


@router.get("/{attempt_id}/evaluation", response_model=EvaluationResponse)
async def get_evaluation(attempt_id: UUID, user=Depends(current_user), session: AsyncSession = Depends(db_session)):
    attempt = await AttemptService(session).get(attempt_id)
    if attempt.user_id != user.id:
        from app.core.exceptions import AttemptNotFound
        raise AttemptNotFound("Attempt was not found")
    return await EvaluationService(session).get(attempt_id)


@router.post("/{attempt_id}/evaluation/retry", response_model=EvaluationResponse)
async def retry_evaluation(attempt_id: UUID, background_tasks: BackgroundTasks, user=Depends(current_user), session: AsyncSession = Depends(db_session)):
    evaluation = await EvaluationService(session).get(attempt_id)
    evaluation.status = EvaluationStatus.PENDING
    evaluation.result = {}
    evaluation.score = None
    attempt = await AttemptService(session).get(attempt_id)
    if attempt.user_id != user.id:
        from app.core.exceptions import AttemptNotFound
        raise AttemptNotFound("Attempt was not found")
    attempt.status = AttemptStatus.EVALUATING
    await session.commit()
    background_tasks.add_task(evaluate_in_background, attempt_id)
    return evaluation
