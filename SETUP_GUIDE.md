# DiliInfo 项目启动及配置完整指南

## 📋 目录
1. [环境准备](#环境准备)
2. [项目克隆与安装](#项目克隆与安装)
3. [后端配置 (Cloudflare Workers)](#后端配置)
4. [数据库配置 (Cloudflare D1)](#数据库配置)
5. [前端配置](#前端配置)
6. [启动开发环境](#启动开发环境)
7. [生产环境部署](#生产环境部署)
8. [故障排除](#故障排除)

## 🔧 环境准备

### 必需软件
- **Node.js**: 18.0+ (推荐使用最新LTS版本)
- **npm**: 9.0+ 或 **yarn**: 1.22+
- **Git**: 最新版本

### Cloudflare账户设置
1. 注册 [Cloudflare账户](https://dash.cloudflare.com/sign-up)
2. 获取API令牌 (Workers权限)

### 验证环境
```bash
node --version    # 应显示 v18.0+
npm --version     # 应显示 9.0+
git --version     # 应显示最新版本
```

## 📦 项目克隆与安装

### 1. 克隆代码库
```bash
git clone https://github.com/diliinfo-com/diliinfo-com.github.io.git
cd diliinfo-com.github.io
```

### 2. 安装Wrangler CLI
```bash
# 全局安装最新版Wrangler
npm install -g wrangler@latest

# 验证安装
wrangler --version
```

### 3. 登录Cloudflare
```bash
wrangler auth login
```
这会打开浏览器，按提示完成登录。

## ⚡ 后端配置 (Cloudflare Workers)

### 1. 进入后端目录
```bash
cd workers-backend
```

### 2. 修复package.json
编辑 `workers-backend/package.json` 文件：
```json
{
  "name": "diliinfo-backend",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "wrangler dev",
    "deploy": "wrangler deploy",
    "deploy:prod": "wrangler deploy --env production"
  },
  "dependencies": {
    "hono": "^4.8.3"
  },
  "devDependencies": {
    "@cloudflare/workers-types": "^4.20240115.0",
    "wrangler": "^3.28.0",
    "typescript": "^5.3.3"
  }
}
```

### 3. 安装依赖
```bash
# 清理旧依赖
rm -rf node_modules package-lock.json

# 安装新依赖
npm install
```

## 🗄️ 数据库配置 (Cloudflare D1)

### 1. 创建开发数据库
```bash
cd workers-backend
wrangler d1 create diliinfo-db-dev
```

**记录输出信息**，类似：
```
✅ Successfully created DB 'diliinfo-db-dev' in region APAC

[[d1_databases]]
binding = "DB"
database_name = "diliinfo-db-dev"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 2. 创建生产数据库（可选）
```bash
wrangler d1 create diliinfo-db-prod
```

### 3. 配置wrangler.toml
编辑 `workers-backend/wrangler.toml`：
```toml
name = "diliinfo-backend"
main = "index.ts"
compatibility_date = "2024-01-30"

# 开发环境数据库
[[d1_databases]]
binding = "DB"
database_name = "diliinfo-db-dev"
database_id = "你的开发数据库ID"

# 开发环境变量
[vars]
JWT_SECRET = "dev-jwt-secret-change-in-production"

# 生产环境配置
[env.production]
name = "diliinfo-backend-prod"

[[env.production.d1_databases]]
binding = "DB" 
database_name = "diliinfo-db-prod"
database_id = "你的生产数据库ID"

[env.production.vars]
JWT_SECRET = "prod-jwt-secret-super-secure"
```

### 4. 初始化数据库结构
```bash
# 初始化开发数据库
wrangler d1 execute diliinfo-db-dev --file=../sql/schema.sql

# 验证表创建成功
wrangler d1 query diliinfo-db-dev --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### 5. 验证默认数据
```bash
# 检查默认管理员账户
wrangler d1 query diliinfo-db-dev --command="SELECT username FROM admins;"
```
应该看到默认账户：`admin`

## 🎨 前端配置

### 1. 进入前端目录
```bash
cd ../apps/web
```

### 2. 安装前端依赖
```bash
npm install
```

### 3. 配置代理（开发环境）
编辑 `apps/web/vite.config.ts`，确保代理配置正确：
```typescript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
      '/pv.gif': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      }
    }
  }
})
```

## 🚀 启动开发环境

### 1. 启动后端服务
```bash
# 在 workers-backend 目录下
cd workers-backend
npm run dev
```

**成功启动后显示**：
```
⛅️ wrangler 3.28.0
-------------------
⎔ Starting local server...
╭─────────────────────────────────────────────────────────────────────────────╮
│  Wrangler: Your worker is listening at http://localhost:8787               │
╰─────────────────────────────────────────────────────────────────────────────╮
```

### 2. 启动前端服务（新终端）
```bash
# 在 apps/web 目录下
cd apps/web
npm run dev
```

**成功启动后显示**：
```
  VITE v5.4.19  ready in 458 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

### 3. 测试系统功能

**访问应用**：
- 前端: http://localhost:5173
- 后端API: http://localhost:8787/api/health

**测试管理员登录**：
```bash
curl -X POST http://localhost:8787/api/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**测试用户注册**：
```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

## 🌐 生产环境部署

### 1. 部署后端到Cloudflare Workers
```bash
cd workers-backend

# 初始化生产数据库（仅首次）
wrangler d1 execute diliinfo-db-prod --env production --file=../sql/schema.sql

# 部署到生产环境
npm run deploy:prod
```

### 2. 配置前端生产环境
编辑 `apps/web/.env.production`：
```
VITE_API_BASE_URL=https://your-worker-subdomain.your-subdomain.workers.dev
```

### 3. 部署前端到GitHub Pages
```bash
cd apps/web

# 构建生产版本
npm run build

# 推送到GitHub（自动部署）
git add .
git commit -m "Deploy production version"
git push origin main
```

## 🔧 故障排除

### 常见问题及解决方案

#### 1. npm安装依赖失败
```bash
# 清理缓存
npm cache clean --force

# 删除node_modules重新安装
rm -rf node_modules package-lock.json
npm install
```

#### 2. Wrangler登录失败
```bash
# 重新登录
wrangler logout
wrangler auth login

# 或使用API令牌
export CLOUDFLARE_API_TOKEN="your-api-token"
```

#### 3. 数据库连接错误
```bash
# 检查数据库是否存在
wrangler d1 list

# 重新创建数据库
wrangler d1 create diliinfo-db-dev
```

#### 4. 前端代理错误
- 确保后端服务运行在 http://localhost:8787
- 检查 `vite.config.ts` 中的代理配置
- 重启前端开发服务器

#### 5. JWT认证错误
检查 `wrangler.toml` 中的 `JWT_SECRET` 配置：
```toml
[vars]
JWT_SECRET = "your-secret-key"
```

#### 6. CORS错误
确保后端 `index.ts` 中包含正确的CORS配置：
```typescript
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://your-domain.github.io'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
```

### 调试技巧

1. **查看Workers日志**：
```bash
wrangler tail
```

2. **检查数据库数据**：
```bash
wrangler d1 query diliinfo-db-dev --command="SELECT * FROM users LIMIT 5;"
```

3. **测试API端点**：
```bash
# 健康检查
curl http://localhost:8787/api/health

# 获取统计数据
curl http://localhost:8787/api/admin/stats
```

## 📞 获取帮助

如果遇到问题：

1. **检查日志**：查看浏览器控制台和终端输出
2. **查看文档**：
   - [Cloudflare Workers文档](https://developers.cloudflare.com/workers/)
   - [Cloudflare D1文档](https://developers.cloudflare.com/d1/)
   - [Hono文档](https://hono.dev/)
3. **联系支持**：创建GitHub Issue

## 🎯 下一步

项目启动成功后，你可以：

1. **自定义配置**：修改品牌信息、颜色主题
2. **添加功能**：扩展API接口、增加新页面
3. **优化性能**：启用CDN、图片优化
4. **安全加固**：更换默认密码、配置防火墙
5. **监控部署**：设置告警、性能监控

祝你使用愉快！🚀 