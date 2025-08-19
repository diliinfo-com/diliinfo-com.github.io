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
  const contentId = `product_loan_${Date.now()}`;
  await trackViewContent({
    content_id: contentId,
    content_type: 'product',
    content_name: '个人贷款产品',
    value: 5000,
    currency: 'MXN'
  });
};

// Search 事件示例 - 搜索
export const exampleSearch = async () => {
  const contentId = `search_loan_${Date.now()}`;
  await trackSearch({
    content_id: contentId,
    search_string: '小额贷款',
    content_type: 'search_result',
    content_name: '贷款产品搜索',
    value: 1,
    currency: 'MXN'
  });
};

// Contact 事件示例 - 联系
export const exampleContact = async () => {
  const contentId = `contact_form_${Date.now()}`;
  await trackContact({
    content_id: contentId,
    content_type: 'contact_form',
    content_name: '客户服务联系表单',
    value: 1,
    currency: 'MXN'
  });
};

// ClickButton 事件示例 - 点击按钮
export const exampleClickButton = async () => {
  const contentId = `apply_button_${Date.now()}`;
  await trackClickButton({
    content_id: contentId,
    content_type: 'cta_button',
    content_name: '立即申请按钮',
    value: 1,
    currency: 'MXN'
  });
};

// AddToWishlist 事件示例 - 添加到愿望清单
export const exampleAddToWishlist = async () => {
  const contentId = `loan_plan_premium_${Date.now()}`;
  await trackAddToWishlist({
    content_id: contentId,
    content_type: 'loan_plan',
    content_name: '高级贷款计划',
    value: 10000,
    currency: 'MXN'
  });
};

// CompleteRegistration 事件示例 - 完成注册
export const exampleCompleteRegistration = async () => {
  const contentId = `user_registration_${Date.now()}`;
  await trackCompleteRegistration({
    content_id: contentId,
    content_type: 'user_registration',
    content_name: '用户注册',
    value: 1,
    currency: 'MXN'
  });
};

// Lead 事件示例 - 潜在客户
export const exampleLead = async () => {
  const contentId = `loan_inquiry_${Date.now()}`;
  await trackLead({
    content_id: contentId,
    content_type: 'lead_form',
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