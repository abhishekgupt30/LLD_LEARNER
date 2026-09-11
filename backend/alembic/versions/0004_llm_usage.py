"""add database-backed daily LLM usage quota"""
from alembic import op
import sqlalchemy as sa

revision = "0004_llm_usage"
down_revision = "0003_problem_catalog"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table(
        "llm_usage",
        sa.Column("usage_date", sa.Date(), primary_key=True),
        sa.Column("calls", sa.Integer(), nullable=False, server_default="0"),
    )

def downgrade() -> None:
    op.drop_table("llm_usage")
