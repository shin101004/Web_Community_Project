"""empty message

Revision ID: 5728ed46c667
Revises: b4aa0cfc8f00
Create Date: 2020-09-15 04:11:44.775562

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5728ed46c667'
down_revision = 'b4aa0cfc8f00'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('post', sa.Column('img_num', sa.Integer(), nullable=True))
    op.add_column('user', sa.Column('auto_login', sa.Integer(), nullable=True))
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('user', 'auto_login')
    op.drop_column('post', 'img_num')
    # ### end Alembic commands ###