# database.py
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# MySQLデータベースのURL設定
DATABASE_URL = "mysql+pymysql://root:8even8tar8@localhost/precas_main"

# create_engineに接続プールの設定を追加
engine = create_engine(
    DATABASE_URL,
    pool_size=10,           # プール内の基本接続数
    max_overflow=20,        # 最大接続数
    pool_timeout=30,        # プールの待機タイムアウト（秒）
    pool_recycle=1800,      # アイドル接続再利用のタイムアウト
    pool_pre_ping=True      # 接続確認用のPingを有効化
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def init_db():
    import lineapi.models.user
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
