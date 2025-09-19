// Safari专用的fetch包装器，解决Safari的网络请求问题
import { getApiUrl, isSafari, isIOS, isEmbeddedBrowser } from '../config/api';

interface SafariFetchOptions extends RequestInit {
  retries?: number;
  timeout?: number;
  fallbackToGet?: boolean;
}

interface SafariFetchResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  headers?: Record<string, string>;
  responseTime?: number;
}

// Safari专用的安全fetch函数
export async function safariFetch<T = any>(
  endpoint: string, 
  options: SafariFetchOptions = {}
): Promise<SafariFetchResponse<T>> {
  const {
    retries = 3,
    timeout = 30000,
    fallbackToGet = false,
    ...fetchOptions
  } = options;

  const url = endpoint.startsWith('http') ? endpoint : getApiUrl(endpoint);
  const startTime = Date.now();

  // Safari专用的请求配置
  const safariOptions: RequestInit = {
    method: 'GET',
    mode: 'cors',
    credentials: 'omit', // Safari严格要求：不使用cookies
    cache: 'no-cache',
    redirect: 'follow',
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 移除可能导致Safari问题的headers
      ...(fetchOptions.headers || {}),
    },
  };

  // Safari和iOS特殊处理
  if (isSafari() || isIOS()) {
    safariOptions.cache = 'default'; // Safari对no-cache支持不好
    // 移除可能有问题的headers
    delete (safariOptions.headers as any)['Cache-Control'];
    delete (safariOptions.headers as any)['Pragma'];
  }

  // 内置浏览器特殊处理
  if (isEmbeddedBrowser()) {
    safariOptions.cache = 'default';
    safariOptions.keepalive = false; // 避免keep-alive问题
  }

  // 重试逻辑
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`[SafariFetch] 尝试 ${attempt}/${retries}: ${safariOptions.method} ${url}`);
      
      // 创建AbortController用于超时控制
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...safariOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const responseTime = Date.now() - startTime;

      console.log(`[SafariFetch] 响应: ${response.status} ${response.statusText} (${responseTime}ms)`);

      // 收集响应头信息
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      if (response.ok) {
        try {
          const data = await response.json();
          return {
            success: true,
            data,
            status: response.status,
            headers: responseHeaders,
            responseTime
          };
        } catch (jsonError) {
          // 如果JSON解析失败，尝试获取文本
          const text = await response.text();
          return {
            success: true,
            data: text as any,
            status: response.status,
            headers: responseHeaders,
            responseTime
          };
        }
      } else {
        // HTTP错误状态
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // 忽略JSON解析错误
        }

        return {
          success: false,
          error: errorMessage,
          status: response.status,
          headers: responseHeaders,
          responseTime
        };
      }

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      console.error(`[SafariFetch] 尝试 ${attempt} 失败:`, error);

      // 如果是最后一次尝试，返回错误
      if (attempt === retries) {
        // 特殊处理不同类型的错误
        let errorMessage = 'Network request failed';
        
        if (error.name === 'AbortError') {
          errorMessage = `Request timeout after ${timeout}ms`;
        } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
          errorMessage = 'Network connection failed (CORS or connectivity issue)';
        } else if (error.message) {
          errorMessage = error.message;
        }

        // 如果启用了GET回退且原请求是POST
        if (fallbackToGet && safariOptions.method === 'POST') {
          console.log('[SafariFetch] 尝试GET回退...');
          return safariFetch(endpoint, {
            ...options,
            method: 'GET',
            body: undefined,
            fallbackToGet: false, // 避免无限递归
            retries: 1
          });
        }

        return {
          success: false,
          error: errorMessage,
          responseTime
        };
      }

      // 等待后重试（指数退避）
      const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // 理论上不会到达这里
  return {
    success: false,
    error: 'Unexpected error in safariFetch',
    responseTime: Date.now() - startTime
  };
}

// 便捷方法
export const safariGet = <T = any>(endpoint: string, options: Omit<SafariFetchOptions, 'method'> = {}) =>
  safariFetch<T>(endpoint, { ...options, method: 'GET' });

export const safariPost = <T = any>(endpoint: string, data?: any, options: Omit<SafariFetchOptions, 'method' | 'body'> = {}) =>
  safariFetch<T>(endpoint, {
    ...options,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });

export const safariPut = <T = any>(endpoint: string, data?: any, options: Omit<SafariFetchOptions, 'method' | 'body'> = {}) =>
  safariFetch<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });

// 网络连接测试
export async function testNetworkConnectivity(): Promise<{
  backend: boolean;
  google: boolean;
  httpbin: boolean;
  details: Record<string, any>;
}> {
  const tests = [
    { name: 'backend', url: getApiUrl('/api/health') },
    { name: 'google', url: 'https://www.google.com' },
    { name: 'httpbin', url: 'https://httpbin.org/get' }
  ];

  const results: any = { details: {} };

  for (const test of tests) {
    try {
      const result = await safariFetch(test.url, { 
        method: 'GET', 
        timeout: 10000, 
        retries: 1 
      });
      
      results[test.name] = result.success;
      results.details[test.name] = {
        success: result.success,
        status: result.status,
        responseTime: result.responseTime,
        error: result.error
      };
    } catch (error) {
      results[test.name] = false;
      results.details[test.name] = {
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  return results;
}

// CORS预检测试
export async function testCORSPreflight(): Promise<{
  success: boolean;
  details: any;
}> {
  try {
    const result = await safariFetch(getApiUrl('/api/health'), {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type, X-Session-ID'
      },
      timeout: 10000,
      retries: 1
    });

    return {
      success: result.success,
      details: {
        status: result.status,
        headers: result.headers,
        responseTime: result.responseTime,
        error: result.error
      }
    };
  } catch (error) {
    return {
      success: false,
      details: {
        error: error instanceof Error ? error.message : String(error)
      }
    };
  }
}