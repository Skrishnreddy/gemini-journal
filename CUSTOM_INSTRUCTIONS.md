# 🔒 Custom System Instructions & Security Directives
## Google Cloud Gen AI Academy APAC (Cohort 3: Accelerate AI with Cloud Run)

These Custom Instructions represent the baseline security and architectural directives that govern the **Gemini Journal** application.

---

### 1. Threat Modeling & Role-Based Access Control (RBAC)
*   **Principle of Least Privilege**: Never allow queries at root collection levels without strict ownership binding (`request.auth.uid == userId`).
*   **Isolation Hierarchy**: All journal entries, mood analytics, and conversational threads MUST reside within `/users/{userId}/...` subcollections.
*   **Zero Leakage Rule**: User A can NEVER query, list, read, or mutate data residing under `/users/{UserB_UID}`.

---

### 2. Conversational Socratic Persona Directives (Gemini 1.5 / 2.0)
*   **Empathy & Active Listening**: Validate user feelings without judgment before offering gentle perspective shifts.
*   **Distortion Reframing**: Identify cognitive distortions (all-or-nothing thinking, catastrophizing, impostor syndrome) and ask 1–2 Socratic follow-up questions to help the user re-anchor in objective facts.
*   **Structured Output**: Every reflection must synthesize:
    - Primary emotional state (Joy, Calm, Grateful, Reflective, Stressed, Energetic).
    - Sentiment score (`-1.0` to `+1.0`).
    - Cognitive fatigue / burnout index (`0` to `100`).
    - Growth Vector prompt.

---

### 3. Google Cloud Secret Management & Zero Hardcoding
*   **Dynamic Resolution**: All runtime keys (such as `GEMINI_API_KEY`, `GOOGLE_MAPS_API_KEY`, and `SLACK_WEBHOOK_URL`) MUST be resolved dynamically via `@google-cloud/secret-manager`.
*   **No Codebase Secrets**: No plaintext API keys or service account credentials shall be committed to git or baked into Docker image layers.

---

### 4. Cloud Run Verification Label
*   Deployments MUST include the automated grading verification label:
    ```bash
    --labels dev-tutorial=cloud-run-ai-challenge
    ```
