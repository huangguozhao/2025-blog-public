### **企业级多项目部署与Tomcat运维实战**

#### **一、多项目部署原则与模式**

在企业环境中，尤其是在资源有限的**测试/预发布环境**，一台服务器部署多个项目是常态。关键在于**如何实现隔离与稳定**。

| 部署模式                    | 具体做法                                                     | 优点                                                         | 缺点                                                         | 推荐度       |
| :-------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- | :----------- |
| **单Tomcat多应用 (不推荐)** | 将多个WAR包或应用目录直接放入**同一个Tomcat**的 `webapps/` 目录。 | 简单，节省内存。                                             | **无隔离性**：一个应用崩溃、重启、内存泄漏会影响所有应用；日志混杂；无法独立配置。 | **不推荐**   |
| **多Tomcat实例 (推荐)**     | 为**每个项目**单独复制/安装一个Tomcat实例，运行在**不同的端口**。 | **高隔离性**：应用独立，互不影响；便于独立管理、监控、启停和配置。 | 略占用更多磁盘和内存（可接受）。                             | **强烈推荐** |
| **容器化部署 (趋势)**       | 使用Docker，每个应用及其Tomcat环境打包成一个独立容器。       | **极致隔离**，环境一致，弹性伸缩，资源控制精细。             | 需要学习Docker及编排技术。                                   | **未来方向** |

**核心原则**：**“一应用，一Tomcat实例”**。避免将所有鸡蛋放在一个篮子里。

#### **二、多Tomcat实例部署实战：解决端口冲突**

当在同一服务器启动多个Tomcat时，默认端口（8080, 8005, 8009）冲突是必然问题。必须修改每个实例的端口配置。

**1. 复制Tomcat实例**

```bash
cp -r /usr/local/tomcat-pinter /usr/local/tomcat-oa
```

**2. 修改端口配置（关键步骤）**
编辑新Tomcat实例的 `conf/server.xml` 文件。

```bash
vi /usr/local/tomcat-oa/conf/server.xml
```

定位并修改以下**三个关键端口**：

| 端口属性               | 默认值 | 作用                                           | 修改示例 | 查找关键字                                    |
| :--------------------- | :----- | :--------------------------------------------- | :------- | :-------------------------------------------- |
| **SHUTDOWN端口**       | `8005` | 用于接收关闭Tomcat的指令。                     | `8015`   | `<Server port="8005"`                         |
| **HTTP/1.1连接器端口** | `8080` | **主要服务端口**，浏览器通过此端口访问应用。   | `8090`   | `port="8080"` (在第一个 `<Connector>` 标签内) |
| **AJP连接器端口**      | `8009` | 用于与Apache等HTTP服务器集成，若不用可注释掉。 | `8019`   | `port="8009"` (在第二个 `<Connector>` 标签内) |

**修改示例**：

```xml
<!-- 修改前 -->
<Server port="8005" shutdown="SHUTDOWN">
    ...
    <Connector port="8080" protocol="HTTP/1.1" ... />
    <Connector port="8009" protocol="AJP/1.3" redirectPort="8443" />
</Server>

<!-- 修改后 -->
<Server port="8015" shutdown="SHUTDOWN">
    ...
    <Connector port="8090" protocol="HTTP/1.1" ... />
    <Connector port="8019" protocol="AJP/1.3" redirectPort="8443" />
</Server>
```

**重要**：修改的端口号必须在系统中**未被占用**（可通过 `netstat -tunlp | grep <端口号>` 检查）。

**3. 部署应用并启动**

* 将应用（如 `testoa.war` 或目录）放入新Tomcat的 `webapps/`。

* 启动新实例：

  ```bash
  cd /usr/local/tomcat-oa/bin
  ./startup.sh && tail -f ../logs/catalina.out
  ```

* 访问验证：`http://服务器IP:8090/testoa/`

#### **三、Tomcat访问日志深度解析与配置**

Tomcat的访问日志（Access Log）是**性能分析、故障排查、业务监控和安全审计**的宝贵数据源。

**1. 日志位置与格式**

* **位置**：`${CATALINA_BASE}/logs/` 目录下，默认命名 `localhost_access_log.[yyyy-MM-dd].txt`

* **默认格式**：记录了客户端IP、时间、请求方法、URI、协议、状态码、返回字节数等。

  ```
  192.168.1.100 - - [12/Mar/2023:15:30:01 +0800] "GET /testoa/login.do HTTP/1.1" 200 1234
  ```

**2. 启用并自定义日志格式（记录响应时间）**
响应时间是性能分析的核心指标。修改 `conf/server.xml` 中的 `AccessLogValve` 配置。

**找到并修改以下配置段**：

```xml
<Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
       prefix="localhost_access_log" suffix=".txt"
       pattern="%h %l %u %t &quot;%r&quot; %s %b" />
```

**修改`pattern`属性，添加 `%T` 或 `%D`**：

*   `%T`：处理请求所花费的**时间，以秒为单位**。
*   `%D`：处理请求所花费的**时间，以毫秒为单位**（更精确）。

**修改后示例**：

```xml
<Valve className="org.apache.catalina.valves.AccessLogValve" directory="logs"
       prefix="localhost_access_log" suffix=".txt"
       pattern="%h %l %u %t &quot;%r&quot; %s %b %T" />
       <!-- 在末尾添加了 %T -->
```

**重启Tomcat后，日志格式变为**：

```
192.168.1.100 - - [12/Mar/2023:15:30:01 +0800] "GET /testoa/login.do HTTP/1.1" 200 1234 1.234
```

最后一个数字 `1.234` 表示该请求耗时 **1.234秒**。

**3. 访问日志的应用场景**

* **性能瓶颈定位**：通过 `%D` 排序，快速找出**最慢的接口**（如耗时 > 5s的请求）。

  ```bash
  grep " 2023-03-12" localhost_access_log.2023-03-12.txt | awk '{print $(NF)}' | sort -nr | head -20
  ```

* **接口调用量统计**：统计特定接口（如登录）的日调用量。

  ```bash
  grep "POST /testoa/login.do" localhost_access_log.2023-03-12.txt | wc -l
  ```

* **错误监控**：监控异常状态码（如4xx, 5xx）的请求。

  ```bash
  awk '$9 ~ /^[45]/ {print $0}' localhost_access_log.2023-03-12.txt
  ```

* **安全分析**：识别异常访问模式（如来自单一IP的暴力破解登录尝试）。

#### **四、生产环境部署建议**

1. **使用非root用户运行Tomcat**：创建专用用户（如 `tomcat`）运行Tomcat服务，增强安全性。

2. **JVM参数调优**：在 `bin/setenv.sh`（需创建）中设置堆内存、垃圾回收器等参数。

   ```bash
   export JAVA_OPTS="-Xms512m -Xmx1024m -XX:+UseG1GC"
   ```

3. **日志轮转与清理**：使用 `logrotate` 工具配置日志自动切割、压缩和过期删除，防止磁盘写满。

4. **进程守护**：使用 `systemd` 或 `supervisord` 托管Tomcat进程，实现异常退出后自动重启。

5. **与前端的集成**：生产环境通常会在Tomcat前加装 **Nginx/Apache** 作为反向代理和负载均衡器，处理静态资源、SSL卸载、限流等。

#### **五、总结**

通过本实战，您应掌握：

1.  **多项目隔离部署**：通过**多Tomcat实例+不同端口**实现，这是测试环境的标准做法。
2.  **核心运维技能**：修改 `server.xml` 解决端口冲突、配置访问日志记录响应时间。
3.  **日志价值挖掘**：理解访问日志是性能分析和业务监控的“金矿”，并学会基础的分析命令。
4.  **演进方向**：认识到容器化部署是解决环境一致性和隔离性的更优方案。

