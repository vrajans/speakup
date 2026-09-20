import express from 'express';
import db from '../database.js';

const router = express.Router();

// ── REGISTER ──────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email } = req.body;
    if (!name) return res.status(400).json({ error: 'Name is required' });

    const emailToUse = (email || '').trim() || `user_${Date.now()}@speakup.local`;

    // Check existing
    const existing = await db.getAsync('SELECT * FROM users WHERE email = ?', [emailToUse]);
    if (existing) {
      const profile = await db.getAsync('SELECT * FROM user_profiles WHERE user_id = ?', [existing.id]);
      const stats = await db.getAsync('SELECT * FROM user_stats WHERE user_id = ?', [existing.id]);
      return res.json({
        user: existing,
        profile: profile ? { ...profile, challenges: JSON.parse(profile.challenges || '[]') } : null,
        stats: stats || { streak: 0, total_sessions: 0 },
        isExisting: true
      });
    }

    const result = await db.runAsync(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [String(name), emailToUse]
    );
    const userId = result.lastID;
    await db.runAsync('INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)', [userId]);
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [userId]);
    res.json({ user, profile: null, stats: { streak: 0, total_sessions: 0 }, isExisting: false });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await db.getAsync('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(404).json({ error: 'No account found with that email.' });
    const profile = await db.getAsync('SELECT * FROM user_profiles WHERE user_id = ?', [user.id]);
    const stats = await db.getAsync('SELECT * FROM user_stats WHERE user_id = ?', [user.id]);
    const jCount = await db.getAsync('SELECT COUNT(*) as count FROM journal WHERE user_id = ?', [user.id]);
    const vCount = await db.getAsync("SELECT COUNT(*) as count FROM vocab_status WHERE user_id = ? AND status='mastered'", [user.id]);
    res.json({
      user,
      profile: profile ? { ...profile, challenges: JSON.parse(profile.challenges || '[]') } : null,
      stats: { ...stats, wins: jCount?.count || 0, mastered_vocab: vCount?.count || 0 }
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── GET USER ──────────────────────────────────────────────────────────────
router.get('/:userId', async (req, res) => {
  try {
    const user = await db.getAsync('SELECT * FROM users WHERE id = ?', [req.params.userId]);
    if (!user) return res.status(404).json({ error: 'Not found' });
    const profile = await db.getAsync('SELECT * FROM user_profiles WHERE user_id = ?', [user.id]);
    res.json({
      user,
      profile: profile ? { ...profile, challenges: JSON.parse(profile.challenges || '[]') } : null
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── SAVE PROFILE ──────────────────────────────────────────────────────────
router.post('/:userId/profile', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    console.log('Saving profile for userId:', userId);
    console.log('Received body:', JSON.stringify(req.body, null, 2));

    // Use the dedicated saveProfile helper in database.js
    // This avoids all array binding issues by using individual explicit params
    const saved = db.saveProfile(userId, req.body);
    console.log('Profile saved successfully');
    res.json({ ...saved, challenges: JSON.parse(saved.challenges || '[]') });
  } catch (e) {
    console.error('Profile save error:', e);
    res.status(500).json({ error: e.message });
  }
});

// ── STATS ─────────────────────────────────────────────────────────────────
router.get('/:userId/stats', async (req, res) => {
  try {
    const uid = parseInt(req.params.userId);
    const stats = await db.getAsync('SELECT * FROM user_stats WHERE user_id = ?', [uid]);
    const jCount = await db.getAsync('SELECT COUNT(*) as count FROM journal WHERE user_id = ?', [uid]);
    const vCount = await db.getAsync("SELECT COUNT(*) as count FROM vocab_status WHERE user_id = ? AND status='mastered'", [uid]);
    const s = stats || { streak: 0, longest_streak: 0, total_sessions: 0 };
    const phase = s.total_sessions > 60 ? 3 : s.total_sessions > 30 ? 2 : 1;
    res.json({ ...s, wins: jCount?.count || 0, mastered_vocab: vCount?.count || 0, phase });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
