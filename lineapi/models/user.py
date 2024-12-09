#models/user.py
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, BigInteger, Index
from sqlalchemy.sql import func
from lineapi.database import Base


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nick_name = Column(String(100), nullable=True)
    prefectures = Column(String(10), nullable=True)
    line_id = Column(String(255), unique=True, nullable=False)
    invitation_id = Column(String(8), unique=True, index=True)
    tracking_id = Column(String(255), nullable=True)
    email = Column(String(255), unique=True, nullable=True)
    email_verified = Column(Boolean, default=False)
    mobile_phone = Column(String(20), nullable=True)
    picture_url = Column(Text, nullable=True)
    password_hash = Column(String(255), nullable=True)
    sex = Column(String(10), nullable=True)
    birth = Column(String(10), nullable=True)
    type = Column(String(50), nullable=True)
    affi_type = Column(Integer, default=0)
    last_login = Column(String(255), default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        Index('ix_users_email', 'email'),
        Index('ix_users_line_id', 'line_id'),
    )

    def __repr__(self):
        return f"<User(id={self.id}, nick_name='{self.nick_name}', line_id='{self.line_id}')>"

    # パスワード関連のメソッド（必要に応じて）
    def set_password(self, password):
        from passlib.hash import bcrypt
        self.password_hash = bcrypt.hash(password)

    def check_password(self, password):
        from passlib.hash import bcrypt
        return bcrypt.verify(password, self.password_hash)