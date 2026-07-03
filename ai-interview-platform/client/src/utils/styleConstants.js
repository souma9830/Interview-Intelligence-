export const card = {
  background: '#111',
  border: '1px solid #1e1e1e',
  borderRadius: '12px',
  padding: '32px',
};

export const inp = (err) => ({
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

export const inputGroup = {
  position: 'relative',
};

export const iconPosition = {
  position: 'absolute',
  left: '11px',
  top: '11px',
};

export const label = {
  fontSize: '12px',
  fontWeight: '500',
  color: '#888',
  display: 'block',
  marginBottom: '6px',
};

export const btnPrimary = (loading, disabled) => ({
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

export const btnSecondary = {
  width: '100%',
  padding: '10px',
  background: 'transparent',
  color: '#aaa',
  border: '1px solid #333',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: '500',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  transition: 'all 0.2s ease',
};

export const toastContainer = (type) => ({
  position: 'fixed',
  top: '20px',
  right: '20px',
  zIndex: 100,
  background: type === 'ok' ? '#14532d' : '#7f1d1d',
  border: `1px solid ${type === 'ok' ? '#22c55e' : '#ef4444'}`,
  color: '#fff',
  padding: '10px 16px',
  borderRadius: '8px',
  fontSize: '13px',
});

export const divider = {
  display: 'flex',
  alignItems: 'center',
  margin: '4px 0',
};

export const dividerLine = {
  flex: 1,
  height: '1px',
  background: '#222',
};

export const dividerText = {
  margin: '0 12px',
  fontSize: '12px',
  color: '#666',
  fontWeight: '500',
};

export const authPageContainer = {
  width: '100%',
  maxWidth: '400px',
  padding: '0 16px',
  fontFamily: 'Inter, sans-serif',
};

export const authHeader = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#fff',
  margin: '0 0 4px',
};

export const authSubtext = {
  fontSize: '13px',
  color: '#666',
  margin: '0 0 24px',
};

export const googleBtn = {
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

export const showPasswordBtn = {
  position: 'absolute',
  right: '10px',
  top: '9px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: '#555',
  padding: '2px',
};

export const inputError = {
  fontSize: '12px',
  color: '#ef4444',
  margin: '4px 0 0',
};

export const toggleLink = {
  background: 'none',
  border: 'none',
  color: '#aaa',
  fontWeight: '500',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '13px',
};

export const pageWrapper = {
  maxWidth: '960px',
  margin: '0 auto',
  fontFamily: 'Inter, sans-serif',
};

export const pageTitle = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#fff',
  letterSpacing: '-0.02em',
  margin: '0 0 6px',
};

export const pageSubtitle = {
  fontSize: '14px',
  color: '#aaa',
  lineHeight: '1.6',
};

export const flexCenter = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

export const sectionCard = {
  background: '#111',
  border: '1px solid #1e1e1e',
  borderRadius: '12px',
  padding: '24px',
};

export const sectionHeader = {
  fontSize: '14px',
  fontWeight: '600',
  color: '#fff',
  margin: 0,
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
};

export const spinnerStyle = {
  animation: 'spin 1s linear infinite',
};
