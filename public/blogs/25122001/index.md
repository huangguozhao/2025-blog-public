### **企业级Web应用部署实战：Tomcat + MySQL**

#### **一、核心概念：中间件与架构**

**1. 中间件的定义与价值**

*   **定义**：中间件是一种位于操作系统之上、应用软件之下的**基础软件**，为上层业务应用提供**通用、标准化的服务**。
*   **价值**：解决**共性问题**，让开发者专注于业务逻辑，而非底层技术实现（如网络协议解析、线程池管理、连接复用等）。提高开发效率，保证系统稳定性和性能。

**2. Tomcat的核心角色**
Tomcat是一个开源的 **Java Servlet 容器** 和 **Web服务器**。

*   **协议转换**：将浏览器发送的 **HTTP/HTTPS 请求**，转换为Java能够处理的 **Servlet/JSP 请求**，反之亦然。
*   **生命周期管理**：管理Web应用（如您的`pinter`项目）的加载、初始化、服务和销毁。
*   **并发处理**：内置多线程和连接池机制，高效处理高并发请求。
*   **其他服务**：会话管理、安全认证、JNDI资源查找等。

**3. 经典三层架构**
您演示的部署是经典Java Web应用的简化版：

```
用户 (Browser/App) <--[HTTP]--> **Tomcat (Web层)** <--[JDBC]--> **MySQL (数据层)**
                                     ↓
                              **业务应用 (pinter.jar)**
```

*   **Web层 (Tomcat)**：负责请求/响应、协议转换、静态资源服务。
*   **应用层 (您的Java项目)**：执行业务逻辑。
*   **数据层 (MySQL)**：持久化存储业务数据。

#### **二、完整部署流程与步骤详解**

**前提**：已准备好一台Linux服务器（如`192.168.4.129`）用于部署Tomcat和应用，另一台服务器（如`192.168.4.128`）已安装并配置好MySQL。

**第1步：部署Tomcat（应用服务器）**

1. **上传Tomcat**：将Tomcat压缩包（如`apache-tomcat-9.0.xx.tar.gz`）上传至应用服务器的 `/opt` 或 `/usr/local` 目录。

2. **解压**：

   ```bash
   tar -xzvf apache-tomcat-9.0.xx.tar.gz
   mv apache-tomcat-9.0.xx /usr/local/tomcat9  # 重命名方便管理
   ```

3. **授予执行权限**：

   ```bash
   cd /usr/local/tomcat9/bin
   chmod +x *.sh
   ```

4. **（可选）环境变量**：可将`CATALINA_HOME`加入环境变量以便管理。

**第2步：准备数据库（数据服务器）**

1. **创建数据库与用户**（在生产环境应使用专用用户）：

   ```sql
   -- 在MySQL服务器上执行
   CREATE DATABASE pinter CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
   CREATE USER 'pinter_user'@'%' IDENTIFIED BY 'StrongPassword!123';
   GRANT ALL PRIVILEGES ON pinter.* TO 'pinter_user'@'%';
   FLUSH PRIVILEGES;
   ```

2. **导入初始数据**：使用开发提供的SQL文件初始化数据库。

   ```bash
   # 在MySQL服务器上
   mysql -u pinter_user -p pinter < /path/to/pinter_init.sql
   ```

**第3步：部署并配置Java Web应用**

1. **上传应用包**：将开发提供的 **WAR包**（如`pinter.war`）或**解压后的Web应用目录**上传至Tomcat的 `webapps/` 目录。

   *   **WAR包**：Tomcat启动时会自动解压。
   *   **目录**：直接放置（如 `webapps/pinter/`）。

2. **关键：配置数据库连接**

   * 找到应用配置文件，通常位于 `WEB-INF/classes/` 下，如 `application.properties` 或 `jdbc.properties`。

   * 修改其中的JDBC连接信息，指向您的MySQL服务器。

     ```properties
     # 示例配置
     jdbc.url=jdbc:mysql://192.168.4.128:3306/pinter?useUnicode=true&characterEncoding=utf8&useSSL=false
     jdbc.username=pinter_user
     jdbc.password=StrongPassword!123
     ```

**第4步：启动Tomcat并验证**

1. **启动Tomcat**：

   ```bash
   cd /usr/local/tomcat9/bin
   ./startup.sh
   ```

   * **启动并实时查看日志**（推荐）：

     ```bash
     ./startup.sh && tail -f ../logs/catalina.out
     ```

2. **验证启动成功**：

   *   **查看进程**：`ps -ef | grep tomcat`
   *   **检查关键日志**：`tail -100 ../logs/catalina.out`，寻找类似 `Server startup in [xxxx] milliseconds` 的成功信息，以及您的应用 `pinter` 部署成功的日志。

3. **防火墙配置**：确保Tomcat服务器的防火墙已放行8080端口（或您自定义的端口）。

   ```bash
   firewall-cmd --zone=public --add-port=8080/tcp --permanent
   firewall-cmd --reload
   # 或临时关闭防火墙（仅限测试环境）
   systemctl stop firewalld
   ```

**第5步：功能与连通性测试**

1.  **访问Web界面**：浏览器打开 `http://192.168.4.129:8080/pinter/`。
2.  **测试数据库连通性**：调用一个需要查询数据库的接口，如 `http://192.168.4.129:8080/pinter/user?name=user_10`，验证返回的数据与数据库中一致。
3.  **查看Tomcat管理页面**（若启用）：`http://192.168.4.129:8080/manager/`，可查看已部署应用状态。

#### **三、高级运维与管理**

**1. Tomcat启停与管理**

*   **启动**：`./startup.sh`
*   **关闭（优雅）**：`./shutdown.sh`
*   **强制关闭**：先 `ps -ef | grep tomcat` 找到主进程PID，然后 `kill -9 <PID>`。
*   **重启**：先关闭，再启动。或编写脚本循环检查，自动重启。

**2. 日志管理**

*   **核心日志**：`logs/catalina.out`（标准输出和错误）。
*   **应用日志**：应用自身的日志配置，可能输出到 `logs/` 下的其他文件或自定义目录。
*   **日志轮转**：生产环境必须配置日志切割（如使用`logrotate`），防止单个日志文件过大。

**3. 性能与安全调优（Tomcat）**
编辑 `conf/server.xml`：

*   **连接器优化**：调整 `maxThreads`、`acceptCount`、`connectionTimeout`。
*   **禁用AJP**：若不使用Apache等前端代理，可注释掉AJP Connector。
*   **安全加固**：删除 `webapps/` 下默认的 `docs`, `examples`, `host-manager`, `manager` 应用；修改管理端口和强密码。

**4. 项目更新（热部署/冷部署）**

*   **冷部署**：停止Tomcat，替换 `webapps/` 下的WAR包或应用目录，再启动。
*   **热部署（不推荐生产）**：依赖Tomcat的 `autoDeploy` 特性，但可能造成内存泄漏或类加载问题。

#### **四、架构演进与容器化提示**

**1. 传统架构局限性**：
    *   **环境依赖强**：应用与Tomcat版本、系统库强绑定。
    *   **部署复杂**：每台服务器需重复配置。
    *   **资源隔离差**：多个应用部署在同一Tomcat下可能相互影响。

**2. 容器化部署（Docker）趋势**：
    *   **解决方案**：将 **Tomcat + 您的应用 + 运行环境** 打包成一个Docker镜像。
    *   **优势**：一次构建，随处运行；环境一致；快速部署和水平扩展。
    *   **简单示例**：
        ```dockerfile
        # Dockerfile
        FROM tomcat:9-jdk11-openjdk-slim
        COPY ./pinter.war /usr/local/tomcat/webapps/
        EXPOSE 8080
        ```
        构建并运行：`docker run -d -p 8080:8080 --name pinter-app pinter-image`

#### **五、总结与最佳实践**

1.  **环境分离**：测试/生产环境应做到**网络隔离、服务器分离**。数据库、应用服务器、缓存等应独立部署。
2.  **配置外化**：数据库连接等配置**不应硬编码**在代码中，应使用外部配置文件或配置中心，便于不同环境切换。
3.  **版本控制**：对所有安装包（Tomcat, JDK）、配置文件、SQL脚本进行版本管理。
4.  **自动化脚本**：编写Shell脚本自动化完成安装、配置、启动、停止等操作，提高效率，减少人为错误。
5.  **监控告警**：部署后，配置对Tomcat进程、端口、应用关键接口、数据库连接池等的监控和告警。