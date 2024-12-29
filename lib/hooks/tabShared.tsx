'use client';

import { useEffect, useState } from 'react';

export default function useTabSharedState<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => {
    const storagedState = localStorage.getItem(key) || sessionStorage.getItem(key) || JSON.stringify(initial);
    if(storagedState === 'undefined') return initial;
    return storagedState;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
    sessionStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  useEffect(
    // NOTE : storage event only triggered when value is changed by other tab.
    function SyncSessionStorage() {
      const onStorageEvent = (e: StorageEvent) => {
        if (e.key === key && e.oldValue !== e.newValue) {
          if (e.newValue === null) sessionStorage.removeItem(key);
          else sessionStorage.setItem(key, e.newValue);
        }
      };

      window.addEventListener('storage', onStorageEvent);
      return () => window.removeEventListener('storage', onStorageEvent);
    },
    [key],
  );

  return [state, setState] as const;
}
