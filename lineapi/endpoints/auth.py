# lineapi/endpoints/auth.py

from fastapi import APIRouter, Request, HTTPException, Response
from fastapi.responses import RedirectResponse, JSONResponse
from dotenv import load_dotenv
import os
import logging
import requests

# 環境変数を読　み込む
load_dotenv()

router = APIRouter()

# 仮のセッションデータベース（実際にはデータベースや他のセッション管理システムを使用する）
sessions = {}

line_channel_id = os.getenv("LINE_LOGIN_CHANNEL_ID")
line_channel_secret = os.getenv("LINE_LOGIN_CHANNEL_SECRET")
redirect_uri = os.getenv("REACT_APP_REDIRECT_URI")

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@router.get("/login")
async def login():
    try:
        logger.info("Login endpoint hit")
        line_channel_id = os.getenv("LINE_LOGIN_CHANNEL_ID")
        redirect_uri = os.getenv("REACT_APP_REDIRECT_URI")
        state = "12345"  # 任意の状態情報

        login_url = f"https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id={line_channel_id}&redirect_uri={redirect_uri}&state={state}&scope=profile%20openid"
        logger.info(f"Generated login URL: {login_url}")
        return JSONResponse(content={"auth_url": login_url})
    except Exception as e:
        logger.error(f"Failed to create login URL: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create login URL: {str(e)}")

@router.get("/callback")
async def callback(request: Request, response: Response):
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    if not code:
        raise HTTPException(status_code=400, detail="Code not found")

    # トークン取得
    token_url = "https://api.line.me/oauth2/v2.1/token"
    headers = {"Content-Type": "application/x-www-form-urlencoded"}
    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,  # 環境変数から読み込む
        "client_id": line_channel_id,
        "client_secret": line_channel_secret,
    }

    token_response = requests.post(token_url, headers=headers, data=data)
    if token_response.status_code != 200:
        logger.error(f"Failed to get access token: {token_response.text}")
        raise HTTPException(status_code=token_response.status_code, detail=f"Failed to get access token: {token_response.text}")

    token_data = token_response.json()
    access_token = token_data.get("access_token")
    if not access_token:
        logger.error(f"Access token not found in response: {token_data}")
        raise HTTPException(status_code=500, detail=f"Access token not found: {token_data}")

    # ユーザープロフィール取得
    profile_url = "https://api.line.me/v2/profile"
    headers = {"Authorization": f"Bearer {access_token}"}
    profile_response = requests.get(profile_url, headers=headers)
    if profile_response.status_code != 200:
        logger.error(f"Failed to get profile: {profile_response.text}")
        raise HTTPException(status_code=profile_response.status_code, detail=f"Failed to get profile: {profile_response.text}")

    profile_data = profile_response.json()
    user_id = profile_data.get("userId")
    display_name = profile_data.get("displayName")
    if not user_id or not display_name:
        logger.error(f"Invalid profile data: {profile_data}")
        raise HTTPException(status_code=500, detail=f"Invalid profile data: {profile_data}")

    # セッション保存
    session_id = user_id
    sessions[session_id] = {"user_id": user_id, "displayName": display_name}
    response = RedirectResponse(url=os.getenv("FRONTEND_URL"))
    response.set_cookie(key="session_id", value=session_id, samesite="None", secure=True)  # SameSiteとSecure属性を追加
    return response

@router.get("/check_login")
async def check_login(request: Request):
    session_id = request.cookies.get("session_id")
    if session_id in sessions:
        user_profile = sessions[session_id]
        return JSONResponse({"logged_in": True, "user_profile": user_profile})
    else:
        return JSONResponse({"logged_in": False})

@router.get("/logout")
async def logout(request: Request, response: Response):
    session_id = request.cookies.get("session_id")
    if session_id in sessions:
        del sessions[session_id]
        response.delete_cookie("session_id")
        return JSONResponse({"message": "Logged out"})
    else:
        return JSONResponse({"message": "No active session"}, status_code=400)