# repositories/area_repository.py

from sqlalchemy.orm import Session
from lineapi.models.prefecture import Prefecture
from lineapi.models.line import Line
from lineapi.models.station import Station

class PrefectureRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all_prefectures(self):
        return self.db.query(Prefecture).all()

class LineRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_lines_by_prefecture(self, prefecture_id: int):
        return self.db.query(Line).join(Line.prefectures).filter(Prefecture.id == prefecture_id).all()

class StationRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_stations_by_line(self, line_id: int):
        return self.db.query(Station).filter(Station.line_id == line_id).order_by(Station.e_sort).all()
    
    def get_station_name_by_id(self, station_id: int):
        station = self.db.query(Station).filter(Station.id == station_id).first()
        if station:
            return station.name
        return None  # 駅が見つからなかった場合はNoneを返す