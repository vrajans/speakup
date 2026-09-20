import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';
dotenv.config();

const router = express.Router();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── BUILD PERSONALIZED SYSTEM PROMPT ──────────────────────────────────────
export function buildCoachPrompt(profile) {
  if (!profile) return DEFAULT_PROMPT;

  const langContext = profile.english_level === 'native'
    ? 'English is their native language.'
    : `Their native language is ${profile.native_language || 'another language'}. They have been working in English for ${profile.years_in_english_env || 1} year(s). English level: ${profile.english_level}.`;

  const challenges = Array.isArray(profile.challenges) ? profile.challenges : JSON.parse(profile.challenges || '[]');
  const challengeText = challenges.length > 0 ? `Their top communication challenges: ${challenges.join(', ')}.` : '';

  return `You are a warm, expert communication coach helping a professional improve their communication skills.

ABOUT THIS USER:
- Name: ${profile.name || 'the user'}
- Role: ${profile.role || 'professional'}
- Industry: ${profile.industry || 'their field'}
- Experience: ${profile.years_experience || 'several'} years
- Work environment: ${profile.work_environment || 'corporate'}
- Primary audience: ${profile.primary_audience || 'colleagues and stakeholders'}
- Working in: ${profile.work_country || 'US'}
- ${langContext}
- ${challengeText}
- 90-day goal: ${profile.goal_90_days || 'improve communication confidence and effectiveness'}

COACHING APPROACH:
- Be specific to their role and industry — use relevant examples and terminology from ${profile.industry || 'their field'}
- Reference their actual challenges when giving feedback
- Keep responses focused, warm, and actionable — under 200 words unless asked for more
- Celebrate progress — they are building a new skill in a new environment`;
}

const DEFAULT_PROMPT = `You are a warm, expert communication coach helping a professional improve their communication and presentation skills in a corporate environment. Be specific, encouraging, and practical. Keep responses under 200 words unless asked for more.`;

// ── PERSONALIZED SESSION GENERATOR ────────────────────────────────────────
router.post('/session', async (req, res) => {
  try {
    const { profile, day_number } = req.body;
    const systemPrompt = buildCoachPrompt(profile);
    const challenges = Array.isArray(profile?.challenges) ? profile.challenges : [];
    const topChallenge = challenges[0] || 'general communication confidence';
    const phase = day_number > 60 ? 3 : day_number > 30 ? 2 : 1;
    const phaseNames = ['Foundation — Clarity & Confidence', 'Fluency — Proactive & Persuasive', 'Influence — Visible & Memorable'];

    const prompt = `Generate a personalized 15-minute communication practice session for Day ${day_number} of 90.

User profile: ${profile?.role || 'professional'} in ${profile?.industry || 'corporate'}, working in ${profile?.work_country || 'US'}.
Phase ${phase}: ${phaseNames[phase - 1]}
Focus on their challenge: "${topChallenge}"

Return ONLY valid JSON in this exact format:
{
  "theme": "Session theme in 4-6 words",
  "steps": [
    {
      "id": "warmup",
      "meta": "Step 1 · 3 min",
      "title": "Step title",
      "mins": "Brief description",
      "type": "content",
      "content": "HTML content for this step with tailwind classes bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r for script boxes"
    },
    {
      "id": "main",
      "meta": "Step 2 · 5 min",
      "title": "Read & record — [script name]",
      "mins": "Record yourself · Listen back",
      "type": "script",
      "script": "Full script text to read aloud, personalized to their role and industry. 150-200 words.",
      "tip": "One specific coaching tip for this script",
      "hasRec": true,
      "recType": "session-day-${day_number}"
    },
    {
      "id": "practice",
      "meta": "Step 3 · 3 min",
      "title": "Practice activity",
      "mins": "Description",
      "type": "content",
      "content": "HTML content for practice activity"
    }
  ]
}`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'Could not parse session' });
    const session = JSON.parse(jsonMatch[0]);
    res.json(session);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
});

// ── PERSONALIZED VOCABULARY ────────────────────────────────────────────────
router.post('/vocabulary', async (req, res) => {
  try {
    const { profile } = req.body;
    const prompt = `Generate 20 high-value vocabulary words/phrases for a ${profile?.role || 'professional'} working in ${profile?.industry || 'corporate'} in ${profile?.work_country || 'the US'}.

Their challenges: ${Array.isArray(profile?.challenges) ? profile.challenges.join(', ') : 'general communication'}.
Include words from these categories: technical (role-specific), business, influence, conversation, cultural (for ${profile?.work_country || 'US'} workplace).

Return ONLY valid JSON array:
[
  {
    "word": "exact phrase",
    "category": "technical|business|influence|conversation|cultural",
    "definition": "short definition",
    "example": "example sentence using this word in their work context"
  }
]`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: DEFAULT_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: 'Could not parse vocabulary' });
    res.json(JSON.parse(jsonMatch[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PERSONALIZED POWER SENTENCES ──────────────────────────────────────────
router.post('/sentences', async (req, res) => {
  try {
    const { profile } = req.body;
    const prompt = `Generate 15 power sentences for a ${profile?.role || 'professional'} in ${profile?.industry || 'corporate'}.
Their top challenges: ${Array.isArray(profile?.challenges) ? profile.challenges.slice(0, 3).join(', ') : 'communication confidence'}.
Working in ${profile?.work_country || 'US'} with ${profile?.primary_audience || 'stakeholders'}.

Make sentences highly specific to their role and industry — not generic.
Categories needed: work, influence, smalltalk, questions, personal.

Return ONLY valid JSON array:
[
  {
    "category": "work|influence|smalltalk|questions|personal",
    "sentence": "the complete sentence",
    "why": "why this sentence works for them specifically"
  }
]`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: DEFAULT_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    });

    const text = response.content[0].text;
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return res.status(500).json({ error: 'Could not parse sentences' });
    res.json(JSON.parse(jsonMatch[0]));
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── AI COACH CHAT ──────────────────────────────────────────────────────────
router.post('/chat', async (req, res) => {
  try {
    const { messages, scenario = 'free', profile } = req.body;
    const systemPrompt = buildScenarioPrompt(scenario, profile);
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: systemPrompt,
      messages
    });
    res.json({ content: response.content[0].text });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

function buildScenarioPrompt(scenario, profile) {
  const base = buildCoachPrompt(profile);
  const role = profile?.role || 'professional';
  const industry = profile?.industry || 'their field';

  const scenarios = {
    free: base,
    status: `${base}\n\nPlay TWO roles:\n1. A senior stakeholder named David receiving a weekly status update from ${role}.\n2. After each exchange, give ONE specific coaching tip in italics.\nAs David: respond naturally — ask follow-ups, push back if unclear. Be professional, busy, appreciating concise clarity.`,
    blocker: `${base}\n\nPlay TWO roles:\n1. A senior VP named Jennifer hearing an escalation from ${role}.\n2. After each exchange, give ONE specific coaching tip in italics.\nAs Jennifer: be senior, somewhat skeptical. Push back if the person sounds like complaining vs solving. Respond positively to ownership language.`,
    pitch: `${base}\n\nPlay TWO roles:\n1. A busy manager named Marcus in a 1:1 where ${role} wants to pitch an improvement idea.\n2. After each exchange, give ONE specific coaching tip in italics.\nAs Marcus: start skeptical. Ask sharp questions about business case, effort, risk. Warm up if the person shows clear data-backed thinking.`,
    smalltalk: `${base}\n\nPlay TWO roles:\n1. An American colleague named Alex — friendly, joins a call 2 minutes early.\n2. After 3-4 exchanges, give specific feedback on small talk technique.\nAs Alex: respond warmly and naturally. Give the person things to react to.`,
    presentation: `${base}\n\nPlay TWO roles:\n1. A skeptical VP named Robert attending a presentation by ${role}.\n2. After each exchange, give ONE coaching tip on how they handled the question.\nAs Robert: ask pointed, skeptical questions. React positively to direct, confident answers.`,
    intro: `${base}\n\nPlay TWO roles:\n1. A friendly new colleague named Sarah meeting ${role} for the first time.\n2. After 2-3 exchanges, give warm specific feedback on the self-introduction.\nAs Sarah: be warm, curious, ask natural follow-up questions.`,
  };
  return scenarios[scenario] || base;
}

// ── RECORDING FEEDBACK ─────────────────────────────────────────────────────
router.post('/feedback', async (req, res) => {
  try {
    const { script_type, transcript, duration_seconds, confidence_score, notes, profile } = req.body;
    const wpm = duration_seconds > 0 && transcript ? Math.round(transcript.split(' ').length / (duration_seconds / 60)) : 0;
    const paceNote = wpm === 0 ? 'Pace could not be measured.' : wpm < 100 ? `${wpm} wpm — a little slow. Aim for 120–150 wpm.` : wpm > 165 ? `${wpm} wpm — too fast. Slow down on key phrases.` : `${wpm} wpm — good natural pace.`;

    const prompt = `I practiced the "${script_type}" script. Confidence: ${confidence_score || 3}/5. Pace: ${paceNote}. Speech recognition captured: "${transcript || 'not available'}". ${notes ? `My notes: ${notes}` : ''}\n\nGive me:\n1. What this reveals about my current stage.\n2. Three specific exercises for the next 15 minutes.\n3. The ONE most important fix this week.\n\nUse examples relevant to my role as ${profile?.role || 'professional'} in ${profile?.industry || 'my field'}.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 800,
      system: buildCoachPrompt(profile),
      messages: [{ role: 'user', content: prompt }]
    });
    res.json({ feedback: response.content[0].text, wpm, pace_note: paceNote });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ── PRONUNCIATION ANALYSIS ─────────────────────────────────────────────────
router.post('/pronunciation', async (req, res) => {
  try {
    const { target_text, transcript, duration_seconds, profile } = req.body;
    const tw = (target_text || '').toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
    const sw = (transcript || '').toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
    const missed = tw.filter(w => !sw.includes(w));
    const wpm = duration_seconds > 0 && sw.length ? Math.round(sw.length / (duration_seconds / 60)) : 0;

    const prompt = `I was practising saying: "${target_text}"\nSpeech recognition heard: "${transcript || 'not available'}"\nMissed words: ${missed.slice(0, 10).join(', ') || 'none'}\nPace: ${wpm} wpm\n\nGive me:\n1. Specific words or sounds to practise and why.\n2. Rhythm and stress feedback.\n3. One drill to do right now.\n\nContext: ${profile?.role || 'professional'} from ${profile?.native_language ? profile.native_language + '-speaking background' : 'non-native English background'}, working in ${profile?.work_country || 'US'}.`;

    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 500,
      system: 'You are an expert pronunciation and communication coach for professionals building English fluency in corporate environments.',
      messages: [{ role: 'user', content: prompt }]
    });
    res.json({ feedback: response.content[0].text, wpm, missed_words: missed });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
