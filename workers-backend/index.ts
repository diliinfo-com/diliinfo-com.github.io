import { Hono } from 'hono';
import { z } from 'hono/zod-validator';

export interface Env {
  DB: D1Database;
}

const app = new Hono<{ Bindings: Env }>();

// Page view pixel
app.get('/pv.gif', async (c) => {
  const url = new URL(c.req.url);
  const path = url.searchParams.get('path') || '/';
  await c.env.DB.prepare(
    'INSERT INTO page_views (id, path) VALUES (randomblob(16), ?)' // id auto random
  ).bind(path).run();

  const ONE_PIXEL_GIF = atob('R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==');
  return new Response(ONE_PIXEL_GIF, {
    headers: { 'Content-Type': 'image/gif' },
  });
});

// Health check
app.get('/api/health', (c) => c.json({ ok: true }));

// Register
app.post(
  '/api/register',
  z('json', (zod) => ({
    email: zod.string().email(),
    password: zod.string().min(6),
  })),
  async (c) => {
    const { email, password } = c.req.valid('json');
    const hash = await hashPassword(password);
    await c.env.DB.prepare(
      'INSERT INTO users (id, email, hashed_pass) VALUES (randomblob(16), ?, ?)'
    ).bind(email, hash).run();
    return c.json({ ok: true });
  }
);

// Placeholder for other APIs
app.all('/api/*', (c) => c.json({ message: 'API under construction' }));

export default app;

async function hashPassword(pw: string): Promise<string> {
  // Simple hash; replace with bcrypt.
  const data = new TextEncoder().encode(pw);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
} 