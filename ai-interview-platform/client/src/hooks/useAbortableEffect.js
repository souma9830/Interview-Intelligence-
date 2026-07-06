import { useEffect } from 'react';

export function useAbortableEffect(effect, dependencies) {
  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    effect(signal);

    return () => {
      controller.abort();
    };
  }, dependencies);
}
