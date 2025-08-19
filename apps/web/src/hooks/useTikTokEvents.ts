// TikTok Events API React Hook

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  trackPageViewEvent,
  trackButtonClickEvent,
  trackSearchEvent,
  trackContactEvent,
  trackCompleteRegistrationEvent,
  trackLeadEvent,
  trackLoanApplicationStartEvent,
  trackLoanApplicationCompleteEvent,
  trackSignUpEvent,
  trackLoginEvent
} from '../utils/tiktokIntegration';

// TikTok Events API Hook
export const useTikTokEvents = () => {
  const location = useLocation();
  
  // 页面浏览跟踪
  useEffect(() => {
    trackPageViewEvent(location.pathname);
  }, [location.pathname]);
  
  // 返回各种事件跟踪函数
  return {
    trackButtonClick: trackButtonClickEvent,
    trackSearch: trackSearchEvent,
    trackContact: trackContactEvent,
    trackCompleteRegistration: trackCompleteRegistrationEvent,
    trackLead: trackLeadEvent,
    trackLoanApplicationStart: trackLoanApplicationStartEvent,
    trackLoanApplicationComplete: trackLoanApplicationCompleteEvent,
    trackSignUp: trackSignUpEvent,
    trackLogin: trackLoginEvent
  };
};

export default useTikTokEvents;