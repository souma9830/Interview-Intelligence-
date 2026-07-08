import React from 'react';
import { Activity, WifiOff } from 'lucide-react';
import ThemeToggler from '../Common/ThemeToggler';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export default function Navbar() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isOnline = useOnlineStatus();

  return (
    <header style={{ height: '52px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 16px' : '0 28px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isOnline ? <Activity size={14} color="#4ade80" /> : <WifiOff size={14} color="#ef4444" />}
        <span style={{ fontSize: '12px', color: isOnline ? 'var(--color-secondary)' : '#ef4444', letterSpacing: '0.05em' }}>
          System {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ThemeToggler />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isOnline ? '#4ade80' : '#ef4444', display: 'inline-block' }} />
          {!isMobile && <span style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>localhost:5000</span>}
        </div>
      </div>
    </header>
  );
}
