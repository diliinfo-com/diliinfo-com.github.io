import { Hono } from 'hono';
import { cors } from 'hono/cors';

export interface Env {
  DB: any; // D1Database类型在某些环境下可能不可用，使用any作为兼容
  JWT_SECRET: string;
  TIKTOK_ACCESS_TOKEN: string; // 添加TikTok访问令牌环境变量
}

const app = new Hono<{ Bindings: Env; Variables: { user: any; admin: any } }>();

// CORS设置 - 针对Safari和移动端浏览器严格优化
app.use('*', cors({
  origin: (origin, c) => {
    // Safari需要明确的origin匹配，不支持通配符
    const allowedOrigins = [
      'http://localhost:5173', 
      'https://diliinfo-com.github.io',
      'https://diliinfo.com',
      'https://www.diliinfo.com'
    ];
    
    // 如果没有origin（同源请求）或在允许列表中，则允许
    if (!origin || allowedOrigins.includes(origin)) {
      return origin || '*';
    }
    
    // 检查是否是github.io子域名
    if (origin.endsWith('.github.io')) {
      return origin;
    }
    
    return null;
  },
  allowHeaders: [
    'Content-Type', 
    'Authorization', 
    'Accept',
    'X-Session-ID'
  ],
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: false, // Safari严格要求：避免Cookie问题
  maxAge: 3600, // 减少预检缓存时间，提高兼容性
}));

// Safari专用的CORS处理中间件
app.use('*', async (c, next) => {
  // 手动设置Safari需要的CORS头
  const origin = c.req.header('Origin');
  const allowedOrigins = [
    'http://localhost:5173', 
    'https://diliinfo-com.github.io',
    'https://diliinfo.com',
    'https://www.diliinfo.com'
  ];
  
  if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.github.io')) {
    c.header('Access-Control-Allow-Origin', origin || '*');
    c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Session-ID');
    c.header('Access-Control-Max-Age', '3600');
  }
  
  await next();
});

// 添加额外的响应头以提高兼容性
app.use('*', async (c, next) => {
  // 设置安全和兼容性响应头
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Safari兼容性头
  c.header('Cache-Control', 'no-cache, no-store, must-revalidate');
  c.header('Pragma', 'no-cache');
  c.header('Expires', '0');
  
  await next();
});

// 处理预检请求
app.options('*', (c) => {
  return new Response('', { status: 204 });
});

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
    const { phone, password, applicationId } = await c.req.json();
    
    if (!phone || !password) {
      return c.json({ error: 'Phone and password required' }, 400);
    }

    // 检查用户是否已存在
    const existingUser = await c.env.DB.prepare(`
      SELECT id FROM users WHERE phone = ?
    `).bind(phone).first();
    
    if (existingUser) {
      return c.json({ error: 'Phone number already registered' }, 400);
    }
    
    // 哈希密码
    const hashedPassword = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(password));
    const hashedPasswordHex = Array.from(new Uint8Array(hashedPassword)).map(b => b.toString(16).padStart(2, '0')).join('');
    
    const userId = crypto.randomUUID();
    
    // 创建用户
    await c.env.DB.prepare(`
      INSERT INTO users (id, phone, hashed_pass, phone_verified, status, created_at)
      VALUES (?, ?, ?, TRUE, 'active', ?)
    `).bind(userId, phone, hashedPasswordHex, Math.floor(Date.now() / 1000)).run();
    
    // 记录活动
    await c.env.DB.prepare(`
      INSERT INTO user_activities (id, user_id, activity_type, activity_data)
      VALUES (?, ?, 'register', ?)
    `).bind(crypto.randomUUID(), userId, JSON.stringify({ phone, source: 'loan_application' })).run();
    
    // 如果有申请ID，关联申请
    if (applicationId) {
      await c.env.DB.prepare(`
        UPDATE loan_applications 
        SET user_id = ?, phone = ?, is_guest = FALSE, updated_at = ?
        WHERE id = ?
      `).bind(userId, phone, Math.floor(Date.now() / 1000), applicationId).run();
      
      // 记录步骤
      await c.env.DB.prepare(`
        INSERT INTO application_steps (id, application_id, step_number, step_name, step_data, ip_address)
        VALUES (?, ?, 1, 'user_registration', ?, ?)
      `).bind(crypto.randomUUID(), applicationId, JSON.stringify({ phone, registered: true }), c.req.header('CF-Connecting-IP') || '').run();
    } else {
      // 如果没有申请ID，为用户创建一个新的申请记录
      const newApplicationId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO loan_applications (id, user_id, phone, step, is_guest, started_at, created_at, updated_at)
        VALUES (?, ?, ?, 1, FALSE, ?, ?, ?)
      `).bind(newApplicationId, userId, phone, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)).run();
      
      // 记录步骤
      await c.env.DB.prepare(`
        INSERT INTO application_steps (id, application_id, step_number, step_name, step_data, ip_address)
        VALUES (?, ?, 1, 'user_registration', ?, ?)
      `).bind(crypto.randomUUID(), newApplicationId, JSON.stringify({ phone, registered: true, source: 'direct_registration' }), c.req.header('CF-Connecting-IP') || '').run();
    }
    
    // 创建会话
    const token = crypto.randomUUID();
    const expiresAt = Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60;
    
    await c.env.DB.prepare(`
      INSERT INTO user_sessions (id, user_id, token, expires_at)
      VALUES (?, ?, ?, ?)
    `).bind(crypto.randomUUID(), userId, token, expiresAt).run();
    
    return c.json({ 
      success: true, 
      token,
      user: { id: userId, phone, phone_verified: true },
      applicationId: applicationId || null
    });
  } catch (error) {
    console.error(error);
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack
    });
    return c.json({ 
      error: 'Error al registrar', 
      debug: error.message 
    }, 500);
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

// 获取所有申请详情（包括访客申请）
app.get('/api/admin/applications', adminAuth, async (c) => {
  try {
    // 获取查询参数
    const startDate = c.req.query('startDate');
    const endDate = c.req.query('endDate');
    
    console.log('后端接收到的日期参数:', { startDate, endDate });
    console.log('参数类型:', { startDateType: typeof startDate, endDateType: typeof endDate });
    
    let whereClause = '';
    let params: any[] = [];
    
    // 如果提供了日期范围，添加WHERE条件
    if (startDate && endDate) {
      const startTimestamp = parseInt(startDate);
      const endTimestamp = parseInt(endDate);
      console.log('转换后的时间戳:', { startTimestamp, endTimestamp });
      console.log('时间戳是否有效:', { 
        startValid: !isNaN(startTimestamp), 
        endValid: !isNaN(endTimestamp),
        startDate: new Date(startTimestamp * 1000).toISOString(),
        endDate: new Date(endTimestamp * 1000).toISOString()
      });
      
      whereClause = ' WHERE la.created_at >= ? AND la.created_at <= ?';
      params = [startTimestamp, endTimestamp];
    } else {
      console.log('没有提供日期参数，返回所有数据');
    }
    
    let query = `
      SELECT 
        la.*,
        u.email,
        u.first_name,
        u.last_name,
        (SELECT COUNT(*) FROM uploads WHERE application_id = la.id) as upload_count,
        (SELECT COALESCE(MAX(step_number), 0) FROM application_steps WHERE application_id = la.id) as completed_steps
      FROM 
        loan_applications la
      LEFT JOIN 
        users u ON la.user_id = u.id
      ${whereClause}
      ORDER BY 
        la.started_at DESC`;
    
    console.log('最终查询SQL:', query);
    console.log('查询参数:', params);
    
    const applications = params.length > 0 
      ? await c.env.DB.prepare(query).bind(...params).all()
      : await c.env.DB.prepare(query).all();

    console.log('查询结果数量:', applications.results?.length || 0);
    
    // 如果有过滤条件，显示前几条数据的时间戳用于调试
    if (params.length > 0 && applications.results && applications.results.length > 0) {
      console.log('前3条数据的时间戳:', applications.results.slice(0, 3).map((app: any) => ({
        id: app.id,
        created_at: app.created_at,
        created_at_date: new Date(app.created_at * 1000).toISOString()
      })));
    }
    
    return c.json({ applications: applications.results || [] });
  } catch (error) {
    return c.json({ error: 'Failed to fetch applications' }, 500);
  }
});

// 获取访客申请详情
app.get('/api/admin/applications/guests', adminAuth, async (c) => {
  try {
    const guestApplications = await c.env.DB.prepare(`
      SELECT la.id, la.phone, la.session_id, la.step, la.status, 
             la.started_at, la.created_at, la.updated_at,
             COALESCE(MAX(aps.step_number), 0) as completed_steps,
             GROUP_CONCAT(aps.step_name) as step_names
      FROM loan_applications la
      LEFT JOIN application_steps aps ON la.id = aps.application_id
      WHERE la.is_guest = TRUE
      GROUP BY la.id
      ORDER BY la.started_at DESC
    `).all();

    return c.json({ guestApplications: guestApplications.results || [] });
  } catch (error) {
    return c.json({ error: 'Failed to fetch guest applications' }, 500);
  }
});

// 获取特定申请的步骤详情
app.get('/api/admin/applications/:id/steps', adminAuth, async (c) => {
  try {
    const applicationId = c.req.param('id');
    
    const steps = await c.env.DB.prepare(`
      SELECT * FROM application_steps 
      WHERE application_id = ?
      ORDER BY step_number ASC, completed_at ASC
    `).bind(applicationId).all();

    const application = await c.env.DB.prepare(`
      SELECT la.*, u.email, u.first_name, u.last_name, u.phone as user_phone,
             COALESCE(MAX(aps.step_number), 0) as completed_steps
      FROM loan_applications la
      LEFT JOIN users u ON la.user_id = u.id
      LEFT JOIN application_steps aps ON la.id = aps.application_id
      WHERE la.id = ?
      GROUP BY la.id
    `).bind(applicationId).first();

    return c.json({ 
      application: application || null,
      steps: steps.results || [] 
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch application steps' }, 500);
  }
});

// ========== 申请API ==========

// 创建访客申请
app.post('/api/applications/guest', async (c) => {
  try {
    const sessionId = c.req.header('X-Session-ID') || crypto.randomUUID();
    const ip = c.req.header('CF-Connecting-IP') || '';
    const userAgent = c.req.header('User-Agent') || '';
    
    const applicationId = crypto.randomUUID();
    
    // 创建访客申请记录
    await c.env.DB.prepare(`
      INSERT INTO loan_applications (id, session_id, step, is_guest, started_at, created_at)
      VALUES (?, ?, 1, TRUE, ?, ?)
    `).bind(applicationId, sessionId, Math.floor(Date.now() / 1000), Math.floor(Date.now() / 1000)).run();
    
    // 记录初始步骤
    await c.env.DB.prepare(`
      INSERT INTO application_steps (id, application_id, step_number, step_name, ip_address, user_agent)
      VALUES (?, ?, 1, 'application_started', ?, ?)
    `).bind(crypto.randomUUID(), applicationId, ip, userAgent).run();
    
    return c.json({ 
      success: true, 
      applicationId,
      sessionId,
      message: 'Guest application created'
    });
  } catch (error) {
    return c.json({ error: 'Failed to create guest application' }, 500);
  }
});

// 更新申请步骤（支持访客和用户）
app.put('/api/applications/:id/step', async (c) => {
  try {
    const applicationId = c.req.param('id');
    const { step, data, phone } = await c.req.json();
    const ip = c.req.header('CF-Connecting-IP') || '';
    const userAgent = c.req.header('User-Agent') || '';
    
    // 更新申请步骤
    let updateQuery = 'UPDATE loan_applications SET step = ?, updated_at = ? ';
    let params = [step, Math.floor(Date.now() / 1000)];
    
    // 如果有手机号，先记录（在验证之前）
    if (phone && step === 1) {
      updateQuery += ', phone = ? ';
      params.push(phone);
    }
    
    // 根据步骤添加相应的字段更新
    if (step === 2 && data?.idNumber && data?.realName) {
      updateQuery += ', id_number = ?, real_name = ? ';
      params.push(data.idNumber, data.realName);
    } else if (step === 4 && data?.contact1Name) {
      updateQuery += ', contact1_name = ?, contact1_phone = ?, contact2_name = ?, contact2_phone = ? ';
      params.push(data.contact1Name, data.contact1Phone, data.contact2Name, data.contact2Phone);
    } else if (step === 7 && data?.bankCardNumber) {
      updateQuery += ', bank_card_number = ? ';
      params.push(data.bankCardNumber);
    } else if (step === 8) {
      updateQuery += ', status = ?, submitted_at = ? ';
      params.push('submitted', Math.floor(Date.now() / 1000));
    } else if (step === 10) {
      updateQuery += ', status = ?, approved_at = ?, approval_amount = ? ';
      params.push('approved', Math.floor(Date.now() / 1000), 50000);
    } else if (step === 11 && data?.withdrawalAmount) {
      updateQuery += ', withdrawal_amount = ?, installment_period = ? ';
      params.push(data.withdrawalAmount, data.installmentPeriod);
    } else if (step === 12) {
      updateQuery += ', status = ? ';
      params.push('withdrawn');
    }
    
    updateQuery += ' WHERE id = ?';
    params.push(applicationId);
    
    await c.env.DB.prepare(updateQuery).bind(...params).run();
    
    // 记录步骤完成
    const stepNames = {
      1: 'phone_verification',
      2: 'identity_info',
      3: 'id_upload',
      4: 'contacts_info',
      5: 'liveness_detection',
      6: 'credit_authorization',
      7: 'bank_card',
      8: 'application_submit',
      9: 'processing',
      10: 'approved',
      11: 'withdrawal',
      12: 'completed'
    };
    
    await c.env.DB.prepare(`
      INSERT INTO application_steps (id, application_id, step_number, step_name, step_data, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(), 
      applicationId, 
      step, 
      stepNames[step as keyof typeof stepNames] || `step_${step}`,
      JSON.stringify(data || {}),
      ip,
      userAgent
    ).run();
    
    return c.json({ success: true, message: 'Step updated successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to update step' }, 500);
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
    const { phone, code, applicationId } = await c.req.json();
    
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
    
    // 检查用户是否已存在
    let user = await c.env.DB.prepare(`
      SELECT * FROM users WHERE phone = ?
    `).bind(phone).first();
    
    let userId;
    if (!user) {
      // 自动注册新用户
      userId = crypto.randomUUID();
      await c.env.DB.prepare(`
        INSERT INTO users (id, phone, phone_verified, status, created_at)
        VALUES (?, ?, TRUE, 'active', ?)
      `).bind(userId, phone, Math.floor(Date.now() / 1000)).run();
      
      // 记录用户活动
      await c.env.DB.prepare(`
        INSERT INTO user_activities (id, user_id, activity_type, activity_data)
        VALUES (?, ?, 'auto_register', ?)
      `).bind(crypto.randomUUID(), userId, JSON.stringify({ phone, source: 'loan_application' })).run();
    } else {
      userId = user.id;
      // 更新手机验证状态
      await c.env.DB.prepare(`
        UPDATE users SET phone_verified = TRUE WHERE id = ?
      `).bind(userId).run();
    }
    
    // 如果有关联的申请，将访客申请转换为用户申请
    if (applicationId) {
      await c.env.DB.prepare(`
        UPDATE loan_applications 
        SET user_id = ?, phone = ?, is_guest = FALSE, updated_at = ?
        WHERE id = ?
      `).bind(userId, phone, Math.floor(Date.now() / 1000), applicationId).run();
      
      // 记录步骤完成
      await c.env.DB.prepare(`
        INSERT INTO application_steps (id, application_id, step_number, step_name, step_data, ip_address)
        VALUES (?, ?, 1, 'phone_verification', ?, ?)
      `).bind(crypto.randomUUID(), applicationId, JSON.stringify({ phone, verified: true }), c.req.header('CF-Connecting-IP') || '').run();
    }
    
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
      user: { id: userId, phone, phone_verified: true },
      applicationId: applicationId || null
    });
  } catch (error) {
    return c.json({ error: 'Failed to verify SMS' }, 500);
  }
});

// TikTok API路由
app.get('/api/tiktok/token', async (c) => {
  // 这里应该添加适当的身份验证
  return c.json({
    success: true,
    token: c.env.TIKTOK_ACCESS_TOKEN || ''
  });
});

// 其他API占位符
app.all('/api/*', (c) => c.json({ message: 'API endpoint under development' }));

export default app; 
