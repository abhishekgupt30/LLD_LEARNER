from collections.abc import AsyncIterator

from fastapi import Depends, Header
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db_session
from app.core.exceptions import UserNotFound
from app.models.user import User
from app.services.auth_service import AuthService


async def db_session() -> AsyncIterator[AsyncSession]:
    async for session in get_db_session():
        yield session


SessionDependency = Depends(db_session)


async def current_user(authorization: str | None = Header(default=None), session: AsyncSession = Depends(db_session)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise UserNotFound("Authentication required")
    return await AuthService(session).current_user(authorization.split(" ", 1)[1])
