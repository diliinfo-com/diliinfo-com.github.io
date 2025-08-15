import { Router } from 'itty-router';

const router = Router();

// 存储在环境变量中的TikTok访问令牌
// 注意：实际生产环境中应该使用更安全的存储方式
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN || '';

router.get('/api/tiktok/token', async (request) => {
  // 这里应该添加适当的身份验证
  return new Response(JSON.stringify({
    success: true,
    token: TIKTOK_ACCESS_TOKEN
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
});

export default router;