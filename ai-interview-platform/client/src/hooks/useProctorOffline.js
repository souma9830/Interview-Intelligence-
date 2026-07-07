import { useEffect, useState } from 'react';
import { pushOfflineEvent, syncOfflineEvents } from '../utils/offlineQueue';

export function useProctorOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineEvents();
    };
    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueViolation = (event) => {
    if (!navigator.onLine) {
      pushOfflineEvent({
        event,
        timestamp: new Date().toISOString(),
      });
    }
  };

  return { isOnline, queueViolation };
}
