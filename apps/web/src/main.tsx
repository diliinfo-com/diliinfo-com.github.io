import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import './index.css';
import { setupTikTokEvents } from './utils/tiktokInit';
import { initBrowserCompatibility } from './utils/polyfills';
import './styles/safari-compat.css';
import './utils/compatibilityTest'; // 自动运行兼容性测试
import { initBrowserCompat } from './utils/browserCompat';

// 在应用启动前初始化浏览器兼容性修复
initBrowserCompatibility();
initBrowserCompat();

// 初始化TikTok Events API
setupTikTokEvents().catch(error => {
  console.error('TikTok Events API 初始化失败:', error);
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 