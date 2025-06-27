// 页面访问统计工具

let currentPath = '';

export const trackPageView = (path: string) => {
  // 避免重复统计同一页面
  if (currentPath === path) return;
  
  currentPath = path;
  
  // 发送统计像素请求
  const img = new Image();
  img.src = `/pv.gif?path=${encodeURIComponent(path)}&t=${Date.now()}`;
  
  // 可选：添加其他统计信息
  img.onerror = () => {
    console.warn('Failed to track page view');
  };
};

// 初始化统计
export const initAnalytics = () => {
  // 统计当前页面
  trackPageView(window.location.pathname);
  
  // 监听路由变化（如果使用了React Router）
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;
  
  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    setTimeout(() => trackPageView(window.location.pathname), 0);
  };
  
  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    setTimeout(() => trackPageView(window.location.pathname), 0);
  };
  
  window.addEventListener('popstate', () => {
    setTimeout(() => trackPageView(window.location.pathname), 0);
  });
}; 