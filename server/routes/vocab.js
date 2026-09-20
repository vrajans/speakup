import express from 'express';
import db from '../database.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json(await db.allAsync('SELECT * FROM vocab_status ORDER BY updated_at DESC'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/upsert', async (req, res) => {
  try {
    const { word, status, category } = req.body;
    await db.runAsync(
      `INSERT INTO vocab_status (word, status, category, updated_at) VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(word) DO UPDATE SET status=excluded.status, updated_at=excluded.updated_at`,
      [word, status, category || 'general']
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
