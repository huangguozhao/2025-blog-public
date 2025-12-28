### **MyBatis插件（拦截器）**

#### **一、核心概念：什么是MyBatis插件？**

*   MyBatis插件本质上是基于 **JDK动态代理** 实现的 **拦截器（Interceptor）**。
*   它允许你在MyBatis执行核心流程的**特定时机**“插入”自定义逻辑，对原有行为进行增强或修改。
*   **重要限制：** MyBatis插件**只能拦截指定四大核心接口**中的方法，并非任意方法。

#### **二、运行原理：JDK动态代理与拦截点**

**1. 核心拦截目标（四大接口）**
MyBatis将插件功能锚定在SQL执行生命周期的四个关键环节，通过拦截这些接口的实现类方法来实现功能扩展：

| 拦截接口               | 职责                                                         | 可实现的典型插件功能                                         |
| :--------------------- | :----------------------------------------------------------- | :----------------------------------------------------------- |
| **`Executor`**         | **执行器**。MyBatis核心，负责SQL语句生成、缓存管理、调用`StatementHandler`。 | **分页插件**（修改SQL）、**缓存增强**、**批量操作优化**。    |
| **`StatementHandler`** | **语句处理器**。负责创建`Statement`、参数化设置、执行SQL、将`ResultSet`交给`ResultSetHandler`。 | **SQL执行时间统计**、**SQL改写**、**参数统一处理**。         |
| **`ParameterHandler`** | **参数处理器**。将用户传入的Java参数转换为JDBC所需的类型并设置到`PreparedStatement`中。 | **参数加密/解密**、**参数格式校验**、**敏感信息脱敏**。      |
| **`ResultSetHandler`** | **结果集处理器**。将JDBC返回的`ResultSet`转换为Java对象列表。 | **结果集数据脱敏**、**统一数据格式化**、**自定义类型转换**。 |

**2. 实现原理：动态代理链**

1.  MyBatis启动时，会根据配置或注解，为上述四大接口的目标对象（如`SimpleExecutor`）**创建代理对象**。
2.  当调用被拦截的方法时（如`Executor.query()`），调用会首先进入**拦截器链**。
3.  拦截器链中的每个插件（拦截器）按配置顺序依次执行`intercept`方法。
4.  在插件的`intercept`方法中，开发者可以：
    *   **前置处理：** 在调用 `invocation.proceed()` 之前执行逻辑（如修改SQL参数）。
    *   **执行原方法：** 通过 `invocation.proceed()` 将调用传递下去，最终执行原始目标方法。
    *   **后置处理：** 在 `invocation.proceed()` 之后执行逻辑（如记录执行结果、修改返回数据）。
5.  所有插件执行完毕后，最终结果返回给调用者。

#### **三、如何编写一个MyBatis插件（三步法）**

以下以实现一个“可执行SQL打印插件”为例，展示完整开发流程。

**第1步：实现 `Interceptor` 接口，编写核心逻辑**

```java
import org.apache.ibatis.executor.statement.StatementHandler;
import org.apache.ibatis.plugin.*;
import java.sql.Connection;
import java.util.Properties;

@Intercepts({
        @Signature(type = StatementHandler.class, // 指定要拦截的接口
                method = "prepare", // 指定要拦截的方法名
                args = {Connection.class, Integer.class}) // 指定方法参数类型，用于精确匹配重载方法
})
@Component // 交由Spring管理，也可在mybatis-config.xml中配置
public class ExecutableSqlLoggerPlugin implements Interceptor {

    @Override
    public Object intercept(Invocation invocation) throws Throwable {
        // 1. 前置处理：获取原始的StatementHandler (被代理的目标对象)
        StatementHandler statementHandler = (StatementHandler) invocation.getTarget();
        
        // 通过MetaObject等工具，从statementHandler中解析出BoundSql对象
        // BoundSql包含了最终的SQL语句和参数映射
        BoundSql boundSql = statementHandler.getBoundSql();
        String originalSql = boundSql.getSql();
        Object parameterObject = boundSql.getParameterObject();
        
        // 2. （核心）将参数与SQL合并，生成可直接在数据库客户端执行的SQL字符串
        String executableSql = generateExecutableSql(originalSql, parameterObject);
        System.out.println("【可执行SQL】: " + executableSql);
        
        // 3. 继续执行原方法（即StatementHandler.prepare）
        Object result = invocation.proceed();
        
        // 4. 后置处理（本例无需后置处理）
        return result;
    }

    @Override
    public Object plugin(Object target) {
        // MyBatis提供的标准方法，用于包装目标对象，创建代理
        return Plugin.wrap(target, this);
    }

    @Override
    public void setProperties(Properties properties) {
        // 接收来自配置文件（mybatis-config.xml）中传入的属性，可用于插件配置化
    }
    
    // 辅助方法：将参数替换到SQL中的占位符(‘?’)，生成完整SQL（需处理字符串转义等）
    private String generateExecutableSql(String sql, Object parameterObject) {
        // 这里需要根据parameterObject的类型（Map、Bean、单个参数等）进行复杂解析
        // 简化示例：假设参数已正确处理，此处仅示意
        // 实际开发中，可参考开源工具如MyBatis Log Plugin的实现
        return sql.replaceFirst("\\?", "'" + parameterObject.toString() + "'");
    }
}
```

**第2步：使用 `@Intercepts` 和 `@Signature` 注解声明拦截点**

*   **`@Intercepts`**: 标识该类是一个MyBatis拦截器。
*   **`@Signature`**: 定义具体的拦截点。一个拦截器可以用多个`@Signature`拦截不同接口或方法。
    *   `type`: 指定要拦截的四大接口之一。
    *   `method`: 指定要拦截的方法名。
    *   `args`: 指定方法的参数类型列表（`Class<?>[]`），用于**精确匹配重载方法**。

**第3步：注册插件**

* **Spring Boot/Spring 集成项目**: 如上例所示，使用 `@Component` 注解将插件类声明为Spring Bean，MyBatis-Spring-Boot-Starter会自动发现并注册它。

* **纯MyBatis项目**: 在 `mybatis-config.xml` 配置文件中注册：

  ```xml
  <plugins>
      <plugin interceptor="com.yourpackage.ExecutableSqlLoggerPlugin">
          <!-- 可以通过property传递参数给插件 -->
          <!-- <property name="someProperty" value="100"/> -->
      </plugin>
  </plugins>
  ```
