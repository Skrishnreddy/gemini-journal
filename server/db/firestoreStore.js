import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';

let firestoreInstance = null;

function getFirestore() {
  if (!firestoreInstance && admin.apps.length) {
    try {
      firestoreInstance = admin.firestore();
    } catch (e) {
      console.warn('[Firestore] Could not bind native Firestore instance:', e.message);
    }
  }
  return firestoreInstance;
}

// Local JSON Store for fallback / test isolation
const LOCAL_DB_PATH = path.join(process.cwd(), 'data', 'db_local.json');

function readLocalDb() {
  try {
    if (fs.existsSync(LOCAL_DB_PATH)) {
      const data = fs.readFileSync(LOCAL_DB_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('[FirestoreStore] Local DB read error:', err);
  }
  return { users: {}, entries: {}, chat_sessions: {}, mood_analytics: {} };
}

function writeLocalDb(data) {
  try {
    const dir = path.dirname(LOCAL_DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[FirestoreStore] Local DB write error:', err);
  }
}

/**
 * Ensures a user record exists in the database
 */
export async function getOrCreateUser(userId, userData = {}) {
  const fsDb = getFirestore();
  if (fsDb) {
    try {
      const userRef = fsDb.collection('users').doc(userId);
      const doc = await userRef.get();
      if (!doc.exists) {
        const payload = {
          id: userId,
          email: userData.email || '',
          name: userData.name || 'Journaler',
          createdAt: new Date().toISOString(),
          settings: { theme: 'dark', notificationsEnabled: true }
        };
        await userRef.set(payload);
        return payload;
      }
      return doc.data();
    } catch (err) {
      console.warn('[Firestore] getOrCreateUser remote error, falling back to local:', err.message);
    }
  }

  // Local fallback
  const db = readLocalDb();
  if (!db.users[userId]) {
    db.users[userId] = {
      id: userId,
      email: userData.email || '',
      name: userData.name || 'Journaler',
      createdAt: new Date().toISOString(),
      settings: { theme: 'dark', notificationsEnabled: true }
    };
    writeLocalDb(db);
  }
  return db.users[userId];
}

/**
 * Retrieve all journal entries for a specific authenticated user.
 * ZERO cross-user leakage: queries are strictly filtered by user ID.
 */
export async function getUserEntries(userId) {
  const fsDb = getFirestore();
  if (fsDb) {
    try {
      const snapshot = await fsDb
        .collection('users')
        .doc(userId)
        .collection('entries')
        .orderBy('createdAt', 'desc')
        .get();

      const entries = [];
      snapshot.forEach(doc => {
        entries.push({ id: doc.id, ...doc.data() });
      });
      return entries;
    } catch (err) {
      console.warn('[Firestore] getUserEntries remote error, falling back to local:', err.message);
    }
  }

  // Local fallback
  const db = readLocalDb();
  const userEntries = Object.values(db.entries || {})
    .filter(entry => entry.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return userEntries;
}

/**
 * Get a single entry, validating strict ownership
 */
export async function getEntryById(userId, entryId) {
  const fsDb = getFirestore();
  if (fsDb) {
    try {
      const docRef = fsDb.collection('users').doc(userId).collection('entries').doc(entryId);
      const doc = await docRef.get();
      if (!doc.exists) return null;
      const data = doc.data();
      if (data.userId !== userId) return null; // Security guarantee
      return { id: doc.id, ...data };
    } catch (err) {
      console.warn('[Firestore] getEntryById remote error, falling back:', err.message);
    }
  }

  const db = readLocalDb();
  const entry = db.entries[entryId];
  if (entry && entry.userId === userId) {
    return entry;
  }
  return null;
}

/**
 * Save or update a journal entry strictly under the user's isolated subcollection
 */
export async function saveUserEntry(userId, entryData) {
  const id = entryData.id || `entry_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const timestamp = entryData.createdAt || new Date().toISOString();

  const payload = {
    ...entryData,
    id,
    userId, // Mandatory ownership binding
    updatedAt: new Date().toISOString(),
    createdAt: timestamp
  };

  const fsDb = getFirestore();
  if (fsDb) {
    try {
      const docRef = fsDb.collection('users').doc(userId).collection('entries').doc(id);
      await docRef.set(payload, { merge: true });
      return payload;
    } catch (err) {
      console.warn('[Firestore] saveUserEntry remote error, falling back:', err.message);
    }
  }

  // Local fallback
  const db = readLocalDb();
  db.entries[id] = payload;
  writeLocalDb(db);
  return payload;
}

/**
 * Delete a journal entry with strict user ownership validation
 */
export async function deleteUserEntry(userId, entryId) {
  const fsDb = getFirestore();
  if (fsDb) {
    try {
      const docRef = fsDb.collection('users').doc(userId).collection('entries').doc(entryId);
      await docRef.delete();
      return true;
    } catch (err) {
      console.warn('[Firestore] deleteUserEntry remote error, falling back:', err.message);
    }
  }

  const db = readLocalDb();
  if (db.entries[entryId] && db.entries[entryId].userId === userId) {
    delete db.entries[entryId];
    writeLocalDb(db);
    return true;
  }
  return false;
}

/**
 * Save chat session message history under the user's isolated document
 */
export async function saveChatMessage(userId, sessionId, message) {
  const msgId = `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const payload = {
    id: msgId,
    userId,
    sessionId,
    role: message.role, // 'user' | 'model' | 'assistant'
    content: message.content,
    createdAt: new Date().toISOString()
  };

  const fsDb = getFirestore();
  if (fsDb) {
    try {
      await fsDb
        .collection('users')
        .doc(userId)
        .collection('chat_sessions')
        .doc(sessionId)
        .collection('messages')
        .doc(msgId)
        .set(payload);
      return payload;
    } catch (err) {
      console.warn('[Firestore] saveChatMessage remote error:', err.message);
    }
  }

  const db = readLocalDb();
  if (!db.chat_sessions[sessionId]) {
    db.chat_sessions[sessionId] = { id: sessionId, userId, messages: [] };
  }
  db.chat_sessions[sessionId].messages.push(payload);
  writeLocalDb(db);
  return payload;
}

/**
 * Retrieve user chat session history
 */
export async function getUserChatHistory(userId, sessionId = 'default') {
  const fsDb = getFirestore();
  if (fsDb) {
    try {
      const snapshot = await fsDb
        .collection('users')
        .doc(userId)
        .collection('chat_sessions')
        .doc(sessionId)
        .collection('messages')
        .orderBy('createdAt', 'asc')
        .get();

      const messages = [];
      snapshot.forEach(doc => messages.push(doc.data()));
      return messages;
    } catch (err) {
      console.warn('[Firestore] getUserChatHistory remote error:', err.message);
    }
  }

  const db = readLocalDb();
  const session = db.chat_sessions[sessionId];
  if (session && session.userId === userId) {
    return session.messages || [];
  }
  return [];
}
