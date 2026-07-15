import React, { Suspense, lazy, useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Navbar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import { ToastProvider } from './components/Common/ToastProvider';
import { LoadingOverlay } from './components/Common/LoadingOverlay';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useMediaQuery } from './hooks/useMediaQuery';
import { useKeyboardShortcuts, useShortcutsDialog } from './hooks/useKeyboardShortcuts';
import { useTabValidation } from './hooks/useTabValidation';
import { TABS, AUTH_TABS, PROTECTED_TABS } from './constants/tabs';
import PwaInstallPrompt from './components/Common/PwaInstallPrompt';
import OfflineBanner from './components/Common/OfflineBanner';

// Hook listeners for accessibility options and keyboard navigation shortcuts
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ErrorDashboard = lazy(() => import('./pages/ErrorDashboard'));
const InterviewSetup = lazy(() => import('./pages/InterviewSetup'));
const InterviewSession = lazy(() => import('./pages/InterviewSession'));
const CodingTest = lazy(() => import('./pages/CodingTest'));
const Result = lazy(() => import('./pages/Result'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const VerifyOTP = lazy(() => import('./pages/VerifyOTP'));
const ScheduleInterview = lazy(() => import('./pages/ScheduleInterview'));

function LoadingScreen({ message = 'Loading workspace...' }) {
  return <LoadingOverlay message={message} />;
}

export default function App() {
  const isOnline = useOnlineStatus();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [token, setToken] = useState(localStorage.getItem('camsense_token') || '');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(!!token);
  const [currentTab, setCurrentTab] = useState(token ? TABS.HOME : TABS.LANDING);

  const [globalState, setGlobalState] = useState({
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
  });

  const isAuthPage = AUTH_TABS.has(currentTab);
  const { validateTab } = useTabValidation(currentTab, !!token);

  const shortcutsDialog = useShortcutsDialog();

  const navigateTo = useCallback((tab) => {
    const safeTab = validateTab(tab);
    setCurrentTab(safeTab);
    if (!isAuthPage && safeTab !== currentTab) {
      shortcutsDialog.close();
    }
  }, [currentTab, isAuthPage, shortcutsDialog, validateTab]);

  const appShortcuts = useMemo(() => ({
    '?': { label: 'Toggle keyboard shortcuts help', category: 'General', onPress: shortcutsDialog.toggle },
    'h': { label: 'Go to Home', category: 'Navigation', onPress: () => navigateTo(TABS.HOME) },
    'd': { label: 'Go to Dashboard', category: 'Navigation', onPress: () => navigateTo(TABS.DASHBOARD) },
    's': { label: 'Go to Interview Setup', category: 'Navigation', onPress: () => navigateTo(TABS.SETUP) },
    'k': { label: 'Go to Schedule', category: 'Navigation', onPress: () => navigateTo(TABS.SCHEDULE) },
    'r': { label: 'Go to Results', category: 'Navigation', onPress: () => navigateTo(TABS.RESULT) },
    'Escape': { label: 'Close dialog or cancel', category: 'General', onPress: shortcutsDialog.close },
  }), [shortcutsDialog, navigateTo]);

  const registeredShortcuts = useKeyboardShortcuts(appShortcuts, !isAuthPage);

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data) { setUser(d.data); if (AUTH_TABS.has(currentTab)) setCurrentTab(TABS.HOME); }
          else { localStorage.removeItem('camsense_token'); setToken(''); setCurrentTab(TABS.LANDING); }
        })
        .catch(() => { localStorage.removeItem('camsense_token'); setToken(''); setCurrentTab(TABS.LANDING); })
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
      if (currentTab !== TABS.SIGNUP && currentTab !== TABS.LOGIN) setCurrentTab(TABS.LANDING);
    }
  }, [token]);

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch {}
    localStorage.removeItem('camsense_token');
    setToken(''); setUser(null); setCurrentTab(TABS.LANDING);
  };

  const renderContent = () => {
    switch (currentTab) {
      case TABS.LANDING: return <GuestRoute token={token} setCurrentTab={setCurrentTab}><Landing setCurrentTab={setCurrentTab} /></GuestRoute>;
      case TABS.LOGIN: return <GuestRoute token={token} setCurrentTab={setCurrentTab}><Login setToken={setToken} setUser={setUser} setCurrentTab={setCurrentTab} /></GuestRoute>;
      case TABS.SIGNUP: return <GuestRoute token={token} setCurrentTab={setCurrentTab}><Signup setToken={setToken} setUser={setUser} setCurrentTab={setCurrentTab} /></GuestRoute>;
      case TABS.FORGOT_PASSWORD: return <GuestRoute token={token} setCurrentTab={setCurrentTab}><ForgotPassword setCurrentTab={setCurrentTab} /></GuestRoute>;
      case TABS.VERIFY_OTP: return <GuestRoute token={token} setCurrentTab={setCurrentTab}><VerifyOTP setCurrentTab={setCurrentTab} /></GuestRoute>;
      case TABS.HOME: return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><Home setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      case TABS.DASHBOARD: return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><Dashboard setCurrentTab={setCurrentTab} setGlobalState={setGlobalState} /></ProtectedRoute>;
      case TABS.SCHEDULE: return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><ScheduleInterview setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      case TABS.SETUP: return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><InterviewSetup setGlobalState={setGlobalState} setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      case TABS.SESSION: return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><InterviewSession globalState={globalState} setGlobalState={setGlobalState} setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      case TABS.CODING: return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><CodingTest globalState={globalState} setGlobalState={setGlobalState} setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      case TABS.RESULT: return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><Result globalState={globalState} setGlobalState={setGlobalState} setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      case TABS.ERRORS: return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><ErrorDashboard setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      default: return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><Home setCurrentTab={setCurrentTab} /></ProtectedRoute>;
    }
  };

  if (checkingAuth) {
    return <LoadingOverlay message="Verifying session..." fullPage />;
  }

  return (
    <ToastProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)', fontFamily: 'Inter, sans-serif', color: 'var(--color-text)', transition: 'background 0.3s, color 0.3s' }}>
        <a href="#main-content" className="skip-link" style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: 9999, padding: '8px 16px', background: '#fff', color: '#000', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }} onFocus={(e) => { e.target.style.left = '16px'; e.target.style.top = '16px'; }} onBlur={(e) => { e.target.style.left = '-9999px'; e.target.style.top = '0'; }}>
          Skip to main content
        </a>
        <div id="sr-announcements" role="status" aria-live="polite" style={{ position: 'absolute', width: '1px', height: '1px', padding: '0', margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: '0' }} />
        {!isAuthPage && <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} user={user} globalState={globalState} onLogout={handleLogout} />}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {!isAuthPage && <Navbar />}
          <main id="main-content" role="main" aria-label="Main content" style={{ flex: 1, overflowY: 'auto', padding: isAuthPage ? '0' : '28px 32px', display: isAuthPage ? 'flex' : 'block', alignItems: isAuthPage ? 'center' : undefined, justifyContent: isAuthPage ? 'center' : undefined }}>
            <Suspense fallback={<LoadingScreen message="Loading assessment workspace..." />}>
              {renderContent()}
            </Suspense>
          </main>
        </div>
      </div>
      <PwaInstallPrompt />
      <OfflineBanner />
    </ToastProvider>
  );
}

// TODO: Issue 244 Attempt comparison
