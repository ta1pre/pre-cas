#lineapi/repositories/user_repository.py

import string
import random
from sqlalchemy.orm import Session
from lineapi.models.user import User
from datetime import datetime
from typing import Optional
from lineapi.models.points import UserPointBalance


class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def generate_invitation_id(self, length=8):
        chars = string.ascii_letters + string.digits
        while True:
            invitation_id = ''.join(random.choice(chars) for _ in range(length))
            if not self.db.query(User).filter(User.invitation_id == invitation_id).first():
                return invitation_id

    def get_user_by_line_id(self, line_id: str) -> User:
        return self.db.query(User).filter(User.line_id == line_id).first()

    def create_user(self, line_id: str, tracking_id: str, nick_name: str) -> User:
        invitation_id = self.generate_invitation_id()
        new_user = User(
            line_id=line_id,
            tracking_id=tracking_id,
            nick_name=nick_name,
            invitation_id=invitation_id,
            created_at=datetime.now()
        )
        self.db.add(new_user)
        
        # Create corresponding point balance entry
        new_point_balance = UserPointBalance(invitation_id=invitation_id)
        self.db.add(new_point_balance)

        self.db.commit()
        self.db.refresh(new_user)
        return new_user
    
    #updated_atを更新
    def update_user(self, user: User) -> User:
        user.updated_at = datetime.now()
        self.db.commit()
        self.db.refresh(user)
        return user

    def save_or_update_user(self, line_id: str, tracking_id: str, nick_name: str) -> User:
        existing_user = self.get_user_by_line_id(line_id)
        if existing_user:
            existing_user.tracking_id = tracking_id
            existing_user.nick_name = nick_name
            existing_user.updated_at = datetime.now()
            self.db.commit()
            self.db.refresh(existing_user)
            return existing_user
        else:
            return self.create_user(line_id, tracking_id, nick_name)
    
    def update_user_profile(self, line_id: str, **kwargs):
        user = self.db.query(User).filter(User.line_id == line_id).first()
        if user:
            for key, value in kwargs.items():
                setattr(user, key, value)
            try:
                self.db.commit()
                self.db.refresh(user)
                print(f"User updated in database: {user}")
            except Exception as e:
                self.db.rollback()
                print(f"Error committing changes: {str(e)}")
                raise
            return user
        return None