// Browser detection utilities
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

// Safe storage wrapper with fallback to memory storage
class SafeStorage {
  private memoryStorage: Map<string, string> = new Map();
  private useMemory = false;

  constructor(private storageType: 'localStorage' | 'sessionStorage') {
    // Test if storage is available
    try {
      const storage = window[storageType];
      const testKey = '__storage_test__';
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
    } catch (e) {
      console.warn(`${storageType} not available, using memory storage`);
      this.useMemory = true;
    }
  }

  setItem(key: string, value: string): void {
    try {
      if (this.useMemory) {
        this.memoryStorage.set(key, value);
      } else {
        window[this.storageType].setItem(key, value);
      }
    } catch (e) {
      console.warn(`Failed to set ${key}, falling back to memory storage`);
      this.useMemory = true;
      this.memoryStorage.set(key, value);
    }
  }

  getItem(key: string): string | null {
    try {
      if (this.useMemory) {
        return this.memoryStorage.get(key) || null;
      } else {
        return window[this.storageType].getItem(key);
      }
    } catch (e) {
      console.warn(`Failed to get ${key}, falling back to memory storage`);
      this.useMemory = true;
      return this.memoryStorage.get(key) || null;
    }
  }

  removeItem(key: string): void {
    try {
      if (this.useMemory) {
        this.memoryStorage.delete(key);
      } else {
        window[this.storageType].removeItem(key);
      }
    } catch (e) {
      console.warn(`Failed to remove ${key}, falling back to memory storage`);
      this.useMemory = true;
      this.memoryStorage.delete(key);
    }
  }

  clear(): void {
    try {
      if (this.useMemory) {
        this.memoryStorage.clear();
      } else {
        window[this.storageType].clear();
      }
    } catch (e) {
      console.warn(`Failed to clear storage, falling back to memory storage`);
      this.useMemory = true;
      this.memoryStorage.clear();
    }
  }
}

// Export storage instances
export const safeStorage = new SafeStorage('localStorage');
export const safeSessionStorage = new SafeStorage('sessionStorage');

// Safe date parsing for Safari
export function safeDateParse(dateString: string): Date {
  // Safari has issues with certain date formats
  // Convert YYYY-MM-DD to MM/DD/YYYY for Safari compatibility
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    const [year, month, day] = dateString.split('-');
    return new Date(`${month}/${day}/${year}`);
  }
  return new Date(dateString);
}

// Array compatibility utilities
export const arrayCompat = {
  from: Array.from || function<T>(arrayLike: ArrayLike<T>): T[] {
    const result: T[] = [];
    for (let i = 0; i < arrayLike.length; i++) {
      result.push(arrayLike[i]);
    }
    return result;
  },
  
  find: function<T>(array: T[], predicate: (value: T, index: number, obj: T[]) => boolean): T | undefined {
    if (Array.prototype.find) {
      return array.find(predicate);
    }
    for (let i = 0; i < array.length; i++) {
      if (predicate(array[i], i, array)) {
        return array[i];
      }
    }
    return undefined;
  }
};

// Smooth scroll polyfill for Safari
export function smoothScroll(element: Element, options: ScrollIntoViewOptions = {}) {
  if ('scrollBehavior' in document.documentElement.style) {
    element.scrollIntoView({ behavior: 'smooth', ...options });
  } else {
    // Fallback for Safari
    element.scrollIntoView(options.block !== undefined ? { block: options.block } : true);
  }
}