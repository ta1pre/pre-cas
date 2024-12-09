# models/rule.py
from sqlalchemy import Column, Integer, String, Enum, Float, Text, Boolean, DateTime, JSON
from sqlalchemy.sql import func
from ..database import Base

class Rule(Base):
    __tablename__ = 'pnt_details_rules'

    id = Column(Integer, primary_key=True, index=True)
    rule_name = Column(String(255), nullable=False)
    rule_description = Column(Text)
    point_type = Column(Enum('regular', 'bonus'), nullable=False)
    service_type = Column(Enum('service', 'event', 'coupon'), nullable=False)
    point_value = Column(Float, nullable=False)
    is_addition = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, server_default=func.now())
    additional_data = Column(JSON, nullable=True)
