# Interview Intelligence — API Usage Guide

## Overview

This document provides comprehensive usage examples for every API endpoint in the Interview Intelligence platform. All endpoints return a standardized JSON envelope.

## Response Envelope

Every API response follows this shape:

```json
{
  "success": true,
  "message": "Operation completed successfully.",
  "data": {},
  "timestamp": "2026-07-09T12:00:00.000Z"
}
```

For authenticated endpoints, errors may include a `requestId` for traceability:

```json
{
  "success": false,
  "message": "Descriptive error message.",
  "errors": {},
  "requestId": "req_abc123",
  "timestamp": "2026-07-09T12:00:00.000Z"
}
```

## Authentication

### Register / Login (Firebase)

```
POST /api/auth/register
POST /api/auth/login
```

Uses Firebase Authentication SDK on the client side. The server receives a Firebase ID token.

**Headers:**
```
Authorization: Bearer <firebase-id-token>
```

### Get Current User

```
GET /api/auth/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "uid": "firebase_uid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

### Logout

```
POST /api/auth/logout
Authorization: Bearer <token>
```

### Forgot Password (OTP-based)

```
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (success):**
```json
{ "success": true, "message": "OTP sent to your email." }
```

### Verify OTP & Reset Password

```
POST /api/auth/verify-otp
Content-Type: application/json

{
  "email": "user@example.com",
  "otp": "123456",
  "newPassword": "NewSecurePass123"
}
```

## Resume Management

### Upload Resume

```
POST /api/resume/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Form Data:
  resume: [PDF or DOCX file]
```

**Response:**
```json
{
  "success": true,
  "data": {
    "skills": ["JavaScript", "React", "Node.js"],
    "education": ["B.Sc. Computer Science"],
    "projects": ["E-commerce Platform"],
    "experience": ["Frontend Developer @ Company"],
    "summary": "Experienced full-stack developer...",
    "extractedText": "Full parsed resume text...",
    "fileName": "resume.pdf"
  }
}
```

### Get My Resume

```
GET /api/resume/me
Authorization: Bearer <token>
```

### Analyze Job Description

```
POST /api/resume/analyze-jd
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobDescription": "We are looking for a React developer...",
  "resumeContent": "Experienced with React, TypeScript, Node.js..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "matchPercentage": 85,
    "matchingSkills": ["React", "JavaScript"],
    "missingSkills": ["GraphQL"],
    "recommendation": "Excellent match. Outstanding fits found."
  }
}
```

## Interview Session

### Start Interview

```
POST /api/interview/start
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "Frontend Engineer",
  "experience": "Mid-level (2-5 yrs)",
  "jobDescription": "Standard Developer profile",
  "difficulty": "Medium",
  "resumeSkills": ["React", "TypeScript"],
  "resumeEducation": [],
  "resumeProjects": [],
  "resumeExperience": [],
  "resumeSummary": "",
  "resumeText": ""
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "interview_id",
    "questions": [
      { "questionText": "Explain React virtual DOM...", "category": "technical" }
    ],
    "role": "Frontend Engineer",
    "difficulty": "Medium"
  }
}
```

### Evaluate Answer

```
POST /api/interview/evaluate-answer
Authorization: Bearer <token>
Content-Type: application/json

{
  "interviewId": "interview_id",
  "questionIndex": 0,
  "candidateAnswer": "The virtual DOM is a lightweight representation...",
  "question": "Explain React virtual DOM...",
  "category": "technical",
  "role": "Frontend Engineer"
}
```

### Follow-up Question

```
POST /api/interview/follow-up
Authorization: Bearer <token>
Content-Type: application/json

{
  "interviewId": "interview_id",
  "questionIndex": 0,
  "candidateAnswer": "...",
  "originalQuestionText": "...",
  "category": "technical",
  "role": "Frontend Engineer",
  "experience": "Mid-level (2-5 yrs)"
}
```

### Report Telemetry Event

```
POST /api/interview/telemetry
Content-Type: application/json

{
  "interviewId": "interview_id",
  "eventType": "TabSwitch",
  "description": "User switched to another tab",
  "timestamp": "2026-07-09T12:00:00.000Z"
}
```

### Coding Sandbox Evaluation

```
POST /api/interview/coding/eval
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "Frontend Engineer",
  "code": "class EventEmitter { ... }",
  "language": "javascript",
  "voiceExplanation": "I implemented a class using...",
  "questionText": "Implement a custom EventEmitter..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 88,
    "containsSyntaxIssues": false,
    "metrics": {
      "syntaxScore": 95,
      "optimizationScore": 90,
      "explanationScore": 80,
      "executionTime": "12ms",
      "memoryConsumed": "16MB"
    },
    "testCases": [
      { "name": "Initial Execution Compilation", "passed": true, "duration": "6ms" },
      { "name": "Boundary Values Assertion Matrix", "passed": true, "duration": "14ms" }
    ],
    "recommendation": "Outstanding modular framework structure."
  }
}
```

### Synthesize Report

```
POST /api/report/synthesize
Authorization: Bearer <token>
Content-Type: application/json

{
  "interviewId": "interview_id",
  "role": "Frontend Engineer",
  "experience": "Mid-level (2-5 yrs)",
  "questions": [...],
  "answers": [...]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "overallScore": 85,
    "resumeScore": 88,
    "interviewScore": 82,
    "codingScore": 88,
    "breakdown": {
      "syntaxAccuracy": 90,
      "systemScalability": 80,
      "verbalCommunication": 88,
      "complexityOptimization": 85
    },
    "strengths": ["Exceptional logical breakdown..."],
    "weaknesses": ["Could elaborate further on..."],
    "feedbackReport": "### AI INTERVIEW FEEDBACK REPORT..."
  }
}
```

## Reports & Dashboard

### List Reports

```
GET /api/report
Authorization: Bearer <token>
```

### List Schedules

```
GET /api/schedules
Authorization: Bearer <token>
```

### Create Schedule

```
POST /api/schedules
Authorization: Bearer <token>
Content-Type: application/json

{
  "role": "Frontend Engineer",
  "scheduledAt": "2026-07-10T14:00:00.000Z",
  "durationMinutes": 45,
  "notes": "Preparation for Google interview"
}
```

## Admin Endpoints

### View Audit Logs

```
GET /api/admin/audit-logs
Authorization: Bearer <token>
```

Requires admin privileges.

### Error Monitoring Dashboard

```
GET /api/admin/errors
Authorization: Bearer <token>
```

Returns aggregated error logs with pagination.

### Query Performance Metrics

```
GET /api/admin/queries
Authorization: Bearer <token>
```

Returns slow query profiling data from the query profiler.

### System Health

```
GET /api/health
```

Public endpoint returning server status, uptime, memory usage, and MongoDB connection state.

### Telemetry Dashboard

```
GET /api/telemetry
```

Returns aggregated telemetry events (tab switches, focus loss, violations) per interview session.

### API Versioning

All endpoints are available under versioned prefixes:

| Prefix | Status |
|--------|--------|
| `/api/auth` | Current (aliased to v1) |
| `/api/v1/auth` | Stable |
| `/api/v2/auth` | Preview (limited routes) |

Use `Accept-Version` header or explicit `/api/v1/` prefix for stable contracts.

## Error Codes

| HTTP Status | Meaning |
|-------------|---------|
| 200 | Success |
| 400 | Bad request / validation error |
| 401 | Unauthorized / missing token |
| 403 | Forbidden / insufficient permissions |
| 404 | Resource not found |
| 429 | Rate limit exceeded |
| 500 | Internal server error |

## Rate Limiting

- Standard endpoints: 100 requests per minute per IP
- Sensitive endpoints (admin, auth): 20 requests per minute per IP
- Exceeded limit returns HTTP 429 with `Retry-After` header

## Offline / Fallback Behavior

All endpoints have client-side fallbacks when the server is unreachable:

1. **Interview questions**: Uses pre-seeded question pool shuffled randomly
2. **AI evaluation**: Returns synthesized scores based on code patterns
3. **Report synthesis**: Generates local report with placeholder metrics
4. **Resume upload**: Stores metadata locally and queues for sync