// TikTok Events API 工具类
import axios from 'axios';

// TikTok Events API 配置
const TIKTOK_API_URL = 'https://business-api.tiktok.com/open_api/v1.3/event/track/';
const PIXEL_ID = 'D2FE9EJC77U9B02LU8E0';
let ACCESS_TOKEN = ''; // 需要从安全存储中获取

// 设置访问令牌
export const setAccessToken = (token: string) => {
  ACCESS_TOKEN = token;
};

// 构建基本事件数据
const buildBaseEventData = (eventName: string, eventParams: any) => {
  return {
    pixel_code: PIXEL_ID,
    event: eventName,
    timestamp: Math.floor(Date.now() / 1000),
    event_id: `${eventName}_${Date.now()}`,
    url: window.location.href,
    ...eventParams
  };
};

// 构建用户数据
const buildUserData = (userData: any = {}) => {
  return {
    ip: userData.ip || '',
    user_agent: navigator.userAgent,
    external_id: userData.userId || '',
    email: userData.email || '',
    phone: userData.phone || '',
    ttclid: userData.ttclid || ''
  };
};

// 发送事件到TikTok Events API
export const sendEvent = async (
  eventName: string, 
  eventParams: any = {}, 
  userData: any = {}
) => {
  if (!ACCESS_TOKEN) {
    console.warn('TikTok Events API: Access token not set');
    return { success: false, reason: 'token_not_set' };
  }

  try {
    const payload = {
      event_source: 'web',
      event_source_id: PIXEL_ID,
      data: [
        {
          ...buildBaseEventData(eventName, eventParams),
          ...buildUserData(userData)
        }
      ]
    };

    // 设置超时，避免长时间等待
    const response = await axios.post(TIKTOK_API_URL, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': ACCESS_TOKEN
      },
      timeout: 3000 // 3秒超时
    });

    console.log(`TikTok Events API: ${eventName} event sent successfully`, response.data);
    return { success: true, data: response.data };
  } catch (error) {
    // 不要抛出错误，而是返回错误信息
    console.error(`TikTok Events API: Failed to send ${eventName} event`, error);
    return { 
      success: false, 
      reason: 'api_error',
      error: error.message || 'Unknown error'
    };
  }
};

// 预定义事件函数
export const trackViewContent = async (params: any, userData?: any) => {
  return sendEvent('ViewContent', params, userData);
};

export const trackSearch = async (params: any, userData?: any) => {
  return sendEvent('Search', params, userData);
};

export const trackContact = async (params: any, userData?: any) => {
  return sendEvent('Contact', params, userData);
};

export const trackClickButton = async (params: any, userData?: any) => {
  return sendEvent('ClickButton', params, userData);
};

export const trackAddToWishlist = async (params: any, userData?: any) => {
  return sendEvent('AddToWishlist', params, userData);
};

export const trackCompleteRegistration = async (params: any, userData?: any) => {
  return sendEvent('CompleteRegistration', params, userData);
};

export const trackLead = async (params: any, userData?: any) => {
  return sendEvent('Lead', params, userData);
};

// 文件上传事件 - 与现有的tiktokPixel.ts保持一致的API
export const trackFileUpload = async (fileType: string, fileCount: number = 1) => {
  return sendEvent('AddToCart', {
    content_id: `file_${fileType}`,
    content_name: 'Document Upload',
    content_category: 'Documentation',
    value: fileCount,
    currency: 'MXN',
    file_type: fileType
  });
};

// 贷款申请开始事件 - 与现有的tiktokPixel.ts保持一致的API
export const trackLoanApplicationStart = async (loanType: string = 'personal') => {
  return sendEvent('InitiateCheckout', {
    content_id: `loan_start_${loanType}`,
    content_name: 'Loan Application Start',
    content_category: 'Loan Application',
    value: 1,
    currency: 'MXN',
    loan_type: loanType
  });
};

// 贷款申请完成事件 - 与现有的tiktokPixel.ts保持一致的API
export const trackLoanApplicationComplete = async (loanAmount: number, loanType: string = 'personal') => {
  return sendEvent('CompleteRegistration', {
    content_id: `loan_complete_${loanType}`,
    content_name: 'Loan Application Complete',
    content_category: 'Loan Application',
    value: loanAmount,
    currency: 'MXN',
    loan_type: loanType
  });
};

// 用户注册事件 - 与现有的tiktokPixel.ts保持一致的API
export const trackSignUp = async (method: string = 'web') => {
  return sendEvent('SignUp', {
    content_id: `signup_${method}`,
    content_name: 'User Registration',
    content_category: 'User Engagement',
    value: 1,
    currency: 'MXN',
    method: method
  });
};

// 用户登录事件 - 与现有的tiktokPixel.ts保持一致的API
export const trackLogin = async (method: string = 'web') => {
  return sendEvent('Login', {
    content_id: `login_${method}`,
    content_name: 'User Login',
    content_category: 'User Engagement',
    value: 1,
    currency: 'MXN',
    method: method
  });
};

// 联系表单提交事件 - 与现有的tiktokPixel.ts保持一致的API
export const trackContactFormSubmit = async (formType: string = 'contact') => {
  return sendEvent('Lead', {
    content_id: `form_${formType}`,
    content_name: 'Contact Form Submit',
    content_category: 'User Engagement',
    value: 1,
    currency: 'MXN',
    form_type: formType
  });
};

// 按钮点击事件 - 与现有的tiktokPixel.ts保持一致的API
export const trackButtonClick = async (buttonName: string, buttonLocation: string) => {
  return sendEvent('ClickButton', {
    content_id: `button_${buttonName.replace(/\s+/g, '_').toLowerCase()}`,
    content_name: buttonName,
    content_category: 'Button Click',
    value: 1,
    currency: 'MXN',
    button_location: buttonLocation
  });
};

// 页面浏览事件 - 与现有的tiktokPixel.ts保持一致的API
export const trackPageView = async (path?: string) => {
  return sendEvent('ViewContent', {
    content_id: `page_${path || window.location.pathname}`,
    content_name: `Page View: ${path || window.location.pathname}`,
    content_category: 'Page View',
    value: 1,
    currency: 'MXN'
  });
};