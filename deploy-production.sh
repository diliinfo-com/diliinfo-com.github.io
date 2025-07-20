#!/bin/bash

# DiliInfo 生产环境一键部署脚本
echo "🚀 DiliInfo 生产环境部署"
echo "=========================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查必要工具
echo -e "${BLUE}📋 检查部署环境...${NC}"

if ! command -v wrangler &> /dev/null; then
    echo -e "${RED}❌ Wrangler CLI 未安装${NC}"
    echo "请运行: npm install -g wrangler"
    exit 1
fi

if ! command -v git &> /dev/null; then
    echo -e "${RED}❌ Git 未安装${NC}"
    exit 1
fi

echo -e "${GREEN}✅ 环境检查通过${NC}"

# 第一步：部署数据库
echo -e "\n${BLUE}🗄️ 第一步：部署 Cloudflare D1 数据库${NC}"
echo "=================================="

cd workers-backend

# 检查是否已有生产数据库
echo "检查现有数据库..."
if wrangler d1 list | grep -q "diliinfo-db-prod"; then
    echo -e "${YELLOW}⚠️  生产数据库已存在，跳过创建${NC}"
else
    echo "创建生产数据库..."
    wrangler d1 create diliinfo-db-prod
    echo -e "${YELLOW}⚠️  请更新 wrangler.toml 中的数据库ID${NC}"
    echo "按任意键继续..."
    read -n 1 -s
fi

# 初始化数据库架构
echo "初始化数据库架构..."
if wrangler d1 execute diliinfo-db-prod --remote --file=../sql/schema.sql; then
    echo -e "${GREEN}✅ 数据库架构初始化成功${NC}"
else
    echo -e "${RED}❌ 数据库初始化失败${NC}"
    exit 1
fi

# 第二步：设置环境变量
echo -e "\n${BLUE}🔐 第二步：设置环境变量${NC}"
echo "========================"

echo "设置 JWT 密钥..."
echo "请输入一个强密码作为 JWT 密钥（建议32位以上随机字符串）："
read -s JWT_SECRET

if [ -z "$JWT_SECRET" ]; then
    JWT_SECRET="diliinfo-prod-jwt-$(date +%s)-$(openssl rand -hex 16)"
    echo -e "${YELLOW}使用自动生成的密钥${NC}"
fi

echo $JWT_SECRET | wrangler secret put JWT_SECRET --env production

# 第三步：部署后端
echo -e "\n${BLUE}🚀 第三步：部署 Cloudflare Workers 后端${NC}"
echo "======================================="

echo "部署后端到生产环境..."
if wrangler deploy --env production; then
    echo -e "${GREEN}✅ 后端部署成功${NC}"
    
    # 获取部署的URL
    WORKER_URL=$(wrangler whoami 2>/dev/null | grep -o 'https://.*workers.dev' | head -1)
    if [ -z "$WORKER_URL" ]; then
        echo -e "${YELLOW}⚠️  请手动记录 Workers URL${NC}"
    else
        echo -e "${GREEN}🔗 后端URL: $WORKER_URL${NC}"
    fi
else
    echo -e "${RED}❌ 后端部署失败${NC}"
    exit 1
fi

# 第四步：测试后端
echo -e "\n${BLUE}🧪 第四步：测试后端API${NC}"
echo "======================"

echo "测试健康检查..."
if curl -s -f "${WORKER_URL}/api/health" > /dev/null; then
    echo -e "${GREEN}✅ 后端API正常${NC}"
else
    echo -e "${RED}❌ 后端API测试失败${NC}"
    echo "请检查部署状态"
fi

# 第五步：更新前端配置
echo -e "\n${BLUE}🌐 第五步：配置前端生产环境${NC}"
echo "=============================="

cd ../apps/web

# 更新生产环境配置
echo "更新前端API配置..."
cat > .env.production << EOF
VITE_API_BASE_URL=${WORKER_URL}
VITE_APP_ENV=production
VITE_APP_TITLE=DiliInfo - Préstamos Rápidos México
EOF

echo -e "${GREEN}✅ 前端配置已更新${NC}"

# 第六步：构建和测试前端
echo -e "\n${BLUE}🔨 第六步：构建前端${NC}"
echo "=================="

echo "安装依赖..."
npm install

echo "构建生产版本..."
if npm run build; then
    echo -e "${GREEN}✅ 前端构建成功${NC}"
else
    echo -e "${RED}❌ 前端构建失败${NC}"
    exit 1
fi

# 添加SPA路由支持
echo "添加SPA路由支持..."
cp dist/index.html dist/404.html
echo -e "${GREEN}✅ SPA路由配置完成${NC}"

# 第七步：部署到GitHub Pages
echo -e "\n${BLUE}📤 第七步：部署到 GitHub Pages${NC}"
echo "==============================="

cd ../..

echo "提交更改到Git..."
git add .
git commit -m "🚀 生产环境部署配置 - $(date '+%Y-%m-%d %H:%M:%S')"

echo "推送到GitHub..."
if git push origin main; then
    echo -e "${GREEN}✅ 代码已推送到GitHub${NC}"
    echo -e "${YELLOW}⏳ GitHub Actions 正在自动部署...${NC}"
else
    echo -e "${RED}❌ Git推送失败${NC}"
    exit 1
fi

# 第八步：显示部署信息
echo -e "\n${GREEN}🎉 部署完成！${NC}"
echo "=============="

echo -e "\n${BLUE}📋 部署信息总结：${NC}"
echo "后端API: ${WORKER_URL}"
echo "前端网站: https://$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1.github.io\/\2/')/"
echo ""

echo -e "${BLUE}🔍 下一步操作：${NC}"
echo "1. 等待 GitHub Actions 完成部署（约2-5分钟）"
echo "2. 访问你的网站测试功能"
echo "3. 在 GitHub 仓库设置中启用 GitHub Pages（如果尚未启用）"
echo ""

echo -e "${BLUE}📊 监控和维护：${NC}"
echo "• Cloudflare Dashboard: https://dash.cloudflare.com"
echo "• GitHub Actions: https://github.com/$(git config --get remote.origin.url | sed 's/.*github.com[:/]\([^/]*\)\/\([^.]*\).*/\1\/\2/')/actions"
echo ""

echo -e "${YELLOW}⚠️  重要提醒：${NC}"
echo "• 请保存好 JWT 密钥"
echo "• 定期备份数据库"
echo "• 监控 Cloudflare Workers 使用量"
echo ""

echo -e "${GREEN}🚀 DiliInfo 已成功部署到生产环境！${NC}"