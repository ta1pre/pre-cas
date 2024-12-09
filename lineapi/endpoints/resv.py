from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from ..models.resv import Course
from ..database import get_db
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from lineapi.database import Base
from ..repositories.resv_repository import ReservationRepository
from ..repositories.resv_repository import ChatRepository
from datetime import datetime

router = APIRouter()

class CourseResponse(BaseModel):
    id: int
    course_type: int
    course_name: str
    description: str
    duration_minutes: int
    cost_points: int
    base_reward_points: int
    cast_reward_points: int
    additional_rules: dict
    is_active: int

    class Config:
        from_attributes = True

@router.get("/courses/", response_model=List[CourseResponse])
def get_courses(db: Session = Depends(get_db)):
    courses = db.query(Course).filter(Course.is_active == 1).all()
    
    # `additional_rules`がNoneの場合、空の辞書に置き換える
    for course in courses:
        if course.additional_rules is None:
            course.additional_rules = {}

    if not courses:
        raise HTTPException(status_code=404, detail="No courses found")
    
    return courses

# 予約取得エンドポイント
@router.get("/details/{reservation_id}")
def get_reservation(reservation_id: int, db: Session = Depends(get_db)):
    reservation_repo = ReservationRepository(db)
    
    reservation = reservation_repo.get_reservation_by_id(reservation_id)
    
    if reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found")
    
    return reservation


# まずOptionRequestを定義する
class OptionRequest(BaseModel):
    option_id: int
    option_price: int

# その後にReservationRequestを定義する
class ReservationRequest(BaseModel):
    user_id: str
    cast_id: str
    course_id: int
    date: datetime
    selected_time: int
    location: str
    total_points: int
    cast_reward_points: int
    fare: int = 0  # ここにfareを追加
    shimei: int = 0
    status: str = "pending_user"
    progress_status: str = "pending"
    options: List[OptionRequest] = []  # OptionRequestを参照
    

    class Config:
        from_attributes = True

@router.post("/reservations/")
def create_reservation(request: ReservationRequest, db: Session = Depends(get_db)):
    reservation_repo = ReservationRepository(db)
    
    # リクエストデータを確認（ここを追加）
    print("受信したリクエストデータ:", request.dict())
    
    # 1. 予約を作成
    new_reservation = reservation_repo.create_reservation(request.dict(exclude={"options"}))
    if new_reservation is None:
        raise HTTPException(status_code=400, detail="Reservation creation failed")
    
    # 2. オプションを関連テーブルに保存
    for option in request.options:
        success = reservation_repo.add_option_to_reservation(new_reservation.id, option.option_id, option.option_price)
        if not success:
            raise HTTPException(status_code=400, detail="Failed to add option to reservation")
    
    return new_reservation


class OptionResponse(BaseModel):
    option_id: int
    option_name: str  # 追加
    option_price: int

    class Config:
        from_attributes = True

class ReservationResponse(BaseModel):
    id: int
    date: datetime
    location: str
    status: str
    progress_status: str
    total_points: int
    selected_time: int
    cast_reward_points: int
    fare: int
    shimei: int
    course_id: int
    user_id: str
    cast_id: str
    user_name: str  # 追加フィールド
    options: List[OptionResponse]  # オプションのリスト

    class Config:
        from_attributes = True



@router.get("/list_cast/{cast_id}", response_model=List[ReservationResponse])
def get_reservations_by_cast(cast_id: str, db: Session = Depends(get_db)):
    reservation_repo = ReservationRepository(db)
    reservations = reservation_repo.get_reservations_by_cast(cast_id)
    
    if not reservations:
        raise HTTPException(status_code=404, detail="No reservations found for the specified cast_id")

    # レスポンスデータの整形
    response_data = [
        {
            "id": reservation["id"],
            "date": reservation["date"],
            "location": reservation["location"],
            "status": reservation["status"],
            "progress_status": reservation["progress_status"],
            "total_points": reservation["total_points"],
            "cast_reward_points": reservation["cast_reward_points"],
            "selected_time": reservation["selected_time"],
            "fare": reservation["fare"],
            "shimei": reservation["shimei"],
            "course_id": reservation["course_id"],
            "user_id": reservation["user_id"],
            "cast_id": reservation["cast_id"],
            "user_name": reservation["user_name"],
            "options": [
                {
                    "option_id": opt["option_id"],
                    "option_name": opt["option_name"],  # ここでoption_nameを追加
                    "option_price": opt["option_price"]
                }
                for opt in reservation["options"]
            ]
        }
        for reservation in reservations
    ]
    
    return response_data

# Reservation Update Request
class ReservationUpdateRequest(BaseModel):
    date: datetime
    location: str
    status: str
    progress_status: str
    selected_time: int
    cast_reward_points: int
    total_points: int  # ここに total_points を追加
    fare: int
    shimei: int
    options: Optional[List[OptionRequest]] = None

@router.patch("/reservations/{reservation_id}")
def update_reservation(
    reservation_id: int, 
    request: ReservationUpdateRequest, 
    db: Session = Depends(get_db)
):
    reservation_repo = ReservationRepository(db)

    # 予約データの更新
    updated_reservation = reservation_repo.update_reservation(
        reservation_id=reservation_id,
        update_data=request.dict(exclude_unset=True)
    )
    
    if updated_reservation is None:
        raise HTTPException(status_code=404, detail="Reservation not found or update failed")
    
    return updated_reservation

#ユーザーの予約一覧取得
@router.get("/list_user/{user_id}", response_model=List[ReservationResponse])
def get_reservations_by_user(user_id: str, db: Session = Depends(get_db)):
    reservation_repo = ReservationRepository(db)
    reservations = reservation_repo.get_reservations_by_user(user_id)
    
    if not reservations:
        raise HTTPException(status_code=404, detail="No reservations found for the specified user_id")

    return reservations

# チャットメッセージを送信するエンドポイント
# チャットメッセージを送信するエンドポイント
@router.post("/chat/")
def send_message(
    request_data: dict,  # ここでリクエストボディとして受け取る
    db: Session = Depends(get_db)
):
    reservation_id = request_data.get("reservation_id")
    sender_id = request_data.get("sender_id")
    sender_type = request_data.get("sender_type")
    message = request_data.get("message")

    if not all([reservation_id, sender_id, sender_type, message]):
        raise HTTPException(status_code=400, detail="All fields are required")

    chat_repo = ChatRepository(db)
    # チャットメッセージの作成
    new_chat = chat_repo.create_chat(reservation_id, sender_id, sender_type, message)
    if not new_chat:
        raise HTTPException(status_code=400, detail="Failed to send message")
    return new_chat

# 特定の予約IDに紐づいたチャットメッセージを取得するエンドポイント
@router.get("/chat/{reservation_id}")
def get_chat_messages(reservation_id: int, db: Session = Depends(get_db)):
    chat_repo = ChatRepository(db)
    # チャットメッセージの取得
    chats = chat_repo.get_chats_by_reservation_id(reservation_id)
    if not chats:
        raise HTTPException(status_code=404, detail="No chat messages found")
    return chats