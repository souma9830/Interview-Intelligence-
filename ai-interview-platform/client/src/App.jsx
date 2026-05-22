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
import { Loader2 } from 'lucide-react';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('camsense_token') || '');
  const [user, setUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(!!token);
  const [currentTab, setCurrentTab] = useState(token ? 'home' : 'login');
  
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
  });

  // Verify auth session on mount
  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(resJson => {
          if (resJson.success && resJson.data) {
            setUser(resJson.data);
            if (currentTab === 'login' || currentTab === 'signup') {
              setCurrentTab('home');
            }
          } else {
            localStorage.removeItem('camsense_token');
            setToken('');
            setCurrentTab('login');
          }
        })
        .catch(err => {
          console.warn('Network offline fallback, establishing local sandbox session:', err);
          setUser({
            _id: '664e4ea4a93a40498eb79e2a',
            name: 'Demo Candidate',
            email: 'candidate@camsense.ai'
          });
          if (currentTab === 'login' || currentTab === 'signup') {
            setCurrentTab('home');
          }
        })
        .finally(() => {
          setCheckingAuth(false);
        });
    } else {
      setCheckingAuth(false);
      if (currentTab !== 'signup') {
        setCurrentTab('login');
      }
    }
  }, [token]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (err) {
      console.warn('Offline logout triggered');
    } finally {
      localStorage.removeItem('camsense_token');
      setToken('');
      setUser(null);
      setCurrentTab('login');
    }
  };

  const renderContent = () => {
    switch (currentTab) {
      case 'login':
        return <Login setToken={setToken} setUser={setUser} setCurrentTab={setCurrentTab} />;
      case 'signup':
        return <Signup setToken={setToken} setUser={setUser} setCurrentTab={setCurrentTab} />;
      case 'home':
        return <Home setCurrentTab={setCurrentTab} />;
      case 'setup':
        return (
          <InterviewSetup
            setGlobalState={setGlobalState}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'session':
        return (
          <InterviewSession
            globalState={globalState}
            setGlobalState={setGlobalState}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'coding':
        return (
          <CodingTest
            globalState={globalState}
            setGlobalState={setGlobalState}
            setCurrentTab={setCurrentTab}
          />
        );
      case 'result':
        return <Result globalState={globalState} setCurrentTab={setCurrentTab} />;
      default:
        return <Home setCurrentTab={setCurrentTab} />;
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen bg-[#070b13] items-center justify-center space-y-4 flex-col text-slate-100 font-sans">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
        <div className="text-center space-y-1">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-300 font-outfit">
            Synchronizing Secure Identity
          </p>
          <p className="text-xs text-slate-500 font-mono">
            Verifying cryptographic keys with assessment network...
          </p>
        </div>
      </div>
    );
  }

  const isAuthPage = currentTab === 'login' || currentTab === 'signup';

  return (
    <div className="flex min-h-screen bg-[#070b13] text-slate-100 font-sans selection:bg-indigo-500/25 selection:text-white">
      {/* Sidebar navigation rendered only for verified users */}
      {!isAuthPage && (
        <Sidebar 
          currentTab={currentTab} 
          setCurrentTab={setCurrentTab} 
          user={user} 
          onLogout={handleLogout} 
        />
      )}

      {/* Main viewport block */}
      <div className="flex-1 flex flex-col min-w-0">
        {!isAuthPage && <Navbar />}
        
        {/* Scrollable page body */}
        <main className={`flex-1 overflow-y-auto px-8 py-6 relative z-10 ${isAuthPage ? 'flex items-center justify-center' : ''}`}>
          <div className="absolute inset-0 bg-[#070b13]/60 -z-10 pointer-events-none"></div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}