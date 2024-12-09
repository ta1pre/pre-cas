from fastapi import APIRouter, Depends, HTTPException
from enum import Enum
from lineapi.repositories.blog_repository import BlogRepository
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from pydantic import BaseModel, Field
from typing import Optional, List
import logging
from lineapi.database import get_db

router = APIRouter()
logger = logging.getLogger(__name__)

class PostStatus(str, Enum):
    public = 'public'
    private = 'private'
    draft = 'draft'

class PostCreate(BaseModel):
    body: str = Field(..., min_length=1)
    photo_url: Optional[str] = Field(None, max_length=255)
    status: PostStatus = Field(default=PostStatus.public)

class PostUpdate(BaseModel):
    body: Optional[str] = Field(None, min_length=1)
    photo_url: Optional[str] = Field(None, max_length=255)
    status: Optional[PostStatus] = None

@router.post("/{cast_id}/posts")
async def create_post(
    cast_id: str,
    post_data: PostCreate,
    db: Session = Depends(get_db)
):
    try:
        blog_repo = BlogRepository(db)
        post = blog_repo.create_post(
            cast_id=cast_id,
            body=post_data.body,
            photo_url=post_data.photo_url,
            status=post_data.status
        )
        return {
            "message": "Post created successfully",
            "post": {
                "id": post.id,
                "cast_id": post.cast_id,
                "body": post.body,
                "photo_url": post.photo_url,
                "status": post.status,
                "created_at": post.created_at,
                "likes_count": post.likes_count  # いいね数の返却を追加
            }
        }
    except SQLAlchemyError as se:
        logger.error(f"Database error: {str(se)}")
        raise HTTPException(status_code=500, detail={"message": "Database error", "error": str(se)})
    except Exception as e:
        logger.exception(f"Unexpected error: {str(e)}")
        raise HTTPException(status_code=500, detail={"message": "Internal server error", "error": str(e)})

@router.get("/posts/{post_id}")
async def get_post(post_id: int, db: Session = Depends(get_db)):
    blog_repo = BlogRepository(db)
    post = blog_repo.get_post(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {
        "message": "Post retrieved successfully",
        "post": {
            "id": post.id,
            "cast_id": post.cast_id,
            "body": post.body,
            "photo_url": post.photo_url,
            "status": post.status,
            "created_at": post.created_at,
            "updated_at": post.updated_at,
            "likes_count": post.likes_count  # いいね数の返却を追加
        }
    }

@router.get("/{cast_id}/posts")
async def get_cast_posts(
    cast_id: str,
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db)
):
    blog_repo = BlogRepository(db)
    posts = blog_repo.get_posts_by_cast(cast_id, skip, limit)
    return {
        "message": "Posts retrieved successfully",
        "posts": [
            {
                "id": post.id,
                "body": post.body,
                "photo_url": post.photo_url,
                "status": post.status,
                "created_at": post.created_at,
                "likes_count": post.likes_count  # いいね数の返却を追加
            }
            for post in posts
        ]
    }

@router.put("/posts/{post_id}")
async def update_post(
    post_id: int,
    post_data: PostUpdate,
    db: Session = Depends(get_db)
):
    try:
        blog_repo = BlogRepository(db)
        updated_post = blog_repo.update_post(post_id, post_data.dict(exclude_unset=True))
        if not updated_post:
            raise HTTPException(status_code=404, detail="Post not found")
        return {
            "message": "Post updated successfully",
            "post": {
                "id": updated_post.id,
                "body": updated_post.body,
                "photo_url": updated_post.photo_url,
                "status": updated_post.status,
                "updated_at": updated_post.updated_at,
                "likes_count": updated_post.likes_count  # いいね数の返却を追加
            }
        }
    except SQLAlchemyError as se:
        logger.error(f"Database error: {str(se)}")
        raise HTTPException(status_code=500, detail={"message": "Database error", "error": str(se)})

@router.delete("/posts/{post_id}")
async def delete_post(post_id: int, db: Session = Depends(get_db)):
    try:
        blog_repo = BlogRepository(db)
        if blog_repo.delete_post(post_id):
            return {"message": "Post deleted successfully"}
        raise HTTPException(status_code=404, detail="Post not found")
    except SQLAlchemyError as se:
        logger.error(f"Database error: {str(se)}")
        raise HTTPException(status_code=500, detail={"message": "Database error", "error": str(se)})

@router.post("/posts/{post_id}/like")
async def increment_likes(post_id: int, db: Session = Depends(get_db)):
    """
    指定された投稿のいいね数をインクリメントするエンドポイント
    """
    blog_repo = BlogRepository(db)
    post = blog_repo.increment_likes(post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return {
        "message": "Like added successfully",
        "post": {
            "id": post.id,
            "likes_count": post.likes_count  # インクリメント後のいいね数
        }
    }
