import { useEffect, useState } from 'react';
import { useProgress } from '@react-three/drei';

// Rev counter: sweeps to the redline and back, then follows real loading progress.
export default function Loader() {
  const { progress, active } = useProgress();
  const [sweep, setSweep] = useState(0);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let raf;
    const start = performance.now();
    const f = (now) => {
      const t = (now - start) / 1000;
      if (t < 0.45) setSweep(1 - Math.pow(1 - t / 0.45, 3));
      else if (t < 0.9) setSweep(Math.pow(1 - (t - 0.45) / 0.45, 3));
      else return setSweep(-1);
      raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, []);

  const done = !active && progress >= 100 && sweep === -1;
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setGone(true), 700);
    return () => clearTimeout(id);
  }, [done]);
  if (gone) return null;

  const v = sweep >= 0 ? sweep : progress / 100;
  const angle = 135 + 270 * v;
  return (
    <div className={`loader ${done ? 'is-done' : ''}`} role="status" aria-label={`Loading ${Math.round(progress)} percent`}>
      <svg viewBox="0 0 200 200" width="180" height="180" aria-hidden="true">
        <path d="M 43.4 156.6 A 80 80 0 1 1 156.6 156.6" className="loader-arc" />
        <path d="M 179 87.5 A 80 80 0 0 1 156.6 156.6" className="loader-red" />
        <line x1="100" y1="100" x2="100" y2="34" className="loader-needle" transform={`rotate(${angle + 90} 100 100)`} />
        <circle cx="100" cy="100" r="7" className="loader-hub" />
      </svg>
      <span className="loader-read">{Math.round(sweep >= 0 ? sweep * 100 : progress)}</span>
      <span className="loader-label">Ignition</span>
    </div>
  );
}
