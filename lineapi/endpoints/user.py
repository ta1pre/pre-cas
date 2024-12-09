# endpoints/user.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from lineapi.database import get_db
from lineapi.repositories.user_repository import UserRepository
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

router = APIRouter()

class UserProfileUpdate(BaseModel):
    line_id: str                       
    sex: Optional[str] = None          
    type: Optional[str] = None
    nick_name: Optional[str] = None    
    prefectures: Optional[str] = None  
    birth: Optional[str] = None        
    email: Optional[str] = Field(None, pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
    mobile_phone: Optional[str] = None 
    picture_url: Optional[str] = None  
    affi_type: Optional[int] = None    
    last_login: Optional[str] = None   

@router.post("/update-profile")
async def update_user_profile(profile_update: UserProfileUpdate, db: Session = Depends(get_db)):
    try:
        user_repo = UserRepository(db)
        updated_user = user_repo.update_user_profile(
            profile_update.line_id,
            **profile_update.dict(exclude_unset=True, exclude={'line_id'})
        )
        if not updated_user:
            raise HTTPException(status_code=404, detail="User not found")

        def format_date(date_value):
            if isinstance(date_value, datetime):
                return date_value.strftime("%Y/%m/%d %H:%M:%S")
            return date_value

        user_dict = {
            "id": updated_user.id,
            "nick_name": updated_user.nick_name,
            "prefectures": updated_user.prefectures,
            "line_id": updated_user.line_id,
            "invitation_id": updated_user.invitation_id,
            "tracking_id": updated_user.tracking_id,
            "email": updated_user.email,
            "mobile_phone": updated_user.mobile_phone,
            "picture_url": updated_user.picture_url,
            "sex": updated_user.sex,
            "birth": updated_user.birth,
            "type": updated_user.type,
            "affi_type": updated_user.affi_type,
            "last_login": updated_user.last_login,
            "created_at": format_date(updated_user.created_at),
            "updated_at": format_date(updated_user.updated_at)
        }
        
        return {"message": "Profile updated successfully", "user": user_dict}
    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred: {str(e)}")
    
#プロフィール取得
@router.get("/get-profile")
async def get_user_profile(line_id: str, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user = user_repo.get_user_by_line_id(line_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # User情報をディクショナリ形式で返す
    user_profile = {
        "id": user.id,
        "nick_name": user.nick_name,
        "prefectures": user.prefectures,
        "line_id": user.line_id,
        "invitation_id": user.invitation_id,
        "tracking_id": user.tracking_id,
        "email": user.email,
        "mobile_phone": user.mobile_phone,
        "picture_url": user.picture_url,
        "sex": user.sex,
        "birth": user.birth,
        "type": user.type,
        "affi_type": user.affi_type,
        "last_login": user.last_login,  # last_loginも含む
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }

    return {"message": "User profile retrieved successfully", "user_profile": user_profile}



#モックログイン
@router.post("/mock_login")
async def mock_login(line_id: str, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    user = user_repo.get_user_by_line_id(line_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_profile = {
        "id": user.id,
        "nick_name": user.nick_name,
        "prefectures": user.prefectures,
        "line_id": user.line_id,
        "invitation_id": user.invitation_id,
        "tracking_id": user.tracking_id,
        "email": user.email,
        "mobile_phone": user.mobile_phone,
        "picture_url": user.picture_url,
        "sex": user.sex,
        "birth": user.birth,
        "type": user.type,
        "affi_type": user.affi_type,
        "last_login": user.last_login,
        "created_at": format_date(user.created_at),
        "updated_at": format_date(user.updated_at)
    }

    return {"message": "Mock login successful", "user_profile": user_profile}
