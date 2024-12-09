# endpoint/points.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..repositories.points_repository import PointsRepository
from ..services.points_service import update_user_points
from ..database import get_db
from pydantic import BaseModel
from ..services.points_service import apply_rule_and_update_points  # 関数をインポート


router = APIRouter()

# ユーザーのポイント残高を取得するエンドポイント
@router.get("/balance/{invitation_id}")
def get_user_points(invitation_id: str, db: Session = Depends(get_db)):
    points_repo = PointsRepository(db)
    points = points_repo.get_user_points(invitation_id)
    
    if points is None:
        raise HTTPException(status_code=404, detail="User points not found")

    return points

# ポイントトランザクションを追加するエンドポイント
@router.post("/transaction")
def add_point_transaction(transaction_data: dict, db: Session = Depends(get_db)):
    points_repo = PointsRepository(db)
    new_transaction = points_repo.add_point_transaction(transaction_data)
    
    if new_transaction is None:
        raise HTTPException(status_code=400, detail="Failed to add point transaction")

    return {"message": "Transaction added successfully", "transaction_id": new_transaction.id}

# ユーザーのポイント履歴を取得するエンドポイント
@router.get("/{user_id}/transactions")
def get_user_transactions(user_id: int, db: Session = Depends(get_db)):
    points_repo = PointsRepository(db)
    transactions = points_repo.get_user_transactions(user_id)
    
    if transactions is None:
        raise HTTPException(status_code=404, detail="No transactions found for user")

    return transactions

#ポイントの加減
# リクエストボディ用のモデル
class PointsRequest(BaseModel):
    regular_points: int   # レギュラーポイントの変更量
    bonus_points: int     # ボーナスポイントの変更量
    user_id: str          # ユーザーID

@router.post("/add")
def add_points(request: PointsRequest, db: Session = Depends(get_db)):
    """
    ポイントを加算するエンドポイント
    """
    result = update_user_points(
        db,
        request.user_id,
        request.regular_points,
        request.bonus_points,
        is_addition=True,   # Trueで加算
        rule_category="service",
        transaction_id="txn12345"
    )
    return result

@router.post("/deduct")
def deduct_points(request: PointsRequest, db: Session = Depends(get_db)):
    """
    ポイントを減算するエンドポイント
    """
    result = update_user_points(
        db,
        request.user_id,
        request.regular_points,
        request.bonus_points,
        is_addition=False,  # False でポイントを減算
        rule_category="service",  # サービスカテゴリに基づいてルールを適用
        transaction_id="txn12346"
    )
    return result

# ApplyRuleRequestの定義
class ApplyRuleRequest(BaseModel):
    user_id: str
    rule_id: int
    base_points: int = None
@router.post("/apply-rule")
def apply_rule(request: ApplyRuleRequest, db: Session = Depends(get_db)):
    """
    ルールに基づいてポイントを加算/減算するエンドポイント
    """
    result = apply_rule_and_update_points(
        db,
        user_id=request.user_id,
        rule_id=request.rule_id,
        transaction_id="txn12345",
        base_points=request.base_points  # パーセンテージ計算用
    )
    return result