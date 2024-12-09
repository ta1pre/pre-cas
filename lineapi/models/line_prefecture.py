# lineapi/models/line_prefecture.py

from sqlalchemy import Column, Integer, ForeignKey
from lineapi.database import Base

class LinePrefecture(Base):
    __tablename__ = 'line_prefectures'

    id = Column(Integer, primary_key=True, index=True)
    line_id = Column(Integer, ForeignKey('lines.id'))
    prefecture_id = Column(Integer, ForeignKey('prefectures.id'))