# GitHub Pages SPA路由问题修复

## 🔍 问题描述

在GitHub Pages上部署单页应用(SPA)时，直接访问子路径（如 `diliinfo.com/login`）会显示404错误：

```
File not found
The site configured at this address does not contain the requested file.
```

这是因为GitHub Pages试图查找名为 `login` 的文件，但实际上这是React Router的前端路由。

## ✅ 解决方案

### 方法1：使用404.html重定向（已实施）

1. **创建404.html文件**：
   - 位置：`apps/web/public/404.html`
   - 内容：与`index.html`相同，包含React应用

2. **更新Vite配置**：
   - 确保`publicDir: 'public'`设置正确
   - 404.html会被复制到构建输出的根目录

3. **构建和部署**：
   ```bash
   cd apps/web
   npm run build
   # 404.html会出现在dist/目录中
   ```

### 方法2：使用自动化脚本（推荐）

运行部署脚本：
```bash
./deploy-github-pages.sh
```

这个脚本会：
- 自动构建项目
- 确保404.html存在于正确位置
- 提供部署指引

## 🔧 工作原理

1. **用户直接访问** `diliinfo.com/login`
2. **GitHub Pages** 找不到 `/login` 文件，返回404.html
3. **404.html** 包含完整的React应用
4. **React Router** 接管路由，显示正确的登录页面

## 📁 相关文件

- `apps/web/public/404.html` - 404重定向页面
- `apps/web/vite.config.ts` - Vite构建配置
- `deploy-github-pages.sh` - 自动化部署脚本

## 🧪 测试

部署后测试以下URL：
- ✅ `https://diliinfo.com/` - 主页
- ✅ `https://diliinfo.com/login` - 登录页（直接访问）
- ✅ `https://diliinfo.com/register` - 注册页（直接访问）
- ✅ `https://diliinfo.com/admin` - 管理后台（直接访问）

## 📝 注意事项

1. **404.html必须位于网站根目录**：GitHub Pages会自动查找根目录下的404.html
2. **保持404.html与index.html同步**：当index.html更新时，404.html也需要更新
3. **SEO考虑**：所有子路径都会返回200状态码，这是SPA的标准行为

## 🔄 更新流程

当修改了index.html后，需要同步更新404.html：

```bash
# 手动同步
cp apps/web/index.html apps/web/public/404.html

# 或使用部署脚本（自动处理）
./deploy-github-pages.sh
```

## 🚀 部署

修复完成后，推送到GitHub：

```bash
git add .
git commit -m "修复SPA路由问题 - 添加404.html"
git push origin main
```

GitHub Actions会自动重新部署，修复应该立即生效。 