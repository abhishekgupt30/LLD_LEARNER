from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SubmissionCreate(BaseModel):
    section_0_requirements: Any = Field(default_factory=dict)
    section_1_classes: Any = Field(default_factory=dict)
    section_2_relationships: Any = Field(default_factory=dict)
    section_3_abstractions: Any = Field(default_factory=dict)
    section_4_patterns: Any = Field(default_factory=dict)
    section_5_explanation: str = ""
    section_6_extensibility: Any = Field(default_factory=dict)
    section_7_edge_cases: Any = Field(default_factory=dict)
    section_8_tradeoffs: Any = Field(default_factory=dict)
    section_9_diagram: str = ""
    section_10_code: str = ""


class DraftRequest(SubmissionCreate):
    pass


class SubmissionResponse(SubmissionCreate):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    attempt_id: UUID
    created_at: datetime
