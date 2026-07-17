import { useCallback } from 'react';
import { VALID_TABS, TABS } from '../constants/tabs';

export function useTabValidation(currentTab, hasToken) {
  const validateTab = useCallback((tab) => {
    if (!VALID_TABS.has(tab)) {
      return hasToken ? TABS.HOME : TABS.LANDING;
    }
    return tab;
  }, [hasToken]);

  return { validateTab };
}
