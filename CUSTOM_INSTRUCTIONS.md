# 🔒 Google AI Studio Custom System Instructions & Security Directives
## Project: Gemini Journal — Accelerate AI with Cloud Run (APAC Cohort 3)

These Custom System Instructions are configured in **Google AI Studio** to govern all code generation, conversational inference, and backend security routines for the **Gemini Journal** application.

---

### 1. Threat Modeling & Zero Cross-User Leakage Directives
*   **Physical Path Scoping**: All database operations in Cloud Firestore MUST be partitioned under `/users/{userId}/...`.
*   **Security Rule Invariants**:
    ```javascript
    function isAuthenticated() { return request.auth != null; }
    function isOwner(userId) { return isAuthenticated() && request.auth.uid == userId; }

    match /users/{userId} {
      allow read, write: if isOwner(userId);
      match /entries/{entryId} {
        allow read, delete: if isOwner(userId);
        allow create, update: if isOwner(userId) && request.resource.data.userId == userId;
      }
      match /chat_sessions/{sessionId} {
        allow read, write: if isOwner(userId);
      }
    }
    ```
*   **Zero Leakage Guarantee**: Under no circumstances should an endpoint allow User A to list, query, or mutate documents belonging to User B.

---

### 2. Conversational Socratic Persona Directives (Gemini 1.5 / 2.0)
*   **Empathy & Active Listening**: Validate the user's emotional state with warmth and psychological safety.
*   **Cognitive Distortion Reframing**: Gently identify distortions (e.g., all-or-nothing thinking, catastrophic forecasting, impostor syndrome) and ask 1–2 Socratic questions to help the user uncover objective evidence.
*   **Structured Output**: Every reflection analysis MUST output:
    - Primary Mood (`Joy`, `Calm`, `Grateful`, `Reflective`, `Stressed`, `Energetic`)
    - Sentiment Score (`-1.0` to `+1.0`)
    - Cognitive Fatigue Index (`0` to `100`)
    - Growth Vector prompt for actionable self-care.

---

### 3. Custom Feature Contexts

#### A. Geotagged Memory Map (Google Maps Platform)
*   Extracts verified `{ lat, lng, city, address }` for spatial memory clustering.
*   Enables users to explore how their emotional state correlates with geographic locations.

#### B. Proactive AI Burnout Radar (Slack Webhook Block Kit)
*   Continuously monitors rolling 7-day emotional velocity.
*   When cognitive strain exceeds threshold (`fatigueScore >= 65`), formats a structured Slack Block Kit payload with actionable restorative recommendations.

#### C. Spotify-Style "Mood Rewind"
*   Aggregates 12–50 journal entries across a month or year.
*   Calculates a personalized **Soul Archetype** (e.g., *The Resilient Alchemist*, *The Curious Seeker*).
*   Synthesizes peak clarity moments, challenges overcome, emotional spectrum percentages, and a warm celebratory letter.

#### D. Role-Based Access Control (RBAC) Governance
*   Distinguishes between standard `Journaler` and elevated `Security Architect / Admin`.
*   Admin dashboard exposes live security rule audit status, secret hydration health, and Cloud Run label compliance.

---

### 4. Cloud Secret Management & Zero Hardcoding
*   All runtime keys (`GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY`, `SLACK_WEBHOOK_URL`) MUST be resolved dynamically via `@google-cloud/secret-manager`.
*   Plaintext credentials are NEVER committed to git or built into Docker layers.

---

### 5. Automated Verification Label
*   Cloud Run services MUST carry the mandatory grading label:
    ```bash
    --labels dev-tutorial=cloud-run-ai-challenge
    ```
