/**
 * 轻量级Safari兼容性修复
 * 只修复核心功能，不影响UI
 */

// 安全的localStorage包装器
export const safeLocalStorage = {
  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('localStorage不可用，数据将在页面刷新后丢失');
      // 使用内存存储作为降级
      (window as any).__memoryStorage = (window as any).__memoryStorage || {};
      (window as any).__memoryStorage[key] = value;
      return false;
    }
  },

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      // 从内存存储读取
      const memStorage = (window as any).__memoryStorage || {};
      return memStorage[key] || null;
    }
  },

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      const memStorage = (window as any).__memoryStorage || {};
      delete memStorage[key];
    }
  }
};

// 安全的sessionStorage包装器
export const safeSessionStorage = {
  setItem(key: string, value: string): boolean {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('sessionStorage不可用，数据将在页面刷新后丢失');
      // 使用内存存储作为降级
      (window as any).__sessionMemoryStorage = (window as any).__sessionMemoryStorage || {};
      (window as any).__sessionMemoryStorage[key] = value;
      return false;
    }
  },

  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      // 从内存存储读取
      const memStorage = (window as any).__sessionMemoryStorage || {};
      return memStorage[key] || null;
    }
  },

  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      const memStorage = (window as any).__sessionMemoryStorage || {};
      delete memStorage[key];
    }
  }
};

// 修复Safari的Date解析问题
export const safeDateParse = (dateStr: string): Date => {
  // Safari对YYYY-MM-DD格式有问题，转换为YYYY/MM/DD
  const normalizedDateStr = dateStr.replace(/-/g, '/');
  return new Date(normalizedDateStr);
};

// 检测浏览器类型
export const browserInfo = {
  isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
  isWeChat: /MicroMessenger/i.test(navigator.userAgent),
  isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
};

// 初始化轻量级兼容性修复
export const initSafariCompat = (): void => {
  // 只在Safari中添加必要的修复
  if (browserInfo.isSafari) {
    console.log('Safari兼容性修复已启用');
    
    // 添加Safari标识类，但不影响现有样式
    document.documentElement.classList.add('safari-browser');
  }
  
  if (browserInfo.isIOS) {
    document.documentElement.classList.add('ios-device');
  }
  
  if (browserInfo.isWeChat) {
    document.documentElement.classList.add('wechat-browser');
  }
  
  if (browserInfo.isMobile) {
    document.documentElement.classList.add('mobile-device');
  }
};