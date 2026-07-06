/**
 * AbortSignal Factory Helpers
 */

export function createTimedSignal(timeoutMs = 8000) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeoutMs);
  return controller.signal;
}
