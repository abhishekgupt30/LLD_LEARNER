from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict

from app.domain.enums import EvaluationStatus, EvaluatorType


class EvaluationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    attempt_id: UUID
    status: EvaluationStatus
    score: int | None = None
    evaluator_type: EvaluatorType
    result: dict[str, Any]
    created_at: datetime
    completed_at: datetime | None = None


class HistoryItem(BaseModel):
    attempt_id: UUID
    problem_id: UUID
    problem_title: str
    attempt_number: int
    status: EvaluationStatus | str
    score: int | None = None
    started_at: datetime
    submitted_at: datetime | None = None
    previous_score: int | None = None
    improvement: int | None = None
