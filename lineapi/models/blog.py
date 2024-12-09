# models/blog.py

from sqlalchemy import Table, Column, BigInteger, String, Text, Boolean, DateTime, Integer, Enum
from sqlalchemy.sql import func
from lineapi.database import Base

class Post(Base):
    __tablename__ = 'posts'

    id = Column(BigInteger, primary_key=True, index=True)
    cast_id = Column(String, nullable=False, index=True)
    photo_url = Column(String(255), nullable=True)
    body = Column(Text, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    status = Column(Enum('public', 'private', 'draft', name='post_status'), default='public')
    is_deleted = Column(Boolean, default=False)
    likes_count = Column(Integer, default=0)  # 追加したいいね数カラム
