import { useEffect, useRef, useState } from 'react';
import { profile } from '../content/profile';

// The settled hero. public/images/portrait.webp is the full-resolution photo (1362×762, no border, no screenshot bars).
// To swap in a different one, overwrite that file; keep about 16:9 framing with the person right of centre.
const SRC = `${import.meta.env.BASE_URL}images/portrait.webp`;

/**
  Sits above the 3D stage and is uncovered left to right once the car has left the frame.
  The picture dissolves into the page's asphalt on every side so it reads as the scene the car just drove out of, not a card.
*/
export default function Portrait({ revealed, fast, parallax }) {
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
        </div>
        <i className="portrait-light" aria-hidden="true" />
        <i className="portrait-fade" aria-hidden="true" />
      </div>
      <i className={`hero-mist ${revealed ? 'is-revealed' : ''} ${fast ? 'is-fast' : ''}`} aria-hidden="true" />
    </>
  );
}
