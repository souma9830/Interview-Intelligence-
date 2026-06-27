# 🚀 API Documentation & Integration Guide

This document outlines the API endpoints, payload formats, authentication rules, and responses for the AI Interview Platform backend.

## 🔐 Authentication & Security

All requests to protected routes must include a Firebase ID Token in the `Authorization` header:

```http
Authorization: Bearer <firebase_id_token>
```

---

## 🔑 Authentication Endpoints (`/api/auth`)

### 1. Register User / Save Profile
Saves a newly signed up user's profile details.
* **URL:** `/api/auth/register`
* **Method:** `POST`
* **Headers:** `Content-Type: application/json`
* **Body Format:**
  ```json
  {
    "uid": "firebase-uid-here",
    "name": "Jane Doe",
    "email": "jane@example.com",
    "role": "Frontend Developer",
    "experience": "Mid-Level"
  }
  ```
* **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "uid": "firebase-uid-here",
      "email": "jane@example.com"
    }
  }
  ```

---

## 🎙️ Interview Endpoints (`/api/interview`)

### 1. Create Interview Session
Initializes a new interview session for a candidate.
* **URL:** `/api/interview/start`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body Format:**
  ```json
  {
    "role": "Fullstack Engineer",
    "experience": "Senior"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "interviewId": "session-uuid-1234",
    "questions": [
      { "questionText": "Explain the virtual DOM...", "category": "technical" }
    ]
  }
  ```

### 2. Request Follow-up Question
Dynamically generates a follow-up question based on the candidate's last answer.
* **URL:** `/api/interview/follow-up`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body Format:**
  ```json
  {
    "interviewId": "session-uuid-1234",
    "questionIndex": 0,
    "candidateAnswer": "I prefer using React's built-in state management for most things..."
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "followUpQuestion": "How does React context handle updates under heavy load?"
    }
  }
  ```

### 3. Evaluate Individual Answer
Scores and gives detailed feedback on a single question answer.
* **URL:** `/api/interview/evaluate-answer`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body Format:**
  ```json
  {
    "interviewId": "session-uuid-1234",
    "questionIndex": 0,
    "question": "What is the difference between state and props?",
    "candidateAnswer": "Props are passed to components, state is managed inside components.",
    "category": "technical",
    "role": "Frontend Developer"
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "score": 8,
      "feedback": "Correct definition. Add more detail about component re-renders to score a 10."
    }
  }
  ```

---

## 📄 Resume Parser Endpoints (`/api/resume`)

### 1. Upload & Parse Resume
Parses skills and experience directly from a PDF or DOCX file.
* **URL:** `/api/resume/upload`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Form Data:**
  * `resume`: `File (PDF / DOCX)`
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "skills": ["JavaScript", "React", "Node.js", "Express"],
      "experienceYears": 4,
      "summary": "Experienced Frontend engineer focusing on React applications."
    }
  }
  ```

---

## 📊 Report Endpoints (`/api/report`)

### 1. Save Final Report
Submits the final interview responses, coding test results, and violations for comprehensive grading.
* **URL:** `/api/report/save`
* **Method:** `POST`
* **Headers:** `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body Format:**
  ```json
  {
    "role": "Frontend Engineer",
    "questions": ["Question 1", "Question 2"],
    "userAnswers": ["Answer 1", "Answer 2"],
    "questionScores": [80, 90],
    "codingChallenges": [
      {
        "challengeTitle": "Reverse String",
        "codeSubmitted": "function reverse()...",
        "evaluationScore": 100
      }
    ],
    "violationCount": 1
  }
  ```
* **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Report generated and saved",
    "reportId": "report-uuid-5678",
    "data": {
      "overallScore": 87,
      "violationRisk": "Low",
      "hiringRecommendation": "Recommended"
    }
  }
  ```
