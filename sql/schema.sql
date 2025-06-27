-- D1 schema for diliinfo

-- 用户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  hashed_pass TEXT NOT NULL,
  created_at INTEGER DEFAULT (strftime('%s','now'))
);

-- 贷款申请
CREATE TABLE IF NOT EXISTS loan_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  step INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft',
  meta TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 上传材料
CREATE TABLE IF NOT EXISTS uploads (
  id TEXT PRIMARY KEY,
  application_id TEXT NOT NULL,
  filename TEXT,
  file_url TEXT,
  created_at INTEGER DEFAULT (strftime('%s','now')),
  FOREIGN KEY (application_id) REFERENCES loan_applications(id)
);

-- 访问统计
CREATE TABLE IF NOT EXISTS page_views (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  path TEXT,
  ts INTEGER DEFAULT (strftime('%s','now'))
); 