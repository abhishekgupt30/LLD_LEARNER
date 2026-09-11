"""add user password hashes"""
from alembic import op
import sqlalchemy as sa

revision = "0002_auth"
down_revision = "0001_initial"
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.add_column("users", sa.Column("password_hash", sa.String(128), nullable=False, server_default=""))

def downgrade() -> None:
    op.drop_column("users", "password_hash")
