# Arivium Backend Integration Handoff

Welcome, Backend Team! The frontend of Arivium has been completely built out in a robust, decoupled **API-First** architecture. This document outlines exactly how the frontend expects to communicate with the backend, the data models we are currently mocking, and the endpoints you need to build.

## Frontend Architecture Overview
The frontend is built with React + Vite + TypeScript.
- **State Management:** Zustand for global state, React Context for local component states.
- **Routing:** React Router v6.
- **API Simulation:** We currently use a mock `api` object (located in `src/pages/FeaturePages.tsx` and specific feature components) that returns `Promise`s wrapped in a `setTimeout`.

## Your Goal
Your objective is to build a RESTful API (or GraphQL) that replaces these mock `Promise`s. You should use the exact JSON schemas defined below so that you don't need to touch or rewrite any of the frontend UI code.

---

## 1. Authentication Service
The frontend expects JWT-based authentication.

### `POST /api/v1/auth/login`
- **Request Body:** `{ email: "...", password: "..." }`
- **Response (200 OK):**
  ```json
  {
    "token": "ey...",
    "user": {
      "id": "123",
      "name": "John Doe",
      "role": "Frontend Developer"
    }
  }
  ```

---

## 2. Onboarding Service
When a user completes the 8-step Smart Onboarding wizard.

### `POST /api/v1/users/onboarding`
- **Request Body:**
  ```json
  {
    "phone": "+1234567890",
    "location": "San Francisco, CA",
    "university": "University of Technology",
    "major": "Computer Science",
    "gradYear": "2026",
    "domain": "Software Engineering",
    "role": "Frontend Developer",
    "skills": {
      "js": 8,
      "react": 7
    },
    "hoursPerWeek": 10
  }
  ```

---

## 3. Dashboard & Core Data Services
The following endpoints map directly to the `mockFetch` calls in `src/pages/FeaturePages.tsx`.

### `GET /api/v1/dashboard/gap-report`
- **Response (200 OK):**
  ```json
  [
    { "id": 1, "topic": "System Design", "score": 34, "status": "Critical" },
    { "id": 2, "topic": "TypeScript Generics", "score": 52, "status": "Warning" },
    { "id": 3, "topic": "React State", "score": 85, "status": "Good" }
  ]
  ```

### `GET /api/v1/preploop/scenarios`
- **Response (200 OK):**
  ```json
  [
    { "id": 1, "title": "AI Mock Interview", "duration": "45 mins" },
    { "id": 2, "title": "Code Debugging Session", "duration": "30 mins" }
  ]
  ```

### `GET /api/v1/community/feed`
- **Response (200 OK):**
  ```json
  [
    { "id": 1, "author": "Alice", "content": "Just landed my first job using Arivium roadmaps!" }
  ]
  ```

### `GET /api/v1/challenges/active`
- **Response (200 OK):**
  ```json
  [
    { "id": 1, "title": "Weekly Algo Challenge", "participants": 120 }
  ]
  ```

---

## 4. Complex Systems (Roadmap & Resume & Chat)

### Roadmap (`/api/v1/roadmap`)
The roadmap timeline requires a structured array of learning nodes:
```json
[
  { 
    "id": 1, 
    "title": "HTML & CSS Foundations", 
    "status": "completed", 
    "duration": "2 weeks", 
    "type": "core" 
  },
  { 
    "id": 3, 
    "title": "React Fundamentals", 
    "status": "active", 
    "duration": "4 weeks", 
    "type": "core",
    "description": "Learn components, state, props, and hooks.",
    "resources": 12, 
    "problems": 25 
  }
]
```

### Community Mutual Chat WebSocket (`ws://api.arivium/chat`)
The Chat interface in the frontend expects real-time updates.
- **Frontend State:** Currently manages `chatHistory` as an array of `{ sender, text, isMine }`.
- **Backend Task:** Implement a WebSocket or Socket.io connection that pushes new message objects to the active connection list.

### ATS Resume Parser/Scorer (`POST /api/v1/resume/parse`)
- **Backend Task:** The frontend now features an "Upload Existing Resume" button. This endpoint should accept `multipart/form-data` (a PDF or DOCX file), run it through an NLP parser to extract structured data (Name, Experience, Education), and return a JSON payload identical to the Resume Form schema above, along with an initial `atsScore`. This data will auto-populate the frontend form.

### ATS Live Scoring (`POST /api/v1/resume/score`)
- **Backend Task:** Accept the raw JSON payload of the active Resume Form as the user types, and return a real-time score between 0-100 to populate the ATS Match Pill.

---
## Connection Instructions
1. Navigate to `src/pages/FeaturePages.tsx` and `src/features/community/CommunityPage.tsx`.
2. Locate the `const mockFetch` and `api` object.
3. Remove the mock `setTimeout` arrays.
4. Replace them with standard `axios.get('/api/v1/...')` calls, or hook them up to `@tanstack/react-query` to automatically populate the exact same JSON schema into the React UI.
---
# CHATGPT PROMPT


# BACKEND MASTER PROMPT — ARIVIUM

Build the complete backend for **Arivium**, an AI-Powered Career Readiness Platform.

The backend must be designed as a scalable SaaS backend with clean architecture, modular services, API versioning, authentication, AI orchestration, and database abstraction.

The frontend team will build independently using API contracts.

Therefore:

* Never expose database schema directly.
* Never return raw SQL objects.
* Every response must use DTOs.
* Every endpoint must be versioned.
* Backend must be frontend-agnostic.

---

# TECH STACK

### Core

```bash
Node.js
Express.js
TypeScript
```

---

### Database

```bash
Supabase PostgreSQL
```

---

### Authentication

```bash
Supabase Auth

Email Password
Google OAuth
```

---

### ORM

Use:

```bash
Prisma ORM
```

Never write raw SQL unless absolutely necessary.

---

### Validation

Use:

```bash
Zod
```

For all request validation.

---

### Caching

Use:

```bash
Redis
```

For:

* Roadmaps
* Assessments
* Leaderboards
* Resource recommendations

---

### AI Layer

Use:

```bash
Groq
Llama 3.3 70B
LangChain
```

---

# CLEAN ARCHITECTURE

Structure:

```bash
backend/

src/

├── api/
│
├── routes/
│
├── controllers/
│
├── services/
│
├── repositories/
│
├── dto/
│
├── middleware/
│
├── validators/
│
├── ai/
│
├── jobs/
│
├── events/
│
├── config/
│
├── utils/
│
├── types/
│
├── constants/
│
└── app.ts
```

---

# DESIGN RULES

## Controller

Only:

```ts
Request
Validation
Response
```

No business logic.

---

## Service

Contains:

```ts
Business logic
AI calls
Scoring
Calculations
```

---

## Repository

Contains:

```ts
Database access only
```

---

# API VERSIONING

Everything starts with:

```bash
/api/v1/
```

Example:

```bash
/api/v1/auth
/api/v1/profile
/api/v1/roadmap
/api/v1/assessment
```

---

# RESPONSE FORMAT

Every endpoint returns:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "meta": {}
}
```

Errors:

```json
{
  "success": false,
  "message": "Validation Error",
  "errors": []
}
```

Frontend depends on this.

Never change.

---

# AUTH MODULE

---

## Endpoints

```bash
POST /auth/register

POST /auth/login

POST /auth/google

POST /auth/logout

POST /auth/refresh

GET /auth/me
```

---

# PROFILE MODULE

Handles onboarding.

---

## Endpoints

```bash
POST /profile/create

GET /profile

PUT /profile

DELETE /profile
```

---

DTO

```ts
StudentProfileDTO
```

Frontend depends on this.

---

# ROADMAP MODULE

Core platform module.

---

## Endpoint

```bash
POST /roadmap/generate

GET /roadmap

GET /roadmap/:id

PATCH /roadmap/topic/:id
```

---

# Roadmap Generation Service

Input:

```ts
StudentProfile
```

Output:

```ts
RoadmapDTO
```

Uses:

```bash
Groq
LangChain
```

Prompt templates stored separately.

Never inside controller.

---

# ASSESSMENT MODULE

Most critical module.

---

## Endpoints

```bash
POST /assessment/generate

POST /assessment/start

POST /assessment/save

POST /assessment/submit

GET /assessment/history
```

---

Question Types

```bash
MCQ
Coding
Short Answer
Scenario
```

---

# QUESTION GENERATION SERVICE

Input

```json
{
  "subject":"DSA",
  "difficulty":"L2",
  "gaps":[]
}
```

Output

```json
{
  "questions":[]
}
```

AI Generated.

Stored in database.

---

# PROCTORING MODULE

Store:

```ts
Tab Switch
Paste Attempt
Focus Lost
Right Click
Window Blur
```

---

Endpoint

```bash
POST /assessment/violation
```

---

# GAP ANALYSIS MODULE

---

Endpoint

```bash
GET /gap-report
```

Output:

```json
{
  "overallScore": 72,
  "criticalGaps": [],
  "subjectBreakdown": {}
}
```

---

# JOB READINESS ENGINE

Create separate service.

```ts
JobReadinessService
```

Calculates:

```bash
Assessment Performance
Roadmap Completion
Challenge Performance
Consistency
```

Output:

```ts
JobReadinessDTO
```

---

# RESOURCE RECOMMENDATION MODULE

---

Endpoints

```bash
GET /resources

GET /resources/topic/:id
```

---

Integrations

```bash
YouTube API
Udemy API
Coursera API
```

---

Resource Ranking Service

Uses AI.

Returns:

```json
{
  "resources":[]
}
```

---

# COMMUNITY MODULE

---

## Connections

```bash
POST /connections/request

POST /connections/accept

POST /connections/reject

GET /connections
```

---

## Discovery

```bash
GET /community/students
```

Filters:

```bash
Domain
College
Year
Skill
Role
```

---

# CHAT MODULE

Use:

```bash
Supabase Realtime
```

---

Endpoints

```bash
POST /chat/send

GET /chat/history
```

---

# CHALLENGE MODULE

---

Endpoints

```bash
GET /challenges

GET /challenges/:id

POST /challenges/submit

GET /leaderboard
```

---

# GAMIFICATION MODULE

---

Handles:

```bash
Coins
XP
Badges
Streaks
```

---

Services

```ts
BadgeService

RewardService

CoinService

StreakService
```

---

# CERTIFICATE MODULE

---

Endpoint

```bash
POST /certificate/generate

GET /certificate/:id

GET /certificate/verify/:token
```

---

Generate:

```bash
PDF
Verification URL
Metadata
```

---

# AI MODULE

Separate completely.

Structure:

```bash
ai/

roadmap/
assessment/
gap-analysis/
resources/
mentor/
```

---

Each contains:

```ts
prompt.ts

service.ts

parser.ts
```

---

# PROMPT STORAGE

Never hardcode prompts.

Use:

```bash
/prompts
```

Example:

```bash
roadmap.prompt.ts

question.prompt.ts

gap.prompt.ts
```

---

# BACKGROUND JOBS

Use:

```bash
BullMQ
Redis
```

Jobs:

```bash
Roadmap generation

Certificate generation

Weekly challenge creation

Leaderboard refresh

Email notifications
```

---

# DATABASE TABLES

Core tables:

```bash
users

profiles

roadmaps

roadmap_topics

assessments

assessment_attempts

violations

gap_reports

resources

connections

messages

groups

challenges

submissions

badges

coins

certificates
```

Use UUID everywhere.

---

# SECURITY

Mandatory:

```bash
JWT verification

Rate limiting

Helmet

CORS

Input validation

SQL Injection protection

XSS protection

RLS in Supabase
```

---

# LOGGING

Use:

```bash
Winston
```

Log:

```bash
Errors
AI calls
Auth events
API usage
```

---

# MONITORING

Use:

```bash
Sentry
```

Track:

```bash
Exceptions
Performance
Failed AI requests
```

---

# API CONTRACT FILE

Create:

```bash
contracts/
```

Contains:

```ts
ProfileContract.ts

RoadmapContract.ts

AssessmentContract.ts

GapReportContract.ts

ChallengeContract.ts

CommunityContract.ts
```

These contracts must match exactly what the frontend team uses.

This becomes the single source of truth.

---

# INTEGRATION RULE

Frontend team should only know:

```ts
ProfileDTO
RoadmapDTO
AssessmentDTO
GapReportDTO
ChallengeDTO
CommunityDTO
```

Frontend should NEVER know:

* Prisma Models
* Database Tables
* Groq Logic
* Supabase Structure

Backend should NEVER know:

* Tailwind Classes
* React Components
* Zustand Store Structure

Communication happens ONLY through DTO contracts.

---

# FINAL DELIVERABLE

Build a production-grade backend capable of supporting:

* 10,000+ students
* AI-generated roadmaps
* Dynamic assessments
* Gap analysis
* Community networking
* Real-time chat
* Weekly challenges
* Job readiness scoring
* Certificate verification

while maintaining strict API contracts so the frontend and backend teams can be developed independently and integrated later with minimal changes.

## Integration Deliverable (Most Important)

Create a shared package:

```bash
shared/

├── dto/
├── enums/
├── contracts/
├── api-routes.ts
└── validation/
```
