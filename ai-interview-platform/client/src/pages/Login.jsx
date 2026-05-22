import React, { useState } from 'react';
import { Mail, Lock, ShieldCheck, ArrowRight, Eye, EyeOff, Loader2, Sparkles } from 'lucide-react';

export default function Login({ setToken, setUser, setCurrentTab }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Validation and alerts state
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState(null);

  const triggerToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = 'Email address is required';
    } else if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      errs.email = 'Please specify a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters long';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      triggerToast('Please correct validation errors', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.success) {
        triggerToast('Authentication verified! Redirecting...', 'success');
        
        // Simulating highly styled terminal loading sequences
        setTimeout(() => {
          localStorage.setItem('camsense_token', data.data.token);
          setToken(data.data.token);
          setUser(data.data);
          setCurrentTab('home');
        }, 1500);
      } else {
        triggerToast(data.message || 'Invalid email or password credentials', 'error');
      }
    } catch (err) {
      console.error('Authentication fetch failure:', err);
      triggerToast('Connection to server failed. Operating in sandbox mode.', 'error');
      // Dynamic offline developer fallback
      setTimeout(() => {
        const mockUser = {
          _id: '664e4ea4a93a40498eb79e2a',
          name: 'Demo Candidate',
          email: email,
          token: 'demo_token_active'
        };
        localStorage.setItem('camsense_token', 'demo_token_active');
        setToken('demo_token_active');
        setUser(mockUser);
        setCurrentTab('home');
      }, 1500);
    } finally {
      setTimeout(() => setLoading(false), 1500);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 relative">
      
      {/* Toast Notification Container */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center space-x-2.5 px-4 py-3 rounded-xl border shadow-xl transition-all duration-300 transform translate-y-0 animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-300' 
            : 'bg-rose-950/90 border-rose-500/50 text-rose-300'
        }`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`}></div>
          <span className="text-[12.5px] font-bold font-sans">{toast.msg}</span>
        </div>
      )}

      {/* Glow Effects */}
      <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-600 to-cyan-500 rounded-3xl blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>

      <div className="relative glass-panel p-8 rounded-3xl border-indigo-950/40 space-y-6">
        
        {/* Banner header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-indigo-950/60 border border-indigo-900/40 mb-2">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
          </div>
          <h2 className="text-2xl font-extrabold font-outfit text-white tracking-tight flex items-center justify-center space-x-1.5">
            <span>Access Assessment Center</span>
          </h2>
          <p className="text-xs text-slate-400">
            Sign in to start your camera-monitored AI interview challenge.
          </p>
        </div>

        {/* Input form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email input field */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type="email"
                placeholder="candidate@camsense.ai"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                }}
                className={`w-full bg-slate-950/80 border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all duration-300 ${
                  errors.email 
                    ? 'border-rose-500/50 focus:border-rose-500 text-rose-200' 
                    : 'border-indigo-950/80 focus:border-indigo-500 text-white'
                }`}
              />
            </div>
            {errors.email && <span className="text-[10px] text-rose-400 font-mono font-semibold">{errors.email}</span>}
          </div>

          {/* Password field */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono">Secret Access Key</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                className={`w-full bg-slate-950/80 border rounded-xl pl-10 pr-11 py-3 text-sm focus:outline-none transition-all duration-300 ${
                  errors.password 
                    ? 'border-rose-500/50 focus:border-rose-500 text-rose-200' 
                    : 'border-indigo-950/80 focus:border-indigo-500 text-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 p-0.5 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <span className="text-[10px] text-rose-400 font-mono font-semibold">{errors.password}</span>}
          </div>

          {/* Submit btn */}
          <button
            type="submit"
            disabled={loading}
            className="w-full group py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-950/60 disabled:text-indigo-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center space-x-2 mt-6 shadow shadow-indigo-600/10 hover:shadow-indigo-500/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Decrypting Session Tokens...</span>
              </>
            ) : (
              <>
                <span>Authenticate Credentials</span>
                <ArrowRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        {/* Footer selector switch */}
        <div className="pt-4 border-t border-indigo-950/30 text-center">
          <p className="text-xs text-slate-400">
            First time in Camsense Chamber?{' '}
            <button
              onClick={() => setCurrentTab('signup')}
              className="text-indigo-400 hover:text-indigo-300 font-bold hover:underline transition-all"
            >
              Sign Up Access
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}
