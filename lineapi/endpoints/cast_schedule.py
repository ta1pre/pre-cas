# lineapi/endpoints/cast_schedule.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from lineapi.database import get_db
from lineapi.repositories.cast_schedule_repository import CastScheduleRepository
from lineapi.models.cast_schedule import CastSchedule
from datetime import date, time, datetime, timedelta
from pydantic import BaseModel
from typing import Optional
from typing import List

router = APIRouter()

class CastScheduleBase(BaseModel):
    cast_id: str
    date: date
    start_time: time
    end_time: time
    is_available: Optional[bool] = True
    station_code: Optional[int] = None

class CastScheduleCreate(BaseModel):
    cast_id: str
    date: date
    start_time: time
    end_time: time
    is_available: Optional[bool] = True
    station_code: Optional[int] = None

class CastScheduleResponse(CastScheduleBase):
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

class CastSchedule(CastScheduleBase):
    created_at: Optional[datetime]
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

@router.post("/update-or-create", response_model=CastSchedule)
async def update_or_create_cast_schedule(schedule: CastScheduleCreate, db: Session = Depends(get_db)):
    repo = CastScheduleRepository(db)
    try:
        updated_schedule = repo.update_or_create_schedule(
            cast_id=schedule.cast_id,
            schedule_date=schedule.date,
            start_time=schedule.start_time,
            end_time=schedule.end_time,
            is_available=schedule.is_available,
            station_code = schedule.station_code

        )
        return updated_schedule
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/get-by-cast-and-date/{cast_id}/{schedule_date}")
async def get_cast_schedule(cast_id: str, schedule_date: date, db: Session = Depends(get_db)):
    repo = CastScheduleRepository(db)
    schedule = repo.get_schedule_by_cast_and_date(cast_id, schedule_date)
    if not schedule:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return schedule

@router.get("/get-by-cast/{cast_id}")
async def get_cast_schedules(cast_id: str, db: Session = Depends(get_db)):
    repo = CastScheduleRepository(db)
    schedules = repo.get_schedules_by_cast(cast_id)
    return schedules

@router.get("/get-by-station-and-date/{station_name}/{schedule_date}")
async def get_station_schedules(station_name: str, schedule_date: date, db: Session = Depends(get_db)):
    repo = CastScheduleRepository(db)
    schedules = repo.get_schedules_by_station_and_date(station_name, schedule_date)
    return schedules

@router.get("/get-week-schedule/{cast_id}")
async def get_week_schedule(cast_id: str, db: Session = Depends(get_db)):
    repo = CastScheduleRepository(db)
    today = date.today()
    end_date = today + timedelta(days=6)
    schedules = repo.get_schedules_by_cast_and_date_range(cast_id, today, end_date)
    return schedules

@router.delete("/delete/{cast_id}/{schedule_date}")
async def delete_cast_schedule(cast_id: str, schedule_date: date, db: Session = Depends(get_db)):
    repo = CastScheduleRepository(db)
    success = repo.delete_schedule(cast_id, schedule_date)
    if not success:
        raise HTTPException(status_code=404, detail="Schedule not found")
    return {"status": "success", "message": "Schedule deleted"}

# 新しいエンドポイントの実装
class Shift(BaseModel):
    date: date
    start_time: time
    end_time: time
    station_code: int

class BatchUpdateRequest(BaseModel):
    cast_id: str
    shifts: List[Shift]

@router.post("/batch-update")
async def batch_update_schedules(batch_request: BatchUpdateRequest, db: Session = Depends(get_db)):
    repo = CastScheduleRepository(db)
    try:
        # リポジトリに新たに追加したメソッドを使用
        repo.batch_update_or_create_schedules(batch_request.cast_id, batch_request.shifts)
        return {"status": "success", "message": "Schedules updated or created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
