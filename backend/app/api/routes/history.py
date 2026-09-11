from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import current_user, db_session
from app.models.user import User
from app.models.attempt import Attempt
from app.models.evaluation import Evaluation
from app.models.problem import Problem
from app.schemas.evaluation import HistoryItem

router = APIRouter(prefix="/api", tags=["history"])


async def history_query(session: AsyncSession, user_id: UUID, problem_id: UUID | None = None) -> list[HistoryItem]:
    query = select(Attempt, Problem, Evaluation).join(Problem).outerjoin(Evaluation).where(Attempt.user_id == user_id)
    if problem_id:
        query = query.where(Attempt.problem_id == problem_id)
    rows = (await session.execute(query.order_by(Attempt.attempt_number))).all()
    previous: int | None = None
    result: list[HistoryItem] = []
    for attempt, problem, evaluation in rows:
        score = evaluation.score if evaluation else None
        result.append(HistoryItem(attempt_id=attempt.id, problem_id=problem.id, problem_title=problem.title, attempt_number=attempt.attempt_number, status=evaluation.status if evaluation else attempt.status, score=score, started_at=attempt.started_at, submitted_at=attempt.submitted_at, previous_score=previous, improvement=score - previous if score is not None and previous is not None else None))
        if score is not None:
            previous = score
    return result


@router.get("/history", response_model=list[HistoryItem])
async def history(user: User = Depends(current_user), session: AsyncSession = Depends(db_session)):
    return await history_query(session, user.id)


@router.get("/dashboard")
async def dashboard(user: User = Depends(current_user), session: AsyncSession = Depends(db_session)):
    attempts = (await session.scalars(select(Attempt).where(Attempt.user_id == user.id))).all()
    scores = (await session.scalars(select(Evaluation.score).join(Attempt, Evaluation.attempt_id == Attempt.id).where(Attempt.user_id == user.id, Evaluation.score.is_not(None)))).all()
    return {"total_attempts": len(attempts), "completed_attempts": sum(1 for a in attempts if a.status == "COMPLETED"), "average_score": round(sum(scores) / len(scores), 1) if scores else None, "active_attempt": next((a.id for a in attempts if a.status == "IN_PROGRESS"), None)}


@router.get("/problems/{problem_id}/history", response_model=list[HistoryItem])
async def problem_history(problem_id: UUID, user: User = Depends(current_user), session: AsyncSession = Depends(db_session)):
    return await history_query(session, user.id, problem_id)
