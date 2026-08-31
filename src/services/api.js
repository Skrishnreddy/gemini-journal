const API_BASE = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('gemini_journal_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  // System Health
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },

  // Auth & Session
  async getDemoSession(persona = 'grace') {
    const res = await fetch(`${API_BASE}/auth/demo-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ persona })
    });
    if (!res.ok) throw new Error('Demo login failed');
    return res.json();
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Unauthorized');
    return res.json();
  },

  // Journal Entries
  async getEntries() {
    const res = await fetch(`${API_BASE}/entries`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to fetch entries');
    return res.json();
  },

  async createEntry(entryPayload) {
    const res = await fetch(`${API_BASE}/entries`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(entryPayload)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to save entry');
    }
    return res.json();
  },

  async updateEntry(id, payload) {
    const res = await fetch(`${API_BASE}/entries/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to update entry');
    return res.json();
  },

  async deleteEntry(id) {
    const res = await fetch(`${API_BASE}/entries/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to delete entry');
    return res.json();
  },

  // Conversational AI & Brainstorming
  async sendChatMessage(messages, sessionId = 'default') {
    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ messages, sessionId })
    });
    if (!res.ok) throw new Error('AI Chat response failed');
    return res.json();
  },

  async getChatHistory(sessionId = 'default') {
    const res = await fetch(`${API_BASE}/ai/chat/history?sessionId=${sessionId}`, {
      headers: { ...getAuthHeader() }
    });
    return res.json();
  },

  async analyzeSentiment(content, title = '') {
    const res = await fetch(`${API_BASE}/ai/sentiment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ content, title })
    });
    return res.json();
  },

  async analyzePhoto(photoBase64, notes = '') {
    const res = await fetch(`${API_BASE}/ai/photo-analysis`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify({ photo: photoBase64, notes })
    });
    return res.json();
  },

  // Novel Features: Mood Rewind & Burnout Radar
  async getMoodRewind(period = 'This Year') {
    const res = await fetch(`${API_BASE}/analytics/mood-rewind?period=${encodeURIComponent(period)}`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load Mood Rewind');
    return res.json();
  },

  async getBurnoutRadar() {
    const res = await fetch(`${API_BASE}/analytics/burnout-radar`, {
      headers: { ...getAuthHeader() }
    });
    if (!res.ok) throw new Error('Failed to load burnout radar');
    return res.json();
  },

  async triggerSlackAlert(payload) {
    const res = await fetch(`${API_BASE}/notifications/slack-burnout-alert`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader()
      },
      body: JSON.stringify(payload)
    });
    return res.json();
  }
};
