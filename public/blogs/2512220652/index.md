# **Docker深度解析：容器化技术核心概念与实践**

## **一、Docker与虚拟化技术对比**

### **1.1 传统应用部署困境**

#### **1.1.1 环境冲突问题**

```bash
# 常见环境冲突场景
┌─────────────────────────────────────────────┐
│ 应用A：Python 2.7 + JDK 7 + Node.js 10     │
│ 应用B：Python 3.9 + JDK 11 + Node.js 16    │
│ 应用C：Python 3.6 + JDK 8 + Node.js 14     │
└─────────────────────────────────────────────┘

# 传统解决方案的问题
1. 全局安装不同版本导致冲突
2. 使用虚拟环境管理复杂
3. 依赖关系难以维护
4. 环境配置无法标准化
```

#### **1.2.2 Docker解决思路**

```bash
# Docker化解决方案
应用A → Docker容器（Python 2.7 + JDK 7 + Node.js 10）
应用B → Docker容器（Python 3.9 + JDK 11 + Node.js 16）
应用C → Docker容器（Python 3.6 + JDK 8 + Node.js 14）

# 所有容器运行在同一宿主机上
┌─────────────────────────────────────┐
│          Docker Engine              │
├─────────────────────────────────────┤
│ 容器A │ 容器B │ 容器C │ 容器D ... │
└─────────────────────────────────────┘
```

### **1.2 Docker vs 虚拟机架构对比**

#### **1.2.1 架构差异详解**

```bash
# 虚拟机架构（重量级）
宿主机
├── 虚拟机管理器（Hypervisor）
│   ├── 虚拟机A（完整Guest OS + App）
│   ├── 虚拟机B（完整Guest OS + App）
│   └── 虚拟机C（完整Guest OS + App）

# Docker架构（轻量级）
宿主机（Host OS）
├── Docker Engine
│   ├── 容器A（App + 依赖库）
│   ├── 容器B（App + 依赖库）
│   └── 容器C（App + 依赖库）
```

#### **1.2.2 性能与资源对比**

```bash
# 性能指标对比表
┌─────────────────┬─────────────┬─────────────┐
│     特性        │   虚拟机    │   Docker    │
├─────────────────┼─────────────┼─────────────┤
│ 启动时间       │ 1-3分钟     │ 1-3秒       │
│ 磁盘占用       │ GB级别      │ MB级别      │
│ 内存占用       │ 每个1-2GB   │ 每个10-100MB│
│ CPU开销        │ 较高        │ 极低        │
│ 性能损失       │ 5-20%       │ 1-5%        │
│ 隔离级别       │ 操作系统级  │ 进程级      │
│ 部署密度       │ 低          │ 高          │
│ 迁移便捷性     │ 困难        │ 简单        │
└─────────────────┴─────────────┴─────────────┘
```

#### **1.2.3 隔离机制对比**

```bash
# 虚拟机隔离（强隔离）
虚拟机A（完整Linux内核 + App）
虚拟机B（完整Linux内核 + App）
# 优点：完全隔离，安全性高
# 缺点：资源冗余，性能开销大

# Docker隔离（轻量级隔离）
宿主机Linux内核
├── 命名空间隔离（Namespace）
│   ├── PID命名空间：进程隔离
│   ├── NET命名空间：网络隔离
│   ├── MNT命名空间：文件系统隔离
│   ├── IPC命名空间：进程通信隔离
│   ├── UTS命名空间：主机名隔离
│   └── User命名空间：用户权限隔离
├── 控制组限制（Cgroups）
│   ├── CPU使用限制
│   ├── 内存使用限制
│   ├── 磁盘I/O限制
│   └── 网络带宽限制
└── 联合文件系统（UnionFS）
    ├── 只读层（镜像层）
    └── 可写层（容器层）
```

## **二、Docker核心概念深度解析**

### **2.1 镜像（Image）详解**

#### **2.1.1 镜像的分层结构**

```bash
# 镜像分层示例
┌─────────────────────────────────────────┐
│       应用层（可写层）                   │
├─────────────────────────────────────────┤
│       Python 3.9 运行环境层              │
├─────────────────────────────────────────┤
│       Ubuntu 20.04 基础层               │
└─────────────────────────────────────────┘

# 查看镜像分层
docker image inspect nginx:latest --format='{{.RootFS.Layers}}'

# 层复用原理
镜像A：基础层 + Python层 + 应用层
镜像B：基础层 + Python层 + 不同应用层
# 基础层和Python层被复用，节省存储空间
```

#### **2.1.2 镜像构建原理**

```dockerfile
# Dockerfile示例
FROM ubuntu:20.04                 # 基础镜像层
LABEL maintainer="dev@example.com"

RUN apt-get update && \           # 构建层1
    apt-get install -y python3

COPY requirements.txt /app/       # 构建层2
RUN pip3 install -r requirements.txt

COPY . /app                       # 构建层3
WORKDIR /app

CMD ["python3", "app.py"]         # 启动命令

# 构建过程
docker build -t myapp:1.0 .
# 输出：
# Step 1/6 : FROM ubuntu:20.04
#  ---> 987654321abc
# Step 2/6 : RUN apt-get update ...
#  ---> Running in abc123
#  ---> def456
# Step 3/6 : COPY requirements.txt ...
#  ---> ghi789
# ...
```

### **2.2 容器（Container）详解**

#### **2.2.1 容器运行原理**

```bash
# 容器创建过程
1. 拉取镜像（如果本地不存在）
   docker pull ubuntu:20.04

2. 创建容器层（可写层）
   ┌─────────────────┐
   │   可写层         │ ← 容器运行时修改
   ├─────────────────┤
   │   Python层       │
   ├─────────────────┤
   │   Ubuntu层       │
   └─────────────────┘

3. 分配命名空间
   - PID命名空间：独立的进程树
   - NET命名空间：独立的网络栈
   - MNT命名空间：独立的文件系统视图
   - IPC命名空间：独立的进程间通信
   - UTS命名空间：独立的主机名

4. 资源限制（Cgroups）
   - CPU配额：--cpus="1.5"
   - 内存限制：--memory="512m"
   - 磁盘限制：--storage-opt size=10G
```

#### **2.2.2 容器生命周期**

```bash
# 容器状态转换图
    docker create
镜像 ──────→ 创建容器（Created）
         │
         │ docker start
         ↓
    运行容器（Running）
         │
         │ docker stop
         ↓
    停止容器（Exited）
         │
         │ docker start
         ↓
    运行容器（Running）
         │
         │ docker pause
         ↓
    暂停容器（Paused）
         │
         │ docker unpause
         ↓
    运行容器（Running）
         │
         │ docker kill
         ↓
    强制停止（Exited）
         │
         │ docker rm
         ↓
      删除容器

# 查看容器状态
docker ps -a --format="table {{.ID}}\t{{.Image}}\t{{.Status}}\t{{.Names}}"
```

### **2.3 仓库（Registry）详解**

#### **2.3.1 Docker Hub 架构**

```bash
# Docker Registry 2.0架构
客户端（docker push/pull）
    ↓
Docker Registry（存储镜像）
    ├── 清单文件（Manifests）
    ├── 配置层（Config）
    ├── 镜像层（Layers）
    └── 标签（Tags）

# 镜像标签格式
[registry_hostname:port/][namespace/]repository:tag
示例：
1. nginx:latest                    # Docker Hub官方镜像
2. ubuntu:20.04                   # Docker Hub官方镜像
3. docker.io/library/nginx:latest # 完整格式
4. myregistry.com:5000/myapp:1.0  # 私有仓库
```

#### **2.3.2 公有仓库 vs 私有仓库**

```bash
# 公有仓库（Docker Hub）
优点：
  - 免费使用（有一定限制）
  - 海量镜像资源
  - 无需维护
缺点：
  - 网络可能受限
  - 有速率限制
  - 不适合私有镜像

# 私有仓库（自建Registry）
优点：
  - 完全控制
  - 网络内快速访问
  - 安全性高
  - 无速率限制
缺点：
  - 需要维护
  - 需要存储空间
  - 初始部署成本

# 常用Registry解决方案
1. Docker Registry（官方）
2. Harbor（企业级）
3. GitLab Container Registry
4. AWS ECR / Azure ACR / GCP GCR
```

## **三、Docker安装与配置**

### **3.1 系统要求与准备工作**

#### **3.1.1 系统要求检查**

```bash
#!/bin/bash
# check_docker_requirements.sh

echo "=== Docker安装前系统检查 ==="

# 1. 检查操作系统
echo "1. 操作系统："
cat /etc/os-release | grep -E "PRETTY_NAME|NAME"

# 2. 检查内核版本（需>=3.10）
echo -e "\n2. 内核版本："
uname -r
KERNEL_VERSION=$(uname -r | cut -d. -f1-2)
if [ $(echo "$KERNEL_VERSION >= 3.10" | bc) -eq 1 ]; then
    echo "✓ 内核版本满足要求"
else
    echo "✗ 内核版本过低，需要升级"
fi

# 3. 检查CPU虚拟化支持
echo -e "\n3. CPU虚拟化支持："
if grep -E 'vmx|svm' /proc/cpuinfo > /dev/null; then
    echo "✓ CPU支持虚拟化"
else
    echo "⚠  CPU虚拟化未启用，可能影响性能"
fi

# 4. 检查可用存储空间（建议>20GB）
echo -e "\n4. 磁盘空间："
df -h / | tail -1
AVAILABLE_SPACE=$(df / | tail -1 | awk '{print $4}' | sed 's/G//')
if [ $AVAILABLE_SPACE -ge 20 ]; then
    echo "✓ 磁盘空间充足"
else
    echo "⚠  磁盘空间不足，建议清理"
fi

# 5. 检查内存（建议>2GB）
echo -e "\n5. 内存："
free -h | grep Mem
TOTAL_MEM=$(free -g | grep Mem | awk '{print $2}')
if [ $TOTAL_MEM -ge 2 ]; then
    echo "✓ 内存充足"
else
    echo "⚠  内存可能不足"
fi
```

#### **3.1.2 卸载旧版本Docker**

```bash
#!/bin/bash
# uninstall_old_docker.sh

echo "开始卸载旧版本Docker..."

# 停止Docker服务
sudo systemctl stop docker
sudo systemctl stop docker.socket
sudo systemctl stop containerd

# 卸载Docker相关包
sudo yum remove -y \
    docker \
    docker-client \
    docker-client-latest \
    docker-common \
    docker-latest \
    docker-latest-logrotate \
    docker-logrotate \
    docker-engine \
    docker-ce \
    docker-ce-cli \
    containerd.io

# 删除Docker相关文件
sudo rm -rf /var/lib/docker
sudo rm -rf /var/lib/containerd
sudo rm -rf /etc/docker
sudo rm -rf /etc/systemd/system/docker.service.d

# 清理残留
sudo yum autoremove -y
sudo yum clean all

echo "旧版本Docker卸载完成"
```

### **3.2 Docker安装步骤**

#### **3.2.1 CentOS 7/8 安装Docker**

```bash
#!/bin/bash
# install_docker_centos.sh

set -e  # 遇到错误立即退出

echo "=== 开始安装Docker ==="

# 1. 安装依赖包
echo "1. 安装依赖包..."
sudo yum install -y yum-utils \
    device-mapper-persistent-data \
    lvm2 \
    git \
    curl \
    wget \
    vim

# 2. 添加Docker官方YUM源
echo -e "\n2. 配置Docker YUM源..."
sudo yum-config-manager \
    --add-repo \
    https://download.docker.com/linux/centos/docker-ce.repo

# 3. 安装Docker CE（社区版）
echo -e "\n3. 安装Docker CE..."
sudo yum install -y docker-ce docker-ce-cli containerd.io

# 4. 配置Docker（可选）
echo -e "\n4. 配置Docker..."
sudo mkdir -p /etc/docker

# 创建daemon.json配置文件
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "3"
  },
  "data-root": "/var/lib/docker",
  "exec-opts": ["native.cgroupdriver=systemd"],
  "live-restore": true,
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true"
  ]
}
EOF

# 5. 启动Docker服务
echo -e "\n5. 启动Docker服务..."
sudo systemctl start docker
sudo systemctl enable docker

# 6. 验证安装
echo -e "\n6. 验证安装..."
sudo docker version
sudo docker info

# 7. 测试运行
echo -e "\n7. 运行测试容器..."
sudo docker run hello-world

# 8. 添加用户到docker组（避免sudo）
echo -e "\n8. 配置用户权限..."
sudo groupadd docker 2>/dev/null || true
sudo usermod -aG docker $USER

echo -e "\n✓ Docker安装完成！"
echo "请重新登录或执行 'newgrp docker' 使配置生效"
echo "测试命令：docker run --rm ubuntu:20.04 echo 'Hello Docker!'"
```

#### **3.2.2 Ubuntu 20.04+ 安装Docker**

```bash
#!/bin/bash
# install_docker_ubuntu.sh

set -e

echo "=== Ubuntu系统Docker安装 ==="

# 1. 卸载旧版本
sudo apt-get remove -y docker docker-engine docker.io containerd runc

# 2. 安装依赖
sudo apt-get update
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    software-properties-common

# 3. 添加Docker官方GPG密钥
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
    sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# 4. 设置稳定版仓库
echo \
  "deb [arch=$(dpkg --print-architecture) \
  signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] \
  https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. 安装Docker
sudo apt-get update
sudo apt-get install -y \
    docker-ce \
    docker-ce-cli \
    containerd.io \
    docker-compose-plugin

# 6. 后续配置同CentOS
```

### **3.3 Docker配置优化**

#### **3.3.1 生产环境配置**

```bash
#!/bin/bash
# configure_docker_production.sh

echo "=== Docker生产环境配置 ==="

# 备份原配置
sudo cp /etc/docker/daemon.json /etc/docker/daemon.json.backup

# 创建生产环境配置
cat <<EOF | sudo tee /etc/docker/daemon.json
{
  "registry-mirrors": [
    "https://<your-registry-mirror>"
  ],
  
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m",
    "max-file": "10",
    "labels": "production",
    "env": "os,customer"
  },
  
  "data-root": "/data/docker",  # 修改数据存储路径
  
  "storage-driver": "overlay2",
  "storage-opts": [
    "overlay2.override_kernel_check=true",
    "overlay2.size=20G"
  ],
  
  "live-restore": true,  # Docker守护进程重启时保持容器运行
  
  "default-ulimits": {
    "nofile": {
      "Name": "nofile",
      "Hard": 65536,
      "Soft": 65536
    },
    "nproc": {
      "Name": "nproc",
      "Hard": 65536,
      "Soft": 65536
    }
  },
  
  "icc": false,  # 禁止容器间通信
  
  "userland-proxy": false,  # 禁用用户态代理
  
  "iptables": true,
  "ip-forward": true,
  "ip-masq": true,
  
  "cgroup-parent": "/docker.slice",
  
  "exec-opts": ["native.cgroupdriver=systemd"],
  
  "dns": ["8.8.8.8", "8.8.4.4"],
  "dns-opts": ["timeout:2", "attempts:3"],
  
  "experimental": false,
  
  "metrics-addr": "127.0.0.1:9323",  # 监控指标
  "debug": false
}
EOF

# 创建数据目录
sudo mkdir -p /data/docker
sudo chown -R root:docker /data/docker
sudo chmod -R 750 /data/docker

# 修改Docker服务配置
sudo mkdir -p /etc/systemd/system/docker.service.d
cat <<EOF | sudo tee /etc/systemd/system/docker.service.d/override.conf
[Service]
LimitNOFILE=infinity
LimitNPROC=infinity
LimitCORE=infinity
TasksMax=infinity
TimeoutStartSec=0
Restart=always
RestartSec=5s
EOF

# 重新加载配置
sudo systemctl daemon-reload
sudo systemctl restart docker

# 验证配置
docker info | grep -A5 "Registry Mirrors"
docker info | grep "Docker Root Dir"

echo "✓ Docker生产环境配置完成"
```

#### **3.3.2 安全加固配置**

```bash
#!/bin/bash
# docker_security_hardening.sh

echo "=== Docker安全加固配置 ==="

# 1. 启用用户命名空间（需要内核支持）
if grep -q "user_namespace" /proc/sys/kernel/unprivileged_userns_clone; then
    echo "启用用户命名空间隔离..."
    sudo tee /etc/docker/daemon.json <<EOF
{
  "userns-remap": "default"
}
EOF
fi

# 2. 配置容器默认安全选项
echo "配置容器安全选项..."
sudo tee /etc/containerd/config.toml <<EOF
[plugins]
  [plugins."io.containerd.grpc.v1.cri"]
    [plugins."io.containerd.grpc.v1.cri".containerd]
      default_runtime_name = "runc"
      [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc]
        runtime_type = "io.containerd.runc.v2"
        [plugins."io.containerd.grpc.v1.cri".containerd.runtimes.runc.options]
          SystemdCgroup = true
EOF

# 3. 配置AppArmor（如系统支持）
if command -v apparmor_parser &> /dev/null; then
    echo "配置AppArmor..."
    sudo apt-get install -y apparmor-utils 2>/dev/null || true
    sudo aa-status
fi

# 4. 配置Seccomp（安全计算模式）
echo "配置Seccomp..."
sudo wget -O /etc/docker/seccomp-profiles/default.json \
    https://raw.githubusercontent.com/moby/moby/master/profiles/seccomp/default.json

# 5. 启用Docker Content Trust（镜像签名验证）
echo "启用镜像签名验证..."
export DOCKER_CONTENT_TRUST=1

# 6. 配置审计
echo "配置Docker审计..."
sudo tee /etc/audit/rules.d/docker.rules <<EOF
-w /usr/bin/docker -p wa
-w /var/lib/docker -p wa
-w /etc/docker -p wa
-w /lib/systemd/system/docker.service -p wa
-w /lib/systemd/system/docker.socket -p wa
-w /etc/default/docker -p wa
-w /etc/docker/daemon.json -p wa
-w /usr/bin/docker-containerd -p wa
-w /usr/bin/docker-runc -p wa
EOF

sudo service auditd restart 2>/dev/null || true

echo "✓ Docker安全加固配置完成"
```

## **四、Docker生命周期管理**

### **4.1 镜像操作完整流程**

#### **4.1.1 镜像管理命令**

```bash
# 1. 搜索镜像
docker search [OPTIONS] TERM
# 示例：
docker search nginx --filter=is-official=true
docker search mysql --limit=5

# 2. 拉取镜像
docker pull [OPTIONS] NAME[:TAG|@DIGEST]
# 示例：
docker pull nginx:1.21-alpine
docker pull ubuntu:20.04
docker pull mysql:8.0 --platform linux/amd64

# 3. 列出镜像
docker images [OPTIONS] [REPOSITORY[:TAG]]
# 示例：
docker images
docker images --format "table {{.ID}}\t{{.Repository}}\t{{.Tag}}\t{{.Size}}"
docker images --filter "dangling=true"  # 显示悬空镜像

# 4. 删除镜像
docker rmi [OPTIONS] IMAGE [IMAGE...]
# 示例：
docker rmi nginx:1.20  # 删除指定标签
docker rmi -f $(docker images -q)  # 强制删除所有镜像
docker image prune -a  # 清理所有未使用镜像

# 5. 导出导入镜像
docker save [OPTIONS] IMAGE [IMAGE...] > file.tar
docker load < file.tar
# 示例：
docker save nginx:latest ubuntu:20.04 > images.tar
docker load < images.tar

# 6. 镜像历史
docker history [OPTIONS] IMAGE
# 示例：
docker history --no-trunc nginx:latest
```

#### **4.1.2 镜像标签管理**

```bash
# 镜像标签操作
# 1. 给镜像打标签
docker tag SOURCE_IMAGE[:TAG] TARGET_IMAGE[:TAG]
# 示例：
docker tag nginx:latest myregistry.com/nginx:v1.0
docker tag abc123 myapp:latest

# 2. 推送镜像到仓库
docker push [OPTIONS] NAME[:TAG]
# 示例：
docker push myregistry.com/myapp:v1.0
docker push --all-tags myregistry.com/myapp

# 3. 从仓库拉取
docker pull myregistry.com/myapp:v1.0

# 4. 镜像信息查看
docker inspect [OPTIONS] NAME|ID [NAME|ID...]
# 示例：
docker inspect nginx:latest --format='{{.Config.Cmd}}'
docker inspect --format='{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}' container_name
```

### **4.2 容器操作完整流程**

#### **4.2.1 容器创建与运行**

```bash
# 1. 创建容器（不启动）
docker create [OPTIONS] IMAGE [COMMAND] [ARG...]
# 示例：
docker create --name mynginx nginx:alpine
docker create -it --name myubuntu ubuntu:20.04 bash

# 2. 启动容器
docker start [OPTIONS] CONTAINER [CONTAINER...]
docker stop [OPTIONS] CONTAINER [CONTAINER...]
docker restart [OPTIONS] CONTAINER [CONTAINER...]

# 3. 创建并运行容器（最常用）
docker run [OPTIONS] IMAGE [COMMAND] [ARG...]
# 常用选项：
# -d, --detach           后台运行
# -it                    交互式运行
# --name string          指定容器名
# -p, --publish list     端口映射
# -v, --volume list      卷挂载
# -e, --env list         设置环境变量
# --network string       网络模式
# --restart string       重启策略

# 示例：
docker run -d --name web -p 80:80 nginx:alpine
docker run -it --rm ubuntu:20.04 bash
docker run -d --name mysql \
    -e MYSQL_ROOT_PASSWORD=123456 \
    -v mysql_data:/var/lib/mysql \
    mysql:8.0
```

#### **4.2.2 容器管理命令**

```bash
# 1. 查看容器
docker ps [OPTIONS]
# 示例：
docker ps                    # 运行中的容器
docker ps -a                 # 所有容器
docker ps -q                 # 只显示容器ID
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
docker ps --filter "status=running"
docker ps --filter "name=web"

# 2. 进入容器
docker exec [OPTIONS] CONTAINER COMMAND [ARG...]
# 示例：
docker exec -it web bash            # 进入容器
docker exec web ls -la              # 执行命令
docker exec -u root web whoami      # 指定用户

# 3. 容器日志
docker logs [OPTIONS] CONTAINER
# 示例：
docker logs web                     # 查看日志
docker logs -f web                  # 实时日志
docker logs --tail 100 web          # 最后100行
docker logs --since 10m web         # 最近10分钟
docker logs -t web                  # 显示时间戳

# 4. 容器状态监控
docker stats [OPTIONS] [CONTAINER...]
# 示例：
docker stats                         # 所有容器资源使用
docker stats --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}"
docker stats --no-stream             # 单次快照

# 5. 容器资源限制
docker update [OPTIONS] CONTAINER [CONTAINER...]
# 示例：
docker update --memory 512m web     # 更新内存限制
docker update --cpus 1.5 web        # 更新CPU限制
```

#### **4.2.3 容器数据管理**

```bash
# 1. 数据卷操作
# 创建数据卷
docker volume create [OPTIONS] [VOLUME]
# 示例：
docker volume create mysql_data
docker volume ls

# 使用数据卷
docker run -d --name mysql \
    -v mysql_data:/var/lib/mysql \
    mysql:8.0

# 查看卷信息
docker volume inspect mysql_data

# 清理未使用的卷
docker volume prune

# 2. 绑定挂载
docker run -d --name web \
    -v /host/path:/container/path:ro \
    nginx:alpine
# ro: 只读
# rw: 读写（默认）

# 3. 文件复制
docker cp [OPTIONS] CONTAINER:SRC_PATH DEST_PATH|-
docker cp [OPTIONS] SRC_PATH|- CONTAINER:DEST_PATH
# 示例：
docker cp web:/etc/nginx/nginx.conf ./nginx.conf
docker cp ./index.html web:/usr/share/nginx/html
```

### **4.3 Docker网络管理**

#### **4.3.1 网络模式**

```bash
# 查看网络
docker network ls
docker network inspect bridge

# 创建网络
docker network create [OPTIONS] NETWORK
# 示例：
docker network create mynetwork
docker network create --driver bridge --subnet 172.20.0.0/16 mybridge

# 常用网络模式
# 1. bridge（默认）：通过网桥连接容器
docker run --network bridge nginx

# 2. host：使用宿主机网络
docker run --network host nginx

# 3. none：无网络
docker run --network none nginx

# 4. container：共享另一个容器网络
docker run --network container:web nginx

# 5. 自定义网络
docker network create app_network
docker run -d --network app_network --name web1 nginx
docker run -d --network app_network --name web2 nginx
# web1和web2可以通过容器名互相访问
```

#### **4.3.2 网络配置示例**

```bash
# 复杂网络配置示例
# 创建自定义网络
docker network create \
    --driver bridge \
    --subnet=192.168.100.0/24 \
    --gateway=192.168.100.1 \
    --opt com.docker.network.bridge.name=docker_app \
    app_net

# 运行容器并指定IP
docker run -d \
    --network app_net \
    --ip 192.168.100.10 \
    --name app1 \
    nginx

docker run -d \
    --network app_net \
    --ip 192.168.100.20 \
    --name app2 \
    nginx

# 连接多个网络
docker network create frontend
docker network create backend

docker run -d \
    --network frontend \
    --name web \
    nginx

docker run -d \
    --network backend \
    --name db \
    mysql:8.0

# web容器连接到backend网络
docker network connect backend web

# 现在web可以通过容器名db访问MySQL
```

## **五、Docker实战示例**

### **5.1 快速部署Web应用**

```bash
#!/bin/bash
# deploy_web_app.sh

echo "=== 快速部署Web应用 ==="

# 1. 拉取Nginx镜像
docker pull nginx:alpine

# 2. 创建项目目录
mkdir -p ~/myweb/html
echo "<h1>Hello Docker!</h1>" > ~/myweb/html/index.html

# 3. 创建自定义配置
cat > ~/myweb/nginx.conf <<EOF
events {
    worker_connections 1024;
}

http {
    server {
        listen 80;
        server_name localhost;
        
        location / {
            root /usr/share/nginx/html;
            index index.html;
        }
        
        location /status {
            stub_status on;
            access_log off;
            allow 127.0.0.1;
            deny all;
        }
    }
}
EOF

# 4. 运行容器
docker run -d \
    --name myweb \
    -p 8080:80 \
    -v ~/myweb/html:/usr/share/nginx/html \
    -v ~/myweb/nginx.conf:/etc/nginx/nginx.conf:ro \
    --restart unless-stopped \
    nginx:alpine

# 5. 验证部署
sleep 2
echo "应用部署完成！"
echo "访问地址：http://localhost:8080"
echo "状态页面：http://localhost:8080/status"

# 查看容器状态
docker ps --filter "name=myweb"
docker logs myweb --tail 10
```

### **5.2 多容器应用部署**

```bash
#!/bin/bash
# deploy_multi_container.sh

echo "=== 部署多容器应用（WordPress + MySQL）==="

# 1. 创建网络
docker network create wordpress_net

# 2. 部署MySQL
docker run -d \
    --name mysql_db \
    --network wordpress_net \
    -e MYSQL_ROOT_PASSWORD=rootpass \
    -e MYSQL_DATABASE=wordpress \
    -e MYSQL_USER=wpuser \
    -e MYSQL_PASSWORD=wppass \
    -v mysql_data:/var/lib/mysql \
    --restart unless-stopped \
    mysql:8.0

echo "MySQL部署完成，等待初始化..."
sleep 30

# 3. 部署WordPress
docker run -d \
    --name wordpress \
    --network wordpress_net \
    -p 8080:80 \
    -e WORDPRESS_DB_HOST=mysql_db \
    -e WORDPRESS_DB_NAME=wordpress \
    -e WORDPRESS_DB_USER=wpuser \
    -e WORDPRESS_DB_PASSWORD=wppass \
    -v wp_content:/var/www/html/wp-content \
    --restart unless-stopped \
    wordpress:latest

# 4. 部署phpMyAdmin（可选）
docker run -d \
    --name phpmyadmin \
    --network wordpress_net \
    -p 8081:80 \
    -e PMA_HOST=mysql_db \
    -e PMA_PORT=3306 \
    --restart unless-stopped \
    phpmyadmin/phpmyadmin

# 5. 验证部署
echo "部署完成！"
echo "WordPress: http://localhost:8080"
echo "phpMyAdmin: http://localhost:8081"
echo "MySQL主机名：mysql_db"
echo ""

# 查看容器状态
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 查看网络
docker network inspect wordpress_net --format='{{range .Containers}}{{.Name}} {{.IPv4Address}}{{"\n"}}{{end}}'
```