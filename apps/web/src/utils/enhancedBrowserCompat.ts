// 增强的浏览器兼容性工具 - 基于polyfills
// 这个文件在polyfills加载后提供更高级的兼容性功能

/**
 * 增强的UUID生成 - 利用polyfills
 */
export const generateUUID = (): string => {
  // 现在可以安全使用，因为polyfills已经确保了兼容性
  return crypto.randomUUID();
};

/**
 * 增强的存储操作 - 利用polyfills
 */
export const enhancedStorage = {
  session: {
    get: (key: string): string | null => {
      try {
        return sessionStorage.getItem(key);
      } catch (e) {
        console.warn('Session storage get failed:', e);
        return null;
      }
    },
    
    set: (key: string, value: string): boolean => {
      try {
        sessionStorage.setItem(key, value);
        return true;
      } catch (e) {
        console.warn('Session storage set failed:', e);
        return false;
      }
    },
    
    remove: (key: string): void => {
      try {
        sessionStorage.removeItem(key);
      } catch (e) {
        console.warn('Session storage remove failed:', e);
      }
    }
  },
  
  local: {
    get: (key: string): string | null => {
      try {
        return localStorage.getItem(key);
      } catch (e) {
        console.warn('Local storage get failed:', e);
        return null;
      }
    },
    
    set: (key: string, value: string): boolean => {
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (e) {
        console.warn('Local storage set failed:', e);
        return false;
      }
    },
    
    remove: (key: string): void => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn('Local storage remove failed:', e);
      }
    }
  }
};

/**
 * 增强的fetch - 利用polyfills和重试机制
 */
export const enhancedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const maxRetries = 3;
  const retryDelay = 1000;
  
  // 检测浏览器环境
  const userAgent = navigator.userAgent;
  const isInApp = userAgent.includes('MicroMessenger') || 
                  userAgent.includes('TikTok') || 
                  userAgent.includes('musical_ly') ||
                  userAgent.includes('QQ/') ||
                  userAgent.includes('Weibo');
  
  console.log('🌐 Enhanced fetch request:', { url, isInApp, userAgent: userAgent.substring(0, 50) });
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 使用已经被polyfill增强的fetch
      const response = await fetch(url, {
        ...options,
        // 确保headers正确设置
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          ...options.headers,
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ Enhanced fetch successful on attempt ${attempt}`);
      return response;
      
    } catch (error) {
      console.warn(`❌ Enhanced fetch attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 等待后重试
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
    }
  }
  
  throw new Error('Enhanced fetch failed after all retries');
};

/**
 * 浏览器环境检测
 */
export const detectBrowserEnvironment = () => {
  const userAgent = navigator.userAgent;
  
  const environment = {
    isWeChat: userAgent.includes('MicroMessenger'),
    isTikTok: userAgent.includes('TikTok') || userAgent.includes('musical_ly'),
    isQQ: userAgent.includes('QQ/'),
    isWeibo: userAgent.includes('Weibo'),
    isSafari: userAgent.includes('Safari') && !userAgent.includes('Chrome'),
    isChrome: userAgent.includes('Chrome') && !userAgent.includes('Edg'),
    isEdge: userAgent.includes('Edg'),
    isFirefox: userAgent.includes('Firefox'),
    isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent),
    isInApp: false
  };
  
  environment.isInApp = environment.isWeChat || environment.isTikTok || environment.isQQ || environment.isWeibo;
  
  return environment;
};

/**
 * 兼容性检查
 */
export const checkCompatibility = () => {
  const features = {
    fetch: typeof fetch !== 'undefined',
    crypto: typeof crypto !== 'undefined',
    cryptoRandomUUID: typeof crypto?.randomUUID === 'function',
    localStorage: (() => {
      try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    })(),
    sessionStorage: (() => {
      try {
        const test = '__test__';
        sessionStorage.setItem(test, test);
        sessionStorage.removeItem(test);
        return true;
      } catch (e) {
        return false;
      }
    })(),
    promise: typeof Promise !== 'undefined',
    url: typeof URL !== 'undefined'
  };
  
  const environment = detectBrowserEnvironment();
  
  console.log('🔍 Compatibility check:', { features, environment });
  
  return { features, environment };
};

// 导出兼容的API，保持向后兼容
export const safeSessionStorage = enhancedStorage.session;
export const safeLocalStorage = enhancedStorage.local;
export const safeFetch = enhancedFetch;
export const getBrowserInfo = () => {
  const env = detectBrowserEnvironment();
  if (env.isWeChat) return 'WeChat';
  if (env.isTikTok) return 'TikTok';
  if (env.isQQ) return 'QQ';
  if (env.isChrome) return 'Chrome';
  if (env.isFirefox) return 'Firefox';
  if (env.isSafari) return 'Safari';
  if (env.isEdge) return 'Edge';
  return 'Unknown';
};