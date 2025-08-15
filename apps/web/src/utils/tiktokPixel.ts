// TikTok Pixel 事件追踪工具
declare global {
  interface Window {
    ttq: any;
  }
}

// 等待 TikTok Pixel 加载完成
const waitForTikTokPixel = (): Promise<void> => {
  return new Promise((resolve) => {
    if (window.ttq && window.ttq.load) {
      resolve();
    } else {
      const checkInterval = setInterval(() => {
        if (window.ttq && window.ttq.load) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
    }
  });
};

// 页面浏览事件
export const trackPageView = async (path?: string) => {
  try {
    await waitForTikTokPixel();
    if (window.ttq) {
      window.ttq.page();
      console.log('TikTok Pixel: Page view tracked', path || window.location.pathname);
    }
  } catch (error) {
    console.error('TikTok Pixel: Failed to track page view', error);
  }
};

// 用户注册事件
export const trackSignUp = async (method: string = 'web') => {
  try {
    await waitForTikTokPixel();
    if (window.ttq) {
      window.ttq.track('SignUp', {
        content_id: `signup_${method}`, // 添加content_id参数
        content_name: 'User Registration',
        content_category: 'User Engagement',
        value: 1,
        currency: 'MXN',
        method: method
      });
      console.log('TikTok Pixel: Sign up tracked');
    }
  } catch (error) {
    console.error('TikTok Pixel: Failed to track sign up', error);
  }
};

// 用户登录事件
export const trackLogin = async (method: string = 'web') => {
  try {
    await waitForTikTokPixel();
    if (window.ttq) {
      window.ttq.track('Login', {
        content_id: `login_${method}`, // 添加content_id参数
        content_name: 'User Login',
        content_category: 'User Engagement',
        value: 1,
        currency: 'MXN',
        method: method
      });
      console.log('TikTok Pixel: Login tracked');
    }
  } catch (error) {
    console.error('TikTok Pixel: Failed to track login', error);
  }
};

// 贷款申请开始事件
export const trackLoanApplicationStart = async (loanType: string = 'personal') => {
  try {
    await waitForTikTokPixel();
    if (window.ttq) {
      window.ttq.track('InitiateCheckout', {
        content_id: `loan_start_${loanType}`, // 添加content_id参数
        content_name: 'Loan Application Start',
        content_category: 'Loan Application',
        value: 1,
        currency: 'MXN',
        loan_type: loanType
      });
      console.log('TikTok Pixel: Loan application start tracked');
    }
  } catch (error) {
    console.error('TikTok Pixel: Failed to track loan application start', error);
  }
};

// 贷款申请完成事件
export const trackLoanApplicationComplete = async (loanAmount: number, loanType: string = 'personal') => {
  try {
    await waitForTikTokPixel();
    if (window.ttq) {
      window.ttq.track('CompleteRegistration', {
        content_id: `loan_complete_${loanType}`, // 添加content_id参数
        content_name: 'Loan Application Complete',
        content_category: 'Loan Application',
        value: loanAmount,
        currency: 'MXN',
        loan_type: loanType
      });
      console.log('TikTok Pixel: Loan application complete tracked');
    }
  } catch (error) {
    console.error('TikTok Pixel: Failed to track loan application complete', error);
  }
};

// 文件上传事件
export const trackFileUpload = async (fileType: string, fileCount: number = 1) => {
  try {
    await waitForTikTokPixel();
    if (window.ttq) {
      window.ttq.track('AddToCart', {
        content_id: `file_${fileType}`, // 添加content_id参数
        content_name: 'Document Upload',
        content_category: 'Documentation',
        value: fileCount,
        currency: 'MXN',
        file_type: fileType
      });
      console.log('TikTok Pixel: File upload tracked');
    }
  } catch (error) {
    console.error('TikTok Pixel: Failed to track file upload', error);
  }
};

// 联系表单提交事件
export const trackContactFormSubmit = async (formType: string = 'contact') => {
  try {
    await waitForTikTokPixel();
    if (window.ttq) {
      window.ttq.track('Lead', {
        content_id: `form_${formType}`, // 添加content_id参数
        content_name: 'Contact Form Submit',
        content_category: 'User Engagement',
        value: 1,
        currency: 'MXN',
        form_type: formType
      });
      console.log('TikTok Pixel: Contact form submit tracked');
    }
  } catch (error) {
    console.error('TikTok Pixel: Failed to track contact form submit', error);
  }
};

// 按钮点击事件
export const trackButtonClick = async (buttonName: string, buttonLocation: string) => {
  try {
    await waitForTikTokPixel();
    if (window.ttq) {
      window.ttq.track('ClickButton', {
        content_id: `button_${buttonName.replace(/\s+/g, '_').toLowerCase()}`, // 添加content_id参数
        content_name: buttonName,
        content_category: 'Button Click',
        value: 1,
        currency: 'MXN',
        button_location: buttonLocation
      });
      console.log('TikTok Pixel: Button click tracked', buttonName);
    }
  } catch (error) {
    console.error('TikTok Pixel: Failed to track button click', error);
  }
};

// 初始化 SPA 路由追踪
export const initSPATracking = () => {
  // 监听 popstate 事件（浏览器前进后退）
  window.addEventListener('popstate', () => {
    setTimeout(() => trackPageView(), 100);
  });

  // 监听 pushstate 事件（程序化导航）
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function(...args) {
    originalPushState.apply(history, args);
    setTimeout(() => trackPageView(), 100);
  };

  history.replaceState = function(...args) {
    originalReplaceState.apply(history, args);
    setTimeout(() => trackPageView(), 100);
  };

  console.log('TikTok Pixel: SPA tracking initialized');
};

// 用户识别（如果有用户ID）
export const identifyUser = async (userId: string, email?: string, phone?: string) => {
  try {
    await waitForTikTokPixel();
    if (window.ttq) {
      window.ttq.identify({
        email: email,
        phone_number: phone,
        external_id: userId
      });
      console.log('TikTok Pixel: User identified', userId);
    }
  } catch (error) {
    console.error('TikTok Pixel: Failed to identify user', error);
  }
};

// 设置用户属性
export const setUserProperties = async (properties: Record<string, any>) => {
  try {
    await waitForTikTokPixel();
    if (window.ttq) {
      // TikTok Pixel 通过事件参数传递用户属性
      console.log('TikTok Pixel: User properties set', properties);
    }
  } catch (error) {
    console.error('TikTok Pixel: Failed to set user properties', error);
  }
};

