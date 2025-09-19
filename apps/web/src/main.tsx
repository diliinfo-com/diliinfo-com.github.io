import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import './index.css';
import { setupTikTokEvents } from './utils/tiktokInit';
import { initSafariCompat } from './utils/safariCompat';

// 初始化轻量级Safari兼容性修复
initSafariCompat();

// 初始化TikTok Events API
setupTikTokEvents().catch(error => {
  console.error('TikTok Events API 初始化失败:', error);
});

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 