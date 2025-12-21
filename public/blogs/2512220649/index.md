# **Redis多实例部署与主从架构深度实践**

## **一、Redis多实例部署详解**

### **1.1 Redis单线程架构解析**

#### **1.1.1 Redis的单线程模型**

```bash
# Redis进程结构
redis-server (单进程)
└── 主线程 (单线程处理所有请求)
    ├── 网络I/O
    ├── 命令解析
    ├── 命令执行
    ├── 响应返回
    └── 后台任务 (如持久化)

# 单线程优势
1. 无锁竞争，减少上下文切换
2. 内存访问快，避免CPU缓存频繁失效
3. 简单高效，避免复杂同步问题

# 单线程局限性
1. 无法充分利用多核CPU
2. 单个大key操作会阻塞其他请求
3. 计算密集型任务会影响整体性能
```

#### **1.1.2 CPU核心与Redis实例数量关系**

```bash
# 查看CPU核心数
cat /proc/cpuinfo | grep "processor" | wc -l
# 或
nproc

# Redis实例数量建议
# 生产环境推荐：CPU核心数 × 1.5
# 例如：8核CPU → 12个Redis实例

# 多实例部署优势
1. 充分利用多核CPU资源
2. 实现业务隔离（不同业务用不同实例）
3. 提高整体吞吐量
4. 故障隔离（一个实例崩溃不影响其他）
```

### **1.2 多实例部署实战**

#### **1.2.1 创建多实例配置文件**

```bash
#!/bin/bash
# create_redis_instances.sh

BASE_PORT=6379
INSTANCE_COUNT=4  # 根据CPU核心数调整
CONFIG_DIR="/etc/redis/instances"
DATA_DIR="/var/lib/redis"
LOG_DIR="/var/log/redis"

# 创建目录
mkdir -p ${CONFIG_DIR} ${DATA_DIR} ${LOG_DIR}

for ((i=0; i<INSTANCE_COUNT; i++))
do
    PORT=$((BASE_PORT + i))
    CONFIG_FILE="${CONFIG_DIR}/redis-${PORT}.conf"
    
    # 复制模板配置文件
    cp /path/to/redis.conf ${CONFIG_FILE}
    
    # 修改关键配置
    sed -i "s/^port 6379/port ${PORT}/" ${CONFIG_FILE}
    sed -i "s/^pidfile \/var\/run\/redis_6379.pid/pidfile \/var\/run\/redis_${PORT}.pid/" ${CONFIG_FILE}
    sed -i "s/^logfile \"\"/logfile \"${LOG_DIR}\/redis-${PORT}.log\"/" ${CONFIG_FILE}
    sed -i "s/^dir \.\//dir ${DATA_DIR}\/${PORT}/" ${CONFIG_FILE}
    sed -i "s/^dbfilename dump.rdb/dbfilename dump-${PORT}.rdb/" ${CONFIG_FILE}
    sed -i "s/^appendfilename \"appendonly.aof\"/appendfilename \"appendonly-${PORT}.aof\"/" ${CONFIG_FILE}
    
    # 创建数据目录
    mkdir -p "${DATA_DIR}/${PORT}"
    
    # 设置目录权限
    chown -R redis:redis "${DATA_DIR}/${PORT}"
    chmod 755 "${DATA_DIR}/${PORT}"
    
    echo "Created Redis instance config for port ${PORT}"
done
```

#### **1.2.2 多实例启动脚本**

```bash
#!/bin/bash
# redis_multi_start.sh

CONFIG_DIR="/etc/redis/instances"
REDIS_SERVER="/usr/local/bin/redis-server"

# 启动所有实例
start_all() {
    for config in ${CONFIG_DIR}/redis-*.conf; do
        if [ -f "$config" ]; then
            port=$(grep "^port" "$config" | awk '{print $2}')
            echo "Starting Redis instance on port ${port}..."
            $REDIS_SERVER "$config"
        fi
    done
}

# 停止所有实例
stop_all() {
    for config in ${CONFIG_DIR}/redis-*.conf; do
        if [ -f "$config" ]; then
            port=$(grep "^port" "$config" | awk '{print $2}')
            echo "Stopping Redis instance on port ${port}..."
            redis-cli -p ${port} shutdown
        fi
    done
}

# 检查实例状态
status_all() {
    for config in ${CONFIG_DIR}/redis-*.conf; do
        if [ -f "$config" ]; then
            port=$(grep "^port" "$config" | awk '{print $2}')
            if ps aux | grep "redis-server.*:${port}" | grep -v grep > /dev/null; then
                echo "Redis instance on port ${port}: RUNNING"
                # 检查连接
                redis-cli -p ${port} ping > /dev/null && echo "  -> Connection OK"
            else
                echo "Redis instance on port ${port}: STOPPED"
            fi
        fi
    done
}

case "$1" in
    start)
        start_all
        ;;
    stop)
        stop_all
        ;;
    restart)
        stop_all
        sleep 2
        start_all
        ;;
    status)
        status_all
        ;;
    *)
        echo "Usage: $0 {start|stop|restart|status}"
        exit 1
        ;;
esac
```

#### **1.2.3 Systemd服务管理**

```ini
# /etc/systemd/system/redis@.service
[Unit]
Description=Redis In-Memory Data Store (%i)
After=network.target

[Service]
Type=forking
User=redis
Group=redis
PIDFile=/var/run/redis_%i.pid
ExecStart=/usr/local/bin/redis-server /etc/redis/instances/redis-%i.conf
ExecStop=/usr/local/bin/redis-cli -p %i shutdown
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 启用和管理实例
systemctl enable redis@6379
systemctl start redis@6379
systemctl status redis@6379

# 批量管理
for port in {6379..6382}; do
    systemctl start redis@${port}
done
```

### **1.3 多实例监控**

#### **1.3.1 统一监控脚本**

```bash
#!/bin/bash
# redis_multi_monitor.sh

INSTANCE_PORTS=(6379 6380 6381 6382)
ALERT_THRESHOLD=80  # 内存使用率告警阈值

monitor_instance() {
    local port=$1
    local password=$2
    
    # 连接Redis获取信息
    if [ -z "$password" ]; then
        info=$(redis-cli -p $port info)
    else
        info=$(redis-cli -p $port -a $password info)
    fi
    
    # 解析关键指标
    local used_memory=$(echo "$info" | grep "used_memory:" | cut -d: -f2)
    local max_memory=$(echo "$info" | grep "maxmemory:" | cut -d: -f2)
    local connected_clients=$(echo "$info" | grep "connected_clients:" | cut -d: -f2)
    local ops_per_sec=$(echo "$info" | grep "instantaneous_ops_per_sec:" | cut -d: -f2)
    local hit_rate=$(echo "$info" | grep "keyspace_hits\|keyspace_misses" | awk -F: 'BEGIN{hits=0;misses=0} /hits/{hits=$2} /misses/{misses=$2} END{if(hits+misses>0) print hits*100/(hits+misses); else print 0}')
    
    # 内存使用率计算
    local mem_usage=0
    if [ "$max_memory" -ne 0 ]; then
        mem_usage=$((used_memory * 100 / max_memory))
    fi
    
    # 输出监控信息
    echo "=== Redis Instance :${port} ==="
    echo "Memory Usage: ${mem_usage}% (${used_memory}/${max_memory})"
    echo "Connected Clients: ${connected_clients}"
    echo "Ops/sec: ${ops_per_sec}"
    printf "Hit Rate: %.2f%%\n" $hit_rate
    
    # 告警检查
    if [ $mem_usage -ge $ALERT_THRESHOLD ]; then
        echo "⚠️  ALERT: Memory usage above ${ALERT_THRESHOLD}%"
        # 发送告警通知
        # send_alert "Redis:${port}" "内存使用率${mem_usage}%"
    fi
    
    echo ""
}

# 监控所有实例
for port in "${INSTANCE_PORTS[@]}"; do
    monitor_instance $port "yourpassword"
done
```

## **二、Redis主从架构深度解析**

### **2.1 主从复制原理**

#### **2.1.1 复制流程详解**

```bash
# 主从复制过程
1. 从节点发送 SLAVEOF 命令
2. 主节点执行 BGSAVE 生成RDB快照
3. 主节点发送RDB文件给从节点
4. 从节点清空旧数据，加载RDB
5. 主节点持续发送写命令给从节点
6. 从节点执行命令，保持数据同步

# 查看复制状态
redis-cli -p 6379 INFO replication
# 关键字段：
# role:master/slave
# connected_slaves:已连接从节点数
# master_repl_offset:复制偏移量
# slave_repl_offset:从节点复制偏移量
```

#### **2.1.2 完整主从配置示例**

**主节点配置 (redis-master.conf):**

```conf
# 基本配置
port 6379
daemonize yes
pidfile /var/run/redis_6379.pid
logfile /var/log/redis/redis-master.log
dir /var/lib/redis/master

# 安全配置
requirepass MasterPass123!
bind 0.0.0.0
protected-mode no

# 持久化配置
save 900 1
save 300 10
save 60 10000
dbfilename dump-master.rdb
appendonly yes
appendfilename "appendonly-master.aof"
appendfsync everysec

# 复制配置
repl-backlog-size 256mb          # 复制积压缓冲区大小
repl-backlog-ttl 3600            # 缓冲区超时时间
repl-timeout 60                  # 复制超时时间
repl-disable-tcp-nodelay no      # 禁用Nagle算法
min-slaves-to-write 1            # 最少从节点数量
min-slaves-max-lag 10            # 从节点最大延迟
```

**从节点配置 (redis-slave.conf):**

```conf
# 基本配置
port 6380
daemonize yes
pidfile /var/run/redis_6380.pid
logfile /var/log/redis/redis-slave.log
dir /var/lib/redis/slave

# 主从关系配置
slaveof 192.168.1.100 6379       # 主节点IP和端口
masterauth MasterPass123!         # 主节点密码
slave-read-only yes              # 从节点只读

# 安全配置
requirepass SlavePass123!
bind 0.0.0.0
protected-mode no

# 持久化配置
save ""                          # 从节点可以关闭持久化
dbfilename dump-slave.rdb
appendonly no                    # 从节点可关闭AOF

# 复制优化
slave-serve-stale-data yes       # 主节点宕机时仍可读
slave-priority 100               # 从节点优先级
repl-diskless-sync no            # 不使用无盘复制
repl-diskless-sync-delay 5       # 无盘复制延迟
```

### **2.2 主从架构部署实战**

#### **2.2.1 自动化部署脚本**

```bash
#!/bin/bash
# deploy_redis_master_slave.sh

MASTER_IP="192.168.1.100"
MASTER_PORT="6379"
SLAVE_IP="192.168.1.101"
SLAVE_PORT="6380"
PASSWORD="SecurePass123!"

# 1. 在主节点上配置
ssh root@${MASTER_IP} << EOF
    # 安装Redis
    yum install -y gcc make
    wget http://download.redis.io/releases/redis-5.0.14.tar.gz
    tar xzf redis-5.0.14.tar.gz
    cd redis-5.0.14
    make && make install
    
    # 创建配置文件
    mkdir -p /etc/redis
    cat > /etc/redis/redis-master.conf << MASTER_CONF
port ${MASTER_PORT}
daemonize yes
pidfile /var/run/redis_${MASTER_PORT}.pid
logfile /var/log/redis/redis-master.log
dir /var/lib/redis/master
requirepass ${PASSWORD}
bind 0.0.0.0
protected-mode no
MASTER_CONF
    
    # 创建数据目录
    mkdir -p /var/lib/redis/master
    
    # 启动主节点
    redis-server /etc/redis/redis-master.conf
EOF

# 2. 在从节点上配置
ssh root@${SLAVE_IP} << EOF
    # 安装Redis（同上）
    yum install -y gcc make
    wget http://download.redis.io/releases/redis-5.0.14.tar.gz
    tar xzf redis-5.0.14.tar.gz
    cd redis-5.0.14
    make && make install
    
    # 创建配置文件
    mkdir -p /etc/redis
    cat > /etc/redis/redis-slave.conf << SLAVE_CONF
port ${SLAVE_PORT}
daemonize yes
pidfile /var/run/redis_${SLAVE_PORT}.pid
logfile /var/log/redis/redis-slave.log
dir /var/lib/redis/slave
slaveof ${MASTER_IP} ${MASTER_PORT}
masterauth ${PASSWORD}
slave-read-only yes
requirepass ${PASSWORD}
bind 0.0.0.0
protected-mode no
SLAVE_CONF
    
    # 创建数据目录
    mkdir -p /var/lib/redis/slave
    
    # 启动从节点
    redis-server /etc/redis/redis-slave.conf
EOF

echo "Redis主从架构部署完成"
echo "主节点: ${MASTER_IP}:${MASTER_PORT}"
echo "从节点: ${SLAVE_IP}:${SLAVE_PORT}"
```

#### **2.2.2 主从切换与故障恢复**

```bash
#!/bin/bash
# redis_failover.sh

MASTER_IP="192.168.1.100"
MASTER_PORT="6379"
SLAVE_IP="192.168.1.101"
SLAVE_PORT="6380"
PASSWORD="SecurePass123!"

# 检查主节点状态
check_master() {
    if ! redis-cli -h ${MASTER_IP} -p ${MASTER_PORT} -a ${PASSWORD} ping > /dev/null 2>&1; then
        echo "Master node is down!"
        return 1
    fi
    return 0
}

# 提升从节点为主节点
promote_slave_to_master() {
    echo "Promoting slave to master..."
    
    # 1. 在从节点上执行
    ssh root@${SLAVE_IP} << EOF
        # 取消从属关系
        redis-cli -p ${SLAVE_PORT} -a ${PASSWORD} slaveof no one
        
        # 修改配置
        sed -i 's/^slaveof.*/#slaveof/' /etc/redis/redis-slave.conf
        sed -i 's/^slave-read-only yes/slave-read-only no/' /etc/redis/redis-slave.conf
        
        # 重启实例
        redis-cli -p ${SLAVE_PORT} -a ${PASSWORD} shutdown
        sleep 2
        redis-server /etc/redis/redis-slave.conf
EOF
    
    # 2. 更新其他从节点指向新的主节点
    # 如果有多个从节点，需要更新它们的配置
    
    echo "Failover completed. New master is ${SLAVE_IP}:${SLAVE_PORT}"
}

# 恢复原主节点为从节点
recover_old_master() {
    echo "Recovering old master as slave..."
    
    # 1. 修复原主节点
    ssh root@${MASTER_IP} << EOF
        # 重启Redis服务
        systemctl restart redis
        
        # 设置为新主节点的从节点
        redis-cli -p ${MASTER_PORT} -a ${PASSWORD} slaveof ${SLAVE_IP} ${SLAVE_PORT}
        
        # 修改配置
        sed -i "s/^#.*slaveof.*/slaveof ${SLAVE_IP} ${SLAVE_PORT}/" /etc/redis/redis-master.conf
        sed -i 's/^slave-read-only no/slave-read-only yes/' /etc/redis/redis-master.conf
EOF
    
    echo "Old master recovered as slave"
}

# 主监控循环
while true; do
    if ! check_master; then
        promote_slave_to_master
        # 可以选择自动恢复或手动恢复
        # recover_old_master
    fi
    sleep 10
done
```

### **2.3 主从架构注意事项**

#### **2.3.1 数据一致性保障**

```bash
# 1. 复制延迟监控
redis-cli -p 6380 info replication | grep -E "(lag|offset)"

# 2. 同步检查脚本
check_replication_sync() {
    MASTER_OFFSET=$(redis-cli -p 6379 info replication | grep "master_repl_offset" | cut -d: -f2)
    SLAVE_OFFSET=$(redis-cli -p 6380 info replication | grep "slave_repl_offset" | cut -d: -f2)
    
    LAG=$((MASTER_OFFSET - SLAVE_OFFSET))
    if [ $LAG -gt 1000 ]; then
        echo "WARNING: Replication lag is ${LAG} bytes"
        return 1
    fi
    return 0
}

# 3. 数据校验
validate_data_consistency() {
    # 从主节点获取所有key
    MASTER_KEYS=$(redis-cli -p 6379 keys "*" | sort)
    SLAVE_KEYS=$(redis-cli -p 6380 keys "*" | sort)
    
    if [ "$MASTER_KEYS" != "$SLAVE_KEYS" ]; then
        echo "ERROR: Key sets differ between master and slave"
        return 1
    fi
    
    # 抽样检查值是否一致
    for key in $(echo "$MASTER_KEYS" | head -10); do
        MASTER_VAL=$(redis-cli -p 6379 get "$key")
        SLAVE_VAL=$(redis-cli -p 6380 get "$key")
        
        if [ "$MASTER_VAL" != "$SLAVE_VAL" ]; then
            echo "ERROR: Value mismatch for key $key"
            return 1
        fi
    done
    
    return 0
}
```

#### **2.3.2 安全配置最佳实践**

```bash
# 1. 网络隔离
# 主从节点间使用专网通信
# 配置防火墙规则
iptables -A INPUT -s ${SLAVE_IP} -p tcp --dport 6379 -j ACCEPT
iptables -A INPUT -p tcp --dport 6379 -j DROP

# 2. TLS加密传输（Redis 6.0+）
# 在主从配置中启用TLS
tls-port 6379
tls-cert-file /path/to/redis.crt
tls-key-file /path/to/redis.key
tls-ca-cert-file /path/to/ca.crt

# 3. 认证增强
# 使用ACL（Redis 6.0+）
acl setuser slaveuser on >slavepass ~* &* +@all -@dangerous
```

## **三、应用层缓存架构实践**

### **3.1 缓存查询逻辑实现**

#### **3.1.1 缓存查询流程图解**

```
用户请求 → 应用服务器 → 缓存层查询 → 缓存命中 → 返回数据
                                ↓
                        缓存未命中 → 数据库查询 → 返回数据
                                ↓
                            写入缓存
```

#### **3.1.2 Java实现示例**

```java
@Service
public class UserService {
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    @Autowired
    private UserRepository userRepository;
    
    // 缓存查询逻辑
    public User getUserById(String userId) {
        String cacheKey = "user:" + userId;
        
        // 1. 尝试从缓存获取
        String cachedData = redisTemplate.opsForValue().get(cacheKey);
        if (cachedData != null) {
            // 缓存命中，直接返回
            return JSON.parseObject(cachedData, User.class);
        }
        
        // 2. 缓存未命中，查询数据库
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            // 数据库也不存在，返回空或抛出异常
            return null;
        }
        
        // 3. 将数据写入缓存
        String userJson = JSON.toJSONString(user);
        // 设置过期时间，防止永久缓存
        redisTemplate.opsForValue().set(cacheKey, userJson, 1, TimeUnit.HOURS);
        
        // 4. 返回数据
        return user;
    }
    
    // 更新数据时的缓存处理
    public User updateUser(User user) {
        // 1. 更新数据库
        User updatedUser = userRepository.save(user);
        
        // 2. 更新或删除缓存
        String cacheKey = "user:" + user.getId();
        
        // 方案A：更新缓存（保证一致性）
        String userJson = JSON.toJSONString(updatedUser);
        redisTemplate.opsForValue().set(cacheKey, userJson, 1, TimeUnit.HOURS);
        
        // 方案B：删除缓存（下次查询时重新加载）
        // redisTemplate.delete(cacheKey);
        
        return updatedUser;
    }
}
```

### **3.2 缓存预热策略**

#### **3.2.1 预热的必要性**

```java
@Component
public class CacheWarmUp {
    
    @Autowired
    private UserService userService;
    
    @Autowired
    private RedisTemplate<String, String> redisTemplate;
    
    // 应用启动时预热
    @PostConstruct
    public void warmUpOnStartup() {
        // 1. 预热热门数据
        List<String> hotUserIds = Arrays.asList("1", "2", "3", "10", "99");
        for (String userId : hotUserIds) {
            userService.getUserById(userId);  // 触发缓存加载
        }
        
        // 2. 预热配置数据
        warmUpConfigData();
        
        // 3. 统计预热结果
        Long cacheSize = redisTemplate.execute(
            connection -> connection.dbSize()
        );
        System.out.println("缓存预热完成，当前缓存数量：" + cacheSize);
    }
    
    // 定时预热
    @Scheduled(cron = "0 0 3 * * ?")  // 每天凌晨3点执行
    public void scheduledWarmUp() {
        System.out.println("开始定时缓存预热...");
        // 预热逻辑
    }
    
    // 业务事件触发预热
    @EventListener
    public void onProductPublish(ProductPublishEvent event) {
        // 新品发布时预热相关数据
        warmUpProductData(event.getProductId());
    }
}
```

#### **3.2.2 分布式预热脚本**

```python
#!/usr/bin/env python3
# cache_warmup.py

import redis
import mysql.connector
import json
from concurrent.futures import ThreadPoolExecutor

class CacheWarmup:
    def __init__(self):
        # 初始化Redis连接池
        self.redis_pool = redis.ConnectionPool(
            host='localhost',
            port=6379,
            password='password',
            db=0,
            max_connections=50
        )
        
        # 初始化MySQL连接
        self.mysql_conn = mysql.connector.connect(
            host="localhost",
            user="root",
            password="password",
            database="test_db"
        )
    
    def warmup_hot_data(self):
        """预热热点数据"""
        r = redis.Redis(connection_pool=self.redis_pool)
        cursor = self.mysql_conn.cursor(dictionary=True)
        
        # 查询热点用户（最近7天活跃）
        cursor.execute("""
            SELECT id, name, email FROM users 
            WHERE last_login >= DATE_SUB(NOW(), INTERVAL 7 DAY)
            ORDER BY login_count DESC 
            LIMIT 1000
        """)
        
        hot_users = cursor.fetchall()
        
        # 多线程预热
        with ThreadPoolExecutor(max_workers=10) as executor:
            for user in hot_users:
                executor.submit(self._cache_user, user)
        
        print(f"预热完成，共预热 {len(hot_users)} 条用户数据")
    
    def _cache_user(self, user):
        """缓存单个用户数据"""
        r = redis.Redis(connection_pool=self.redis_pool)
        cache_key = f"user:{user['id']}"
        user_data = json.dumps(user)
        
        # 设置缓存，过期时间1小时
        r.setex(cache_key, 3600, user_data)
    
    def warmup_by_pattern(self, key_pattern):
        """按模式预热数据"""
        cursor = self.mysql_conn.cursor(dictionary=True)
        
        # 根据key模式查询数据
        if key_pattern == "product:*":
            cursor.execute("SELECT * FROM products WHERE status = 'active'")
        elif key_pattern == "config:*":
            cursor.execute("SELECT * FROM system_config")
        
        data_list = cursor.fetchall()
        
        # 批量缓存
        pipeline = self.redis_pool.pipeline()
        for data in data_list:
            key = f"{key_pattern.split(':')[0]}:{data['id']}"
            pipeline.setex(key, 7200, json.dumps(data))
        
        pipeline.execute()
        print(f"按模式 {key_pattern} 预热完成，共 {len(data_list)} 条数据")

if __name__ == "__main__":
    warmup = CacheWarmup()
    
    # 执行预热
    warmup.warmup_hot_data()
    warmup.warmup_by_pattern("product:*")
    warmup.warmup_by_pattern("config:*")
```

### **3.3 缓存一致性解决方案**

#### **3.3.1 缓存更新策略对比**

```java
public class CacheUpdateStrategy {
    
    // 策略1：先更新数据库，再删除缓存（Cache Aside Pattern）
    public void updateUserCacheAside(User user) {
        // 1. 更新数据库
        userRepository.update(user);
        
        // 2. 删除缓存
        redisTemplate.delete("user:" + user.getId());
        
        // 优点：简单，减少数据不一致时间窗口
        // 缺点：删除缓存后，下次查询会穿透到数据库
    }
    
    // 策略2：先删除缓存，再更新数据库
    public void updateUserDeleteFirst(User user) {
        // 1. 删除缓存
        redisTemplate.delete("user:" + user.getId());
        
        // 2. 更新数据库
        userRepository.update(user);
        
        // 优点：保证读取到最新数据
        // 缺点：删除后到更新完成前，可能有并发读取导致旧数据回填
    }
    
    // 策略3：使用双删策略
    public void updateUserDoubleDelete(User user) throws InterruptedException {
        // 1. 第一次删除缓存
        redisTemplate.delete("user:" + user.getId());
        
        // 2. 更新数据库
        userRepository.update(user);
        
        // 3. 延迟后第二次删除缓存
        Thread.sleep(500);  // 延迟500ms
        redisTemplate.delete("user:" + user.getId());
        
        // 优点：减少不一致时间窗口
        // 缺点：引入延迟，实现复杂
    }
    
    // 策略4：使用消息队列异步更新
    @Autowired
    private KafkaTemplate<String, String> kafkaTemplate;
    
    public void updateUserWithMQ(User user) {
        // 1. 更新数据库
        userRepository.update(user);
        
        // 2. 发送缓存更新消息
        CacheUpdateMessage message = new CacheUpdateMessage();
        message.setKey("user:" + user.getId());
        message.setOperation("DELETE");
        
        kafkaTemplate.send("cache-update", JSON.toJSONString(message));
        
        // 消费者异步处理缓存更新
    }
}
```

#### **3.3.2 分布式锁保证强一致性**

```java
@Service
public class CacheConsistencyService {
    
    @Autowired
    private RedissonClient redissonClient;
    
    public User getConsistentUser(String userId) {
        String cacheKey = "user:" + userId;
        String lockKey = "lock:user:" + userId;
        
        // 1. 尝试从缓存获取
        String cachedData = redisTemplate.opsForValue().get(cacheKey);
        if (cachedData != null) {
            return JSON.parseObject(cachedData, User.class);
        }
        
        // 2. 获取分布式锁
        RLock lock = redissonClient.getLock(lockKey);
        try {
            // 尝试加锁，等待5秒，锁超时30秒
            boolean locked = lock.tryLock(5, 30, TimeUnit.SECONDS);
            if (!locked) {
                throw new RuntimeException("获取锁失败");
            }
            
            // 3. 再次检查缓存（双重检查锁）
            cachedData = redisTemplate.opsForValue().get(cacheKey);
            if (cachedData != null) {
                return JSON.parseObject(cachedData, User.class);
            }
            
            // 4. 查询数据库
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                // 缓存空值，防止缓存穿透
                redisTemplate.opsForValue().set(cacheKey, "", 1, TimeUnit.MINUTES);
                return null;
            }
            
            // 5. 写入缓存
            String userJson = JSON.toJSONString(user);
            redisTemplate.opsForValue().set(cacheKey, userJson, 1, TimeUnit.HOURS);
            
            return user;
            
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException(e);
        } finally {
            // 6. 释放锁
            if (lock.isHeldByCurrentThread()) {
                lock.unlock();
            }
        }
    }
}
```

## **四、性能测试与监控**

### **4.1 缓存性能测试**

#### **4.1.1 缓存命中率测试**

```bash
#!/bin/bash
# cache_hit_rate_test.sh

API_URL="http://localhost:8080/api/users"
USER_COUNT=1000
CONCURRENT=50
TEST_DURATION=300  # 5分钟

echo "开始缓存命中率测试..."
echo "测试时长: ${TEST_DURATION}秒"
echo "并发用户: ${CONCURRENT}"
echo "用户数量: ${USER_COUNT}"

# 预热阶段（确保数据在缓存中）
echo "=== 预热阶段 ==="
for i in $(seq 1 100); do
    USER_ID=$((RANDOM % USER_COUNT + 1))
    curl -s "${API_URL}/${USER_ID}" > /dev/null &
done
wait

# 正式测试阶段
echo "=== 正式测试阶段 ==="
start_time=$(date +%s)
end_time=$((start_time + TEST_DURATION))

request_count=0
hit_count=0

while [ $(date +%s) -lt $end_time ]; do
    for i in $(seq 1 $CONCURRENT); do
        USER_ID=$((RANDOM % USER_COUNT + 1))
        
        # 发送请求并记录响应头
        response=$(curl -s -I "${API_URL}/${USER_ID}")
        
        # 检查响应头中的缓存标识
        if echo "$response" | grep -q "X-Cache: HIT"; then
            ((hit_count++))
        fi
        
        ((request_count++))
    done
    
    # 实时显示统计信息
    if [ $((request_count % 100)) -eq 0 ]; then
        current_time=$(date +%s)
        elapsed=$((current_time - start_time))
        hit_rate=$(echo "scale=2; $hit_count*100/$request_count" | bc)
        
        echo "时间: ${elapsed}s | 请求数: ${request_count} | 命中数: ${hit_count} | 命中率: ${hit_rate}%"
    fi
done

# 最终统计
final_hit_rate=$(echo "scale=2; $hit_count*100/$request_count" | bc)
echo "=== 测试结束 ==="
echo "总请求数: ${request_count}"
echo "缓存命中数: ${hit_count}"
echo "最终命中率: ${final_hit_rate}%"
echo "平均QPS: $(echo "scale=2; $request_count/$TEST_DURATION" | bc)"
```

### **4.2 监控告警配置**

#### **4.2.1 Prometheus监控配置**

```yaml
# redis_exporter配置
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
    relabel_configs:
      - source_labels: [__address__]
        target_label: instance
        regex: '(.+):.+'
        replacement: '${1}'
        
  - job_name: 'redis-master-slave'
    static_configs:
      - targets:
        - 'redis-master:9121'
        - 'redis-slave:9121'
    metrics_path: /scrape
    params:
      target: [redis://redis-master:6379, redis://redis-slave:6380]
```

#### **4.2.2 Grafana监控面板**

```json
{
  "panels": [
    {
      "title": "Redis内存使用",
      "targets": [
        {
          "expr": "redis_memory_used_bytes / 1024 / 1024",
          "legendFormat": "{{instance}} 内存使用(MB)"
        }
      ]
    },
    {
      "title": "缓存命中率",
      "targets": [
        {
          "expr": "rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m])) * 100",
          "legendFormat": "{{instance}} 命中率"
        }
      ]
    },
    {
      "title": "主从复制延迟",
      "targets": [
        {
          "expr": "redis_master_repl_offset - redis_slave_repl_offset",
          "legendFormat": "复制延迟(字节)"
        }
      ]
    }
  ],
  "alert": {
    "rules": [
      {
        "alert": "Redis内存使用过高",
        "expr": "redis_memory_used_bytes / redis_memory_max_bytes * 100 > 80",
        "for": "5m",
        "annotations": {
          "summary": "Redis内存使用超过80%",
          "description": "实例 {{ $labels.instance }} 内存使用率: {{ $value }}%"
        }
      },
      {
        "alert": "缓存命中率过低",
        "expr": "rate(redis_keyspace_hits_total[5m]) / (rate(redis_keyspace_hits_total[5m]) + rate(redis_keyspace_misses_total[5m])) * 100 < 90",
        "for": "10m",
        "annotations": {
          "summary": "缓存命中率低于90%",
          "description": "实例 {{ $labels.instance }} 命中率: {{ $value }}%"
        }
      }
    ]
  }
}
```