import express from 'express';
import db from '../database.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json(await db.allAsync('SELECT * FROM journal ORDER BY created_at DESC'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { text, type, score } = req.body;
    const result = await db.runAsync('INSERT INTO journal (text, type, score) VALUES (?, ?, ?)',
      [text, type || 'general', score || 0]);
    res.json({ id: result.lastID, text, type, score });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM journal WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
