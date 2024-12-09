# services/points_service.py
from sqlalchemy.orm import Session
from fastapi import HTTPException
from ..repositories.points_repository import PointsRepository

def update_user_points(
    db: Session, 
    user_id: str, 
    regular_points: int, 
    bonus_points: int, 
    is_addition: bool, 
    rule_category: str, 
    transaction_id: str,
    rule_id: int = None  # ルール適用時にrule_idを受け取る
):
    points_repo = PointsRepository(db)

    # ユーザーのポイント残高を取得
    user_points = points_repo.get_user_points(user_id)
    if user_points is None:
        raise HTTPException(status_code=404, detail="User not found")

    # ポイントの加減算
    if is_addition:
        new_regular_balance = user_points.regular_point_balance + regular_points
        new_bonus_balance = user_points.bonus_point_balance + bonus_points
    else:
        new_regular_balance = user_points.regular_point_balance - regular_points
        new_bonus_balance = user_points.bonus_point_balance - bonus_points

    # 残高不足のチェック
    if new_regular_balance < 0:
        raise HTTPException(status_code=400, detail="Insufficient regular points")
    if new_bonus_balance < 0:
        raise HTTPException(status_code=400, detail="Insufficient bonus points")

    # トランザクションを記録
    transaction_data = {
        "user_id": user_id,
        "point_change": regular_points + bonus_points if is_addition else -(regular_points + bonus_points),
        "point_type": "regular" if regular_points != 0 else "bonus",
        "rule_category": rule_category,
        "transaction_id": transaction_id,
        "balance_after": new_regular_balance + new_bonus_balance,
        "rule_id": rule_id  # ルールIDをトランザクションに記録
    }

    points_repo.add_point_transaction(transaction_data)

    # ポイント残高を更新
    points_repo.update_user_balance(user_id, new_regular_balance, new_bonus_balance)
    
    return {"message": "Points updated successfully"}


#ルールのポイント
def apply_rule_and_update_points(
    db: Session, 
    user_id: str, 
    rule_id: int, 
    transaction_id: str,
    base_points: int = None  # パーセンテージ計算用
):
    points_repo = PointsRepository(db)
    
    # ルールの取得
    rule = points_repo.get_rule_by_id(rule_id)
    if rule is None:
        raise HTTPException(status_code=404, detail="Rule not found")

    regular_points = 0
    bonus_points = 0

    # パーセンテージ計算（base_pointsが指定されている場合）
    if rule.point_value < 1 and base_points is not None:
        if rule.point_type == 'regular':
            regular_points = base_points * rule.point_value
        elif rule.point_type == 'bonus':
            bonus_points = base_points * rule.point_value
    else:
        # 通常の加算/減算
        if rule.point_type == 'regular':
            regular_points = rule.point_value
        elif rule.point_type == 'bonus':
            bonus_points = rule.point_value

    # ルールのis_additionに従ってポイント処理を実行
    result = update_user_points(
        db=db,
        user_id=user_id,
        regular_points=regular_points,
        bonus_points=bonus_points,
        is_addition=rule.is_addition,
        rule_category=rule.service_type,  # サービスの種類
        transaction_id=transaction_id,
        rule_id=rule_id  # ここでルールIDを渡す
    )

    return result

