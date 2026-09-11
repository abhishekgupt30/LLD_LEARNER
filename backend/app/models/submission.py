from uuid import UUID

from sqlalchemy import JSON, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, UUIDTimestampMixin


class Submission(UUIDTimestampMixin, Base):
    __tablename__ = "submissions"

    attempt_id: Mapped[UUID] = mapped_column(ForeignKey("attempts.id", ondelete="CASCADE"), unique=True, nullable=False)
    section_0_requirements: Mapped[dict] = mapped_column(JSON, default=dict, nullable=False)
    section_1_classes: Mapped[dict | list | str] = mapped_column(JSON, default=dict, nullable=False)
    section_2_relationships: Mapped[dict | list | str] = mapped_column(JSON, default=dict, nullable=False)
    section_3_abstractions: Mapped[dict | list | str] = mapped_column(JSON, default=dict, nullable=False)
    section_4_patterns: Mapped[dict | list | str] = mapped_column(JSON, default=dict, nullable=False)
    section_5_explanation: Mapped[str] = mapped_column(Text, default="", nullable=False)
    section_6_extensibility: Mapped[dict | str] = mapped_column(JSON, default=dict, nullable=False)
    section_7_edge_cases: Mapped[dict | list | str] = mapped_column(JSON, default=dict, nullable=False)
    section_8_tradeoffs: Mapped[dict | str] = mapped_column(JSON, default=dict, nullable=False)
    section_9_diagram: Mapped[str] = mapped_column(Text, default="", nullable=False)
    section_10_code: Mapped[str] = mapped_column(Text, default="", nullable=False)

    attempt: Mapped["Attempt"] = relationship(back_populates="submission")
