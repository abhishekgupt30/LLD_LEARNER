from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import current_user, db_session
from app.models.user import User
from app.schemas.attempt import AttemptCreate, AttemptResponse
from app.services.attempt_service import AttemptService

router = APIRouter(prefix="/api/attempts", tags=["attempts"])


@router.post("", response_model=AttemptResponse, status_code=201)
async def create_attempt(payload: AttemptCreate, user: User = Depends(current_user), session: AsyncSession = Depends(db_session)):
    attempt = await AttemptService(session).create(user.id, payload.problem_id)
    await session.commit()
    return attempt


@router.get("", response_model=list[AttemptResponse])
async def list_attempts(user: User = Depends(current_user), session: AsyncSession = Depends(db_session)):
    return await AttemptService(session).attempts.list_for_user(user.id)


@router.get("/{attempt_id}", response_model=AttemptResponse)
async def get_attempt(attempt_id: UUID, user: User = Depends(current_user), session: AsyncSession = Depends(db_session)):
    attempt = await AttemptService(session).get(attempt_id)
    if attempt.user_id != user.id:
        from app.core.exceptions import AttemptNotFound
        raise AttemptNotFound("Attempt was not found")
    return attempt
