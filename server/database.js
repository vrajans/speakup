import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const recordingsDir = join(dataDir, 'recordings');
const dbPath = join(dataDir, 'speakup.db');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(recordingsDir)) fs.mkdirSync(recordingsDir, { recursive: true });

const db = new DatabaseSync(dbPath);
console.log('SQLite connected:', dbPath);

db.exec(`PRAGMA foreign_keys = ON`);

// ── TABLES ────────────────────────────────────────────────────────────────
db.exec(`CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL DEFAULT '',
  email TEXT UNIQUE DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
)`);

db.exec(`CREATE TABLE IF NOT EXISTS user_profiles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL,
  role TEXT DEFAULT '',
  industry TEXT DEFAULT '',
  years_experience INTEGER DEFAULT 0,
  english_level TEXT DEFAULT 'fluent',
  native_language TEXT DEFAULT '',
  years_in_english_env TEXT DEFAULT '',
  work_country TEXT DEFAULT '',
  work_environment TEXT DEFAULT '',
  primary_audience TEXT DEFAULT '',
  challenges TEXT DEFAULT '[]',
  goal_90_days TEXT DEFAULT '',
  goal_long_term TEXT DEFAULT '',
  current_phase INTEGER DEFAULT 1,
  day_number INTEGER DEFAULT 1,
  onboarding_complete INTEGER DEFAULT 0,
  updated_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (user_id) REFERENCES users(id)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 1,
  date TEXT NOT NULL,
  day_number INTEGER NOT NULL DEFAULT 1,
  theme TEXT NOT NULL DEFAULT '',
  completed INTEGER DEFAULT 0,
  score INTEGER DEFAULT 0,
  reflection TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
)`);

db.exec(`CREATE TABLE IF NOT EXISTS recordings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 1,
  session_id INTEGER,
  type TEXT NOT NULL DEFAULT 'practice',
  file_path TEXT DEFAULT '',
  transcript TEXT DEFAULT '',
  duration_seconds INTEGER DEFAULT 0,
  wpm INTEGER DEFAULT 0,
  ai_feedback TEXT DEFAULT '',
  created_at TEXT DEFAULT (datetime('now'))
)`);

db.exec(`CREATE TABLE IF NOT EXISTS journal (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER DEFAULT 1,
  text TEXT NOT NULL,
  type TEXT DEFAULT 'general',
  score INTEGER DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now'))
)`);

db.exec(`CREATE TABLE IF NOT EXISTS vocab_status (
  user_id INTEGER DEFAULT 1,
  word TEXT NOT NULL,
  status TEXT DEFAULT 'new',
  category TEXT DEFAULT 'general',
  updated_at TEXT DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, word)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS habits (
  user_id INTEGER DEFAULT 1,
  date TEXT NOT NULL,
  completed_items TEXT DEFAULT '[]',
  PRIMARY KEY (user_id, date)
)`);

db.exec(`CREATE TABLE IF NOT EXISTS user_stats (
  user_id INTEGER PRIMARY KEY,
  streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  last_session_date TEXT DEFAULT ''
)`);

// Seed defaults
db.exec(`INSERT OR IGNORE INTO users (id, name, email) VALUES (1, 'Guest', 'guest@speakup.local')`);
db.exec(`INSERT OR IGNORE INTO user_stats (user_id) VALUES (1)`);

// ── SAFE WRAPPERS ─────────────────────────────────────────────────────────
// Node 24 built-in SQLite requires named parameters OR positional with object
// We use named parameters pattern to avoid binding issues

db.runAsync = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    // Convert positional array to work reliably
    let result;
    if (params.length === 0) {
      result = stmt.run();
    } else {
      result = stmt.run(...params.map(p => {
        if (p === undefined || p === null) return null;
        if (typeof p === 'object') return JSON.stringify(p);
        return p;
      }));
    }
    return Promise.resolve({ lastID: result.lastInsertRowid, changes: result.changes });
  } catch (e) {
    console.error('runAsync error:', e.message, '\nSQL:', sql, '\nParams:', params);
    return Promise.reject(e);
  }
};

db.getAsync = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const result = params.length === 0
      ? stmt.get()
      : stmt.get(...params.map(p => (p === undefined ? null : p)));
    return Promise.resolve(result);
  } catch (e) {
    console.error('getAsync error:', e.message, '\nSQL:', sql);
    return Promise.reject(e);
  }
};

db.allAsync = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const result = params.length === 0
      ? stmt.all()
      : stmt.all(...params.map(p => (p === undefined ? null : p)));
    return Promise.resolve(result);
  } catch (e) {
    console.error('allAsync error:', e.message, '\nSQL:', sql);
    return Promise.reject(e);
  }
};

// Special helper for profile saves using named parameters
db.saveProfile = (userId, data) => {
  try {
    const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(userId);
    
    const challengesStr = Array.isArray(data.challenges)
      ? JSON.stringify(data.challenges)
      : String(data.challenges || '[]');

    if (existing) {
      db.prepare(`UPDATE user_profiles SET
        role = ?, industry = ?, years_experience = ?,
        english_level = ?, native_language = ?, years_in_english_env = ?,
        work_country = ?, work_environment = ?, primary_audience = ?,
        challenges = ?, goal_90_days = ?, goal_long_term = ?,
        onboarding_complete = 1, updated_at = datetime('now')
        WHERE user_id = ?`).run(
          String(data.role || ''),
          String(data.industry || ''),
          Number(data.years_experience) || 0,
          String(data.english_level || ''),
          String(data.native_language || ''),
          String(data.years_in_english_env || ''),
          String(data.work_country || ''),
          String(data.work_environment || ''),
          String(data.primary_audience || ''),
          challengesStr,
          String(data.goal_90_days || ''),
          String(data.goal_long_term || ''),
          Number(userId)
      );
    } else {
      db.prepare(`INSERT INTO user_profiles
        (user_id, role, industry, years_experience,
         english_level, native_language, years_in_english_env,
         work_country, work_environment, primary_audience,
         challenges, goal_90_days, goal_long_term, onboarding_complete)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`).run(
          Number(userId),
          String(data.role || ''),
          String(data.industry || ''),
          Number(data.years_experience) || 0,
          String(data.english_level || ''),
          String(data.native_language || ''),
          String(data.years_in_english_env || ''),
          String(data.work_country || ''),
          String(data.work_environment || ''),
          String(data.primary_audience || ''),
          challengesStr,
          String(data.goal_90_days || ''),
          String(data.goal_long_term || '')
      );
    }

    return db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(Number(userId));
  } catch (e) {
    console.error('saveProfile error:', e.message);
    throw e;
  }
};

console.log('All tables ready');
export default db;
