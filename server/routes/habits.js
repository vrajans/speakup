import express from 'express';
import db from '../database.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    res.json(await db.allAsync('SELECT * FROM habits ORDER BY date DESC'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { date, completed_items } = req.body;
    await db.runAsync(
      `INSERT INTO habits (date, completed_items) VALUES (?, ?)
       ON CONFLICT(date) DO UPDATE SET completed_items=excluded.completed_items`,
      [date, JSON.stringify(completed_items || [])]
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
