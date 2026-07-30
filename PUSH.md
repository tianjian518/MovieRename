# 推送指南（GitHub + DockerHub，多架构）

MovieRename 的代码已就绪并提交（tag `v1.0`）。以下命令用于把仓库推送到你的 GitHub、
把镜像推送到 DockerHub。请在**你自己的终端 / CI**中执行（需要你的凭据，注意保密）。

---

## 1. 推送到 GitHub

```bash
# 进入项目目录
cd MovieRename

# 关联你的仓库（替换 <your-github> 与仓库名）
git remote add origin https://github.com/<your-github>/MovieRename.git

# 推送 main 分支与 v1.0 标签
git push -u origin main
git push origin v1.0
```

> 若仓库已存在且你想覆盖，可用 `git push -u origin main --force`（谨慎）。

---

## 2. 构建并推送 Docker 镜像

### 单架构（当前机器架构，最快验证）

```bash
docker build -f docker/Dockerfile -t <dockerhub-user>/movierename:1.0 .
docker login
docker push <dockerhub-user>/movierename:1.0
```

### 多架构（linux/amd64 + linux/arm64，推荐）

> 需要本机已注册 QEMU binfmt（大多数 Linux 桌面/CI 已具备）：
> `docker run --rm --privileged multiarch/qemu-user-static --reset -p yes`
> 本沙箱环境禁止挂载 binfmt_misc，因此无法在此构建 arm64；请在你自己的环境执行。

```bash
# 创建并使用 buildx 构建器
docker buildx create --name mr-builder --use 2>/dev/null || docker buildx use mr-builder
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -t <dockerhub-user>/movierename:1.0 \
  -t <dockerhub-user>/movierename:latest \
  -f docker/Dockerfile . \
  --push
```

推送后可在 DockerHub 仓库的 "Tags" 页确认同时拥有 `linux/amd64` 与 `linux/arm64` 两个架构。

---

## 3. 部署运行

```bash
docker run -d --name movierename -p 3000:3000 \
  -v /your/config:/config -v /your/media:/media \
  -e MOVIEPILOT_TMDB_API_KEY=<你的TMDB_API_KEY> \
  <dockerhub-user>/movierename:1.0
```

API 基地址：`http://<host>:3000`，文档：`/docs`。默认 API 令牌为 `moviepilot`
（首次启动若未设置 `API_TOKEN` 会随机生成，可在日志中查看或用 `API_TOKEN` 环境变量固定）。
