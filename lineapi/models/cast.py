from sqlalchemy import Table, Column, Integer, String, BigInteger, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from lineapi.database import Base, engine

class BasicCastInfo(Base):
    __tablename__ = 'basic_cast_info'

    id = Column(Integer, primary_key=True, index=True)
    cast_id = Column(String, unique=True, index=True)
    name = Column(String, nullable=False)
    age = Column(Integer)
    height = Column(Integer)
    bust = Column(Integer)
    cup = Column(String)
    waist = Column(Integer)
    hip = Column(Integer)
    birthplace = Column(String)
    blood_type = Column(String)
    hobby = Column(String)
    profile_image_url = Column(String)
    selection_fee = Column(Integer)
    self_introduction = Column(Text)
    job = Column(String)
    dispatch_prefecture = Column(String)
    support_area = Column(Integer)
    is_active = Column(Integer, default=1)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

# pnt_details_option モデル
class PntDetailsOption(Base):
    __tablename__ = 'pnt_details_option'

    id = Column(BigInteger, primary_key=True, index=True)  # bigint unsigned
    course_id = Column(Integer, nullable=False)
    option_name = Column(String(255), nullable=False)
    price = Column(Integer, nullable=False, default=0)
    description = Column(Text, nullable=True)
    json_data = Column(Text, nullable=True)
    sort_order = Column(Integer, nullable=True, default=0)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # PntOptionMapとのリレーション
    option_maps = relationship("PntOptionMap", back_populates="option_detail")

# pnt_option_map モデル
class PntOptionMap(Base):
    __tablename__ = 'pnt_option_map'

    id = Column(BigInteger, primary_key=True, autoincrement=True, index=True)  # bigint unsigned
    cast_id = Column(String(50), nullable=False, index=True)  # varchar(50)
    option_id = Column(Integer, ForeignKey('pnt_details_option.id'), nullable=False)  # 外部キーとして設定
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

    # PntDetailsOptionとのリレーション
    option_detail = relationship("PntDetailsOption", back_populates="option_maps")
