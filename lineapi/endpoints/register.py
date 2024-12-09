# lineapi/endpoints/register.py

from fastapi import APIRouter, Request, HTTPException, Response
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
import logging
import requests
from lineapi.database import SessionLocal
from lineapi.models.user import User
from datetime import datetime
from urllib.parse import quote, urlencode

# 環境変数を読み込む
load_dotenv()

# 環境変数からLINEのチャンネル情報を取得
line_channel_id = os.getenv("LINE_LOGIN_CHANNEL_ID")
line_channel_secret = os.getenv("LINE_LOGIN_CHANNEL_SECRET")
redirect_uri = os.getenv("REDIRECT_URI")
friend_registration_url = "https://lin.ee/tVQPps0"
line_bot_channel_access_token = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

def check_friendship(user_id: str) -> bool:
    url = f"https://api.line.me/v2/bot/profile/{user_id}"
    headers = {"Authorization": f"Bearer {line_bot_channel_access_token}"}
    response = requests.get(url, headers=headers)
    return response.status_code == 200

@router.get("/login")
async def login(request: Request):
    logger.info("Login endpoint hit")
    original_page = request.query_params.get("page", "/")
    state = f"page={original_page}"
    
    login_url = (
        "https://access.line.me/oauth2/v2.1/authorize"
        f"?response_type=code&client_id={line_channel_id}"
        f"&redirect_uri={quote(redirect_uri)}&state={quote(state)}"
        "&scope=profile%20openid"
        "&bot_prompt=normal"  # 友だち追加を促す
    )
    
    logger.info(f"Generated login URL: {login_url}")
    return {"auth_url": login_url}

# 紹介コードから登録
@router.get("/referral")
async def referral(request: Request):
    tracking_id = request.query_params.get("tracking_id", "")
    
    state = f"tracking_id={tracking_id}&page=/"
    
    params = {
        "response_type": "code",
        "client_id": line_channel_id,
        "redirect_uri": redirect_uri,
        "state": state,
        "scope": "profile openid",
        "bot_prompt": "normal"
    }
    
    auth_url = f"https://access.line.me/oauth2/v2.1/authorize?{urlencode(params)}"
    
    return RedirectResponse(url=auth_url)

# ログアウト
@router.get("/logout")
async def logout(response: Response):
    logger.info("Logout endpoint hit")
    
    # セッションやクッキーをクリアする
    response.delete_cookie(key="session")  # セッションクッキーを削除
    
    # フロントエンドにリダイレクトするURLを設定
    frontend_url = os.getenv("FRONTEND_URL")
    redirect_url = f"{frontend_url}/"  # ホームページにリダイレクト
    
    logger.info(f"Redirecting to: {redirect_url}")
    
    # リダイレクトレスポンスを返す
    return RedirectResponse(url=redirect_url)