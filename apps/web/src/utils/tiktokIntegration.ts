// TikTok Events API 集成

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

// 页面浏览跟踪
export const trackPageViewEvent = (path?: string) => {
  trackPageView(path).catch(error => {
    console.error('TikTok Events API: 页面浏览跟踪失败', error);
  });
};

// 搜索事件跟踪
export const trackSearchEvent = (searchString: string) => {
  const contentId = `search_${searchString.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
  trackSearch({
    content_id: contentId,
    search_string: searchString,
    content_type: 'search',
    content_name: '搜索查询',
    value: 1,
    currency: 'MXN'
  }).catch(error => {
    console.error('TikTok Events API: 搜索事件跟踪失败', error);
  });
};

// 联系事件跟踪
export const trackContactEvent = (contactType: string) => {
  const contentId = `contact_${contactType}_${Date.now()}`;
  trackContact({
    content_id: contentId,
    content_type: 'contact',
    content_name: `联系方式: ${contactType}`,
    value: 1,
    currency: 'MXN'
  }).catch(error => {
    console.error('TikTok Events API: 联系事件跟踪失败', error);
  });
};

// 按钮点击事件跟踪
export const trackButtonClickEvent = (buttonName: string, buttonLocation: string) => {
  const contentId = `button_${buttonName.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}`;
  trackClickButton({
    content_id: contentId,
    content_type: 'button',
    content_name: buttonName,
    value: 1,
    currency: 'MXN',
    button_location: buttonLocation
  }).catch(error => {
    console.error('TikTok Events API: 按钮点击事件跟踪失败', error);
  });
};

// 添加到愿望清单事件跟踪
export const trackAddToWishlistEvent = (itemId: string, itemName: string, value: number = 1) => {
  const contentId = itemId || `wishlist_item_${Date.now()}`;
  trackAddToWishlist({
    content_id: contentId,
    content_type: 'wishlist_item',
    content_name: itemName,
    value: value,
    currency: 'MXN'
  }).catch(error => {
    console.error('TikTok Events API: 添加到愿望清单事件跟踪失败', error);
  });
};

// 完成注册事件跟踪
export const trackCompleteRegistrationEvent = (method: string = 'web') => {
  const contentId = `registration_${method}_${Date.now()}`;
  trackCompleteRegistration({
    content_id: contentId,
    content_type: 'registration',
    content_name: '用户注册',
    value: 1,
    currency: 'MXN',
    method: method
  }).catch(error => {
    console.error('TikTok Events API: 完成注册事件跟踪失败', error);
  });
};

// 潜在客户事件跟踪
export const trackLeadEvent = (formType: string, formName: string) => {
  const contentId = `lead_${formType}_${Date.now()}`;
  trackLead({
    content_id: contentId,
    content_type: 'lead',
    content_name: formName,
    value: 1,
    currency: 'MXN'
  }).catch(error => {
    console.error('TikTok Events API: 潜在客户事件跟踪失败', error);
  });
};

// 文件上传事件跟踪
export const trackFileUploadEvent = (fileType: string, fileCount: number = 1) => {
  trackFileUpload(fileType, fileCount).catch(error => {
    console.error('TikTok Events API: 文件上传事件跟踪失败', error);
  });
};

// 贷款申请开始事件跟踪
export const trackLoanApplicationStartEvent = (loanType: string = 'personal') => {
  trackLoanApplicationStart(loanType).catch(error => {
    console.error('TikTok Events API: 贷款申请开始事件跟踪失败', error);
  });
};

// 贷款申请完成事件跟踪
export const trackLoanApplicationCompleteEvent = (loanAmount: number, loanType: string = 'personal') => {
  trackLoanApplicationComplete(loanAmount, loanType).catch(error => {
    console.error('TikTok Events API: 贷款申请完成事件跟踪失败', error);
  });
};

// 用户注册事件跟踪
export const trackSignUpEvent = (method: string = 'web') => {
  trackSignUp(method).catch(error => {
    console.error('TikTok Events API: 用户注册事件跟踪失败', error);
  });
};

// 用户登录事件跟踪
export const trackLoginEvent = (method: string = 'web') => {
  trackLogin(method).catch(error => {
    console.error('TikTok Events API: 用户登录事件跟踪失败', error);
  });
};

// 联系表单提交事件跟踪
export const trackContactFormSubmitEvent = (formType: string = 'contact') => {
  trackContactFormSubmit(formType).catch(error => {
    console.error('TikTok Events API: 联系表单提交事件跟踪失败', error);
  });
};