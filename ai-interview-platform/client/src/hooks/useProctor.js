import { useEffect, useRef, useCallback } from 'react';
import { useProctorOffline } from './useProctorOffline';

export function useProctor({
  interviewId = 'demo_session_active',
  enabled = false,
  onViolation,
  cheatWarningVisible,
}) {
  const visibilityHandlerRef = useRef(null);
  const fullscreenHandlerRef = useRef(null);

  const { queueViolation } = useProctorOffline();

  const reportTelemetry = useCallback(async (eventType, description) => {
    if (!navigator.onLine) {
      console.log('[Proctor] Offline detected. Queuing telemetry locally.');
      queueViolation(`${eventType}: ${description}`);
      return;
    }
    try {
      await fetch('/api/interview/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId,
          eventType,
          description,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.warn('[Proctor] Telemetry report failed:', err.message);
    }
  }, [interviewId, queueViolation]);

  useEffect(() => {
    if (!enabled || cheatWarningVisible) return;

    const handleViolation = () => {
      const eventType = document.hidden ? 'TabSwitch' : 'FullscreenExit';
      const description = document.hidden
        ? 'User switched to another tab'
        : 'User exited fullscreen mode';
      reportTelemetry(eventType, description);
      if (onViolation) onViolation(eventType);
    };

    const onVisibilityChange = () => {
      if (document.hidden) handleViolation();
    };

    const onFullscreenChange = () => {
      if (!document.fullscreenElement) handleViolation();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    document.addEventListener('fullscreenchange', onFullscreenChange);

    visibilityHandlerRef.current = onVisibilityChange;
    fullscreenHandlerRef.current = onFullscreenChange;

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('fullscreenchange', onFullscreenChange);
    };
  }, [enabled, cheatWarningVisible, onViolation, reportTelemetry]);

  return { reportTelemetry };
}
