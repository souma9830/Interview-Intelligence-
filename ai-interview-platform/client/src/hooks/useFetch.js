import { useState, useEffect, useRef, useCallback } from 'react';

export function useFetch(asyncFn, immediate = false) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (abortRef.current) {
        abortRef.current.abort();
      }
    };
  }, []);

  const execute = useCallback(async (...args) => {
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await asyncFn(...args, controller.signal);
      if (mountedRef.current && !controller.signal.aborted) {
        setData(result);
        setLoading(false);
      }
      return result;
    } catch (err) {
      if (err.name === 'AbortError') return;
      if (mountedRef.current) {
        setError(err.message || 'An unexpected error occurred');
        setLoading(false);
      }
    }
  }, [asyncFn]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, execute]);

  return { data, loading, error, execute, reset };
}

export function wrapFetch(url, options = {}) {
  return async (signal) => {
    const res = await fetch(url, { ...options, signal });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body.message || `Request failed with status ${res.status}`);
    }
    return res.json();
  };
}
