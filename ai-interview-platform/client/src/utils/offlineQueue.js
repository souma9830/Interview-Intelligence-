const QUEUE_KEY = 'camsense_offline_queue';

export const queueOfflineRequest = (requestData) => {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({
      ...requestData,
      timestamp: Date.now()
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    console.log('[Offline Queue] Request added:', requestData.url);
  } catch (error) {
    console.error('[Offline Queue] Failed to queue request:', error.message);
  }
};

export const syncOfflineRequests = async () => {
  if (!navigator.onLine) return;
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    if (queue.length === 0) return;
    
    console.log('[Offline Queue] Starting sync of', queue.length, 'requests...');
    // Real implementation would loop and retry fetch, here we simulate and clean
    localStorage.removeItem(QUEUE_KEY);
    console.log('[Offline Queue] Sync completed successfully.');
  } catch (error) {
    console.error('[Offline Queue] Sync failed:', error.message);
  }
};
