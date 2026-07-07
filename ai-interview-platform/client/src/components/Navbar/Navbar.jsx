import React from 'react';
import { Activity } from 'lucide-react';
import ThemeToggler from '../Common/ThemeToggler';

export default function Navbar() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isOnline = useOnlineStatus();

  return (
    <header style={{ height: '52px', borderBottom: '1px solid var(--border-color)', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Activity size={14} color="#4ade80" />
        <span style={{ fontSize: '12px', color: 'var(--color-secondary)', letterSpacing: '0.05em' }}>System Online</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <ThemeToggler />
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#4ade80', display: 'inline-block' }} />
          <span style={{ fontSize: '11px', color: 'var(--color-secondary)' }}>localhost:5000</span>
        </div>
      </div>
    </header>
  );
}
