import { useState, useEffect } from 'react';

export function useServiceWorker() {
  const [swStatus, setSwStatus] = useState('unregistered');
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      setSwStatus('unsupported');
      return;
    }

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });
        setRegistration(reg);
        setSwStatus('registered');

        if (reg.active) {
          setSwStatus('active');
        }

        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                setSwStatus('update-available');
              }
            });
          }
        });

        if (reg.waiting) {
          setUpdateAvailable(true);
          setSwStatus('update-available');
        }
      } catch (err) {
        console.warn('SW registration failed:', err.message);
        setSwStatus('error');
      }
    };

    window.addEventListener('load', register);
    return () => window.removeEventListener('load', register);
  }, []);

  const applyUpdate = async () => {
    if (!registration || !registration.waiting) return;
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  };

  return { swStatus, updateAvailable, applyUpdate };
}