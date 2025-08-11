# TikTok Pixel 集成设置指南

## 概述

本项目已集成 TikTok Pixel 用于追踪用户行为和转化事件。TikTok Pixel 是一个 JavaScript 代码片段，可以追踪网站访问者并优化广告投放。

## 已安装的组件

### 1. 基础 Pixel 代码
- **位置**: `apps/web/index.html` 和 `apps/web/public/404.html`
- **功能**: 基础页面访问追踪 (`ttq.page()`)
- **Pixel ID**: `D2CLTFBC77U9PLHEH6QG`

### 2. 增强追踪工具
- **文件**: `apps/web/src/utils/tiktokPixel.ts`
- **功能**: 提供完整的 TikTok Pixel 事件追踪 API

## 主要功能

### 页面访问追踪
- 自动追踪页面加载 (`ttq.page()`)
- SPA 路由变化追踪 (React Router 支持)
- 虚拟页面导航支持

### 用户行为追踪
- **注册事件**: `trackSignUp(method)`
- **登录事件**: `trackLogin(method)`
- **贷款申请**: `trackLoanApplicationStart(type)`, `trackLoanApplicationComplete(amount, type)`
- **文件上传**: `trackFileUpload(fileType, count)`
- **表单提交**: `trackContactFormSubmit(formType)`
- **按钮点击**: `trackButtonClick(buttonName, location)`

### 用户识别
- **用户识别**: `identifyUser(userId, email, phone)`
- **属性设置**: `setUserProperties(properties)`

## 使用方法

### 基础使用
```typescript
import { trackSignUp, trackLogin } from '../utils/analytics';

// 追踪用户注册
await trackSignUp('web');

// 追踪用户登录
await trackLogin('web');
```

### 高级使用
```typescript
import { 
  trackLoanApplicationStart, 
  trackLoanApplicationComplete,
  trackFileUpload 
} from '../utils/analytics';

// 追踪贷款申请开始
await trackLoanApplicationStart('personal');

// 追踪贷款申请完成
await trackLoanApplicationComplete(50000, 'personal');

// 追踪文件上传
await trackFileUpload('id_front', 1);
```

## 技术实现

### SPA 路由追踪
通过重写 `history.pushState` 和 `history.replaceState` 方法，确保在单页应用中路由变化时也能正确追踪页面访问。

### 异步加载支持
使用 `waitForTikTokPixel()` 函数确保 TikTok Pixel 完全加载后再执行追踪事件。

### 类型安全
提供完整的 TypeScript 类型定义，支持 `window.ttq` 对象。

## 事件参数说明

### 标准事件
- `SignUp`: 用户注册
- `Login`: 用户登录
- `InitiateCheckout`: 开始结账流程
- `CompleteRegistration`: 完成注册
- `AddToCart`: 添加到购物车 (用于文件上传)

### 自定义参数
- `loanType`: 贷款类型 (personal, business, etc.)
- `loanAmount`: 贷款金额
- `fileType`: 文件类型
- `fileCount`: 文件数量
- `formType`: 表单类型

## 配置和自定义

### 修改 Pixel ID
在 `apps/web/index.html` 和 `apps/web/public/404.html` 中搜索 `D2CLTFBC77U9PLHEH6QG` 并替换为新的 Pixel ID。

### 添加新事件
在 `apps/web/src/utils/tiktokPixel.ts` 中添加新的追踪函数：

```typescript
export const trackCustomEvent = async (eventName: string, parameters?: Record<string, any>) => {
  await waitForTikTokPixel();
  window.ttq.track(eventName, parameters);
};
```

### 修改现有事件
在相应的组件中导入并使用追踪函数，确保在适当的时机调用。

## 测试和验证

### 浏览器开发者工具
1. 打开浏览器开发者工具
2. 查看 Console 中是否有 TikTok Pixel 相关日志
3. 在 Network 标签页中查看对 `analytics.tiktok.com` 的请求

### TikTok 事件管理器
1. 登录 TikTok Ads Manager
2. 进入 Events Manager
3. 查看实时事件数据

## 注意事项

1. **隐私合规**: 确保符合 GDPR 和当地隐私法规
2. **性能影响**: TikTok Pixel 是异步加载的，不会阻塞页面渲染
3. **错误处理**: 所有追踪函数都包含错误处理，确保不会影响主要功能
4. **浏览器兼容性**: 支持所有现代浏览器

## 故障排除

### 常见问题
1. **事件未触发**: 检查 TikTok Pixel 是否正确加载
2. **参数丢失**: 确保使用正确的参数格式
3. **SPA 路由问题**: 验证 `initSPATracking()` 是否被调用

### 调试模式
在开发环境中，可以在浏览器控制台中手动调用：
```javascript
window.ttq.track('TestEvent', { test: true });
```

## 更新日志

- **v1.0.0**: 初始 TikTok Pixel 集成
- **v1.1.0**: 添加 SPA 路由追踪和用户行为事件
- **v1.2.0**: 完善事件追踪和类型定义

## 支持

如有问题或需要帮助，请联系开发团队或查看 TikTok Pixel 官方文档。
