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
 * 兼容的fetch函数 - 支持所有浏览器
 */
export const safeFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // 检测是否在微信、抖音等内置浏览器中
  const userAgent = navigator.userAgent;
  const isWechat = userAgent.includes('MicroMessenger');
  const isTiktok = userAgent.includes('TikTok') || userAgent.includes('musical_ly');
  const isInApp = isWechat || isTiktok || userAgent.includes('QQ/') || userAgent.includes('Weibo');
  
  // 为内置浏览器添加特殊处理
  const enhancedOptions: RequestInit = {
    ...options,
    // 确保请求模式兼容
    mode: isInApp ? 'cors' : (options.mode || 'cors'),
    // 添加缓存控制
    cache: options.cache || 'no-cache',
    // 确保credentials设置
    credentials: options.credentials || 'same-origin',
    // 增强headers
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      ...options.headers,
    }
  };
  
  // 添加重试机制
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      console.log(`🌐 Fetch attempt ${attempt + 1} to:`, url);
      
      const response = await fetch(url, enhancedOptions);
      
      // 检查响应状态
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      console.log(`✅ Fetch successful on attempt ${attempt + 1}`);
      return response;
      
    } catch (error) {
      lastError = error as Error;
      console.warn(`❌ Fetch attempt ${attempt + 1} failed:`, error);
      
      // 如果是最后一次尝试，抛出错误
      if (attempt === 2) {
        throw lastError;
      }
      
      // 等待一段时间后重试
      await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
  
  throw lastError || new Error('Fetch failed after 3 attempts');
};

/**
 * 检测浏览器类型
 */
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('MicroMessenger')) {
    return 'WeChat';
  } else if (userAgent.includes('TikTok') || userAgent.includes('musical_ly')) {
    return 'TikTok';
  } else if (userAgent.includes('QQ/')) {
    return 'QQ';
  } else if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
    return 'Chrome';
  } else if (userAgent.includes('Firefox')) {
    return 'Firefox';
  } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
    return 'Safari';
  } else if (userAgent.includes('Edg')) {
    return 'Edge';
  }
  
  return 'Unknown';
};

/**
 * 检查存储可用性
 */
export const checkStorageAvailability = () => {
  const testKey = '__storage_test__';
  const testValue = 'test';
  
  const sessionAvailable = (() => {
    try {
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
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return retrieved === testValue;
    } catch (e) {
      return false;
    }
  })();
  
  return {
    sessionStorage: sessionAvailable,
    localStorage: localAvailable,
    browser: getBrowserInfo()
  };
};