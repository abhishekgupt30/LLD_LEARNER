from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.domain.enums import AttemptStatus


class AttemptCreate(BaseModel):
    problem_id: UUID


class AttemptResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    user_id: UUID
    problem_id: UUID
    attempt_number: int
    status: AttemptStatus
    started_at: datetime
    submitted_at: datetime | None = None
