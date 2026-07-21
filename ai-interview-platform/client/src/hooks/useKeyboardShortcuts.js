import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Registers a map of keyboard shortcuts while the app is in an active (non-auth) state.
 *
 * Shortcut map format:
 *   { [key]: { label: string, category: string, onPress: () => void } }
 *
 * Modifier keys are intentionally excluded so single-letter shortcuts do not
 * fire while the user is typing inside an input, textarea, or select element.
 *
 * Returns the validated shortcut map (useful for rendering a help dialog).
 */
export function useKeyboardShortcuts(shortcuts = {}, enabled = true) {
  // Keep a stable ref so the effect doesn't re-register on every render.
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Do not fire shortcuts when the user is typing into a form control.
      const tag = e.target?.tagName?.toLowerCase();
      if (['input', 'textarea', 'select'].includes(tag)) return;
      // Do not fire shortcuts when a modifier key is held (except Escape which is standalone).
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const handler = shortcutsRef.current[e.key];
      if (handler?.onPress) {
        e.preventDefault();
        handler.onPress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);

  return shortcuts;
}

/**
 * Manages the open/closed state of the keyboard-shortcuts help dialog.
 * Returns { isOpen, open, close, toggle } so callers can control it precisely.
 */
export function useShortcutsDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const open   = useCallback(() => setIsOpen(true),  []);
  const close  = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return { isOpen, open, close, toggle };
}
