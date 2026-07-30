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
  tianjian518/movierename:1.0
```

> 镜像默认监听 `3000` 端口，内置一个**精简版的原版 Web 界面**（仪表板 / 媒体库 / 文件管理 / 浏览 / 个人资料 / 设定 / 整理历史），由后端同源提供，**无需额外反代**。
> 首次启动会自动初始化 SQLite 数据库，并在日志中打印**超级管理员初始密码**与（若未设置）随机生成的 `API_TOKEN`。

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
| `MOVIEPILOT_TMDB_API_KEY` | TMDB API Key（识别必需，没有它无法识别影视） | 空 |
| `API_TOKEN` | API 访问令牌。未设置时首次启动**随机生成**并打印到日志；建议用此变量固定 | 随机生成 |

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

接口需携带 `token`（即 `API_TOKEN`，未设置时首次启动随机生成、可在日志查看）。完整接口见运行中的 OpenAPI 文档：`http://<host>:3000/docs`。

---

## 配置存储（本地 & OpenList）

MovieRename 把"重命名 + 整理"作用在**存储**之上。至少需要配置一个**本地存储**用来放下载文件，以及一个**媒体库存储**作为整理目标。OpenList（AList 的衍生版）用于存储互通——例如把远程网盘挂载为 OpenList，再由 MovieRename 在本地与 OpenList 之间搬运/整理。

### 1. 部署 OpenList（独立服务）

OpenList 不是 MovieRename 的一部分，需自行部署（Docker 示例）：

```bash
docker run -d --name openlist -p 5244:5244 -v /your/openlist/data:/data onecloud/alist:latest
# 首次启动后查看初始管理员密码：
docker exec -it openlist ./alist admin
```

部署好后，在 OpenList 网页里添加你的存储（如阿里云盘 / 天翼云盘 / WebDAV 等），记下 OpenList 的**访问地址**（如 `http://<openlist-host>:5244`）与**管理员用户名/密码**（或生成的 token）。

### 2. 在 MovieRename 里添加存储

打开 MovieRename Web 界面 → **设定 → 存储 & 目录**：

- **添加本地存储**：类型选 `local`，路径填写容器内的本地目录（对应你 `-v` 挂载的 `/media/...`）。
- **添加 OpenList 存储**：类型选 `alist`，填写：
  - 地址：`http://<openlist-host>:5244`
  - 用户名 / 密码：OpenList 的管理员账号
  - （部分版本需要填 `token` 而非密码，按 OpenList 后台给出的来）

添加完成后，MovieRename 即可在「文件管理」中看到对应存储的文件树，并在**本地 ↔ OpenList** 之间执行重命名与整理。

### 3. 配置目录（整理规则）

同一页面下方配置：

- **下载目录**：放待整理的原始文件（可指向本地存储或 OpenList 存储下的某个路径）。
- **媒体库目录**：整理目标（电影 / 剧集 / 动漫等分类目录）。
- **整理方式**：复制 / 硬链接 / 移动。
- 还可开启刮削（下载海报/简介 NFO）。

配置保存后，进入 **文件管理**，选中文件或目录 → 点 **整理**，按提示选择目标存储与分类，即可执行重命名 + 自动归类。任务进度与结果见 **整理历史**。

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
