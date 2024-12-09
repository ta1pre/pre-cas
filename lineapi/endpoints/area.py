# endpoints/area.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from lineapi.database import get_db
from lineapi.repositories.area_repository import PrefectureRepository, LineRepository, StationRepository
from lineapi.models.prefecture import Prefecture
from lineapi.models.line import Line
from lineapi.models.station import Station


router = APIRouter()

@router.get("/prefectures", response_model=List[dict])
async def get_prefectures(db: Session = Depends(get_db)):
    prefecture_repo = PrefectureRepository(db)
    prefectures = prefecture_repo.get_all_prefectures()
    
    # 取得したデータをログに出力
    print(f"レスポンスとして返す都道府県データ: {prefectures}")
    
    if not prefectures:
        raise HTTPException(status_code=404, detail="都道府県のデータが見つかりません。")
    
    return [{"id": p.id, "name": p.name} for p in prefectures]


@router.get("/lines/{prefecture_id}", response_model=List[dict])
async def get_lines(prefecture_id: int, db: Session = Depends(get_db)):
    line_repo = LineRepository(db)
    lines = line_repo.get_lines_by_prefecture(prefecture_id)
    return [{"id": l.id, "name": l.line_name} for l in lines]

@router.get("/stations/{line_id}", response_model=List[dict])
async def get_stations(line_id: int, db: Session = Depends(get_db)):
    station_repo = StationRepository(db)
    stations = station_repo.get_stations_by_line(line_id)
    return [{"id": s.id, "name": s.name, "prefecture_id": s.pref_cd} for s in stations]

@router.get("/station_name/{station_id}")
async def get_station_name(station_id: int, db: Session = Depends(get_db)):
    station_repo = StationRepository(db)
    station_name = station_repo.get_station_name_by_id(station_id)
    if station_name is None:
        raise HTTPException(status_code=404, detail="Station not found")
    return {"station_name": station_name}

from sqlalchemy import text

