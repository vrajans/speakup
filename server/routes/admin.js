import express from 'express';
import db from '../database.js';
const router = express.Router();

// Simple password check middleware
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'speakup-admin-2024';

router.use((req, res, next) => {
  const auth = req.headers['x-admin-key'] || req.query.key;
  if (auth !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// All users with profiles and stats
router.get('/users', async (req, res) => {
  try {
    const users = await db.allAsync(`
      SELECT 
        u.id, u.name, u.email, u.created_at,
        p.role, p.industry, p.work_country, p.english_level,
        p.native_language, p.challenges, p.goal_90_days,
        p.onboarding_complete,
        s.streak, s.longest_streak, s.total_sessions, s.last_session_date
      FROM users u
      LEFT JOIN user_profiles p ON p.user_id = u.id
      LEFT JOIN user_stats s ON s.user_id = u.id
      ORDER BY u.created_at DESC
    `);
    res.json(users.map(u => ({
      ...u,
      challenges: u.challenges ? JSON.parse(u.challenges) : []
    })));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Overall stats
router.get('/overview', async (req, res) => {
  try {
    const totalUsers = await db.getAsync('SELECT COUNT(*) as count FROM users WHERE email != "guest@speakup.local"');
    const completedOnboarding = await db.getAsync('SELECT COUNT(*) as count FROM user_profiles WHERE onboarding_complete = 1');
    const totalSessions = await db.getAsync('SELECT COUNT(*) as count FROM sessions');
    const totalRecordings = await db.getAsync('SELECT COUNT(*) as count FROM recordings');
    const totalJournal = await db.getAsync('SELECT COUNT(*) as count FROM journal');
    const activeToday = await db.getAsync(`SELECT COUNT(DISTINCT user_id) as count FROM sessions WHERE date = date('now')`);
    const activeWeek = await db.getAsync(`SELECT COUNT(DISTINCT user_id) as count FROM sessions WHERE date >= date('now', '-7 days')`);
    const recentSignups = await db.allAsync(`SELECT name, email, created_at FROM users WHERE email != 'guest@speakup.local' ORDER BY created_at DESC LIMIT 5`);
    const topCountries = await db.allAsync(`SELECT work_country, COUNT(*) as count FROM user_profiles WHERE work_country != '' GROUP BY work_country ORDER BY count DESC LIMIT 5`);
    const topChallenges = await db.allAsync(`SELECT challenges FROM user_profiles WHERE challenges != '[]' AND challenges != ''`);

    // Count challenge frequency
    const challengeCount = {};
    topChallenges.forEach(row => {
      try {
        const ch = JSON.parse(row.challenges || '[]');
        ch.forEach(c => { challengeCount[c] = (challengeCount[c] || 0) + 1; });
      } catch (e) {}
    });
    const sortedChallenges = Object.entries(challengeCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

    res.json({
      totalUsers: totalUsers.count,
      completedOnboarding: completedOnboarding.count,
      totalSessions: totalSessions.count,
      totalRecordings: totalRecordings.count,
      totalJournal: totalJournal.count,
      activeToday: activeToday.count,
      activeWeek: activeWeek.count,
      recentSignups,
      topCountries,
      topChallenges: sortedChallenges
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Session activity last 14 days
router.get('/activity', async (req, res) => {
  try {
    const activity = await db.allAsync(`
      SELECT date, COUNT(*) as sessions, COUNT(DISTINCT user_id) as users
      FROM sessions
      WHERE date >= date('now', '-14 days')
      GROUP BY date
      ORDER BY date ASC
    `);
    res.json(activity);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
