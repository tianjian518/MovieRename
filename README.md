# MovieRename

简体中文

基于 [MoviePilot](https://github.com/jxxghp/MoviePilot) 精简而来的**影视重命名与整理工具**。

MoviePilot 功能庞杂（订阅、搜索、下载、整理、媒体库、插件、工作流、AI 智能体、消息推送……）。
如果你和我一样，**只需要把下载好的影视文件「重命名 + 按分类整理」**，其余功能都是噪声**，那么 MovieRename 就是为你准备的：

> 只保留 **重命名（Rename）**、**整理（Transfer / 自动归类）** 与 **TMDB 联网识别**，砍掉一切无关模块。

原项目那套完整的分类体系被**完整保留**——华语电影、外语电影、国产剧、欧美剧、动画、纪录片……全部沿用，不会因为「瘦身」而丢失分类能力。

---

## 功能范围

**保留：**
- 🎬 影视识别：基于 TMDB 的在线识别（电影 / 剧集元数据、年份、语种、产地、类型）
- ✏️ 重命名：按可配置格式对电影、剧集进行规范化重命名
- 🗂️ 自动整理：依据原项目完整分类规则，把文件归类到对应目录（华语电影 / 外语电影 / 国产剧 / 欧美剧 / 动漫 / 纪录片 …）
- 🐳 多架构 Docker 镜像：`linux/amd64` + `linux/arm64`
- 🔌 提供 REST API（FastAPI），可对接自动化流程

**已移除（相比原 MoviePilot）：**
下载器（qBittorrent / Transmission / rTorrent 等）、站点、媒体服务器（Emby / Jellyfin / Plex）、
插件系统、工作流、AI 智能体 / LLM、消息推送（Telegram / 微信 / Slack / Discord 等）、
订阅、搜索、浏览器自动化等。对应的重依赖（langchain、openai、anthropic、boto3、plexapi 等）也已从依赖清单中剔除，
镜像体积大幅缩小。

---

## 快速开始（Docker）

```bash
docker run -d \
  --name movierename \
  -p 3000:3000 \
  -v /your/config:/config \
  -v /your/media:/media \
  -e MOVIEPILOT_TMDB_API_KEY=<你的TMDB_API_KEY> \
  jxxghp/movierename:1.0
```

> 镜像默认监听 `3000` 端口，直接由 uvicorn 提供 API（无 nginx / 前端）。
> 首次启动会自动初始化 SQLite 数据库。

或使用 `docker-compose.yml`（仓库内已提供）：

```bash
docker compose up -d
```

### 主要环境变量

| 变量 | 说明 | 默认 |
| --- | --- | --- |
| `CONFIG_DIR` | 配置目录（建议挂载为卷） | `/config` |
| `PORT` | API 监听端口 | `3000` |
| `HOST` | 监听地址 | `0.0.0.0` |
| `MOVIEPILOT_TMDB_API_KEY` | TMDB API Key（识别必需） | 空 |
| `API_TOKEN` | API 访问令牌 | `moviepilot` |

---

## 重新构建镜像（含多架构）

普通（当前架构）构建：

```bash
docker build -f docker/Dockerfile -t movierename:1.0 .
```

多架构构建并推送到 DockerHub（需已 `docker login`，且本机已注册 QEMU binfmt）：

```bash
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t <your-dockerhub>/movierename:1.0 \
  --push -f docker/Dockerfile .
```

---

## API 简介

服务启动后，可通过 REST API 触发识别与整理，例如：

- `POST /api/v1/transfer/recognize` —— 按路径识别媒体
- `POST /api/v1/transfer/transfer` —— 整理（重命名 + 归类）
- `GET  /api/v1/system/global` —— 系统全局信息（健康检查端点）

接口需携带 `token`（默认 `moviepilot`，可用 `API_TOKEN` 覆盖）。完整接口见运行中的 OpenAPI 文档：`http://<host>:3000/docs`。

---

## 目录结构（精简后）

```
app/
  api/         REST 接口（auth/login/user/system/media/tmdb/storage/transfer）
  chain/       业务链（media / transfer / storage / tmdb / tvdb / system / user）
  core/        配置、缓存、数据库、元数据解析
  db/          数据库模型与迁移
  helper/      辅助工具（含占位 shim）
  modules/     模块（themoviedb / thetvdb / filter / filemanager / fanart）
  schemas/     数据模型
  startup/     启动初始化
config/        category.yaml 等默认配置
docker/        Dockerfile 与 entrypoint.sh
```

---

## 声明

本项目基于 MoviePilot 的代码进行二次精简，遵循其原有开源协议（详见 `LICENSE`）。
仅用于学习交流与个人影视整理自动化使用。
