import { getApiUrl, isSafari, isWechat, isMobile } from '../config/api';
import { errorHandler, handleApiError } from './errorHandler';

// 兼容性HTTP客户端，专门处理Safari和移动端浏览器问题
export class HttpClient {
  private static instance: HttpClient;
  private baseURL: string;
  private defaultTimeout: number = 30000;

  private constructor() {
    this.baseURL = '';
  }

  public static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  // 创建兼容性更好的请求选项
  private createRequestOptions(options: RequestInit = {}): RequestInit {
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // 避免在Safari和微信中使用可能有问题的headers
    if (!isSafari() && !isWechat()) {
      defaultHeaders['Cache-Control'] = 'no-cache';
    }

    return {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit', // 避免Cookie相关问题
      cache: 'no-cache',
      redirect: 'follow',
      ...options,
      headers: {
        ...defaultHeaders,
        ...(options.headers || {}),
      },
    };
  }

  // 带超时的fetch
  private async fetchWithTimeout(url: string, options: RequestInit, timeout: number = this.defaultTimeout): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  // 重试机制 - 使用错误处理器
  private async fetchWithRetry(url: string, options: RequestInit, maxRetries: number = 2): Promise<Response> {
    return errorHandler.retryRequest(async () => {
      return this.fetchWithTimeout(url, options);
    }, maxRetries);
  }

  // GET请求
  public async get(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = getApiUrl(endpoint);
    const requestOptions = this.createRequestOptions({
      ...options,
      method: 'GET',
    });

    return this.fetchWithRetry(url, requestOptions);
  }

  // POST请求
  public async post(endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> {
    const url = getApiUrl(endpoint);
    const requestOptions = this.createRequestOptions({
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.fetchWithRetry(url, requestOptions);
  }

  // PUT请求
  public async put(endpoint: string, data?: any, options: RequestInit = {}): Promise<Response> {
    const url = getApiUrl(endpoint);
    const requestOptions = this.createRequestOptions({
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });

    return this.fetchWithRetry(url, requestOptions);
  }

  // DELETE请求
  public async delete(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const url = getApiUrl(endpoint);
    const requestOptions = this.createRequestOptions({
      ...options,
      method: 'DELETE',
    });

    return this.fetchWithRetry(url, requestOptions);
  }

  // 处理JSON响应，包含错误处理
  public async handleJsonResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error = {
        status: response.status,
        statusText: response.statusText,
        response: response
      };
      
      try {
        const errorData = await response.json();
        error.message = errorData.error || errorData.message;
      } catch {
        // 如果无法解析错误响应，使用默认错误消息
      }
      
      throw handleApiError(error, { url: response.url });
    }

    try {
      return await response.json();
    } catch (error) {
      throw handleApiError(new Error('Invalid JSON response'), { url: response.url });
    }
  }

  // 便捷方法：GET并返回JSON
  public async getJson<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await this.get(endpoint, options);
    return this.handleJsonResponse<T>(response);
  }

  // 便捷方法：POST并返回JSON
  public async postJson<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const response = await this.post(endpoint, data, options);
    return this.handleJsonResponse<T>(response);
  }

  // 便捷方法：PUT并返回JSON
  public async putJson<T>(endpoint: string, data?: any, options: RequestInit = {}): Promise<T> {
    const response = await this.put(endpoint, data, options);
    return this.handleJsonResponse<T>(response);
  }
}

// 导出单例实例
export const httpClient = HttpClient.getInstance();

// 兼容性检查和警告
export const checkBrowserCompatibility = (): void => {
  if (typeof window === 'undefined') return;

  const warnings: string[] = [];

  // 检查fetch支持
  if (!window.fetch) {
    warnings.push('Fetch API not supported');
  }

  // 检查Promise支持
  if (!window.Promise) {
    warnings.push('Promise not supported');
  }

  // 检查JSON支持
  if (!window.JSON) {
    warnings.push('JSON not supported');
  }

  // Safari特殊检查
  if (isSafari()) {
    console.info('Safari browser detected, using compatibility mode');
  }

  // 微信浏览器特殊检查
  if (isWechat()) {
    console.info('WeChat browser detected, using compatibility mode');
  }

  // 移动端检查
  if (isMobile()) {
    console.info('Mobile browser detected, using optimized settings');
  }

  if (warnings.length > 0) {
    console.warn('Browser compatibility issues detected:', warnings);
  }
};