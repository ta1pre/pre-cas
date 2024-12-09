# repositories/cast_repository.py

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from lineapi.models.cast import BasicCastInfo
from typing import Dict, Any
import logging

logger = logging.getLogger(__name__)


class CastRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_cast_by_cast_id(self, cast_id: str):
        return self.db.query(BasicCastInfo).filter(BasicCastInfo.cast_id == cast_id).first()

    def update_cast_profile(self, cast_id: str, update_data: Dict[str, Any]):
        logger.info(f"Attempting to update cast profile for cast_id: {cast_id}")
        logger.debug(f"Update data: {update_data}")
        
        cast = self.get_cast_by_cast_id(cast_id)
        if cast:
            try:
                for key, value in update_data.items():
                    if hasattr(cast, key):
                        setattr(cast, key, value)
                    else:
                        logger.warning(f"Attribute {key} not found in cast object")
                self.db.commit()
                self.db.refresh(cast)
                logger.info(f"Successfully updated cast profile for cast_id: {cast_id}")
                return cast
            except SQLAlchemyError as e:
                logger.error(f"Database error while updating cast profile: {str(e)}")
                self.db.rollback()
                raise
        else:
            logger.warning(f"Cast not found for cast_id: {cast_id}")
            return None
    
    #初回のキャスト作成
    def create_cast_profile(self, new_profile: BasicCastInfo):
        self.db.add(new_profile)
        self.db.commit()
        self.db.refresh(new_profile)
        return new_profile