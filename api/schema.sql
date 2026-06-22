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

-- Users table (Phase 1 auth)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  name TEXT,
  plan TEXT DEFAULT 'free',
  analysis_count INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_reports_user ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_channel ON reports(channel_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
