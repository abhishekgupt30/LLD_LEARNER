from uuid import UUID

from sqlalchemy import JSON, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDTimestampMixin


class Problem(UUIDTimestampMixin, Base):
    __tablename__ = "problems"

    title: Mapped[str] = mapped_column(String(200), nullable=False)
    slug: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    difficulty: Mapped[str] = mapped_column(String(30), nullable=False)
    prerequisites: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    sample_scenario: Mapped[str] = mapped_column(Text, nullable=False)
    requirements: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    constraints: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    hints: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    expected_concepts: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    evaluation_criteria: Mapped[object] = mapped_column(JSON, default=list, nullable=False)
    estimated_time: Mapped[int] = mapped_column(Integer, default=45, nullable=False)
    patterns: Mapped[list[str]] = mapped_column(JSON, default=list, nullable=False)
    attempts: Mapped[list["Attempt"]] = relationship(back_populates="problem")
