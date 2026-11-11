import { useEffect, useRef, useState } from 'react';
import { useProgress } from '@react-three/drei';
import { drawTach } from './tach';
import { SWEEP_END, needleAt, nextPercent } from './ignition';

const SIZE = 260; // css px; the face is authored at 96 radius, so this is 1.3x
const DPR = 2;

/**
 * The ignition gauge. Two independent things: the needle makes one bounded sweep on a fixed clock and settles at idle, and the
 * loading readout only ever rises. The gauge leaves once, when the sweep has finished and loading is complete (or has failed,
 * or `release` says the visitor skipped), never earlier and never twice.
 */
export default function Loader({ release }) {
  const cv = useRef();
  const [rpm, setRpm] = useState(0);
  const [pct, setPct] = useState(0);
  const [swept, setSwept] = useState(false);
  const [settled, setSettled] = useState(false); // loading finished, or nothing started within the grace period
  const [gone, setGone] = useState(false);

  // the one sweep
  useEffect(() => {
    let raf;
    const start = performance.now();
    const f = (now) => {
      const t = (now - start) / 1000;
      setRpm(needleAt(t));
      if (t < SWEEP_END) raf = requestAnimationFrame(f);
      else setSwept(true);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, []);

  // real progress, from the loading manager's store, folded into a number that cannot fall
  useEffect(() => {
    const read = (s) => {
      setPct((p) => nextPercent(p, s.progress));
      if (s.errors.length || (!s.active && s.progress >= 100)) setSettled(true);
    };
    const unsub = useProgress.subscribe(read);
    // a cached or already-finished load announces nothing: after a short grace period with no activity, there is nothing to wait for
    const grace = setTimeout(() => {
      const s = useProgress.getState();
      if (!s.active) {
        setPct(100);
        setSettled(true);
      }
    }, 1200);
    queueMicrotask(() => read(useProgress.getState()));
    return () => {
      unsub();
      clearTimeout(grace);
    };
  }, []);

  const done = (swept && settled) || release;
  useEffect(() => {
    if (!done) return;
    const id = setTimeout(() => setGone(true), 700);
    return () => clearTimeout(id);
  }, [done]);

  // the face is the dashboard's own tachometer
  useEffect(() => {
    const draw = () => {
      const g = cv.current?.getContext('2d');
      if (!g) return;
      g.setTransform(DPR, 0, 0, DPR, 0, 0);
      g.clearRect(0, 0, SIZE, SIZE);
      drawTach(g, SIZE / 2, SIZE / 2 - 8, rpm, SIZE / 200);
    };
    draw();
    document.fonts?.ready.then(draw);
  }, [rpm]);

  if (gone) return null;
  const shown = done ? 100 : Math.floor(pct);
  return (
    <div className={`loader ${done ? 'is-done' : ''}`} role="status" aria-busy={!done} aria-label={done ? 'Portfolio ready.' : 'Loading portfolio.'}>
      <canvas ref={cv} width={SIZE * DPR} height={SIZE * DPR} style={{ width: SIZE, height: SIZE }} aria-hidden="true" />
      <div className="loader-line" aria-hidden="true">
        <span className="loader-label">{done ? 'Ready.' : 'Ignition'}</span>
        <span className="loader-read">{String(shown).padStart(3, '0')}</span>
      </div>
      <i className="loader-bar" aria-hidden="true">
        <b style={{ transform: `scaleX(${(shown / 100).toFixed(3)})` }} />
      </i>
    </div>
  );
}
