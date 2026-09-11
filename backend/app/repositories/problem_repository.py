from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.problem import Problem


class ProblemRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list(self) -> list[Problem]:
        return list((await self.session.scalars(select(Problem).where(~Problem.slug.like("legacy-%")).order_by(Problem.created_at))).all())

    async def get(self, problem_id: UUID) -> Problem | None:
        return await self.session.get(Problem, problem_id)

    async def create(self, problem: Problem) -> Problem:
        self.session.add(problem)
        await self.session.flush()
        return problem
