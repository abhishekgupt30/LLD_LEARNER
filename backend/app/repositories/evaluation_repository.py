from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.evaluation import Evaluation


class EvaluationRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_for_attempt(self, attempt_id: UUID) -> Evaluation | None:
        return await self.session.scalar(select(Evaluation).where(Evaluation.attempt_id == attempt_id))

    async def save(self, evaluation: Evaluation) -> Evaluation:
        self.session.add(evaluation)
        await self.session.flush()
        return evaluation
