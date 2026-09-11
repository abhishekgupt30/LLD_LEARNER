from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import db_session
from app.schemas.problem import ProblemResponse
from app.repositories.problem_repository import ProblemRepository
from app.services.problem_service import ProblemService

router = APIRouter(prefix="/api/problems", tags=["problems"])


@router.get("", response_model=list[ProblemResponse])
async def list_problems(session: AsyncSession = Depends(db_session)):
    return await ProblemService(ProblemRepository(session)).list_problems()


@router.get("/{problem_id}", response_model=ProblemResponse)
async def get_problem(problem_id: UUID, session: AsyncSession = Depends(db_session)):
    return await ProblemService(ProblemRepository(session)).get_problem(problem_id)
