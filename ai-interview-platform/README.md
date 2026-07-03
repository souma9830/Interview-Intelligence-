# 🤖 CamSense AI — AI Mock Interview & Proctoring Platform

An advanced, open-source mock interview platform that simulates real-world hiring rounds with AI-generated, resume-specific questions, live coding sandboxes, performance analytics, and anti-cheating telemetry.

CamSense AI acts as a stateless, high-fidelity assessment tool designed to help developers practice technical, behavioral, and coding interviews while providing admins with detailed compliance and performance tracking.

---

## 🌟 Key Features

- 📄 **Resume Profile Parsing**: Upload resumes (PDF or DOCX) to extract technical taxonomy, skills, education, and experience using Gemini AI, with a regex-based offline parser fallback.
- 🎙️ **Interactive AI Interviewer**: Live audio-based technical and behavioral questions utilizing Text-to-Speech (TTS) and Speech-to-Text (STT) transcription with dynamic AI-generated follow-up questions.
- 💻 **Algorithm Coding Sandbox**: Full coding workspace integrated with a Monaco Editor, supporting Javascript, Python, Java, and C++. Includes real-time compilation via JDoodle and AI-guided grading.
- 🛡️ **Anti-Cheating Proctoring & Telemetry**: Fullscreen enforcement and tab-switching monitoring. Violations trigger live warnings and apply automatic score penalties.
- 📊 **Detailed Assessment Reports**: Dynamic performance feedback scores, grading breakdown (syntax, scaling, communication, optimization), specific strengths and weaknesses lists, and a download-ready system PDF report.
- 🔄 **Offline Development Mode**: Seamless architectural fallbacks to local skill parsing regexes and local Ollama model routes to enable offline testing without API charges.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18 with Vite 5
- **Styling**: Tailwind CSS 3 & inline styles
- **Interactive Editor**: Monaco Editor (`@monaco-editor/react`)
- **PDF Generation**: jsPDF
- **Icons**: lucide-react
- **State Management**: React hooks (useState, useReducer)

### Backend
- **Framework**: Node.js & Express 4
- **File Uploads**: multer (memory storage)
- **Text Parsers**: pdf-parse, mammoth (DOCX)
- **AI Integrations**: Google Generative AI (Gemini 2.5 Flash), Ollama API (local LLM)
- **Authentication**: Firebase Admin SDK (stateless JWT validation)
- **Caching**: In-memory TTL cache with auto-cleanup
- **Testing**: Jest + Supertest

### Database (Optional)
- **Object Modeling**: Mongoose (MongoDB)
- **Storage Providers**: File-based JSON, In-memory, MongoDB (configurable via STORAGE_PROVIDER)

---

## 📁 Project Structure

```
ai-interview-platform/
├── client/                     # React frontend (Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Common/         # ErrorBoundary, Skeleton
│   │   │   ├── Navbar/         # Navbar, Sidebar
│   │   │   ├── Diagnostics/    # CountdownTimer, HealthIndicator
│   │   │   └── Telemetry/      # VideoRecorder, QuestionInputCard
│   │   ├── hooks/              # Custom React hooks
│   │   ├── pages/              # Route-level page components
│   │   ├── services/           # API client, Firebase auth
│   │   └── utils/              # Style constants, sanitize, auth helpers
│   └── ...
├── server/
│   ├── controllers/            # Route handler logic
│   ├── middleware/              # Auth, rate limiting, error handling
│   ├── models/                 # Mongoose schemas
│   ├── repositories/           # Storage adapters (file, memory, mongo)
│   ├── routes/                 # Express route definitions
│   ├── services/               # Gemini, Ollama, caching
│   ├── utils/                  # Helpers (parsers, sanitizers, telemetry)
│   └── tests/                  # Server-side test suites
├── database/                   # SQL schema definitions
└── scripts/                    # Environment validation scripts
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: Version 18.0 or higher
- **Ollama** *(Optional)*: For local AI question generation
- **Firebase Project**: For email/password or Google sign-in

### Quick Start

```bash
# 1. Clone and install
git clone https://github.com/your-username/ai-interview-platform.git
cd ai-interview-platform
npm install

# 2. Configure environment
cp .env.example .env
cp client/.env.example client/.env

# 3. Start backend (terminal 1)
npm run server

# 4. Start frontend (terminal 2)
npm run client
```

### Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `GEMINI_API_KEY` | No | Google Generative AI key |
| `JDOODLE_CLIENT_ID` | No | JDoodle compilation API ID |
| `JDOODLE_CLIENT_SECRET` | No | JDoodle compilation API secret |
| `OLLAMA_API_URL` | No | Local Ollama endpoint |
| `MONGO_URI` | No | MongoDB connection string |
| `JWT_SECRET` | No | JWT signing secret |
| `ALLOWED_ORIGINS` | No | CORS allowed origins |
| `FIREBASE_PROJECT_ID` | No | Firebase Admin project ID |

See `.env.example` for a complete reference.

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/auth/me` | Get current user profile |
| POST | `/api/auth/logout` | Logout session |
| POST | `/api/auth/forgot-password` | Request password reset OTP |
| POST | `/api/auth/verify-otp` | Verify OTP and reset password |
| POST | `/api/auth/refresh` | Rotate refresh token |

### Interview
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/interview/start` | Start new interview session |
| POST | `/api/interview/answer` | Submit answer |
| POST | `/api/interview/follow-up` | Generate follow-up question |
| POST | `/api/interview/evaluate-answer` | Evaluate spoken answer |
| POST | `/api/interview/coding/eval` | Evaluate code submission |
| POST | `/api/interview/telemetry` | Report proctoring event |
| POST | `/api/interview/analyze-resume` | Upload & analyze resume |

### Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/report` | List user reports |
| POST | `/api/report/synthesize` | Generate AI report |
| GET | `/api/report/:id` | Get specific report |

### Schedules
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/schedules` | List schedules |
| POST | `/api/schedules` | Create schedule |
| GET | `/api/schedules/:id` | Get schedule |

### Other
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Service health check |
| GET | `/api/admin/audit-logs` | Admin audit logs |
| GET | `/api/telemetry/metrics` | System metrics |

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test suite
npx jest server/tests/health.test.js

# Validate environment configuration
npm run validate-env
```

---

## 🔄 Offline & Fallback Modes

The platform gracefully degrades when external services are unavailable:

1. **AI (Gemini) Unavailable**: Falls back to Ollama (local), then to pre-seeded question pools
2. **JDoodle Unavailable**: Falls back to AI-simulated code evaluation
3. **MongoDB Unavailable**: Uses file-based JSON storage automatically
4. **Speech Recognition Unavailable**: Falls back to simulated transcript generation

---

## 🤝 Contributing

Please see [CONTRIBUTING.md](.github/CONTRIBUTING.md) for our contribution guidelines, code of conduct, and a list of identified improvement areas.

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.
