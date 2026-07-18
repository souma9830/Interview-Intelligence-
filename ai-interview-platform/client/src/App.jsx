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

const Dashboard       = lazy(() => import('./pages/Dashboard'));
const InterviewSetup  = lazy(() => import('./pages/InterviewSetup'));
const InterviewSession = lazy(() => import('./pages/InterviewSession'));
const CodingTest      = lazy(() => import('./pages/CodingTest'));
const Result          = lazy(() => import('./pages/Result'));
const ForgotPassword  = lazy(() => import('./pages/ForgotPassword'));
const VerifyOTP       = lazy(() => import('./pages/VerifyOTP'));
const ScheduleInterview = lazy(() => import('./pages/ScheduleInterview'));

function LoadingScreen({ message = 'Loading workspace...' }) {
  return <LoadingOverlay message={message} />;
}

// ------------------------------------------------------------------
// Lightweight guard wrappers — keep them here so they tree-shake
// correctly when route-level code-splitting is in place.
// ------------------------------------------------------------------
function ProtectedRoute({ token, setCurrentTab, children }) {
  useEffect(() => {
    if (!token) setCurrentTab('landing');
  }, [token, setCurrentTab]);
  return token ? children : null;
}

function GuestRoute({ token, setCurrentTab, children }) {
  useEffect(() => {
    if (token) setCurrentTab('home');
  }, [token, setCurrentTab]);
  return !token ? children : null;
}

export default function App() {
  const isOnline   = useOnlineStatus();
  const isMobile   = useMediaQuery('(max-width: 768px)');
  const [token, setToken]             = useState(localStorage.getItem('camsense_token') || '');
  const [user, setUser]               = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(!!token);
  const [currentTab, setCurrentTab]   = useState(token ? 'home' : 'landing');

  const [globalState, setGlobalState] = useState({
    role:           'Frontend Engineer',
    experience:     'Mid-level (2-5 yrs)',
    resumeUploaded: false,
    resumeName:     '',
    jobDescription: '',
    difficulty:     'Medium',
    userAnswers:    [],
    finalCode:      '',
    codeRating:     '',
    completedTime:  '',
    violationCount: 0,
  });

  const isAuthPage = ['login', 'signup', 'landing', 'forgot-password', 'verify-otp'].includes(currentTab);

  const shortcutsDialog = useShortcutsDialog();

  const navigateTo = useCallback((tab) => {
    setCurrentTab(tab);
    shortcutsDialog.close();
  }, [shortcutsDialog]);

  // Shortcut map — each key must appear exactly once.
  const appShortcuts = useMemo(() => ({
    '?':      { label: 'Toggle keyboard shortcuts help', category: 'General',    onPress: shortcutsDialog.toggle },
    'h':      { label: 'Go to Home',                    category: 'Navigation',  onPress: () => navigateTo('home') },
    'd':      { label: 'Go to Dashboard',               category: 'Navigation',  onPress: () => navigateTo('dashboard') },
    's':      { label: 'Go to Interview Setup',         category: 'Navigation',  onPress: () => navigateTo('setup') },
    'k':      { label: 'Go to Schedule',                category: 'Navigation',  onPress: () => navigateTo('schedule') },
    'r':      { label: 'Go to Results',                 category: 'Navigation',  onPress: () => navigateTo('result') },
    'Escape': { label: 'Close dialog or cancel',        category: 'General',     onPress: shortcutsDialog.close },
  }), [shortcutsDialog, navigateTo]);

  // Only register shortcuts when the user is in an authenticated, non-auth page context.
  useKeyboardShortcuts(appShortcuts, !isAuthPage);

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data) {
            setUser(d.data);
            if (['login', 'signup', 'landing'].includes(currentTab)) setCurrentTab('home');
          } else {
            localStorage.removeItem('camsense_token');
            setToken('');
            setCurrentTab('landing');
          }
        })
        .catch(() => {
          localStorage.removeItem('camsense_token');
          setToken('');
          setCurrentTab('landing');
        })
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
      if (!['signup', 'login'].includes(currentTab)) setCurrentTab('landing');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch {}
    localStorage.removeItem('camsense_token');
    setToken(''); setUser(null); setCurrentTab('landing');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'landing':
        return <GuestRoute token={token} setCurrentTab={setCurrentTab}><Landing setCurrentTab={setCurrentTab} /></GuestRoute>;
      case 'login':
        return <GuestRoute token={token} setCurrentTab={setCurrentTab}><Login setToken={setToken} setUser={setUser} setCurrentTab={setCurrentTab} /></GuestRoute>;
      case 'signup':
        return <GuestRoute token={token} setCurrentTab={setCurrentTab}><Signup setToken={setToken} setUser={setUser} setCurrentTab={setCurrentTab} /></GuestRoute>;
      case 'forgot-password':
        return <GuestRoute token={token} setCurrentTab={setCurrentTab}><ForgotPassword setCurrentTab={setCurrentTab} /></GuestRoute>;
      case 'verify-otp':
        return <GuestRoute token={token} setCurrentTab={setCurrentTab}><VerifyOTP setCurrentTab={setCurrentTab} /></GuestRoute>;
      case 'home':
        return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><Home setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      case 'dashboard':
        return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><Dashboard setCurrentTab={setCurrentTab} setGlobalState={setGlobalState} /></ProtectedRoute>;
      case 'schedule':
        return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><ScheduleInterview setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      case 'setup':
        return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><InterviewSetup setGlobalState={setGlobalState} setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      case 'session':
        return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><InterviewSession globalState={globalState} setGlobalState={setGlobalState} setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      case 'coding':
        return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><CodingTest globalState={globalState} setGlobalState={setGlobalState} setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      case 'result':
        return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><Result globalState={globalState} setGlobalState={setGlobalState} setCurrentTab={setCurrentTab} /></ProtectedRoute>;
      default:
        return <ProtectedRoute token={token} setCurrentTab={setCurrentTab}><Home setCurrentTab={setCurrentTab} /></ProtectedRoute>;
    }
  };

  if (checkingAuth) {
    return <LoadingOverlay message="Verifying session..." fullPage />;
  }

  return (
    <ToastProvider>
      <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-app)', fontFamily: 'Inter, sans-serif', color: 'var(--color-text)', transition: 'background 0.3s, color 0.3s' }}>
        <a href="#main-content" className="skip-link" style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: 9999, padding: '8px 16px', background: '#fff', color: '#000', fontSize: '14px', fontWeight: '600', textDecoration: 'none' }}>
          Skip to main content
        </a>
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
    </ToastProvider>
  );
}
