import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { milestones } from '../content/profile';
import { checkpointT, pointAt, journey } from '../three/circuit';
import { hasWebGL } from '../three/webgl';
import Circuit2D from './Circuit2D';

const Circuit3D = lazy(() => import('../three/Circuit3D'));
const N = milestones.length;
const POINTS = milestones.map((_, i) => pointAt(checkpointT(i, N)));
const WIDE = '(min-width: 721px)';

// The journey as a race circuit. The list is the real interface; the map is a picture of it.
export default function CircuitMap({ reduceMotion }) {
  const root = useRef();
  const [sel, setSel] = useState(reduceMotion ? N - 1 : 0);
  const [touched, setTouched] = useState(false);
  const [visible, setVisible] = useState(false);
  const [wide, setWide] = useState(() => window.matchMedia(WIDE).matches);
  const auto = useRef(null);
  const started = useRef(false);
  const use3D = wide && !reduceMotion && hasWebGL();

  useEffect(() => {
    const mq = window.matchMedia(WIDE);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // The marker follows the selected corner
  useEffect(() => {
    const to = checkpointT(sel, N);
    if (reduceMotion) {
      journey.t = to;
      return;
    }
    const tw = gsap.to(journey, { t: to, duration: 0.9, ease: 'power2.inOut', overwrite: true });
    return () => tw.kill();
  }, [sel, reduceMotion]);

  // Drive through the corners once, the first time the map is on screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      setVisible(e.isIntersecting);
      if (e.isIntersecting && !started.current && !reduceMotion) {
        started.current = true;
        let i = 0;
        auto.current = setInterval(() => {
          i += 1;
          setSel(i);
          if (i >= N - 1) clearInterval(auto.current);
        }, 1100);
      }
    }, { threshold: 0.35 });
    io.observe(root.current);
    return () => {
      io.disconnect();
      clearInterval(auto.current);
    };
  }, [reduceMotion]);

  const select = (i) => {
    clearInterval(auto.current);
    started.current = true; // a visitor's own choice is never overridden by the intro drive
    setTouched(true);
    setSel(i);
  };

  const m = milestones[sel];
  return (
    <div className="circuit reveal" ref={root}>
      <div className="circuit-map" aria-hidden="true">
        {use3D ? (
          <Suspense fallback={<Circuit2D points={POINTS} sel={sel} onSelect={select} />}>
            <Circuit3D points={POINTS} sel={sel} onSelect={select} visible={visible} />
          </Suspense>
        ) : (
          <Circuit2D points={POINTS} sel={sel} onSelect={select} />
        )}
      </div>

      <article className="circuit-card" aria-live={touched ? 'polite' : 'off'}>
        <div className="circuit-card-meta">
          <span>CORNER {String(sel + 1).padStart(2, '0')} / {String(N).padStart(2, '0')}</span>
          <span className="circuit-card-when">{m.year ?? m.tag}</span>
        </div>
        <h3>{m.title}</h3>
        <p>{m.text}</p>
      </article>

      <ol className="circuit-steps" aria-label="Career corners, in order">
        {milestones.map((s, i) => (
          <li key={s.title}>
            <button type="button" className={`step ${i <= sel ? 'is-reached' : ''}`} aria-current={i === sel ? 'step' : undefined} onClick={() => select(i)}>
              <span className="step-n">{String(i + 1).padStart(2, '0')}</span>
              <span className="step-t">{s.title}</span>
              <span className="step-y">{s.year ?? s.tag}</span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
