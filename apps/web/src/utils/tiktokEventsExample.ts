// TikTok Events API 使用示例

import {
  trackViewContent,
  trackSearch,
  trackContact,
  trackClickButton,
  trackAddToWishlist,
  trackCompleteRegistration,
  trackLead,
  trackFileUpload,
  trackLoanApplicationStart,
  trackLoanApplicationComplete,
  trackSignUp,
  trackLogin,
  trackContactFormSubmit,
  trackButtonClick,
  trackPageView
} from './tiktokEventsApi';

// 初始化 - 在应用启动时调用
export const initTikTokEventsAPI = async () => {
  try {
    console.log('TikTok Events API 初始化完成');
    
    // 跟踪页面浏览
    await trackPageView();
  } catch (error) {
    console.error('TikTok Events API 初始化失败', error);
  }
};

// ViewContent 事件示例 - 查看内容
export const exampleViewContent = async () => {
  await trackViewContent({
    content_id: 'product_123',
    content_type: 'product',
    content_name: '个人贷款产品',
    value: 5000,
    currency: 'MXN'
  });
};

// Search 事件示例 - 搜索
export const exampleSearch = async () => {
  await trackSearch({
    search_string: '小额贷款',
    content_type: 'loan_product',
    value: 1,
    currency: 'MXN'
  });
};

// Contact 事件示例 - 联系
export const exampleContact = async () => {
  await trackContact({
    content_id: 'contact_form',
    content_type: 'form',
    content_name: '客户服务联系表单',
    value: 1,
    currency: 'MXN'
  });
};

// ClickButton 事件示例 - 点击按钮
export const exampleClickButton = async () => {
  await trackClickButton({
    content_id: 'apply_now_button',
    content_type: 'button',
    content_name: '立即申请按钮',
    value: 1,
    currency: 'MXN'
  });
};

// AddToWishlist 事件示例 - 添加到愿望清单
export const exampleAddToWishlist = async () => {
  await trackAddToWishlist({
    content_id: 'loan_plan_premium',
    content_type: 'loan_plan',
    content_name: '高级贷款计划',
    value: 10000,
    currency: 'MXN'
  });
};

// CompleteRegistration 事件示例 - 完成注册
export const exampleCompleteRegistration = async () => {
  await trackCompleteRegistration({
    content_id: 'user_registration',
    content_type: 'registration',
    content_name: '用户注册',
    value: 1,
    currency: 'MXN'
  });
};

// Lead 事件示例 - 潜在客户
export const exampleLead = async () => {
  await trackLead({
    content_id: 'loan_inquiry',
    content_type: 'form_submission',
    content_name: '贷款咨询表单',
    value: 1,
    currency: 'MXN'
  });
};

// 用户数据示例
const userDataExample = {
  email: 'user@example.com',
  phone: '+5215512345678',
  userId: 'user_12345',
  ttclid: 'ttclid_from_url_parameter',
  ip: '192.168.1.1' // 通常由服务器端提供
};

// 带用户数据的事件跟踪示例
export const exampleEventWithUserData = async () => {
  await trackLead({
    content_id: 'loan_application',
    content_name: '贷款申请',
    value: 5000,
    currency: 'MXN'
  }, userDataExample);
};