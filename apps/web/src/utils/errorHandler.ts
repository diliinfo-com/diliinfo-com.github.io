import { isSafari, isWechat, isMobile } from '../config/api';

// 错误类型定义
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

// 网络错误处理类
export class NetworkErrorHandler {
  private static instance: NetworkErrorHandler;

  private constructor() {}

  public static getInstance(): NetworkErrorHandler {
    if (!NetworkErrorHandler.instance) {
      NetworkErrorHandler.instance = new NetworkErrorHandler();
    }
    return NetworkErrorHandler.instance;
  }

  // 处理网络错误
  public handleNetworkError(error: any): ApiError {
    console.error('Network error occurred:', error);

    // 检查错误类型
    if (error.name === 'AbortError') {
      return {
        message: '请求已取消',
        code: 'REQUEST_ABORTED',
        details: error
      };
    }

    if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
      return {
        message: '请求超时，请检查网络连接',
        code: 'REQUEST_TIMEOUT',
        details: error
      };
    }

    if (error.message?.includes('Failed to fetch') || error.message?.includes('Network request failed')) {
      return this.handleFetchError(error);
    }

    if (error.status) {
      return this.handleHttpError(error);
    }

    // 默认错误处理
    return {
      message: '网络请求失败，请稍后重试',
      code: 'UNKNOWN_ERROR',
      details: error
    };
  }

  // 处理fetch错误
  private handleFetchError(error: any): ApiError {
    const userAgent = navigator.userAgent.toLowerCase();
    let message = '网络连接失败';
    let suggestions: string[] = [];

    if (isSafari()) {
      message = 'Safari浏览器网络请求失败';
      suggestions = [
        '请检查是否启用了内容拦截器',
        '尝试刷新页面',
        '检查网络连接'
      ];
    } else if (isWechat()) {
      message = '微信浏览器网络请求失败';
      suggestions = [
        '请检查微信网络权限',
        '尝试切换到其他浏览器',
        '检查网络连接'
      ];
    } else if (isMobile()) {
      message = '移动端网络请求失败';
      suggestions = [
        '请检查移动网络连接',
        '尝试切换WiFi/移动数据',
        '检查浏览器权限设置'
      ];
    }

    return {
      message,
      code: 'FETCH_ERROR',
      details: {
        originalError: error,
        suggestions,
        userAgent
      }
    };
  }

  // 处理HTTP错误
  private handleHttpError(error: any): ApiError {
    const status = error.status || error.response?.status;
    let message = '服务器错误';

    switch (status) {
      case 400:
        message = '请求参数错误';
        break;
      case 401:
        message = '未授权访问';
        break;
      case 403:
        message = '访问被拒绝';
        break;
      case 404:
        message = '请求的资源不存在';
        break;
      case 408:
        message = '请求超时';
        break;
      case 429:
        message = '请求过于频繁，请稍后重试';
        break;
      case 500:
        message = '服务器内部错误';
        break;
      case 502:
        message = '网关错误';
        break;
      case 503:
        message = '服务暂时不可用';
        break;
      case 504:
        message = '网关超时';
        break;
      default:
        message = `服务器错误 (${status})`;
    }

    return {
      message,
      code: `HTTP_${status}`,
      status,
      details: error
    };
  }

  // 显示用户友好的错误消息
  public showUserFriendlyError(error: ApiError): void {
    // 根据浏览器类型显示不同的错误提示
    let displayMessage = error.message;

    if (isSafari() && error.code === 'FETCH_ERROR') {
      displayMessage += '\n\n建议：\n• 检查Safari的内容拦截器设置\n• 尝试刷新页面';
    } else if (isWechat() && error.code === 'FETCH_ERROR') {
      displayMessage += '\n\n建议：\n• 检查微信网络权限\n• 尝试在其他浏览器中打开';
    } else if (isMobile() && error.code === 'REQUEST_TIMEOUT') {
      displayMessage += '\n\n建议：\n• 检查移动网络信号\n• 尝试切换WiFi/移动数据';
    }

    // 这里可以集成你的通知系统
    console.error('User-friendly error:', displayMessage);
    
    // 简单的alert显示，实际项目中可以替换为更好的UI组件
    if (typeof window !== 'undefined' && window.alert) {
      alert(displayMessage);
    }
  }

  // 记录错误到分析系统
  public logError(error: ApiError, context?: any): void {
    const errorLog = {
      timestamp: new Date().toISOString(),
      error: error,
      context: context,
      userAgent: navigator.userAgent,
      url: window.location.href,
      browserInfo: {
        isSafari: isSafari(),
        isWechat: isWechat(),
        isMobile: isMobile(),
      }
    };

    console.error('Error logged:', errorLog);

    // 这里可以发送错误日志到你的分析服务
    // 例如：sendToAnalytics(errorLog);
  }

  // 检查网络连接状态
  public checkNetworkStatus(): boolean {
    if ('navigator' in window && 'onLine' in navigator) {
      return navigator.onLine;
    }
    return true; // 假设在线，如果无法检测
  }

  // 重试机制
  public async retryRequest<T>(
    requestFn: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: any;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await requestFn();
      } catch (error) {
        lastError = error;
        
        if (i === maxRetries) {
          break;
        }

        // 检查是否应该重试
        if (!this.shouldRetry(error)) {
          break;
        }

        // 等待后重试
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }

    throw this.handleNetworkError(lastError);
  }

  // 判断是否应该重试
  private shouldRetry(error: any): boolean {
    // 不重试的错误类型
    const noRetryErrors = [400, 401, 403, 404, 422];
    
    if (error.status && noRetryErrors.includes(error.status)) {
      return false;
    }

    // 网络错误通常可以重试
    if (error.name === 'TypeError' && error.message?.includes('fetch')) {
      return true;
    }

    // 超时错误可以重试
    if (error.name === 'TimeoutError') {
      return true;
    }

    // 5xx服务器错误可以重试
    if (error.status >= 500) {
      return true;
    }

    return false;
  }
}

// 导出单例实例
export const errorHandler = NetworkErrorHandler.getInstance();

// 便捷函数
export const handleApiError = (error: any, context?: any): ApiError => {
  const apiError = errorHandler.handleNetworkError(error);
  errorHandler.logError(apiError, context);
  return apiError;
};

export const showError = (error: any, context?: any): void => {
  const apiError = handleApiError(error, context);
  errorHandler.showUserFriendlyError(apiError);
};

export const retryApiCall = async <T>(
  requestFn: () => Promise<T>,
  maxRetries?: number,
  delay?: number
): Promise<T> => {
  return errorHandler.retryRequest(requestFn, maxRetries, delay);
};