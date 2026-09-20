import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import db from '../database.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const storage = multer.diskStorage({
  destination: join(__dirname, '..', '..', 'data', 'recordings'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});
const upload = multer({ storage });

router.get('/', async (req, res) => {
  try {
    res.json(await db.allAsync('SELECT * FROM recordings ORDER BY created_at DESC'));
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/upload', upload.single('audio'), async (req, res) => {
  try {
    const { session_id, type, transcript, duration_seconds, wpm } = req.body;
    const file_path = req.file ? `/recordings/${req.file.filename}` : '';
    const result = await db.runAsync(
      'INSERT INTO recordings (session_id, type, file_path, transcript, duration_seconds, wpm) VALUES (?, ?, ?, ?, ?, ?)',
      [session_id || null, type || 'practice', file_path, transcript || '', duration_seconds || 0, wpm || 0]
    );
    res.json({ id: result.lastID, file_path });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.put('/:id/feedback', async (req, res) => {
  try {
    await db.runAsync('UPDATE recordings SET ai_feedback = ? WHERE id = ?',
      [req.body.ai_feedback, req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.runAsync('DELETE FROM recordings WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
