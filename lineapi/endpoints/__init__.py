# endpoints/__init__.py
from .register import router as register_router
from .callback import router as callback_router
from .webhook import router as webhook_router
from .auth import router as auth_router
from .user import router as user_router
from .cast import router as cast_router
from .cast_schedule import router as cast_schedule_router
from .area import router as area_router
from .resv import router as resv_router
from .points import router as points_router
from .blog import router as blog_router  # 追加

routers = [
    (register_router, "/api/register"),
    (callback_router, "/api/callback"),
    (webhook_router, "/api/webhook"),
    (auth_router, "/api/auth"),
    (user_router, "/api/user"),
    (cast_router, "/api/cast"),
    (cast_schedule_router, "/api/cast-schedule"),
    (area_router, "/api/area"),
    (resv_router, "/api/resv"),
    (points_router, "/api/points"),
    (blog_router, "/api/blog"),  # 追加
]