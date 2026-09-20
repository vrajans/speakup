import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

import usersRouter from './server/routes/users.js';
import sessionsRouter from './server/routes/sessions.js';
import recordingsRouter from './server/routes/recordings.js';
import journalRouter from './server/routes/journal.js';
import vocabRouter from './server/routes/vocab.js';
import aiRouter from './server/routes/ai.js';
import habitsRouter from './server/routes/habits.js';
import statsRouter from './server/routes/stats.js';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// Allow all origins in production (Railway sets PORT automatically)
const isProduction = process.env.NODE_ENV === 'production';

app.use(cors({
  origin: isProduction ? true : (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
}));
app.use(express.json());

// Serve uploaded recordings
app.use('/recordings', express.static(join(__dirname, 'data', 'recordings')));

// In production, serve the built React app
if (isProduction) {
  const clientBuild = join(__dirname, 'client', 'dist');
  if (existsSync(clientBuild)) {
    app.use(express.static(clientBuild));
  }
}

// API routes
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/recordings', recordingsRouter);
app.use('/api/journal', journalRouter);
app.use('/api/vocab', vocabRouter);
app.use('/api/ai', aiRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/stats', statsRouter);

// In production, serve React app for all non-API routes
if (isProduction) {
  app.get('*', (req, res) => {
    const indexPath = join(__dirname, 'client', 'dist', 'index.html');
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send('Build not found. Run npm run build first.');
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SpeakUp running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
});
