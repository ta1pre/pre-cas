# lineapi/endpoints/callback.py

from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import os
import logging
import requests
from urllib.parse import quote, urlencode
from lineapi.database import SessionLocal
from datetime import datetime
from linebot import LineBotApi
from linebot.exceptions import LineBotApiError
from lineapi.repositories.user_repository import UserRepository

# 環境変数の読み込み
load_dotenv()

line_channel_id = os.getenv("LINE_LOGIN_CHANNEL_ID")
line_channel_secret = os.getenv("LINE_LOGIN_CHANNEL_SECRET")
redirect_uri = os.getenv("REDIRECT_URI")
frontend_url = os.getenv("FRONTEND_URL")
line_bot_api = LineBotApi(os.getenv("LINE_CHANNEL_ACCESS_TOKEN"))
line_bot_basic_id = os.getenv("LINE_BOT_BASIC_ID")

# ロギングの設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("")
async def callback(request: Request):
    logger.info(f"Received callback request: {request.url}")
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    if not code:
        logger.error("Code not found in request")
        raise HTTPException(status_code=400, detail="Code not found")

    try:
        # LINEアクセストークンの取得
        token_data = get_line_token(code)
        access_token = token_data["access_token"]

        # LINEユーザープロフィールの取得
        profile_data = get_line_profile(access_token)
        user_id = profile_data["userId"]
        line_display_name = profile_data["displayName"]
        picture_url = profile_data.get("pictureUrl")

        # stateパラメータから元のページURLを取得
        state_params = dict(param.split('=') for param in state.split('&') if '=' in param)
        tracking_id = state_params.get('tracking_id', 'NOT_FOUND')
        logger.info(f"Extracted tracking_id: {tracking_id}")
        original_page = state_params.get('page', '/')

        # SessionLocalにユーザー情報を保存
        db = SessionLocal()
        try:
            user_repo = UserRepository(db)
            existing_user = user_repo.get_user_by_line_id(user_id)
    
            if existing_user:
                logger.info(f"Existing user found: {existing_user.id}")
                # 既存ユーザーの場合、アプリ側で設定した nick_name を優先
                display_name = existing_user.nick_name
            else:
                logger.info("New user, using LINE display name")
                # 新規ユーザーの場合、LINE の display_name を使用
                display_name = profile_data["displayName"]
    
            user = user_repo.save_or_update_user(user_id, tracking_id, display_name)
            logger.info(f"User saved or updated: {user.id}")

            # データベースから最新のUSER情報取得
            user_prefectures = user.prefectures
            user_type = user.type
            user_invitation_id = user.invitation_id
            user_email = user.email
            user_mobile_phone = user.mobile_phone
            user_sex = user.sex
            user_birth = user.birth
            user_affi_type = user.affi_type
            user_last_login = user.last_login
            user_created_at = user.created_at
            user_updated_at = user.updated_at

        except Exception as e:
            logger.error(f"Error processing user data: {str(e)}")
            raise
        finally:
            db.close()

        # 友だち状態の確認
        is_friend = check_friendship(user_id)

        # ログ記録
        logger.info(f"User ID: {user_id}, Display Name: {display_name}, Original Page: {original_page}, Is Friend: {is_friend}")

        if not is_friend:
            # 友だちでない場合、友だち追加ページにリダイレクト 
            if line_bot_basic_id:
                friend_add_url = f"https://line.me/R/ti/p/{line_bot_basic_id}"
            else:
                friend_add_url = "https://line.me/R/ti/p/@"  # ユーザーに LINE Official Account ID を入力させる
            logger.info(f"User is not a friend. Redirecting to friend add page: {friend_add_url}")
            return RedirectResponse(url=friend_add_url)

        # クエリパラメータの構築あ
        # クエリパラメータの構築
        query_params = {
            "userId": user_id,
            "displayName": display_name,
            "user_prefectures": user_prefectures,
            "isFriend": str(is_friend).lower(),
            "pictureUrl": picture_url if picture_url else "",
            "type": user_type if user_type else "",
            "user_invitation_id": user_invitation_id if user_invitation_id else "",
            "user_email": user_email if user_email else "",
            "user_mobile_phone": user_mobile_phone if user_mobile_phone else "",
            "user_sex": user_sex if user_sex else "",
            "user_birth": user_birth if user_birth else "",
            "user_affi_type": str(user_affi_type) if user_affi_type is not None else "",
            "user_last_login": str(user_last_login) if user_last_login is not None else "",
            "user_created_at": user_created_at.strftime("%Y/%m/%d %H:%M") if isinstance(user_created_at, datetime) else "",
            "user_updated_at": user_updated_at.strftime("%Y/%m/%d %H:%M") if isinstance(user_updated_at, datetime) else ""
        }
        
        # フロントエンドのURLを構築
        full_redirect_url = f"{frontend_url}{original_page}?{urlencode(query_params)}"
        logger.info(f"Redirecting to: {full_redirect_url}")

        # フロントエンドにリダイレクト
        return RedirectResponse(url=full_redirect_url)

    except Exception as e:
        logger.error(f"Error in callback process: {str(e)}")
        error_redirect_url = f"{frontend_url}/error?message={quote(str(e))}"
        logger.info(f"Redirecting to error page: {error_redirect_url}")
        return RedirectResponse(url=error_redirect_url)

def get_line_token(code):
    token_url = "https://api.line.me/oauth2/v2.1/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
        "client_id": line_channel_id,
        "client_secret": line_channel_secret,
    }
    response = requests.post(token_url, headers=headers, data=data)
    if response.status_code != 200:
        logger.error(f"Failed to get access token. Status: {response.status_code}, Response: {response.text}")
        raise HTTPException(status_code=response.status_code, detail="Failed to get access token")
    return response.json()

def get_line_profile(access_token):
    profile_url = "https://api.line.me/v2/profile"
    headers = {"Authorization": f"Bearer {access_token}"}
    response = requests.get(profile_url, headers=headers)
    if response.status_code != 200:
        logger.error(f"Failed to get profile. Status: {response.status_code}, Response: {response.text}")
        raise HTTPException(status_code=response.status_code, detail="Failed to get profile")
    return response.json()

def check_friendship(user_id):
    try:
        line_bot_api.get_profile(user_id)
        return True
    except LineBotApiError:
        return False