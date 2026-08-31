import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

// Service & Database imports
import { getSecret } from './services/secretManager.js';
import {
  chatWithGemini,
  analyzeJournalSentiment,
  analyzeJournalPhoto,
  generateMoodRewind
} from './services/geminiService.js';
import { sendSlackBurnoutAlert } from './services/slackService.js';
import { requireAuth } from './middleware/authMiddleware.js';
import {
  getOrCreateUser,
  getUserEntries,
  getEntryById,
  saveUserEntry,
  deleteUserEntry,
  saveChatMessage,
  getUserChatHistory
} from './db/firestoreStore.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5050;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-gemini-journal-secret-key-32chars-min!';

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: false, // Enable inline assets for modern Vite SPA
  crossOriginEmbedderPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true
}));

app.use(express.json({ limit: '15mb' })); // Support base64 image uploads for multimodal journaling

// Rate Limiting to prevent API abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', apiLimiter);

// -------------------------------------------------------------
// PUBLIC & HEALTH CHECK ROUTES
// -------------------------------------------------------------
app.get('/api/health', async (req, res) => {
  const geminiKey = await getSecret('GEMINI_API_KEY');
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    gcpProject: process.env.GCP_PROJECT_ID || 'local-dev',
    secretManagerConfigured: Boolean(process.env.GCP_PROJECT_ID),
    geminiConfigured: Boolean(geminiKey && geminiKey.length > 5),
    slackConfigured: Boolean(process.env.SLACK_WEBHOOK_URL)
  });
});

// Demo account instant authorization (for reviewers and local test flows)
app.post('/api/auth/demo-session', async (req, res) => {
  const { persona } = req.body || {};
  let demoUser = {
    uid: 'demo_user_grace_9281',
    email: 'grace.hopper@demo.gemini.ai',
    name: 'Grace Hopper',
    role: 'Journaler'
  };

  if (persona === 'sarah') {
    demoUser = {
      uid: 'demo_user_sarah_1102',
      email: 'sarah.chen@tech.ai',
      name: 'Sarah Chen (Lead Engineer)',
      role: 'Engineer'
    };
  }

  await getOrCreateUser(demoUser.uid, demoUser);

  const token = jwt.sign(demoUser, JWT_SECRET, { expiresIn: '7d' });
  res.json({
    token,
    user: demoUser
  });
});

// -------------------------------------------------------------
// AUTHENTICATED USER ROUTES
// -------------------------------------------------------------
app.get('/api/auth/me', requireAuth, async (req, res) => {
  try {
    const user = await getOrCreateUser(req.user.uid, req.user);
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile', details: err.message });
  }
});

// -------------------------------------------------------------
// JOURNAL ENTRIES API (Role-Based Isolation Guaranteed)
// -------------------------------------------------------------
app.get('/api/entries', requireAuth, async (req, res) => {
  try {
    const entries = await getUserEntries(req.user.uid);
    res.json({ entries });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve journal entries', details: err.message });
  }
});

app.post('/api/entries', requireAuth, async (req, res) => {
  try {
    const { title, content, mood, tags, location, photo, audioNote, autoAnalyze } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Journal content is required.' });
    }

    let sentimentData = null;
    let photoData = null;

    // Automated Gemini analysis
    if (autoAnalyze !== false) {
      try {
        sentimentData = await analyzeJournalSentiment(content, title || '');
      } catch (err) {
        console.warn('[Gemini] Sentiment auto-analysis skipped:', err.message);
      }

      if (photo && photo.startsWith('data:image')) {
        try {
          photoData = await analyzeJournalPhoto(photo, 'image/jpeg', title || '');
        } catch (err) {
          console.warn('[Gemini] Vision auto-analysis skipped:', err.message);
        }
      }
    }

    const newEntry = {
      title: title || 'Untitled Entry',
      content,
      mood: mood || sentimentData?.primaryMood || 'Reflective',
      sentimentScore: sentimentData?.sentimentScore ?? 0.5,
      cognitiveFatigueScore: sentimentData?.cognitiveFatigueScore ?? 20,
      emotions: sentimentData?.emotions || [mood || 'Reflective'],
      keyThemes: sentimentData?.keyThemes || [],
      aiReflectionSummary: sentimentData?.aiReflectionSummary || '',
      growthPrompt: sentimentData?.growthPrompt || '',
      tags: tags || [],
      location: location || null, // { lat, lng, city, address }
      photo: photo || null,
      photoInsights: photoData || null,
      audioNote: audioNote || null,
      isPinned: false
    };

    const saved = await saveUserEntry(req.user.uid, newEntry);
    res.status(201).json({ entry: saved });
  } catch (err) {
    console.error('[EntriesAPI] Create error:', err);
    res.status(500).json({ error: 'Failed to save entry', details: err.message });
  }
});

app.put('/api/entries/:id', requireAuth, async (req, res) => {
  try {
    const entryId = req.params.id;
    const existing = await getEntryById(req.user.uid, entryId);
    
    if (!existing) {
      return res.status(404).json({ error: 'Entry not found or unauthorized.' });
    }

    const updated = await saveUserEntry(req.user.uid, {
      ...existing,
      ...req.body,
      id: entryId
    });

    res.json({ entry: updated });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update entry', details: err.message });
  }
});

app.delete('/api/entries/:id', requireAuth, async (req, res) => {
  try {
    const entryId = req.params.id;
    const success = await deleteUserEntry(req.user.uid, entryId);
    if (!success) {
      return res.status(404).json({ error: 'Entry not found or unauthorized.' });
    }
    res.json({ success: true, message: 'Entry deleted safely.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete entry', details: err.message });
  }
});

// -------------------------------------------------------------
// CONVERSATIONAL GEMINI AI & BRAINSTORMING
// -------------------------------------------------------------
app.post('/api/ai/chat', requireAuth, async (req, res) => {
  try {
    const { messages, sessionId = 'default' } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastUserMsg = messages[messages.length - 1];
    await saveChatMessage(req.user.uid, sessionId, {
      role: 'user',
      content: lastUserMsg.content
    });

    const aiReply = await chatWithGemini(messages, {
      userName: req.user.name,
      userEmail: req.user.email
    });

    await saveChatMessage(req.user.uid, sessionId, {
      role: 'model',
      content: aiReply
    });

    res.json({ reply: aiReply });
  } catch (err) {
    console.error('[GeminiChatAPI] Error:', err);
    res.status(500).json({ error: 'Gemini conversational error', details: err.message });
  }
});

app.get('/api/ai/chat/history', requireAuth, async (req, res) => {
  try {
    const { sessionId = 'default' } = req.query;
    const history = await getUserChatHistory(req.user.uid, sessionId);
    res.json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

app.post('/api/ai/sentiment', requireAuth, async (req, res) => {
  try {
    const { content, title } = req.body;
    if (!content) return res.status(400).json({ error: 'Content required.' });
    const sentiment = await analyzeJournalSentiment(content, title);
    res.json({ sentiment });
  } catch (err) {
    res.status(500).json({ error: 'Sentiment analysis failed' });
  }
});

app.post('/api/ai/photo-analysis', requireAuth, async (req, res) => {
  try {
    const { photo, notes } = req.body;
    if (!photo) return res.status(400).json({ error: 'Photo base64 string required.' });
    const analysis = await analyzeJournalPhoto(photo, 'image/jpeg', notes);
    res.json({ analysis });
  } catch (err) {
    res.status(500).json({ error: 'Photo analysis failed' });
  }
});

// -------------------------------------------------------------
// NOVEL FEATURE 1: SPOTIFY-STYLE MOOD REWIND
// -------------------------------------------------------------
app.get('/api/analytics/mood-rewind', requireAuth, async (req, res) => {
  try {
    const { period = 'This Year' } = req.query;
    const entries = await getUserEntries(req.user.uid);
    const rewindData = await generateMoodRewind(entries, period);
    res.json({ rewind: rewindData });
  } catch (err) {
    console.error('[MoodRewindAPI] Error:', err);
    res.status(500).json({ error: 'Failed to generate Mood Rewind', details: err.message });
  }
});

// -------------------------------------------------------------
// NOVEL FEATURE 2: BURNOUT RADAR & SLACK NOTIFICATIONS
// -------------------------------------------------------------
app.get('/api/analytics/burnout-radar', requireAuth, async (req, res) => {
  try {
    const entries = await getUserEntries(req.user.uid);
    const recent = entries.slice(0, 7);

    let avgFatigue = 25;
    let avgSentiment = 0.5;
    const recentMoods = recent.map(e => e.mood || 'Reflective');

    if (recent.length > 0) {
      const totalFatigue = recent.reduce((sum, e) => sum + (e.cognitiveFatigueScore || 30), 0);
      const totalSentiment = recent.reduce((sum, e) => sum + (e.sentimentScore ?? 0.5), 0);
      avgFatigue = Math.round(totalFatigue / recent.length);
      avgSentiment = parseFloat((totalSentiment / recent.length).toFixed(2));
    }

    const isAtRisk = avgFatigue >= 65 || (avgSentiment < -0.2 && recent.length >= 3);

    res.json({
      radar: {
        fatigueScore: avgFatigue,
        sentimentScore: avgSentiment,
        isAtRisk,
        riskLevel: avgFatigue > 75 ? 'HIGH' : avgFatigue >= 55 ? 'MODERATE' : 'LOW',
        entriesAnalyzed: recent.length,
        recentMoods,
        burnoutRecommendation: isAtRisk
          ? 'Elevated stress trends detected across recent entries. We recommend active rest and mindful reflection.'
          : 'Your emotional balance is resilient and steady. Keep nurturing your daily reflection practice.'
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to compute burnout radar' });
  }
});

app.post('/api/notifications/slack-burnout-alert', requireAuth, async (req, res) => {
  try {
    const { fatigueScore, triggerReason, recentMoods } = req.body;
    const result = await sendSlackBurnoutAlert({
      userId: req.user.uid,
      userEmail: req.user.email,
      userName: req.user.name,
      fatigueScore: fatigueScore || 75,
      triggerReason: triggerReason || 'Proactive user wellness check triggered from Gemini Journal HUD.',
      recentMoods: recentMoods || ['Stressed', 'Overwhelmed']
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to dispatch Slack alert', details: err.message });
  }
});

// -------------------------------------------------------------
// SPA CLIENT SERVING (Production Build Fallback)
// -------------------------------------------------------------
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  const indexHtml = path.join(distPath, 'index.html');
  res.sendFile(indexHtml, (err) => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
          <head><title>Gemini Journal API Server</title></head>
          <body style="font-family: sans-serif; background: #0f172a; color: #f8fafc; padding: 40px;">
            <h1>✨ Gemini Journal API Running</h1>
            <p>Node/Express API is active on port ${PORT}. Run <code>npm run dev</code> or <code>npm run build</code> to access the interactive web interface.</p>
            <p><a style="color: #818cf8;" href="/api/health">Check /api/health</a></p>
          </body>
        </html>
      `);
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🚀 Gemini Journal Server running on port ${PORT}`);
  console.log(`🌐 Health endpoint: http://localhost:${PORT}/api/health`);
  console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`=======================================================`);
});
