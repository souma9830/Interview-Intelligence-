# GitHub Issues & Pull Request Templates

Copy and paste the following Markdown into your GitHub repository to create the requested 20 issues and their corresponding PRs.

---

## 1. Feature: Add Forgot Password Page UI
**Branch Name:** `feat-forgot-password-ui`
**Issue Title:** `Feat: Create Forgot Password & OTP UI in Frontend`
**Issue Body:**
```md
### Description
Currently, there is no "Forgot Password" option on the login screen. We need a frontend page to allow users to request a password reset via OTP.

### Requirements
- [ ] Add "Forgot Password" link on the `Login.jsx` page.
- [ ] Create `ForgotPassword.jsx` to take the user's email.
- [ ] Create `VerifyOTP.jsx` to take the OTP and new password.
- [ ] Integrate with backend API endpoints for OTP request and verification.
```
**PR Body:**
```md
### Description
This PR implements the frontend UI for the Forgot Password flow.

### Changes
- Added a forgot password link to the login screen.
- Created `ForgotPassword` and `VerifyOTP` components.
- Added routing for the new pages.

Closes #1
```

---

## 2. Feature: OTP Database Model
**Branch Name:** `feat-otp-model`
**Issue Title:** `Feat: Create OTP Model in Backend Database`
**Issue Body:**
```md
### Description
To securely handle password resets, we need an OTP model in our database to store the OTP codes against user emails with an expiration time.

### Requirements
- [ ] Create `OTP.js` model using Mongoose.
- [ ] Add fields: `email` (String), `otp` (String), `createdAt` (Date with TTL index of 5 mins).
```
**PR Body:**
```md
### Description
This PR introduces the `OTP` database model for handling secure password resets.

### Changes
- Created `models/OTP.js`.
- Added TTL index to automatically expire OTPs after 5 minutes.

Closes #2
```

---

## 3. Feature: Set up SMTP for OTP
**Branch Name:** `feat-smtp-service`
**Issue Title:** `Feat: Implement SMTP Service for sending OTP Emails`
**Issue Body:**
```md
### Description
We need a way to send the generated OTPs to the user's email address.

### Requirements
- [ ] Integrate `nodemailer` in the backend.
- [ ] Set up SMTP transport configuration using environment variables.
- [ ] Create a utility function `sendEmail(to, subject, text/html)`.
```
**PR Body:**
```md
### Description
This PR configures Nodemailer for sending transactional emails (like OTPs) via SMTP.

### Changes
- Installed `nodemailer`.
- Added `utils/emailService.js` to handle sending emails.
- Added SMTP environment variables.

Closes #3
```

---

## 4. Feature: OTP Verification Logic
**Branch Name:** `feat-otp-backend-logic`
**Issue Title:** `Feat: Implement Backend Logic for OTP Generation and Verification`
**Issue Body:**
```md
### Description
Backend endpoints are required to generate OTPs, save them to the DB, send them via SMTP, and verify them during a password reset.

### Requirements
- [ ] Create `POST /api/auth/forgot-password` to generate and send OTP.
- [ ] Create `POST /api/auth/verify-otp` to validate OTP and update the user's password.
```
**PR Body:**
```md
### Description
This PR implements the full backend logic for password recovery.

### Changes
- Added `/forgot-password` endpoint.
- Added `/verify-otp` endpoint to validate OTP and hash the new password.
- Integrated the OTP model and Email service.

Closes #4
```

---

## 5. Bug: Interview Session Opens Prematurely
**Branch Name:** `bug-interview-session-premature`
**Issue Title:** `Bug: Interview Session opens before Resume Upload is complete`
**Issue Body:**
```md
### Description
Currently, users can access the interview session even if they haven't uploaded their resume. The interview process heavily depends on resume parsing, so this causes issues downstream.

### Requirements
- [ ] Check if `resumeUrl` (or parsed resume data) exists on the user profile before allowing access to the interview session.
- [ ] Redirect to the upload page if no resume is found.
- [ ] Disable the "Start Interview" button if criteria aren't met.
```
**PR Body:**
```md
### Description
This PR prevents users from entering an interview session without uploading a resume first.

### Changes
- Added middleware/frontend checks to verify resume existence.
- Disabled "Start Interview" button state based on profile completion.

Closes #5
```

---

## 6. Feature: Schedule Interview
**Branch Name:** `feat-schedule-interview`
**Issue Title:** `Feat: Add Schedule Interview Functionality`
**Issue Body:**
```md
### Description
Users should be able to schedule an interview for a future date/time instead of only starting it immediately.

### Requirements
- [ ] Add a scheduling UI (Date/Time picker).
- [ ] Save the scheduled time in the database.
- [ ] Only allow the interview session to open when the scheduled time is reached.
```
**PR Body:**
```md
### Description
This PR adds the ability for users to schedule their AI interviews.

### Changes
- Added datetime picker to the dashboard.
- Updated `InterviewSession` model to include `scheduledAt`.
- Added logic to prevent starting the session before the scheduled time.

Closes #6
```

---

## 7. Bug: Video Not Appearing in Interview Session
**Branch Name:** `bug-webrtc-video-stream`
**Issue Title:** `Bug: WebRTC Video Stream not appearing in Interview Session`
**Issue Body:**
```md
### Description
When entering the interview session, the user's webcam video feed is not displaying correctly on the screen.

### Requirements
- [ ] Debug the `navigator.mediaDevices.getUserMedia` implementation.
- [ ] Ensure the video element correctly assigns the `srcObject`.
- [ ] Handle permissions gracefully.
```
**PR Body:**
```md
### Description
This PR fixes the issue where the user's video feed was blank during the interview.

### Changes
- Fixed React `ref` assignment for the video element.
- Added proper cleanup for the media stream on component unmount.
- Handled camera permission denial states.

Closes #7
```

---

## 8. Bug: Gemini Answer Validity
**Branch Name:** `bug-gemini-answer-validation`
**Issue Title:** `Bug: Gemini AI Answer Validation Logic Fails`
**Issue Body:**
```md
### Description
The AI interview relies on Gemini to validate the user's answers against their resume, but the current integration has logic flaws and returns incorrect or malformed scores.

### Requirements
- [ ] Refine the prompt sent to the Gemini API to enforce strict JSON output.
- [ ] Improve error handling if Gemini fails to respond or returns invalid data.
- [ ] Ensure the score is properly parsed and saved to the database.
```
**PR Body:**
```md
### Description
This PR fixes the prompt engineering and parsing logic for the Gemini integration.

### Changes
- Updated the system prompt to force JSON format.
- Added a retry mechanism and fallback validation.
- Fixed the scoring logic to properly extract the mark from the AI response.

Closes #8
```

---

## 9. Feature: Resume Parsing Scoring Integration
**Branch Name:** `feat-resume-scoring`
**Issue Title:** `Feat: Calculate Initial Score based on Resume parsing`
**Issue Body:**
```md
### Description
Before the interview starts, the system should generate a baseline score based on the uploaded resume's alignment with the job role.

### Requirements
- [ ] Send parsed resume data to Gemini to get a baseline score.
- [ ] Store this baseline score in the DB.
```
**PR Body:**
```md
### Description
Adds a pre-interview resume scoring step.

### Changes
- Integrated resume scoring prompt.
- Stored `resumeScore` in the database.

Closes #9
```

---

## 10. Feature: Coding Round Evaluation
**Branch Name:** `feat-coding-round-evaluation`
**Issue Title:** `Feat: Implement Coding Round Evaluation logic`
**Issue Body:**
```md
### Description
The interview process includes a coding round. We need a way to evaluate the submitted code and assign a score.

### Requirements
- [ ] Integrate a code execution engine or use Gemini to evaluate code correctness.
- [ ] Provide feedback and a score for the coding round.
```
**PR Body:**
```md
### Description
Implements the scoring logic for the coding round.

### Changes
- Added Gemini prompt for code evaluation.
- Stored `codingScore` in the interview results.

Closes #10
```

---

*(The remaining issues (11-20) cover smaller sub-tasks and UI/UX improvements related to the main features.)*

## 11. Refactor: Separate Auth Routes
**Branch Name:** `refactor-auth-routes`
**Issue Title:** `Refactor: Clean up Auth Routes for OTP flow`
**Issue Body:** `Separate the OTP routes into their own controller file to maintain single-responsibility principle.`
**PR Body:** `Refactored OTP routes into otpController.js. Closes #11`

## 12. UI: Add Loading States to OTP Verification
**Branch Name:** `ui-otp-loading-states`
**Issue Title:** `UI: Add Loading Spinners during OTP Verification`
**Issue Body:** `Users need visual feedback when the OTP is being verified via the backend.`
**PR Body:** `Added loading states to the VerifyOTP component. Closes #12`

## 13. UI: Improve Interview Session Layout
**Branch Name:** `ui-interview-session-layout`
**Issue Title:** `UI: Responsive layout for Interview Session`
**Issue Body:** `The video and chat elements overlap on smaller screens. Need to fix Flexbox/Grid layout.`
**PR Body:** `Fixed responsive layout in InterviewSession.jsx. Closes #13`

## 14. Feature: Email Templates for OTP
**Branch Name:** `feat-email-templates`
**Issue Title:** `Feat: HTML Email Templates for OTP`
**Issue Body:** `Instead of plain text, the OTP email should use a nicely formatted HTML template.`
**PR Body:** `Added HTML templates for Nodemailer. Closes #14`

## 15. Security: Rate Limit OTP Requests
**Branch Name:** `sec-rate-limit-otp`
**Issue Title:** `Security: Rate limit OTP generation`
**Issue Body:** `Prevent abuse by limiting the number of OTPs a user can request in a given time frame.`
**PR Body:** `Implemented express-rate-limit on the /forgot-password endpoint. Closes #15`

## 16. Bug: Handle Missing Camera Gracefully
**Branch Name:** `bug-missing-camera-handling`
**Issue Title:** `Bug: App crashes if user has no webcam`
**Issue Body:** `If a user starts the interview without a webcam connected, the app throws an unhandled exception.`
**PR Body:** `Added fallback logic and user warning if no camera is detected. Closes #16`

## 17. UI: Countdown Timer for Scheduled Interviews
**Branch Name:** `ui-countdown-timer`
**Issue Title:** `UI: Show countdown to scheduled interview`
**Issue Body:** `If an interview is scheduled, show a countdown timer on the dashboard.`
**PR Body:** `Implemented countdown timer component. Closes #17`

## 18. Feature: Finalize Round Calculation
**Branch Name:** `feat-finalize-round-calc`
**Issue Title:** `Feat: Calculate Final Aggregated Score`
**Issue Body:** `Combine resume score, interview score, and coding score into a final evaluation.`
**PR Body:** `Added aggregation logic in the backend. Closes #18`

## 19. Bug: Session Timeout Handling
**Branch Name:** `bug-session-timeout`
**Issue Title:** `Bug: Handle Interview Session Timeout`
**Issue Body:** `If a user stays idle too long, the session token expires but the UI doesn't react.`
**PR Body:** `Added interceptor to handle 401s and redirect to login. Closes #19`

## 20. Docs: Update README with New Features
**Branch Name:** `docs-update-readme`
**Issue Title:** `Docs: Update README with OTP and Scheduling info`
**Issue Body:** `The documentation needs to be updated to reflect the new environment variables and features.`
**PR Body:** `Updated README.md with SMTP config and new feature docs. Closes #20`
