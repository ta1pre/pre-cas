#endpoints/webhook.py

from fastapi import APIRouter, Request, HTTPException
from linebot import WebhookHandler
from linebot.models import MessageEvent, TextMessage, TextSendMessage, ImageMessage
from linebot.exceptions import InvalidSignatureError
from linebot import LineBotApi
from dotenv import load_dotenv
import os
import logging
import time

# 環境変数を読み込む
load_dotenv()

# 環境変数からLINEのチャンネル情報を取得
line_channel_secret = os.getenv("LINE_CHANNEL_SECRET")
line_channel_access_token = os.getenv("LINE_CHANNEL_ACCESS_TOKEN")
openai_api_key = os.getenv("OPENAI_API_KEY")
assistant_id = os.getenv("ASSISTANT_ID")

# ロギング設定
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# WebhookHandlerのインスタンスを作成
handler = WebhookHandler(line_channel_secret)

router = APIRouter()
@router.get("")
async def webhook_get():
    logger.info("Received GET request to webhook endpoint")
    return {"message": "許可されていません"}

@router.post("")
async def webhook(request: Request):  # URLの末尾にスラッシュなし
    signature = request.headers['X-Line-Signature']
    body = await request.body()
    logger.info(f"Received request with body: {body.decode('utf-8')}")
    try:
        handler.handle(body.decode('utf-8'), signature)
    except InvalidSignatureError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    return 'OK'

@handler.add(MessageEvent, message=TextMessage)
def handle_message(event: MessageEvent):
    line_bot_api = LineBotApi(line_channel_access_token)
    # 受け取ったメッセージの内容を取得
    user_message = event.message.text
    # LINEユーザーIDを取得
    user_id = event.source.user_id
    
    # AIの返答を生成する関数を呼び出し
    reply_message = ai_message(user_message, user_id)
    # 返信メッセージが空でないことを確認
    if not reply_message:
        reply_message = "申し訳ありません、現在応答できません。"
    
    line_bot_api.reply_message(
        event.reply_token,
        TextSendMessage(text=reply_message)
    )

@handler.add(MessageEvent, message=ImageMessage)
def handle_image_message(event: MessageEvent):
    line_bot_api = LineBotApi(line_channel_access_token)
    # 画像メッセージを受け取ったことをユーザーに知らせる
    line_bot_api.reply_message(
        event.reply_token,
        TextSendMessage(text="画像を受け取りました！")
    )

# AIにメッセージを送信して返答を得る関数
def ai_message(user_message: str, user_id: str) -> str:
    from openai import OpenAI
    import time

    client = OpenAI(api_key=openai_api_key)

    # 環境変数からアシスタントIDを取得
    assistant_id = os.getenv("ASSISTANT_ID")
    
    # アシスタントIDが環境変数から取得されていない場合、アシスタントを作成
    if not assistant_id:
        assistant = client.beta.assistants.create(
            name="にけ",
            instructions="ねこ娘なので語尾はにゃんです。適切な返答を行うようにしてください。",
            tools=[{"type": "code_interpreter"}],
            model="gpt-4-turbo",
        )
        assistant_id = assistant.id
        print(f"Created assistant with ID: {assistant_id}")

    # ユーザーIDをスレッド名として使用
    thread_id = user_id

    # スレッドが存在するか確認し、存在しない場合は新規作成
    try:
        client.beta.threads.retrieve(thread_id=thread_id)
    except Exception:
        thread = client.beta.threads.create()
        thread_id = thread.id

    # ユーザーメッセージをスレッドに追加
    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=user_message,
    )

    # アシスタントにメッセージを送信し、レスポンスを取得
    run = client.beta.threads.runs.create_and_poll(
        thread_id=thread_id,
        assistant_id=assistant_id,
        truncation_strategy={
            "type": "last_messages",
            "last_messages": 10
        },
    )

    # レスポンスが完了するまで待つ
    TERMINAL_STATES = ["expired", "completed", "failed", "incomplete", "cancelled"]
    while True:
        retrieved_run = client.beta.threads.runs.retrieve(
            thread_id=thread_id,
            run_id=run.id
        )

        if retrieved_run.status in TERMINAL_STATES:
            messages = client.beta.threads.messages.list(thread_id=thread_id)
            # スレッド内のアシスタントの最新メッセージを取得
            assistant_response = ""
            for message in reversed(messages.data):
                if message.role == "assistant":
                    assistant_response = message.content[0].text.value
                    break
            return assistant_response
        time.sleep(1)