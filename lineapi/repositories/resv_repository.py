from sqlalchemy.orm import Session, joinedload
from ..models.resv import Reservation, ReservationOption
from ..models.user import User  # Userモデルをインポート
from sqlalchemy.exc import SQLAlchemyError
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class ReservationRepository:
    def __init__(self, db: Session):
        self.db = db

    # 予約をIDで取得するメソッド
    # 予約をIDで取得し、ニックネームとオプションも含めるように変更
    def get_reservation_by_id(self, reservation_id: int):
        logger.info(f"Fetching reservation with ID: {reservation_id}")
        try:
            result = (
                self.db.query(Reservation, User.nick_name)
                .join(User, Reservation.user_id == User.invitation_id)
                .options(
                    joinedload(Reservation.options).joinedload(ReservationOption.option_detail)
                )
                .filter(Reservation.id == reservation_id)
                .first()
            )
        
            if result:
                reservation, user_name = result
                options_data = [
                    {
                        "option_id": opt.option_id,
                        "option_name": opt.option_detail.option_name if opt.option_detail else None,
                        "option_price": opt.option_price
                    }
                    for opt in reservation.options
                ]
            
                return {
                    "id": reservation.id,
                    "date": reservation.date,
                    "location": reservation.location,
                    "status": reservation.status,
                    "progress_status": reservation.progress_status,
                    "total_points": reservation.total_points,
                    "cast_reward_points": reservation.cast_reward_points,
                    "selected_time": reservation.selected_time,
                    "fare": reservation.fare,
                    "shimei": reservation.shimei,
                    "course_id": reservation.course_id,
                    "user_id": reservation.user_id,
                    "cast_id": reservation.cast_id,
                    "user_name": user_name,
                    "options": options_data
                }
        
            return None

        except SQLAlchemyError as e:
            logger.error(f"Error fetching reservation: {str(e)}")
            return None

    
    #予約登録        
    def create_reservation(self, reservation_data):
        try:
            new_reservation = Reservation(**reservation_data)
            self.db.add(new_reservation)
            self.db.commit()
            self.db.refresh(new_reservation)
            return new_reservation
        except SQLAlchemyError as e:
            self.db.rollback()
            print(f"Reservation creation failed: {str(e)}")
            return None

    def add_option_to_reservation(self, reservation_id, option_id, option_price):
        try:
            option_entry = ReservationOption(
                reservation_id=reservation_id,
                option_id=option_id,
                option_price=option_price
            )
            self.db.add(option_entry)
            self.db.commit()
            return True
        except SQLAlchemyError as e:
            self.db.rollback()
            print(f"Failed to add option: {str(e)}")
            return False

    # キャストIDで予約を取得し、ユーザーのニックネームも含めて返す
    # resv_repository.py
    def get_reservations_by_cast(self, cast_id: str):
        try:
            results = (
                self.db.query(Reservation, User.nick_name)
                .join(User, Reservation.user_id == User.invitation_id)
                .options(
                    joinedload(Reservation.options).joinedload(ReservationOption.option_detail)
                )
                .filter(Reservation.cast_id == cast_id)
                .all()
            )

            reservations = []
            for reservation, user_name in results:
                options_data = []
                for opt in reservation.options:
                    # デバッグ出力で各オプションの詳細を確認
                    print(f"Option ID: {opt.option_id}, Option Name: {opt.option_detail.option_name if opt.option_detail else 'No Name'}, Option Price: {opt.option_price}")

                    option_info = {
                        "option_id": opt.option_id,
                        "option_name": opt.option_detail.option_name if opt.option_detail else None,  # ここでオプション名取得
                        "option_price": opt.option_price
                    }
                    options_data.append(option_info)

                reservations.append({
                    "id": reservation.id,
                    "date": reservation.date,
                    "location": reservation.location,
                    "status": reservation.status,
                    "progress_status": reservation.progress_status,
                    "total_points": reservation.total_points,
                    "cast_reward_points": reservation.cast_reward_points,
                    "selected_time": reservation.selected_time,
                    "fare": reservation.fare,
                    "shimei": reservation.shimei,
                    "course_id": reservation.course_id,
                    "user_id": reservation.user_id,
                    "cast_id": reservation.cast_id,
                    "user_name": user_name,
                    "options": options_data  # optionsデータにオプション名を含む
                })
            print("Response Data:", reservations)
            return reservations

        except SQLAlchemyError as e:
            logger.error(f"Error fetching reservations by cast_id {cast_id}: {str(e)}")
            return None

    def update_reservation(self, reservation_id: int, update_data: dict):
        try:
            # 更新する予約を取得
            reservation = self.db.query(Reservation).filter(Reservation.id == reservation_id).first()
            if not reservation:
                return None

            # 渡されたデータでフィールドを更新
            for key, value in update_data.items():
                if key == "options":
                    # オプションの更新処理
                    new_options = []
                    for option in value:
                        option_entry = ReservationOption(
                            reservation_id=reservation_id,
                            option_id=option["option_id"],
                            option_price=option["option_price"]
                        )
                        new_options.append(option_entry)
                    reservation.options = new_options
                else:
                    setattr(reservation, key, value)
            
            # データベースに変更を保存
            self.db.commit()
            self.db.refresh(reservation)
            return reservation
        except SQLAlchemyError as e:
            self.db.rollback()
            print(f"Reservation update failed: {str(e)}")
            return None

#ユーザの予約一覧取得
    def get_reservations_by_user(self, user_id: str):
        try:
            results = (
                self.db.query(Reservation, User.nick_name)
                .join(User, Reservation.user_id == User.invitation_id)
                .options(joinedload(Reservation.options).joinedload(ReservationOption.option_detail))
                .filter(Reservation.user_id == user_id)
                .all()
            )

            reservations = []
            for reservation, user_name in results:
                options_data = [
                    {
                        "option_id": opt.option_id,
                        "option_name": opt.option_detail.option_name if opt.option_detail else None,
                        "option_price": opt.option_price
                    }
                    for opt in reservation.options
                ]

                reservations.append({
                    "id": reservation.id,
                    "date": reservation.date,
                    "location": reservation.location,
                    "status": reservation.status,
                    "progress_status": reservation.progress_status,
                    "total_points": reservation.total_points,
                    "cast_reward_points": reservation.cast_reward_points,
                    "selected_time": reservation.selected_time,
                    "fare": reservation.fare,
                    "shimei": reservation.shimei,
                    "course_id": reservation.course_id,
                    "user_id": reservation.user_id,
                    "cast_id": reservation.cast_id,
                    "user_name": user_name,
                    "options": options_data
                })

            return reservations
        except SQLAlchemyError as e:
            logger.error(f"Error fetching reservations by user_id {user_id}: {str(e)}")
            return None

#チャット

from ..models.resv_chat import Chat
class ChatRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_chat(self, reservation_id, sender_id, sender_type, message):
        new_chat = Chat(
            reservation_id=reservation_id,
            sender_id=sender_id,
            sender_type=sender_type,
            message=message
        )
        self.db.add(new_chat)
        self.db.commit()
        self.db.refresh(new_chat)
        return new_chat

    def get_chats_by_reservation_id(self, reservation_id: int):
        return self.db.query(Chat).filter(Chat.reservation_id == reservation_id).all()

