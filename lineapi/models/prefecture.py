# lineapi/models/prefecture.py

from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from lineapi.database import Base
from .line_prefecture import LinePrefecture

class Prefecture(Base):
    __tablename__ = 'prefectures'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)

    lines = relationship("Line", secondary="line_prefectures", back_populates="prefectures")
    stations = relationship("Station", back_populates="prefecture")
    