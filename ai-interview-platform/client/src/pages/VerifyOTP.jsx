import React, { useState, useEffect } from 'react';
import { Lock, Loader2, ArrowRight, Eye, EyeOff } from 'lucide-react';

const inp = (err) => ({ width: '100%', background: '#0d0d0d', border: `1px solid ${err ? '#ef4444' : '#2a2a2a'}`, borderRadius: '8px', padding: '10px 12px 10px 38px', fontSize: '14px', color: '#e0e0e0', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box', transition: 'border-color 0.15s' });

export default function VerifyOTP({ setCurrentTab }) {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState(null);
  const [email, setEmail] = useState('');

  useEffect(() => {
    const storedEmail = localStorage.getItem('reset_email');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setCurrentTab('forgot-password');
    }
  }, [setCurrentTab]);

  const showToast = (msg, type = 'ok') => { setToast({ msg, type }); setTimeout(() => setToast(null), 4000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      setError('Both OTP and new password are required');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword })
      });
      const data = await res.json();
      
      if (data.success) {
        showToast('Password reset successfully!');
        setTimeout(() => {
          localStorage.removeItem('reset_email');
          setCurrentTab('login');
        }, 1500);
      } else {
        setError(data.message || 'Invalid or expired OTP');
      }
    } catch (err) {
      setError('Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', maxWidth: '400px', padding: '0 16px', fontFamily: 'Inter, sans-serif' }}>
      {toast && (
        <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 100, background: toast.type === 'ok' ? '#14532d' : '#7f1d1d', border: `1px solid ${toast.type === 'ok' ? '#22c55e' : '#ef4444'}`, color: '#fff', padding: '10px 16px', borderRadius: '8px', fontSize: '13px' }}>
          {toast.msg}
        </div>
      )}

      <div style={{ background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#fff', margin: '0 0 4px' }}>Verify OTP</h2>
        <p style={{ fontSize: '13px', color: '#666', margin: '0 0 24px' }}>
          Enter the 6-digit OTP sent to {email} and your new password.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#888', display: 'block', marginBottom: '6px' }}>OTP Code</label>
            <div style={{ position: 'relative' }}>
              <input type="text" placeholder="123456" value={otp} onChange={e => { setOtp(e.target.value); setError(''); }} style={{...inp(error), paddingLeft: '12px', textAlign: 'center', letterSpacing: '4px'}} maxLength={6} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '12px', fontWeight: '500', color: '#888', display: 'block', marginBottom: '6px' }}>New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="#555" style={{ position: 'absolute', left: '11px', top: '11px' }} />
              <input type={show ? 'text' : 'password'} placeholder="••••••••" value={newPassword} onChange={e => { setNewPassword(e.target.value); setError(''); }} style={{ ...inp(error), paddingRight: '38px' }} />
              <button type="button" onClick={() => setShow(!show)} style={{ position: 'absolute', right: '10px', top: '9px', background: 'none', border: 'none', cursor: 'pointer', color: '#555', padding: '2px' }}>
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {error && <p style={{ fontSize: '12px', color: '#ef4444', margin: '4px 0 0' }}>{error}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: '8px', width: '100%', padding: '11px', background: loading ? '#1a1a1a' : '#fff', color: loading ? '#555' : '#000', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s ease' }}>
            {loading ? <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Verifying…</> : <>Reset Password <ArrowRight size={15} /></>}
          </button>
        </form>
      </div>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .btn-primary:hover:not(:disabled) {
          background: #e2e2e2 !important;
          transform: scale(1.01);
        }
        .btn-primary:active:not(:disabled) {
          transform: scale(0.99);
        }
      `}</style>
    </div>
  );
}
