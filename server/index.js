import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import adminRouter from './routes/admin.js';


dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;
const isProduction = process.env.NODE_ENV === 'production';

// Ensure data directories exist
const dataDir = join(__dirname, '..', 'data');
const recordingsDir = join(dataDir, 'recordings');
if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });
if (!existsSync(recordingsDir)) mkdirSync(recordingsDir, { recursive: true });
console.log('Data directory ready:', dataDir);

app.use(cors({ origin: true }));
app.use(express.json({ limit: '50mb' }));
app.use('/recordings', express.static(recordingsDir));
app.use('/api/admin', adminRouter);

// Serve React build in production
if (isProduction) {
  const clientBuild = join(__dirname, '..', 'client', 'dist');
  if (existsSync(clientBuild)) {
    console.log('Serving React build from:', clientBuild);
    app.use(express.static(clientBuild));
  } else {
    console.warn('WARNING: client/dist not found');
  }
}

// Import routes - paths relative to THIS file (server/index.js)
import usersRouter from './routes/users.js';
import sessionsRouter from './routes/sessions.js';
import recordingsRouter from './routes/recordings.js';
import journalRouter from './routes/journal.js';
import vocabRouter from './routes/vocab.js';
import aiRouter from './routes/ai.js';
import habitsRouter from './routes/habits.js';
import statsRouter from './routes/stats.js';

app.get('/api/health', (req, res) => res.json({
  status: 'ok',
  node: process.version,
  env: process.env.NODE_ENV,
  time: new Date().toISOString()
}));

app.use('/api/users', usersRouter);
app.use('/api/sessions', sessionsRouter);
app.use('/api/recordings', recordingsRouter);
app.use('/api/journal', journalRouter);
app.use('/api/vocab', vocabRouter);
app.use('/api/ai', aiRouter);
app.use('/api/habits', habitsRouter);
app.use('/api/stats', statsRouter);

// Serve React for all non-API routes in production
if (isProduction) {
  app.get('*', (req, res) => {
    const indexPath = join(__dirname, '..', 'client', 'dist', 'index.html');
    if (existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(200).send(`<h2>SpeakUp API running on Node ${process.version}</h2><p><a href="/api/health">Health check</a></p>`);
    }
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`SpeakUp running on port ${PORT} (${isProduction ? 'production' : 'development'})`);
  console.log(`Node: ${process.version}`);
  console.log(`API key set: ${!!process.env.ANTHROPIC_API_KEY}`);
});
