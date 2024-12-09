# repositories/points_repository.py
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from ..models.points import UserPointBalance, PointTransaction
from datetime import datetime
from ..models.rule import Rule

class PointsRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_user_points(self, user_id: str):
        """
        ユーザーのポイント残高を pnt_user_point_balances テーブルから取得
        """
        return (
            self.db.query(UserPointBalance)
            .filter(UserPointBalance.invitation_id == user_id)
            .first()
        )

    def add_point_transaction(self, transaction_data: dict):
        """
        ポイントトランザクションを pnt_point_transactions テーブルに追加
        """
        try:
            new_transaction = PointTransaction(**transaction_data)
            self.db.add(new_transaction)
            self.db.commit()
            self.db.refresh(new_transaction)
            return new_transaction
        except SQLAlchemyError as e:
            self.db.rollback()
            raise e

    def update_user_balance(self, user_id: str, new_regular_balance: int, new_bonus_balance: int):
        """
        pnt_user_point_balances テーブルでポイント残高を更新
        """
        try:
            user_balance = (
                self.db.query(UserPointBalance)
                .filter(UserPointBalance.invitation_id == user_id)
                .first()
            )
            if user_balance:
                # レギュラーポイントとボーナスポイントを更新
                user_balance.regular_point_balance = new_regular_balance
                user_balance.bonus_point_balance = new_bonus_balance

                # 合計ポイントを再計算
                user_balance.total_point_balance = new_regular_balance + new_bonus_balance
                user_balance.last_updated = datetime.now()
                self.db.commit()
            else:
                raise ValueError(f"User balance for {user_id} not found.")
        except SQLAlchemyError as e:
            self.db.rollback()
            raise e
    
    # repositories/points_repository.py
    def get_rule_by_id(self, rule_id: int):
        """
        ルールテーブルからルールを取得するメソッド
        """
        return self.db.query(Rule).filter(Rule.id == rule_id).first()

