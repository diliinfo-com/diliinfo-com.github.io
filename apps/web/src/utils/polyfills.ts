// Core polyfills for Safari and mobile browsers
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'es6-promise/auto';
import 'whatwg-fetch';

// UUID polyfill for older browsers
if (!window.crypto?.randomUUID) {
  window.crypto = window.crypto || {};
  (window.crypto as any).randomUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

// Array.from polyfill
if (!Array.from) {
  Array.from = function(arrayLike: any, mapFn?: any, thisArg?: any) {
    const items = Object(arrayLike);
    const len = parseInt(items.length) || 0;
    const result = new Array(len);
    let k = 0;
    while (k < len) {
      if (mapFn) {
        result[k] = mapFn.call(thisArg, items[k], k);
      } else {
        result[k] = items[k];
      }
      k++;
    }
    return result;
  };
}

// Object.assign polyfill
if (!Object.assign) {
  Object.assign = function(target: any, ...sources: any[]) {
    if (target == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }
    const to = Object(target);
    for (let index = 0; index < sources.length; index++) {
      const nextSource = sources[index];
      if (nextSource != null) {
        for (const nextKey in nextSource) {
          if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
            to[nextKey] = nextSource[nextKey];
          }
        }
      }
    }
    return to;
  };
}

// Fetch enhancements for Safari
const originalFetch = window.fetch;
window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
  // Add default headers for Safari compatibility
  const enhancedInit = {
    ...init,
    headers: {
      'Accept': 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      ...init?.headers
    }
  };
  
  return originalFetch(input, enhancedInit);
};

// Export initialization function
export function initBrowserCompatibility() {
  console.log('🔧 Browser compatibility polyfills loaded');
}