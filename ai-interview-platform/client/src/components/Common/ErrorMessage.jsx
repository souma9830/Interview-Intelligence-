import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

export function ErrorMessage({ message = 'Something went wrong.', onRetry, style = {} }) {
  return (
    <div
      role="alert"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '14px 18px',
        background: '#1a0f0f',
        border: '1px solid #3a1a1a',
        borderRadius: '10px',
        color: '#f87171',
        fontSize: '13px',
        lineHeight: '1.5',
        ...style
      }}
    >
      <AlertCircle size={18} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          aria-label="Retry"
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#f87171', padding: '4px', display: 'flex'
          }}
        >
          <RefreshCw size={16} />
        </button>
      )}
    </div>
  );
}
