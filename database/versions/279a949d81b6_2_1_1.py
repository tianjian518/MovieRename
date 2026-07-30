"""2.1.1

Revision ID: 279a949d81b6
Revises: ca5461f314f2
Create Date: 2025-02-14 19:02:24.989349

"""

try:
    from app.chain.torrents import TorrentsChain
except Exception:
    TorrentsChain = None

# revision identifiers, used by Alembic.
revision = '279a949d81b6'
down_revision = 'ca5461f314f2'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 清理一次缓存（下载器功能已从 MovieRename 移除，跳过）
    if TorrentsChain is not None:
        try:
            TorrentsChain().clear_torrents()
        except Exception:
            pass


def downgrade() -> None:
    pass
