// TikTok Events API 初始化

import { setAccessToken } from './tiktokEventsApi';
import { trackPageView } from './tiktokEventsApi';

// 从后端获取TikTok访问令牌
const fetchTikTokToken = async (): Promise<string | null> => {
  try {
    const response = await fetch('https://backend.diliinfo.com/api/tiktok/token');
    if (!response.ok) {
      throw new Error(`获取TikTok令牌失败: ${response.status}`);
    }
    const data = await response.json();
    return data.token || null;
  } catch (error) {
    console.error('获取TikTok令牌出错:', error);
    return null;
  }
};

// 初始化TikTok Events API
export const initTikTokEventsAPI = async (): Promise<boolean> => {
  try {
    // 我们已经在tiktokEventsApi.ts中直接设置了访问令牌
    // 但在实际生产环境中，应该从后端获取令牌
    // const token = await fetchTikTokToken();
    // if (token) {
    //   setAccessToken(token);
    // } else {
    //   console.warn('TikTok Events API: 无法获取访问令牌');
    //   return false;
    // }

    // 跟踪初始页面浏览
    await trackPageView();
    console.log('TikTok Events API 初始化完成');
    return true;
  } catch (error) {
    console.error('TikTok Events API 初始化失败:', error);
    return false;
  }
};

// 在应用启动时调用此函数
export const setupTikTokEvents = async () => {
  await initTikTokEventsAPI();
};