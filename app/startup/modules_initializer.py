import inspect
from typing import Callable

from app.helper.redis import RedisHelper, AsyncRedisHelper
from app.utils.system import SystemUtils
from app.log import logger
from app.core.config import settings
from app.core.module import ModuleManager
from app.core.event import EventManager
from app.helper.thread import ThreadHelper
from app.helper.display import DisplayHelper
from app.helper.doh import DohHelper
from app.helper.resource import ResourceHelper
from app.helper.message import MessageHelper, stop_message
from app.db import close_database


def clear_temp():
    """
    清理临时文件和图片缓存
    """
    # 清理临时目录中3天前的文件
    SystemUtils.clear(settings.TEMP_PATH, days=settings.TEMP_FILE_DAYS)
    # 清理图片缓存目录中7天前的文件
    SystemUtils.clear(settings.CACHE_PATH / "images", days=settings.GLOBAL_IMAGE_CACHE_DAYS)
    # 清理 pip/uv 包下载缓存，不接管整个 .cache 目录。
    clear_package_tool_cache()


def clear_package_tool_cache():
    """
    清理 pip/uv 包下载缓存，只处理 MovieRename 管理的工具子目录。
    """
    days = settings.PACKAGE_CACHE_DAYS
    if days <= 0:
        return
    tool_cache_root = settings.PACKAGE_CACHE_PATH
    for child in ("pip", "uv"):
        cache_path = tool_cache_root / child
        try:
            SystemUtils.clear(cache_path, days=days)
        except Exception as err:
            logger.warning("清理包下载缓存失败：%s - %s", cache_path, err)


async def stop_modules():
    """
    服务关闭
    """
    async def run_step(name: str, callback: Callable[[], object]) -> None:
        """单个模块资源关闭失败时继续执行后续阶段"""
        try:
            result = callback()
            if inspect.isawaitable(result):
                await result
        except Exception as err:
            logger.error(f"关闭{name}失败：{err}")

    await run_step("模块", lambda: ModuleManager().stop())
    await run_step("事件消费", lambda: EventManager().stop())
    await run_step("虚拟显示", lambda: DisplayHelper().stop())
    await run_step("DoH服务", lambda: DohHelper().shutdown())
    await run_step("线程池", lambda: ThreadHelper().shutdown())
    await run_step("消息服务", stop_message)
    await run_step("Redis缓存连接", lambda: RedisHelper().close())
    await run_step("异步Redis缓存连接", lambda: AsyncRedisHelper().close())
    await run_step("数据库连接", close_database)
    await run_step("临时文件", clear_temp)


def init_modules():
    """
    启动模块（MovieRename 仅加载重命名与整理相关模块）
    """
    # 虚拟显示
    DisplayHelper()
    # DoH
    DohHelper()
    # 资源包检测
    ResourceHelper()
    # 加载模块（元数据识别、存储等）
    ModuleManager()
    # 启动事件消费
    EventManager().start()
