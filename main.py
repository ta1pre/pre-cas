#DELIVERY/main.py
import sys
import os
import logging
from fastapi import FastAPI, Request, Response, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from lineapi.endpoints import routers  # まとめてインポート
from lineapi.database import SessionLocal
from img.main import app as upload_service_app



# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# プロジェクトのルートディレクトリをシステムパスに追加
sys.path.append(os.path.join(os.path.dirname(__file__), "lineapi"))

app = FastAPI(debug=True)

# upload_service をマウント
app.mount("/img", upload_service_app)


# CORS設定
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# lineapi/staticのファイルを提供
app.mount("/line-static", StaticFiles(directory="lineapi/static"), name="line-static")

# Reactのビルド済みファイルを提供
build_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "webapp/build"))
if not os.path.exists(build_dir):
    raise RuntimeError(f"Directory '{build_dir}' does not exist")
app.mount("/static", StaticFiles(directory=os.path.join(build_dir, "static")), name="static")

# データベースセッションの取得
@app.middleware("http")
async def db_session_middleware(request: Request, call_next):
    response = Response("Internal server error", status_code=500)
    try:
        request.state.db = SessionLocal()
        response = await call_next(request)
    finally:
        request.state.db.close()
    return response

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Received request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

@app.middleware("http")
async def api_middleware(request: Request, call_next):
    if request.url.path.startswith("/api/"):
        logger.info(f"Processing API request: {request.url.path}")
        response = await call_next(request)
        if response.status_code == 404:
            logger.warning(f"API endpoint not found: {request.url.path}")
            return JSONResponse(status_code=404, content={"detail": "API endpoint not found"})
        return response
    return await call_next(request)

# エンドポイントのインクルード
for router, prefix in routers:
    app.include_router(router, prefix=prefix)

# React アプリケーションのルートハンドラ
# すべてのその他のリクエストを index.html にリダイレクト
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    index_path = os.path.join(build_dir, "index.html")
    # ファイルが存在しない場合はエラーを出力
    if not os.path.exists(index_path):
        return {"error": "index.html not found"}
    return FileResponse(index_path)