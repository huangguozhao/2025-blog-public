## 🚀 Spring Boot 实现 OAuth2 / OIDC 认证：第三方开放授权

### 📋 前言

OAuth2 (开放授权) 和 OpenID Connect (OIDC) 是现代Web应用中最流行的身份认证和授权标准。本文将详细介绍如何在Spring Boot项目中集成OAuth2/OIDC认证，实现第三方登录功能。

### 🎯 OAuth2 / OIDC 核心概念

OAuth2是一种授权框架，允许第三方应用在不暴露用户凭据的情况下访问用户资源。OIDC在OAuth2基础上添加了身份认证层。

**核心组件：**
- **Resource Owner**: 资源所有者（用户）
- **Client**: 客户端应用
- **Authorization Server**: 授权服务器（OAuth2提供商）
- **Resource Server**: 资源服务器

**OAuth2授权流程：**
1. 客户端请求授权
2. 用户同意授权
3. 客户端获取授权码
4. 客户端用授权码换取访问令牌
5. 客户端使用访问令牌访问资源

### 🛠️ 实现步骤详解

#### 步骤1：添加项目依赖

Spring Boot提供了完整的OAuth2客户端支持：

```xml
<dependencies>
    <!-- OAuth2 Client -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-oauth2-client</artifactId>
    </dependency>
    
    <!-- Web 功能 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    
    <!-- Thymeleaf 模板 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-thymeleaf</artifactId>
    </dependency>
</dependencies>
```

#### 步骤2：配置OAuth2客户端

在`application.yaml`中配置OAuth2提供商：

```yaml
spring:
  security:
    oauth2:
      client:
        registration:
          github:
            client-id: ${GITHUB_CLIENT_ID:your-github-client-id}
            client-secret: ${GITHUB_CLIENT_SECRET:your-github-client-secret}
            scope: read:user,email
          google:
            client-id: ${GOOGLE_CLIENT_ID:your-google-client-id}
            client-secret: ${GOOGLE_CLIENT_SECRET:your-google-client-secret}
            scope: openid,email,profile
        provider:
          github:
            authorization-uri: https://github.com/login/oauth/authorize
            token-uri: https://github.com/login/oauth/access_token
            user-info-uri: https://api.github.com/user
            user-name-attribute: login
          google:
            authorization-uri: https://accounts.google.com/o/oauth2/auth
            token-uri: https://oauth2.googleapis.com/token
            user-info-uri: https://www.googleapis.com/oauth2/v2/userinfo
            jwk-set-uri: https://www.googleapis.com/oauth2/v3/certs
```

#### 步骤3：配置Spring Security

创建OAuth2安全配置：

```java
@Configuration
@EnableWebSecurity
@Order(3)
public class OAuth2SecurityConfig {

    @Bean
    public SecurityFilterChain oauth2FilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/oauth2/**")
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/oauth2/login").permitAll()
                .requestMatchers("/oauth2/**").authenticated()
                .anyRequest().denyAll()
            )
            .oauth2Login(oauth2 -> oauth2
                .loginPage("/oauth2/login")
                .defaultSuccessUrl("/oauth2/dashboard", true)
                .failureUrl("/oauth2/login?error=true")
            )
            .logout(logout -> logout
                .logoutUrl("/oauth2/logout")
                .logoutSuccessUrl("/oauth2/login?logout=true")
                .invalidateHttpSession(true)
                .clearAuthentication(true)
            );

        return http.build();
    }
}
```

#### 步骤4：创建OAuth2控制器

处理OAuth2认证相关的业务逻辑：

```java
@Controller
@RequestMapping("/oauth2")
public class OAuth2AuthController {

    @GetMapping("/login")
    public String loginPage(@RequestParam(value = "error", required = false) String error,
                           @RequestParam(value = "logout", required = false) String logout,
                           Model model) {
        if (error != null) {
            model.addAttribute("error", "OAuth2登录失败，请重试");
        }
        if (logout != null) {
            model.addAttribute("message", "已成功退出登录");
        }
        return "oauth2/login";
    }

    @GetMapping("/dashboard")
    public String dashboard(@AuthenticationPrincipal OAuth2User oauth2User,
                           OAuth2AuthenticationToken authentication,
                           Model model) {
        if (oauth2User == null) {
            return "redirect:/oauth2/login?error=true";
        }

        String registrationId = authentication.getAuthorizedClientRegistrationId();
        model.addAttribute("provider", registrationId);
        model.addAttribute("name", oauth2User.getAttribute("name"));
        model.addAttribute("email", oauth2User.getAttribute("email"));
        model.addAttribute("login", oauth2User.getAttribute("login"));
        model.addAttribute("id", oauth2User.getAttribute("id"));
        model.addAttribute("avatarUrl", oauth2User.getAttribute("avatar_url"));
        model.addAttribute("attributes", oauth2User.getAttributes());

        return "oauth2/dashboard";
    }
}
```

#### 步骤5：创建用户界面

**OAuth2登录页面** (`login.html`):
- 支持多个OAuth2提供商
- 响应式设计
- 错误信息显示

**OAuth2控制台页面** (`dashboard.html`):
- 显示用户信息
- 提供商信息展示
- 原始属性数据显示

### 🔐 安全配置最佳实践

1. **HTTPS强制使用**
   ```java
   http.requiresChannel(channel -> channel.anyRequest().requiresSecure());
   ```

2. **CSRF防护**
   ```java
   http.csrf(csrf -> csrf.csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse()));
   ```

3. **会话管理**
   ```java
   http.sessionManagement(session ->
       session.sessionFixation().migrateSession()
              .maximumSessions(1));
   ```

4. **OAuth2配置安全**
   - 使用环境变量存储Client ID和Secret
   - 限制授权范围(scope)
   - 配置适当的重定向URI

### 📊 注册OAuth2应用

#### GitHub OAuth2应用注册
1. 访问 [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息：
   - **Application name**: 你的应用名称
   - **Homepage URL**: http://localhost:8081
   - **Authorization callback URL**: http://localhost:8081/oauth2/login/github
4. 获取Client ID和Client Secret

#### Google OAuth2应用注册
1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用Google+ API
4. 创建OAuth2客户端ID：
   - **Application type**: Web application
   - **Authorized redirect URIs**: http://localhost:8081/oauth2/login/google
5. 获取Client ID和Client Secret

### 🧪 测试验证

**功能测试清单：**
- ✅ OAuth2登录流程
- ✅ 提供商选择
- ✅ 用户信息获取
- ✅ 错误处理
- ✅ 会话管理
- ✅ 登出功能

**安全测试：**
- ✅ 重定向URI验证
- ✅ 状态参数保护
- ✅ 令牌安全存储
- ✅ 会话固定攻击防护

### 🔄 OAuth2授权流程详解

```
1. 用户点击登录按钮
   User Agent → Client: GET /oauth2/authorization/github

2. 客户端重定向到授权服务器
   User Agent → Authorization Server: GET /login/oauth/authorize

3. 用户同意授权
   User Agent ← Authorization Server: 授权页面
   User Agent → Authorization Server: 用户同意

4. 授权服务器重定向回客户端
   User Agent → Client: GET /oauth2/login/github?code=xxx

5. 客户端换取访问令牌
   Client → Authorization Server: POST /login/oauth/access_token

6. 客户端获取用户信息
   Client → Resource Server: GET /user (with access token)

7. 完成认证
   Client: 创建用户会话
```

### 📈 扩展功能

1. **自定义用户信息映射**
   ```java
   @Bean
   public OAuth2UserService<OAuth2UserRequest, OAuth2User> oauth2UserService() {
       return new DefaultOAuth2UserService() {
           @Override
           public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
               // 自定义用户信息处理逻辑
               return super.loadUser(userRequest);
           }
       };
   }
   ```

2. **多租户支持**
   - 动态OAuth2客户端配置
   - 租户特定的提供商设置

3. **社交登录扩展**
   - 支持更多OAuth2提供商
   - 自定义登录按钮样式

### 🎯 总结

OAuth2/OIDC为现代Web应用提供了标准化的第三方认证解决方案。通过Spring Security OAuth2客户端，我们可以快速集成主流的身份提供商，实现安全可靠的用户认证。

**核心要点：**
1. 正确配置OAuth2客户端
2. 实现安全的授权流程
3. 处理用户信息映射
4. 配置适当的安全策略
5. 支持多个OAuth2提供商

这种认证方式特别适合需要第三方登录的企业级应用和SaaS平台，可以显著提升用户体验并减少注册流程的摩擦。

---
