import { useState, useEffect, useCallback, useMemo } from 'react';

const DEFAULT_SHORTCUTS = {
  '?': { label: 'Toggle keyboard shortcuts help', category: 'General' },
  'h': { label: 'Go to Home', category: 'Navigation' },
  'd': { label: 'Go to Dashboard', category: 'Navigation' },
  's': { label: 'Go to Interview Setup', category: 'Navigation' },
  'r': { label: 'Go to Results', category: 'Navigation' },
  'Escape': { label: 'Close dialog or cancel', category: 'General' },
};

export function useKeyboardShortcuts(extraShortcuts = {}, enabled = true) {
  const merged = useMemo(() => ({ ...DEFAULT_SHORTCUTS, ...extraShortcuts }), [extraShortcuts]);

  const handler = useCallback((e) => {
    if (!enabled) return;
    const key = e.key;
    const target = e.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable) {
      if (key !== 'Escape') return;
    }
    const action = merged[key];
    if (action && action.onPress) {
      e.preventDefault();
      action.onPress();
    }
  }, [merged, enabled]);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler, enabled]);

  return merged;
}

export function useShortcutsDialog(initialOpen = false) {
  const [isOpen, setIsOpen] = useState(initialOpen);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []);
  return { isOpen, toggle, close, open };
}
