import { useEffect, useRef, useCallback } from 'react';
import { useProctorOffline } from './useProctorOffline';
import { TELEMETRY_EVENTS, PROCTOR_KEYS } from '../utils/telemetryConstants';

export function useProctor({
  interviewId = PROCTOR_KEYS.DEMO_SESSION,
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
      const eventType = document.hidden ? TELEMETRY_EVENTS.TAB_SWITCH : TELEMETRY_EVENTS.FULLSCREEN_EXIT;
      const description = document.hidden
        ? TELEMETRY_EVENTS.TAB_SWITCH_DESC
        : TELEMETRY_EVENTS.FULLSCREEN_EXIT_DESC;
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
