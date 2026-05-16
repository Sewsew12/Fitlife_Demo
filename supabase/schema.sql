-- Run this in your Supabase project's SQL Editor
-- (Dashboard → SQL Editor → New query → paste → Run)

-- Users
CREATE TABLE IF NOT EXISTS demo_users (
  id            BIGSERIAL PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  name          TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- Activities
CREATE TABLE IF NOT EXISTS demo_activities (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES demo_users(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  duration   INT NOT NULL,          -- minutes
  calories   INT DEFAULT 0,
  notes      TEXT DEFAULT '',
  logged_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Food logs
CREATE TABLE IF NOT EXISTS demo_food_logs (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES demo_users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL,
  calories   INT NOT NULL,
  protein    NUMERIC(6,2) DEFAULT 0,
  carbs      NUMERIC(6,2) DEFAULT 0,
  fat        NUMERIC(6,2) DEFAULT 0,
  meal_type  TEXT DEFAULT 'snack',  -- breakfast | lunch | dinner | snack
  logged_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for fast per-user queries
CREATE INDEX IF NOT EXISTS idx_activities_user_date ON demo_activities (user_id, logged_at DESC);
CREATE INDEX IF NOT EXISTS idx_food_user_date       ON demo_food_logs   (user_id, logged_at DESC);

-- Disable RLS for these tables (this is a private demo backend using the service role key)
ALTER TABLE demo_users      DISABLE ROW LEVEL SECURITY;
ALTER TABLE demo_activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE demo_food_logs  DISABLE ROW LEVEL SECURITY;
