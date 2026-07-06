import React from 'react';
import { WifiOff } from 'lucide-react';

export default function OfflineBanner({ isOnline }) {
  if (isOnline) return null;

  return (
    <div
      role="alert"
      style={{
        background: '#7f1d1d', borderBottom: '1px solid #ef4444',
        color: '#fff', padding: '8px 16px', fontSize: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '8px', flexShrink: 0,
      }}
    >
      <WifiOff size={14} />
      <span>
        You are currently offline. Some features may be unavailable. The application will automatically resume when connectivity is restored.
      </span>
    </div>
  );
}
