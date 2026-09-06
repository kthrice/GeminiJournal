# Personal Gemini Journal

Personal Gemini Journal is a production-grade, authenticated web application built with React, Node.js (Express), Cloud Firestore, Firebase Authentication, and the Google Gemini API. It enables users to have multi-turn reflective conversations with Gemini, generate an AI-synthesized **Reflection Compass**, and securely persist reflections in owner-isolated Cloud Firestore documents.

---

## Architecture & Tech Stack

```
[Browser / React 19 Client]
     │
     ├── Firebase Client SDK ────▶ [Firebase Authentication (Google Identity)]
     ├── Firestore Client SDK ───▶ [Cloud Firestore: /users/{uid}/journalEntries/{entryId}]
     │                             (Enforced by strict owner-bound firestore.rules)
     │
     └── Secure REST Calls ──────▶ [Node.js / Express Server API]
         (Bearer ID Token)              │
                                        ├── Cryptographic Token Verification (Google Identity Toolkit)
                                        ├── Sliding-Window Rate Limiter (20 req/min per UID)
                                        ├── Defensive Payload Validation & Sanitization
                                        └── Resilient Model Fallback Ladder (Gemini 3.8 Flash, 3.6, 3.1 Lite)
                                             │
                                             └── Encrypted Server-Side Secrets ──▶ [Google Cloud Secret Manager]
```

### File Structure

```
├── firebase-applet-config.json    # Project-specific Firebase configuration
├── firebase-blueprint.json        # Database collection blueprint
├── firestore.rules                # Cloud Firestore owner-bound security rules
├── metadata.json                  # Application metadata & platform capabilities
├── package.json                   # App manifest, build, dev, and start scripts
├── server.ts                      # Express API proxy, token verification, rate limiting & Gemini fallback
├── src/
│   ├── App.tsx                    # Main controller: routing, auth state, modal management
│   ├── types.ts                   # TypeScript interfaces (JournalEntry, ReflectionCompass, ChatMessage)
│   ├── main.tsx                   # React client entrypoint
│   ├── index.css                  # Tailwind CSS styling configuration
│   ├── lib/
│   │   └── firebase.ts            # Client-side Firebase Auth & Firestore data synchronization
│   └── components/
│       ├── Header.tsx             # Navigation bar, user avatar, security modal launcher, sign out
│       ├── LandingPage.tsx        # Unauthenticated landing page with feature showcase & Google sign-in
│       ├── Dashboard.tsx          # Authenticated dashboard with stats, top moods, recent reflections
│       ├── ConversationView.tsx   # Multi-turn chat interface with prompt starters & compass generation
│       ├── ReflectionCompassCard.tsx # Dedicated Reflection Compass card (summary, themes, mood, next step, question)
│       ├── JournalListView.tsx    # Search, filter, read, and delete journal entries
│       ├── EntryDetailModal.tsx   # Detailed modal with full dialogue transcript & Reflection Compass
│       └── SecurityAuditModal.tsx # Defense-in-depth compliance checklist and verification
└── README.md                      # Deployment & security documentation
```

---

## 1. Cloud Firestore Security Rules

Deploy these rules to guarantee strict owner-bound data isolation on the `/users/{userId}/journalEntries/{entryId}` path:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function verifying authenticated owner
    function isOwner(userId) {
      return request.auth != null && request.auth.uid == userId;
    }

    // Explicit owner-bound journalEntries collection matching exact schema
    match /users/{userId}/journalEntries/{entryId} {
      allow read, delete: if isOwner(userId);
      
      allow create: if isOwner(userId)
        && request.resource.data.userId == userId
        && request.resource.data.title is string
        && request.resource.data.title.size() <= 300
        && request.resource.data.messages is list
        && request.resource.data.messages.size() <= 80
        && request.resource.data.summary is string
        && request.resource.data.summary.size() <= 5000;
        
      allow update: if isOwner(userId)
        && request.resource.data.userId == userId
        && request.resource.data.title is string
        && request.resource.data.title.size() <= 300
        && request.resource.data.messages is list
        && request.resource.data.messages.size() <= 80
        && request.resource.data.summary is string
        && request.resource.data.summary.size() <= 5000;
    }

    // Default deny for all other collections and documents
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

---

## 2. Google Cloud Secret Manager Setup

Store your `GEMINI_API_KEY` securely in Secret Manager rather than baking it into environment files or client code:

```bash
# 1. Enable required Google Cloud APIs
gcloud services enable \
  run.googleapis.com \
  secretmanager.googleapis.com \
  firestore.googleapis.com \
  identitytoolkit.googleapis.com

# 2. Create and populate the secret
gcloud secrets create GEMINI_API_KEY --replication-policy="automatic"
echo -n "YOUR_API_KEY" | gcloud secrets versions add GEMINI_API_KEY --data-file=-

# 3. Grant Cloud Run runtime service account permission to read the secret
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

gcloud secrets add-iam-policy-binding GEMINI_API_KEY \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

---

## 3. Google Cloud Run Deployment Flow

Deploy the full-stack container on Cloud Run:

```bash
# Build and deploy container directly to Cloud Run with Secret Manager binding
gcloud run deploy personal-gemini-journal \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-env-vars="NODE_ENV=production"

# Apply mandatory campaign verification label
gcloud run services update personal-gemini-journal \
  --update-labels=dev-tutorial=cloud-run-ai-challenge \
  --region=us-central1
```

---

## 4. End-to-End Functional & Security Test Walkthrough

Every user action and system boundary has an explicit test case:

### Test Case 1: Landing Page & Unauthenticated State
* **Action**: Open the application URL without an active Firebase session.
* **Expected Result**: The Landing Page displays with clear explanations of the app, the 5 dimensions of the Reflection Compass, and a prominent Google Sign-in button. No private journal data is exposed.

### Test Case 2: Google Authentication Flow
* **Action**: Click "Continue with Google" and complete Google account consent.
* **Expected Result**: Firebase Authentication sets the active user, the header transitions to show the user's avatar and navigation tabs, and the Dashboard loads.

### Test Case 3: Authenticated Dashboard
* **Action**: View the Dashboard.
* **Expected Result**: Shows user greeting, counts of logged reflections, dominant mood tracker, and the latest Reflection Compass spotlight.

### Test Case 4: Multi-Turn Conversation with Gemini
* **Action**: Navigate to "New Conversation", enter a message or click a starter prompt, and click Send.
* **Expected Result**: The message is sent to `/api/ai/chat` with Bearer token. Gemini responds with compassionate, reflective prose within 2 seconds. Follow-up turns preserve conversation history.

### Test Case 5: Reflection Compass Synthesis
* **Action**: Click "Generate Reflection Compass" after at least one dialogue turn.
* **Expected Result**: `/api/ai/reflection-compass` evaluates the transcript and returns the 5 dimensions: concise summary, exactly 3 themes, mood label with confidence %, one practical next step, and a reflection question. The Reflection Compass card renders with amber badge styling.

### Test Case 6: Save Journal Entry
* **Action**: Click "Save as Journal Entry".
* **Expected Result**: Sanitized payload (stripping `undefined`) writes to `/users/{uid}/journalEntries/{entryId}` in Cloud Firestore. A success notification displays and navigates to the Journal archive.

### Test Case 7: Search and Filter Journal Entries
* **Action**: Navigate to "Journal", type a keyword in the search bar, or click a mood pill.
* **Expected Result**: The list filters instantly to matching reflections without server roundtrips.

### Test Case 8: Open Entry for Full Conversation & Compass
* **Action**: Click any entry in the journal list or dashboard.
* **Expected Result**: `EntryDetailModal` opens showing the full Reflection Compass card at top and the complete, chronologically ordered dialogue transcript below.

### Test Case 9: Delete Journal Entry
* **Action**: Click the trash icon on an entry and confirm deletion in the confirmation prompt.
* **Expected Result**: The document is deleted from Firestore and disappears immediately from the list.

### Test Case 10: Sign Out
* **Action**: Click "Sign Out" in the header.
* **Expected Result**: Firebase Auth session terminates; the user is redirected immediately to the Landing Page.

### Test Case 11: Unauthenticated Endpoint Denial
* **Action**: Send `curl -X POST http://localhost:3000/api/ai/reflection-compass -d '{"messages":[]}'` without auth header.
* **Expected Result**: HTTP 401 Unauthorized (`{"error": "Unauthorized: Missing or invalid authorization token"}`). Zero AI logic is invoked.

### Test Case 12: Sliding-Window Rate Limiting
* **Action**: Send > 20 requests in 60 seconds with the same token.
* **Expected Result**: Requests 1–20 return HTTP 200; requests 21+ return HTTP 429 Too Many Requests.
