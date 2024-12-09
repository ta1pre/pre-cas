from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import Dict, Any, List, Optional
from lineapi.models.blog import Post
import logging

logger = logging.getLogger(__name__)

class BlogRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_post(self, cast_id: str, body: str, photo_url: Optional[str] = None, 
                   status: str = 'public') -> Post:
        try:
            post = Post(
                cast_id=cast_id,
                body=body,
                photo_url=photo_url,
                status=status,
                likes_count=0  # 新規作成時はいいね数を0で初期化
            )
            self.db.add(post)
            self.db.commit()
            self.db.refresh(post)
            return post
        except SQLAlchemyError as e:
            logger.error(f"Database error while creating post: {str(e)}")
            self.db.rollback()
            raise

    def get_post(self, post_id: int) -> Optional[Post]:
        return self.db.query(Post).filter(
            Post.id == post_id,
            Post.is_deleted == False
        ).first()

    def get_posts_by_cast(self, cast_id: str, skip: int = 0, limit: int = 20) -> List[Post]:
        return self.db.query(Post).filter(
            Post.cast_id == cast_id,
            Post.is_deleted == False
        ).order_by(Post.created_at.desc()).offset(skip).limit(limit).all()

    def update_post(self, post_id: int, update_data: Dict[str, Any]) -> Optional[Post]:
        post = self.get_post(post_id)
        if post:
            try:
                for key, value in update_data.items():
                    if hasattr(post, key):
                        setattr(post, key, value)
                self.db.commit()
                self.db.refresh(post)
                return post
            except SQLAlchemyError as e:
                logger.error(f"Database error while updating post: {str(e)}")
                self.db.rollback()
                raise
        return None

    def delete_post(self, post_id: int) -> bool:
        post = self.get_post(post_id)
        if post:
            try:
                post.is_deleted = True
                self.db.commit()
                return True
            except SQLAlchemyError as e:
                logger.error(f"Database error while deleting post: {str(e)}")
                self.db.rollback()
                raise
        return False

    def increment_likes(self, post_id: int) -> Optional[Post]:
        """
        指定された投稿のいいね数をインクリメントする
        """
        post = self.get_post(post_id)
        if post:
            try:
                post.likes_count += 1
                self.db.commit()
                self.db.refresh(post)
                return post
            except SQLAlchemyError as e:
                logger.error(f"Database error while incrementing likes: {str(e)}")
                self.db.rollback()
                raise
        return None
