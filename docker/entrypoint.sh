#!/usr/bin/env bash
# MovieRename 容器入口脚本
# 不使用 nginx/前端：直接由 uvicorn 提供 API 服务（端口 3000）。
# app.main:run_application 会在启动 uvicorn 前自动完成 init_db / update_db。
set -euo pipefail

cd /app

# 确保配置目录存在（通常为挂载的卷）
mkdir -p "${CONFIG_DIR:-/config}"

echo "[MovieRename] 启动中 ... (CONFIG_DIR=${CONFIG_DIR:-/config}, PORT=${PORT:-3000})"

# 前台运行：初始化数据库并启动 API 服务
exec "${VENV_PATH:-/opt/venv}/bin/python" -m app.main
