# 🏆 Official Hackathon Submission: Gemini Journal

> **Google Cloud Gen AI Academy APAC Edition – Cohort 3: "Accelerate AI with Cloud Run"**  
> **Challenge Track:** Accelerate AI with Cloud Run  
> **Mandatory Hashtag:** `#accelerateAIwithCloudRun`

---

## 📋 Final Submission Checklist

- [x] **1. Working Live URL:** Deployed container live on Google Cloud Run.
- [x] **2. Public Code Repository:** Full frontend, backend, `firestore.rules`, Dockerfile, and README.
- [x] **3. Cloud Firestore Security Rules:** `firestore.rules` enforcing zero cross-user leakage.
- [x] **4. Written Solution Description:** Mandatory "How" and "Why" narrative (provided below).
- [x] **5. Public Social Media Post:** LinkedIn / X walkthrough post with `#accelerateAIwithCloudRun` (template provided below).

---

## 📝 1. Written Solution Description (For Hack2Skill Submission Box)

### **Project Title:** Gemini Journal — Intelligent, Role-Isolated Mindful Journaling on Cloud Run

### **The "Why" (Human Narrative & Motivation):**
In our hyper-connected modern workflow, knowledge workers and developers are constantly bombarded with context switching, resulting in silent cognitive fatigue and burnout. While traditional journaling has long been celebrated as a premier tool for self-awareness, paper diaries and basic note apps are passive: they store words but cannot listen, spot cognitive distortions, or alert us when stress reaches dangerous inflection points.

We built **Gemini Journal** to transform journaling from a static archive of the past into an empathetic, active emotional compass. Our vision was to engineer a private, enterprise-grade sanctuary that respects strict data isolation while providing the reflective intelligence of a Socratic coach and the visual delight of an annual retrospective.

### **The "How" (Technical Stack & Google Cloud Synergy):**
1. **Google Cloud Run:** Hosts our unified containerized Node/React architecture. Cloud Run delivers instant auto-scaling, sub-second cold starts, and secure HTTPS termination with zero server management overhead.
2. **Firebase Authentication & Admin SDK:** Restricts all API routes through JWT ID token validation.
3. **Cloud Firestore:** Implements role-based database isolation where all collections are nested under `/users/{uid}/...`. Coupled with strict `firestore.rules`, we guarantee **zero cross-user database leakage**.
4. **Google Cloud Secret Manager:** Sensitive credentials (such as the Gemini API Key) are resolved dynamically at runtime using `@google-cloud/secret-manager`, eliminating hardcoded keys from source code and Docker layers.
5. **Conversational Gemini API (1.5 / 2.0):** Drives multi-turn reflective brainstorming, Socratic questioning, real-time emotional sentiment extraction, and multimodal vision analysis of attached photos.
6. **Novel Winning Features:**
   - **Spotify-Style "Mood Rewind":** An interactive 5-slide animated retrospective that analyzes an entire year's emotional spectrum, calculates a personal "Soul Archetype" (e.g. *The Resilient Alchemist*), and delivers a personalized AI celebratory letter with confetti.
   - **Geotagged Memory Trail:** Built with **Google Maps Platform** to visualize memories geographically across cities and coordinates with mood-colored pins.
   - **AI Burnout Radar & Slack Alerts:** Continuously computes rolling 7-day emotional velocity and sends proactive wellness dispatches to Slack to prevent burnout before it peaks.

---

## 📢 2. Public Social Media Post Blueprint

> Copy and paste this text to LinkedIn or X (Twitter) alongside your demo video/screenshots:

```markdown
🚀 Excited to unveil "Gemini Journal" — built for the Google Cloud Gen AI Academy APAC (Cohort 3: Accelerate AI with Cloud Run)!

Traditional journals are static. Gemini Journal turns reflection into an active, empathetic emotional compass:
✨ Multi-turn Socratic conversational AI powered by Gemini 1.5
🔒 Zero cross-user database leakage via role-isolated Cloud Firestore
🔑 Dynamic runtime secret resolution via Google Cloud Secret Manager
📊 Spotify-style "Mood Rewind" annual emotional recap & Soul Archetypes
🗺️ Geotagged spatial memory explorer powered by Google Maps Platform
🚨 Proactive AI Burnout Radar with enterprise Slack alerts

Deployed effortlessly as a containerized microservice on Google Cloud Run.

Check out the project repository: [INSERT_GITHUB_REPO_URL]
Live Demo: [INSERT_CLOUD_RUN_URL]

#accelerateAIwithCloudRun #GoogleCloud #GenAI #Gemini #CloudRun #Firebase
```

---

## 🔐 3. Security & Threat Modeling Summary

| Threat Vector | Mitigation Strategy |
| :--- | :--- |
| **Credential Scraping** | Google Cloud Secret Manager dynamic resolution; keys never committed or baked into images. |
| **Cross-User Data Leakage** | All documents stored in `/users/{userId}/...` subcollections; `firestore.rules` and backend middleware verify `request.auth.uid == userId`. |
| **API Overload / DoS** | Express rate limiting (`express-rate-limit`) and unprivileged Node.js alpine execution. |
| **Prompt Injection** | Structured JSON schema enforcement (`responseMimeType: "application/json"`) and system instruction grounding. |
