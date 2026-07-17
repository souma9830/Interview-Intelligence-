import ErrorBoundary from './components/Common/ErrorBoundary';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { queueOfflineRequest } from './utils/offlineQueue';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', {
      scope: '/',
      updateViaCache: 'none',
    }).then((reg) => {
      if (window.location.hostname === 'localhost') {
        console.log('[SW] Registered for development');
      }
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
