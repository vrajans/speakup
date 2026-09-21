import express from 'express';
import db from '../database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const uid = req.query.user_id || 1;
    const rows = await db.allAsync('SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC', [uid]);
    res.json(rows);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await db.getAsync('SELECT * FROM sessions WHERE id = ?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(row);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, date, day_number, theme, completed, score, reflection } = req.body;
    const uid = user_id || 1;

    const result = await db.runAsync(
      'INSERT INTO sessions (user_id, date, day_number, theme, completed, score, reflection) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [uid, date, day_number || 1, theme || '', completed || 0, score || 0, reflection || '']
    );

    // Update streak using user_id not id
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const stats = await db.getAsync('SELECT * FROM user_stats WHERE user_id = ?', [uid]);

    if (stats) {
      const newStreak = stats.last_session_date === yesterday ? (stats.streak || 0) + 1 : 1;
      const longest = Math.max(newStreak, stats.longest_streak || 0);
      await db.runAsync(
        'UPDATE user_stats SET streak=?, longest_streak=?, total_sessions=total_sessions+1, last_session_date=? WHERE user_id=?',
        [newStreak, longest, today, uid]
      );
    } else {
      await db.runAsync(
        'INSERT INTO user_stats (user_id, streak, longest_streak, total_sessions, last_session_date) VALUES (?,1,1,1,?)',
        [uid, today]
      );
    }

    res.json({ id: result.lastID, ...req.body });
  } catch (e) {
    console.error('Session POST error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { completed, score, reflection } = req.body;
    await db.runAsync('UPDATE sessions SET completed=?, score=?, reflection=? WHERE id=?',
      [completed, score, reflection, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
