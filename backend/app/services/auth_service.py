import hashlib
from uuid import UUID

import jwt
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.exceptions import UserNotFound
from app.models.user import User


def password_hash(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def signup(self, name: str, email: str, password: str) -> User:
        user = User(name=name, email=email, password_hash=password_hash(password))
        self.session.add(user)
        await self.session.flush()
        return user

    async def login(self, email: str, password: str) -> tuple[str, User]:
        user = await self.session.scalar(select(User).where(User.email == email))
        if not user or user.password_hash != password_hash(password):
            raise UserNotFound("Invalid email or password")
        return jwt.encode({"sub": str(user.id)}, get_settings().jwt_secret, algorithm="HS256"), user

    async def current_user(self, token: str) -> User:
        try:
            user_id = UUID(str(jwt.decode(token, get_settings().jwt_secret, algorithms=["HS256"])["sub"]))
        except Exception as exc:
            raise UserNotFound("Invalid authentication token") from exc
        user = await self.session.get(User, user_id)
        if not user:
            raise UserNotFound("User was not found")
        return user
