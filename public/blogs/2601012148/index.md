# Docker 知识练习题

## 一、基础概念选择题

1. **Docker是什么？**
   A) 虚拟机软件
   B) 容器化平台
   C) 编程语言
   D) 数据库管理系统

2. **以下哪个是镜像的正确描述？**
   A) 镜像是一个运行实例
   B) 镜像是只读模板，用于创建容器
   C) 镜像是容器间的通信桥梁
   D) 镜像是Docker的配置文件

3. **容器的主要特点是什么？**
   A) 占用大量系统资源
   B) 完全隔离的进程空间
   C) 需要完整的操作系统
   D) 只能运行一个应用程序

## 二、命令填空题

1. 搜索Docker镜像的命令是：`docker ______ <镜像名称>`

2. 拉取MySQL 5.7版本镜像的命令是：`docker ______ mysql:______`

3. 查看本地所有镜像的命令是：`docker ______`

4. 删除镜像的命令是：`docker ______ <镜像ID>`

5. 后台运行容器的参数是：`______`

6. 为容器指定名称的参数是：`______ <容器名称>`

7. 设置环境变量的参数是：`______ <变量名=值>`

8. 端口映射的参数是：`______ <主机端口>:<容器端口>`

## 三、命令编写题

1. 编写命令：后台运行一个名为"my_app"的容器，使用nginx镜像，映射宿主机8080端口到容器的80端口。

2. 编写命令：查看所有容器（包括已停止的）。

3. 编写命令：停止名为"my_mysql"的容器。

4. 编写命令：实时查看"web_server"容器的日志。

5. 编写命令：以交互模式进入"my_app"容器。

6. 编写命令：从容器"my_mysql"中复制/etc/mysql/my.cnf文件到当前目录。

## 四、网络通信练习题

1. **创建Docker网络的命令格式是：**
   `docker ______ ______ -d ______ <网络名称>`

2. **运行容器时加入网络的参数是：**
   `______ <网络名称>`

3. **为容器设置网络别名的参数是：**
   `______ <别名>`

## 五、场景应用题

### 场景1：部署MySQL数据库

你需要部署一个MySQL数据库，要求：

- 容器名为"my_db"
- 密码为"123456"
- 映射宿主机3306端口
- 后台运行

请编写完整的docker run命令：

### 场景2：部署Web应用

你需要部署一个Web应用，要求：

- 使用nginx镜像
- 容器名为"web_server"
- 映射宿主机80端口到容器80端口
- 挂载本地./html目录到容器/usr/share/nginx/html目录
- 后台运行

请编写完整的docker run命令：

### 场景3：容器间通信

你需要创建两个容器（web和db）使其能够通信：

1. 创建网络
2. 运行MySQL容器加入网络，别名设为"database"
3. 运行Web应用容器加入网络，别名设为"webapp"

请编写相关命令：

## 六、综合练习题

### 练习1：完整的应用部署流程

假设你要部署一个包含前端和后端的完整应用，请按顺序编写命令：

1. 拉取nginx镜像
2. 拉取mysql镜像
3. 创建网络
4. 运行MySQL容器（设置密码，加入网络，别名"db"）
5. 运行nginx容器（加入网络，别名"web"，端口映射）

### 练习2：容器维护

当系统磁盘空间不足时，你需要清理Docker资源。请编写清理命令序列：

1. 停止所有运行中的容器
2. 删除所有停止的容器
3. 删除未使用的镜像
4. 删除未使用的网络
5. 执行系统级清理

## 七、答案参考

（请先尝试完成所有练习，再查看答案）

### 选择题答案：

1. B) 容器化平台
2. B) 镜像是只读模板，用于创建容器
3. B) 完全隔离的进程空间

### 填空题答案：

1. search
2. pull, 5.7
3. images
4. rmi
5. -d
6. --name
7. -e
8. -p

### 命令编写题答案：

1. `docker run -d --name my_app -p 8080:80 nginx`
2. `docker ps -a`
3. `docker stop my_mysql`
4. `docker logs -f web_server`
5. `docker exec -it my_app /bin/bash`
6. `docker cp my_mysql:/etc/mysql/my.cnf .`

### 网络通信答案：

1. `network create -d bridge`
2. `--network`
3. `--network-alias`

### 场景应用题参考答案：

#### 场景1：部署MySQL数据库

```
docker run -d --name my_db -e MYSQL_ROOT_PASSWORD=123456 -p 3306:3306 mysql:5.7
```

#### 场景2：部署Web应用

```
docker run -d --name web_server -p 80:80 -v ./html:/usr/share/nginx/html nginx
```

#### 场景3：容器间通信

```
# 1. 创建网络
docker network create -d bridge my_app_network

# 2. 运行MySQL容器
docker run -d --name db_container --network my_app_network --network-alias database -e MYSQL_ROOT_PASSWORD=123456 mysql:5.7

# 3. 运行Web应用容器
docker run -d --name web_container --network my_app_network --network-alias webapp -p 8080:80 nginx
```

### 综合练习题参考答案：

#### 练习1：完整的应用部署流程

```
# 1. 拉取镜像
docker pull nginx:latest
docker pull mysql:5.7

# 2. 创建网络
docker network create -d bridge app_network

# 3. 运行MySQL容器
docker run -d --name mysql_db --network app_network --network-alias db \
  -e MYSQL_ROOT_PASSWORD=mypassword123 \
  -e MYSQL_DATABASE=myapp \
  -p 3306:3306 \
  mysql:5.7

# 4. 运行nginx容器
docker run -d --name web_server --network app_network --network-alias web \
  -p 80:80 \
  -v /path/to/html:/usr/share/nginx/html \
  nginx:latest
```

#### 练习2：容器维护

```
# 1. 停止所有运行中的容器
docker stop $(docker ps -q)

# 2. 删除所有停止的容器
docker rm $(docker ps -a -q)

# 3. 删除未使用的镜像
docker image prune -a

# 4. 删除未使用的网络
docker network prune

# 5. 执行系统级清理（清理所有未使用的资源）
docker system prune -a
```

## 八、常见错误及解决方法

### 1. 端口冲突错误

**错误信息**：`bind: address already in use`
**解决方法**：

```
# 检查端口占用
netstat -tulpn | grep :80
# 或使用不同端口
docker run -p 8080:80 nginx
```

### 2. 容器名冲突

**错误信息**：`Conflict. The container name "/my_container" is already in use`
**解决方法**：

```
# 删除旧容器
docker rm my_container
# 或使用不同名称
docker run --name my_container_v2 nginx
```

### 3. 镜像不存在

**错误信息**：`Unable to find image 'nginx:latest' locally`
**解决方法**：

```
# 拉取镜像
docker pull nginx:latest
```

### 4. 网络连接问题

**错误信息**：容器间无法通信
**解决方法**：

```
# 确保容器在同一网络中
docker network inspect my_network
docker network connect my_network container_name
```

## 九、Docker最佳实践

### 1. 容器命名规范

- 使用有意义的名称：`web_server`、`mysql_db`
- 避免使用默认名称

### 2. 数据持久化

- 使用命名数据卷：`docker volume create my_data`
- 或主机目录挂载：`-v /host/path:/container/path`

### 3. 环境变量管理

- 使用环境文件：`--env-file .env`
- 敏感信息不要写在命令行中

### 4. 资源限制

```
docker run --memory=512m --cpus=0.5 nginx
```

### 5. 健康检查

```
docker run --health-cmd="curl -f http://localhost/ || exit 1" nginx
```