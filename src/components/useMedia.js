import { useSyncExternalStore } from 'react';

// Live result of a media query, for layouts that must move one element (not duplicate it) between two places.
export default function useMedia(query) {
  return useSyncExternalStore(
    (cb) => {
      const m = window.matchMedia(query);
      m.addEventListener('change', cb);
      return () => m.removeEventListener('change', cb);
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}
