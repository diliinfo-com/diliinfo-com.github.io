// 首先加载polyfills确保跨浏览器兼容性
import './polyfills';

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import './index.css';
import { setupTikTokEvents } from './utils/tiktokInit';
import { initBrowserCompat } from './utils/browserCompat';

// 初始化浏览器兼容性
const compatInfo = initBrowserCompat();
console.log('🚀 App starting with compatibility info:', compatInfo);

// 初始化TikTok Events API
setupTikTokEvents().catch(error => {
  console.error('TikTok Events API 初始化失败:', error);
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 