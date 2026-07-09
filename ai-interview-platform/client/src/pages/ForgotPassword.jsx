import React, { useState } from 'react';
import { Mail, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';
import { ErrorMessage } from '../components/Common/ErrorMessage';
import { useToast } from '../components/Common/ToastProvider';

const inp = (err) => ({ width: '100%', background: '#0d0d0d', border: `1px solid ${err ? '#ef4444' : '#2a2a2a'}`, borderRadius: '8px', padding: '10px 12px 10px 38px', fontSize: '14px', color: '#e0e0e0', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.15s' });

export default function ForgotPassword({ setCurrentTab }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (data.success) {
        addToast('OTP sent to your email!');
        setSuccess(true);
        localStorage.setItem('reset_email', email);
        setTimeout(() => {
          setCurrentTab('verify-otp');
        }, 1500);
      } else {
        setError(data.message || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', padding: '0 16px', fontFamily: 'Inter, sans-serif' }}>

      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: '0 0 4px' }}>Forgot Password</h2>
        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 24px' }}>
          Enter your email and we'll send you an OTP to reset your password.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#888', display: 'block', marginBottom: '6px' }}>Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="#555" style={{ position: 'absolute', left: '11px', top: '11px' }} />
              <input type="email" placeholder="you@example.com" value={email} onChange={e => { setEmail(e.target.value); setError(''); }} autoComplete="email" style={inp(error)} />
            </div>
            {error && <ErrorMessage message={error} style={{ marginTop: '4px' }} />}
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px', width: '100%', padding: '11px', background: loading ? '#1a1a1a' : '#fff', color: loading ? '#555' : '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
            {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Sending OTP…</> : <>Send OTP <ArrowRight size={15} /></>}
          </button>
          
          <button type="button" onClick={() => setCurrentTab('login')} className="btn-secondary" style={{ width: '100%', padding: '10px', background: 'transparent', color: '#aaa', border: '1px solid #333', borderRadius: '8px', fontSize: '13px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
            <ArrowLeft size={15} /> Back to sign in
          </button>
        </form>
      </div>
      </div>
  );
}
