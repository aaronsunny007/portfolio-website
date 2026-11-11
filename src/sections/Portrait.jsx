import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { profile } from '../content/profile';
import { markGeometry } from '../components/portraitMark';

const NARROW = '(max-width: 720px), (max-aspect-ratio: 1/1)'; // the same query that swaps the portrait to its phone crop (index.css)

// The settled hero. public/images/portrait.webp is the full-resolution photo (1362×762, no border, no screenshot bars).
// To swap in a different one, overwrite that file; keep about 16:9 framing with the person right of centre.
const SRC = `${import.meta.env.BASE_URL}images/portrait.webp`;

/**
  Sits above the 3D stage and is uncovered left to right once the car has left the frame.
  The picture dissolves into the page's asphalt on every side so it reads as the scene the car just drove out of, not a card.
*/
export default function Portrait({ revealed, fast, parallax, settled, paused, ended, marked }) {
  const [loaded, setLoaded] = useState(false);
  const [geo, setGeo] = useState(null); // where the P1 callout goes, in the photo box's own pixels
  const move = useRef();
  const root = useRef();

  // The callout is placed from the photo's real crop (box size and object-position), and again whenever the box changes size.
  useLayoutEffect(() => {
    const el = root.current;
    const hero = el.closest('.hero');
    const run = () => {
      if (!el.offsetWidth) return;
      const cs = getComputedStyle(el);
      const g = markGeometry({ w: el.offsetWidth, h: el.offsetHeight }, parseFloat(cs.getPropertyValue('--fx')), parseFloat(cs.getPropertyValue('--fy')), {
        narrow: window.matchMedia(NARROW).matches,
        limitX: hero.clientWidth - el.offsetLeft,
      });
      setGeo((old) => (old && JSON.stringify(old) === JSON.stringify(g) ? old : g));
    };
    run();
    const ro = new ResizeObserver(run);
    ro.observe(el);
    ro.observe(hero);
    return () => ro.disconnect();
  }, []);

  // a few pixels of pointer parallax, in the same spirit as the 3D camera's (off for reduced motion)
  useEffect(() => {
    if (!parallax) return;
    const hero = move.current.closest('.hero');
    const el = move.current;
    const onMove = (e) => {
      const r = hero.getBoundingClientRect();
      el.style.setProperty('--px', (((e.clientX - r.left) / r.width - 0.5) * 2).toFixed(3));
      el.style.setProperty('--py', (((e.clientY - r.top) / r.height - 0.5) * 2).toFixed(3));
    };
    hero.addEventListener('pointermove', onMove, { passive: true });
    return () => hero.removeEventListener('pointermove', onMove);
  }, [parallax]);

  return (
    <>
      <div ref={root} className={`hero-portrait ${revealed ? 'is-revealed' : ''} ${ended ? 'is-ended' : ''} ${fast ? 'is-fast' : ''} ${loaded ? 'is-loaded' : ''}`}>
        <div className="portrait-move" ref={move}>
          <img
            src={SRC}
            alt={`${profile.first} ${profile.last} beside a black BMW on a wet, neon-lit street.`}
            width="1362"
            height="762"
            decoding="async"
            fetchPriority="high"
            onLoad={() => setLoaded(true)}
            ref={(img) => img?.complete && img.naturalWidth && setLoaded(true)}
          />
          {/* Ambient loop: soft-masked copies of this same photo drift over its own smoke and wet road. Starts once the opening has settled; none of it exists in reduced motion. */}
          <div className={`portrait-ambient ${settled ? 'is-on' : ''} ${paused ? 'is-paused' : ''}`} style={{ '--src': `url(${SRC})` }} aria-hidden="true">
            <i className="amb amb-smoke-l"><b /></i>
            <i className="amb amb-smoke-r"><b /></i>
            <i className="amb amb-wet"><b /></i>
            <i className="amb-glow" />
          </div>
          {/* P1: marks him in the photograph. It lives in the photo's own box, so it moves with the photo (parallax and settle) and stays on the shoulder. Decoration only. */}
          {geo && (
            <div className={`p1-mark ${marked ? 'is-on' : ''}`} aria-hidden="true">
              <svg className="p1-svg" viewBox={`0 0 ${geo.w} ${geo.h}`} focusable="false">
                <path className="p1-line" d={geo.line} pathLength="1" />
                <polygon className="p1-head" points={geo.head} />
              </svg>
              <b className="p1-tab" style={{ left: geo.tab.x, top: geo.tab.y, width: geo.tab.w, height: geo.tab.h, fontSize: Math.round(geo.tab.h * 0.58) }}>
                P1
              </b>
            </div>
          )}
        </div>
        <i className="portrait-light" aria-hidden="true" />
        <i className="portrait-fade" aria-hidden="true" />
      </div>
      <i className={`hero-mist ${revealed ? 'is-revealed' : ''} ${fast ? 'is-fast' : ''}`} aria-hidden="true" />
    </>
  );
}
