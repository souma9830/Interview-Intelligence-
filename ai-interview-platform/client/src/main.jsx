import ErrorBoundary from './components/Common/ErrorBoundary';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { queueOfflineRequest } from './utils/offlineQueue';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // In development, unregister service workers to prevent stale cache issues with Vite HMR
    if (import.meta.env.DEV) {
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        registrations.forEach((reg) => reg.unregister());
      });
      caches.keys().then((names) => {
        names.forEach((name) => caches.delete(name));
      });
      return;
    }

    navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    }).then(() => {
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'QUEUE_OFFLINE_REQUEST') {
          queueOfflineRequest({
            url: event.data.url,
            method: event.data.method,
            headers: Object.fromEntries(event.data.headers || []),
          });
        }
      });
    }).catch(() => {
      /* SW registration failed */
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary><App /></ErrorBoundary>
  </React.StrictMode>,
);
