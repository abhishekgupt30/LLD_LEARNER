from uuid import UUID

from app.core.exceptions import ProblemNotFound
from app.repositories.problem_repository import ProblemRepository


class ProblemService:
    def __init__(self, repository: ProblemRepository) -> None:
        self.repository = repository

    async def list_problems(self):
        return await self.repository.list()

    async def get_problem(self, problem_id: UUID):
        problem = await self.repository.get(problem_id)
        if not problem:
            raise ProblemNotFound(f"Problem {problem_id} was not found")
        return problem
