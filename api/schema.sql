-- Users table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT DEFAULT '',
  name TEXT DEFAULT '',
  plan TEXT DEFAULT 'free',
  analysis_count INTEGER DEFAULT 0,
  provider TEXT DEFAULT 'email',
  avatar TEXT DEFAULT '',
  totp_secret TEXT DEFAULT '',
  created_at TEXT NOT NULL
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  channel_id TEXT NOT NULL,
  channel_name TEXT,
  platform TEXT DEFAULT 'youtube',
  data TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_channel ON reports(channel_id);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at);

-- Admin 2FA sessions
CREATE TABLE IF NOT EXISTS admin_sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
