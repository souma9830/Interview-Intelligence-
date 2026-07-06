import React from 'react';

export default function ToastContainer({ toasts, dismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        maxWidth: '380px',
        width: '100%',
      }}
      role="live"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        let bgColor = '#1e1b4b'; // dark blue / indigo default
        let borderLeft = '4px solid #6366f1';
        if (toast.type === 'success') {
          bgColor = '#064e3b';
          borderLeft = '4px solid #10b981';
        } else if (toast.type === 'error') {
          bgColor = '#7f1d1d';
          borderLeft = '4px solid #ef4444';
        } else if (toast.type === 'warning') {
          bgColor = '#78350f';
          borderLeft = '4px solid #f59e0b';
        }

        return (
          <div
            key={toast.id}
            style={{
              background: bgColor,
              color: '#f8fafc',
              padding: '12px 16px',
              borderRadius: '6px',
              borderLeft: borderLeft,
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '14px',
              animation: 'slideIn 0.2s ease-out',
            }}
          >
            <span>{toast.message}</span>
            <button
              onClick={() => dismiss(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                marginLeft: '12px',
                fontSize: '16px',
                padding: '2px 6px',
              }}
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        );
      })}
    </div>
  );
}
