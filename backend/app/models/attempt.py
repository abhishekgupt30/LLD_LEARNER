from datetime import datetime
from uuid import UUID

from sqlalchemy import DateTime, ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.domain.enums import AttemptStatus
from app.models.base import Base, UUIDTimestampMixin


class Attempt(UUIDTimestampMixin, Base):
    __tablename__ = "attempts"
    __table_args__ = (
        UniqueConstraint("user_id", "problem_id", "attempt_number"),
        Index("ix_attempts_user_problem", "user_id", "problem_id"),
    )

    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    problem_id: Mapped[UUID] = mapped_column(ForeignKey("problems.id", ondelete="CASCADE"), nullable=False)
    attempt_number: Mapped[int] = mapped_column(Integer, nullable=False)
    status: Mapped[AttemptStatus] = mapped_column(String(20), default=AttemptStatus.IN_PROGRESS, nullable=False)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default="now()", nullable=False)
    submitted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped["User"] = relationship(back_populates="attempts")
    problem: Mapped["Problem"] = relationship(back_populates="attempts")
    submission: Mapped["Submission | None"] = relationship(back_populates="attempt", uselist=False)
    evaluation: Mapped["Evaluation | None"] = relationship(back_populates="attempt", uselist=False)
