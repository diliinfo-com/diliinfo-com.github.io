import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB: D1Database;
  JWT_SECRET: string;
}

const app = new Hono<{ Bindings: Env; Variables: { user: any; admin: any } }>();

// CORS设置
app.use('*', cors({
  origin: ['http://localhost:5173', 'https://diliinfo-com.github.io'],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

// 工具函数
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function createJWT(payload: any, secret: string): Promise<string> {
  // 简化的JWT创建，生产环境建议使用专门的JWT库
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadStr = btoa(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 }));
  return Promise.resolve(`${header}.${payloadStr}.signature`);
}

// 页面访问统计
app.get('/pv.gif', async (c) => {
  const url = new URL(c.req.url);
  const path = url.searchParams.get('path') || '/';
  const userAgent = c.req.header('User-Agent') || '';
  const referrer = c.req.header('Referer') || '';
  const ip = c.req.header('CF-Connecting-IP') || '';
  
  await c.env.DB.prepare(`
    INSERT INTO page_views (id, path, user_agent, ip_address, referrer) 
    VALUES (?, ?, ?, ?, ?)
  `).bind(
    crypto.randomUUID(),
    path,
    userAgent,
    ip,
    referrer
  ).run();

  const pixel = atob('R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==');
  return new Response(pixel, {
    headers: { 'Content-Type': 'image/gif' },
  });
});

// 健康检查
app.get('/api/health', (c) => c.json({ ok: true, timestamp: Date.now() }));

// ========== 用户认证API ==========

// 用户注册
app.post('/api/auth/register', async (c) => {
  try {
    const { email, password, firstName, lastName, phone } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password required' }, 400);
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();
    
    await c.env.DB.prepare(`
      INSERT INTO users (id, email, hashed_pass, first_name, last_name, phone)
      VALUES (?, ?, ?, ?, ?, ?)
    `).bind(userId, email, hashedPassword, firstName || '', lastName || '', phone || '').run();

    const token = await createJWT({ userId, email }, c.env.JWT_SECRET || 'default-secret');
    
    return c.json({ 
      success: true, 
      user: { id: userId, email, firstName, lastName },
      token 
    });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Email already registered' }, 409);
    }
    return c.json({ error: 'Registration failed' }, 500);
  }
});

// 用户登录
app.post('/api/auth/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    const hashedPassword = await hashPassword(password);
    
    const user = await c.env.DB.prepare(`
      SELECT id, email, first_name, last_name FROM users 
      WHERE email = ? AND hashed_pass = ? AND status = 'active'
    `).bind(email, hashedPassword).first();

    if (!user) {
      return c.json({ error: 'Invalid credentials' }, 401);
    }

    const token = await createJWT({ 
      userId: user.id, 
      email: user.email 
    }, c.env.JWT_SECRET || 'default-secret');
    
    return c.json({ 
      success: true,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name
      },
      token 
    });
  } catch (error) {
    return c.json({ error: 'Login failed' }, 500);
  }
});

// ========== 管理员认证API ==========

// 管理员登录
app.post('/api/admin/auth/login', async (c) => {
  try {
    const { username, password } = await c.req.json();
    const hashedPassword = await hashPassword(password);
    
    const admin = await c.env.DB.prepare(`
      SELECT id, username, email, role FROM admins 
      WHERE username = ? AND hashed_pass = ?
    `).bind(username, hashedPassword).first();

    if (!admin) {
      return c.json({ error: 'Invalid admin credentials' }, 401);
    }

    // 更新最后登录时间
    await c.env.DB.prepare(`
      UPDATE admins SET last_login_at = ? WHERE id = ?
    `).bind(Date.now(), admin.id).run();

    const token = await createJWT({ 
      adminId: admin.id, 
      username: admin.username,
      role: admin.role 
    }, c.env.JWT_SECRET || 'default-secret');
    
    return c.json({ 
      success: true,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      },
      token 
    });
  } catch (error) {
    return c.json({ error: 'Admin login failed' }, 500);
  }
});

// ========== 管理后台API ==========

// 简化的管理员中间件
const adminAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  // 这里应该验证JWT，简化处理
  await next();
};

// 获取统计数据
app.get('/api/admin/stats', adminAuth, async (c) => {
  try {
    // 总用户数
    const totalUsers = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first();
    
    // 总申请数
    const totalApplications = await c.env.DB.prepare('SELECT COUNT(*) as count FROM loan_applications').first();
    
    // 页面访问数
    const totalPageViews = await c.env.DB.prepare('SELECT COUNT(*) as count FROM page_views').first();
    
    // 申请状态分布
    const applicationsByStatus = await c.env.DB.prepare(`
      SELECT status, COUNT(*) as count FROM loan_applications GROUP BY status
    `).all();

    // 每日注册用户
    const dailyRegistrations = await c.env.DB.prepare(`
      SELECT DATE(created_at, 'unixepoch') as date, COUNT(*) as count 
      FROM users 
      WHERE created_at > ? 
      GROUP BY DATE(created_at, 'unixepoch') 
      ORDER BY date DESC LIMIT 7
    `).bind(Date.now() - 7 * 24 * 60 * 60 * 1000).all();

    return c.json({
      summary: {
        totalUsers: totalUsers?.count || 0,
        totalApplications: totalApplications?.count || 0,
        totalPageViews: totalPageViews?.count || 0,
      },
      applicationsByStatus: applicationsByStatus.results || [],
      dailyRegistrations: dailyRegistrations.results || []
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// 获取用户列表
app.get('/api/admin/users', adminAuth, async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '20');
    const offset = (page - 1) * limit;

    const users = await c.env.DB.prepare(`
      SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.status, u.created_at,
             COUNT(la.id) as application_count
      FROM users u
      LEFT JOIN loan_applications la ON u.id = la.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();

    const total = await c.env.DB.prepare('SELECT COUNT(*) as count FROM users').first();

    return c.json({
      users: users.results || [],
      pagination: {
        page,
        limit,
        total: total?.count || 0,
        pages: Math.ceil((total?.count || 0) / limit)
      }
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// 获取申请详情
app.get('/api/admin/applications', adminAuth, async (c) => {
  try {
    const applications = await c.env.DB.prepare(`
      SELECT la.*, u.email, u.first_name, u.last_name,
             COUNT(up.id) as upload_count
      FROM loan_applications la
      JOIN users u ON la.user_id = u.id
      LEFT JOIN uploads up ON la.id = up.application_id
      GROUP BY la.id
      ORDER BY la.created_at DESC
    `).all();

    return c.json({ applications: applications.results || [] });
  } catch (error) {
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

// ========== 用户API ==========

// 简化的用户中间件
const userAuth = async (c: any, next: any) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  // 这里应该验证JWT，简化处理
  await next();
};

// 获取用户申请状态
app.get('/api/user/applications', userAuth, async (c) => {
  try {
    // 从JWT中获取用户ID，这里简化处理
    const userId = 'user_id_from_jwt';
    
    const applications = await c.env.DB.prepare(`
      SELECT id, step, max_step, status, amount, created_at, updated_at
      FROM loan_applications 
      WHERE user_id = ?
      ORDER BY created_at DESC
    `).bind(userId).all();

    return c.json({ applications: applications.results || [] });
  } catch (error) {
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

// 创建贷款申请
app.post('/api/user/applications', userAuth, async (c) => {
  try {
    const userId = 'user_id_from_jwt'; // 从JWT获取
    const { amount, purpose } = await c.req.json();
    
    const applicationId = crypto.randomUUID();
    
    await c.env.DB.prepare(`
      INSERT INTO loan_applications (id, user_id, amount, purpose, step)
      VALUES (?, ?, ?, ?, 1)
    `).bind(applicationId, userId, amount, purpose).run();

    return c.json({ 
      success: true, 
      applicationId,
      message: 'Application created successfully'
    });
  } catch (error) {
    return c.json({ error: 'Failed to create application' }, 500);
  }
});

// 更新申请步骤
app.put('/api/user/applications/:id/step', userAuth, async (c) => {
  try {
    const applicationId = c.req.param('id');
    const { step, data } = await c.req.json();
    
    // 根据步骤更新相应字段
    let updateQuery = 'UPDATE loan_applications SET step = ?, updated_at = ? ';
    let params = [step, Math.floor(Date.now() / 1000)];
    
    // 根据步骤添加相应的字段更新
    if (step === 2 && data.idNumber && data.realName) {
      updateQuery += ', id_number = ?, real_name = ? ';
      params.push(data.idNumber, data.realName);
    } else if (step === 4 && data.contact1Name) {
      updateQuery += ', contact1_name = ?, contact1_phone = ?, contact2_name = ?, contact2_phone = ? ';
      params.push(data.contact1Name, data.contact1Phone, data.contact2Name, data.contact2Phone);
    } else if (step === 7 && data.bankCardNumber) {
      updateQuery += ', bank_card_number = ? ';
      params.push(data.bankCardNumber);
    } else if (step === 8) {
      updateQuery += ', status = ?, submitted_at = ? ';
      params.push('submitted', Math.floor(Date.now() / 1000));
    } else if (step === 10) {
      updateQuery += ', status = ?, approved_at = ?, approval_amount = ? ';
      params.push('approved', Math.floor(Date.now() / 1000), 50000);
    } else if (step === 11 && data.withdrawalAmount) {
      updateQuery += ', withdrawal_amount = ?, installment_period = ? ';
      params.push(data.withdrawalAmount, data.installmentPeriod);
    } else if (step === 12) {
      updateQuery += ', status = ? ';
      params.push('withdrawn');
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(applicationId);
    
    await c.env.DB.prepare(updateQuery).bind(...params).run();
    
    return c.json({ success: true, message: 'Step updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update step' }, 500);
  }
});

// 发送短信验证码
app.post('/api/auth/send-sms', async (c) => {
  try {
    const { phone, purpose } = await c.req.json();
    
    // 生成6位验证码
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Math.floor(Date.now() / 1000) + 300; // 5分钟后过期
    
    // 存储验证码
    await c.env.DB.prepare(`
      INSERT INTO sms_verifications (id, phone, code, purpose, expires_at)
      VALUES (?, ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), phone, code, purpose, expiresAt).run();
    
    // 这里应该调用短信服务发送验证码
    // 为了演示，我们直接返回成功
    console.log(`发送验证码到 ${phone}: ${code}`);
    
    return c.json({ success: true, message: 'SMS sent successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to send SMS' }, 500);
  }
});

// 验证短信验证码
app.post('/api/auth/verify-sms', async (c) => {
  try {
    const { phone, code } = await c.req.json();
    
    // 查询验证码
    const verification = await c.env.DB.prepare(`
      SELECT * FROM sms_verifications 
      WHERE phone = ? AND code = ? AND verified = FALSE AND expires_at > ?
      ORDER BY created_at DESC LIMIT 1
    `).bind(phone, code, Math.floor(Date.now() / 1000)).first();
    
    if (!verification) {
      return c.json({ error: 'Invalid or expired code' }, 400);
    }
    
    // 标记为已验证
    await c.env.DB.prepare(`
      UPDATE sms_verifications SET verified = TRUE WHERE id = ?
    `).bind(verification.id).run();
    
    // 创建或更新用户
    const userId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT OR REPLACE INTO users (id, phone, phone_verified, status)
      VALUES (?, ?, TRUE, 'active')
    `).bind(userId, phone).run();
    
    // 创建会话
    const token = crypto.randomUUID();
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7天
    
    await c.env.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).bind(crypto.randomUUID(), userId, token, expiresAt).run();
    
    return c.json({ 
      success: true, 
      token,
      user: { id: userId, phone, phone_verified: true }
    });
  } catch (error) {
    return c.json({ error: 'Failed to verify SMS' }, 500);
  }
});

// 其他API占位符
app.all('/api/*', (c) => c.json({ message: 'API endpoint under development' }));

export default app; 