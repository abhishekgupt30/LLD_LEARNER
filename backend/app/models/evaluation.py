from datetime import datetime
from uuid import UUID

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.enums import EvaluationStatus, EvaluatorType
from app.models.base import Base, UUIDTimestampMixin


class Evaluation(UUIDTimestampMixin, Base):
    __tablename__ = "evaluations"

    attempt_id: Mapped[UUID] = mapped_column(ForeignKey("attempts.id", ondelete="CASCADE"), unique=True, nullable=False)
    status: Mapped[EvaluationStatus] = mapped_column(String(20), default=EvaluationStatus.PENDING, nullable=False)
    score: Mapped[int | None] = mapped_column(Integer)
    evaluator_type: Mapped[EvaluatorType] = mapped_column(String(20), nullable=False)
    result: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    attempt: Mapped["Attempt"] = relationship(back_populates="evaluation")
