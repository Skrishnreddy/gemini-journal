import assert from 'assert';
import { getSecret } from '../server/services/secretManager.js';
import {
  chatWithGemini,
  analyzeJournalSentiment,
  generateMoodRewind
} from '../server/services/geminiService.js';
import {
  getOrCreateUser,
  getUserEntries,
  saveUserEntry,
  getEntryById,
  deleteUserEntry
} from '../server/db/firestoreStore.js';
import { sendSlackBurnoutAlert } from '../server/services/slackService.js';

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING GEMINI JOURNAL AUTOMATED TEST SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(err);
    }
  }

  // 1. Secret Manager Dynamic Resolution
  await test('Secret Manager: Resolves runtime secrets or fallback without crashing', async () => {
    const key = await getSecret('GEMINI_API_KEY', 'GEMINI_API_KEY');
    assert(typeof key === 'string', 'Expected string return from getSecret');
  });

  // 2. Database Isolation: User A vs User B Zero Leakage
  await test('Firestore Isolation: Strict separation between User A and User B', async () => {
    const userA = 'user_alpha_test_1';
    const userB = 'user_beta_test_2';

    await getOrCreateUser(userA, { email: 'alpha@test.com', name: 'Alpha' });
    await getOrCreateUser(userB, { email: 'beta@test.com', name: 'Beta' });

    // Save Entry for User A
    const entryA = await saveUserEntry(userA, {
      title: 'Secret Thoughts of Alpha',
      content: 'Zero database leakage is critical.',
      mood: 'Joy'
    });

    // Save Entry for User B
    const entryB = await saveUserEntry(userB, {
      title: 'Secret Thoughts of Beta',
      content: 'Beta private space.',
      mood: 'Reflective'
    });

    // Query User A entries
    const listA = await getUserEntries(userA);
    const hasBetaInA = listA.some(e => e.userId === userB || e.title.includes('Beta'));
    assert(!hasBetaInA, 'SECURITY VIOLATION: User A retrieved User B data!');

    // Query User B entries
    const listB = await getUserEntries(userB);
    const hasAlphaInB = listB.some(e => e.userId === userA || e.title.includes('Alpha'));
    assert(!hasAlphaInB, 'SECURITY VIOLATION: User B retrieved User A data!');

    // Direct ID cross-lookup attempt
    const crossFetch = await getEntryById(userA, entryB.id);
    assert(crossFetch === null, 'SECURITY VIOLATION: User A fetched User B entry by ID!');

    // Cleanup
    await deleteUserEntry(userA, entryA.id);
    await deleteUserEntry(userB, entryB.id);
  });

  // 3. Conversational Gemini AI
  await test('Gemini AI: Conversational multi-turn reflection responds constructively', async () => {
    const messages = [
      { role: 'user', content: 'I am overwhelmed with my workload today.' }
    ];
    const reply = await chatWithGemini(messages, { userName: 'Tester' });
    assert(typeof reply === 'string' && reply.length > 20, 'Expected substantive AI response');
    assert(reply.toLowerCase().includes('breath') || reply.toLowerCase().includes('feel') || reply.toLowerCase().includes('task') || reply.length > 50);
  });

  // 4. Sentiment & Cognitive Fatigue Scoring
  await test('Gemini AI: Sentiment & Cognitive Fatigue scoring parses correctly', async () => {
    const text = 'Today was triumphant! We deployed the container to Cloud Run and all tests passed smoothly.';
    const sentiment = await analyzeJournalSentiment(text, 'Triumph');
    assert(sentiment.primaryMood, 'Expected primaryMood in sentiment analysis');
    assert(sentiment.sentimentScore >= 0, 'Expected positive sentiment score for triumphant text');
    assert(typeof sentiment.cognitiveFatigueScore === 'number', 'Expected numeric cognitive fatigue score');
  });

  // 5. Mood Rewind (Spotify-Wrapped Style Recap)
  await test('Mood Rewind: Synthesizes annual emotional journey and soul archetype', async () => {
    const mockEntries = [
      { id: '1', title: 'Breakthrough', content: 'Solved the latency issue.', mood: 'Joy', sentimentScore: 0.9, createdAt: '2026-08-01' },
      { id: '2', title: 'Reflective walk', content: 'Calm morning.', mood: 'Calm', sentimentScore: 0.8, createdAt: '2026-08-02' }
    ];
    const rewind = await generateMoodRewind(mockEntries, 'This Year');
    assert(rewind.soulArchetype, 'Expected soulArchetype in Mood Rewind');
    assert(Array.isArray(rewind.topEmotions), 'Expected topEmotions array');
    assert(rewind.peakDay, 'Expected peakDay in Mood Rewind');
    assert(rewind.aiLetterToUser, 'Expected personal AI letter in Mood Rewind');
  });

  // 6. Enterprise Slack Webhook Dispatch
  await test('Slack Service: Formats Block Kit payload and simulates alert dispatch', async () => {
    const result = await sendSlackBurnoutAlert({
      userId: 'test_user',
      userEmail: 'dev@demo.com',
      userName: 'Alice Dev',
      fatigueScore: 78,
      triggerReason: 'Elevated stress markers over 3 days',
      recentMoods: ['Stressed', 'Exhausted']
    });
    assert(result.success === true, 'Expected successful webhook execution or simulation');
  });

  console.log('\n====================================================');
  console.log(`🎯 TEST RESULTS: ${passed}/${total} PASSED`);
  console.log('====================================================');

  if (passed !== total) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
