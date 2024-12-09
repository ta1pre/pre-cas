# models/points.py
from sqlalchemy import Column, Integer, String, Enum, DateTime
from sqlalchemy.sql import func
from lineapi.database import Base

class UserPointBalance(Base):
    __tablename__ = 'pnt_user_point_balances'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    invitation_id = Column(String(8), unique=True, nullable=False)
    regular_point_balance = Column(Integer, default=0)
    bonus_point_balance = Column(Integer, default=0)
    total_point_balance = Column(Integer, default=0)
    last_updated = Column(DateTime, default=func.now(), onupdate=func.now())

class PointTransaction(Base):
    __tablename__ = 'pnt_point_transactions'
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(255), nullable=False)
    point_change = Column(Integer, nullable=False)
    point_type = Column(Enum('regular', 'bonus'), nullable=False)
    rule_category = Column(Enum('affiliation', 'service', 'coupon', 'event'), nullable=False)
    rule_id = Column(Integer, nullable=False)
    transaction_id = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=func.now())
    balance_after = Column(Integer, nullable=False)
