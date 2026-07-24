import React, { useState, useMemo } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { sendPasswordReset } from '../services/auth';
import { useToast } from '../components/Common/ToastProvider';
import { useFormValidation, validators, createField } from '../hooks/useFormValidation';
import { announceToScreenReader, getAriaInvalid, getErrorId } from '../utils/accessibility';

// Consumer of password strength indicators in related authentication pages
const card = {
  background: "#111",
  border: "1px solid #1e1e1e",
  borderRadius: "12px",
  padding: "32px",
  transition: "all 0.35s ease",
  boxShadow: "0 0 20px rgba(255,255,255,0.04)",
};

const inp = (err) => ({
  width: '100%',
  background: '#0d0d0d',
  border: `1px solid ${err ? '#ef4444' : '#2a2a2a'}`,
  borderRadius: '8px',
  padding: '10px 12px 10px 38px',
  fontSize: '14px',
  color: '#e0e0e0',
  outline: 'none',
  fontFamily: 'Inter, sans-serif',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
});

const inputGroup = {
  position: 'relative',
};

const iconPosition = {
  position: 'absolute',
  left: '11px',
  top: '11px',
};

const label = {
  fontSize: '12px',
  fontWeight: '500',
  color: '#888',
  display: 'block',
  marginBottom: '6px',
};

const btnPrimary = (loading, disabled) => ({
  width: '100%',
  padding: '11px',
  background: loading || disabled ? '#1a1a1a' : '#fff',
  color: loading || disabled ? '#555' : '#000',
  border: 'none',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '600',
  cursor: loading || disabled ? 'not-allowed' : 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.15s',
});

const divider = {
  display: 'flex',
  alignItems: 'center',
  margin: '4px 0',
};

const dividerLine = {
  flex: 1,
  height: '1px',
  background: '#222',
};

const dividerText = {
  margin: '0 12px',
  fontSize: '12px',
  color: '#666',
  fontWeight: '500',
};

const authPageContainer = {
  width: '100%',
  maxWidth: '400px',
  padding: '0 16px',
  fontFamily: 'Inter, sans-serif',
};

const authHeader = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#fff',
  margin: '0 0 4px',
};

const authSubtext = {
  fontSize: '13px',
  color: '#666',
  margin: '0 0 24px',
};

const googleBtn = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '100%',
  padding: '11px',
  background: 'transparent',
  color: '#fff',
  border: '1px solid #333',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'all 0.15s',
};

const showPasswordBtn = {
  position: 'absolute',
  right: '10px',
  top: '9px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#555',
  padding: '2px',
};

const inputError = {
  fontSize: '12px',
  color: '#ef4444',
  margin: '4px 0 0',
};

const toggleLink = {
  background: 'none',
  border: 'none',
  color: '#aaa',
  fontWeight: '500',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '13px',
};

const spinnerStyle = {
  animation: 'spin 1s linear infinite',
};

const toastContainer = (type) => ({
  position: 'fixed',
  top: '20px',
  right: '20px',
  padding: '12px 20px',
  borderRadius: '8px',
  background: type === 'err' ? '#ef4444' : '#22c55e',
  color: '#fff',
  fontSize: '14px',
  zIndex: 1000,
});

export default function Login({ setToken, setUser, setCurrentTab }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fields = useMemo(() => [
    createField('email', email, [validators.required, validators.email], 'Email'),
    createField('password', password, [validators.password]),
  ], [email, password]);

  const { errors, validate, clearError } = useFormValidation(fields);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      const token = await fbUser.getIdToken();
      try {
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: fbUser.uid, email: fbUser.email, name: fbUser.displayName })
        });
      } catch {}

      try {
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: fbUser.displayName || email.split('@')[0], email: fbUser.email, firebaseUid: fbUser.uid })
        });
      } catch (syncErr) {
        console.warn('[Login] MongoDB sync deferred:', syncErr.message);
      }

      toast.show('Signed in successfully!', 'success');
      setTimeout(() => {
        localStorage.setItem('camsense_token', token);
        setToken(token);
        setUser({ uid: fbUser.uid, name: fbUser.displayName || email.split('@')[0], email: fbUser.email });
        setCurrentTab('home');
      }, 1200);
    } catch (err) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        toast.show('Invalid email or password', 'error');
      } else {
        toast.show('Authentication failed. Check connection.', 'error');
      }
    }
    finally { setTimeout(() => setLoading(false), 1200); }
  };

  const handleGoogleLogin = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = userCredential.user;
      const token = await fbUser.getIdToken();
      try {
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ uid: fbUser.uid, email: fbUser.email, name: fbUser.displayName })
        });
      } catch {}

      try {
        await fetch('/api/auth/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ name: fbUser.displayName, email: fbUser.email, firebaseUid: fbUser.uid })
        });
      } catch (syncErr) {
        console.warn('[Login] MongoDB sync deferred:', syncErr.message);
      }

      toast.show('Signed in with Google!', 'success');
      setTimeout(() => {
        localStorage.setItem('camsense_token', token);
        setToken(token);
        setUser({ uid: fbUser.uid, name: fbUser.displayName, email: fbUser.email });
        setCurrentTab('home');
      }, 1200);
    } catch (err) {
      toast.show('Google sign-in was cancelled or failed.', 'error');
    }
  };

  return (
    <div style={authPageContainer}>
      <div
  style={card}
  onMouseOver={(e) => {
    e.currentTarget.style.transform = "translateY(-6px)";
    e.currentTarget.style.borderColor = "#3d3d3d";
    e.currentTarget.style.boxShadow =
      "0 0 30px rgba(255,255,255,0.10), 0 20px 45px rgba(0,0,0,0.45)";
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.transform = "translateY(0)";
    e.currentTarget.style.borderColor = "#1e1e1e";
    e.currentTarget.style.boxShadow =
      "0 0 20px rgba(255,255,255,0.04)";
  }}
>
        <h2 style={authHeader}>Sign in</h2>
        <p style={authSubtext}>Enter your credentials to access the platform.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor="login-email" style={label}>Email address</label>
            <div style={inputGroup}>
              <Mail size={15} color="#555" style={iconPosition} aria-hidden="true" />
              <input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); clearError('email'); }} style={inp(errors.email)} aria-invalid={getAriaInvalid(errors.email)} aria-describedby={errors.email ? getErrorId('email') : undefined} />
            </div>
            {errors.email && <p id={getErrorId('email')} style={inputError} role="alert">{errors.email}</p>}
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="login-password" style={label}>Password</label>
              <button
                id="forgot-password-link"
                type="button"
                aria-label="Forgot password? Reset via OTP"
                onClick={() => setCurrentTab('forgot-password')}
                style={toggleLink}
              >
                Forgot password?
              </button>
            </div>
            <div style={inputGroup}>
              <Lock size={15} color="#555" style={iconPosition} aria-hidden="true" />
              <input id="login-password" type={show ? 'text' : 'password'} placeholder="••••••••" value={password} onChange={e => { setPassword(e.target.value); clearError('password'); }} style={{ ...inp(errors.password), paddingRight: '38px' }} aria-invalid={getAriaInvalid(errors.password)} aria-describedby={errors.password ? getErrorId('password') : undefined} />
              <button type="button" onClick={() => setShow(!show)} style={showPasswordBtn} aria-label={show ? 'Hide password' : 'Show password'}>
                {show ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
              </button>
            </div>
            {errors.password && <p id={getErrorId('password')} style={inputError} role="alert">{errors.password}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={btnPrimary(loading, false)}>
            {loading ? <><Loader2 size={15} style={spinnerStyle} /> Signing in…</> : <>Sign in <ArrowRight size={15} /></>}
          </button>

          <div style={divider}>
            <div style={dividerLine} />
            <span style={dividerText}>OR</span>
            <div style={dividerLine} />
          </div>

          <button type="button" onClick={handleGoogleLogin} className="btn-google" style={googleBtn}>
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
