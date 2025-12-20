### **企业级Nginx反向代理与负载均衡实战**

#### **一、Nginx核心概念与价值**

**1. 什么是反向代理？**

*   **正向代理**：代表**客户端**，帮助客户端访问外部资源（如VPN、科学上网工具）。客户端知道代理的存在。
*   **反向代理**：代表**服务器端**，接收客户端请求，并将其**转发**给后端的真实服务器（如Tomcat集群）。**客户端感知不到后端服务器的存在**，认为请求就是发给Nginx的。

**2. Nginx的核心作用**

| 作用                    | 描述                                                         | 业务价值                                           |
| :---------------------- | :----------------------------------------------------------- | :------------------------------------------------- |
| **统一入口 & 域名映射** | 为后端多个服务提供一个**统一的访问域名和端口**（如 `www.pinter.com`）。 | 简化用户访问，实现服务发现与路由。                 |
| **负载均衡**            | 将客户端请求**智能地分发**到后端多个服务器实例上。           | 提高系统整体吞吐量、可用性和扩展性，避免单点过载。 |
| **高并发处理**          | 基于**事件驱动、异步非阻塞**模型，单机可支持**数十万**并发连接，资源消耗极低。 | 作为流量入口，能高效处理海量并发请求。             |
| **静态资源服务**        | 直接高效地处理静态文件（HTML、CSS、JS、图片），减轻后端应用服务器压力。 | 提升静态资源访问速度，释放应用服务器资源。         |
| **SSL/TLS终止**         | 在Nginx层完成HTTPS加解密，后端应用服务器使用HTTP，简化后端配置。 | 提升安全性的同时，降低后端服务器计算开销。         |

**3. 典型架构图**

```
用户 (浏览器/App)
        ↓ (访问 www.pinter.com)
    **Nginx (反向代理/负载均衡器)**
        ↓ (根据策略分发请求)
    [Tomcat-1:8080]  [Tomcat-2:8081]  ... (应用服务器集群)
        ↓ (查询/写入)
    **MySQL / Redis (数据层)**
```

#### **二、Nginx安装与基础配置（CentOS 7）**

**1. 安装Nginx（使用官方YUM源）**

```bash
# 1. 添加Nginx官方YUM仓库
sudo rpm -Uvh http://nginx.org/packages/centos/7/noarch/RPMS/nginx-release-centos-7-0.el7.ngx.noarch.rpm

# 2. 安装Nginx
sudo yum install -y nginx

# 3. 启动Nginx并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 4. 验证安装 (访问服务器IP，应看到Nginx欢迎页)
curl http://服务器IP
```

**2. 关键目录结构**

*   **主配置文件**：`/etc/nginx/nginx.conf`
*   **模块化配置目录**：`/etc/nginx/conf.d/` (存放各项目独立配置文件，如 `pinter.conf`)
*   **默认网站根目录**：`/usr/share/nginx/html`
*   **日志目录**：`/var/log/nginx/` (`access.log`, `error.log`)

#### **三、多项目配置实战：反向代理与负载均衡**

**场景**：在同一台Nginx后，代理两个独立的Java应用集群：`pinter` (2个实例) 和 `oa` (2个实例)。

**1. 创建应用独立配置文件**
在 `/etc/nginx/conf.d/` 目录下，为每个应用创建独立的 `.conf` 文件，便于管理。

* **`pinter.conf` 配置示例**：

  ```nginx
  # 定义上游服务器组 (Upstream) - pinter集群
  upstream pinter_servers {
      # 负载均衡策略：默认轮询 (round-robin)
      server 192.168.4.128:8080; # Tomcat实例1
      server 192.168.4.128:8081; # Tomcat实例2
      # 可添加权重、健康检查等参数
      # server 192.168.4.129:8080 weight=2; # 权重为2，接收更多请求
  }
  
  # Server块，处理特定域名的请求
  server {
      listen       80; # 监听80端口
      server_name  www.pinter.com; # 绑定的域名
  
      # 访问日志（可选，但推荐）
      access_log  /var/log/nginx/pinter_access.log main;
  
      # 核心：将匹配到的请求转发给上游服务器组
      location / {
          proxy_pass http://pinter_servers; # 指向上面定义的upstream
          # 以下为常用代理头设置，确保后端能获取真实客户端信息
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
          proxy_set_header X-Forwarded-Proto $scheme;
      }
  }
  ```

* **`oa.conf` 配置示例**：

  ```nginx
  upstream oa_servers {
      server 192.168.4.128:8090;
      server 192.168.4.128:8091;
  }
  
  server {
      listen       80;
      server_name  www.oa.com;
  
      access_log  /var/log/nginx/oa_access.log main;
  
      location / {
          proxy_pass http://oa_servers;
          proxy_set_header Host $host;
          proxy_set_header X-Real-IP $remote_addr;
          proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      }
  }
  ```

**2. 本地DNS解析（Hosts文件）**
由于未注册真实域名，需在**测试人员电脑**上修改Hosts文件（`C:\Windows\System32\drivers\etc\hosts` 或 `/etc/hosts`），将域名指向Nginx服务器IP。

```
192.168.4.127 www.pinter.com
192.168.4.127 www.oa.com
```

**3. 重新加载Nginx配置**

```bash
# 检查配置文件语法是否正确（重要！）
sudo nginx -t

# 语法无误后，重新加载配置（平滑重启，不中断服务）
sudo nginx -s reload

# 或使用systemctl
sudo systemctl reload nginx
```

**4. 验证配置**

*   浏览器访问 `http://www.pinter.com/pinter` 和 `http://www.oa.com/testoa`。
*   观察Nginx访问日志 `/var/log/nginx/pinter_access.log`，查看请求分发情况。
*   多次刷新页面，观察后端Tomcat日志，确认请求被**轮询**分发到不同实例。

#### **四、Nginx负载均衡策略详解**

在 `upstream` 模块中，可通过不同指令配置负载均衡策略：

| 策略            | 指令                   | 说明                                                 | 适用场景                                         |
| :-------------- | :--------------------- | :--------------------------------------------------- | :----------------------------------------------- |
| **轮询 (默认)** | `server ...;`          | 请求按时间顺序逐一分配到不同后端服务器。             | 后端服务器性能相近的无状态服务。                 |
| **加权轮询**    | `server ... weight=3;` | 根据权重分配请求，权重越高，被分配几率越大。         | 后端服务器性能不均（如新老机器混用）。           |
| **IP Hash**     | `ip_hash;`             | 根据客户端IP计算Hash，同一IP的请求总是发给同一后端。 | 需要保持会话（Session）一致性的应用。            |
| **最少连接**    | `least_conn;`          | 将请求分发给当前连接数最少的后端服务器。             | 后端服务器处理能力相近，但连接时长差异大的场景。 |

**示例（加权轮询）**：

```nginx
upstream backend {
    server backend1.example.com weight=5; # 50%的流量
    server backend2.example.com weight=3; # 30%的流量
    server backend3.example.com weight=2; # 20%的流量
}
```

#### **五、生产环境进阶配置与调优**

**1. 上游服务器健康检查**

```nginx
upstream backend {
    server backend1:8080 max_fails=3 fail_timeout=30s; # 30秒内失败3次，标记为不可用
    server backend2:8080;
    # 商业版Nginx Plus支持更丰富的主动健康检查
}
```

**2. 静态资源分离**

```nginx
server {
    ...
    # 动态请求转发给Tomcat
    location / {
        proxy_pass http://tomcat_servers;
    }
    # 静态资源由Nginx直接处理，效率更高
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        root /path/to/static/files;
        expires 30d; # 设置浏览器缓存30天
        access_log off; # 可选，关闭静态资源访问日志
    }
}
```

**3. 安全与性能调优**

*   **连接数限制**：`worker_connections 10240;` (在 `nginx.conf` 的 `events` 块中)。
*   **缓冲区优化**：调整 `proxy_buffer_size`, `proxy_buffers` 等，防止代理大响应时出问题。
*   **超时设置**：合理设置 `proxy_connect_timeout`, `proxy_read_timeout`, `proxy_send_timeout`。
*   **禁用服务器标识**：在 `http` 或 `server` 块中添加 `server_tokens off;`，隐藏Nginx版本信息。

**4. 日志分析与监控**

*   **访问日志格式定制**：在 `nginx.conf` 中定义 `log_format`，记录更丰富的信息（如响应时间 `$upstream_response_time`）。
*   **错误日志**：关注 `/var/log/nginx/error.log`，排查配置或运行时错误。
*   **状态监控**：商业版Nginx Plus提供状态模块。开源版可使用 `nginx-module-vts` 或通过日志分析工具（如GoAccess, ELK Stack）进行监控。

#### **六、故障排查与日常运维**

1.  **配置检查**：任何修改后，务必执行 `nginx -t`。
2.  **端口冲突**：确保Nginx监听端口（如80）未被其他程序占用 (`netstat -tunlp | grep :80`)。
3.  **权限问题**：Nginx进程用户（通常是 `nginx`）需要对日志目录等有写权限。
4.  **后端服务状态**：使用 `curl` 或 `telnet` 测试后端Tomcat实例是否可达且响应正常。
5.  **防火墙/SELinux**：确保防火墙已放行Nginx监听端口，SELinux策略允许网络连接。

#### **七、总结与展望**

通过本实战，您已经构建了一个**接近生产环境**的简易架构：**Nginx (LB) -> Tomcat Cluster (App) -> MySQL (DB)**。您掌握了：

1.  **核心概念**：反向代理、负载均衡、统一入口。
2.  **部署技能**：Nginx安装、多项目配置、负载均衡策略配置。
3.  **运维基础**：配置管理、日志查看、故障排查思路。

**学习路径建议**：

*   **深化**：继续学习Nginx高级特性，如缓存、限流、动静分离、HTTPS配置。
*   **扩展**：引入**缓存层**（如Redis），学习其部署与集成，进一步提升性能。
*   **演进**：学习 **Docker** 容器化技术，将Tomcat、Nginx等组件容器化，实现更高效、一致的环境管理。
*   **编排**：最终学习 **Kubernetes**，实现服务的自动部署、扩缩容和治理。