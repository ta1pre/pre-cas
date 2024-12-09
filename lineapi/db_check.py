# db_check.py

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from lineapi.database import SessionLocal, engine, init_db
from lineapi.models.user import User
from sqlalchemy import inspect

# データベースの初期化
init_db()

# データベースセッションを作成
db: Session = SessionLocal()

# テーブルが作成されているか確認
inspector = inspect(engine)
users_table_exists = inspector.has_table('users')
print("Users table exists:", users_table_exists)

# サンプルデータを挿入してみる
new_user = User(line_id="test_line_id", tracking_id="test_tracking_id")
db.add(new_user)
db.commit()

# データを取得してみる
user = db.query(User).filter(User.line_id == "test_line_id").first()
print("Retrieved user:", user.line_id, user.tracking_id)

# セッションを閉じる
db.close()