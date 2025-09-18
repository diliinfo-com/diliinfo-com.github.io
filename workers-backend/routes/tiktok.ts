import { Hono } from 'hono';

const router = new Hono();

// TikTok Events API 代理端点
router.post('/api/tiktok/events', async (c) => {
  try {
    const eventData = await c.req.json();
    
    // 转发到TikTok Events API
    const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Token': c.env.TIKTOK_ACCESS_TOKEN || '3bd8ebd2b9867ffa28d9c1732b8f83120c68dadb'
      },
      body: JSON.stringify(eventData)
    });

    const result = await response.json();
    
    if (response.ok) {
      return c.json(result);
    } else {
      console.error('TikTok API Error:', result);
      return c.json({ error: 'TikTok API request failed', details: result }, response.status);
    }
  } catch (error) {
    console.error('TikTok Events Proxy Error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// TikTok访问令牌端点
router.get('/api/tiktok/token', (c) => {
  // 这里应该添加适当的身份验证
  return c.json({
    success: true,
    token: c.env.TIKTOK_ACCESS_TOKEN || '3bd8ebd2b9867ffa28d9c1732b8f83120c68dadb'
  });
});

export default router;