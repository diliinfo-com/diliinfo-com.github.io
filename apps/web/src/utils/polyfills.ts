/**
 * 浏览器兼容性 Polyfills
 * 为旧版本浏览器提供现代API支持
 */

import 'core-js/stable';
import 'regenerator-runtime/runtime';
import smoothscroll from 'smoothscroll-polyfill';

// 初始化平滑滚动 polyfill
smoothscroll.polyfill();

// crypto.randomUUID polyfill
if (!window.crypto?.randomUUID) {
  if (!window.crypto) {
    (window as any).crypto = {};
  }
  
  (window.crypto as any).randomUUID = function(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

// AbortController polyfill
if (!window.AbortController) {
  class AbortController {
    signal: AbortSignal;
    
    constructor() {
      this.signal = new AbortSignal();
    }
    
    abort() {
      (this.signal as any).aborted = true;
      (this.signal as any).dispatchEvent(new Event('abort'));
    }
  }
  
  class AbortSignal extends EventTarget {
    aborted = false;
    
    static abort() {
      const signal = new AbortSignal();
      (signal as any).aborted = true;
      return signal;
    }
  }
  
  (window as any).AbortController = AbortController;
  (window as any).AbortSignal = AbortSignal;
}

// fetch polyfill 增强
const originalFetch = window.fetch;
if (originalFetch) {
  (window as any).fetch = function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // 为Safari添加默认的credentials设置
    const enhancedInit: RequestInit = {
      credentials: 'same-origin',
      ...init
    };
    
    // 处理AbortController兼容性
    if (enhancedInit.signal && !(enhancedInit.signal as any).aborted) {
      return originalFetch(input, enhancedInit);
    }
    
    return originalFetch(input, enhancedInit);
  };
}

// Array.prototype.includes polyfill
if (!Array.prototype.includes) {
  Array.prototype.includes = function<T>(this: T[], searchElement: T, fromIndex?: number): boolean {
    return this.indexOf(searchElement, fromIndex) !== -1;
  };
}

// Array.prototype.flat polyfill
if (!Array.prototype.flat) {
  Array.prototype.flat = function<T>(this: T[], depth = 1): T[] {
    const flatten = (arr: any[], d: number): any[] => {
      return d > 0 ? arr.reduce((acc, val) => 
        acc.concat(Array.isArray(val) ? flatten(val, d - 1) : val), []) : arr.slice();
    };
    return flatten(this, depth);
  };
}

// Array.prototype.flatMap polyfill
if (!Array.prototype.flatMap) {
  Array.prototype.flatMap = function<T, U>(
    this: T[],
    callback: (value: T, index: number, array: T[]) => U | U[],
    thisArg?: any
  ): U[] {
    return this.map(callback, thisArg).flat(1) as U[];
  };
}

// Object.entries polyfill
if (!Object.entries) {
  Object.entries = function<T>(obj: { [key: string]: T }): [string, T][] {
    const keys = Object.keys(obj);
    const result: [string, T][] = [];
    for (let i = 0; i < keys.length; i++) {
      result.push([keys[i], obj[keys[i]]]);
    }
    return result;
  };
}

// Object.values polyfill
if (!Object.values) {
  Object.values = function<T>(obj: { [key: string]: T }): T[] {
    const keys = Object.keys(obj);
    const result: T[] = [];
    for (let i = 0; i < keys.length; i++) {
      result.push(obj[keys[i]]);
    }
    return result;
  };
}

// String.prototype.padStart polyfill
if (!String.prototype.padStart) {
  String.prototype.padStart = function(targetLength: number, padString = ' '): string {
    if (this.length >= targetLength) {
      return String(this);
    }
    
    targetLength = targetLength - this.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length);
    }
    
    return padString.slice(0, targetLength) + String(this);
  };
}

// String.prototype.padEnd polyfill
if (!String.prototype.padEnd) {
  String.prototype.padEnd = function(targetLength: number, padString = ' '): string {
    if (this.length >= targetLength) {
      return String(this);
    }
    
    targetLength = targetLength - this.length;
    if (targetLength > padString.length) {
      padString += padString.repeat(targetLength / padString.length);
    }
    
    return String(this) + padString.slice(0, targetLength);
  };
}

// Promise.finally polyfill
if (!Promise.prototype.finally) {
  Promise.prototype.finally = function<T>(this: Promise<T>, onFinally?: (() => void) | null): Promise<T> {
    return this.then(
      (value) => Promise.resolve(onFinally?.()).then(() => value),
      (reason) => Promise.resolve(onFinally?.()).then(() => { throw reason; })
    );
  };
}

// IntersectionObserver polyfill 简化版
if (!window.IntersectionObserver) {
  class IntersectionObserver {
    private callback: IntersectionObserverCallback;
    private elements: Element[] = [];
    
    constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
      this.callback = callback;
    }
    
    observe(element: Element): void {
      this.elements.push(element);
      // 简化实现：立即触发回调
      setTimeout(() => {
        this.callback([{
          target: element,
          isIntersecting: true,
          intersectionRatio: 1,
          boundingClientRect: element.getBoundingClientRect(),
          rootBounds: null,
          intersectionRect: element.getBoundingClientRect(),
          time: Date.now()
        }], this);
      }, 0);
    }
    
    unobserve(element: Element): void {
      const index = this.elements.indexOf(element);
      if (index > -1) {
        this.elements.splice(index, 1);
      }
    }
    
    disconnect(): void {
      this.elements = [];
    }
  }
  
  (window as any).IntersectionObserver = IntersectionObserver;
}

// ResizeObserver polyfill 简化版
if (!window.ResizeObserver) {
  class ResizeObserver {
    private callback: ResizeObserverCallback;
    private elements: Element[] = [];
    
    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
    }
    
    observe(element: Element): void {
      this.elements.push(element);
      // 简化实现：立即触发回调
      setTimeout(() => {
        this.callback([{
          target: element,
          contentRect: element.getBoundingClientRect(),
          borderBoxSize: [{ blockSize: 0, inlineSize: 0 }],
          contentBoxSize: [{ blockSize: 0, inlineSize: 0 }],
          devicePixelContentBoxSize: [{ blockSize: 0, inlineSize: 0 }]
        }], this);
      }, 0);
    }
    
    unobserve(element: Element): void {
      const index = this.elements.indexOf(element);
      if (index > -1) {
        this.elements.splice(index, 1);
      }
    }
    
    disconnect(): void {
      this.elements = [];
    }
  }
  
  (window as any).ResizeObserver = ResizeObserver;
}

// 修复Safari的Date构造函数问题
const originalDate = Date;
(window as any).Date = function(this: any, ...args: any[]) {
  if (args.length === 1 && typeof args[0] === 'string') {
    // 修复Safari对YYYY-MM-DD格式的解析问题
    const dateStr = args[0].replace(/-/g, '/');
    return new originalDate(dateStr);
  }
  return new originalDate(...args);
};

// 保持Date的静态方法
Object.setPrototypeOf(Date, originalDate);
Object.defineProperty(Date, 'prototype', {
  value: originalDate.prototype,
  writable: false
});

// 初始化浏览器兼容性修复
export const initBrowserCompatibility = (): void => {
  console.log('浏览器兼容性 Polyfills 已加载');
};

// 自动初始化
initBrowserCompatibility();