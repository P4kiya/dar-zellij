import { useSyncExternalStore } from 'react';
import { MEDIA } from '@/lib/motion';

/** False on the server and in the first client render, then the live value. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery(MEDIA.reduced);
