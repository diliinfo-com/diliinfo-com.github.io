// API 配置
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || (
    import.meta.env.PROD 
      ? 'https://backend.diliinfo.com' 
      : 'http://localhost:8787'
  ),
  timeout: 30000, // 增加超时时间以适应移动端网络
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// 获取完整的API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.baseURL;
  return `${baseUrl}${endpoint}`;
};

// 环境检查
export const isDevelopment = import.meta.env.DEV;
export const isProduction = import.meta.env.PROD;

// Safari兼容性检查
export const isSafari = () => {
  if (typeof window === 'undefined') return false;
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
};

// 移动端浏览器检查
export const isMobile = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// 微信内置浏览器检查
export const isWechat = () => {
  if (typeof window === 'undefined') return false;
  return /micromessenger/i.test(navigator.userAgent);
};

// 创建兼容性更好的fetch函数
export const safeFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  // 确保使用HTTPS
  if (url.startsWith('http://') && isProduction) {
    url = url.replace('http://', 'https://');
  }

  // 设置默认选项以提高兼容性
  const defaultOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // 避免使用可能不兼容的headers
    },
    credentials: 'omit', // 避免Cookie问题
    mode: 'cors',
    cache: 'no-cache',
    ...options,
  };

  // 合并headers
  if (options.headers) {
    defaultOptions.headers = {
      ...defaultOptions.headers,
      ...options.headers,
    };
  }

  try {
    const response = await fetch(url, defaultOptions);
    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
};