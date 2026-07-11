import { useEffect, useState } from 'react';

export function useAutoSave(data, key, saveInterval = 5000) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  useEffect(() => {
    if (!data) return;

    const timer = setTimeout(() => {
      setIsSaving(true);
      try {
        localStorage.setItem(key, JSON.stringify(data));
        setLastSaved(new Date());
      } catch (error) {
        console.error('[AutoSave] Failed to save draft:', error.message);
      } finally {
        setTimeout(() => setIsSaving(false), 800);
      }
    }, saveInterval);

    return () => clearTimeout(timer);
  }, [data, key, saveInterval]);

  return { isSaving, lastSaved };
}
