# 🔑 GitHub Secrets 配置指南

## Cloudflare API Token 配置

你需要在GitHub仓库中添加以下Secret：

### 📋 配置步骤

1. **访问GitHub仓库设置**:
   ```
   https://github.com/diliinfo-com/diliinfo-com.github.io/settings/secrets/actions
   ```

2. **添加新的Repository Secret**:
   - 点击 "New repository secret"
   - **Name**: `CLOUDFLARE_API_TOKEN`
   - **Value**: `oaEZey9lfKZgRjg81CcY6OVZNHRP90hhoQNqht7E`

3. **保存配置**:
   - 点击 "Add secret"

### ✅ 验证配置

配置完成后：

1. **触发部署**:
   ```bash
   git commit --allow-empty -m "Test deployment with API token"
   git push origin main
   ```

2. **查看部署状态**:
   ```
   https://github.com/diliinfo-com/diliinfo-com.github.io/actions
   ```

### 🚀 预期结果

- ✅ Backend 部署到: `https://diliinfo-backend-prod.0768keyiran.workers.dev`
- ✅ Frontend 部署到: `https://diliinfo.com`

### 🔧 故障排除

如果部署失败，检查：
- API Token 是否正确配置
- Cloudflare Workers 配置是否正确
- GitHub Actions 日志中的错误信息