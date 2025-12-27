## 🚀 Spring Boot 实现 JWT Token 认证：无状态身份验证完全指南

### 📋 前言

JWT (JSON Web Token) 是一种开放标准，用于在网络应用间安全地传输信息。本文将详细介绍如何在Spring Boot项目中实现基于JWT的无状态认证方案。

### 🎯 JWT认证的核心概念

JWT是一种紧凑的、URL安全的令牌格式，用于在各方之间安全地传输声明。JWT包含三部分：
- **Header**: 包含令牌类型和签名算法
- **Payload**: 包含声明（用户信息、权限等）
- **Signature**: 用于验证令牌完整性的签名

**核心优势：**
- ✅ 无状态设计，服务器无需存储会话
- ✅ 优秀的水平扩展性
- ✅ 跨域友好
- ✅ 自包含令牌，包含所有必要信息

**主要缺点：**
- ❌ 无法主动失效令牌
- ❌ 令牌相对较大
- ❌ 需要处理令牌过期和刷新

### 🛠️ 实现步骤详解

#### 步骤1：添加项目依赖

在`pom.xml`中添加JWT相关依赖：

```xml
<!-- JWT Token Support -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt</artifactId>
    <version>0.9.1</version>
</dependency>
```

#### 步骤2：创建JWT工具类

实现JWT令牌的生成、解析和验证：

```java
@Component
public class JwtUtil {

    private static final String SECRET = "mySecretKeyForJwtTokenGenerationAndValidationPurposesOnly123456789";
    private static final int JWT_EXPIRATION = 1000 * 60 * 60 * 24; // 24 hours

    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    public Date extractExpiration(String token) {
        return extractAllClaims(token).getExpiration();
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser().setSigningKey(SECRET.getBytes()).parseClaimsJws(token).getBody();
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", role);
        claims.put("type", "JWT");
        return createToken(claims, username);
    }

    private String createToken(Map<String, Object> claims, String subject) {
        return Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + JWT_EXPIRATION))
                .signWith(SignatureAlgorithm.HS256, SECRET)
                .compact();
    }

    public Boolean validateToken(String token, String username) {
        try {
            final String extractedUsername = extractUsername(token);
            return (extractedUsername.equals(username) && !isTokenExpired(token));
        } catch (Exception e) {
            return false;
        }
    }

    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }
}
```

#### 步骤3：创建JWT认证过滤器

实现过滤器来验证每个请求的JWT令牌：

```java
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        final String requestTokenHeader = request.getHeader("Authorization");

        String username = null;
        String jwtToken = null;

        if (requestTokenHeader != null && requestTokenHeader.startsWith("Bearer ")) {
            jwtToken = requestTokenHeader.substring(7);
            try {
                username = jwtUtil.extractUsername(jwtToken);
            } catch (Exception e) {
                logger.warn("Unable to get JWT Token or JWT Token has expired");
            }
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            if (jwtUtil.validateToken(jwtToken, username)) {
                UserDetails userDetails = User.builder()
                        .username(username)
                        .password("")
                        .authorities(Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + jwtUtil.extractRole(jwtToken))))
                        .build();

                UsernamePasswordAuthenticationToken authenticationToken =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                SecurityContextHolder.getContext().setAuthentication(authenticationToken);
            }
        }
        filterChain.doFilter(request, response);
    }
}
```

#### 步骤4：配置JWT安全策略

创建专门的JWT安全配置：

```java
@Configuration
@EnableWebSecurity
@Order(2)
public class JwtSecurityConfig {

    @Bean
    public SecurityFilterChain jwtFilterChain(HttpSecurity http) throws Exception {
        http
            .securityMatcher("/jwt/**")
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(authz -> authz
                .requestMatchers("/jwt/login", "/jwt/authenticate").permitAll()
                .requestMatchers("/jwt/**").authenticated()
                .anyRequest().denyAll()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

#### 步骤5：实现JWT认证控制器

处理JWT认证相关的业务逻辑：

```java
@Controller
@RequestMapping("/jwt")
public class JwtAuthController {

    @PostMapping("/authenticate")
    @ResponseBody
    public ResponseEntity<?> authenticate(@RequestParam String username,
                                        @RequestParam String password) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            String role = userDetails.getAuthorities().stream()
                .findFirst()
                .map(GrantedAuthority::getAuthority)
                .orElse("USER")
                .replace("ROLE_", "");

            String token = jwtUtil.generateToken(username, role);

            Map<String, Object> response = new HashMap<>();
            response.put("token", token);
            response.put("username", username);
            response.put("role", role);
            response.put("expiresIn", 86400);

            return ResponseEntity.ok(response);
        } catch (AuthenticationException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Invalid credentials");
            return ResponseEntity.badRequest().body(error);
        }
    }

    @GetMapping("/dashboard")
    public String dashboard(@RequestParam(value = "token", required = false) String token,
                           Model model) {
        if (token == null || token.trim().isEmpty()) {
            return "redirect:/jwt/login?error=token_required";
        }

        String jwtToken = token;
        String username = jwtUtil.extractUsername(jwtToken);

        if (!jwtUtil.validateToken(jwtToken, username)) {
            return "redirect:/jwt/login?error=invalid_token";
        }

        model.addAttribute("username", username);
        model.addAttribute("role", jwtUtil.extractRole(jwtToken));
        model.addAttribute("token", jwtToken);

        return "jwt/dashboard";
    }

    @GetMapping("/api/test")
    @ResponseBody
    public ResponseEntity<?> apiTest(@RequestHeader(value = "Authorization", required = false) String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body(Map.of("error", "Token required"));
        }

        String jwtToken = token.substring(7);
        String username = jwtUtil.extractUsername(jwtToken);

        if (!jwtUtil.validateToken(jwtToken, username)) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid token"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "JWT认证成功！");
        response.put("username", username);
        response.put("timestamp", System.currentTimeMillis());

        return ResponseEntity.ok(response);
    }
}
```

#### 步骤6：创建前端页面

**JWT登录页面** (`login.html`):
- 异步登录获取Token
- Token显示和管理
- API测试功能

**JWT控制台页面** (`dashboard.html`):
- Token信息展示
- API调用测试
- 导航到其他页面

### 🔐 安全加固措施

1. **HTTPS强制使用**
   ```java
   http.requiresChannel(channel -> channel.anyRequest().requiresSecure());
   ```

2. **令牌过期管理**
   - 设置合理的过期时间
   - 实现令牌刷新机制
   - 定期轮换密钥

3. **令牌黑名单**
   - 实现Redis存储黑名单令牌
   - 在注销时将令牌加入黑名单

4. **签名算法选择**
   - 生产环境使用RS256
   - 定期轮换签名密钥

### 📊 性能优化建议

1. **令牌缓存策略**
   - 短期令牌缓存用户信息
   - 避免每次请求都解析令牌

2. **数据库优化**
   - 使用索引优化用户查询
   - 考虑读写分离

3. **并发处理**
   - 实现令牌并发验证
   - 使用连接池管理数据库连接

### 🧪 测试验证

**功能测试清单：**
- ✅ 正确生成JWT令牌
- ✅ 令牌解析和验证
- ✅ 过期令牌拒绝访问
- ✅ 无效令牌处理
- ✅ API端点保护
- ✅ 跨域请求支持

**安全测试：**
- ✅ 令牌篡改检测
- ✅ 过期令牌清理
- ✅ SQL注入防护
- ✅ XSS防护

### 🔄 与其他认证方式的对比

| 特性 | Session | JWT | OAuth2 |
|------|---------|-----|--------|
| 状态管理 | 有状态 | 无状态 | 有状态/无状态 |
| 扩展性 | 中等 | 优秀 | 优秀 |
| 安全性 | 优秀 | 良好 | 优秀 |
| 实现复杂度 | 简单 | 中等 | 复杂 |
| 适用场景 | 单体应用 | API服务 | 第三方集成 |

### 🎯 总结

JWT认证为现代Web应用提供了灵活且可扩展的认证解决方案。通过Spring Boot和Spring Security，我们可以快速实现一个完整、安全的JWT认证系统。

**核心要点：**
1. 正确实现JWT令牌生成和验证
2. 配置无状态的安全策略
3. 实现认证过滤器
4. 处理令牌过期和刷新
5. 定期进行安全审计

这种认证方式特别适合API服务、微服务架构和需要水平扩展的分布式系统。在需要第三方集成时，可以结合OAuth2使用。

---