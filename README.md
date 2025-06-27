# DiliInfo - 专业金融借贷平台

一个面向墨西哥市场的专业金融借贷网站，采用现代化技术栈构建，提供用户友好的贷款申请流程和强大的管理后台。

## 🚀 功能特性

### 用户端功能
- **多语言支持**: 西班牙语（墨西哥）为主，英语为备选
- **贷款申请向导**: 分步骤的智能申请流程
- **用户注册/登录**: 安全的用户认证系统
- **申请进度跟踪**: 实时查看申请状态和进度
- **文件上传**: 支持贷款材料上传
- **响应式设计**: 完美适配桌面和移动设备

### 管理后台功能
- **管理员认证**: 独立的管理员登录系统
- **数据统计仪表板**: 
  - 用户注册统计
  - 申请状态分布
  - 页面访问量统计
  - 每日趋势分析
- **用户管理**: 查看所有注册用户信息
- **申请管理**: 
  - 查看所有贷款申请
  - 跟踪申请进度
  - 查看上传材料
- **访问者分析**: 详细的页面访问统计

## 🛠 技术栈

### 前端
- **React 18** + **TypeScript**
- **Vite** (构建工具)
- **React Router** (路由管理)
- **TailwindCSS** (样式框架)
- **react-i18next** (国际化)

### 后端
- **Cloudflare Workers** (无服务器计算)
- **Hono** (轻量级Web框架)
- **Cloudflare D1** (SQL数据库)

### 部署
- **GitHub Pages** (前端静态托管)
- **Cloudflare Workers** (后端API)

## 📦 项目结构

```
diliinfo-com.github.io/
├── apps/web/                 # 前端应用
│   ├── src/
│   │   ├── components/       # 可复用组件
│   │   ├── pages/           # 页面组件
│   │   ├── locales/         # 多语言文件
│   │   └── utils/           # 工具函数
├── workers-backend/         # 后端API
├── sql/                     # 数据库架构
└── .github/workflows/       # CI/CD配置
```

## 🚀 快速开始

### 环境要求
- Node.js 18+
- npm 或 yarn
- Cloudflare账户

### 本地开发

1. **克隆仓库**
```bash
git clone https://github.com/diliinfo-com/diliinfo-com.github.io.git
cd diliinfo-com.github.io
```

2. **安装前端依赖**
```bash
cd apps/web
npm install
```

3. **安装后端依赖**
```bash
cd ../../workers-backend
npm install
```

4. **设置Cloudflare D1数据库**
```bash
# 创建数据库
npx wrangler d1 create diliinfo-db

# 执行数据库架构
npx wrangler d1 execute diliinfo-db --file=../sql/schema.sql
```

5. **配置环境变量**
在 `workers-backend/wrangler.toml` 中添加：
```toml
[env.production]
name = "diliinfo-api"
compatibility_date = "2024-01-01"

[[env.production.d1_databases]]
binding = "DB"
database_name = "diliinfo-db"
database_id = "你的数据库ID"

[env.production.vars]
JWT_SECRET = "你的JWT密钥"
```

6. **启动开发服务器**

启动后端：
```bash
cd workers-backend
npm run dev
```

启动前端：
```bash
cd apps/web
npm run dev
```

访问 http://localhost:5173

### 管理员账户

默认管理员账户：
- 用户名: `admin`
- 密码: `admin123`
- **⚠️ 生产环境请立即修改密码**

## 🔧 部署指南

### 前端部署 (GitHub Pages)

1. **配置GitHub Actions**
项目已包含自动部署配置 `.github/workflows/deploy.yml`

2. **推送代码**
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

GitHub Actions会自动构建和部署到 GitHub Pages。

### 后端部署 (Cloudflare Workers)

1. **部署到Cloudflare**
```bash
cd workers-backend
npx wrangler deploy --env production
```

2. **配置自定义域名** (可选)
在Cloudflare Dashboard中配置Workers的自定义域名。

### 数据库迁移

生产环境数据库初始化：
```bash
npx wrangler d1 execute diliinfo-db --env production --file=../sql/schema.sql
```

## 📊 API接口文档

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录

### 管理员认证
- `POST /api/admin/auth/login` - 管理员登录

### 用户API
- `GET /api/user/applications` - 获取用户申请列表
- `POST /api/user/applications` - 创建新申请

### 管理后台API
- `GET /api/admin/stats` - 获取统计数据
- `GET /api/admin/users` - 获取用户列表
- `GET /api/admin/applications` - 获取申请列表

### 统计API
- `GET /pv.gif?path={页面路径}` - 页面访问统计

## 🔒 安全考虑

1. **JWT认证**: 所有API接口使用JWT进行认证
2. **密码加密**: 使用SHA-256进行密码哈希
3. **CORS配置**: 严格的跨域访问控制
4. **SQL注入防护**: 使用参数化查询
5. **XSS防护**: React自带XSS防护

## 📱 浏览器支持

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## 🤝 贡献指南

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系我们

- 项目地址: [https://github.com/diliinfo-com/diliinfo-com.github.io](https://github.com/diliinfo-com/diliinfo-com.github.io)
- 问题反馈: [GitHub Issues](https://github.com/diliinfo-com/diliinfo-com.github.io/issues)

## 🙏 致谢

感谢以下开源项目：
- [React](https://reactjs.org/)
- [TailwindCSS](https://tailwindcss.com/)
- [Cloudflare Workers](https://workers.cloudflare.com/)
- [Vite](https://vitejs.dev/) 