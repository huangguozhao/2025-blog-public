# Docker

## 一、Docker 基础概念

1. **Docker**：一个容器化平台，可将应用程序及其依赖打包成轻量级、可移植的容器。

2. **镜像**：只读模板，用于创建 Docker 容器，包含运行应用程序所需的代码、运行时、系统工具和库。

3. **容器**：镜像的运行实例，是一个隔离的进程空间，包含应用程序及其运行环境。

4. **Docker 仓库**：存储和分发镜像的地方（如 Docker Hub）。



## 二、Docker 安装

- 需要在操作系统上安装 Docker 引擎才能使用 Docker 命令。
- 安装方法因操作系统而异（Linux、Windows、macOS），需参考官方文档进行安装。

## 三、Docker 常用命令

### 1. **镜像相关命令**

- **搜索镜像**：`docker search <镜像名称>`
  - 示例：`docker search mysql`
  - 说明：从 Docker Hub 搜索镜像，但通常更推荐直接在 Docker Hub 网站搜索（更直观）。

- **拉取镜像**：`docker pull <镜像名称>[:标签]`
  - 示例：`docker pull mysql`（默认拉取最新版 `latest`）
  - 指定版本：`docker pull mysql:5.7.40`
  - 说明：标签表示镜像版本，如 `5.7`、`8.0.32` 等。

- **查看本地镜像**：`docker images`
  - 显示本地已下载的镜像列表，包含镜像名称、标签、镜像 ID、创建时间等信息。

- **删除镜像**：`docker rmi <镜像ID或镜像名称:标签>`
  - 示例：`docker rmi abc123def456`
  - 说明：`rmi` 中的 `i` 代表 `image`，用于删除镜像。

### 2. **容器相关命令**

- **运行容器**：`docker run [参数] <镜像ID或镜像名称:标签>`
  - 常用参数：
    - `-d`：后台运行容器（守护进程模式）。
    - `--name <容器名称>`：为容器指定名称。
    - `-e <环境变量>`：设置环境变量（如 `-e MYSQL_ROOT_PASSWORD=123456`）。
    - `-p <主机端口>:<容器端口>`：端口映射。
    - `-v <主机目录>:<容器目录>`：数据卷挂载。
  - 示例：`docker run -d --name my_mysql -e MYSQL_ROOT_PASSWORD=123456 mysql:5.7`
  - 说明：运行 MySQL 容器时必须设置 `MYSQL_ROOT_PASSWORD` 环境变量，否则启动失败。

- **查看容器**：
  - `docker ps`：查看正在运行的容器。
  - `docker ps -a`：查看所有容器（包括已停止的）。

- **停止容器**：`docker stop <容器ID或容器名称>`
  - 示例：`docker stop my_mysql`

- **启动已停止的容器**：`docker start <容器ID或容器名称>`
  - 说明：用于重新启动已存在的容器，无需重新配置。

- **重启容器**：`docker restart <容器ID或容器名称>`

- **删除容器**：`docker rm <容器ID或容器名称>`
  - 说明：容器必须在停止状态下才能删除。

- **查看容器日志**：`docker logs <容器ID或容器名称>`
  - 参数：
    - `-f`：实时跟踪日志输出（类似 `tail -f`）。
    - `--tail <行数>`：查看最后指定行数的日志（如 `--tail 20`）。
  - 示例：`docker logs -f my_mysql`

- **进入容器内部**：`docker exec -it <容器ID或容器名称> /bin/bash`
  - 说明：
    - `-it`：以交互模式进入容器。
    - `/bin/bash`：启动 Bash 终端（容器内需支持 Bash）。
  - 进入后可通过 `exit` 退出容器。

- **容器与宿主机间拷贝文件**：
  - 宿主机 → 容器：`docker cp <本地路径> <容器ID或名称>:<容器路径>`
  - 容器 → 宿主机：`docker cp <容器ID或名称>:<容器路径> <本地路径>`
  - 示例：`docker cp my_mysql:/etc/mysql/my.cnf .`

### 3. **帮助与文档**

- 查看命令帮助：`docker <命令> --help`
  - 示例：`docker run --help`、`docker logs --help`


## 四、容器间通信

- **问题**：容器 IP 可能动态变化，不宜直接用于通信。

- **解决方案**：使用 Docker 网络，通过容器别名通信。


### 网络操作步骤：

1. **创建网络**：`docker network create -d bridge <网络名称>`
   - 示例：`docker network create -d bridge my_network`
   - 说明：`-d bridge` 指定桥接模式（默认）。

2. **查看网络列表**：`docker network ls`

3. **运行容器时加入网络**：`docker run -d --network <网络名称> --network-alias <别名> <镜像>`
   - 示例：`docker run -d --network my_network --network-alias mysql mysql:5.7`
   - 说明：`--network-alias` 为容器设置网络内别名。

4. **容器间通过别名通信**：在同一网络内的容器可使用别名相互访问（代替 IP）。

