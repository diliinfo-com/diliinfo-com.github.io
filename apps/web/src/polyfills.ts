// 核心polyfills - 确保所有浏览器兼容性
import 'core-js/stable';
import 'whatwg-fetch';
import 'es6-promise/auto';

// 手动polyfill crypto.randomUUID (Safari < 15.4, 微信浏览器等)
if (!globalThis.crypto) {
  globalThis.crypto = {} as Crypto;
}

if (!globalThis.crypto.randomUUID) {
  globalThis.crypto.randomUUID = function(): string {
    // 使用crypto.getRandomValues如果可用
    if (globalThis.crypto.getRandomValues) {
      const array = new Uint8Array(16);
      globalThis.crypto.getRandomValues(array);
      
      // 设置版本位 (version 4)
      array[6] = (array[6] & 0x0f) | 0x40;
      // 设置变体位
      array[8] = (array[8] & 0x3f) | 0x80;
      
      const hex = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
      return [
        hex.slice(0, 8),
        hex.slice(8, 12),
        hex.slice(12, 16),
        hex.slice(16, 20),
        hex.slice(20, 32)
      ].join('-');
    }
    
    // 最终fallback使用Math.random
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

// polyfill crypto.getRandomValues (非常老的浏览器)
if (!globalThis.crypto.getRandomValues) {
  globalThis.crypto.getRandomValues = function<T extends ArrayBufferView | null>(array: T): T {
    if (!array) return array;
    
    const bytes = new Uint8Array(array.buffer, array.byteOffset, array.byteLength);
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
    return array;
  };
}

// Storage polyfill for 隐私模式/内置浏览器
const createStoragePolyfill = () => {
  const storage: { [key: string]: string } = {};
  
  return {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = String(value); },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
    get length() { return Object.keys(storage).length; },
    key: (index: number) => Object.keys(storage)[index] || null
  };
};

// 检测并polyfill localStorage
try {
  const testKey = '__localStorage_test__';
  localStorage.setItem(testKey, 'test');
  localStorage.removeItem(testKey);
} catch (e) {
  console.warn('localStorage不可用，使用polyfill');
  (globalThis as any).localStorage = createStoragePolyfill();
}

// 检测并polyfill sessionStorage
try {
  const testKey = '__sessionStorage_test__';
  sessionStorage.setItem(testKey, 'test');
  sessionStorage.removeItem(testKey);
} catch (e) {
  console.warn('sessionStorage不可用，使用polyfill');
  (globalThis as any).sessionStorage = createStoragePolyfill();
}

// Fetch polyfill增强 - 处理内置浏览器的特殊情况
const originalFetch = globalThis.fetch;
globalThis.fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // 检测浏览器环境
  const userAgent = navigator.userAgent;
  const isInApp = userAgent.includes('MicroMessenger') || 
                  userAgent.includes('TikTok') || 
                  userAgent.includes('musical_ly') ||
                  userAgent.includes('QQ/') ||
                  userAgent.includes('Weibo');
  
  // 为内置浏览器优化请求配置
  const enhancedInit: RequestInit = {
    ...init,
    // 确保CORS模式
    mode: isInApp ? 'cors' : (init?.mode || 'cors'),
    // 禁用缓存避免内置浏览器缓存问题
    cache: init?.cache || 'no-cache',
    // 设置合适的credentials
    credentials: init?.credentials || 'omit',
    // 增强headers
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      // 避免预检请求的问题
      'X-Requested-With': undefined,
      ...init?.headers,
    }
  };
  
  // 移除可能导致预检请求失败的headers
  if (isInApp && enhancedInit.headers) {
    const headers = enhancedInit.headers as Record<string, any>;
    delete headers['X-Requested-With'];
  }
  
  return originalFetch(input, enhancedInit);
};

// Promise polyfill确保 (虽然core-js已经包含，但确保加载)
if (!globalThis.Promise) {
  console.error('Promise polyfill failed to load');
}

// 确保URL构造函数可用
if (!globalThis.URL) {
  console.warn('URL constructor not available');
}

console.log('🔧 Polyfills loaded successfully');
console.log('📱 Browser:', navigator.userAgent);
console.log('💾 Storage available:', {
  localStorage: !!globalThis.localStorage,
  sessionStorage: !!globalThis.sessionStorage,
  crypto: !!globalThis.crypto,
  fetch: !!globalThis.fetch
});