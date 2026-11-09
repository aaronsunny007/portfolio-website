import { useEffect } from 'react';

// While `open`, Escape calls `close`. Callers hand focus back to the control that opened the panel.
export default function useEscape(open, close) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && close();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);
}
