"""add stable problem catalog fields"""
from alembic import op
import sqlalchemy as sa

revision = "0003_problem_catalog"
down_revision = "0002_auth"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("problems", sa.Column("slug", sa.String(120), nullable=True))
    op.add_column("problems", sa.Column("estimated_time", sa.Integer(), nullable=False, server_default="45"))
    op.add_column("problems", sa.Column("patterns", sa.JSON(), nullable=False, server_default="[]"))
    op.execute("UPDATE problems SET slug = 'legacy-' || id::text WHERE slug IS NULL")
    op.alter_column("problems", "slug", nullable=False)
    op.create_index("ix_problems_slug", "problems", ["slug"], unique=True)

def downgrade() -> None:
    op.drop_index("ix_problems_slug", table_name="problems")
    op.drop_column("problems", "patterns")
    op.drop_column("problems", "estimated_time")
    op.drop_column("problems", "slug")
