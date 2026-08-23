-- ===============================================================================
-- TopMCQBD - Cloudflare D1 SQL Schema & Initial Seed
-- ===============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'customer',           -- 'owner', 'admin', 'customer'
    subscription_plan TEXT DEFAULT 'none',  -- '1_month', '3_months', '6_months', '1_year', '2_years', '3_years', 'none'
    subscription_active INTEGER DEFAULT 0,  -- 0 = Inactive, 1 = Active
    subscription_startDate TEXT,
    subscription_endDate TEXT,
    pendingRequests TEXT DEFAULT '[]',      -- JSON string array of payment requests
    createdAt TEXT,
    lastLogin TEXT
);

-- 2. Questions / Quiz Table
CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    q TEXT NOT NULL,
    options TEXT NOT NULL,                  -- JSON string array: ["Option A", "Option B", "Option C", "Option D"]
    ans INTEGER NOT NULL DEFAULT 0,         -- 0, 1, 2, 3 index
    explanation TEXT DEFAULT '',
    category TEXT DEFAULT '',
    subCategory TEXT DEFAULT '',
    subject TEXT DEFAULT '',
    year TEXT DEFAULT '',
    examType TEXT DEFAULT '',
    tags TEXT DEFAULT '[]',                 -- JSON string: ["bcs", "primary"]
    isPaid INTEGER DEFAULT 0,               -- 0 = Free, 1 = Paid
    createdAt TEXT
);

-- 3. Dynamic Site Configs Table (Header, Footer, Sliders, Policies)
CREATE TABLE IF NOT EXISTS configs (
    key TEXT PRIMARY KEY,                   -- 'layout', 'home', 'sidebar', 'policy'
    value TEXT NOT NULL                     -- JSON string of configuration
);

-- Indexes for ultra-fast query execution
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_questions_category ON questions(category);
CREATE INDEX IF NOT EXISTS idx_questions_isPaid ON questions(isPaid);

-- ===============================================================================
-- Initial Seed Data
-- ===============================================================================

-- Initial Owner & Admin Users (Passwords: 'ownerpassword1234' / 'adminpassword1234')
INSERT OR IGNORE INTO users (id, name, email, password, role, subscription_plan, subscription_active, subscription_startDate, subscription_endDate, pendingRequests, createdAt)
VALUES 
(
    'usr_owner_01',
    'Mosabber Owner',
    'mosabber.tech@gmail.com',
    '$2b$10$bDd2xSP3wTnsMatA4dZNZOPy0OrcgLJMPii2FsXVKTcIP/mIsUV7q',
    'owner',
    '3_years',
    1,
    '2026-01-01T00:00:00.000Z',
    '2029-01-01T00:00:00.000Z',
    '[]',
    '2026-01-01T00:00:00.000Z'
),
(
    'usr_owner_02',
    'Admin Mosabber',
    'mosabber480@gmail.com',
    '$2b$10$bDd2xSP3wTnsMatA4dZNZOPy0OrcgLJMPii2FsXVKTcIP/mIsUV7q',
    'owner',
    '3_years',
    1,
    '2026-01-01T00:00:00.000Z',
    '2029-01-01T00:00:00.000Z',
    '[]',
    '2026-01-01T00:00:00.000Z'
),
(
    'usr_test_01',
    'Test Customer',
    'user@example.com',
    '$2b$10$fiil7GNKXBc5oYDNi9W66.r6DWjx6RWZlBwW1aR/KAl6hlAWzPu0i',
    'customer',
    'none',
    0,
    NULL,
    NULL,
    '[]',
    '2026-01-01T00:00:00.000Z'
);
