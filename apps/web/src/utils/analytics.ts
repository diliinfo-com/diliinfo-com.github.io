// 页面访问统计工具 + TikTok Pixel 和 Events API 集成

import { 
  trackPageView as trackTikTokPageView, 
  initSPATracking,
  trackSignUp as trackTikTokPixelSignUp,
  trackLogin as trackTikTokPixelLogin,
  trackLoanApplicationStart as trackTikTokPixelLoanApplicationStart,
  trackLoanApplicationComplete as trackTikTokPixelLoanApplicationComplete,
  trackFileUpload as trackTikTokPixelFileUpload,
  trackContactFormSubmit as trackTikTokPixelContactFormSubmit,
  trackButtonClick as trackTikTokPixelButtonClick
} from './tiktokPixel';

// 导入 TikTok Events API
import * as TikTokEventsApi from './tiktokEventsApi';

let currentPath = '';
let tikTokEventsApiInitialized = false;

// 初始化TikTok Events API
export const initTikTokEventsApi = async () => {
  try {
    // 从服务器获取访问令牌
    const response = await fetch('/api/tiktok/token');
    const data = await response.json();
    
    if (data.success && data.token) {
      TikTokEventsApi.setAccessToken(data.token);
      tikTokEventsApiInitialized = true;
      console.log('TikTok Events API initialized successfully');
    } else {
      console.error('Failed to initialize TikTok Events API: Invalid token');
    }
  } catch (error) {
    console.error('Failed to initialize TikTok Events API', error);
  }
};

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
  
  // TikTok Pixel 页面追踪
  trackTikTokPageView(path);
  
  // TikTok Events API 页面追踪
  if (tikTokEventsApiInitialized) {
    TikTokEventsApi.trackPageView(path)
      .catch(error => {
        // 错误已经在TikTokEventsApi内部处理，这里不需要额外处理
      });
  }
};

// 初始化统计
export const initAnalytics = () => {
  // 初始化 TikTok Events API
  initTikTokEventsApi();
  
  // 统计当前页面
  trackPageView(window.location.pathname);
  
  // 初始化 TikTok Pixel SPA 追踪
  initSPATracking();
  
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

// 创建同时使用Pixel和Events API的事件追踪函数
export const trackSignUp = async (method: string = 'web') => {
  // 使用TikTok Pixel
  trackTikTokPixelSignUp(method);
  
  // 使用TikTok Events API
  if (tikTokEventsApiInitialized) {
    TikTokEventsApi.trackSignUp(method)
      .catch(error => {
        // 错误已经在TikTokEventsApi内部处理，这里不需要额外处理
      });
  }
};

export const trackLogin = async (method: string = 'web') => {
  // 使用TikTok Pixel
  trackTikTokPixelLogin(method);
  
  // 使用TikTok Events API
  if (tikTokEventsApiInitialized) {
    TikTokEventsApi.trackLogin(method)
      .catch(error => {
        // 错误已经在TikTokEventsApi内部处理，这里不需要额外处理
      });
  }
};

export const trackLoanApplicationStart = async (loanType: string = 'personal') => {
  // 使用TikTok Pixel
  trackTikTokPixelLoanApplicationStart(loanType);
  
  // 使用TikTok Events API
  if (tikTokEventsApiInitialized) {
    TikTokEventsApi.trackLoanApplicationStart(loanType)
      .catch(error => {
        // 错误已经在TikTokEventsApi内部处理，这里不需要额外处理
      });
  }
};

export const trackLoanApplicationComplete = async (loanAmount: number, loanType: string = 'personal') => {
  // 使用TikTok Pixel
  trackTikTokPixelLoanApplicationComplete(loanAmount, loanType);
  
  // 使用TikTok Events API
  if (tikTokEventsApiInitialized) {
    TikTokEventsApi.trackLoanApplicationComplete(loanAmount, loanType)
      .catch(error => {
        // 错误已经在TikTokEventsApi内部处理，这里不需要额外处理
      });
  }
};

export const trackFileUpload = async (fileType: string, fileCount: number = 1) => {
  // 使用TikTok Pixel
  trackTikTokPixelFileUpload(fileType, fileCount);
  
  // 使用TikTok Events API
  if (tikTokEventsApiInitialized) {
    TikTokEventsApi.trackFileUpload(fileType, fileCount)
      .catch(error => {
        // 错误已经在TikTokEventsApi内部处理，这里不需要额外处理
      });
  }
};

export const trackContactFormSubmit = async (formType: string = 'contact') => {
  // 使用TikTok Pixel
  trackTikTokPixelContactFormSubmit(formType);
  
  // 使用TikTok Events API
  if (tikTokEventsApiInitialized) {
    TikTokEventsApi.trackContactFormSubmit(formType)
      .catch(error => {
        // 错误已经在TikTokEventsApi内部处理，这里不需要额外处理
      });
  }
};

export const trackButtonClick = async (buttonName: string, buttonLocation: string) => {
  // 使用TikTok Pixel
  trackTikTokPixelButtonClick(buttonName, buttonLocation);
  
  // 使用TikTok Events API
  if (tikTokEventsApiInitialized) {
    TikTokEventsApi.trackButtonClick(buttonName, buttonLocation)
      .catch(error => {
        // 错误已经在TikTokEventsApi内部处理，这里不需要额外处理
      });
  }
};
