from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.attempt import Attempt


class AttemptRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, attempt_id: UUID) -> Attempt | None:
        return await self.session.get(Attempt, attempt_id)

    async def next_number(self, user_id: UUID, problem_id: UUID) -> int:
        value = await self.session.scalar(
            select(func.coalesce(func.max(Attempt.attempt_number), 0) + 1).where(
                Attempt.user_id == user_id, Attempt.problem_id == problem_id
            )
        )
        return int(value or 1)

    async def create(self, attempt: Attempt) -> Attempt:
        self.session.add(attempt)
        await self.session.flush()
        return attempt

    async def list_for_user(self, user_id: UUID) -> list[Attempt]:
        return list((await self.session.scalars(select(Attempt).where(Attempt.user_id == user_id).order_by(Attempt.started_at.desc()))).all())

    async def list_for_problem(self, user_id: UUID, problem_id: UUID) -> list[Attempt]:
        return list((await self.session.scalars(select(Attempt).where(Attempt.user_id == user_id, Attempt.problem_id == problem_id).order_by(Attempt.attempt_number))).all())
