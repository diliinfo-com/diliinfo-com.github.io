# 部署说明

## 🚀 自动部署配置

本项目使用 GitHub Actions 实现前后端的自动部署：

### 📋 部署流程

1. **后端部署** → Cloudflare Workers
   - 工作目录: `workers-backend/`
   - 部署命令: `wrangler deploy --env production`
   - 目标环境: `diliinfo-backend-prod`

2. **前端部署** → GitHub Pages
   - 工作目录: `apps/web/`
   - 构建命令: `npm run build`
   - 部署目标: `gh-pages` 分支

### 🔑 必需的 Secrets

在 GitHub 仓库设置中添加以下 Secrets：

1. **CLOUDFLARE_API_TOKEN**
   - 用途: Cloudflare Workers 部署认证
   - 获取方式: Cloudflare Dashboard → My Profile → API Tokens
   - 权限: `Cloudflare Workers:Edit`, `Zone:Read`

### 🌐 部署地址

- **前端**: https://diliinfo.com
- **后端API**: https://diliinfo-backend-prod.0768keyiran.workers.dev

### 🔧 手动部署

如需手动部署：

```bash
# 部署后端
cd workers-backend
npx wrangler deploy --env production

# 部署前端
cd apps/web
npm run build
# 然后推送到 GitHub，Actions 会自动部署
```

### 📊 部署状态

- ✅ 跨浏览器兼容性修复已完成
- 🔄 GitHub Actions 工作流已配置
- ⚠️ 需要配置 CLOUDFLARE_API_TOKEN Secret

### 🧪 测试

部署完成后，请在多个浏览器中测试：
- Chrome, Firefox, Safari, Edge
- 重点测试贷款申请数据保存功能