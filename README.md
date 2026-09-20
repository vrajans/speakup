# SpeakUp — Deployment Guide

## Local Development
```
npm install
cd client && npm install && cd ..
npm run dev
```
Open http://localhost:5173

## Deploy to Railway

### Step 1 — Push to GitHub
1. Create a new repo on github.com called `speakup`
2. In your terminal:
```
git init
git add .
git commit -m "Initial SpeakUp commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/speakup.git
git push -u origin main
```

### Step 2 — Deploy on Railway
1. Go to railway.app → New Project → Deploy from GitHub repo
2. Select your speakup repo
3. Railway will auto-detect and start building

### Step 3 — Add environment variables in Railway
In Railway dashboard → your project → Variables tab, add:
```
ANTHROPIC_API_KEY=your-key-here
NODE_ENV=production
```

### Step 4 — Get your public URL
Railway → Settings → Networking → Generate Domain
Your app will be live at: https://speakup-xxx.railway.app

## Environment Variables
- `ANTHROPIC_API_KEY` — Required for AI features
- `NODE_ENV` — Set to `production` on Railway
- `PORT` — Set automatically by Railway, do not change
