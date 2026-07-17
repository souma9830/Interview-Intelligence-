# Server Architecture Guide

## Overview

This document describes the server-side architecture of the Interview Intelligence platform, a Node.js/Express backend for AI mock interviews with proctoring, reporting, and administration features.

## Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **AI**: Google Gemini (gemini-2.5-flash)
- **Authentication**: Firebase Admin SDK + JWT
- **PDF Generation**: jsPDF
- **Rate Limiting**: express-rate-limit
- **Webhooks**: Stripe

## Directory Structure

```
server/
  server.js                  # Entry point: Firebase init, DB connect, graceful shutdown
  app.js                     # Express app: middleware chain, route mounting, error handlers
  package.json               # Dependencies and scripts

  config/
    databaseConfig.js        # MongoDB connection pooling and retry options
    sandboxConfig.js         # Code sandbox execution limits
    securityConfig.js        # CSP directives, CORS origins, nonce generation

  controllers/
    adminController.js       # Admin analytics and user management
    authController.js        # Login, signup, OTP, Firebase sync
    errorController.js       # Error log querying and aggregation
    healthController.js      # System health check endpoint
    interviewController.js   # Question generation, answer evaluation
    questionController.js    # Custom question set management
    reportController.js      # Performance report synthesis
    resumeController.js      # Resume upload and parsing
    scheduleController.js    # Interview scheduling CRUD

  middleware/
    authMiddleware.js        # Firebase JWT verification
    error/errorHandler.js    # Global error handler with ErrorTracker integration
    logging/requestLogger.js # Structured request logging
    rateLimiter.js           # In-memory rate limiter per IP+window
    sensitiveRateLimiter.js  # Stricter rate limiting for admin/auth routes
    securityHeaders.js       # CSP, HSTS, X-Frame-Options, Permissions-Policy
    securityAudit.js         # Security event audit logging
    sanitizeMiddleware.js    # NoSQL injection prevention
    apiVersion.js            # API version header handling
    cacheMiddleware.js       # Response caching layer
    interviewGuard.js        # Interview session preconditions
    scheduleGuard.js         # Schedule preconditions
    validators/              # express-validator schemas for request validation

  models/
    CodingTestHistory.js     # Coding test results
    Interview.js             # Interview session data
    InterviewFeedback.js     # User feedback
    InterviewReport.js       # Performance reports
    Resume.js                # Resume metadata
    Telemetry.js             # Proctoring telemetry
    User.js                  # User accounts

  routes/
    adminRoutes.js           # /api/v1/admin/*
    codingTestHistoryRoutes.js  # /api/v1/coding-test-history/*
    codingTestRoutes.js      # /api/v1/coding-test/*
    feedbackRoutes.js        # /api/v1/feedback/*
    interviewRoutes.js       # /api/v1/interview/*
    proctoringRoutes.js      # /api/v1/proctoring/*
    protectedRoutes.js       # Auth-protected endpoints
    reportRoutes.js          # /api/v1/report/*
    resumeRoutes.js          # /api/v1/resume/*
    telemetryRoutes.js       # /api/v1/telemetry/*
    userRoutes.js            # /api/v1/user/*

  services/
    firebaseAuthService.js   # Firebase auth helpers
    geminiService.js         # Gemini AI prompt handling
    geminiParser.js          # JSON extraction from Gemini
    emailService.js          # OTP email delivery
    resumeParser.js          # Resume content extraction
    storageService.js        # Local/S3 file storage

  utils/
    apiResponse.js           # sendSuccess/sendError helpers
    authValidation.js        # Input validators
    errorTypes.js            # Custom error classes
    responseHelper.js        # Legacy response re-exports
    codeSanitizer.js         # Code execution sandbox
    logger.js                # Structured logging
    upload.js                # Multer configuration

  tests/
    interview.test.js        # Interview API tests
```

## API Response Format

All responses follow a standardized format:

```javascript
// Success
{
  "success": true,
  "message": "Resource created",
  "data": { ... }
}

// Error
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": { ... }
  }
}
```

## Authentication Flow

1. Client obtains Firebase ID token via Firebase SDK
2. Client sends token in `Authorization: Bearer <token>` header
3. `authMiddleware.js` verifies token with Firebase Admin
4. `req.user` populated with decoded token claims
5. `protect` middleware enforces authentication
6. `adminOnly` middleware restricts to admin users

```javascript
router.get('/endpoint', protect, adminOnly, controller.fn);
```

## AI Integration (Gemini)

The platform uses Gemini for:

1. **Interview Questions**: Generate role-specific questions
2. **Answer Evaluation**: Score responses on accuracy and clarity
3. **Report Synthesis**: Generate comprehensive performance reports

```javascript
const model = genAI.getGenerativeModel({
  model: 'gemini-2.5-flash',
  generationConfig: { responseMimeType: 'application/json' }
});
```

All Gemini responses are parsed through `geminiParser.js` which handles:
- Standard JSON parsing
- Fallback extraction for malformed responses
- Score clamping to 0-10 range

## Rate Limiting

- **General**: 100 requests per 15 minutes per IP
- **Auth endpoints**: 5 requests per minute (OTP, login)
- **Admin endpoints**: 20 requests per minute
- **Telemetry**: 30 requests per minute

## Error Handling

Custom error classes in `errorTypes.js`:

```javascript
class ValidationError extends Error { statusCode = 400; code = 'VALIDATION_ERROR'; }
class NotFoundError extends Error { statusCode = 404; code = 'NOT_FOUND'; }
class AuthenticationError extends Error { statusCode = 401; code = 'AUTHENTICATION_ERROR'; }
class ConflictError extends Error { statusCode = 409; code = 'CONFLICT'; }
```

The global `errorHandler.js` catches all errors and returns standardized responses.

## Database Models

### Interview
```javascript
{
  userId, role, experience, jobDescription, difficulty,
  questions: [{ question, answer, score }],
  overallScore, report, status, createdAt
}
```

### User
```javascript
{
  firebaseUid, email, name, role, resumeId,
  createdAt, lastLogin
}
```

### Resume
```javascript
{
  userId, fileName, filePath, fileType, fileSize,
  extractedText, createdAt
}
```

## Security Features

1. **JWT verification** via Firebase Admin SDK
2. **Input sanitization** against XSS attacks
3. **Rate limiting** on sensitive endpoints
4. **CORS configuration** for cross-origin requests
5. **API key validation** for internal services
6. **Security audit logging** for admin actions
7. **Request logging** for debugging

## Environment Variables

Required environment variables (validated in `env.js`):

```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/interview-intelligence
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=your-private-key
GEMINI_API_KEY=your-gemini-api-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key
API_KEY=your-internal-api-key
```

## Contributing

See CONTRIBUTING.md for code style guidelines and PR requirements.
