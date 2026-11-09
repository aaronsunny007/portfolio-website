import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { view } from '../three/journey';

gsap.registerPlugin(ScrollTrigger);

const SECTIONS = ['pit-crew', 'track', 'garage', 'finish'];
const wiper = { v: 0 }; // its own object: a tween on the shared view would also stop the car's movement

/**
 * A short vertical transition when a new section arrives: a band closes in from the top and bottom edges, then opens again.
 * It is brief (under a second), it only covers the edges, the road stays visible between the bands, and it never
 * touches scrolling. Off for reduced motion.
 */
export default function Shutters({ reduceMotion }) {
  const top = useRef();
  const bottom = useRef();

  useEffect(() => {
    if (reduceMotion) return;
    const bars = [top.current, bottom.current];
    const mounted = performance.now();
    let last = 0;
    const ctx = gsap.context(() => {
      const tl = gsap
        .timeline({ paused: true })
        .fromTo(bars, { scaleY: 0 }, { scaleY: 1, duration: 0.2, ease: 'power2.in' })
        .to(bars, { scaleY: 0, duration: 0.55, ease: 'power3.out' });
      const fire = () => {
        const now = performance.now();
        // not while the page is still settling, and not again straight away if a jump crosses several sections
        if (now - mounted < 1200 || now - last < 1400) return;
        last = now;
        tl.restart();
        gsap.fromTo(wiper, { v: 0 }, { v: 1, duration: 1.1, ease: 'power1.inOut', overwrite: true, onUpdate: () => (view.wipe = wiper.v), onComplete: () => (view.wipe = 0) }); // the wipers make one pass
      };
      SECTIONS.forEach((id) => {
        const el = document.getElementById(id);
        if (el) ScrollTrigger.create({ trigger: el, start: 'top 62%', onEnter: fire, onEnterBack: fire });
      });
    });
    return () => {
      ctx.revert();
      view.wipe = 0;
    };
  }, [reduceMotion]);

  return (
    <div className="shutters" aria-hidden="true">
      <i className="shutter shutter-top" ref={top} />
      <i className="shutter shutter-bottom" ref={bottom} />
    </div>
  );
}
