import React from 'react';
import { Home as HomeIcon, Settings, Mic, Code2, Award, Cpu, LogOut, Lock, BarChart2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import ThemeToggle from '../Common/ThemeToggle';

const S = {
  aside: { width: '240px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '24px 16px', flexShrink: 0, transition: 'background 0.3s, border-color 0.3s' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 20px', marginBottom: '8px', borderBottom: '1px solid var(--border-color)' },
  logoIcon: { width: '32px', height: '32px', background: '#fff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '-0.01em' },
  logoSub: { fontSize: '11px', color: '#888', marginTop: '1px' },
  navLabel: { fontSize: '10px', fontWeight: '600', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '16px 12px 8px' },
  navBtn: (active, disabled) => ({ 
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '8px', border: 'none', 
    cursor: disabled ? 'not-allowed' : 'pointer', 
    background: active ? '#1e1e1e' : 'transparent', 
    color: disabled ? '#555' : active ? '#fff' : '#b0b0b0', 
    fontSize: '13.5px', fontWeight: active ? '600' : '500', transition: 'all 0.15s', textAlign: 'left', 
    borderLeft: active ? '2px solid #fff' : '2px solid transparent',
    opacity: disabled ? 0.5 : 1
  }),
  userBox: { marginTop: 'auto', borderTop: '1px solid #1e1e1e', paddingTop: '16px' },
  avatar: { width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--color-primary)', flexShrink: 0 },
  logoutBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#aaa', display: 'flex', transition: 'color 0.15s' },
};

export default function Sidebar({ currentTab, setCurrentTab, user, globalState = {}, onLogout }) {
  const isSetupDone = !!globalState.role;
  const isSessionDone = globalState.userAnswers && globalState.userAnswers.length > 0;
  const isCodingDone = !!globalState.finalCode;

  const { theme, toggleTheme } = useTheme();

  const items = [
    { id: 'home', label: 'Home', icon: HomeIcon, disabled: false },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2, disabled: false },
    { id: 'setup', label: 'Interview Setup', icon: Settings, disabled: false },
    { id: 'session', label: 'AI Mock Session', icon: Mic, disabled: !isSetupDone },
    { id: 'coding', label: 'Coding Test', icon: Code2, disabled: !isSessionDone },
    { id: 'result', label: 'Results', icon: Award, disabled: !isCodingDone },
  ];

  const name = user?.name || 'Candidate';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const handleNavClick = (id, disabled) => {
    if (disabled) return;
    setCurrentTab(id);
  };

  const getNavLabel = (label, disabled) => (
    disabled ? `${label} locked until previous assessment step is complete` : `Open ${label}`
  );

  return (
    <aside style={S.aside}>
      <div>
        <div style={S.logo}>
          <div style={S.logoIcon}><Cpu size={16} color="#000" /></div>
          <div>
            <div style={S.logoText}>CamSense AI</div>
            <div style={S.logoSub}>Interview Engine</div>
          </div>
        </div>

        <div style={S.navLabel}>Navigation</div>
        <nav aria-label="Assessment navigation" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {items.map(({ id, label, icon: Icon, disabled }) => (
            <button 
              key={id} 
              onClick={() => handleNavClick(id, disabled)} 
              style={S.navBtn(currentTab === id, disabled)}
              disabled={disabled}
              aria-current={currentTab === id ? 'page' : undefined}
              aria-label={getNavLabel(label, disabled)}
            >
              <Icon size={15} />
              <span style={{ flex: 1 }}>{label}</span>
              {disabled && <Lock size={12} style={{ color: '#666' }} aria-hidden="true" />}
            </button>
          ))}
        </nav>
      </div>

      <div style={{ marginTop: 'auto', marginBottom: '16px' }}>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
      </div>

      <div style={S.userBox}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={S.avatar}>{initials}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
            <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '1px' }}>● Connected</div>
          </div>
          {onLogout && (
            <button onClick={onLogout} style={S.logoutBtn} title="Logout" aria-label="Log out of CamSense AI">
              <LogOut size={15} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
