import React, { useState, useMemo, useCallback } from 'react';
import { User, Mail, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useToast } from '../components/Common/ToastProvider';
import { useFormValidation, validators, createField } from '../hooks/useFormValidation';
import PasswordStrengthMeter from '../components/Common/PasswordStrengthMeter';
import { getAriaInvalid, getErrorId } from '../utils/accessibility';

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

/**
 * Syncs the newly created Firebase user to the backend MongoDB database.
 * Only one request is made — authenticated with the Firebase ID token so
 * the server can verify the caller's identity via the Authorization header.
 *
 * The un-authenticated version that was called previously (without a token)
 * was redundant and a security concern: it allowed anyone who knew the
 * endpoint URL to inject arbitrary user records.
 *
 * @param {string} token - Firebase ID token
 * @param {{ name: string, email: string, firebaseUid: string }} payload
 */
async function syncUserToBackend(token, payload) {
  const res = await fetch('/api/auth/sync-user', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new Error(json.message || `Sync failed (${res.status})`);
  }
  return res.json();
}

export default function Signup({ setToken, setUser, setCurrentTab }) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow]       = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const fields = useMemo(() => [
    createField('name', name, [validators.name], 'Full name'),
    createField('email', email, [validators.required, validators.email], 'Email'),
    createField('password', password, [validators.password]),
  ], [name, email, password]);

  const { errors, validate, clearError } = useFormValidation(fields);

  /** Handles post-auth state transition after a successful signup. */
  const handleAuthSuccess = useCallback((token, fbUser, displayName) => {
    toast.show('Account created!', 'success');
    setTimeout(() => {
      localStorage.setItem('camsense_token', token);
      setToken(token);
      setUser({
        uid:   fbUser.uid,
        name:  displayName || fbUser.displayName || fbUser.email.split('@')[0],
        email: fbUser.email,
      });
      setCurrentTab('home');
    }, 1200);
  }, [toast, setToken, setUser, setCurrentTab]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const fbUser = userCredential.user;
      const token  = await fbUser.getIdToken();

      // Single authenticated sync — eliminates the previous unauthenticated
      // duplicate call that preceded this one and was an open write endpoint.
      try {
        await syncUserToBackend(token, {
          name,
          email:       fbUser.email,
          firebaseUid: fbUser.uid,
        });
      } catch (syncErr) {
        // Non-fatal: the user is authenticated; sync will be retried on next login.
        console.warn('[Signup] MongoDB sync deferred:', syncErr.message);
      }

      handleAuthSuccess(token, fbUser, name);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        toast.show('Email already in use', 'error');
      } else if (err.code === 'auth/weak-password') {
        toast.show('Password is too weak', 'error');
      } else {
        toast.show('Registration failed. Check your connection.', 'error');
      }
    } finally {
      setTimeout(() => setLoading(false), 1200);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      const userCredential = await signInWithPopup(auth, googleProvider);
      const fbUser = userCredential.user;
      const token  = await fbUser.getIdToken();

      // Single authenticated sync — identical fix to handleSubmit above.
      try {
        await syncUserToBackend(token, {
          name:        fbUser.displayName,
          email:       fbUser.email,
          firebaseUid: fbUser.uid,
        });
      } catch (syncErr) {
        console.warn('[Signup] MongoDB sync deferred:', syncErr.message);
      }

      handleAuthSuccess(token, fbUser, fbUser.displayName);
    } catch {
      toast.show('Google sign-up was cancelled or failed.', 'error');
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', padding: '0 16px', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: '0 0 4px' }}>Create account</h2>
        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 24px' }}>Set up your profile to start mock interviews.</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Name */}
          <div>
            <label htmlFor="signup-name" style={{ fontSize: '12px', fontWeight: '500', color: '#888', display: 'block', marginBottom: '6px' }}>Full name</label>
            <div style={{ position: 'relative' }}>
              <User size={15} color="#555" style={{ position: 'absolute', left: '11px', top: '11px' }} aria-hidden="true" />
              <input
                id="signup-name"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={e => { setName(e.target.value); clearError('name'); }}
                style={inp(errors.name)}
                aria-invalid={getAriaInvalid(errors.name)}
                aria-describedby={errors.name ? getErrorId('name') : undefined}
              />
            </div>
            {errors.name && <p id={getErrorId('name')} style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }} role="alert">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="signup-email" style={{ fontSize: '12px', fontWeight: '500', color: '#888', display: 'block', marginBottom: '6px' }}>Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#555" style={{ position: 'absolute', left: '11px', top: '11px' }} aria-hidden="true" />
              <input
                id="signup-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={e => { setEmail(e.target.value); clearError('email'); }}
                style={inp(errors.email)}
                aria-invalid={getAriaInvalid(errors.email)}
                aria-describedby={errors.email ? getErrorId('email') : undefined}
              />
            </div>
            {errors.email && <p id={getErrorId('email')} style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }} role="alert">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="signup-password" style={{ fontSize: '12px', fontWeight: '500', color: '#888', display: 'block', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#555" style={{ position: 'absolute', left: '11px', top: '11px' }} aria-hidden="true" />
              <input
                id="signup-password"
                type={show ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); clearError('password'); }}
                style={{ ...inp(errors.password), paddingRight: '38px' }}
                aria-invalid={getAriaInvalid(errors.password)}
                aria-describedby={errors.password ? getErrorId('password') : undefined}
              />
              <button
                type="button"
                onClick={() => setShow(!show)}
                style={{ position: 'absolute', right: '10px', top: '9px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '2px' }}
                aria-label={show ? 'Hide password' : 'Show password'}
              >
                {show ? <EyeOff size={15} aria-hidden="true" /> : <Eye size={15} aria-hidden="true" />}
              </button>
            </div>
            <PasswordStrengthMeter password={password} />
            {errors.password && <p id={getErrorId('password')} style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }} role="alert">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ marginTop: '8px', width: '100%', padding: '11px', background: loading ? '#1a1a1a' : '#fff', color: loading ? '#555' : '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}
          >
            {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Creating account…</> : <>Create account <ArrowRight size={15} /></>}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', margin: '4px 0' }}>
            <div style={{ flex: 1, height: '1px', background: '#222' }} />
            <span style={{ margin: '0 12px', fontSize: '12px', color: '#666', fontWeight: '500' }}>OR</span>
            <div style={{ flex: 1, height: '1px', background: '#222' }} />
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="btn-google"
            style={{ width: '100%', padding: '11px', background: 'transparent', color: '#fff', border: '1px solid #333', borderRadius: '8px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.15s' }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#555', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #1e1e1e' }}>
          Already have an account?{' '}
          <button
            onClick={() => setCurrentTab('login')}
            style={{ background: 'none', border: 'none', color: '#aaa', fontWeight: '500', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
