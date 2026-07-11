import React, { useRef, useCallback, useEffect } from 'react';
import { Home as HomeIcon, Settings, Mic, Code2, Award, Cpu, LogOut, Lock, BarChart2, Menu, X } from 'lucide-react';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import ThemeToggle from '../Common/ThemeToggle';

// Sidebar navigation containing shortcuts helper options
const S = {
  aside: { width: '240px', background: 'var(--bg-card)', borderRight: '1px solid var(--border-color)', minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '24px 16px', flexShrink: 0, transition: 'background 0.3s, border-color 0.3s' },
  logo: { display: 'flex', alignItems: 'center', gap: '10px', padding: '0 8px 20px', marginBottom: '8px', borderBottom: '1px solid var(--border-color)' },
  logoIcon: { width: '32px', height: '32px', background: 'var(--color-primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: '15px', fontWeight: '700', color: 'var(--color-primary)', letterSpacing: '-0.01em' },
  logoSub: { fontSize: '11px', color: '#888', marginTop: '1px' },
  navLabel: (collapsed) => ({
    fontSize: '10px', fontWeight: '600', color: '#888', letterSpacing: '0.1em', textTransform: 'uppercase',
    padding: collapsed ? '16px 0 8px' : '16px 12px 8px', textAlign: collapsed ? 'center' : 'left',
    overflow: 'hidden', whiteSpace: 'nowrap'
  }),
  navBtn: (active, disabled, collapsed) => ({
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
    padding: collapsed ? '9px 0' : '9px 12px', borderRadius: '8px', border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    background: active ? '#1e1e1e' : 'transparent',
    color: disabled ? '#555' : active ? '#fff' : '#b0b0b0',
    fontSize: '13.5px', fontWeight: active ? '600' : '500',
    transition: 'all 0.15s', textAlign: 'left',
    borderLeft: active ? '2px solid #fff' : '2px solid transparent',
    opacity: disabled ? 0.5 : 1,
    justifyContent: collapsed ? 'center' : 'flex-start'
  }),
  userBox: { marginTop: 'auto', borderTop: '1px solid #1e1e1e', paddingTop: '16px' },
  avatar: { width: '32px', height: '32px', borderRadius: '8px', background: 'var(--bg-app)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', color: 'var(--color-primary)', flexShrink: 0 },
  logoutBtn: { background: 'transparent', border: 'none', cursor: 'pointer', padding: '6px', borderRadius: '6px', color: '#aaa', display: 'flex', transition: 'color 0.15s' },
};

export default function Sidebar({ currentTab, setCurrentTab, user, globalState = {}, onLogout }) {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [collapsed, setCollapsed] = React.useState(isMobile);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const navRef = useRef(null);
  const sidebarRef = useRef(null);

  React.useEffect(() => {
    if (isMobile) { setCollapsed(true); setMobileOpen(false); }
    else setCollapsed(false);
  }, [isMobile]);

  useEffect(() => {
    if (mobileOpen && sidebarRef.current) {
      const firstFocusable = sidebarRef.current.querySelector('button');
      firstFocusable?.focus();
    }
  }, [mobileOpen]);

  const toggleCollapse = () => {
    if (isMobile) setMobileOpen(prev => !prev);
    else setCollapsed(prev => !prev);
  };

  const handleNavClick = useCallback((id, disabled) => {
    if (disabled) return;
    setCurrentTab(id);
    if (isMobile) setMobileOpen(false);
  }, [isMobile, setCurrentTab]);

  const isSetupDone = !!globalState.role;
  const isSessionDone = globalState.userAnswers && globalState.userAnswers.length > 0;
  const isCodingDone = !!globalState.finalCode;

  const items = [
    { id: 'home', label: 'Home', icon: HomeIcon, disabled: false },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart2, disabled: false },
    { id: 'schedule', label: 'Schedule', icon: Calendar, disabled: false },
    { id: 'setup', label: 'Interview Setup', icon: Settings, disabled: false },
    { id: 'session', label: 'AI Mock Session', icon: Mic, disabled: !isSetupDone },
    { id: 'coding', label: 'Coding Test', icon: Code2, disabled: !isSessionDone },
    { id: 'result', label: 'Results', icon: Award, disabled: !isCodingDone },
  ];

  const name = user?.name || 'Candidate';
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const getNavLabel = (label, disabled) => (
    disabled ? `${label} locked until previous assessment step is complete` : `Open ${label}`
  );

  const effectiveCollapsed = isMobile ? !mobileOpen : collapsed;

  const handleNavKeyDown = (e, index) => {
    let nextIndex = index;
    if (e.key === 'ArrowDown') nextIndex = Math.min(index + 1, items.length - 1);
    else if (e.key === 'ArrowUp') nextIndex = Math.max(index - 1, 0);
    else if (e.key === 'Home') nextIndex = 0;
    else if (e.key === 'End') nextIndex = items.length - 1;
    else return;

    e.preventDefault();
    const buttons = navRef.current?.querySelectorAll('button') || [];
    buttons[nextIndex]?.focus();
  };

  return (
    <>
      {isMobile && (
        <button
          onClick={toggleCollapse}
          aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={mobileOpen}
          style={{
            position: 'fixed', top: '12px', left: '12px', zIndex: 1001,
            background: 'var(--bg-card)', border: '1px solid var(--border-color)',
            borderRadius: '8px', padding: '8px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#ccc'
          }}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      )}
      {(isMobile && !mobileOpen) ? null : (
        <aside ref={sidebarRef} style={S.aside} role="navigation" aria-label="Assessment navigation">
          <div>
            <div style={S.logo}>
              <div style={S.logoIcon}><Cpu size={16} color="#000" /></div>
              {!effectiveCollapsed && (
                <div>
                  <div style={S.logoText}>CamSense AI</div>
                  <div style={S.logoSub}>Interview Engine</div>
                </div>
              )}
              {!isMobile && (
                <button
                  onClick={toggleCollapse}
                  aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#888', padding: '4px', marginLeft: 'auto', display: 'flex'
                  }}
                >
                  {collapsed ? <Menu size={14} /> : <X size={14} />}
                </button>
              )}
            </div>

            {!effectiveCollapsed && <div style={S.navLabel(effectiveCollapsed)}>Navigation</div>}
            <div ref={navRef} role="menubar" aria-orientation="vertical" style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {items.map(({ id, label, icon: Icon, disabled }, index) => (
                <button
                  key={id}
                  role="menuitem"
                  tabIndex={currentTab === id ? 0 : -1}
                  onClick={() => handleNavClick(id, disabled)}
                  onKeyDown={(e) => handleNavKeyDown(e, index)}
                  style={S.navBtn(currentTab === id, disabled, effectiveCollapsed)}
                  disabled={disabled}
                  aria-current={currentTab === id ? 'page' : undefined}
                  aria-label={getNavLabel(label, disabled)}
                  title={effectiveCollapsed ? label : undefined}
                >
                  <Icon size={15} />
                  {!effectiveCollapsed && <span style={{ flex: 1 }}>{label}</span>}
                  {!effectiveCollapsed && disabled && <Lock size={12} style={{ color: '#666' }} aria-hidden="true" />}
                </button>
              ))}
            </div>
          </div>

          {!effectiveCollapsed && (
            <div style={{ marginTop: 'auto', marginBottom: '16px' }}>
              <ThemeToggle variant="full" />
            </div>
          )}

          <div style={S.userBox}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: effectiveCollapsed ? 'center' : 'flex-start' }}>
              <div style={S.avatar} aria-hidden="true">{initials}</div>
              {!effectiveCollapsed && (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
                    <div style={{ fontSize: '11px', color: '#4ade80', marginTop: '1px' }}>&bull; Connected</div>
                  </div>
                  {onLogout && (
                    <button onClick={onLogout} style={S.logoutBtn} title="Logout" aria-label="Log out of CamSense AI">
                      <LogOut size={15} aria-hidden="true" />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </aside>
      )}
    </>
  );
}