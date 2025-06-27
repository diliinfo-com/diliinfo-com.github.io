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
  email TEXT UNIQUE NOT NULL,
  hashed_pass TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'active',
  created_at INTEGER DEFAULT (strftime('%s','now')),
  updated_at INTEGER DEFAULT (strftime('%s','now'))
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
  user_id TEXT NOT NULL,
  step INTEGER DEFAULT 0,
  max_step INTEGER DEFAULT 6,
  status TEXT DEFAULT 'draft',
  amount REAL,
  purpose TEXT,
  employment_type TEXT,
  monthly_income REAL,
  meta TEXT,
  submitted_at INTEGER,
  reviewed_at INTEGER,
  approved_at INTEGER,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  updated_at INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
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