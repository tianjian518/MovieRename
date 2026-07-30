from fastapi import FastAPI

from app.core.config import settings


def init_routers(app: FastAPI):
    """
    初始化路由（MovieRename 仅注册重命名与整理相关接口）
    """
    from app.api.apiv1 import api_router
    # API路由
    app.include_router(api_router, prefix=settings.API_V1_STR)
