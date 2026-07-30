from typing import Awaitable, Callable
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.helper.locale import LocaleHelper
from app.startup.lifecycle import lifespan


# 前端静态文件目录：优先使用与 app 包同级的 public/（容器 /app/public、
# 本地仓库根 /public 均落在此处），并依次兜底多个候选位置，避免路径错配导致前端不挂载。
def _resolve_frontend_dir() -> Path:
    candidates = [
        Path(__file__).resolve().parents[1] / "public",  # /app/public（容器内）
        settings.ROOT_PATH / "public",                    # 配置根目录下的 public
        Path("/app/public"),                              # 容器固定路径兜底
        Path(__file__).resolve().parents[2] / "public",   # 本地仓库根 /public
    ]
    for _cand in candidates:
        if (_cand / "index.html").exists():
            return _cand
    return candidates[0]


_FRONTEND_DIR = _resolve_frontend_dir()


async def localized_http_exception_handler(
        _request: Request,
        exc: HTTPException,
) -> JSONResponse:
    """
    为 HTTPException 响应补充多语言错误详情。

    :param _request: 当前 HTTP 请求
    :param exc: FastAPI HTTP 异常
    :return: 带 detail_i18n 的 JSON 错误响应
    """
    content = {"detail": exc.detail}
    if isinstance(exc.detail, str):
        content["detail_i18n"] = LocaleHelper.translate_text(exc.detail)
    return JSONResponse(
        status_code=exc.status_code,
        content=content,
        headers=exc.headers,
    )


def create_app() -> FastAPI:
    """
    创建并配置 FastAPI 应用实例。
    """
    _app = FastAPI(
        title=settings.PROJECT_NAME,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        lifespan=lifespan
    )

    _app.add_exception_handler(HTTPException, localized_http_exception_handler)

    # 配置 CORS 中间件
    _app.add_middleware(
        CORSMiddleware,  # noqa
        allow_origins=settings.ALLOWED_HOSTS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @_app.middleware("http")
    async def locale_context_middleware(
            request: Request,
            call_next: Callable[[Request], Awaitable[Response]],
    ) -> Response:
        """
        为每个请求设置后端多语言上下文。
        """
        token = LocaleHelper.set_current_locale(
            LocaleHelper.get_locale_from_request(request)
        )
        try:
            return await call_next(request)
        finally:
            LocaleHelper.reset_current_locale(token)

    return _app


def _mount_frontend(_app: FastAPI) -> None:
    """
    挂载前端静态文件：根路径 / 返回 index.html，/public/ 提供静态资源。
    若 public/ 目录不存在则跳过（纯 API 模式）。
    """
    index = _FRONTEND_DIR / "index.html"
    if not index.exists():
        return

    @_app.get("/", include_in_schema=False)
    async def _serve_index() -> FileResponse:
        return FileResponse(index, media_type="text/html; charset=utf-8")

    _app.mount("/public", StaticFiles(directory=str(_FRONTEND_DIR)), name="public")


# 创建 FastAPI 应用实例
app = create_app()
_mount_frontend(app)
