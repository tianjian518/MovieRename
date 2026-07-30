import asyncio
import inspect
from contextlib import asynccontextmanager
from typing import Callable

from fastapi import FastAPI

from app.core.config import global_vars, settings
from app.helper.system import SystemHelper
from app.log import logger, LoggerManager
from app.startup.modules_initializer import init_modules, stop_modules
from app.startup.routers_initializer import init_routers
from app.utils.http import aclose_shared_async_transports


async def run_shutdown_step(name: str, callback: Callable[[], object]) -> None:
    """隔离单个关闭阶段的异常，确保后续资源仍有机会释放"""
    try:
        result = callback()
        if inspect.isawaitable(result):
            await result
    except Exception as err:
        logger.error(f"关闭{name}失败：{err}")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    定义应用的生命周期事件（MovieRename 仅初始化路由与核心模块）
    """
    print("Starting up...")
    # 存储当前循环
    global_vars.set_loop(asyncio.get_event_loop())
    # 初始化路由
    init_routers(app)
    # 初始化模块
    init_modules()
    # 设置系统已修改标志
    SystemHelper().set_system_modified()
    try:
        # 在此处 yield，表示应用已经启动，控制权交回 FastAPI 主事件循环
        yield
    finally:
        print("Shutting down...")
        global_vars.stop_system()
        try:
            await run_shutdown_step("模块服务", stop_modules)
            await run_shutdown_step(
                "共享异步 HTTP 连接池",
                aclose_shared_async_transports,
            )
        finally:
            # 日志最后关闭，确保其他组件的收尾信息已写入文件
            LoggerManager.shutdown()
