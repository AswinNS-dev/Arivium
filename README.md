# 🎯 Arivium — From Student to Job-Ready

> A hyper-personalized, AI-powered career readiness platform for students. Not just learning — proving you're ready.

---

## 📌 Problem Statement

Most students, especially in their 1st and 2nd years, don't know **where they stand**, **what to learn**, or **how close they are to being job-ready** for their target role. Generic platforms like LeetCode, Udemy, and Coursera exist in silos — there's no single system that:

- Understands a student from scratch (no resume needed)
- Builds a **personalized roadmap** based on their domain interest
- Tests them on real-world CS fundamentals (DSA, DBMS, OS, OOP, System Design)
- Tracks **live progress** and adapts difficulty
- Helps them **connect with peers** in the same domain
- Motivates them through **scheduled challenges, goodies, and idea exchanges**
- Ultimately signals: *"You are ready for this role."*

CareerForge solves all of this in one platform.

---

## 🧭 Platform Overview

```
[Onboarding] → [Domain + Role Selection] → [Personalized Roadmap]
      ↓
[Skill Assessment] → [Gap Report] → [Prep Loop: L1 → L2 → L3]
      ↓
[Community Connect] → [Scheduled Challenges] → [Goodies + Idea Exchange]
      ↓
[Job Readiness Score] → [Shareable Certificate]
```

---

## 🗂️ Feature Modules — Detailed Breakdown

---

### Module 1 — Smart Onboarding (No Resume Required)

**The Problem:** A 1st-year student has no resume. Forcing one blocks entry.

**The Solution:** Two onboarding paths:

#### Path A — Resume Upload (Optional, for 3rd/4th years)
- User uploads PDF resume
- Backend parses it using `pdfplumber` → sends to LLM for structured extraction
- Extracts: listed skills, projects, internships, education, certifications
- Auto-fills the profile form with parsed data (user reviews + edits)

#### Path B — Manual Profile Builder (Default for freshers)
- Step-by-step form:
  1. Name, College, Year of Study, Branch
  2. Domain of Interest (select from: Web Dev, Data Science, DevOps, ML/AI, Android, Cybersecurity, Embedded Systems, etc.)
  3. Target Role (e.g., "Backend Developer", "Data Analyst", "ML Engineer")
  4. Self-rated current skills (slider: Beginner / Intermediate / Advanced per topic)
  5. Currently learning? (free text or multi-select)
  6. Time available per day for prep (1hr / 2hr / 3hr+)

**Output:** A structured `StudentProfile` object stored in Supabase.

```
StudentProfile {
  id, name, college, year, branch,
  domain, target_role,
  self_rated_skills: { DSA, DBMS, OS, OOP, SystemDesign, ... },
  hours_per_day,
  onboarding_type: "resume" | "manual",
  created_at
}
```

---

### Module 2 — Domain-Specific Roadmap Generation

**Goal:** Give every student a *personal* roadmap, not a generic one.

#### How it works:
1. Based on `domain` + `target_role` + `self_rated_skills`, the LLM generates a structured roadmap.
2. Roadmap is split into **phases** (e.g., Phase 1: Foundations → Phase 2: Core DSA → Phase 3: System Design → Phase 4: Role-specific).
3. Each phase has **topics**, each topic has:
   - Concept explanation (short)
   - Recommended resources (YouTube / Udemy / Coursera — see Module 6)
   - Practice problems (LeetCode / HackerRank tagged by topic)
   - Mini-assessment to unlock next topic

#### Roadmap is **dynamic**:
- Starts from the student's self-rated level (skips beginner content if intermediate)
- Adjusts difficulty week over week based on assessment performance
- Reorders priority if certain skills are flagged as critical gaps

#### Roadmap Storage in Supabase:
```
Roadmap {
  student_id,
  domain,
  target_role,
  phases: [
    {
      phase_number, phase_name,
      topics: [
        {
          topic_id, topic_name, status: "locked|active|completed",
          resources: [...], problems: [...], assessment_score
        }
      ]
    }
  ],
  overall_progress_percent,
  last_updated
}
```

---

### Module 3 — Core Subject Assessments

**Focus Areas (Not optional — these are the backbone):**

| Subject | Why It Matters |
|---|---|
| DSA | Every tech interview — arrays, trees, graphs, DP |
| DBMS | Backend, data roles — SQL, normalization, indexing |
| OOP | Java/C++/Python roles — principles, design patterns |
| OS | Systems, DevOps — processes, memory, scheduling |
| System Design | Senior/product roles — scalability, trade-offs |
| CN (Computer Networks) | Backend, security roles — HTTP, TCP/IP, DNS |
| Domain-specific | Role-specific depth (e.g., ML math for AI roles) |

#### Assessment Engine:
- Questions are **LLM-generated** from the student's current weak topics
- Question types:
  - **MCQ** — concept recall, identify the output
  - **Code editor** (Monaco Editor in browser) — implement a function
  - **Short answer** — "Explain why a hash map is O(1) average"
  - **Scenario-based** — "You have 1M users, design the DB schema"
- After each answer: student self-rates confidence (1–5)
- LLM compares confidence vs correctness to detect **lucky guesses** vs **genuine understanding**

#### Proctoring (Hackathon-realistic):
- `onpaste` blocked on all inputs
- `visibilitychange` / `blur` — tab switch detection (3 strikes = test flagged)
- `contextmenu` blocked (no right-click)
- Per-question countdown timer
- All violations logged to Supabase with timestamps

#### Re-attempt Policy:
- **Unlimited retakes** — students can attempt again and again
- Each attempt generates **fresh questions** (no memorization possible)
- Scores tracked per attempt → progress graph shown
- A minimum score threshold (e.g., 75%) is required to "complete" a topic
- Earning credit marks on passing contributes to overall **Job Readiness Score**

---

### Module 4 — Gap Report & Readiness Score

After each assessment, the student gets a detailed breakdown:

```
Gap Report {
  overall_readiness_score: 0–100,
  per_subject_scores: {
    DSA: 72, DBMS: 34, OS: 55, OOP: 80, SystemDesign: 20
  },
  critical_gaps: ["SystemDesign", "DBMS"],  // ranked by impact on target role
  verdict: "Not ready. Here's why.",
  recommended_next_steps: [...],
  jd_comparison: {
    // What real JDs for this role require vs what student scored
    required_skills: [...],
    student_coverage: "62%"
  }
}
```

**Job Readiness Score** is a live, cumulative metric:
- Weighted by topic importance for their target role
- Updates after every assessment attempt
- Displayed as a progress ring on dashboard
- Threshold to unlock "Job Ready" certificate: **85/100**

---

### Module 5 — Leveled Prep Loop

Three progressive difficulty levels, each unlocked by passing the previous:

**L1 — Concept Recall**
Can you define it? Identify it? Recall the formula or rule?
→ Flash-card style, MCQ, 2–3 min per session

**L2 — Applied Problems**
Can you use it on a real dataset or scenario?
→ Code editor, structured problem, 10–15 min per session

**L3 — Interview-Hard**
Ambiguous, open-ended, "what would you do if..."
→ Exactly what senior engineers ask in FAANG/product startup interviews

After each level:
- LLM debrief: what was the correct answer, why your answer fell short, one resource to read
- XP points earned → displayed on profile
- Topic marked as ✅ mastered only after L3 completion

---

### Module 6 — Resource Recommendation Engine

**For every topic and gap, the platform suggests curated resources:**

**YouTube:**
- Free, high-quality channels mapped per domain
- Examples: Abdul Bari for DSA, Neso Academy for DBMS/OS, TechWithTim for Python, Fireship for Web Dev

**Udemy / Coursera:**
- Paid courses linked with estimated time + price
- Platform fetches course metadata via Udemy Affiliate API / Coursera API
- Shown with: instructor name, rating, hours, cost, relevance score to student's gap

**LeetCode / HackerRank Problems:**
- Tagged by topic + difficulty
- Recommended in order of gap priority
- Linked directly, opens in new tab

**Resource card structure:**
```
Resource {
  type: "youtube" | "udemy" | "coursera" | "problem",
  title, url, platform,
  relevance_to_gap: "high" | "medium",
  estimated_time: "2h 30m",
  rating, cost
}
```

---

### Module 7 — Community Connect (Peer Networking)

**Goal:** Students with the same domain interest can find each other, share knowledge, and grow together.

#### Features:

**1. Domain-based Discovery**
- Browse students by domain (e.g., "Show me all Data Science learners")
- Filter by: college, year, current skill level, target company
- View anyone's public profile: roadmap progress, skills, badge count

**2. Connect System**
- Send/accept connection requests (like LinkedIn)
- Connected users appear in your "Network" tab
- Connection stored in Supabase: `connections` table

**3. Direct Messaging**
- Lightweight in-app chat between connected users
- Share resources, problems, explain concepts
- Built on Supabase Realtime (WebSocket-based)

**4. Domain Study Groups**
- Auto-created groups per domain + target role combination
- Group feed: post questions, share resources, celebrate wins
- Moderated by most active members (karma-based)

---

### Module 8 — Scheduled Challenges & Goodies

**Goal:** Keep students consistent through structured weekly events + rewards.

#### Weekly Challenge Schedule:
- Every Monday: new domain challenge posted (e.g., "SQL Week: Write a window function query for this dataset")
- Students get 7 days to solve and submit
- Difficulty scales with the student's current level
- Tracked in Supabase: `challenges` table

#### Idea Exchange Sessions:
- Bi-weekly scheduled event (calendar invite-style)
- 4–6 students matched by domain + level
- Each student presents a mini-idea (30 seconds): a project idea, a concept they learned, or a problem they solved
- Others give reactions + comments
- Session summary saved to their profile as a "Presentation" badge

#### Goodies System:
- Completing a weekly challenge → earn **Coins** (in-app currency)
- Coins redeemable for:
  - Platform badges shown on profile
  - "Streak freeze" (miss a day without losing streak)
  - Unlock bonus L3 questions for high-demand topics
  - Future: partner discounts on Udemy courses (via affiliate)
- Leaderboard per domain updated weekly

```
Goodies {
  student_id, coins_balance,
  badges: ["7-day-streak", "DSA-master", "top-contributor"],
  challenge_completions: [...],
  idea_exchanges_attended: 3
}
```

---

### Module 9 — Job Readiness Dashboard (The End Goal)

**The single screen that answers: "Am I ready?"**

Sections:
1. **Job Readiness Score** — live ring (0–100), updates in real time
2. **Roadmap Progress** — phase completion bars with % done
3. **Skill Radar Chart** — spider chart of all subjects, color-coded by strength
4. **Recent Activity Feed** — assessments taken, topics completed, connections made
5. **Weekly Streak** — GitHub-style contribution grid (daily activity heatmap)
6. **Top Gaps** — 3 things to do right now to increase score the fastest
7. **Certificate Unlock** — progress bar toward 85/100 threshold, button unlocks on reaching it

#### Shareable Certificate:
- Generated as PDF when Job Readiness Score hits 85+
- Contains: student name, target role, score, domain, top skills, date
- Unique verification URL (Supabase-stored, publicly accessible)
- Shareable on LinkedIn as an image card

---

## 🏗️ Technical Architecture

### Frontend
- **Framework:** React (Vite) + Tailwind CSS
- **Code Editor:** Monaco Editor (CDN, for coding assessments)
- **Charts:** Recharts (radar chart, progress bars, heatmap)
- **Routing:** React Router v6
- **State Management:** Zustand (lightweight, no Redux overhead)

### Backend
- **Runtime:** Node.js + Express (REST API) OR Next.js API Routes
- **Authentication:** Supabase Auth (email/password + Google OAuth)
- **Database:** Supabase (PostgreSQL)
- **Realtime Chat:** Supabase Realtime (WebSockets)
- **File Storage:** Supabase Storage (resume PDF uploads)

### AI / LLM Layer
- **Primary LLM:** `llama-3.3-70b` via Groq API (fast, free tier available)
- **Orchestration:** LangChain LCEL (prompt chaining for roadmap + question generation)
- **Resume Parsing:** `pdfplumber` (Python microservice) → LLM extraction
- **Question Generation:** LLM prompted with student's gap data → structured JSON output
- **Resource Matching:** LLM ranks and filters resources by relevance to gap

### External APIs
- **Udemy Affiliate API** — fetch course metadata
- **Coursera API** — fetch course metadata
- **YouTube Data API v3** — search and fetch curated videos by topic
- **SerpAPI / ScrapingBee** — optional JD scraping for advanced gap map (free tier)

### Infrastructure
- **Hosting:** Vercel (frontend) + Railway or Render (backend)
- **Database / Auth / Realtime / Storage:** Supabase (single cloud provider)
- **LLM calls:** Groq API (serverless, no GPU needed)

---

## 🗄️ Database Schema (Supabase / PostgreSQL)

```sql
-- Core user profile
students (
  id UUID PRIMARY KEY,
  auth_id UUID REFERENCES auth.users,
  name, college, year, branch, domain, target_role,
  self_rated_skills JSONB,
  hours_per_day INT,
  job_readiness_score INT DEFAULT 0,
  coins INT DEFAULT 0,
  streak_days INT DEFAULT 0,
  created_at TIMESTAMP
)

-- Roadmap per student
roadmaps (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students,
  domain, target_role,
  phases JSONB,
  overall_progress INT DEFAULT 0,
  updated_at TIMESTAMP
)

-- Assessment attempts
assessments (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students,
  subject TEXT,
  questions JSONB,
  answers JSONB,
  score INT,
  proctoring_flags JSONB,
  attempted_at TIMESTAMP
)

-- Connections between students
connections (
  id UUID PRIMARY KEY,
  requester_id UUID REFERENCES students,
  receiver_id UUID REFERENCES students,
  status TEXT CHECK (status IN ('pending','accepted','rejected')),
  created_at TIMESTAMP
)

-- Direct messages
messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES students,
  receiver_id UUID REFERENCES students,
  content TEXT,
  sent_at TIMESTAMP
)

-- Weekly challenges
challenges (
  id UUID PRIMARY KEY,
  domain TEXT,
  title, description, difficulty,
  week_start DATE,
  created_at TIMESTAMP
)

-- Challenge submissions
challenge_submissions (
  id UUID PRIMARY KEY,
  challenge_id UUID REFERENCES challenges,
  student_id UUID REFERENCES students,
  submission TEXT,
  score INT,
  coins_earned INT,
  submitted_at TIMESTAMP
)

-- Badges
badges (
  id UUID PRIMARY KEY,
  student_id UUID REFERENCES students,
  badge_type TEXT,
  earned_at TIMESTAMP
)

-- Resources (cached recommendations)
resources (
  id UUID PRIMARY KEY,
  topic TEXT,
  domain TEXT,
  type TEXT CHECK (type IN ('youtube','udemy','coursera','problem')),
  title, url, platform, rating, cost,
  relevance_tags TEXT[]
)
```

---

## 📁 Project Folder Structure

```
careerforge/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Onboarding.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Roadmap.jsx
│   │   │   ├── Assessment.jsx
│   │   │   ├── GapReport.jsx
│   │   │   ├── PrepLoop.jsx
│   │   │   ├── Community.jsx
│   │   │   ├── Challenges.jsx
│   │   │   └── Certificate.jsx
│   │   ├── components/
│   │   │   ├── RadarChart.jsx
│   │   │   ├── ProgressRing.jsx
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── ResourceCard.jsx
│   │   │   ├── StudentCard.jsx
│   │   │   ├── ChatWindow.jsx
│   │   │   └── RoadmapTimeline.jsx
│   │   ├── store/         (Zustand state slices)
│   │   ├── lib/
│   │   │   ├── supabase.js
│   │   │   └── api.js
│   │   └── App.jsx
│   └── package.json
│
├── backend/
│   ├── routes/
│   │   ├── onboarding.js
│   │   ├── roadmap.js
│   │   ├── assessment.js
│   │   ├── community.js
│   │   ├── challenges.js
│   │   └── resources.js
│   ├── services/
│   │   ├── llm.js          (Groq API calls, prompt templates)
│   │   ├── roadmapGen.js   (LangChain LCEL chain)
│   │   ├── questionGen.js  (assessment question generation)
│   │   ├── gapAnalysis.js  (gap scoring logic)
│   │   └── certGen.js      (PDF certificate generation)
│   ├── middleware/
│   │   ├── auth.js         (Supabase JWT verification)
│   │   └── rateLimit.js
│   └── index.js
│
├── resume-parser/          (Python microservice)
│   ├── parser.py           (pdfplumber + LLM extraction)
│   └── requirements.txt
│
├── supabase/
│   ├── migrations/         (SQL schema files)
│   └── seed.sql            (sample data for dev)
│
└── README.md
```

---

## 🔄 End-to-End User Flow

```
1. Sign Up → Supabase Auth creates user
2. Onboarding → Profile built (resume or manual)
3. Domain + Role selected → LLM generates initial roadmap
4. Dashboard loads → Roadmap phases shown, first topic active
5. Student starts Topic 1 → reads concept → watches suggested video
6. Takes mini-assessment → score saved → gap report generated
7. If score < 75% → PrepLoop (L1 → L2 → L3) unlocked for that topic
8. Student re-attempts → score improves → topic marked complete
9. Roadmap auto-advances to next topic
10. Weekly challenge available → student submits → earns coins
11. Student discovers peers in same domain → sends connect request
12. Bi-weekly idea exchange scheduled → student joins → earns badge
13. Job Readiness Score hits 85 → Certificate unlocked → shared on LinkedIn
```

---

## 🚀 Implementation Phases (Suggested Sprint Order)

### Sprint 1 — Foundation (Week 1)
- Supabase project setup (auth, DB schema, storage)
- Frontend: Onboarding flow (both paths), basic dashboard shell
- Backend: Auth middleware, student profile CRUD

### Sprint 2 — Core Loop (Week 2)
- LLM roadmap generation (Groq + LangChain)
- Assessment engine (question generation, Monaco editor integration, proctoring JS)
- Gap report generation and display

### Sprint 3 — Personalization (Week 3)
- Prep loop (L1/L2/L3 with LLM debrief)
- Resource recommendation (YouTube API + Udemy/Coursera API integration)
- Job Readiness Score live calculation

### Sprint 4 — Social + Gamification (Week 4)
- Community: connections, messaging (Supabase Realtime)
- Weekly challenges + submission + coin system
- Badges + leaderboard

### Sprint 5 — Polish + Launch (Week 5)
- Certificate PDF generation
- Mobile responsiveness
- Performance optimization + loading states
- Demo data seeding for 5 domains

---

## 🧠 AI Prompt Design (Key Prompts)

### Roadmap Generation Prompt
```
You are a senior software engineer and career mentor.

Student Profile:
- Domain: {domain}
- Target Role: {target_role}
- Year: {year}
- Self-rated skills: {skills_json}
- Hours per day: {hours}

Generate a structured roadmap in JSON format with:
- 4-5 phases (foundations to job-ready)
- Each phase has 3-5 topics
- Each topic has: name, description, estimated_hours, prerequisites
- Start from the student's current level (skip what they already know)
- Prioritize topics most critical for {target_role}

Return ONLY valid JSON. No markdown, no explanation.
```

### Question Generation Prompt
```
You are a technical interviewer at a top product company.

Student gaps (scored below 70%): {gaps_json}
Subject: {subject}
Difficulty: {level} (L1=recall, L2=applied, L3=interview-hard)
Question type: {type} (mcq | code | short_answer)

Generate 1 question that:
- Directly tests one of the identified gaps
- Is appropriate for difficulty level {level}
- For code questions: provide a function signature and sample I/O

Return JSON: { question, type, options (if mcq), correct_answer, explanation, topic_tested }
Return ONLY valid JSON.
```

---

## 📊 Key Metrics the Platform Tracks

| Metric | How Used |
|---|---|
| Job Readiness Score | Primary goal indicator, gates certificate |
| Per-topic scores per attempt | Tracks improvement over retakes |
| Streak days | Gamification + engagement |
| Time to complete roadmap phase | Adjusts weekly challenge difficulty |
| Confidence vs correctness delta | Detects gaps in self-awareness |
| Community activity (connections, messages) | Feeds domain group health score |
| Challenge completion rate | Weekly engagement health metric |

---

## 🔐 Security Considerations

- Supabase Row Level Security (RLS) on all tables — users can only read/write their own data
- JWT verification on all backend routes
- Resume PDFs stored in private Supabase Storage bucket (only accessible by owner)
- Proctoring violation logs immutable (insert-only policy)
- Rate limiting on LLM-facing routes (prevent abuse)
- Certificate verification URLs are public read-only (no auth required)

---

## 🌐 Environment Variables

```env
# Supabase
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# LLM
GROQ_API_KEY=

# External APIs
YOUTUBE_API_KEY=
UDEMY_CLIENT_ID=
UDEMY_CLIENT_SECRET=
SERPAPI_KEY=

# App
FRONTEND_URL=
NODE_ENV=
```

---

## 💡 What Makes CareerForge Different

| Feature | Generic platforms | CareerForge |
|---|---|---|
| Personalization | Course catalog | Per-student roadmap from Day 1 |
| Resume requirement | Required | Optional — freshers fully supported |
| Assessments | Static question banks | LLM-generated from your specific gaps |
| Retakes | Limited or paid | Unlimited, fresh questions every time |
| Community | Forums | Domain-matched peer connections + live idea exchange |
| Motivation | Badges | Coins, goodies, streaks, scheduled events |
| End goal | "Course complete" | Verified Job Readiness Score + Certificate |
| Resource suggestions | Curated lists | Mapped to your exact gap, right now |

---

*Built for students who are serious about getting hired — not just finishing courses.*
