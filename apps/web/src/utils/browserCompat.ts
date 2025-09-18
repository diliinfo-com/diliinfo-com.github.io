// 跨浏览器兼容性工具

// 内存存储作为fallback
const memoryStorage: { [key: string]: string } = {};

/**
 * 生成UUID - 兼容所有浏览器
 */
export const generateUUID = (): string => {
  // 优先使用现代浏览器的 crypto.randomUUID()
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    try {
      return crypto.randomUUID();
    } catch (e) {
      console.warn('crypto.randomUUID() failed, using fallback');
    }
  }
  
  // 尝试使用 crypto.getRandomValues()
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    try {
      const array = new Uint8Array(16);
      crypto.getRandomValues(array);
      
      // 设置版本位
      array[6] = (array[6] & 0x0f) | 0x40;
      array[8] = (array[8] & 0x3f) | 0x80;
      
      const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32)
      ].join('-');
    } catch (e) {
      console.warn('crypto.getRandomValues() failed, using Math.random fallback');
    }
  }
  
  // 最后的fallback: 使用 Math.random() 生成UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * 安全的 sessionStorage 操作 - 带内存fallback
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    // 首先尝试sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const value = sessionStorage.getItem(key);
        if (value !== null) return value;
      }
    } catch (e) {
      console.warn('sessionStorage.getItem failed:', e);
    }
    
    // fallback到内存存储
    return memoryStorage[`session_${key}`] || null;
  },
  
  setItem: (key: string, value: string): boolean => {
    let success = false;
    
    // 首先尝试sessionStorage
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(key, value);
        success = true;
      }
    } catch (e) {
      console.warn('sessionStorage.setItem failed:', e);
    }
    
    // 总是同时保存到内存存储作为backup
    try {
      memoryStorage[`session_${key}`] = value;
      success = true;
    } catch (e) {
      console.warn('Memory storage failed:', e);
    }
    
    return success;
  },
  
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('sessionStorage.removeItem failed:', e);
    }
    
    // 同时从内存存储中删除
    delete memoryStorage[`session_${key}`];
  }
};

/**
 * 安全的 localStorage 操作
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    // 首先尝试localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const value = localStorage.getItem(key);
        if (value !== null) return value;
      }
    } catch (e) {
      console.warn('localStorage.getItem failed:', e);
    }
    
    // fallback到内存存储
    return memoryStorage[`local_${key}`] || null;
  },
  
  setItem: (key: string, value: string): boolean => {
    let success = false;
    
    // 首先尝试localStorage
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        success = true;
      }
    } catch (e) {
      console.warn('localStorage.setItem failed:', e);
    }
    
    // 总是同时保存到内存存储作为backup
    try {
      memoryStorage[`local_${key}`] = value;
      success = true;
    } catch (e) {
      console.warn('Memory storage failed:', e);
    }
    
    return success;
  },
  
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('localStorage.removeItem failed:', e);
    }
    
    // 同时从内存存储中删除
    delete memoryStorage[`local_${key}`];
  }
};

/**
 * XMLHttpRequest实现 - 内置浏览器的可靠选择
 */
const makeXHRRequest = (url: string, options: RequestInit = {}): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = (options.method || 'GET').toUpperCase();
    
    // 配置请求
    xhr.open(method, url, true);
    
    // 设置超时
    xhr.timeout = 30000; // 30秒超时
    
    // 设置headers
    const headers = options.headers as Record<string, string> || {};
    Object.entries(headers).forEach(([key, value]) => {
      if (value && key.toLowerCase() !== 'content-length') {
        try {
          xhr.setRequestHeader(key, value);
        } catch (e) {
          console.warn(`Failed to set header ${key}:`, e);
        }
      }
    });
    
    // 处理响应
    xhr.onload = () => {
      const responseHeaders = new Headers();
      
      // 解析响应头 - 使用简单的换行符分割
      const headerString = xhr.getAllResponseHeaders();
      if (headerString) {
        const lines = headerString.split('\n');
        lines.forEach(line => {
          const trimmedLine = line.trim();
          const parts = trimmedLine.split(': ');
          if (parts.length === 2) {
            responseHeaders.append(parts[0], parts[1]);
          }
        });
      }
      
      // 创建Response对象
      const response = new Response(xhr.responseText, {
        status: xhr.status,
        statusText: xhr.statusText,
        headers: responseHeaders
      });
      
      console.log('✅ XMLHttpRequest successful:', xhr.status);
      resolve(response);
    };
    
    xhr.onerror = () => {
      console.error('❌ XMLHttpRequest network error');
      reject(new Error('Network request failed'));
    };
    
    xhr.ontimeout = () => {
      console.error('❌ XMLHttpRequest timeout');
      reject(new Error('Request timeout'));
    };
    
    // 发送请求
    try {
      const body = options.body;
      xhr.send(body as string || null);
      console.log('📤 XMLHttpRequest sent');
    } catch (error) {
      console.error('❌ XMLHttpRequest send failed:', error);
      reject(error);
    }
  });
};

/**
 * 兼容的fetch函数 - 支持所有浏览器，包括内置浏览器
 */
export const safeFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const browserInfo = getBrowserInfo();
  const userAgent = navigator.userAgent;
  const isWechat = userAgent.includes('MicroMessenger');
  const isTiktok = userAgent.includes('TikTok') || userAgent.includes('musical_ly');
  const isInApp = isWechat || isTiktok || userAgent.includes('QQ/') || userAgent.includes('Weibo');
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  console.log('🌐 Making request with browser:', browserInfo, { isInApp, isMobile });
  
  // 对于内置浏览器，优先使用XMLHttpRequest
  if (isInApp || (isMobile && browserInfo.name === 'Safari')) {
    console.log('📱 Using XMLHttpRequest for in-app/mobile browser');
    return makeXHRRequest(url, options);
  }
  
  // 尝试原生fetch，如果失败则降级到XHR
  try {
    const enhancedOptions: RequestInit = {
      ...options,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit', // 避免内置浏览器的credentials问题
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        ...options.headers,
      }
    };
    
    console.log('🚀 Trying native fetch...');
    const response = await fetch(url, enhancedOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Native fetch successful');
    return response;
    
  } catch (error) {
    console.warn('⚠️ Native fetch failed, trying XMLHttpRequest fallback:', error);
    return makeXHRRequest(url, options);
  }
};

/**
 * 检测浏览器类型和环境
 */
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  
  let browser = 'Unknown';
  let isInApp = false;
  
  if (userAgent.includes('MicroMessenger')) {
    browser = 'WeChat';
    isInApp = true;
  } else if (userAgent.includes('TikTok') || userAgent.includes('musical_ly')) {
    browser = 'TikTok';
    isInApp = true;
  } else if (userAgent.includes('QQ/')) {
    browser = 'QQ';
    isInApp = true;
  } else if (userAgent.includes('Weibo')) {
    browser = 'Weibo';
    isInApp = true;
  } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    browser = 'Safari';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  }
  
  return {
    name: browser,
    isMobile,
    isInApp,
    userAgent: userAgent.substring(0, 100) // 截取前100字符避免过长
  };
};

/**
 * 检查存储可用性
 */
export const checkStorageAvailability = () => {
  const testKey = '__storage_test__';
  const testValue = 'test';
  
  const sessionAvailable = (() => {
    try {
      if (typeof window === 'undefined' || !window.sessionStorage) return false;
      sessionStorage.setItem(testKey, testValue);
      const retrieved = sessionStorage.getItem(testKey);
      sessionStorage.removeItem(testKey);
      return retrieved === testValue;
    } catch (e) {
      return false;
    }
  })();
  
  const localAvailable = (() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return retrieved === testValue;
    } catch (e) {
      return false;
    }
  })();
  
  const browserInfo = getBrowserInfo();
  
  return {
    sessionStorage: sessionAvailable,
    localStorage: localAvailable,
    browser: browserInfo.name,
    isMobile: browserInfo.isMobile,
    isInApp: browserInfo.isInApp,
    memoryFallback: !sessionAvailable && !localAvailable
  };
};

/**
 * 初始化浏览器兼容性 - 在应用启动时调用
 */
export const initBrowserCompat = () => {
  const storageInfo = checkStorageAvailability();
  const browserInfo = getBrowserInfo();
  
  console.log('🔧 Browser Compatibility Initialized');
  console.log('📱 Browser Info:', browserInfo);
  console.log('💾 Storage Info:', storageInfo);
  
  // 如果是内置浏览器，给出特殊提示
  if (browserInfo.isInApp) {
    console.log('⚠️ Detected in-app browser, using enhanced compatibility mode');
  }
  
  // 如果存储不可用，警告用户
  if (storageInfo.memoryFallback) {
    console.warn('⚠️ Browser storage not available, using memory fallback');
  }
  
  return {
    browserInfo,
    storageInfo
  };
};