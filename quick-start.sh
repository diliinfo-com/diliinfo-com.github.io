#!/bin/bash

# DiliInfo 项目快速启动脚本
# 使用方法: chmod +x quick-start.sh && ./quick-start.sh

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 端口配置
FRONTEND_PORT=5173
BACKEND_PORT=8787

echo -e "${BLUE}🚀 DiliInfo 项目快速启动脚本${NC}"
echo "================================"

# 检查必需的工具
echo -e "${YELLOW}📋 检查环境...${NC}"

# 加载 nvm 如果存在
if [ -f ~/.nvm/nvm.sh ]; then
    source ~/.nvm/nvm.sh
    echo -e "${GREEN}✅ 已加载 nvm${NC}"
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js 未安装，请先安装 Node.js 20+${NC}"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)

if [ "$NODE_MAJOR" -lt 20 ]; then
    echo -e "${YELLOW}⚠️  当前 Node.js 版本: v$NODE_VERSION${NC}"
    echo -e "${YELLOW}⚠️  Wrangler 需要 Node.js v20.0.0 或更高版本${NC}"
    
    if [ -f ~/.nvm/nvm.sh ]; then
        echo -e "${BLUE}🔄 尝试切换到 Node.js LTS 版本...${NC}"
        nvm use --lts 2>/dev/null || {
            echo -e "${YELLOW}📦 安装 Node.js LTS 版本...${NC}"
            nvm install --lts
            nvm use --lts
        }
        
        # 重新检查版本
        NODE_VERSION=$(node --version | sed 's/v//')
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d. -f1)
        
        if [ "$NODE_MAJOR" -lt 20 ]; then
            echo -e "${RED}❌ 无法获取兼容的 Node.js 版本${NC}"
            echo -e "${YELLOW}💡 请手动运行: nvm install --lts && nvm use --lts${NC}"
            exit 1
        fi
        
        echo -e "${GREEN}✅ 已切换到 Node.js v$NODE_VERSION${NC}"
    else
        echo -e "${RED}❌ 请升级 Node.js 到 v20.0.0 或更高版本${NC}"
        echo -e "${YELLOW}💡 建议安装 nvm: https://github.com/nvm-sh/nvm${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ Node.js 版本: v$NODE_VERSION (兼容)${NC}"
fi

# 关闭所有服务的函数
stop_all_services() {
    echo -e "${YELLOW}🛑 正在关闭所有服务...${NC}"
    
    # 关闭Wrangler相关进程
    pkill -f "wrangler dev" 2>/dev/null
    pkill -f "npm.*wrangler" 2>/dev/null
    
    # 关闭Vite相关进程
    pkill -f "vite" 2>/dev/null
    pkill -f "npm.*dev" 2>/dev/null
    
    # 关闭占用指定端口的进程
    if lsof -ti:$FRONTEND_PORT &> /dev/null; then
        echo "  🔌 关闭前端端口 $FRONTEND_PORT"
        lsof -ti:$FRONTEND_PORT | xargs kill -9 2>/dev/null
    fi
    
    if lsof -ti:$BACKEND_PORT &> /dev/null; then
        echo "  🔌 关闭后端端口 $BACKEND_PORT"
        lsof -ti:$BACKEND_PORT | xargs kill -9 2>/dev/null
    fi
    
    # 等待进程完全关闭
    sleep 2
    
    echo -e "${GREEN}✅ 所有服务已关闭${NC}"
}

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -ti:$port &> /dev/null; then
        echo -e "${YELLOW}⚠️  端口 $port 被占用，正在释放...${NC}"
        lsof -ti:$port | xargs kill -9 2>/dev/null
        sleep 1
    fi
}

# 安装Wrangler（如果需要）
if ! command -v wrangler &> /dev/null; then
    echo -e "${YELLOW}⚠️  Wrangler 未安装，正在安装...${NC}"
    npm install -g wrangler@latest
fi

echo -e "${GREEN}✅ 环境检查完成${NC}"

# 选择启动模式
echo ""
echo "请选择操作模式:"
echo "1) 仅启动前端 (端口 $FRONTEND_PORT)"
echo "2) 仅启动后端 (端口 $BACKEND_PORT)"  
echo "3) 完整启动 (全栈开发 + 数据库)"
echo "4) 初始化项目 (首次设置)"
echo "5) 关闭所有服务"
echo "6) 重启所有服务"
read -p "请输入选择 (1-6): " choice

case $choice in
    1)
        echo -e "${BLUE}🎨 启动前端服务...${NC}"
        stop_all_services
        check_port $FRONTEND_PORT
        
        cd apps/web
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}📦 安装前端依赖...${NC}"
            npm install
        fi
        
        echo -e "${GREEN}🚀 前端服务启动中...${NC}"
        echo -e "${GREEN}📍 前端地址: http://localhost:$FRONTEND_PORT${NC}"
        npm run dev -- --port $FRONTEND_PORT
        ;;
    2)
        echo -e "${BLUE}⚡ 启动后端服务...${NC}"
        stop_all_services
        check_port $BACKEND_PORT
        
        cd workers-backend
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}📦 安装后端依赖...${NC}"
            npm install
        fi
        
                 echo -e "${GREEN}🚀 后端服务启动中...${NC}"
         echo -e "${GREEN}📍 后端地址: http://localhost:$BACKEND_PORT${NC}"
         npm run dev:port $BACKEND_PORT
        ;;
    3)
        echo -e "${BLUE}🔥 启动完整服务 (包含数据库)...${NC}"
        stop_all_services
        check_port $FRONTEND_PORT
        check_port $BACKEND_PORT
        
        # 检查数据库是否已初始化
        if [ ! -f ".db_initialized" ]; then
            echo -e "${YELLOW}🗄️  数据库未初始化，正在初始化...${NC}"
            cd workers-backend
            
            # 检查是否已登录
            if ! wrangler whoami &> /dev/null; then
                echo -e "${YELLOW}🔑 请先登录 Cloudflare...${NC}"
                wrangler auth login
            fi
            
            # 初始化数据库
            echo -e "${YELLOW}📊 执行数据库脚本...${NC}"
            wrangler d1 execute diliinfo-db-dev --file=../sql/schema.sql
            
            cd ..
            touch .db_initialized
            echo -e "${GREEN}✅ 数据库初始化完成${NC}"
        fi
        
        # 启动后端
        echo -e "${BLUE}⚡ 启动后端服务...${NC}"
        cd workers-backend
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}📦 安装后端依赖...${NC}"
            npm install
        fi
        
        # 在后台启动后端
        npm run dev:port $BACKEND_PORT > ../backend.log 2>&1 &
        BACKEND_PID=$!
        
        # 等待后端启动
        echo -e "${YELLOW}⏱️  等待后端服务启动...${NC}"
        sleep 5
        
        # 检查后端是否启动成功
        if ! curl -s http://localhost:$BACKEND_PORT > /dev/null; then
            echo -e "${RED}❌ 后端启动失败，请检查日志: backend.log${NC}"
            exit 1
        fi
        
        # 启动前端
        echo -e "${BLUE}🎨 启动前端服务...${NC}"
        cd ../apps/web
        if [ ! -d "node_modules" ]; then
            echo -e "${YELLOW}📦 安装前端依赖...${NC}"
            npm install
        fi
        
        # 在后台启动前端
        npm run dev -- --port $FRONTEND_PORT > ../frontend.log 2>&1 &
        FRONTEND_PID=$!
        
        echo ""
        echo -e "${GREEN}🎉 服务启动成功!${NC}"
        echo -e "${GREEN}📍 前端地址: http://localhost:$FRONTEND_PORT${NC}"
        echo -e "${GREEN}📍 后端地址: http://localhost:$BACKEND_PORT${NC}"
        echo -e "${GREEN}📍 数据库: Cloudflare D1 (diliinfo-db-dev)${NC}"
        echo ""
        echo -e "${YELLOW}📝 日志文件:${NC}"
        echo "  - 前端: frontend.log"
        echo "  - 后端: backend.log"
        echo ""
        echo -e "${YELLOW}按 Ctrl+C 停止所有服务${NC}"
        
        # 等待用户中断
        trap "echo ''; echo -e '${YELLOW}🛑 正在停止服务...${NC}'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; rm -f frontend.log backend.log; exit" INT
        
        # 持续监控服务状态
        while true; do
            if ! kill -0 $BACKEND_PID 2>/dev/null; then
                echo -e "${RED}❌ 后端服务异常停止${NC}"
                break
            fi
            if ! kill -0 $FRONTEND_PID 2>/dev/null; then
                echo -e "${RED}❌ 前端服务异常停止${NC}"
                break
            fi
            sleep 5
        done
        ;;
    4)
        echo -e "${BLUE}🔧 初始化项目...${NC}"
        
        # 检查是否已登录 Cloudflare
        if ! wrangler whoami &> /dev/null; then
            echo -e "${YELLOW}🔑 请先登录 Cloudflare...${NC}"
            wrangler auth login
        fi
        
        # 进入后端目录
        cd workers-backend
        
        # 安装依赖
        echo -e "${YELLOW}📦 安装后端依赖...${NC}"
        if [ -d "node_modules" ]; then
            rm -rf node_modules package-lock.json
        fi
        npm install
        
        # 创建开发数据库（如果不存在）
        echo -e "${YELLOW}🗄️  检查数据库...${NC}"
        DB_EXISTS=$(wrangler d1 list | grep "diliinfo-db-dev" || echo "")
        if [ -z "$DB_EXISTS" ]; then
            echo -e "${YELLOW}📊 创建数据库 'diliinfo-db-dev'...${NC}"
            wrangler d1 create diliinfo-db-dev
            echo ""
            echo -e "${YELLOW}⚠️  重要提示:${NC}"
            echo "请复制上面输出的数据库ID并更新 workers-backend/wrangler.toml 文件"
        else
            echo -e "${GREEN}✅ 数据库已存在${NC}"
        fi
        
        # 初始化数据库结构
        echo -e "${YELLOW}📊 初始化数据库结构...${NC}"
        wrangler d1 execute diliinfo-db-dev --file=../sql/schema.sql
        
        # 安装前端依赖
        echo -e "${YELLOW}📦 安装前端依赖...${NC}"
        cd ../apps/web
        if [ -d "node_modules" ]; then
            rm -rf node_modules package-lock.json
        fi
        npm install
        
        # 标记数据库已初始化
        cd ../..
        touch .db_initialized
        
        echo ""
        echo -e "${GREEN}✅ 项目初始化完成!${NC}"
        echo -e "${GREEN}📝 现在可以使用选项 3 启动完整服务${NC}"
        ;;
    5)
        stop_all_services
        ;;
    6)
        echo -e "${BLUE}🔄 重启所有服务...${NC}"
        stop_all_services
        sleep 2
        echo -e "${BLUE}启动完整服务...${NC}"
        exec $0 <<< "3"
        ;;
    *)
        echo -e "${RED}❌ 无效选择${NC}"
        exit 1
        ;;
esac 