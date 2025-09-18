// 跨浏览器兼容性工具 - 专为移动端和内置浏览器优化

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
 * 移动端优化的XMLHttpRequest实现
 */
const makeMobileXHRRequest = (url: string, options: RequestInit = {}): Promise<Response> => {
  return new Promise((resolve, reject) => {
    console.log(`🔄 Mobile XHR: ${options.method || 'GET'} ${url}`);
    
    const xhr = new XMLHttpRequest();
    const method = (options.method || 'GET').toUpperCase();
    
    // 超时设置 - 移动端网络较慢
    const timeoutMs = 90000; // 90秒
    let timeoutId: NodeJS.Timeout;
    
    // 手动超时控制
    timeoutId = setTimeout(() => {
      xhr.abort();
      console.error('❌ Manual timeout after 90s');
      reject(new Error('Request timeout'));
    }, timeoutMs);
    
    try {
      // 配置请求
      xhr.open(method, url, true);
      
      // 移动端兼容性设置
      xhr.timeout = timeoutMs;
      
      // 设置必要的请求头
      try {
        // 基础headers
        xhr.setRequestHeader('Accept', 'application/json, text/plain, */*');
        
        // 如果是POST请求，设置Content-Type
        if (method === 'POST' && options.body) {
          xhr.setRequestHeader('Content-Type', 'application/json');
        }
        
        // 禁用缓存
        xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        xhr.setRequestHeader('Pragma', 'no-cache');
        xhr.setRequestHeader('Expires', '0');
        
        // 添加自定义headers
        const customHeaders = options.headers as Record<string, string> || {};
        Object.entries(customHeaders).forEach(([key, value]) => {
          if (value && key.toLowerCase() !== 'content-length') {
            try {
              xhr.setRequestHeader(key, value);
              console.log(`📋 Header: ${key}: ${value}`);
            } catch (e) {
              console.warn(`⚠️ Header failed: ${key}`, e);
            }
          }
        });
      } catch (headerError) {
        console.warn('⚠️ Header setup error:', headerError);
      }
      
      // 状态变化处理
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          clearTimeout(timeoutId);
          
          console.log(`📥 XHR Complete: ${xhr.status} ${xhr.statusText}`);
          
          // 检查状态
          if (xhr.status === 0) {
            console.error('❌ Network error or blocked request');
            reject(new Error('Network error - request was blocked or failed'));
            return;
          }
          
          try {
            const responseText = xhr.responseText || '';
            console.log(`📄 Response length: ${responseText.length}`);
            
            // 创建兼容的Response对象
            const mockResponse = {
              ok: xhr.status >= 200 && xhr.status < 300,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Headers(),
              url: url,
              
              text: () => Promise.resolve(responseText),
              
              json: () => {
                try {
                  if (!responseText.trim()) {
                    return Promise.resolve({});
                  }
                  const parsed = JSON.parse(responseText);
                  return Promise.resolve(parsed);
                } catch (e) {
                  console.error('❌ JSON parse error:', e);
                  return Promise.reject(new Error(`Invalid JSON: ${e.message}`));
                }
              },
              
              blob: () => Promise.resolve(new Blob([responseText])),
              arrayBuffer: () => Promise.resolve(new ArrayBuffer(0))
            } as Response;
            
            if (mockResponse.ok) {
              console.log('✅ XHR Success');
              resolve(mockResponse);
            } else {
              console.error(`❌ XHR HTTP Error: ${xhr.status}`);
              reject(new Error(`HTTP ${xhr.status}: ${xhr.statusText}`));
            }
          } catch (error) {
            console.error('❌ Response processing error:', error);
            reject(error);
          }
        }
      };
      
      // 错误处理
      xhr.onerror = (event) => {
        clearTimeout(timeoutId);
        console.error('❌ XHR Network error:', event);
        reject(new Error('Network request failed'));
      };
      
      xhr.ontimeout = () => {
        clearTimeout(timeoutId);
        console.error('❌ XHR Timeout');
        reject(new Error('Request timeout'));
      };
      
      xhr.onabort = () => {
        clearTimeout(timeoutId);
        console.error('❌ XHR Aborted');
        reject(new Error('Request aborted'));
      };
      
      // 发送请求
      const body = options.body;
      if (body) {
        console.log('📤 Sending with body:', typeof body);
        xhr.send(body as string);
      } else {
        console.log('📤 Sending without body');
        xhr.send();
      }
      
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('❌ XHR Setup error:', error);
      reject(error);
    }
  });
};

/**
 * 兼容的fetch函数 - 专为移动端优化
 */
export const safeFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const browserInfo = getBrowserInfo();
  const userAgent = navigator.userAgent.toLowerCase();
  
  // 检测各种移动端和内置浏览器
  const isWeChat = userAgent.includes('micromessenger');
  const isTikTok = userAgent.includes('tiktok') || userAgent.includes('musical_ly');
  const isQQ = userAgent.includes('qq/');
  const isWeibo = userAgent.includes('weibo');
  const isSafariMobile = userAgent.includes('safari') && userAgent.includes('mobile');
  const isInApp = isWeChat || isTikTok || isQQ || isWeibo;
  const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  console.log('🌐 Request Info:', {
    browser: browserInfo.name,
    isInApp,
    isMobile,
    isSafariMobile,
    url: url.substring(0, 100)
  });
  
  // 对于移动端和内置浏览器，直接使用XHR
  if (isMobile || isInApp || isSafariMobile) {
    console.log('📱 Using mobile-optimized XHR');
    return makeMobileXHRRequest(url, options);
  }
  
  // 桌面端尝试原生fetch，失败则降级
  try {
    console.log('🖥️ Trying native fetch for desktop');
    
    const enhancedOptions: RequestInit = {
      ...options,
      mode: 'cors',
      cache: 'no-cache',
      credentials: 'omit',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...options.headers,
      }
    };
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60秒超时
    
    const response = await fetch(url, {
      ...enhancedOptions,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    console.log('✅ Native fetch success');
    return response;
    
  } catch (error) {
    console.warn('⚠️ Native fetch failed, using XHR fallback:', error);
    return makeMobileXHRRequest(url, options);
  }
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