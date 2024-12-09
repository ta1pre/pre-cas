# endpoints/cast.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError  # 追加
from lineapi.database import get_db
from lineapi.repositories.cast_repository import CastRepository
from pydantic import BaseModel, Field, validator
from typing import Optional, List
import string
import logging
from pydantic import ValidationError
from lineapi.models.cast import BasicCastInfo # 新しいモデルのインポート
from lineapi.models.cast import PntOptionMap, PntDetailsOption  # モデルのインポート



logger = logging.getLogger(__name__)

router = APIRouter()

BLOOD_TYPES = ["A", "B", "AB", "O"]

class CastProfileUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    age: Optional[int] = Field(None, ge=18, le=60)
    height: Optional[int] = Field(None, ge=130, le=200)
    bust: Optional[int] = Field(None, ge=70, le=100)
    cup: Optional[str] = Field(None, max_length=2)
    waist: Optional[int] = Field(None, ge=45, le=65)
    hip: Optional[int] = Field(None, ge=70, le=100)
    birthplace: Optional[str] = Field(None, max_length=50)
    blood_type: Optional[str] = Field(None, max_length=2)
    hobby: Optional[str] = Field(None, max_length=100)
    selection_fee: Optional[int] = Field(default=2000, le=100000)
    self_introduction: Optional[str] = Field(None, max_length=1000)
    job: Optional[str] = Field(None, max_length=50)
    dispatch_prefecture: Optional[str] = Field(None, max_length=20)
    support_area: Optional[int] = Field(None)
    is_active: Optional[int] = Field(None, ge=0, le=1)

    class Config:
        extra = 'ignore'  # 未知のフィールドを無視

    @validator('cup')
    def validate_cup(cls, v):
        if v is not None:
            valid_cups = list(string.ascii_uppercase[:11])  # A to K
            if v not in valid_cups:
                raise ValueError(f'Cup must be one of {", ".join(valid_cups)}')
        return v

    @validator('blood_type')
    def validate_blood_type(cls, v):
        if v is not None and v not in BLOOD_TYPES:
            raise ValueError(f'Blood type must be one of {", ".join(BLOOD_TYPES)}')
        return v

    @validator('dispatch_prefecture')
    def validate_dispatch_prefecture(cls, v):
        if v is not None:
            if len(v) > 20:
                raise ValueError("dispatch_prefecture is too long")
        return v


    class Config:
        extra = 'forbid'

@router.get("/constants")
async def get_constants():
    return {
        "blood_types": BLOOD_TYPES,
        "cup_sizes": list(string.ascii_uppercase[:11]),
        "age_range": list(range(18, 61)),
        "height_range": list(range(130, 201)),
        "bust_range": list(range(70, 101)),
        "waist_range": list(range(45, 66)),
        "hip_range": list(range(70, 101)),
        "selection_fee": list(range(51))
    }


@router.get("/{cast_id}/profile")
async def get_cast_profile(cast_id: str, db: Session = Depends(get_db)):
    cast_repo = CastRepository(db)
    cast = cast_repo.get_cast_by_cast_id(cast_id)
    if not cast:
        raise HTTPException(status_code=404, detail="Cast not found")
    return {
        "message": "Cast profile retrieved successfully",
        "profile": {
            "id": cast.id,
            "cast_id": cast.cast_id,
            "name": cast.name,
            "age": cast.age,
            "height": cast.height,
            "bust": cast.bust,
            "cup": cast.cup,
            "waist": cast.waist,
            "hip": cast.hip,
            "birthplace": cast.birthplace,
            "blood_type": cast.blood_type,
            "hobby": cast.hobby,
            "profile_image_url": cast.profile_image_url,
            "selection_fee": cast.selection_fee,
            "self_introduction": cast.self_introduction,
            "job": cast.job,
            "dispatch_prefecture": cast.dispatch_prefecture,
            "support_area": cast.support_area,
            "is_active": cast.is_active
        }
    }

@router.post("/{cast_id}/update")
async def update_cast_profile(cast_id: str, profile_update: CastProfileUpdate, db: Session = Depends(get_db)):
    logger.info(f"Updating profile for cast_id: {cast_id}")
    logger.debug(f"Profile update data: {profile_update.dict()}")

    try:
        cast_repo = CastRepository(db)
        updated_cast = cast_repo.update_cast_profile(cast_id, profile_update.dict(exclude_unset=True))
        if not updated_cast:
            logger.warning(f"Cast not found for cast_id: {cast_id}")
            raise HTTPException(status_code=404, detail="Cast not found")
        
        logger.info(f"Successfully updated profile for cast_id: {cast_id}")
        return {
            "message": "Cast profile updated successfully",
            "profile": updated_cast.__dict__
        }
    except ValidationError as ve:
        error_detail = ve.errors()
        logger.error(f"Validation error for cast_id {cast_id}: {error_detail}")
        raise HTTPException(status_code=422, detail={"message": "Validation error", "errors": error_detail})
    except SQLAlchemyError as se:
        logger.error(f"Database error for cast_id {cast_id}: {str(se)}")
        raise HTTPException(status_code=500, detail={"message": "Database error", "error": str(se)})
    except Exception as e:
        logger.exception(f"Unexpected error updating profile for cast_id {cast_id}: {str(e)}")
        raise HTTPException(status_code=500, detail={"message": "Internal server error", "error": str(e)})
    

@router.post("/{cast_id}/create")
async def create_cast_profile(cast_id: str, db: Session = Depends(get_db)):
    logger.info(f"Creating profile for cast_id: {cast_id}")
    
    try:
        cast_repo = CastRepository(db)
        existing_profile = cast_repo.get_cast_by_cast_id(cast_id)
        
        if existing_profile:
            logger.warning(f"Profile already exists for cast_id: {cast_id}")
            raise HTTPException(status_code=400, detail="Profile already exists")
        
        new_profile = BasicCastInfo(
            cast_id=cast_id,
            is_active=1,
            name="未設定"
            # 他のフィールドはデフォルト値または NULL になります
        )
        
        created_profile = cast_repo.create_cast_profile(new_profile)
        
        logger.info(f"Successfully created profile for cast_id: {cast_id}")
        return {
            "success": True,
            "message": "Cast profile created successfully",
            "profile": {
                "id": created_profile.id,
                "cast_id": created_profile.cast_id,
                "is_active": created_profile.is_active
            }
        }
    except SQLAlchemyError as se:
        logger.error(f"Database error for cast_id {cast_id}: {str(se)}")
        raise HTTPException(status_code=500, detail={"message": "Database error", "error": str(se)})
    except Exception as e:
        logger.exception(f"Unexpected error creating profile for cast_id {cast_id}: {str(e)}")
        raise HTTPException(status_code=500, detail={"message": "Internal server error", "error": str(e)})

@router.get("/{cast_id}/options")
async def get_cast_options(cast_id: str, db: Session = Depends(get_db)):
    """
    指定されたcast_idに関連するオプション情報とその詳細を取得するエンドポイント
    """
    try:
        # cast_idに基づいてオプション情報とその詳細を取得
        options = (
            db.query(PntOptionMap)
            .join(PntDetailsOption, PntOptionMap.option_id == PntDetailsOption.id)
            .filter(PntOptionMap.cast_id == cast_id)
            .all()
        )

        if not options:
            raise HTTPException(status_code=404, detail="Options not found for the specified cast_id")

        # オプション情報と詳細を整形して返す
        return {
            "message": "Options retrieved successfully",
            "options": [
                {
                    "id": option.id,
                    "cast_id": option.cast_id,
                    "option_id": option.option_id,
                    "is_active": option.is_active,
                    "created_at": option.created_at,
                    "updated_at": option.updated_at,
                    "option_detail": {
                        "id": option.option_detail.id,
                        "course_id": option.option_detail.course_id,
                        "option_name": option.option_detail.option_name,
                        "description": option.option_detail.description,
                        "price": option.option_detail.price,
                        "json_data": option.option_detail.json_data,
                        "sort_order": option.option_detail.sort_order
                    }
                }
                for option in options
            ]
        }
    except SQLAlchemyError as se:
        logger.error(f"Database error while fetching options for cast_id {cast_id}: {str(se)}")
        raise HTTPException(status_code=500, detail={"message": "Database error", "error": str(se)})
    except Exception as e:
        logger.exception(f"Unexpected error fetching options for cast_id {cast_id}: {str(e)}")
        raise HTTPException(status_code=500, detail={"message": "Internal server error", "error": str(e)})