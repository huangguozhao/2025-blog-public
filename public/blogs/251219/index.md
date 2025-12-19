### **Linux环境下MySQL 5.7安装与配置完全指南**

#### **一、部署方案选择：YUM vs. 离线RPM**

| 部署方式                  | 优点                                         | 缺点                                              | 适用场景                                                     |
| :------------------------ | :------------------------------------------- | :------------------------------------------------ | :----------------------------------------------------------- |
| **YUM在线安装**           | 简单，自动解决依赖。                         | **网络依赖强**，下载慢；**版本可能非最新/指定**。 | 对版本不敏感、网络条件好的内部环境。                         |
| **离线RPM安装（本指南）** | **快速、可控、无网络要求**；可指定精确版本。 | 需手动处理依赖（本指南包已解决）。                | **企业测试/生产环境首选**，尤其网络受限或需版本一致性的环境。 |

**结论**：对于需要稳定、可控和快速部署的性能测试或生产环境，**离线RPM安装是更可靠的选择**。

#### **二、详细安装步骤**

**第1步：上传安装包**

*   将MySQL 5.7的RPM捆绑包（如 `mysql-5.7.38-1.el7.x86_64.rpm-bundle.tar`）上传至Linux服务器的任意目录，例如 `/opt/software/`。
*   使用工具：`Xftp`, `WinSCP`, `scp`命令。

**第2步：安装解压工具（如未安装）**

```bash
yum install -y unzip
# 如果是 `.tar` 包，系统已自带 `tar` 命令。
```

**第3步：解压安装包**

```bash
cd /opt/software
# 如果是 .zip 包
unzip mysql-5.7.38-1.el7.x86_64.rpm-bundle.zip
# 如果是 .tar 包
tar -xvf mysql-5.7.38-1.el7.x86_64.rpm-bundle.tar
```

**第4步：按顺序安装RPM包（关键！）**
进入解压后的目录，**严格按顺序**执行以下命令：

```bash
rpm -ivh mysql-community-common-5.7.38-1.el7.x86_64.rpm --nodeps --force
rpm -ivh mysql-community-libs-5.7.38-1.el7.x86_64.rpm --nodeps --force
rpm -ivh mysql-community-client-5.7.38-1.el7.x86_64.rpm --nodeps --force
rpm -ivh mysql-community-server-5.7.38-1.el7.x86_64.rpm --nodeps --force
```

**参数解释**：

*   `-ivh`：`i`安装，`v`显示详细信息，`h`显示进度条。
*   `--nodeps`：忽略依赖检查（确保包完整时使用）。
*   `--force`：强制安装，覆盖现有文件。

**第5步：启动MySQL服务**

```bash
systemctl start mysqld          # 启动服务
systemctl enable mysqld         # 设置开机自启
systemctl status mysqld         # 查看服务状态
```

**验证进程**：`ps -ef | grep mysqld`

#### **三、初始配置与安全加固**

**第6步：获取临时密码**
MySQL首次启动会为`root`生成一个**随机临时密码**，保存在日志中。

```bash
grep 'temporary password' /var/log/mysqld.log
```

输出示例：`A temporary password is generated for root@localhost: JqkR7>ieL9w-`

**第7步：使用临时密码登录并修改密码**

```bash
mysql -u root -p
# 输入上一步获取的临时密码
```

登录后，**必须立即修改密码**。MySQL 5.7有密码强度策略。

```sql
ALTER USER 'root'@'localhost' IDENTIFIED BY 'YourNewStrongPassword!123';
```

**密码策略要求**：通常需**至少8位**，包含**大小写字母、数字、特殊字符**。

**第8步：配置远程访问权限（按需）**
默认只允许本地(`localhost`)连接。如需远程（如从Windows Navicat）连接，需授权。

```sql
-- 授予root用户从任何IP访问所有数据库的全部权限（测试环境用，生产环境严禁！）
GRANT ALL PRIVILEGES ON *.* TO 'root'@'%' IDENTIFIED BY 'YourNewStrongPassword!123' WITH GRANT OPTION;
-- 刷新权限使设置生效
FLUSH PRIVILEGES;
```

**生产环境建议**：创建专属测试用户，按**最小权限原则**授权特定库表。

**第9步：退出MySQL**

```sql
EXIT;
```

#### **四、防火墙与SELinux配置**

**第10步：配置防火墙（如启用）**
如果系统防火墙(`firewalld`)开启，需放行MySQL默认端口（3306）。

```bash
systemctl stop firewalld          # 临时关闭（重启失效）
systemctl disable firewalld       # 永久禁用（测试环境常用）
# 或放行端口（生产推荐）
firewall-cmd --zone=public --add-port=3306/tcp --permanent
firewall-cmd --reload
```

**第11步：禁用SELinux（可选，常为问题源头）**
SELinux可能导致连接问题。临时禁用：

```bash
setenforce 0  # 临时设置为Permissive模式
```

永久禁用需编辑 `/etc/selinux/config`，将 `SELINUX=enforcing` 改为 `SELINUX=disabled`，然后重启。

#### **五、验证与连接测试**

**第12步：本地命令行验证**

```bash
mysql -u root -p'YourNewStrongPassword!123' -e "SHOW DATABASES;"
```

**第13步：远程客户端验证（如Navicat）**

1.  新建连接。
2.  主机：填写Linux服务器**IP地址**。
3.  端口：`3306`。
4.  用户名：`root`。
5.  密码：`YourNewStrongPassword!123`。
6.  点击“测试连接”，显示成功即可。

#### **六、进阶配置与问题排查（企业级）**

**1. 修改数据存储目录（如需）**
默认数据目录为 `/var/lib/mysql`。如需更改：

```bash
# 1. 停止MySQL
systemctl stop mysqld
# 2. 移动数据目录
mv /var/lib/mysql /new/data/path
# 3. 修改配置文件 /etc/my.cnf
sed -i 's|datadir=/var/lib/mysql|datadir=/new/data/path|g' /etc/my.cnf
# 4. 修复SELinux上下文（如启用）
semanage fcontext -a -t mysqld_db_t "/new/data/path(/.*)?"
restorecon -Rv /new/data/path
# 5. 重启MySQL
systemctl start mysqld
```

**2. 性能参数调优（基础）**
编辑 `/etc/my.cnf`，在 `[mysqld]` 段添加（根据服务器内存调整）：

```ini
[mysqld]
innodb_buffer_pool_size = 1G  # 缓冲池大小，建议为物理内存的50%-70%
max_connections = 500         # 最大连接数
query_cache_size = 0          # MySQL 5.7+ 建议关闭查询缓存
innodb_flush_log_at_trx_commit = 2  # 平衡性能与安全性
```

**3. 常见问题排查**

*   **无法远程连接**：
    *   检查防火墙、SELinux。
    *   确认MySQL用户有 `'%'` 主机权限。
    *   检查 `my.cnf` 中是否绑定了 `127.0.0.1`（应注释掉 `bind-address`）。
*   **忘记root密码**：
    1.  编辑 `/etc/my.cnf`，在 `[mysqld]` 段添加 `skip-grant-tables`。
    2.  重启MySQL：`systemctl restart mysqld`。
    3.  无密码登录并修改密码。
    4.  移除 `skip-grant-tables` 并重启。

#### **七、总结与后续**

**核心流程回顾**：上传包 → 解压 → 按序安装 → 启动服务 → 找临时密码 → 改密码 → 设远程权限 → 配防火墙 → 验证。

**学习路径建议**：

1.  **掌握传统部署**：如本指南，理解底层过程和依赖。
2.  **学习容器化部署**：使用 **Docker**（`docker run -d -p 3306:3306 --name mysql -e MYSQL_ROOT_PASSWORD=password mysql:5.7`），体验极简部署。
3.  **学习编排与管理**：使用 **Docker Compose** 或 **Kubernetes** 管理多服务应用。

**安全警告**：本指南为**测试环境**设计。**生产环境**务必：

*   使用**非root**、**强密码**、**最小权限**的用户。
*   定期备份。
*   启用SSL加密连接。
*   进行全面的安全审计和参数调优。

