# Docker Compose 

## 一、Docker Compose 概述

### 1. **Docker Compose 是什么**

- Docker 官方提供的**容器编排与管理工具**

- 用于**管理多个 Docker 容器**的应用

- **核心特点**：通过配置文件（YAML）管理容器，简化多容器部署

  ![Docker_Compose_工作流程与架构](D:\QZ\Docker\Docker_Compose_工作流程与架构.png)

### 2. **解决的问题**

- **多容器部署繁琐**：手动一个个启动容器（MySQL、Redis、Tomcat、Nginx）很麻烦
- **环境迁移困难**：在新机器上重复部署步骤效率低
- **容器依赖关系管理**：容器启动顺序需要手动控制

### 3. **与 Docker 的关系**

- Docker Compose **依赖于 Docker**，是 Docker 的辅助工具
- **底层还是 Docker**：最终运行的还是 Docker 容器
- **定位不同**：
  - Docker：单个容器的管理
  - Docker Compose：多个容器的编排管理

## 二、Docker Compose 安装与配置

### 1. **安装步骤**

```bash
# 1. 下载 Docker Compose 二进制文件
curl -L "https://github.com/docker/compose/releases/download/1.26.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 2. 添加执行权限
chmod +x /usr/local/bin/docker-compose

# 3. 验证安装
docker-compose -v
```

### 2. **安装注意事项**

- Docker Compose **需要单独安装**，不包含在 Docker 中
- 下载时注意**URL换行问题**，确保命令为单行
- 检查**空格和标点符号**是否正确
- 存放在 `/usr/local/bin/` 目录下，**无需配置环境变量**

## 三、Docker Compose 配置文件详解

### 1. **文件结构（docker-compose.yml）**

```yaml
version: '3'                # 版本声明（固定）
services:                   # 服务定义（容器配置）
  mysql:                    # 服务名称（容器名）
    image: mysql:5.7        # 使用的镜像
    # ...其他配置
networks:                   # 网络配置
  mtx_network:              # 网络名称
    driver: bridge          # 网络驱动类型
```

### 2. **核心配置项解析**

#### (1) **services（服务定义）**

- 每个服务对应一个容器
- 服务名称即为**容器在 Compose 中的标识**

#### (2) **常见服务配置参数**

| 参数             | 说明                                  | 对应 Docker 命令        |
| ---------------- | ------------------------------------- | ----------------------- |
| `image`          | 镜像名称或ID，本地不存在会自动拉取    | `docker pull`           |
| `container_name` | 容器名称（可选）                      | `--name`                |
| `ports`          | 端口映射，支持多个                    | `-p`                    |
| `volumes`        | 文件/目录映射，支持多个               | `-v`                    |
| `environment`    | 环境变量设置                          | `-e`                    |
| `command`        | 容器启动时执行的命令                  | `docker run` 最后的命令 |
| `privileged`     | 特权模式（root权限），通常设为 `true` | `--privileged`          |
| `networks`       | 加入的网络                            | `--network`             |
| `depends_on`     | 依赖关系，控制启动顺序                | 无直接对应              |

#### (3) **networks（网络配置）**

- 定义容器间通信的网络
- 默认使用 `bridge` 桥接模式
- 网络别名：**默认使用服务名称作为网络别名**

![docker-compose.yml配置结构树状图](D:\QZ\Docker\docker-compose.yml配置结构树状图.png)

### 3. **配置示例详解**

```yaml
# MySQL 服务配置
mysql:
  image: mysql:5.7
  privileged: true
  ports:
    - "3306:3306"                    # 端口映射
  environment:
    - MYSQL_ROOT_PASSWORD=123456     # 环境变量
  volumes:
    - "./mysql/conf/my.cnf:/etc/mysql/my.cnf"      # 配置文件映射
    - "./mysql/data:/var/lib/mysql"                # 数据目录映射
  networks:
    - mtx_network                     # 加入的网络

# Redis 服务配置
redis:
  image: redis:latest
  command: redis-server /etc/redis/redis.conf      # 启动命令
  # ...其他配置

# Tomcat 服务配置（有依赖关系）
tomcat-pinter-1:
  depends_on:                        # 依赖关系
    - mysql
    - redis
  # ...其他配置
```

## 四、Docker Compose 常用命令

### 1. **容器生命周期管理**

| 命令                     | 说明                     | 特点                   |
| ------------------------ | ------------------------ | ---------------------- |
| `docker-compose up -d`   | 启动所有容器（后台运行） | 首次使用，创建并启动   |
| `docker-compose stop`    | 停止所有容器             | 容器仍存在，可重新启动 |
| `docker-compose start`   | 启动已停止的容器         | 配合 `stop` 使用       |
| `docker-compose down`    | 停止并删除所有容器       | 彻底清理，容器被删除   |
| `docker-compose restart` | 重启所有容器             | 容器保持运行状态       |

### 2. **查看与监控命令**

| 命令                           | 说明                     |
| ------------------------------ | ------------------------ |
| `docker-compose ps`            | 查看容器状态（精简信息） |
| `docker-compose logs`          | 查看所有容器的日志       |
| `docker-compose logs [服务名]` | 查看指定服务的日志       |

### 3. **命令特性**

- **默认操作所有服务**：不加服务名时，操作所有容器

- **支持指定服务**：命令后加服务名，只操作该服务

  ```bash
  docker-compose stop nginx      # 只停止 nginx
  docker-compose logs mysql      # 只看 mysql 日志
  ```

- **必须在配置目录执行**：命令在 `docker-compose.yml` 所在目录执行

- **文件名约定**：默认使用 `docker-compose.yml`，可改但需加 `-f` 参数

## 五、Docker Compose 实战要点

### 1. **文件格式要求严格**

- **YAML 格式**：缩进、对齐必须准确
- **空格敏感**：冒号后必须有空格
- **层级关系**：通过缩进表示，通常使用2个空格
- **格式错误**：会导致启动失败

### 2. **依赖关系管理**

- `depends_on`：定义服务间依赖

- **启动顺序**：确保依赖服务先启动

- **示例**：Tomcat 依赖 MySQL 和 Redis

  ```yaml
  depends_on:
    - mysql
    - redis
  ```

### 3. **网络通信配置**

- **网络别名**：默认使用服务名称
- **容器间通信**：通过服务名（网络别名）访问
- **配置修改**：如果服务名改变，需同步修改依赖配置

### 4. **常见问题与解决**

- **端口冲突**：检查宿主机端口是否被占用
- **容器名重复**：修改 `container_name` 或删除旧容器
- **文件权限**：确保映射目录有适当权限
- **网络问题**：检查网络配置是否正确

## 六、Docker Compose vs Docker

### 1. **使用场景对比**

| 场景         | Docker       | Docker Compose |
| ------------ | ------------ | -------------- |
| 单容器测试   | ✓ 适合       | △ 可但不必要   |
| 多容器应用   | △ 繁琐       | ✓ 适合         |
| 生产环境部署 | △ 手动操作多 | ✓ 自动化高     |
| 团队协作     | △ 命令不统一 | ✓ 配置文件统一 |

### 2. **优势总结**

- **一键部署**：`docker-compose up` 完成所有部署
- **配置即代码**：环境配置可版本控制
- **简化操作**：无需记忆复杂命令参数
- **依赖管理**：自动处理服务依赖关系
- **环境一致性**：确保不同环境部署一致