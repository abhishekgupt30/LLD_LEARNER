"""create initial platform tables"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    uuid = postgresql.UUID(as_uuid=True)
    json_type = postgresql.JSONB(astext_type=sa.Text())
    op.create_table("users", sa.Column("id", uuid, primary_key=True), sa.Column("name", sa.String(120), nullable=False), sa.Column("email", sa.String(255), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table("problems", sa.Column("id", uuid, primary_key=True), sa.Column("title", sa.String(200), nullable=False), sa.Column("difficulty", sa.String(30), nullable=False), sa.Column("prerequisites", json_type, nullable=False), sa.Column("description", sa.Text(), nullable=False), sa.Column("sample_scenario", sa.Text(), nullable=False), sa.Column("requirements", json_type, nullable=False), sa.Column("constraints", json_type, nullable=False), sa.Column("hints", json_type, nullable=False), sa.Column("expected_concepts", json_type, nullable=False), sa.Column("evaluation_criteria", json_type, nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_table("attempts", sa.Column("id", uuid, primary_key=True), sa.Column("user_id", uuid, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False), sa.Column("problem_id", uuid, sa.ForeignKey("problems.id", ondelete="CASCADE"), nullable=False), sa.Column("attempt_number", sa.Integer(), nullable=False), sa.Column("status", sa.String(20), nullable=False), sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("submitted_at", sa.DateTime(timezone=True)), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.UniqueConstraint("user_id", "problem_id", "attempt_number"))
    op.create_index("ix_attempts_user_problem", "attempts", ["user_id", "problem_id"])
    op.create_table("submissions", sa.Column("id", uuid, primary_key=True), sa.Column("attempt_id", uuid, sa.ForeignKey("attempts.id", ondelete="CASCADE"), nullable=False, unique=True), sa.Column("section_0_requirements", json_type, nullable=False), sa.Column("section_1_classes", json_type, nullable=False), sa.Column("section_2_relationships", json_type, nullable=False), sa.Column("section_3_abstractions", json_type, nullable=False), sa.Column("section_4_patterns", json_type, nullable=False), sa.Column("section_5_explanation", sa.Text(), nullable=False, server_default=""), sa.Column("section_6_extensibility", json_type, nullable=False), sa.Column("section_7_edge_cases", json_type, nullable=False), sa.Column("section_8_tradeoffs", json_type, nullable=False), sa.Column("section_9_diagram", sa.Text(), nullable=False, server_default=""), sa.Column("section_10_code", sa.Text(), nullable=False, server_default=""), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False))
    op.create_table("evaluations", sa.Column("id", uuid, primary_key=True), sa.Column("attempt_id", uuid, sa.ForeignKey("attempts.id", ondelete="CASCADE"), nullable=False, unique=True), sa.Column("status", sa.String(20), nullable=False), sa.Column("score", sa.Integer()), sa.Column("evaluator_type", sa.String(20), nullable=False), sa.Column("result", json_type, nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False), sa.Column("completed_at", sa.DateTime(timezone=True)))


def downgrade() -> None:
    op.drop_table("evaluations")
    op.drop_table("submissions")
    op.drop_index("ix_attempts_user_problem", table_name="attempts")
    op.drop_table("attempts")
    op.drop_table("problems")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_table("users")
