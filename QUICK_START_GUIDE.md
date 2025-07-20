# 🚀 DiliInfo 快速部署指南

## 一键部署到生产环境

### 前提条件
1. 已安装 Node.js 和 npm
2. 已有 GitHub 账户和仓库
3. 已有 Cloudflare 账户

### 快速部署步骤

#### 1. 安装 Wrangler CLI
```bash
npm install -g wrangler
```

#### 2. 登录 Cloudflare
```bash
wrangler login
```

#### 3. 运行一键部署脚本
```bash
./deploy-production.sh
```

这个脚本会自动：
- ✅ 创建 Cloudflare D1 数据库
- ✅ 初始化数据库架构
- ✅ 设置环境变量
- ✅ 部署后端到 Cloudflare Workers
- ✅ 配置前端生产环境
- ✅ 构建前端项目
- ✅ 推送到 GitHub（触发自动部署）

#### 4. 启用 GitHub Pages
1. 访问你的 GitHub 仓库
2. 进入 Settings > Pages
3. Source 选择 "Deploy from a branch"
4. Branch 选择 "gh-pages"
5. 点击 Save

#### 5. 等待部署完成
GitHub Actions 会自动构建和部署，通常需要 2-5 分钟。

## 🔗 访问你的网站

部署完成后，你可以通过以下地址访问：
- **网站**: `https://your-username.github.io/your-repo-name`
- **后端API**: `https://diliinfo-backend-prod.your-subdomain.workers.dev`

## 🧪 测试功能

访问网站后，测试以下功能：
1. 首页加载
2. 贷款申请流程
3. 用户注册
4. 文件上传
5. 管理后台

## 🔧 故障排除

### 常见问题

**1. CORS 错误**
- 检查后端 CORS 配置是否包含前端域名

**2. API 调用失败**
- 确认后端 Workers URL 是否正确
- 检查环境变量配置

**3. 页面 404 错误**
- 确保 GitHub Pages 已启用
- 检查 SPA 路由配置

**4. 数据库连接错误**
- 验证数据库 ID 是否正确
- 确保数据库已初始化

## 📊 监控和维护

### Cloudflare Dashboard
访问 https://dash.cloudflare.com 监控：
- Workers 使用情况
- D1 数据库状态
- API 请求统计

### GitHub Actions
访问仓库的 Actions 页面查看部署状态。

### 数据库备份
定期备份数据库：
```bash
cd workers-backend
wrangler d1 export diliinfo-db-prod --output backup-$(date +%Y%m%d).sql
```

## 🎯 自定义域名（可选）

如果你有自定义域名：

1. 在 GitHub Pages 设置中添加自定义域名
2. 创建 `apps/web/public/CNAME` 文件：
   ```
   your-domain.com
   ```
3. 在域名提供商处添加 CNAME 记录
4. 更新后端 CORS 配置

## � 获成取帮助

如果遇到问题：
1. 查看 `DEPLOYMENT_GUIDE.md` 详细指南
2. 检查 GitHub Actions 日志
3. 查看 Cloudflare Workers 日志
4. 确认所有配置文件正确

## 🎉 完成！

恭喜！你的 DiliInfo 贷款申请系统现在已经成功部署到生产环境，用户可以开始使用了！

---

**重要提醒**：
- 保存好所有密钥和配置
- 定期监控系统状态
- 及时更新安全补丁