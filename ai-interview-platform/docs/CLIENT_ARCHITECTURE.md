# Interview Intelligence - Client Architecture Guide

## Overview

This document describes the client-side architecture of the Interview Intelligence platform, a React-based AI mock interview and proctoring application.

## Technology Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS + Inline Styles
- **State Management**: React useState/useContext (no Redux)
- **Routing**: Custom tab-based routing (no React Router)
- **Editor**: Monaco Editor (@monaco-editor/react)
- **PDF Generation**: jsPDF
- **Icons**: Lucide React
- **AI Integration**: Firebase Authentication, Gemini AI

## Directory Structure

```
client/src/
  App.jsx                    # Root component with tab routing
  main.jsx                   # Vite entry point
  index.css                  # Global styles and CSS variables
  firebase.js                # Firebase initialization

  components/
    Common/                  # Shared UI components
      EmptyState.jsx         # Empty state placeholder
      ErrorBoundary.jsx      # React error boundary
      ErrorMessage.jsx       # Inline error display
      KeyboardShortcutsDialog.jsx
      LoadingOverlay.jsx     # Full-page loading spinner
      Modal.jsx              # Accessible modal with focus trap
      MonacoEditorWrapper.jsx # Monaco editor with error boundary
      OfflineBanner.jsx      # Network status banner
      Pagination.jsx         # Page navigation
      PerformanceChart.jsx   # Score visualization
      RadialProgress.jsx     # Circular progress indicator
      ReportExportModal.jsx  # PDF report export dialog
      Skeleton.jsx           # Loading skeleton components
      ThemeToggle.jsx        # Dark/light mode toggle (supports icon-only and full variants)
      ThemeToggle.styles.js  # Extracted theme toggle styles
      Toast.jsx              # Toast notification container
      ToastProvider.jsx      # Toast context provider
      index.js               # Barrel exports

    Navbar/                  # Navigation components
      Navbar.jsx             # Top header bar
      Sidebar.jsx            # Collapsible side navigation

    Diagnostics/             # System health components
      CountdownTimer.jsx     # Interview countdown
      HealthIndicator.jsx    # Server health status

    Telemetry/               # Interview recording components
      AdvancedTelemetryDashboard.jsx
      QuestionInputCard.jsx  # Custom question input
      VideoRecorder.jsx      # WebRTC video capture

  hooks/                     # Custom React hooks
    useAbortableEffect.js    # Effect with AbortController
    useFetch.js              # Generic data fetching hook
    useFocusTrap.js          # Modal focus trapping
    useFormValidation.js     # Declarative form validation
    useKeyboardShortcuts.js  # Global keyboard shortcuts
    useMediaDevices.js       # WebRTC device enumeration
    useMediaQuery.js         # Responsive breakpoint detection
    useOnlineStatus.js       # Network status detection
    useProctor.js            # Tab switch/fullscreen violation
    useTheme.js              # Dark/light theme management
    useToast.js              # Toast re-export
    index.js                 # Barrel exports

  pages/                     # Route-level components
    Home.jsx                 # Landing dashboard
    Login.jsx                # Firebase email auth
    Signup.jsx               # Account creation
    Landing.jsx              # Public marketing page
    ForgotPassword.jsx       # Password reset request
    VerifyOTP.jsx            # OTP verification
    InterviewSetup.jsx       # Interview configuration
    InterviewSession.jsx     # AI interview with TTS/STT
    CodingTest.jsx           # Monaco editor sandbox
    Result.jsx               # Performance report
    Dashboard.jsx            # History and analytics
    AdminAuditLogs.jsx       # Admin audit viewer

  services/                  # API client layer
    auth.js                  # Firebase auth helpers
    api/apiClient.js         # Axios client with token interceptor

  utils/                     # Shared utilities
    apiSignals.js            # AbortController factory
    audioConstraints.js      # WebRTC audio/video config
    authHeaders.js           # Bearer token helper
    offlineQueue.js          # Offline violation event queue
    pdfGenerator.js          # PDF report generation (jsPDF)
    pdfThemes.js             # PDF styling themes
    security.js              # Input sanitization
    telemetryConstants.js    # Telemetry event type constants
```

## Component Hierarchy

```
App
  ToastProvider
    Sidebar
      ThemeToggle
    Navbar
      HealthIndicator
    Main Content (tab-based)
      Home | Login | Signup | Landing
      ForgotPassword | VerifyOTP
      Dashboard
      InterviewSetup
      InterviewSession
        VideoRecorder
      CodingTest
        Modal (cheat warning)
      Result
```

## State Management Pattern

The application uses a combination of:

1. **Local Component State** (useState) for UI-specific state
2. **Prop Drilling** for shared state from App to children
3. **React Context** for Toast notifications and Theme
4. **Custom Hooks** for reusable logic (useFetch, useProctor, etc.)

### Global State Shape

```javascript
{
  role: 'Frontend Engineer',
  experience: 'Mid-level (2-5 yrs)',
  resumeUploaded: false,
  resumeName: '',
  jobDescription: '',
  difficulty: 'Medium',
  userAnswers: [],
  finalCode: '',
  codeRating: '',
  completedTime: '',
  violationCount: 0,
  interviewQuestions: [],
  questionScores: [],
  recordedVideoUrl: '',
  telemetryLogs: [],
}
```

## Custom Hooks

### useFetch
Generic data fetching hook with loading, error, and abort support.

```javascript
const { data, loading, error, execute, reset } = useFetch(asyncFn, immediate);
```

### useProctor
Monitors tab switches and fullscreen exits during interviews.

```javascript
useProctor({ interviewId, enabled, cheatWarningVisible, onViolation });
```

### useKeyboardShortcuts
Global keyboard shortcut handler.

```javascript
const shortcuts = useKeyboardShortcuts(extraShortcuts, enabled);
const dialog = useShortcutsDialog();
```

### useTheme
Dark/light theme management with system preference detection.

```javascript
const { theme, toggleTheme } = useTheme();
```

## API Integration

All API calls use the fetch API with Bearer token authentication:

```javascript
const token = localStorage.getItem('camsense_token') || 'demo_token_active';
const res = await fetch('/api/endpoint', {
  headers: { Authorization: `Bearer ${token}` },
});
```

## Accessibility Features

- Skip-to-content link for keyboard navigation
- ARIA labels on all interactive elements
- Focus trapping in modals
- Keyboard shortcuts for navigation
- Screen reader announcements for toast notifications
- Semantic HTML structure

## Performance Considerations

- Lazy loading for heavy pages (Dashboard, Result, CodingTest)
- Code splitting via React.lazy and Suspense
- AbortController for cancelling pending requests
- Skeleton loading states for better UX
- Optimized re-renders with proper dependency arrays

## Theme System

CSS custom properties enable dynamic theming:

```css
:root {
  --bg-app: #0a0a0a;
  --bg-card: #111;
  --color-text: #e0e0e0;
  --color-primary: #ffffff;
  --border-color: #1e1e1e;
}

[data-theme='light'] {
  --bg-app: #f5f5f7;
  --bg-card: #ffffff;
  --color-text: #1d1d1f;
  --color-primary: #000000;
  --border-color: #e5e5ea;
}
```

## Error Handling

1. **ErrorBoundary**: Catches React rendering errors
2. **useFetch**: Handles API errors with loading states
3. **Toast notifications**: User-facing error messages
4. **Fallback states**: Offline mode and degraded functionality

## Testing Strategy

- Unit tests for utility functions
- Component tests for isolated components
- Integration tests for API calls
- E2E tests for critical user flows (planned)

## Contributing

See CONTRIBUTING.md for code style guidelines and PR requirements.
