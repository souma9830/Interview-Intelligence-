import { useCallback, useEffect, useState } from 'react';

const DRAFT_KEY = 'camsense_setup_draft';

export function useSetupDraft(initialDraft) {
  const [draft, setDraft] = useState(initialDraft);
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DRAFT_KEY);
      if (stored) {
        setDraft({ ...initialDraft, ...JSON.parse(stored) });
        setRestored(true);
      }
    } catch (err) {
      console.warn('Unable to restore interview setup draft:', err);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch (err) {
      console.warn('Unable to persist interview setup draft:', err);
    }
  }, [draft]);

  const clearDraft = useCallback(() => {
    localStorage.removeItem(DRAFT_KEY);
    setDraft(initialDraft);
    setRestored(false);
  }, [initialDraft]);

  return { draft, setDraft, restored, clearDraft };
}
