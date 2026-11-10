import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';
import Nav from './components/Nav';
import Loader from './components/Loader';
import HeroOverlay from './sections/HeroOverlay';
import Portrait from './sections/Portrait';
import PitCrew from './sections/PitCrew';
import Track from './sections/Track';
import Garage from './sections/Garage';
import Finish from './sections/Finish';
import Shutters from './components/Shutters';
import { clock, T } from './three/timeline';
import { hasWebGL } from './three/webgl';
import { scroller } from './scroller';
import { MAX_WAIT_MS } from './components/ignition';
import { installPointerFx } from './components/pointerFx';

// If the night scene cannot start (no context, or its code fails to load) the career falls back to a plain list.
class SceneGuard extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const Stage = lazy(() => import('./three/Stage'));
const loadNight = () => import('./three/NightCircuit');
const NightCircuit = lazy(loadNight);
const ORDER = ['driftStart', 'reveal', 'ui', 'end'];

export default function App({ reduceMotion }) {
  const [beat, setBeat] = useState(clock.t >= T.end ? 'end' : null);
  const [heroActive, setHeroActive] = useState(true);
  const [skipped, setSkipped] = useState(false); // a skipped opening uncovers the portrait quickly
  const [covered, setCovered] = useState(clock.t >= T.end); // the portrait fully hides the 3D stage, so stop rendering it
  const [sceneFailed, setSceneFailed] = useState(false);
  const [run, setRun] = useState(0); // a replay mounts a fresh ignition gauge
  const hero = useRef();
  const timers = useRef([]);
  const reached = (b) => beat && ORDER.indexOf(beat) >= ORDER.indexOf(b);
  // The road scene is built while the opening is still playing, so it is ready to take over the moment the opening resolves: its code is
  // fetched with the first beat and it mounts at the zip reveal, drawing one frame to compile. It draws every frame once the opening has
  // ended (or the visitor has scrolled on), and the hero opens onto it. Scrolling on early must never reveal an empty page.
  const webgl = hasWebGL() && !sceneFailed;
  const showNight = webgl && (reached('reveal') || !heroActive);
  const nightLive = reached('end') || !heroActive;
  useEffect(() => {
    if (beat && webgl && !reduceMotion) loadNight();
  }, [beat, webgl, reduceMotion]);

  useEffect(installPointerFx, []);

  // Smooth scroll (off for reduced motion)
  useEffect(() => {
    if (reduceMotion) return;
    const lenis = new Lenis({ autoRaf: true, lerp: 0.12 });
    scroller.lenis = lenis;
    return () => {
      scroller.lenis = null;
      lenis.destroy();
    };
  }, [reduceMotion]);

  // Stop rendering the 3D scene when the hero is off screen
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => setHeroActive(e.isIntersecting), { threshold: 0.02 });
    io.observe(hero.current);
    return () => io.disconnect();
  }, []);

  // The opening's stage keeps drawing until its own clock reaches the end: stopping it on a real-time timer froze that clock short of
  // the end beat, so the end never arrived and the road scene was never started. A skip still has the quick wipe to finish first.
  const skippedRef = useRef(false);
  const onBeat = useCallback((b) => {
    setBeat(b);
    clearTimeout(timers.current[0]);
    if (b === null) setCovered(false);
    else if (b === 'end') timers.current[0] = setTimeout(() => setCovered(true), skippedRef.current ? 600 : 0);
  }, []);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Skip lands on the settled page straight away. It does not wait for the stage's clock, which has not started if the car is still
  // downloading (or never will, if it fails): the beat is announced from here as well.
  const skip = useCallback(() => {
    skippedRef.current = true;
    setSkipped(true);
    clock.t = T.end;
    onBeat('end');
  }, [onBeat]);
  // A stage that fails to load, or a download that stalls, must never leave the visitor behind the opening.
  const [stageFailed, setStageFailed] = useState(false);
  useEffect(() => {
    if (reduceMotion || beat) return;
    const id = setTimeout(skip, MAX_WAIT_MS);
    return () => clearTimeout(id);
  }, [beat, reduceMotion, skip]);
  const replay = () => {
    skippedRef.current = false;
    setSkipped(false);
    setBeat(null);
    setCovered(false);
    setRun((n) => n + 1);
    clock.t = 0;
    clock.resetId++;
  };

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Nav visible={reached('ui')} />
      {/* The persistent night road starts once the opening has settled. No WebGL: the plain page background stays. */}
      {showNight && (
        <SceneGuard onFail={() => setSceneFailed(true)}>
          <Suspense fallback={null}>
            <NightCircuit still={reduceMotion} show={nightLive} />
          </Suspense>
        </SceneGuard>
      )}
      <Shutters reduceMotion={reduceMotion} />
      <main id="main">
        <section className={`hero ${covered && nightLive && webgl ? 'is-open' : ''}`} id="ignition" ref={hero} aria-labelledby="hero-title">
          {/* Reduced motion: no drift, no dial, no 3D. The settled hero is on screen immediately. */}
          {!reduceMotion && (
            <SceneGuard
              onFail={() => {
                setStageFailed(true);
                skip();
              }}
            >
              <Suspense fallback={null}>
                <Stage active={heroActive && !covered} onBeat={onBeat} />
              </Suspense>
            </SceneGuard>
          )}
          <Portrait revealed={reached('reveal')} fast={skipped} parallax={!reduceMotion} settled={reached('end') && !reduceMotion} paused={!heroActive} />
          {!reduceMotion && <Loader key={run} release={skipped} />}
          <HeroOverlay showUi={reached('ui')} ended={reached('end')} canReplay={!reduceMotion && !stageFailed} onSkip={skip} onReplay={replay} />
        </section>
        <PitCrew />
        <Track reduceMotion={reduceMotion} flat={!webgl} />
        <Garage />
        <Finish />
      </main>
    </>
  );
}
