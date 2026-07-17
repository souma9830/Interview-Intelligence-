const QUEUE_KEY = 'camsense_offline_queue';

export const queueOfflineRequest = (requestData) => {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
    queue.push({
      ...requestData,
      queuedAt: Date.now(),
      retryCount: 0,
    });
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
  } catch (error) {
    console.error('[Offline Queue] Failed to queue request:', error.message);
  }
};

export const syncOfflineRequests = async () => {
  if (!navigator.onLine) return;
  let queue;
  try {
    queue = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]');
  } catch {
    return;
  }
  if (queue.length === 0) return;

  const retained = [];
  for (const entry of queue) {
    try {
      const options = {
        method: entry.method || 'POST',
        headers: entry.headers || { 'Content-Type': 'application/json' },
      };
      if (entry.body) {
        options.body = entry.body;
      }
      const response = await fetch(entry.url, options);
      if (!response.ok) {
        retained.push({ ...entry, retryCount: entry.retryCount + 1 });
      }
    } catch {
      if (entry.retryCount < 3) {
        retained.push({ ...entry, retryCount: entry.retryCount + 1 });
      }
    }
  }

  if (retained.length > 0) {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(retained));
  } else {
    localStorage.removeItem(QUEUE_KEY);
  }
};
