import React, { useState, useEffect } from 'react';
import Sidebar from './components/Navbar/Sidebar';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home';
import InterviewSetup from './pages/InterviewSetup';
import InterviewSession from './pages/InterviewSession';
import CodingTest from './pages/CodingTest';
import Result from './pages/Result';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Landing from './pages/Landing';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('camsense_token') || '');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(!!token);
  const [currentTab, setCurrentTab] = useState(token ? 'home' : 'landing');

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

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(d => {
          if (d.success && d.data) { setUser(d.data); if (currentTab === 'login' || currentTab === 'signup' || currentTab === 'landing') setCurrentTab('home'); }
          else { localStorage.removeItem('camsense_token'); setToken(''); setCurrentTab('landing'); }
        })
        .catch(() => { localStorage.removeItem('camsense_token'); setToken(''); setCurrentTab('landing'); })
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
      if (currentTab !== 'signup' && currentTab !== 'login') setCurrentTab('landing');
    }
  }, [token]);

  const handleLogout = async () => {
    try { await fetch('/api/auth/logout', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }); } catch {}
    localStorage.removeItem('camsense_token');
    setToken(''); setUser(null); setCurrentTab('landing');
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'landing': return <Landing setCurrentTab={setCurrentTab} />;
      case 'login': return <Login setToken={setToken} setUser={setUser} setCurrentTab={setCurrentTab} />;
      case 'signup': return <Signup setToken={setToken} setUser={setUser} setCurrentTab={setCurrentTab} />;
      case 'home': return <Home setCurrentTab={setCurrentTab} />;
      case 'setup': return <InterviewSetup setGlobalState={setGlobalState} setCurrentTab={setCurrentTab} />;
      case 'session': return <InterviewSession globalState={globalState} setGlobalState={setGlobalState} setCurrentTab={setCurrentTab} />;
      case 'coding': return <CodingTest globalState={globalState} setGlobalState={setGlobalState} setCurrentTab={setCurrentTab} />;
      case 'result': return <Result globalState={globalState} setGlobalState={setGlobalState} setCurrentTab={setCurrentTab} />;
      default: return <Home setCurrentTab={setCurrentTab} />;
    }
  };

  if (checkingAuth) {
    return (
      <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', fontFamily: 'Inter, sans-serif' }}>
        <Loader2 size={28} color="#555" style={{ animation: 'spin 1s linear infinite' }} />
        <p style={{ fontSize: '13px', color: '#555' }}>Verifying session…</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isAuthPage = currentTab === 'login' || currentTab === 'signup' || currentTab === 'landing';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', fontFamily: 'Inter, sans-serif', color: '#e0e0e0' }}>
      {!isAuthPage && <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} user={user} globalState={globalState} onLogout={handleLogout} />}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {!isAuthPage && <Navbar />}
        <main style={{ flex: 1, overflowY: 'auto', padding: isAuthPage ? '0' : '28px 32px', display: isAuthPage ? 'flex' : 'block', alignItems: isAuthPage ? 'center' : undefined, justifyContent: isAuthPage ? 'center' : undefined }}>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}