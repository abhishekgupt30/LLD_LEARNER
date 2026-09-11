from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.submission import Submission


class SubmissionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_for_attempt(self, attempt_id: UUID) -> Submission | None:
        return await self.session.scalar(select(Submission).where(Submission.attempt_id == attempt_id))

    async def create(self, submission: Submission) -> Submission:
        self.session.add(submission)
        await self.session.flush()
        return submission
