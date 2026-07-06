import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { sendPasswordReset } from '../services/auth';
import { useToast } from '../hooks/useToast';
import {
  inp, label, card, authPageContainer, authHeader, authSubtext,
  btnPrimary, btnSecondary, iconPosition, inputGroup, inputError,
  divider, dividerLine, dividerText, googleBtn,
  showPasswordBtn, toggleLink, spinnerStyle
} from '../utils/styleConstants';

export default function Login({ setToken, setUser, setCurrentTab }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const { addToast } = useToast();

  const validate = () => {
    const e = {};
    if (!email) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = 'Enter a valid email';
    if (!password) e.password = 'Password is required';
    else if (password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      const token = await fbUser.getIdToken();
      addToast('Signed in successfully!');
      setTimeout(() => {
        localStorage.setItem('camsense_token', token);
        setToken(token);
        setUser({ uid: fbUser.uid, name: fbUser.displayName || email.split('@')[0], email: fbUser.email });
        setCurrentTab('home');
      }, 1200);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        addToast('Invalid email or password', 'err');
      } else {
        addToast('Authentication failed. Check connection.', 'err');
      }
    }
    finally { setTimeout(() => setLoading(false), 1200); }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = userCredential.user;
      const token = await fbUser.getIdToken();
      addToast('Signed in with Google!');
      setTimeout(() => {
        localStorage.setItem('camsense_token', token);
        setToken(token);
        setUser({ uid: fbUser.uid, name: fbUser.displayName, email: fbUser.email });
        setCurrentTab('home');
      }, 1200);
    } catch (err) {
      addToast('Google sign-in was cancelled or failed.', 'err');
    }
  };

  return (
    <div style={authPageContainer}>

      <div style={card}>
        <h2 style={authHeader}>Sign in</h2>
        <p style={authSubtext}>Enter your credentials to access the platform.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={label}>Email address</label>
            <div style={inputGroup}>
              <Mail size={15} color="#555" style={iconPosition} />
              <input type="email" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: '' })); }} style={inp(errors.email)} />
            </div>
            {errors.email && <p style={inputError}>{errors.email}</p>}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label style={label}>Password</label>
              <button type="button" onClick={() => setCurrentTab('forgot-password')} style={toggleLink}>
                Forgot password?
              </button>
            </div>
            <div style={inputGroup}>
              <Lock size={15} color="#555" style={iconPosition} />
              <input type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); setErrors(p => ({ ...p, password: '' })); }} style={{ ...inp(errors.password), paddingRight: '38px' }} />
              <button type="button" onClick={() => setShow(!show)} style={showPasswordBtn}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {errors.password && <p style={inputError}>{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} style={btnPrimary(loading, false)}>
            {loading ? <><Loader2 size={15} style={spinnerStyle} /> Signing in…</> : <>Sign in <ArrowRight size={15} /></>}
          </button>

          <div style={divider}>
            <div style={dividerLine} />
            <span style={dividerText}>OR</span>
            <div style={dividerLine} />
          </div>

          <button type="button" onClick={handleGoogleLogin} style={googleBtn}>
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign in with Google
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#555', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1e1e1e' }}>
          New here?{' '}
          <button onClick={() => setCurrentTab('signup')} style={toggleLink}>
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
