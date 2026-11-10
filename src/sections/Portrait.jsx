import { useEffect, useRef, useState } from 'react';
import { profile } from '../content/profile';

// The settled hero. public/images/portrait.webp is the full-resolution photo (1362×762, no border, no screenshot bars).
// To swap in a different one, overwrite that file; keep about 16:9 framing with the person right of centre.
const SRC = `${import.meta.env.BASE_URL}images/portrait.webp`;
const W = 1362; // the photo's own pixel grid: the annotation is drawn in it, so it stays on the subject at any crop (see .p1-frame)
const H = 762;

/**
  Sits above the 3D stage and is uncovered left to right once the car has left the frame.
  The picture dissolves into the page's asphalt on every side so it reads as the scene the car just drove out of, not a card.
*/
export default function Portrait({ revealed, fast, parallax, settled, paused, annotated }) {
  const [loaded, setLoaded] = useState(false);
  const move = useRef();

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
      <div className={`hero-portrait ${revealed ? 'is-revealed' : ''} ${fast ? 'is-fast' : ''} ${loaded ? 'is-loaded' : ''}`}>
        <div className="portrait-move" ref={move}>
          <img
            src={SRC}
            alt={`${profile.legal.given} ${profile.legal.family} (${profile.first} ${profile.last}) in sunglasses and a leather jacket, leaning on a black BMW coupe on a wet, neon-lit street at night, tyre smoke drifting behind`}
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
          {/* The personal annotation lives in the photo's own transformed box, so parallax, push-in and cropping carry it with the picture. */}
          <div className={`p1-frame ${annotated ? 'is-on' : ''} ${fast ? 'is-fast' : ''}`}>
            <p className="p1-text">
              I am <b>P1</b>
            </p>
            <svg className="p1-line" viewBox={`0 0 ${W} ${H}`} aria-hidden="true" focusable="false">
              <path className="p1-leader" d="M1120 152 Q1078 180 1027 183" pathLength="1" />
              <path className="p1-head" d="M1037 187.6 L1027 183 L1036.4 177.3" />
            </svg>
          </div>
        </div>
        <i className="portrait-light" aria-hidden="true" />
        <i className="portrait-fade" aria-hidden="true" />
      </div>
      <i className={`hero-mist ${revealed ? 'is-revealed' : ''} ${fast ? 'is-fast' : ''}`} aria-hidden="true" />
    </>
  );
}
