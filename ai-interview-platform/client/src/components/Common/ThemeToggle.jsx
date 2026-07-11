import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '../../hooks/useDarkMode';
import { fullButton, iconButton } from './ThemeToggle.styles';

export default function ThemeToggle({ variant = 'full' }) {
  const [theme, toggleTheme] = useDarkMode();

  if (variant === 'icon-only') {
    return (
      <button
        onClick={toggleTheme}
        style={iconButton}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      style={fullButton}
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
}
