from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.dependencies import current_user, db_session
from app.models.user import User
from app.schemas.user import AuthResponse, LoginRequest, UserCreate, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/api/users", tags=["users"])


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(payload: UserCreate, session: AsyncSession = Depends(db_session)):
    user = await AuthService(session).signup(payload.name, str(payload.email), payload.password)
    await session.commit()
    return user


@router.post("/login", response_model=AuthResponse)
async def login(payload: LoginRequest, session: AsyncSession = Depends(db_session)):
    token, user = await AuthService(session).login(str(payload.email), payload.password)
    return AuthResponse(access_token=token, user=user)


@router.get("/me", response_model=UserResponse)
async def me(user: User = Depends(current_user)):
    return user
