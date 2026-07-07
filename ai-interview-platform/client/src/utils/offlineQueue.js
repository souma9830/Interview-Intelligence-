/**
 * LocalStorage Queue for Offline Telemetry Events
 */

export function pushOfflineEvent(event) {
  const queue = JSON.parse(localStorage.getItem('offline_proctor_queue') || '[]');
  queue.push(event);
  localStorage.setItem('offline_proctor_queue', JSON.stringify(queue));
  console.log('[Offline Queue] Event added:', event);
}

export async function syncOfflineEvents() {
  const queue = JSON.parse(localStorage.getItem('offline_proctor_queue') || '[]');
  if (queue.length === 0) return;

  console.log(`[Offline Sync] Attempting to sync ${queue.length} events...`);
  try {
    const token = localStorage.getItem('camsense_token') || 'demo_token_active';
    const res = await fetch('/api/interview/telemetry/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ events: queue })
    });

    if (res.ok) {
      console.log('[Offline Sync] Sync complete. Queue cleared.');
      localStorage.removeItem('offline_proctor_queue');
    }
  } catch (error) {
    console.error('[Offline Sync] Failed to sync. Retrying later.', error);
  }
}
