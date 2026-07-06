import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingOverlay({ message = 'Loading...', fullPage = false }) {
  if (fullPage) {
    return (
      <div
        role="alert"
        aria-busy="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: '12px',
          background: 'rgba(5, 5, 5, 0.85)',
          backdropFilter: 'blur(4px)'
        }}
      >
        <Loader2 size={28} color="#888" style={{ animation: 'spin 1s linear infinite' }} />
        <span style={{ fontSize: '13px', color: '#aaa' }}>{message}</span>
      </div>
    );
  }

  return (
    <div
      role="alert"
      aria-busy="true"
      style={{
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        gap: '10px', padding: '40px 20px'
      }}
    >
      <Loader2 size={24} color="#666" style={{ animation: 'spin 1s linear infinite' }} />
      <span style={{ fontSize: '13px', color: '#888' }}>{message}</span>
    </div>
  );
}
