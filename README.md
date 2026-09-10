# Nivora 🌱 — Memories. People. Connection.

> **Official Tagline:** *Memories. People. Connection.*  
> **Positioning:** *Personalized cognitive engagement and memory assistance platform.* (Non-diagnostic).  
> **Audience:** Older adults, individuals experiencing mild cognitive impairment, and their family/clinical caregivers.  
> **Design Theme:** Accessible, calming, warm design with WCAG AA+ compliance, elder-friendly large typography, and zero stressful gamification.

---

## 🌐 Live Public Link

- **Live Public Application:** [https://task-prize-adapter-arrange.trycloudflare.com](https://task-prize-adapter-arrange.trycloudflare.com)
  *(Accessible instantly on all mobile phones and desktop browsers with no passwords or prompts)*
- **Caregiver Dashboard:** [https://task-prize-adapter-arrange.trycloudflare.com/caregiver/dashboard](https://task-prize-adapter-arrange.trycloudflare.com/caregiver/dashboard)
- **Patient Dashboard:** [https://task-prize-adapter-arrange.trycloudflare.com/patient/dashboard](https://task-prize-adapter-arrange.trycloudflare.com/patient/dashboard)

---

## 🌟 Core Pillars & Real-World Solutions

1. **Caregiver Data-Entry Reduction (Quick Memory Setup):**
   - Natural language extractor parses free-form sentences into structured memory nodes across 7 categories (Occupation, Food, Places, Festivals, Music, Family, Hobbies).
   - Structured `[Accept / Edit / Reject]` pipeline guarantees unapproved AI suggestions never reach the patient.

2. **Memory Confidence, Provenance & Outdated Controls:**
   - Explicit provenance tracking: `🛡️ Caregiver Entered`, `✨ Caregiver Approved AI`, `📥 Imported History`.
   - Lifecycle controls: `Active`, `Archived`, `Deleted`, and `★ Primary / Important`.
   - **Guaranteed Exclusion:** Archived memories remain in caregiver records but are strictly 100% excluded from cognitive activities.

3. **AI Activity Traceability & Problem Reporting:**
   - Memory attribution: *"Why was this activity created? Based on: [Memory snippet]"*.
   - `[⚠️ Report a Problem]` modal permanently flags and excludes unsuitable activities.

4. **Female-First Audio Companion & Voice Guidance:**
   - Prioritizes calming female voices by default across all patient interactions (instructions, questions, supportive feedback, "Hear Again").
   - Paced at 0.88x speed for elderly cognitive comfort.
   - Non-discouraging feedback variations for mistakes (*"Good try. Let's try another one."*).

5. **Multilingual Capability Matrix & Honest Fallbacks:**
   - Explicit capability detection per language (Text, Voice Synthesis, Speech Input, AI Generation).
   - Honest fallback: Regional dialects without native browser TTS voices (e.g. Khasi, Manipuri) gracefully use high-contrast elder visual cards and harmonic sound chimes.

6. **Offline Session Synchronization Queue:**
   - Caches completed sessions in `localStorage` during network drops.
   - Automatically flushes to the database on reconnection with zero data loss.

7. **Platform Telemetry & Medical Claim Disclaimer:**
   - Live health status for Network, AI Engine, Female Voice, Speech Input, Database, and Auto-Sync.
   - Mandatory Clinical Notice and Intended Use disclosure.

---

## 🎮 8 Fully Implemented Cognitive Activities

| Activity | Domain | Description |
| :--- | :--- | :--- |
| **🌅 Daily Orientation** | Temporal & Emotional Awareness | Morning check-in for Day, Date, Weather, Season, and Mood with speech input and star rewards. |
| **🌸 Memory Match** | Visual Pattern & Short-Term Memory | Adaptive pairs matching with cultural cards, timer, move counter, and audio chime feedback. |
| **📻 Reminiscence Trivia** | Long-Term Autobiographical Memory | Tailored questions based on patient's hometown, birth era, and family memories. |
| **💖 Face & Name Recall** | Semantic & Face Recognition | Family member photos with relationship hints and multiple-choice recall. |
| **🔢 Put It in Order (Sequence)** | Executive Function & Sequencing | Chronological re-ordering of familiar daily routines (e.g. Morning Chai, Gardening). |
| **🔗 Object & Memory Association** | Semantic Association | Matching pairs with associative logic (e.g. Lemon & Fish Curry, Needle & Thread). |
| **📂 Category Sort** | Cognitive Flexibility & Categorization | Sorting items into appropriate bins (e.g. Traditional Foods vs Festivals). |
| **🖼️ Remember the Picture** | Visual Working Memory | Study an evocative nostalgia photo for 10 seconds, then answer gentle observational questions. |

---

## 🔑 Demo Logins & Access PINs

- **Caregiver Portal:** Tap **"Caregiver"** $ightarrow$ 1-tap instant login as **Dr. Anita Sharma** (no password required).
- **Patient 6-Digit PINs:**
  - **Dharani Baruah** (Guwahati, Assam): `123456`
  - **Kamala Devi** (Shillong, Meghalaya): `789012`
  - **Ningombam Sanatomba** (Imphal, Manipur): `345678`

---

## 🛠️ Tech Stack

- **Framework:** Next.js 15 (App Router) + React 19 + TypeScript
- **Styling:** Tailwind CSS + Subtle Glassmorphism + Dark & Light Accessible Themes
- **State:** Zustand reactive stores (Auth, Game, Accessibility, Onboarding)
- **Voice & Audio:** Web Speech Synthesis API (female priority) + Web Audio API harmonic sound synthesizers
- **Persistence:** LocalStorage offline queue + Next.js Route Handlers + Hybrid Data Store
- **Tunneling:** Cloudflare Edge Quick Tunnels (`cloudflared`)

---

## 🚀 Local Development Setup

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start -- -p 3000
```
