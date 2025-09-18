// API 配置
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://diliinfo-backend-prod.0768keyiran.workers.dev',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
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