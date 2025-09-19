#!/bin/bash

# GitHub Pages 部署脚本 - 包含SPA路由处理
echo "🚀 部署DiliInfo到GitHub Pages"
echo "================================"

# 进入前端目录
cd apps/web

echo "📦 安装依赖..."
npm install

echo "🔨 构建项目..."
npm run build

echo "📄 处理SPA路由..."
# 确保404.html存在于dist目录中
if [ ! -f "public/404.html" ]; then
    echo "⚠️  404.html文件不存在，正在创建..."
    mkdir -p public
    cp index.html public/404.html
fi

# 重新构建以包含404.html
npm run build

# 验证404.html是否存在于dist目录
if [ -f "dist/404.html" ]; then
    echo "✅ 404.html 已添加到构建输出"
else
    echo "⚠️  手动复制404.html到dist目录"
    cp public/404.html dist/404.html
fi

echo ""
echo "📋 部署步骤:"
echo "1. 提交所有更改到git仓库"
echo "2. 推送到GitHub"
echo "3. GitHub Actions会自动部署到Pages"
echo ""
echo "🔗 部署后测试:"
echo "- 访问: https://diliinfo.com"
echo "- 直接访问: https://diliinfo.com/login"
echo "- 直接访问: https://diliinfo.com/register"
echo "- 直接访问: https://diliinfo.com/admin"
echo ""

# 回到项目根目录
cd ../..

echo "💡 提示: 运行以下命令来推送更改:"
echo "git add ."
echo "git commit -m \"修复SPA路由问题 - 添加404.html\""
echo "git push origin main" 