// Safari和移动端浏览器兼容性polyfills

// 检查并添加必要的polyfills
export const initPolyfills = (): void => {
  // 1. Promise polyfill (for very old browsers)
  if (!window.Promise) {
    console.warn('Promise not supported, loading polyfill...');
    // 在实际项目中，你可能需要加载一个Promise polyfill
  }

  // 2. Fetch polyfill (for IE and some old mobile browsers)
  if (!window.fetch) {
    console.warn('Fetch not supported, using XMLHttpRequest fallback...');
    // 简单的fetch polyfill
    window.fetch = fetchPolyfill;
  }

  // 3. crypto.randomUUID polyfill (Safari < 15.4)
  if (!crypto.randomUUID) {
    crypto.randomUUID = function() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }

  // 4. AbortController polyfill (Safari < 11.1)
  if (!window.AbortController) {
    window.AbortController = class AbortController {
      signal: any;
      constructor() {
        this.signal = {
          aborted: false,
          addEventListener: () => {},
          removeEventListener: () => {},
        };
      }
      abort() {
        this.signal.aborted = true;
      }
    };
  }

  // 5. sessionStorage fallback
  if (!window.sessionStorage) {
    console.warn('sessionStorage not supported, using memory fallback...');
    const memoryStorage: { [key: string]: string } = {};
    window.sessionStorage = {
      getItem: (key: string) => memoryStorage[key] || null,
      setItem: (key: string, value: string) => { memoryStorage[key] = value; },
      removeItem: (key: string) => { delete memoryStorage[key]; },
      clear: () => { Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]); },
      length: 0,
      key: () => null
    };
  }
};

// 简单的fetch polyfill使用XMLHttpRequest
const fetchPolyfill = (url: string, options: RequestInit = {}): Promise<Response> => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const method = options.method || 'GET';
    
    xhr.open(method, url, true);
    
    // 设置headers
    if (options.headers) {
      const headers = options.headers as Record<string, string>;
      Object.keys(headers).forEach(key => {
        xhr.setRequestHeader(key, headers[key]);
      });
    }
    
    // 设置超时
    xhr.timeout = 30000;
    
    xhr.onload = () => {
      const response = {
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
        statusText: xhr.statusText,
        headers: {
          get: (name: string) => xhr.getResponseHeader(name)
        },
        json: () => Promise.resolve(JSON.parse(xhr.responseText)),
        text: () => Promise.resolve(xhr.responseText),
        blob: () => Promise.resolve(new Blob([xhr.response])),
      } as Response;
      
      resolve(response);
    };
    
    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Request timeout'));
    
    // 发送请求
    if (options.body) {
      xhr.send(options.body as string);
    } else {
      xhr.send();
    }
  });
};

// Safari特定修复
export const applySafariFixes = (): void => {
  // 修复Safari的日期解析问题
  const originalDateParse = Date.parse;
  Date.parse = function(dateString: string) {
    // Safari对ISO日期格式的支持有问题，进行格式转换
    if (typeof dateString === 'string' && dateString.includes('T')) {
      dateString = dateString.replace(/T/, ' ').replace(/Z$/, '');
    }
    return originalDateParse.call(this, dateString);
  };
};

// 微信浏览器特定修复
export const applyWechatFixes = (): void => {
  // 微信浏览器可能会拦截某些API调用
  // 这里可以添加特定的修复逻辑
  console.info('Applied WeChat browser compatibility fixes');
};

// 移动端优化
export const applyMobileOptimizations = (): void => {
  // 防止移动端的双击缩放
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // 优化移动端的滚动性能
  document.addEventListener('touchmove', (event) => {
    // 允许正常滚动，但防止过度滚动
  }, { passive: true });
};

// 检查浏览器特性支持
export const checkBrowserFeatures = (): { [key: string]: boolean } => {
  return {
    fetch: !!window.fetch,
    promise: !!window.Promise,
    crypto: !!window.crypto,
    randomUUID: !!(window.crypto && crypto.randomUUID),
    abortController: !!window.AbortController,
    sessionStorage: !!window.sessionStorage,
    localStorage: !!window.localStorage,
    webGL: !!window.WebGLRenderingContext,
    canvas: !!document.createElement('canvas').getContext,
    geolocation: !!navigator.geolocation,
    serviceWorker: 'serviceWorker' in navigator,
  };
};

// 主初始化函数
export const initBrowserCompatibility = (): void => {
  // 初始化polyfills
  initPolyfills();
  
  // 检测浏览器类型并应用相应修复
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    applySafariFixes();
    console.info('Safari compatibility fixes applied');
  }
  
  if (userAgent.includes('micromessenger')) {
    applyWechatFixes();
    console.info('WeChat browser compatibility fixes applied');
  }
  
  if (/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent)) {
    applyMobileOptimizations();
    console.info('Mobile browser optimizations applied');
  }
  
  // 输出浏览器特性支持情况
  const features = checkBrowserFeatures();
  console.info('Browser features support:', features);
};