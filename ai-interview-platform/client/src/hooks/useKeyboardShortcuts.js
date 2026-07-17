import { useEffect, useState } from 'react';

export function useKeyboardShortcuts(onToggleHelp) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      // alt + ?/h to show keyboard shortcuts
      if (e.altKey && (e.key === '?' || e.key === 'h')) {
        e.preventDefault();
        onToggleHelp();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggleHelp]);
}

export function useShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const toggle = () => setIsOpen(prev => !prev);
  return { isOpen, toggle };
}
