import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './i18n';
import './index.css';
import './styles/safari-compat.css';

// Safari兼容性初始化
try {
  // 动态导入polyfills以避免Safari加载问题
  import('./utils/polyfills').then(({ initBrowserCompatibility }) => {
    initBrowserCompatibility();
  }).catch(error => {
    console.warn('Polyfills loading failed:', error);
  });
  
  // 动态导入TikTok Events API
  import('./utils/tiktokInit').then(({ setupTikTokEvents }) => {
    setupTikTokEvents().catch(error => {
      console.error('TikTok Events API 初始化失败:', error);
    });
  }).catch(error => {
    console.warn('TikTok Events API loading failed:', error);
  });
} catch (error) {
  console.warn('Dynamic imports not supported, continuing without polyfills');
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 