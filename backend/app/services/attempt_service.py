from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AttemptNotFound, ProblemNotFound, UserNotFound
from app.domain.enums import AttemptStatus
from app.models.attempt import Attempt
from app.repositories.attempt_repository import AttemptRepository
from app.repositories.problem_repository import ProblemRepository
from app.models.user import User


class AttemptService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.attempts = AttemptRepository(session)

    async def create(self, user_id: UUID, problem_id: UUID) -> Attempt:
        if not await self.session.get(User, user_id):
            raise UserNotFound(f"User {user_id} was not found")
        if not await ProblemRepository(self.session).get(problem_id):
            raise ProblemNotFound(f"Problem {problem_id} was not found")
        attempt = Attempt(user_id=user_id, problem_id=problem_id, attempt_number=await self.attempts.next_number(user_id, problem_id), status=AttemptStatus.IN_PROGRESS)
        return await self.attempts.create(attempt)

    async def get(self, attempt_id: UUID) -> Attempt:
        attempt = await self.attempts.get(attempt_id)
        if not attempt:
            raise AttemptNotFound(f"Attempt {attempt_id} was not found")
        return attempt
