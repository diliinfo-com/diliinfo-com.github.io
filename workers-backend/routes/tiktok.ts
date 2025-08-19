// 使用Hono替代itty-router，因为项目中已经使用了Hono
import { Hono } from 'hono';

const router = new Hono();

// 使用提供的TikTok访问令牌
// 注意：实际生产环境中应该使用更安全的存储方式
const TIKTOK_ACCESS_TOKEN = '3bd8ebd2b9867ffa28d9c1732b8f83120c68dadb';

router.get('/api/tiktok/token', (c) => {
  // 这里应该添加适当的身份验证
  return c.json({
    success: true,
    token: TIKTOK_ACCESS_TOKEN
  });
});

export default router;
