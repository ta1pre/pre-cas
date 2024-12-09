#lineapi/repositories/cast_schedule_repository.py

from sqlalchemy.orm import Session
from lineapi.models.cast_schedule import CastSchedule
from datetime import date, time

class CastScheduleRepository:
    def __init__(self, db: Session):
        self.db = db

    def update_or_create_schedule(self, cast_id: str, schedule_date: date, start_time: time, end_time: time, is_available: bool, station_code: int) -> CastSchedule:
        schedule = self.db.query(CastSchedule).filter(
            CastSchedule.cast_id == cast_id,
            CastSchedule.date == schedule_date
        ).first()

        if schedule:
            # Update existing schedule
            schedule.start_time = start_time
            schedule.end_time = end_time
            schedule.is_available = is_available
            schedule.station_code = station_code  # 変更: prefecture_id -> station_name
        else:
            # Create new schedule
            schedule = CastSchedule(
                cast_id=cast_id,
                date=schedule_date,
                start_time=start_time,
                end_time=end_time,
                is_available=is_available,
                station_code=station_code  # 変更: prefecture_id -> station_name
            )
            self.db.add(schedule)

        self.db.commit()
        self.db.refresh(schedule)
        return schedule

    def get_schedule_by_cast_and_date(self, cast_id: str, schedule_date: date) -> CastSchedule:
        return self.db.query(CastSchedule).filter(
            CastSchedule.cast_id == cast_id,
            CastSchedule.date == schedule_date
        ).first()

    def get_schedules_by_cast(self, cast_id: str):
        return self.db.query(CastSchedule).filter(CastSchedule.cast_id == cast_id).all()

    def get_schedules_by_station_and_date(self, station_name: str, schedule_date: date):
        return self.db.query(CastSchedule).filter(
            CastSchedule.station_name == station_name,  # 変更: prefecture_id -> station_name
            CastSchedule.date == schedule_date,
            CastSchedule.is_available == True
        ).all()
    
    def get_schedules_by_cast_and_date_range(self, cast_id: str, start_date: date, end_date: date):
        schedules = self.db.query(CastSchedule).filter(
            CastSchedule.cast_id == cast_id,
            CastSchedule.date >= start_date,
            CastSchedule.date <= end_date
        ).all()
        return schedules
    
    def delete_schedule(self, cast_id: str, schedule_date: date) -> bool:
        schedule = self.db.query(CastSchedule).filter_by(cast_id=cast_id, date=schedule_date).first()
        if schedule:
            self.db.delete(schedule)
            self.db.commit()
            return True
        return False
    
    # 新しく複数のシフトを一括で登録または更新するメソッドを追加
    def batch_update_or_create_schedules(self, cast_id: str, shifts: list):
        try:
            for shift in shifts:
                existing_schedule = self.db.query(CastSchedule).filter(
                    CastSchedule.cast_id == cast_id,
                    CastSchedule.date == shift.date  # ドット表記でアクセス
                ).first()

                if existing_schedule:
                    # 既存のスケジュールを更新
                    existing_schedule.start_time = shift.start_time  # ドット表記
                    existing_schedule.end_time = shift.end_time  # ドット表記
                    existing_schedule.station_code = shift.station_code  # ドット表記
                else:
                    # 新規スケジュールを作成
                    new_schedule = CastSchedule(
                        cast_id=cast_id,
                        date=shift.date,  # ドット表記
                        start_time=shift.start_time,  # ドット表記
                        end_time=shift.end_time,  # ドット表記
                        station_code=shift.station_code  # ドット表記
                    )
                    self.db.add(new_schedule)

            self.db.commit()
        except Exception as e:
            self.db.rollback()
            raise e
    