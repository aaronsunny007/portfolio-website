import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import Nav from './components/Nav';
import Loader from './components/Loader';
import HeroOverlay from './sections/HeroOverlay';
import PitCrew from './sections/PitCrew';
import Track from './sections/Track';
import Garage from './sections/Garage';
import Finish from './sections/Finish';
import { clock, T } from './three/timeline';

const Stage = lazy(() => import('./three/Stage'));
const ORDER = ['flare', 'driftStart', 'name', 'walkStart', 'ui', 'end'];

export default function App({ reduceMotion }) {
  const [beat, setBeat] = useState(clock.t >= T.end ? 'end' : null);
  const [heroActive, setHeroActive] = useState(true);
  const hero = useRef();
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

  const onBeat = useCallback((b) => setBeat(b), []);
  const skip = () => {
    clock.t = T.end;
  };
  const replay = () => {
    clock.t = 0;
    clock.resetId++;
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav visible={reached('ui')} />
      <main id="main">
        <section className="hero" id="ignition" ref={hero} aria-labelledby="hero-title">
          <Suspense fallback={null}>
            <Stage active={heroActive} onBeat={onBeat} />
          </Suspense>
          <Loader />
          <HeroOverlay showUi={reached('ui')} ended={reached('end')} onSkip={skip} onReplay={replay} />
        </section>
        <PitCrew />
        <Track />
        <Garage />
        <Finish />
      </main>
    </>
  );
}
