# lineapi/models/station.py

from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from lineapi.database import Base

class Station(Base):
    __tablename__ = 'stations'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    line_id = Column(Integer, ForeignKey('lines.id'))
    pref_cd = Column(Integer, ForeignKey('prefectures.id'))
    lon = Column(Float)
    lat = Column(Float)
    weight = Column(Integer, default=0)
    e_sort = Column(Integer)

    line = relationship("Line", back_populates="stations")
    prefecture = relationship("Prefecture", back_populates="stations")