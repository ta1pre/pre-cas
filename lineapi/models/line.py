# lineapi/models/line.py

from sqlalchemy import Column, Integer, String, Float
from sqlalchemy.orm import relationship
from lineapi.database import Base
from .line_prefecture import LinePrefecture

class Line(Base):
    __tablename__ = 'lines'

    id = Column(Integer, primary_key=True, index=True)
    line_name = Column(String, nullable=False)
    lon = Column(Float)
    lat = Column(Float)
    zoom = Column(Integer)
    e_sort = Column(Integer)
    active = Column(Integer, default=1)

    prefectures = relationship("Prefecture", secondary="line_prefectures", back_populates="lines")
    stations = relationship("Station", back_populates="line")