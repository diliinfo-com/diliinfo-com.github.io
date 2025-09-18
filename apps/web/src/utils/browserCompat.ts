// 跨浏览器兼容性工具

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
  
  // Fallback: 使用 Math.random() 生成UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * 安全的 sessionStorage 操作
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        return sessionStorage.getItem(key);
      }
    } catch (e) {
      console.warn('sessionStorage.getItem failed:', e);
    }
    return null;
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      console.warn('sessionStorage.setItem failed:', e);
    }
    return false;
  },
  
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('sessionStorage.removeItem failed:', e);
    }
  }
};

/**
 * 安全的 localStorage 操作
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (e) {
      console.warn('localStorage.getItem failed:', e);
    }
    return null;
  },
  
  setItem: (key: string, value: string): boolean => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
        return true;
      }
    } catch (e) {
      console.warn('localStorage.setItem failed:', e);
    }
    return false;
  },
  
  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (e) {
      console.warn('localStorage.removeItem failed:', e);
    }
  }
};

/**
 * 检测浏览器类型
 */
export const getBrowserInfo = () => {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
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