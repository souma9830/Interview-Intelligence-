import { useState, useEffect } from 'react';

/**
 * Returns a debounced version of `value` that only updates after
 * `delayMs` milliseconds have elapsed since the last change.
 *
 * Use this to avoid firing expensive side-effects (e.g. API calls,
 * score recalculations) on every keystroke in a text field.
 *
 * @template T
 * @param {T} value - The value to debounce
 * @param {number} [delayMs=400] - Debounce delay in milliseconds
 * @returns {T} The debounced value
 */
export function useDebounce(value, delayMs = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
