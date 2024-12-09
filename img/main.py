# img/main.py

from fastapi import FastAPI, APIRouter, HTTPException, Depends, File, UploadFile, Form, Header
from sqlalchemy.orm import Session
import os
import json
from PIL import Image
import io
from img.database import get_db
from img.models import User
from fastapi.responses import FileResponse
import mimetypes
from datetime import datetime
from typing import Optional
from typing import List
import shutil

app = FastAPI()
router = APIRouter()

STORAGE_PATH = "storage/users/"
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif'}
DEFAULT_CATEGORY = "sandbox"

def process_image(file, width, height, crop_data):
    image = Image.open(file)
    
    if crop_data:
        left = crop_data['x'] * image.width / 100
        top = crop_data['y'] * image.height / 100
        right = left + (crop_data['width'] * image.width / 100)
        bottom = top + (crop_data['height'] * image.height / 100)
        image = image.crop((left, top, right, bottom))
    
    image = image.resize((width, height), Image.LANCZOS)
    
    output = io.BytesIO()
    image.save(output, format='JPEG', quality=85)
    output.seek(0)
    
    return output

def generate_unique_filename(original_filename):
    now = datetime.now()
    file_extension = os.path.splitext(original_filename)[1].lower()
    date_time_str = now.strftime("%Y%m%d%H%M%S")
    return f"{date_time_str}{file_extension}"

# main.py

# main.py

@router.post("/upload/{invitation_id}/{category}")
async def upload_image(
    invitation_id: str,
    file: UploadFile = File(...),
    category: str = DEFAULT_CATEGORY,
    width: Optional[int] = Form(None),
    height: Optional[int] = Form(None),
    crop: Optional[str] = Form(None),
    sub_directory: Optional[str] = Form(None),
    file_name: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    print(f"Received upload request: invitation_id={invitation_id}, category={category}")
    print(f"width={width}, height={height}, sub_directory={sub_directory}, file_name={file_name}")

    user_dir = os.path.join(STORAGE_PATH, invitation_id)
    category_dir = os.path.join(user_dir, category)
    if sub_directory:
        category_dir = os.path.join(category_dir, sub_directory)

    # ディレクトリの存在確認用デバッグログ
    print(f"Final category directory path: {category_dir}")
    os.makedirs(category_dir, exist_ok=True)

    file_extension = os.path.splitext(file.filename)[1].lower()
    if file_extension not in ALLOWED_EXTENSIONS:
        print("Invalid file type")
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    crop_data = json.loads(crop) if crop else None
    
    if width and height:
        processed_image = process_image(file.file, width, height, crop_data)
    else:
        file.file.seek(0)
        processed_image = file.file.read()

    # ファイル名の生成
    if file_name:
        unique_filename = file_name
    else:
        unique_filename = generate_unique_filename(file.filename)
    
    file_path = os.path.join(category_dir, unique_filename)
    print(f"Saving file to: {file_path}")  # ファイル保存先の確認用

    try:
        with open(file_path, "wb") as buffer:
            if isinstance(processed_image, io.BytesIO):
                buffer.write(processed_image.getvalue())
            else:
                buffer.write(processed_image)
        print(f"File saved successfully: {file_path}")
    except IOError as e:
        print(f"Error saving file: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to save the file")

    relative_path = os.path.relpath(file_path, STORAGE_PATH)
    
    return {
        "filename": unique_filename,
        "path": relative_path,
        "category": category,
        "sub_directory": sub_directory
    }


@router.get("/")
async def test_endpoint():
    return {"message": "Upload service is working!"}

@router.get("/test")
async def another_test_endpoint():
    return {"message": "This is another test endpoint in upload service"}

@router.post("/create_user_directory/{invitation_id}")
async def create_directory(
    invitation_id: str, 
    db: Session = Depends(get_db)
):
    try:
        user = db.query(User).filter(User.invitation_id == invitation_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User with this invitation ID not found")
        
        directory_structure = {
            "profile": {
                "header": {},
                "icon": {}
            },
            "blog": {},
            "id_verification": {},
            "appointments": {},
            "reviews": {}
        }
        
        base_path = create_user_directory(invitation_id, directory_structure)
        return {
            "message": f"Directory structure created for user with invitation ID {invitation_id}",
            "path": base_path,
            "structure": directory_structure
        }
    except Exception as e:
        print(f"Error: {str(e)}")  # サーバーコンソールにエラーを出力
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

def is_valid_image(file_path):
    return os.path.splitext(file_path)[1].lower() in ALLOWED_EXTENSIONS

# main.py

@app.get("/i/{path:path}")
async def get_image(path: str, authorization: Optional[str] = Header(None)):
    # リクエストされたパスをデバッグ出力
    print(f"Requested path: {path}")
    
    full_path = os.path.abspath(os.path.join(STORAGE_PATH, path))
    print(f"Full path resolved: {full_path}")  # 完全なパスの確認

    if not full_path.startswith(os.path.abspath(STORAGE_PATH)):
        raise HTTPException(status_code=403, detail="Access denied")

    if not os.path.exists(full_path) or not is_valid_image(full_path):
        raise HTTPException(status_code=404, detail="Image not found")

    # MIMEタイプの取得
    mime_type, _ = mimetypes.guess_type(full_path)
    if not mime_type or not mime_type.startswith('image/'):
        raise HTTPException(status_code=400, detail="Invalid file type")

    return FileResponse(
        full_path,
        media_type=mime_type,
        headers={"Cache-Control": "max-age=3600"}  # 1時間のキャッシュ
    )


# キャストごとの画像取得エンドポイント
#curl "https://5611-122-217-34-64.ngrok-free.app/img/list/6XaDKrQE"
@router.get("/list/{invitation_id}", response_model=List[str])
async def list_files(invitation_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.invitation_id == invitation_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User with this invitation ID not found")

    user_dir = os.path.join(STORAGE_PATH, invitation_id)
    if not os.path.exists(user_dir):
        raise HTTPException(status_code=404, detail="Directory not found")

    try:
        files = [os.path.join(dp, f) for dp, dn, filenames in os.walk(user_dir) for f in filenames]
        return files
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

# ファイル存在確認エンドポイント
#curl "https://5611-122-217-34-64.ngrok-free.app/img/check_file?file_path=storage/users/6XaDKrQE/profile/cast/images/castimage_111.jpg"
@router.get("/check_file")
async def check_file(file_path: str):
    if os.path.exists(file_path):
        return {"message": "File exists", "file_path": file_path}
    else:
        return {"message": "File does not exist", "file_path": file_path}

# ファイル削除エンドポイント
#curl -X DELETE "https://5611-122-217-34-64.ngrok-free.app/img/delete_file?file_path=storage/users/6XaDKrQE/profile/cast/images/castimage_111.jpg"
@router.delete("/delete_file")
async def delete_file(file_path: str, db: Session = Depends(get_db)):
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")

    try:
        os.remove(file_path)
        return {"message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")
    
#ブログリネーム
@router.post("/finalize/{invitation_id}/{category}")
async def finalize_upload(
    invitation_id: str,
    category: str,
    final_name: str = Form(...)  # 本保存ファイル名のみ
):
    """
    仮アップロードされたtemp_image.jpgを指定のファイル名にリネームして移動するエンドポイント
    """

    # パス設定
    temp_dir = os.path.join(STORAGE_PATH, invitation_id, category, "temp")
    temp_file_path = os.path.join(temp_dir, "temp_image.jpg")  # 仮ファイル名は固定
    final_dir = os.path.join(STORAGE_PATH, invitation_id, category)
    final_file_path = os.path.join(final_dir, final_name)

    # 仮ファイルの存在チェック
    if not os.path.exists(temp_file_path):
        raise HTTPException(status_code=404, detail="Temporary image not found")

    # 本保存先のディレクトリを作成（なければ作成）
    os.makedirs(final_dir, exist_ok=True)

    # 仮ファイルをリネーム・移動して本保存ファイルにする
    try:
        shutil.move(temp_file_path, final_file_path)
        print(f"File moved successfully to {final_file_path}")
        
        # 成功レスポンス
        return {
            "message": "Image finalized and moved successfully",
            "file_path": final_file_path
        }
    
    except Exception as e:
        print(f"Error moving file: {e}")  # サーバーのコンソールにエラーを出力
        raise HTTPException(status_code=500, detail=f"Failed to finalize image: {str(e)}")



app.include_router(router)