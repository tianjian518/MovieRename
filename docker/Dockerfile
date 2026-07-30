# syntax=docker/dockerfile:1
# MovieRename 精简镜像
# 仅保留「重命名 + 整理 + TMDB 识别」功能，已移除插件 / 浏览器 / 站点二进制 /
# 下载器 / 消息推送 / AI 智能体 / LLM 等依赖与下载步骤。
# 前端为原版 MoviePilot 前端（v2.2.9）精简而来：仅保留重命名/整理相关界面，
# 构建产物经 /public 由后端同源提供。支持 linux/amd64 与 linux/arm64。

# ---------- 前端构建阶段 ----------
FROM node:22-alpine AS frontend
WORKDIR /fe
# 仅复制前端工程文件（依赖锁文件已随仓库提供，保证可复现）
COPY frontend/ ./
RUN yarn install --frozen-lockfile \
    && yarn build

# ---------- 运行时阶段 ----------
FROM python:3.12-slim-bookworm

ENV LANG="C.UTF-8" \
    LC_ALL="zh_CN.UTF-8" \
    TZ="Asia/Shanghai" \
    HOME="/moviepilot" \
    CONFIG_DIR="/config" \
    ROOT_PATH="/app" \
    VENV_PATH="/opt/venv" \
    HOST="0.0.0.0" \
    PORT="3000" \
    PUID=0 \
    PGID=0 \
    UMASK=000 \
    DISPLAY=:987 \
    PYTHONUNBUFFERED=1

ENV PATH="${VENV_PATH}/bin:${PATH}"

# 运行时依赖（精简，移除 nginx / 前端 / 浏览器 / rclone / git / gh / cron 等）
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    tini \
    locales \
    gettext-base \
    procps \
    && dpkg-reconfigure --frontend noninteractive tzdata \
    && echo "zh_CN.UTF-8 UTF-8" >> /etc/locale.gen \
    && locale-gen zh_CN.UTF-8 \
    && apt-get autoremove -y \
    && apt-get clean \
    && rm -rf /tmp/* /var/lib/apt/lists/* /var/tmp/*

# 创建虚拟环境并安装精简后的依赖清单
WORKDIR /app
COPY requirements.in /app/requirements.in
RUN python3 -m venv ${VENV_PATH} \
    && pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /app/requirements.in

# 拷贝应用代码（包含 app/、config/、version.py、frontend/ 等）
COPY . /app

# 将前端构建产物放入 /app/public，并清理前端源码以减小镜像体积
COPY --from=frontend /fe/dist /app/public
RUN rm -rf /app/frontend

# 准备运行目录与入口脚本
RUN mkdir -p ${HOME} ${CONFIG_DIR} \
    && cp -f /app/docker/entrypoint.sh /entrypoint.sh \
    && chmod +x /entrypoint.sh

EXPOSE 3000
VOLUME [ "${CONFIG_DIR}" ]

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -fsS "http://127.0.0.1:${PORT:-3000}/api/v1/system/global?token=moviepilot" >/dev/null || exit 1

ENTRYPOINT [ "/usr/bin/tini", "-g", "--", "/entrypoint.sh" ]
