import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import Nav from './components/Nav';
import Loader from './components/Loader';
import HeroOverlay from './sections/HeroOverlay';
import Portrait from './sections/Portrait';
import PitCrew from './sections/PitCrew';
import Track from './sections/Track';
import Garage from './sections/Garage';
import Finish from './sections/Finish';
import { clock, T } from './three/timeline';
import { hasWebGL } from './three/webgl';

const Stage = lazy(() => import('./three/Stage'));
const NightCircuit = lazy(() => import('./three/NightCircuit'));
const ORDER = ['driftStart', 'reveal', 'ui', 'end'];

export default function App({ reduceMotion }) {
  const [beat, setBeat] = useState(clock.t >= T.end ? 'end' : null);
  const [heroActive, setHeroActive] = useState(true);
  const [skipped, setSkipped] = useState(false); // a skipped opening uncovers the portrait quickly
  const [covered, setCovered] = useState(clock.t >= T.end); // the portrait fully hides the 3D stage, so stop rendering it
  const hero = useRef();
  const timers = useRef([]);
  const reached = (b) => beat && ORDER.indexOf(beat) >= ORDER.indexOf(b);

  // Smooth scroll (off for reduced motion)
  useEffect(() => {
    if (reduceMotion) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.12 });
    return () => lenis.destroy();
  }, [reduceMotion]);

  // Stop rendering the 3D scene when the hero is off screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setHeroActive(e.isIntersecting), { threshold: 0.02 });
    io.observe(hero.current);
    return () => io.disconnect();
  }, []);

  const onBeat = useCallback((b) => {
    setBeat(b);
    if (b === null) {
      timers.current.forEach(clearTimeout);
      timers.current = [];
      setCovered(false);
    } else if (b === 'reveal') {
      timers.current.push(setTimeout(() => setCovered(true), T.revealLen * 1000 + 250));
    } else if (b === 'end') {
      timers.current.push(setTimeout(() => setCovered(true), 700)); // a skip lands here directly
    }
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const skip = () => {
    setSkipped(true);
    clock.t = T.end;
  };
  const replay = () => {
    setSkipped(false);
    setBeat(null);
    setCovered(false);
    clock.t = 0;
    clock.resetId++;
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav visible={reached('ui')} />
      {/* The persistent night road starts once the opening has settled. No WebGL: the plain page background stays. */}
      {reached('end') && hasWebGL() && (
        <Suspense fallback={null}>
          <NightCircuit still={reduceMotion} />
        </Suspense>
      )}
      <main id="main">
        <section className="hero" id="ignition" ref={hero} aria-labelledby="hero-title">
          {/* Reduced motion: no drift, no dial, no 3D. The settled hero is on screen immediately. */}
          {!reduceMotion && (
            <Suspense fallback={null}>
              <Stage active={heroActive && !covered} onBeat={onBeat} />
            </Suspense>
          )}
          <Portrait revealed={reached('reveal')} fast={skipped} parallax={!reduceMotion} settled={reached('end') && !reduceMotion} paused={!heroActive} />
          {!reduceMotion && <Loader />}
          <HeroOverlay showUi={reached('ui')} ended={reached('end')} canReplay={!reduceMotion} onSkip={skip} onReplay={replay} />
        </section>
        <PitCrew />
        <Track reduceMotion={reduceMotion} />
        <Garage />
        <Finish />
      </main>
    </>
  );
}
