import express from 'express';
import db from '../database.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const stats = await db.getAsync('SELECT * FROM user_stats WHERE user_id = 1');
    const journalCount = await db.getAsync('SELECT COUNT(*) as count FROM journal WHERE user_id = 1');
    const masteredVocab = await db.getAsync("SELECT COUNT(*) as count FROM vocab_status WHERE user_id = 1 AND status='mastered'");
    const s = stats || { streak: 0, longest_streak: 0, total_sessions: 0 };
    const phase = s.total_sessions > 60 ? 3 : s.total_sessions > 30 ? 2 : 1;
    res.json({ ...s, wins: journalCount?.count || 0, mastered_vocab: masteredVocab?.count || 0, phase });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
