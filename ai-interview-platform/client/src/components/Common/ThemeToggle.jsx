import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      onClick={onToggle}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '9px 12px', borderRadius: '8px', border: '1px solid var(--border-color)',
        background: 'transparent', color: 'var(--color-secondary)', fontSize: '13px',
        cursor: 'pointer', transition: 'all 0.15s',
      }}
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
