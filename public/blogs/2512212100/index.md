# **Redis高级特性与生产环境部署实践**

## **一、Redis核心数据类型深度解析**

### **1.1 哈希（Hash）类型详解**

#### **1.1.1 哈希数据结构**

```bash
# 哈希结构示意图
key: "user:1001"
value: {
  "name": "张三",
  "age": 25,
  "city": "北京",
  "email": "zhangsan@example.com"
}

# 内存中的存储形式
user:1001 -> {
  name: "张三",
  age: "25", 
  city: "北京",
  email: "zhangsan@example.com"
}
```

#### **1.1.2 哈希操作命令**

```bash
# 基本操作
HSET user:1001 name "张三" age 25 city "北京"
HGET user:1001 name                    # 获取单个字段
HGETALL user:1001                      # 获取所有字段
HDEL user:1001 email                   # 删除字段
HEXISTS user:1001 name                 # 检查字段存在性
HLEN user:1001                         # 字段数量

# 批量操作
HMSET product:1001 name "手机" price 2999 stock 100
HMGET product:1001 name price stock    # 批量获取

# 数值操作
HINCRBY user:1001 age 1                # 字段值自增
HINCRBYFLOAT user:1001 score 0.5       # 浮点数自增

# 字段操作
HKEYS user:1001                        # 获取所有字段名
HVALS user:1001                        # 获取所有字段值

# 高级操作
HSCAN user:1001 0                      # 遍历大哈希（避免阻塞）
```

#### **1.1.3 哈希适用场景**

1. **用户信息存储**

```bash
# 存储用户完整信息
HSET user:1001 name "张三" age 25 gender "male" phone "13800138000"
HSET user:1001:profile avatar "avatar.jpg" bio "热爱编程的工程师"
```

2. **购物车实现**

```bash
# 购物车结构
HSET cart:user:1001 product:1001 2    # 商品ID:1001，数量2
HSET cart:user:1001 product:1002 1
HINCRBY cart:user:1001 product:1001 1 # 增加商品数量
HDEL cart:user:1001 product:1002      # 删除商品
HGETALL cart:user:1001                # 获取购物车所有商品
```

3. **配置信息存储**

```bash
# 系统配置
HSET config:system redis.maxmemory "4GB"
HSET config:system redis.timeout "300"
HSET config:system db.connection.pool "100"
```

### **1.2 Set（集合）类型**

#### **1.2.1 Set特点**

- 无序且唯一
- 支持集合运算（交集、并集、差集）
- 最大元素数量 2^32-1

```bash
# Set基本操作
SADD tags:article:100 "Redis" "数据库" "缓存"  # 添加元素
SMEMBERS tags:article:100                     # 获取所有元素
SREM tags:article:100 "缓存"                   # 删除元素
SISMEMBER tags:article:100 "Redis"            # 判断元素是否存在
SCARD tags:article:100                        # 元素数量
SPOP tags:article:100                         # 随机弹出元素
SRANDMEMBER tags:article:100 2                # 随机获取2个元素

# 集合运算
SADD setA 1 2 3 4
SADD setB 3 4 5 6
SINTER setA setB                              # 交集: 3,4
SUNION setA setB                              # 并集: 1,2,3,4,5,6
SDIFF setA setB                               # 差集(A有B无): 1,2
SDIFFSTORE result setA setB                   # 存储差集到新集合
```

#### **1.2.2 Set应用场景**

1. **标签系统**

```bash
# 文章标签
SADD article:100:tags "Redis" "NoSQL" "数据库"
SADD article:101:tags "MySQL" "数据库"
SINTER article:100:tags article:101:tags    # 共同标签: "数据库"
```

2. **共同好友/关注**

```bash
# 用户关注关系
SADD user:1001:following 1002 1003 1004
SADD user:1002:following 1001 1003 1005
SINTER user:1001:following user:1002:following  # 共同关注
```

3. **抽奖系统**

```bash
# 抽奖参与者
SADD lottery:20231101 user:1001 user:1002 user:1003 user:1004
SRANDMEMBER lottery:20231101 3              # 随机抽取3个中奖者
SPOP lottery:20231101 2                      # 随机弹出2个中奖者并移除
```

### **1.3 Sorted Set（有序集合）**

#### **1.3.1 ZSet特点**

- 有序且唯一
- 每个元素关联一个分数（score）
- 按分数排序，分数可重复

```bash
# ZSet基本操作
ZADD leaderboard 95 "张三" 88 "李四" 92 "王五"  # 添加元素
ZRANGE leaderboard 0 -1 WITHSCORES            # 按分数正序
ZREVRANGE leaderboard 0 2 WITHSCORES          # 按分数倒序前3
ZSCORE leaderboard "张三"                      # 获取分数
ZINCRBY leaderboard 5 "张三"                   # 增加分数
ZRANK leaderboard "张三"                       # 获取正序排名
ZREVRANK leaderboard "张三"                    # 获取倒序排名
ZRANGEBYSCORE leaderboard 90 100              # 分数范围查询
ZCOUNT leaderboard 90 100                      # 分数范围统计

# 范围操作
ZREMRANGEBYRANK leaderboard 0 2               # 删除排名0-2
ZREMRANGEBYSCORE leaderboard 0 90             # 删除分数0-90
```

#### **1.3.2 ZSet应用场景**

1. **排行榜系统**

```bash
# 游戏积分榜
ZADD game:ranking:20231101 1500 "player1" 1200 "player2" 1800 "player3"
ZINCRBY game:ranking:20231101 100 "player1"   # 增加积分
ZREVRANGE game:ranking:20231101 0 9 WITHSCORES  # 前10名
```

2. **延迟队列**

```bash
# 任务延迟执行
ZADD delayed:tasks <timestamp> "task:data"    # 添加延迟任务
# 定时获取可执行任务
ZRANGEBYSCORE delayed:tasks 0 <current_timestamp>
ZREMRANGEBYSCORE delayed:tasks 0 <current_timestamp>
```

3. **时间线**

```bash
# 用户时间线
ZADD user:1001:timeline <timestamp> "post:1001"
ZADD user:1001:timeline <timestamp> "post:1002"
ZREVRANGE user:1001:timeline 0 9              # 最近10条动态
```

## **二、Redis数据库与多实例部署**

### **2.1 Redis数据库概念**

#### **2.1.1 多数据库设计**

```bash
# Redis默认16个数据库（0-15）
SELECT 0        # 切换到数据库0（默认）
SELECT 1        # 切换到数据库1
SELECT 15       # 切换到最后一个数据库

# 查看当前数据库
INFO keyspace   # 查看所有数据库key统计

# 跨数据库操作
MOVE key 1      # 将key移动到数据库1

# 清空数据库
FLUSHDB         # 清空当前数据库
FLUSHALL        # 清空所有数据库（危险！）
```

#### **2.1.2 数据库配置**

```conf
# redis.conf配置
databases 16            # 默认16个数据库
# 可修改为其他数量，如：
# databases 32          # 扩展为32个数据库
```

#### **2.1.3 数据库使用策略**

```bash
# 项目隔离方案
# 方案1：不同项目使用不同数据库
SELECT 0   # 项目A使用数据库0
SELECT 1   # 项目B使用数据库1

# 方案2：使用key前缀区分
SET projectA:user:1001 "data"
SET projectB:user:1001 "data"

# 方案3：使用多个Redis实例（推荐生产环境）
```

### **2.2 Redis多实例部署**

#### **2.2.1 单机多实例配置**

```bash
# 创建多个配置文件
mkdir -p /etc/redis/instances

# 实例1配置（端口6379）
cat > /etc/redis/instances/redis-6379.conf << EOF
port 6379
daemonize yes
pidfile /var/run/redis_6379.pid
logfile /var/log/redis/redis-6379.log
dir /var/lib/redis/6379
dbfilename dump-6379.rdb
appendfilename "appendonly-6379.aof"
EOF

# 实例2配置（端口6380）
cat > /etc/redis/instances/redis-6380.conf << EOF
port 6380
daemonize yes
pidfile /var/run/redis_6380.pid
logfile /var/log/redis/redis-6380.log
dir /var/lib/redis/6380
dbfilename dump-6380.rdb
appendfilename "appendonly-6380.aof"
EOF

# 创建数据目录
mkdir -p /var/lib/redis/{6379,6380}
mkdir -p /var/log/redis

# 启动多个实例
redis-server /etc/redis/instances/redis-6379.conf
redis-server /etc/redis/instances/redis-6380.conf

# 验证实例运行
ps aux | grep redis
netstat -tlnp | grep -E '6379|6380'
```

#### **2.2.2 多实例管理脚本**

```bash
#!/bin/bash
# /usr/local/bin/redis-manager.sh

REDIS_CONF_DIR="/etc/redis/instances"
REDIS_BIN="/usr/local/bin/redis-server"

start_instance() {
    local port=$1
    local conf="${REDIS_CONF_DIR}/redis-${port}.conf"
    
    if [ -f "$conf" ]; then
        $REDIS_BIN $conf
        echo "Redis instance on port ${port} started."
    else
        echo "Config file not found for port ${port}"
    fi
}

stop_instance() {
    local port=$1
    redis-cli -p $port shutdown
    echo "Redis instance on port ${port} stopped."
}

restart_instance() {
    local port=$1
    stop_instance $port
    sleep 2
    start_instance $port
}

case "$1" in
    start)
        start_instance $2
        ;;
    stop)
        stop_instance $2
        ;;
    restart)
        restart_instance $2
        ;;
    *)
        echo "Usage: $0 {start|stop|restart} port"
        exit 1
        ;;
esac
```

### **2.3 Redis性能测试**

#### **2.3.1 redis-benchmark工具**

```bash
# 基本性能测试
redis-benchmark -h 127.0.0.1 -p 6379 -c 100 -n 100000

# 测试指定命令
redis-benchmark -t set,get,lpush,lpop -c 50 -n 10000

# 测试管道性能
redis-benchmark -P 16 -q -n 100000

# 测试大value
redis-benchmark -r 100000 -n 100000 -d 1024

# 详细输出
redis-benchmark -c 50 -n 10000 --csv
```

#### **2.3.2 测试参数详解**

| 参数    | 说明                  | 示例                       |
| ------- | --------------------- | -------------------------- |
| `-h`    | Redis服务器主机       | `-h 192.168.1.100`         |
| `-p`    | Redis服务器端口       | `-p 6380`                  |
| `-c`    | 并发连接数            | `-c 50`（模拟50个客户端）  |
| `-n`    | 总请求数              | `-n 100000`（10万请求）    |
| `-d`    | 数据大小（字节）      | `-d 1024`（1KB数据）       |
| `-t`    | 测试指定命令          | `-t set,get`               |
| `-P`    | 管道请求数            | `-P 16`（16个命令打包）    |
| `-r`    | 随机key数量           | `-r 100000`（10万随机key） |
| `-q`    | 安静模式（只显示QPS） | `-q`                       |
| `--csv` | CSV格式输出           | `--csv`                    |

#### **2.3.3 性能测试报告解读**

```bash
# 示例输出
====== SET ======
  100000 requests completed in 1.62 seconds
  50 parallel clients
  3 bytes payload
  keep alive: 1

99.87% <= 1 milliseconds
99.99% <= 2 milliseconds
100.00% <= 3 milliseconds
61728.40 requests per second

# 关键指标
1. 吞吐量（QPS）：61728.40 requests per second
2. 延迟分布：99.87%请求在1ms内完成
3. 总耗时：1.62秒完成10万请求
```

## **三、Redis主从复制与高可用**

### **3.1 主从复制配置**

#### **3.1.1 主节点配置**

```conf
# 主节点配置（redis-master.conf）
port 6379
daemonize yes
logfile /var/log/redis/redis-master.log
dir /var/lib/redis/master
dbfilename dump-master.rdb
appendonly yes
appendfilename "appendonly-master.aof"
requirepass masterpassword
masterauth slavepassword
```

#### **3.1.2 从节点配置**

```conf
# 从节点配置（redis-slave.conf）
port 6380
daemonize yes
logfile /var/log/redis/redis-slave.log
dir /var/lib/redis/slave
dbfilename dump-slave.rdb
appendonly yes
appendfilename "appendonly-slave.aof"

# 主从复制配置
slaveof 127.0.0.1 6379
masterauth masterpassword
requirepass slavepassword
slave-read-only yes

# 复制策略
repl-diskless-sync no
repl-backlog-size 1mb
repl-backlog-ttl 3600
```

#### **3.1.3 手动建立主从**

```bash
# 启动主从实例
redis-server /etc/redis/redis-master.conf
redis-server /etc/redis/redis-slave.conf

# 查看复制状态
redis-cli -h 127.0.0.1 -p 6379 INFO replication
redis-cli -h 127.0.0.1 -p 6380 INFO replication

# 从节点动态设置主节点
redis-cli -h 127.0.0.1 -p 6380 SLAVEOF 127.0.0.1 6379

# 取消复制关系
redis-cli -h 127.0.0.1 -p 6380 SLAVEOF NO ONE
```

### **3.2 复制过程与原理**

#### **3.2.1 复制流程**

1. **同步阶段**
   - 从节点发送SYNC命令
   - 主节点执行BGSAVE生成RDB文件
   - 主节点发送RDB文件给从节点
   - 从节点清空数据，加载RDB

2. **命令传播阶段**
   - 主节点将写命令发送给从节点
   - 从节点执行相同的写命令
   - 保持数据最终一致性

#### **3.2.2 复制优化**

```conf
# 无盘复制（适用于网络快、磁盘慢的场景）
repl-diskless-sync yes
repl-diskless-sync-delay 5

# 增量复制优化
repl-backlog-size 256mb      # 增大复制积压缓冲区
repl-backlog-ttl 3600        # 缓冲区超时时间

# 从节点延迟配置
slave-serve-stale-data yes   # 主节点宕机时从节点仍可读
slave-read-only yes          # 从节点只读

# 网络优化
repl-timeout 60             # 复制超时时间
repl-disable-tcp-nodelay no # 启用TCP_NODELAY
```

## **四、Redis生产环境最佳实践**

### **4.1 内存优化策略**

```bash
# 1. 监控内存使用
redis-cli INFO memory | grep -E "used_memory:|used_memory_human:|mem_fragmentation_ratio"

# 2. 查找大key
redis-cli --bigkeys
redis-cli MEMORY USAGE keyname

# 3. 内存碎片整理
redis-cli MEMORY PURGE    # 主动内存碎片整理（4.0+）

# 4. 淘汰策略配置
CONFIG SET maxmemory-policy volatile-lru
```

### **4.2 连接池配置**

```python
# Python连接池示例
import redis

pool = redis.ConnectionPool(
    host='localhost',
    port=6379,
    password='password',
    max_connections=50,      # 最大连接数
    socket_timeout=5,        # 超时时间
    socket_connect_timeout=5,
    retry_on_timeout=True,
    health_check_interval=30  # 健康检查间隔
)

r = redis.Redis(connection_pool=pool)
```

### **4.3 监控告警配置**

```bash
#!/bin/bash
# redis-monitor.sh

REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
ALERT_THRESHOLD=90

# 监控函数
monitor_redis() {
    local info=$(redis-cli -h $REDIS_HOST -p $REDIS_PORT INFO)
    
    # 监控内存使用率
    local used_memory=$(echo "$info" | grep "used_memory:" | cut -d: -f2)
    local max_memory=$(echo "$info" | grep "maxmemory:" | cut -d: -f2)
    
    if [ "$max_memory" -ne 0 ]; then
        local usage_percent=$((used_memory * 100 / max_memory))
        if [ $usage_percent -ge $ALERT_THRESHOLD ]; then
            echo "ALERT: Redis内存使用率 ${usage_percent}%"
            # 发送告警通知
        fi
    fi
    
    # 监控连接数
    local connected_clients=$(echo "$info" | grep "connected_clients:" | cut -d: -f2)
    echo "当前连接数: $connected_clients"
    
    # 监控命中率
    local keyspace_hits=$(echo "$info" | grep "keyspace_hits:" | cut -d: -f2)
    local keyspace_misses=$(echo "$info" | grep "keyspace_misses:" | cut -d: -f2)
    local total=$((keyspace_hits + keyspace_misses))
    
    if [ $total -ne 0 ]; then
        local hit_rate=$((keyspace_hits * 100 / total))
        echo "缓存命中率: ${hit_rate}%"
    fi
}

# 定时执行监控
while true; do
    monitor_redis
    sleep 60  # 每分钟监控一次
done
```

### **4.4 备份恢复方案**

```bash
#!/bin/bash
# redis-backup.sh

BACKUP_DIR="/backup/redis"
DATE=$(date +%Y%m%d_%H%M%S)
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"

# 创建备份目录
mkdir -p $BACKUP_DIR

# RDB备份
echo "开始RDB备份..."
redis-cli -h $REDIS_HOST -p $REDIS_PORT SAVE
cp /var/lib/redis/dump.rdb $BACKUP_DIR/dump_${DATE}.rdb

# AOF备份
if [ -f /var/lib/redis/appendonly.aof ]; then
    echo "开始AOF备份..."
    cp /var/lib/redis/appendonly.aof $BACKUP_DIR/appendonly_${DATE}.aof
fi

# 备份配置
cp /etc/redis/redis.conf $BACKUP_DIR/redis_${DATE}.conf

# 清理旧备份（保留最近7天）
find $BACKUP_DIR -name "*.rdb" -mtime +7 -delete
find $BACKUP_DIR -name "*.aof" -mtime +7 -delete
find $BACKUP_DIR -name "*.conf" -mtime +7 -delete

echo "备份完成：$BACKUP_DIR"
```
