# Architecture

## Overview
Interview Intelligence is a full-stack mock interview and proctoring platform.
It parses a candidate's resume, generates AI-driven interview questions, runs
a live interview session with telemetry, and produces a scored report.

## Tech Stack

**Frontend**
- React (Vite)
- Tailwind CSS + vanilla CSS
- Monaco Editor (coding sandbox)
- Firebase (client-side auth, `client/src/firebase.js`)

**Backend**
- Node.js + Express (`server/app.js`, `server/server.js`)
- MongoDB (Mongoose models)
- Gemini 2.5 Flash (`server/services/geminiService.js`)
- Ollama / llama3, offline fallback (`server/services/ollamaService.js`)
- JDoodle compiler (`server/services/jdoodleCompiler.js`)

## Folder Structure
ai-interview-platform/
├── client/
│ └── src/
│ ├── components/ # Common, Navbar, Telemetry
│ ├── pages/ # Landing, Login, Signup, Dashboard,
│ │ # InterviewSetup, InterviewSession,
│ │ # CodingTest, Result, ScheduleInterview,
│ │ # AdminAuditLogs, ErrorDashboard
│ ├── services/ # auth.js, api/
│ ├── hooks/, utils/, constants/, styles/
│ └── firebase.js # Firebase client init
│
└── server/
├── routes/ # authRoutes, resumeRoutes, interviewRoutes,
│ # scheduleRoutes, reportRoutes, telemetryRoutes,
│ # adminRoutes, errorRoutes, backupRoutes, healthRoutes
├── controllers/ # authController, resumeController,
│ # interviewController, questionController,
│ # reportController, scheduleController, etc.
├── services/ # geminiService, ollamaService, jdoodleCompiler,
│ # errorTracker, logger, notificationService,
│ # queryProfiler, backupRotation
├── models/ # User, Resume, Interview, Report, OTP,
│ # RefreshToken, AuditLog, ErrorLog, QueryMetric,
│ # CustomQuestionSet, PromptCache, Migration
├── middleware/, db/, repositories/, config/, tests/


## Data Flow

1. **Auth**: User signs up/logs in via Firebase (client) and backend
   `authRoutes` / `authController` (OTP verification, refresh tokens).
2. **Resume Upload**: `resumeRoutes` → `resumeController` extracts resume
   text (PDF/DOCX) and passes it to `geminiService` for structured
   parsing, or falls back to a local regex parser if Gemini is
   unavailable.
3. **Interview Setup**: `InterviewSetup.jsx` lets the user configure the
   session; `interviewRoutes` / `interviewController` generate questions
   via `geminiService` (or `ollamaService` in offline mode).
4. **Interview Session**: `InterviewSession.jsx` runs the live session
   (TTS/STT, `Telemetry` components track tab-switching/fullscreen
   violations).
5. **Coding Sandbox**: `CodingTest.jsx` uses Monaco Editor; code runs via
   `jdoodleCompiler.js`, or is evaluated by Gemini heuristics if JDoodle
   keys are absent.
6. **Reporting**: `reportRoutes` / `reportController` compile the score
   breakdown and generate a downloadable PDF report shown on `Result.jsx`.
7. **Admin/Ops**: `AdminAuditLogs.jsx` and `ErrorDashboard.jsx` surface
   data from `AuditLog`/`ErrorLog` models via `adminController` and
   `errorController`.

## Offline Fallback Behavior
- No `GEMINI_API_KEY` → falls back to `ollamaService.js` (local llama3)
  → falls back further to pre-seeded question pools.
- No JDoodle credentials → `jdoodleCompiler.js` fallback simulates
  execution using LLM heuristics.

## Notes
- `server/routes/v2` suggests an API versioning pattern in progress —
  worth flagging for maintainers as it wasn't explored in this pass.
- Database layer uses both `models/` (Mongoose) and `repositories/`,
  suggesting a repository-pattern abstraction over MongoDB.