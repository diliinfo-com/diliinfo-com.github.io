// Minimal polyfills for Safari compatibility
console.log('🔧 Loading Safari compatibility polyfills...');

// UUID polyfill for Safari < 15.4
if (!window.crypto?.randomUUID) {
  if (!window.crypto) {
    (window as any).crypto = {};
  }
  (window.crypto as any).randomUUID = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
}

// Simple fetch enhancement for Safari
if (window.fetch) {
  const originalFetch = window.fetch;
  window.fetch = function(input: RequestInfo | URL, init?: RequestInit) {
    const enhancedInit = {
      ...init,
      headers: {
        'Accept': 'application/json, text/plain, */*',
        ...init?.headers
      }
    };
    return originalFetch(input, enhancedInit);
  };
}

// Export initialization function
export function initBrowserCompatibility() {
  console.log('✅ Safari compatibility polyfills loaded successfully');
}