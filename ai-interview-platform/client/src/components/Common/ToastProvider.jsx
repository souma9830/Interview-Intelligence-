import React, { createContext, useCallback, useState, useContext } from 'react';
import ToastContainer from './Toast';

const ToastContext = createContext(null);

let toastIdCounter = 0;

/**
 * Unified Toast Provider
 * Supports both API patterns:
 *   - { addToast, removeToast } (legacy)
 *   - { show, dismiss } (new)
 * Both point to the same underlying implementation.
 */
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastIdCounter;
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const dismiss = removeToast;
  const show = addToast;

  return (
    <ToastContext.Provider value={{ addToast, removeToast, show, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}
