# DiliInfo 生产环境部署指南

## 🎯 部署架构
- **前端**: GitHub Pages (静态网站托管)
- **后端**: Cloudflare Workers (无服务器API)
- **数据库**: Cloudflare D1 (SQLite数据库)

## 📋 部署前准备

### 1. 确保你有以下账户
- [x] GitHub 账户
- [x] Cloudflare 账户
- [x] 域名（可选，可使用免费的 .pages.dev 域名）

### 2. 安装必要工具
```bash
# 安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

## 🗄️ 第一步：部署 Cloudflare D1 数据库

### 1. 创建生产数据库
```bash
cd workers-backend

# 创建生产数据库
wrangler d1 create diliinfo-db-prod
```

### 2. 记录数据库ID
命令执行后会显示数据库ID，类似：
```
✅ Successfully created DB 'diliinfo-db-prod'
Database ID: abcd1234-5678-90ef-ghij-klmnopqrstuv
```

### 3. 更新 wrangler.toml 配置
```toml
# 替换 <YOUR_PROD_DB_ID> 为实际的数据库ID
[env.production.d1_databases]
binding = "DB"
database_name = "diliinfo-db-prod"
database_id = "abcd1234-5678-90ef-ghij-klmnopqrstuv"  # 替换为你的实际ID
```

### 4. 初始化生产数据库
```bash
# 在生产环境执行数据库架构
wrangler d1 execute diliinfo-db-prod --remote --file=../sql/schema.sql
```

## 🚀 第二步：部署 Cloudflare Workers 后端

### 1. 设置生产环境变量
```bash
cd workers-backend

# 设置JWT密钥（请使用强密码）
wrangler secret put JWT_SECRET --env production
# 输入一个强密码，例如：your-super-secure-jwt-secret-key-2024
```

### 2. 部署到生产环境
```bash
# 部署到生产环境
wrangler deploy --env production
```

### 3. 记录 Workers URL
部署成功后会显示URL，类似：
```
✅ Successfully deployed to https://diliinfo-backend-prod.your-subdomain.workers.dev
```

## 🌐 第三步：配置前端生产环境

### 1. 更新前端API配置
创建生产环境配置文件：

```bash
# 创建环境配置文件
cat > apps/web/.env.production << EOF
VITE_API_BASE_URL=https://diliinfo-backend-prod.your-subdomain.workers.dev
VITE_APP_ENV=production
EOF
```

### 2. 更新 Vite 配置
修改 `apps/web/vite.config.ts`：

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/', // 如果部署在子路径，需要修改
  publicDir: 'public',
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8787',
        changeOrigin: true,
      },
      '/pv.gif': {
        target: process.env.VITE_API_BASE_URL || 'http://localhost:8787',
        changeOrigin: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
});
```

### 3. 更新前端API调用
修改前端代码中的API调用，使用环境变量：

```typescript
// 在需要调用API的地方使用
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// 例如在 LoanWizard.tsx 中
fetch(`${API_BASE_URL}/api/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ phone: fullPhone, password, applicationId: data.id })
})
```

## 📄 第四步：配置 SPA 路由支持

### 1. 创建 404.html 文件
```bash
# 复制 index.html 作为 404.html
cp apps/web/index.html apps/web/public/404.html
```

### 2. 更新 GitHub Actions 配置
确保 `.github/workflows/deploy.yml` 包含 SPA 路由处理：

```yaml
name: Deploy Frontend to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/web
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: apps/web/package-lock.json

      - name: Install
        run: npm ci

      - name: Build
        run: npm run build

      - name: Copy 404.html for SPA routing
        run: cp dist/index.html dist/404.html

      - name: Deploy to gh-pages
        uses: peaceiris/actions-gh-pages@v4
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: apps/web/dist
          publish_branch: gh-pages
```

## 🔧 第五步：配置 CORS 和域名

### 1. 更新后端 CORS 配置
在 `workers-backend/index.ts` 中更新 CORS 设置：

```typescript
// 更新 CORS 设置，添加你的 GitHub Pages 域名
app.use('*', cors({
  origin: [
    'http://localhost:5173', 
    'https://diliinfo-com.github.io',  // 替换为你的 GitHub Pages 域名
    'https://your-custom-domain.com'   // 如果有自定义域名
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));
```

### 2. 重新部署后端
```bash
cd workers-backend
wrangler deploy --env production
```

## 🚀 第六步：部署前端到 GitHub Pages

### 1. 提交所有更改
```bash
git add .
git commit -m "配置生产环境部署"
git push origin main
```

### 2. 启用 GitHub Pages
1. 访问你的 GitHub 仓库
2. 进入 Settings > Pages
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "gh-pages"
5. 点击 Save

### 3. 等待部署完成
GitHub Actions 会自动构建和部署，通常需要 2-5 分钟。

## 🔍 第七步：验证部署

### 1. 检查后端 API
```bash
# 测试后端健康检查
curl https://diliinfo-backend-prod.your-subdomain.workers.dev/api/health
```

### 2. 检查前端网站
访问你的 GitHub Pages URL：
- `https://your-username.github.io/your-repo-name`

### 3. 测试完整流程
1. 访问网站首页
2. 测试贷款申请流程
3. 验证用户注册功能
4. 检查管理后台

## 🎛️ 第八步：配置自定义域名（可选）

### 1. 在 GitHub Pages 设置自定义域名
1. 在仓库 Settings > Pages 中设置 Custom domain
2. 添加 CNAME 文件到 `apps/web/public/CNAME`：
```
your-domain.com
```

### 2. 配置 DNS
在你的域名提供商处添加 CNAME 记录：
```
CNAME  www  your-username.github.io
```

### 3. 更新后端 CORS
在后端添加你的自定义域名到 CORS 配置中。

## 📊 第九步：监控和维护

### 1. 设置 Cloudflare Analytics
在 Cloudflare 控制台启用 Workers 分析。

### 2. 监控数据库使用情况
```bash
# 查看数据库统计
wrangler d1 info diliinfo-db-prod
```

### 3. 定期备份数据库
```bash
# 导出数据库
wrangler d1 export diliinfo-db-prod --output backup.sql
```

## 🔧 故障排除

### 常见问题

1. **CORS 错误**
   - 确保后端 CORS 配置包含前端域名
   - 检查 API 调用是否使用正确的 URL

2. **SPA 路由 404**
   - 确保 404.html 文件存在
   - 检查 GitHub Pages 设置

3. **数据库连接错误**
   - 验证数据库 ID 是否正确
   - 确保数据库已初始化

4. **环境变量问题**
   - 检查 Cloudflare Workers 的 secrets
   - 验证前端环境变量

## 📝 部署检查清单

- [ ] Cloudflare D1 数据库已创建并初始化
- [ ] Cloudflare Workers 后端已部署
- [ ] 前端环境变量已配置
- [ ] CORS 设置已更新
- [ ] GitHub Actions 工作流已配置
- [ ] SPA 路由支持已添加
- [ ] 代码已推送到 GitHub
- [ ] GitHub Pages 已启用
- [ ] 网站可以正常访问
- [ ] API 功能正常工作
- [ ] 贷款申请流程可以完成

## 🎉 完成！

恭喜！你的 DiliInfo 网站现在已经成功部署到生产环境：

- **前端**: https://your-username.github.io/your-repo-name
- **后端**: https://diliinfo-backend-prod.your-subdomain.workers.dev
- **数据库**: Cloudflare D1 (自动管理)

你的用户现在可以访问完整的贷款申请系统了！