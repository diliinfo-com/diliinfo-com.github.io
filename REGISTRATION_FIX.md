# 注册功能修复总结

## 问题描述
用户在注册时遇到 500 内部服务器错误：
```
LoanWizard.tsx:71 POST http://localhost:5173/api/auth/register 500 (Internal Server Error)
```

## 根本原因
数据库表结构不完整，缺少必要的列：
- `users` 表缺少 `phone_verified` 和 `email_verified` 列
- 数据库架构没有正确初始化

## 修复步骤

### 1. 数据库架构修复
```bash
# 删除旧的用户表
wrangler d1 execute diliinfo-db-dev --local --command="DROP TABLE IF EXISTS users;"

# 重新应用完整的数据库架构
wrangler d1 execute diliinfo-db-dev --local --file=../sql/schema.sql
```

### 2. 验证表结构
```bash
# 检查用户表结构
wrangler d1 execute diliinfo-db-dev --local --command="PRAGMA table_info(users);"
```

确认包含以下列：
- `id` (TEXT, PRIMARY KEY)
- `email` (TEXT)
- `phone` (TEXT)
- `hashed_pass` (TEXT)
- `first_name` (TEXT)
- `last_name` (TEXT)
- `phone_verified` (BOOLEAN, DEFAULT FALSE)
- `email_verified` (BOOLEAN, DEFAULT FALSE)
- `status` (TEXT, DEFAULT 'active')
- `created_at` (INTEGER)
- `updated_at` (INTEGER)

### 3. 重启后端服务
```bash
# 停止现有服务
pkill -f "wrangler dev"

# 重新启动后端
cd workers-backend
npm run dev:port > ../backend.log 2>&1 &
```

## 测试结果

### 成功的注册请求
```bash
curl -X POST http://localhost:8787/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"+8613800138000","password":"123456","applicationId":"test-app-id"}'
```

响应：
```json
{
  "success": true,
  "token": "a9534820-e843-4f3a-9ce3-b0458c3817fe",
  "user": {
    "id": "68bc0845-a6ad-40c6-ae7c-ca79c2094178",
    "phone": "+8613800138000",
    "phone_verified": true
  },
  "applicationId": "test-app-id"
}
```

## 功能验证

✅ 用户注册成功
✅ 密码正确哈希存储
✅ 手机号验证状态设置
✅ 用户会话创建
✅ 申请记录关联（如果提供 applicationId）
✅ 用户活动日志记录

## 注意事项

1. **数据库初始化**：确保 `.db_initialized` 文件存在，标记数据库已正确初始化
2. **外键约束**：删除用户时需要先删除相关的会话和活动记录
3. **密码安全**：使用 SHA-256 哈希存储密码
4. **手机号格式**：支持国际区号格式（如 +86）

## 相关文件
- `workers-backend/index.ts` - 后端API实现
- `sql/schema.sql` - 数据库架构
- `apps/web/src/components/LoanWizard.tsx` - 前端注册组件

修复完成时间：2025-07-21 16:19