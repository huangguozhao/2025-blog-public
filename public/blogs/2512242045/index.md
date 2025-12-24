### **Spring Boot自动配置**

#### **一、核心思想与目标**

自动配置是Spring Boot的**基石**，其核心目标是：**根据项目中引入的依赖（JAR包）和预设的配置，自动、智能地组装和配置Spring应用所需的Bean**，实现 **“约定大于配置”** ，让开发者专注于业务逻辑，而非繁琐的框架配置。

#### **二、自动配置的三大核心注解**

自动配置的旅程始于主类上的 `@SpringBootApplication`。它是一个**复合注解**，主要由以下三个关键注解组成：

| 注解                           | 核心职责                 | 简要说明                                                     |
| :----------------------------- | :----------------------- | :----------------------------------------------------------- |
| **`@SpringBootConfiguration`** | 标识配置类               | 本质上是`@Configuration`的变体，表明该类是一个Spring配置类。 |
| **`@ComponentScan`**           | 组件扫描                 | 默认扫描主类所在包及其子包下的`@Component`, `@Service`, `@Repository`, `@Controller`等注解的类。 |
| **`@EnableAutoConfiguration`** | **启用自动配置（核心）** | 这是自动配置的“总开关”。它通过`@Import`导入了一个关键的选择器类。 |

#### **三、自动配置的工作原理（核心流程）**

整个自动配置流程围绕 `@EnableAutoConfiguration` 展开，其核心是一个 **“发现-加载-条件装配”** 的过程。

**第1步：触发与导入**

*   当应用启动时，`@EnableAutoConfiguration` 注解会通过 `@Import` 注解，**导入一个核心选择器类：`AutoConfigurationImportSelector`**。

**第2步：加载候选配置类（发现阶段）**

* `AutoConfigurationImportSelector` 会调用 `SpringFactoriesLoader.loadFactoryNames()` 方法。

* 这个方法会扫描**所有依赖JAR包**中 `META-INF/spring.factories` 这个**配置文件**。

* 它查找配置文件中 `EnableAutoConfiguration` 这个**Key** 对应的所有值。这些值就是**全限定类名**，即一个个**自动配置类**（例如：`org.springframework.boot.autoconfigure.web.servlet.DispatcherServletAutoConfiguration`）。

* **`spring.factories` 文件示例：**

  ```
  org.springframework.boot.autoconfigure.EnableAutoConfiguration=\
  com.example.MyAutoConfiguration,\
  org.springframework.boot.autoconfigure.web.servlet.DispatcherServletAutoConfiguration
  ```

**第3步：过滤与条件装配（核心中的核心）**

*   此时，Spring Boot获得了**所有可能**的自动配置类清单。但并非所有类都会生效。
*   每个自动配置类上都标有大量的 **`@Conditional` 及其衍生注解**（如 `@ConditionalOnClass`, `@ConditionalOnMissingBean`, `@ConditionalOnProperty`）。
*   Spring Boot会逐一检查这些**条件注解**是否满足：
    *   **`@ConditionalOnClass`**：类路径下存在指定的类时才生效。（例如，当存在`DataSource.class`时，数据源相关的自动配置才生效）。
    *   **`@ConditionalOnMissingBean`**：当Spring容器中**不存在**指定类型的Bean时才生效。（这为用户**自定义Bean覆盖默认配置**提供了可能）。
    *   **`@ConditionalOnProperty`**：当指定的配置属性满足条件时才生效。
*   只有**全部条件都满足**的自动配置类，才会被真正加载到Spring容器中。

**第4步：注册Bean**

*   最终生效的自动配置类本身就是一个标准的 `@Configuration` 类。
*   在这些类中，通过 `@Bean` 注解定义了一系列的Bean（如`DataSource`, `DispatcherServlet`, `EntityManagerFactory`等）。
*   这些Bean被注册到Spring IOC容器中，从而完成了整个应用上下文的自动组装。

#### **四、一个生动的例子：MyBatis-Spring-Boot-Starter**

1.  **引入依赖**：你在 `pom.xml` 中添加 `mybatis-spring-boot-starter`。
2.  **提供配置类**：该Starter的JAR包中包含 `META-INF/spring.factories` 文件，其中声明了自己的自动配置类，例如 `MybatisAutoConfiguration`。
3.  **条件判断**：`MybatisAutoConfiguration` 类上可能标有 `@ConditionalOnClass({ SqlSessionFactory.class, SqlSessionFactoryBean.class })`。因为引入了Starter，这些类都在类路径下，**条件满足**。
4.  **创建Bean**：该配置类内部会使用 `@Bean` 注解，自动创建并配置 `SqlSessionFactory`、`SqlSessionTemplate` 等MyBatis核心组件所需的Bean。
5.  **用户自定义**：如果你想覆盖默认配置，只需在自己的`@Configuration`类中，手动定义一个 `SqlSessionFactory` Bean。由于 `@ConditionalOnMissingBean` 的条件，Spring Boot将**优先使用你定义的Bean**，而不会使用自动配置提供的默认Bean。