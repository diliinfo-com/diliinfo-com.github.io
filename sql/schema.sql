-- D1 schema for diliinfo

-- 管理员表
CREATE TABLE IF NOT EXISTS admins (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  hashed_pass TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at INTEGER DEFAULT (strftime('%s','now')),
  last_login_at INTEGER
);

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  phone TEXT UNIQUE,
  hashed_pass TEXT,
  first_name TEXT,
  last_name TEXT,
  phone_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'active',
  created_at INTEGER DEFAULT (strftime('%s','now')),
  updated_at INTEGER DEFAULT (strftime('%s','now'))
);

-- 短信验证码表
CREATE TABLE IF NOT EXISTS sms_verifications (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  code TEXT NOT NULL,
  purpose TEXT NOT NULL, -- 'register', 'login', 'reset_password'
  expires_at INTEGER NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

-- 用户会话表
CREATE TABLE IF NOT EXISTS user_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 管理员会话表
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY (admin_id) REFERENCES admins(id)
);

-- 贷款申请
CREATE TABLE IF NOT EXISTS loan_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT, -- 允许为空，用于访客申请
  phone TEXT, -- 添加手机号字段，可以在验证前记录
  session_id TEXT, -- 访客会话ID
  step INTEGER DEFAULT 1,
  max_step INTEGER DEFAULT 12,
  status TEXT DEFAULT 'draft', -- 'draft', 'submitted', 'approved', 'rejected', 'withdrawn'
  is_guest BOOLEAN DEFAULT TRUE, -- 是否为访客申请
  -- 基本信息
  amount REAL,
  purpose TEXT,
  -- 第2步：身份信息
  id_number TEXT,
  real_name TEXT,
  -- 第4步：联系人信息
  contact1_name TEXT,
  contact1_phone TEXT,
  contact2_name TEXT,
  contact2_phone TEXT,
  -- 第7步：银行卡信息
  bank_card_number TEXT,
  -- 第11步：提现信息
  withdrawal_amount REAL,
  installment_period INTEGER,
  -- 其他信息
  employment_type TEXT,
  monthly_income REAL,
  meta TEXT,
  -- 追踪信息
  started_at INTEGER DEFAULT (strftime('%s','now')), -- 开始申请时间
  submitted_at INTEGER,
  reviewed_at INTEGER,
  approved_at INTEGER,
  approval_amount REAL,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  updated_at INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 申请步骤记录表（追踪访客和用户的每一步操作）
CREATE TABLE IF NOT EXISTS application_steps (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_data TEXT, -- JSON格式存储步骤数据
  completed_at INTEGER DEFAULT (strftime('%s','now')),
  ip_address TEXT,
  user_agent TEXT,
  FOREIGN KEY (application_id) REFERENCES loan_applications(id)
);

-- 上传材料
CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  filename TEXT,
  original_name TEXT,
  file_url TEXT,
  file_type TEXT,
  file_size INTEGER,
  upload_step INTEGER,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY (application_id) REFERENCES loan_applications(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 访问统计
CREATE TABLE IF NOT EXISTS page_views (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  path TEXT,
  user_agent TEXT,
  ip_address TEXT,
  referrer TEXT,
  ts INTEGER DEFAULT (strftime('%s','now'))
);

-- 用户活动日志
CREATE TABLE IF NOT EXISTS user_activities (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  activity_type TEXT NOT NULL,
  activity_data TEXT,
  ip_address TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 插入默认管理员账户（密码: admin123，请上线后立即修改）
INSERT OR IGNORE INTO admins (id, username, email, hashed_pass) VALUES 
('admin_001', 'admin', 'admin@diliinfo.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9'); 