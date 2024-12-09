# models/resv.py
from sqlalchemy import Column, Integer, String, Text, JSON, ForeignKey, Enum, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from lineapi.database import Base

class Course(Base):
    __tablename__ = 'pnt_details_course'

    id = Column(Integer, primary_key=True, index=True)
    course_type = Column(Integer)
    course_name = Column(String(255), nullable=False)
    description = Column(Text)
    duration_minutes = Column(Integer)
    cost_points = Column(Integer)
    base_reward_points = Column(Integer)
    cast_reward_points = Column(Integer)
    additional_rules = Column(JSON, default={})  # デフォルトで空の辞書に設定
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

class Reservation(Base):
    __tablename__ = 'resv_reservation'

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False)  # ここをIntegerからStringに変更
    cast_id = Column(String, nullable=False)  # ここをIntegerからStringに変更
    course_id = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=False)
    selected_time = Column(Integer, nullable=False)
    location = Column(String(255), nullable=False)
    fare = Column(Integer, default=0)  # ここにfare列を追加
    shimei = Column(Integer, default=0)
    status = Column(Enum('pending_user', 'pending_cast', 'confirmed'), nullable=False)
    progress_status = Column(Enum('pending', 'dispatched', 'arrived', 'in_service', 'completed'), default='pending')
    total_points = Column(Integer, nullable=False)
    cast_reward_points = Column(Integer, nullable=False)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    options = relationship('ReservationOption', back_populates='reservation', cascade='all, delete-orphan')

# resv.pyのモデル定義にリレーションを追加
class ReservationOption(Base):
    __tablename__ = 'resv_reservation_option'

    reservation_id = Column(Integer, ForeignKey('resv_reservation.id'), primary_key=True)
    option_id = Column(Integer, ForeignKey('pnt_details_option.id'), primary_key=True)
    option_price = Column(Integer, nullable=False)

    reservation = relationship('Reservation', back_populates='options')
    option_detail = relationship('PntDetailsOption', backref='reservation_options')  # pnt_details_optionへのリレーション