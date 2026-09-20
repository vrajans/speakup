// Railway-compatible database using node:sqlite (Node 22+)
// Falls back to in-memory store if SQLite unavailable

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data');
const recordingsDir = join(dataDir, 'recordings');

// Ensure directories exist
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
if (!existsSync(recordingsDir)) mkdirSync(recordingsDir, { recursive: true });

const dbPath = join(dataDir, 'speakup.db');

let db;

try {
  const { DatabaseSync } = await import('node:sqlite');
  db = new DatabaseSync(dbPath);
  console.log('✓ SQLite connected (node:sqlite):', dbPath);
} catch (e) {
  console.error('node:sqlite failed:', e.message);
  console.log('Trying better-sqlite3...');
  try {
    const { default: Database } = await import('better-sqlite3');
    db = new Database(dbPath);
    console.log('✓ SQLite connected (better-sqlite3):', dbPath);
  } catch (e2) {
    console.error('better-sqlite3 also failed:', e2.message);
    throw new Error('No SQLite implementation available. Node version: ' + process.version);
  }
}

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

db.exec(`INSERT OR IGNORE INTO users (id, name, email) VALUES (1, 'Guest', 'guest@speakup.local')`);
db.exec(`INSERT OR IGNORE INTO user_stats (user_id) VALUES (1)`);

// ── WRAPPERS ──────────────────────────────────────────────────────────────
db.runAsync = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const safe = params.map(p => {
      if (p === undefined) return null;
      if (Array.isArray(p)) return JSON.stringify(p);
      return p;
    });
    const result = safe.length ? stmt.run(...safe) : stmt.run();
    return Promise.resolve({ lastID: result.lastInsertRowid, changes: result.changes });
  } catch (e) {
    console.error('DB runAsync error:', e.message, '\nSQL:', sql.slice(0, 100));
    return Promise.reject(e);
  }
};

db.getAsync = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const safe = params.map(p => p === undefined ? null : p);
    const result = safe.length ? stmt.get(...safe) : stmt.get();
    return Promise.resolve(result);
  } catch (e) {
    console.error('DB getAsync error:', e.message, '\nSQL:', sql.slice(0, 100));
    return Promise.reject(e);
  }
};

db.allAsync = (sql, params = []) => {
  try {
    const stmt = db.prepare(sql);
    const safe = params.map(p => p === undefined ? null : p);
    const result = safe.length ? stmt.all(...safe) : stmt.all();
    return Promise.resolve(result);
  } catch (e) {
    console.error('DB allAsync error:', e.message, '\nSQL:', sql.slice(0, 100));
    return Promise.reject(e);
  }
};

db.saveProfile = (userId, data) => {
  try {
    const uid = Number(userId);
    const challenges = Array.isArray(data.challenges)
      ? JSON.stringify(data.challenges)
      : String(data.challenges || '[]');

    const existing = db.prepare('SELECT id FROM user_profiles WHERE user_id = ?').get(uid);

    if (existing) {
      db.prepare(`UPDATE user_profiles SET
        role=?, industry=?, years_experience=?,
        english_level=?, native_language=?, years_in_english_env=?,
        work_country=?, work_environment=?, primary_audience=?,
        challenges=?, goal_90_days=?, goal_long_term=?,
        onboarding_complete=1, updated_at=datetime('now')
        WHERE user_id=?`).run(
        String(data.role || ''),
        String(data.industry || ''),
        Number(data.years_experience) || 0,
        String(data.english_level || ''),
        String(data.native_language || ''),
        String(data.years_in_english_env || ''),
        String(data.work_country || ''),
        String(data.work_environment || ''),
        String(data.primary_audience || ''),
        challenges,
        String(data.goal_90_days || ''),
        String(data.goal_long_term || ''),
        uid
      );
    } else {
      db.prepare(`INSERT INTO user_profiles
        (user_id, role, industry, years_experience,
         english_level, native_language, years_in_english_env,
         work_country, work_environment, primary_audience,
         challenges, goal_90_days, goal_long_term, onboarding_complete)
        VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,1)`).run(
        uid,
        String(data.role || ''),
        String(data.industry || ''),
        Number(data.years_experience) || 0,
        String(data.english_level || ''),
        String(data.native_language || ''),
        String(data.years_in_english_env || ''),
        String(data.work_country || ''),
        String(data.work_environment || ''),
        String(data.primary_audience || ''),
        challenges,
        String(data.goal_90_days || ''),
        String(data.goal_long_term || '')
      );
    }

    const saved = db.prepare('SELECT * FROM user_profiles WHERE user_id = ?').get(uid);
    return saved;
  } catch (e) {
    console.error('saveProfile error:', e.message);
    throw e;
  }
};

console.log('✓ All database tables ready');
export default db;
