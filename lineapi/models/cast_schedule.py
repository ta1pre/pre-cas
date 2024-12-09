#lineapi/modeles/cast_schedule.py

from sqlalchemy import Column, Integer, String, Date, Time, Boolean, DateTime
from sqlalchemy.sql import func
from lineapi.database import Base

class CastSchedule(Base):
    __tablename__ = 'resv_cast_schedules'

    cast_id = Column(String(8), primary_key=True)
    date = Column(Date, primary_key=True)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    is_available = Column(Boolean, default=True)
    station_code = Column(Integer, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return (f"<CastSchedule(cast_id={self.cast_id}, date={self.date}, "
                f"start_time={self.start_time}, end_time={self.end_time}, "
                f"station_code={self.station_code})>")
