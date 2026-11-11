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
import Shutters from './components/Shutters';
import SceneGuard from './components/SceneGuard';
import { clock, T } from './three/timeline';
import { hasWebGL } from './three/webgl';
import { scroller } from './scroller';
import { MAX_WAIT_MS } from './components/ignition';
import { installPointerFx } from './components/pointerFx';

const Stage = lazy(() => import('./three/Stage'));
const loadNight = () => import('./three/NightCircuit');
const NightCircuit = lazy(loadNight);
const ORDER = ['driftStart', 'reveal', 'title', 'ui', 'end'];

export default function App({ reduceMotion }) {
  const [beat, setBeat] = useState(clock.t >= T.end ? 'end' : null);
  const [heroActive, setHeroActive] = useState(true);
  const [skipped, setSkipped] = useState(false); // a skipped opening uncovers the portrait quickly
  const [covered, setCovered] = useState(clock.t >= T.end); // the portrait fully hides the 3D stage, so stop rendering it
  const [sceneFailed, setSceneFailed] = useState(false);
  const [run, setRun] = useState(0); // a replay mounts a fresh ignition gauge
  const [titleReady, setTitleReady] = useState(false); // the 3D name has its geometry and is drawing
  const [titleFailed, setTitleFailed] = useState(false); // it could not start (or never became ready): the heading's own styled text is shown instead
  const [ready, setReady] = useState(false); // the stage has its car and its clock is running (stays true across a replay)
  const hero = useRef();
  const timers = useRef([]);
  const reached = (b) => beat && ORDER.indexOf(beat) >= ORDER.indexOf(b);
  // The road scene is built while the opening is still playing, so it is ready to take over the moment the opening resolves. It mounts as
  // soon as the stage's clock starts (under the ignition gauge, before the car is in frame): compiling its shaders is a hitch of about a
  // second, and it must not land in the middle of the drift. It draws every frame once the opening has ended (or the visitor has scrolled
  // on), and the hero opens onto it. Scrolling on early must never reveal an empty page.
  const webgl = hasWebGL() && !sceneFailed;
  const showNight = webgl && (ready || reached('reveal') || !heroActive);
  const nightLive = reached('end') || !heroActive;
  useEffect(() => {
    if ((ready || beat) && webgl && !reduceMotion) loadNight();
  }, [ready, beat, webgl, reduceMotion]);

  useEffect(installPointerFx, []);

  // The 3D name is the visible title only once it is ready. If it has not become ready 1.5 s after its beat has arrived (its code
  // failed to load, or the context was refused), the real heading is shown with its static styling and the 3D layer is dropped.
  const title3d = !reduceMotion && hasWebGL() && !titleFailed;
  const titleBeat = Boolean(reached('title'));
  useEffect(() => {
    if (!title3d || titleReady || !titleBeat) return;
    const id = setTimeout(() => setTitleFailed(true), 1500);
    return () => clearTimeout(id);
  }, [title3d, titleReady, titleBeat]);
  const titleMode = !title3d ? 'html' : titleReady ? '3d' : 'pending';

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
  // A stage that fails to load, or a download that stalls, must never leave the visitor behind the opening. The guard only covers the wait
  // for the stage to start: once its clock runs, a slow machine plays the opening slowly instead of being thrown out of it.
  const [stageFailed, setStageFailed] = useState(false);
  useEffect(() => {
    if (reduceMotion || ready) return;
    // no WebGL at all: there is no opening to wait for, so land on the settled page now (the plain title and every action are already there)
    const id = setTimeout(skip, hasWebGL() ? MAX_WAIT_MS : 0);
    return () => clearTimeout(id);
  }, [ready, reduceMotion, skip]);
  // Replay and Skip are one button in one place, so a double click on Replay would replay and then skip at once: a Skip within the first
  // moments of a replay is ignored. (The guards above call skip() directly and are not affected.)
  const replayedAt = useRef(-1e9);
  const userSkip = useCallback(() => {
    if (performance.now() - replayedAt.current > 700) skip();
  }, [skip]);
  const replay = () => {
    if (performance.now() - replayedAt.current < 700) return; // rapid repeated input restarts the opening once, not several times
    replayedAt.current = performance.now();
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
          {!reduceMotion && hasWebGL() && (
            <SceneGuard
              onFail={() => {
                setStageFailed(true);
                skip();
              }}
            >
              <Suspense fallback={null}>
                <Stage active={heroActive && !covered} onBeat={onBeat} onReady={() => setReady(true)} />
              </Suspense>
            </SceneGuard>
          )}
          <Portrait revealed={reached('reveal')} fast={skipped} parallax={!reduceMotion} settled={reached('end') && !reduceMotion} paused={!heroActive} ended={reached('end')} marked={reached('ui')} />
          {!reduceMotion && <Loader key={run} release={skipped} />}
          <HeroOverlay showTitle={reached('title')} showUi={reached('ui')} fast={skipped} ended={reached('end')} canReplay={!reduceMotion && hasWebGL() && !stageFailed} onSkip={userSkip} onReplay={replay} title3d={title3d} titleMode={titleMode} onTitleReady={() => setTitleReady(true)} onTitleFail={() => setTitleFailed(true)} run={run} />
        </section>
        <PitCrew />
        <Track reduceMotion={reduceMotion} flat={!webgl} />
        <Garage />
        <Finish />
      </main>
    </>
  );
}
