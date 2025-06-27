# diliinfo

该仓库提供金融贷款网站 "diliinfo" 的完整前后端脚手架，技术栈：

- 前端：React + Vite + TypeScript + react-router-dom + react-i18next
- 后端：Cloudflare Workers + D1 (SQLite 兼容) 数据库存储
- 部署：GitHub Pages（静态资源） + Cloudflare Workers（动态 API）

目录结构：

```
apps/
  └─ web/            # React 前端源代码
workers-backend/     # Cloudflare Worker 代码
sql/                 # D1 初始化 SQL 脚本
```

## 快速开始

```bash
# 克隆并安装前端依赖
cd apps/web
npm install
npm run dev       # 本地开发，默认 http://localhost:5173

# 本地 Worker（需已安装 wrangler）
cd ../../workers-backend
npm install
wrangler dev         # 本地 Worker，默认 http://127.0.0.1:8787
```

更多部署与配置请参考各子目录 README。 

## 初始化 D1

```bash
wrangler d1 create diliinfo-db
wrangler d1 execute diliinfo-db --file ../sql/schema.sql
``` 