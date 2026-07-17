import { useEffect, useState } from 'react';

export function useProctor(active, onViolation) {
  const [violations, setViolations] = useState(0);

  useEffect(() => {
    if (!active) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setViolations(prev => {
          const next = prev + 1;
          if (onViolation) onViolation(next);
          return next;
        });
      }
    };

    const handleBlur = () => {
      setViolations(prev => {
        const next = prev + 1;
        if (onViolation) onViolation(next);
        return next;
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [active, onViolation]);

  return violations;
}
