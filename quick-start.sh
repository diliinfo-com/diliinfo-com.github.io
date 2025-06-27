#!/bin/bash

# DiliInfo 项目快速启动脚本
# 使用方法: chmod +x quick-start.sh && ./quick-start.sh

echo "🚀 DiliInfo 项目快速启动脚本"
echo "================================"

# 检查必需的工具
echo "📋 检查环境..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

if ! command -v wrangler &> /dev/null; then
    echo "⚠️  Wrangler 未安装，正在安装..."
    npm install -g wrangler@latest
fi

echo "✅ 环境检查完成"

# 选择启动模式
echo ""
echo "请选择启动模式:"
echo "1) 仅启动前端 (前端开发)"
echo "2) 仅启动后端 (后端开发)"  
echo "3) 完整启动 (全栈开发)"
echo "4) 初始化项目 (首次设置)"
read -p "请输入选择 (1-4): " choice

case $choice in
    1)
        echo "🎨 启动前端服务..."
        cd apps/web
        if [ ! -d "node_modules" ]; then
            echo "📦 安装前端依赖..."
            npm install
        fi
        npm run dev
        ;;
    2)
        echo "⚡ 启动后端服务..."
        cd workers-backend
        if [ ! -d "node_modules" ]; then
            echo "📦 安装后端依赖..."
            npm install
        fi
        npm run dev
        ;;
    3)
        echo "🔥 启动完整服务..."
        
        # 启动后端
        echo "⚡ 启动后端服务..."
        cd workers-backend
        if [ ! -d "node_modules" ]; then
            echo "📦 安装后端依赖..."
            npm install
        fi
        npm run dev &
        BACKEND_PID=$!
        
        # 等待后端启动
        echo "⏱️  等待后端服务启动..."
        sleep 5
        
        # 启动前端
        echo "🎨 启动前端服务..."
        cd ../apps/web
        if [ ! -d "node_modules" ]; then
            echo "📦 安装前端依赖..."
            npm install
        fi
        npm run dev &
        FRONTEND_PID=$!
        
        echo ""
        echo "🎉 服务启动成功!"
        echo "📍 前端地址: http://localhost:5173"
        echo "📍 后端地址: http://localhost:8787"
        echo ""
        echo "按 Ctrl+C 停止所有服务"
        
        # 等待用户中断
        trap "echo '🛑 正在停止服务...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
        wait
        ;;
    4)
        echo "🔧 初始化项目..."
        
        # 检查是否已登录 Cloudflare
        if ! wrangler whoami &> /dev/null; then
            echo "🔑 请先登录 Cloudflare..."
            wrangler auth login
        fi
        
        # 进入后端目录
        cd workers-backend
        
        # 安装依赖
        echo "📦 安装后端依赖..."
        rm -rf node_modules package-lock.json
        npm install
        
        # 创建开发数据库
        echo "🗄️  创建开发数据库..."
        echo "正在创建数据库 'diliinfo-db-dev'..."
        wrangler d1 create diliinfo-db-dev
        
        echo ""
        echo "⚠️  重要提示:"
        echo "1. 请复制上面输出的数据库ID"
        echo "2. 编辑 workers-backend/wrangler.toml 文件"
        echo "3. 将 '<YOUR_DEV_DB_ID>' 替换为真实的数据库ID"
        echo "4. 然后运行: wrangler d1 execute diliinfo-db-dev --file=../sql/schema.sql"
        echo ""
        
        # 安装前端依赖
        echo "📦 安装前端依赖..."
        cd ../apps/web
        npm install
        
        echo ""
        echo "✅ 项目初始化完成!"
        echo "📝 请查看 SETUP_GUIDE.md 获取详细配置说明"
        ;;
    *)
        echo "❌ 无效选择"
        exit 1
        ;;
esac 