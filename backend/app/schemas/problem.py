from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field
from typing import Any


class ProblemBase(BaseModel):
    title: str
    difficulty: str
    prerequisites: list[str] = Field(default_factory=list)
    description: str
    sample_scenario: str
    requirements: list[str] = Field(default_factory=list)
    constraints: list[str] = Field(default_factory=list)
    hints: list[str] = Field(default_factory=list)
    expected_concepts: list[str] = Field(default_factory=list)
    evaluation_criteria: Any = Field(default_factory=list)
    estimated_time: int = 45
    patterns: list[str] = Field(default_factory=list)


class ProblemResponse(ProblemBase):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    slug: str
    created_at: datetime
