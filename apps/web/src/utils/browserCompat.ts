/**
 * 浏览器兼容性检测和修复工具
 * 专门处理Safari和移动浏览器的兼容性问题
 */

// 浏览器检测
export const browserDetection = {
  isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
  isAndroid: /Android/.test(navigator.userAgent),
  isWeChat: /MicroMessenger/i.test(navigator.userAgent),
  
  getSafariVersion(): number | null {
    const match = navigator.userAgent.match(/Version\/(\d+)/);
    return match ? parseInt(match[1]) : null;
  },
  
  getIOSVersion(): number | null {
    const match = navigator.userAgent.match(/OS (\d+)_/);
    return match ? parseInt(match[1]) : null;
  }
};

// 安全的存储接口，处理Safari隐私模式问题
export const safeStorage = {
  memoryStorage: {} as Record<string, string>,
  
  setItem(key: string, value: string): boolean {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('localStorage不可用，使用内存存储:', e);
      this.memoryStorage[key] = value;
      return false;
    }
  },
  
  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('localStorage不可用，从内存存储读取:', e);
      return this.memoryStorage[key] || null;
    }
  },
  
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn('localStorage不可用，从内存存储删除:', e);
      delete this.memoryStorage[key];
    }
  },
  
  clear(): void {
    try {
      localStorage.clear();
    } catch (e) {
      console.warn('localStorage不可用，清空内存存储:', e);
      this.memoryStorage = {};
    }
  }
};

// 安全的sessionStorage接口
export const safeSessionStorage = {
  memoryStorage: {} as Record<string, string>,
  
  setItem(key: string, value: string): boolean {
    try {
      sessionStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn('sessionStorage不可用，使用内存存储:', e);
      this.memoryStorage[key] = value;
      return false;
    }
  },
  
  getItem(key: string): string | null {
    try {
      return sessionStorage.getItem(key);
    } catch (e) {
      console.warn('sessionStorage不可用，从内存存储读取:', e);
      return this.memoryStorage[key] || null;
    }
  },
  
  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (e) {
      console.warn('sessionStorage不可用，从内存存储删除:', e);
      delete this.memoryStorage[key];
    }
  },
  
  clear(): void {
    try {
      sessionStorage.clear();
    } catch (e) {
      console.warn('sessionStorage不可用，清空内存存储:', e);
      this.memoryStorage = {};
    }
  }
};

// 日期处理兼容性修复
export const safeDateParse = (dateStr: string): Date => {
  // 修复Safari对YYYY-MM-DD格式的解析问题
  const normalizedDateStr = dateStr.replace(/-/g, '/');
  return new Date(normalizedDateStr);
};

// 数组方法兼容性修复
export const arrayCompat = {
  includes<T>(array: T[], searchElement: T, fromIndex?: number): boolean {
    if (Array.prototype.includes) {
      return array.includes(searchElement, fromIndex);
    }
    // 兼容旧版本Safari
    return array.indexOf(searchElement, fromIndex) !== -1;
  },
  
  flat<T>(array: T[], depth = 1): T[] {
    if (Array.prototype.flat) {
      return (array as any).flat(depth);
    }
    // 简单的flat实现
    const flatten = (arr: any[], d: number): any[] => {
      return d > 0 ? arr.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? flatten(val, d - 1) : val), []) : arr.slice();
    };
    return flatten(array, depth);
  }
};

// 平滑滚动兼容性修复
export const smoothScroll = {
  scrollIntoView(element: Element, options?: ScrollIntoViewOptions): void {
    if ('scrollBehavior' in document.documentElement.style) {
      element.scrollIntoView(options);
    } else {
      // Safari兼容性回退
      element.scrollIntoView(options?.block !== undefined ? 
        { block: options.block, inline: options.inline } : true);
    }
  },
  
  scrollTo(options: ScrollToOptions): void {
    if ('scrollBehavior' in document.documentElement.style) {
      window.scrollTo(options);
    } else {
      // Safari兼容性回退
      window.scrollTo(options.left || 0, options.top || 0);
    }
  }
};

// 事件监听器兼容性修复
export const safeEventListener = {
  addEventListener(
    element: Element | Window | Document,
    type: string,
    listener: EventListener,
    options?: AddEventListenerOptions | boolean
  ): void {
    try {
      // 检测passive支持
      let supportsPassive = false;
      try {
        const opts = Object.defineProperty({}, 'passive', {
          get() {
            supportsPassive = true;
            return false;
          }
        });
        window.addEventListener('testPassive', () => {}, opts);
        window.removeEventListener('testPassive', () => {}, opts);
      } catch (e) {}
      
      if (typeof options === 'object' && options.passive && !supportsPassive) {
        // Safari 10以下不支持passive，降级为普通监听
        element.addEventListener(type, listener, false);
      } else {
        element.addEventListener(type, listener, options);
      }
    } catch (e) {
      console.warn('addEventListener失败:', e);
      // 最基本的兼容性回退
      element.addEventListener(type, listener, false);
    }
  }
};

// CSS特性检测
export const cssSupport = {
  supportsFlexGap(): boolean {
    const testElement = document.createElement('div');
    testElement.style.display = 'flex';
    testElement.style.gap = '1px';
    return testElement.style.gap === '1px';
  },
  
  supportsGridGap(): boolean {
    const testElement = document.createElement('div');
    testElement.style.display = 'grid';
    testElement.style.gap = '1px';
    return testElement.style.gap === '1px';
  },
  
  supportsCSSVariables(): boolean {
    return window.CSS && CSS.supports && CSS.supports('color', 'var(--test)');
  }
};

// 触摸事件兼容性处理
export const touchCompat = {
  preventDefaultIfNeeded(event: TouchEvent): void {
    // 在Safari中，某些情况下需要preventDefault来阻止默认行为
    if (browserDetection.isSafari || browserDetection.isIOS) {
      event.preventDefault();
    }
  },
  
  addTouchListeners(
    element: Element,
    handlers: {
      touchstart?: (e: TouchEvent) => void;
      touchmove?: (e: TouchEvent) => void;
      touchend?: (e: TouchEvent) => void;
    }
  ): void {
    if (handlers.touchstart) {
      safeEventListener.addEventListener(element, 'touchstart', handlers.touchstart, { passive: false });
    }
    if (handlers.touchmove) {
      safeEventListener.addEventListener(element, 'touchmove', handlers.touchmove, { passive: false });
    }
    if (handlers.touchend) {
      safeEventListener.addEventListener(element, 'touchend', handlers.touchend, { passive: false });
    }
  }
};

// 初始化兼容性修复
export const initBrowserCompat = (): void => {
  console.log('初始化浏览器兼容性修复...');
  console.log('浏览器信息:', {
    isSafari: browserDetection.isSafari,
    isIOS: browserDetection.isIOS,
    isAndroid: browserDetection.isAndroid,
    isWeChat: browserDetection.isWeChat,
    safariVersion: browserDetection.getSafariVersion(),
    iosVersion: browserDetection.getIOSVersion()
  });
  
  // 添加Safari特定的CSS类
  if (browserDetection.isSafari) {
    document.documentElement.classList.add('safari');
  }
  if (browserDetection.isIOS) {
    document.documentElement.classList.add('ios');
  }
  if (browserDetection.isWeChat) {
    document.documentElement.classList.add('wechat');
  }
  
  // 添加CSS特性检测类
  if (!cssSupport.supportsFlexGap()) {
    document.documentElement.classList.add('no-flex-gap');
  }
  if (!cssSupport.supportsGridGap()) {
    document.documentElement.classList.add('no-grid-gap');
  }
  if (!cssSupport.supportsCSSVariables()) {
    document.documentElement.classList.add('no-css-variables');
  }
  
  console.log('浏览器兼容性修复初始化完成');
};