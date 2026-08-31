import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSecret } from './secretManager.js';

let genAIInstance = null;

async function getGenAI() {
  const apiKey = await getSecret('GEMINI_API_KEY');
  if (apiKey && apiKey.length > 5) {
    if (!genAIInstance || genAIInstance.apiKey !== apiKey) {
      genAIInstance = new GoogleGenerativeAI(apiKey);
    }
    return genAIInstance;
  }
  return null;
}

const SYSTEM_JOURNAL_INSTRUCTION = `You are "Gemini Mirror", an empathetic, Socratic, and emotionally intelligent AI companion embedded within a personal journal.
Your mission is to:
1. Provide thoughtful, non-judgmental listening and active reflection.
2. Ask 1-2 perceptive Socratic follow-up questions to help the user uncover deeper feelings, assumptions, and latent cognitive patterns.
3. Offer grounded, positive reframing without toxic positivity.
4. Keep responses concise, warm, and structured (using clean markdown formatting, bullet points, and gentle tone).
5. Never judge or dismiss their feelings. Protect their emotional safety.`;

/**
 * Multi-turn conversational brainstorming & reflection
 */
export async function chatWithGemini(messages, userContext = {}) {
  const genAI = await getGenAI();

  if (!genAI) {
    // Graceful offline mock response for local testing without active GCP keys
    return generateMockChatResponse(messages, userContext);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: SYSTEM_JOURNAL_INSTRUCTION,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 1000,
      }
    });

    // Format chat history for Gemini API
    // Gemini SDK expects history: [{ role: 'user'|'model', parts: [{ text }] }]
    const history = [];
    for (let i = 0; i < messages.length - 1; i++) {
      const msg = messages[i];
      history.push({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      });
    }

    const chat = model.startChat({ history });
    const lastUserMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastUserMessage);
    const response = await result.response;
    return response.text();
  } catch (err) {
    console.error('[GeminiService] Error in conversational chat:', err);
    return generateMockChatResponse(messages, userContext, err.message);
  }
}

/**
 * Analyzes journal entry text to extract sentiment, emotional intensity, keywords, and mood tags
 */
export async function analyzeJournalSentiment(entryText, title = '') {
  const genAI = await getGenAI();

  if (!genAI) {
    return generateMockSentiment(entryText);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.2,
      }
    });

    const prompt = `Analyze the following personal journal entry.
Title: ${title}
Content: "${entryText}"

Respond ONLY with valid JSON in this exact structure:
{
  "primaryMood": "Joy" | "Calm" | "Grateful" | "Reflective" | "Stressed" | "Sad" | "Anxious" | "Energetic",
  "sentimentScore": <number between -1.0 (very negative) and 1.0 (very positive)>,
  "energyLevel": <number between 1 (exhausted) and 10 (hyper-energetic)>,
  "cognitiveFatigueScore": <number between 0 (refreshed) and 100 (severe burnout risk)>,
  "emotions": ["<emotion1>", "<emotion2>", "<emotion3>"],
  "keyThemes": ["<theme1>", "<theme2>"],
  "aiReflectionSummary": "<1-2 sentence empathetic takeaway>",
  "growthPrompt": "<1 actionable self-care or reflective prompt for tomorrow>"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    return JSON.parse(responseText);
  } catch (err) {
    console.error('[GeminiService] Sentiment extraction error:', err);
    return generateMockSentiment(entryText);
  }
}

/**
 * Multimodal image analysis for photo-attached journal entries
 */
export async function analyzeJournalPhoto(base64Image, mimeType = 'image/jpeg', userNotes = '') {
  const genAI = await getGenAI();

  if (!genAI) {
    return {
      visualThemes: ["Urban Architecture", "Sunset Warmth", "Quiet Solitude"],
      emotionalVibe: "Nostalgic & Grounded",
      suggestedReflection: "This moment captures a serene intersection of light and quiet reflection. Consider what in this setting made you pause and capture it."
    };
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const imagePart = {
      inlineData: {
        data: base64Image.replace(/^data:image\/\w+;base64,/, ""),
        mimeType
      }
    };

    const prompt = `Inspect this photo attached to a personal journal entry. User's optional notes: "${userNotes}".
Describe the visual mood, artistic vibes, and generate a brief, deep 2-sentence reflection on how this scene mirrors or enriches the user's emotional state. Return in JSON format with fields: visualThemes (array of strings), emotionalVibe (string), suggestedReflection (string).`;

    const result = await model.generateContent([prompt, imagePart]);
    const cleanText = result.response.text().replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (err) {
    console.error('[GeminiService] Vision analysis error:', err);
    return {
      visualThemes: ["Memory Snapshot", "Captured Moment"],
      emotionalVibe: "Reflective",
      suggestedReflection: "A visual anchor to this moment in time."
    };
  }
}

/**
 * "Mood Rewind" (Spotify-Wrapped Style AI Emotional Recap)
 * Aggregates a series of entries over a month or year into an engaging retrospective.
 */
export async function generateMoodRewind(entries, periodName = "This Year") {
  if (!entries || entries.length === 0) {
    return getEmptyMoodRewind(periodName);
  }

  const genAI = await getGenAI();

  // Prepare concise digest of entries
  const entrySummaries = entries.slice(0, 50).map((e, idx) => ({
    id: idx + 1,
    date: e.createdAt ? new Date(e.createdAt).toISOString().split('T')[0] : 'Unknown',
    title: e.title || 'Untitled',
    mood: e.mood || e.primaryMood || 'Neutral',
    sentiment: e.sentimentScore || 0,
    snippet: (e.content || '').substring(0, 150)
  }));

  if (!genAI) {
    return generateMockMoodRewind(entrySummaries, periodName);
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      }
    });

    const prompt = `You are the lead narrative designer for "Gemini Journal: Mood Rewind" (a Spotify-Wrapped style annual/monthly retrospective).
Here is the user's journal activity for ${periodName}:
${JSON.stringify(entrySummaries)}

Synthesize this data into an empowering, emotionally resonant, and visually thrilling "Rewind" experience.
Return ONLY valid JSON matching this schema:
{
  "period": "${periodName}",
  "totalEntries": ${entries.length},
  "soulArchetype": "<Creative title like 'The Resilient Architect', 'The Curious Seeker', 'The Mindful Alchemist'>",
  "archetypeDescription": "<2-sentence inspiring description of their psychological journey>",
  "topEmotions": [
    {"name": "<Emotion>", "percentage": <number 0-100>, "color": "<hex code like #6366f1>"}
  ],
  "peakDay": {
    "date": "<Date or period>",
    "highlight": "<Title or peak insight from their best moment>",
    "takeaway": "<Why this was a monumental day for them>"
  },
  "chokePointOvercome": {
    "date": "<Date or period>",
    "challenge": "<What tested them>",
    "resilienceInsight": "<How they triumphed or adapted>"
  },
  "topThemes": ["<Theme 1>", "<Theme 2>", "<Theme 3>", "<Theme 4>"],
  "soundtrackVibe": "<e.g., Lofi Ambient Piano, Cinematic Synthwave, Warm Acoustic Folk>",
  "aiLetterToUser": "<Warm, heartfelt 3-paragraph letter from Gemini celebrating their evolution and offering wisdom for the next horizon>"
}`;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  } catch (err) {
    console.error('[GeminiService] Mood Rewind synthesis error:', err);
    return generateMockMoodRewind(entrySummaries, periodName);
  }
}

// --- MOCK / FALLBACK ENGINE FOR OFFLINE DEVELOPMENT & DEMOS ---

function generateMockChatResponse(messages, userContext, errMsg = null) {
  const last = messages[messages.length - 1]?.content?.toLowerCase() || '';
  
  if (last.includes('stress') || last.includes('overwhelm') || last.includes('tired')) {
    return `I hear the weight in your words, and it's completely natural to feel overwhelmed when balancing so much.\n\nTake a slow breath. Let's disentangle this together:\n\n- **Immediate check-in**: Which specific task or thought is demanding the most urgent cognitive energy right now?\n- **Boundary scan**: Is there something on your plate today that can safely be postponed until tomorrow?\n\n*Remember: Rest is not a reward you earn after working; it is the foundation that makes sustainable living possible.* What would feel restorative to you in the next 15 minutes?`;
  }

  if (last.includes('idea') || last.includes('project') || last.includes('goal')) {
    return `That sounds like an inspiring spark! Let's explore the horizons of this idea.\n\nTo help structure your vision:\n1. **Core Purpose**: What is the single biggest transformation or feeling you want this project to create?\n2. **The First Domino**: If you could only take one 10-minute action today to set this in motion, what would it be?\n\nTell me more about what inspired you to start this!`;
  }

  return `Thank you for sharing that reflection. Writing these thoughts down is already a powerful act of self-awareness.\n\nAs you look at what you just described:\n- What part of this situation feels most within your control?\n- How does this moment connect with what truly matters to you right now?\n\nI'm right here with you—feel free to expand on whatever feels most alive in your mind.`;
}

function generateMockSentiment(text) {
  const lower = text.toLowerCase();
  let mood = 'Reflective';
  let score = 0.4;
  let fatigue = 25;

  if (lower.includes('great') || lower.includes('happy') || lower.includes('excited') || lower.includes('won')) {
    mood = 'Joy';
    score = 0.85;
    fatigue = 15;
  } else if (lower.includes('stress') || lower.includes('deadline') || lower.includes('exhausted') || lower.includes('burnout')) {
    mood = 'Stressed';
    score = -0.45;
    fatigue = 78;
  } else if (lower.includes('peace') || lower.includes('calm') || lower.includes('nature') || lower.includes('grateful')) {
    mood = 'Calm';
    score = 0.7;
    fatigue = 10;
  }

  return {
    primaryMood: mood,
    sentimentScore: score,
    energyLevel: score > 0 ? 8 : 4,
    cognitiveFatigueScore: fatigue,
    emotions: [mood, score > 0 ? "Optimistic" : "Tense", "Introspective"],
    keyThemes: ["Personal Growth", "Daily Routine", "Mental Clarity"],
    aiReflectionSummary: `A deeply honest reflection showcasing your capacity for introspection.`,
    growthPrompt: "What is one gentle grace you can give yourself before this day concludes?"
  };
}

function generateMockMoodRewind(summaries, periodName) {
  return {
    period: periodName,
    totalEntries: summaries.length || 12,
    soulArchetype: "The Resilient Alchemist",
    archetypeDescription: "Throughout this chapter, you transformed complex challenges and moments of uncertainty into steady emotional wisdom and creative momentum.",
    topEmotions: [
      { name: "Joy & Accomplishment", percentage: 42, color: "#10b981" },
      { name: "Deep Reflection", percentage: 33, color: "#6366f1" },
      { name: "Stress & Growth Edge", percentage: 18, color: "#f59e0b" },
      { name: "Serene Gratitude", percentage: 7, color: "#06b6d4" }
    ],
    peakDay: {
      date: "Peak Milestone Moment",
      highlight: "A breakthrough in personal clarity and creative confidence.",
      takeaway: "You proved to yourself that sustained small steps compound into monumental achievements."
    },
    chokePointOvercome: {
      date: "The Pressure Test",
      challenge: "Navigating high-friction deadlines and emotional fatigue.",
      resilienceInsight: "Instead of succumbing to overwhelm, you stepped back, reclaimed your boundaries, and executed with poise."
    },
    topThemes: ["Courageous Execution", "Mindful Self-Compassion", "Creative Breakthroughs", "Lifelong Learning"],
    soundtrackVibe: "Cinematic Ambient Piano & Uplifting Lo-Fi Beats",
    aiLetterToUser: `Dear Journaler,\n\nLooking across every entry in this chapter, a vivid portrait of human resilience emerges. You didn't shy away from vulnerability on the hard days, and you celebrated the authentic triumphs with genuine gratitude.\n\nYou have built a sanctuary for your mind. May your next chapters be filled with effortless flow, meaningful connections, and the quiet certainty of your own power.\n\nKeep writing. Your story is extraordinary.`
  };
}

function getEmptyMoodRewind(periodName) {
  return {
    period: periodName,
    totalEntries: 0,
    soulArchetype: "The Blank Canvas",
    archetypeDescription: "Your journey is waiting to be written. Create your first few journal entries to unlock your dynamic Mood Rewind.",
    topEmotions: [{ name: "Anticipation", percentage: 100, color: "#6366f1" }],
    peakDay: { date: "Today", highlight: "The Beginning", takeaway: "Start with a single sentence about your day." },
    chokePointOvercome: { date: "Today", challenge: "Taking the first step", resilienceInsight: "Action precedes motivation." },
    topThemes: ["Fresh Start", "Discovery"],
    soundtrackVibe: "A Quiet Sunrise",
    aiLetterToUser: "Welcome to your Gemini Journal. Your story begins now."
  };
}
