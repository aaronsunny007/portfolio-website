import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { pathD, pointAt, journey } from '../three/circuit';

// The 2D track. Used on phones, with reduced motion, without WebGL, and while the 3D map loads.
// Decorative: the milestone list next to it is the accessible version.
const START = pointAt(0);
const nx = -Math.sin((START.a * Math.PI) / 180) * 3.2;
const ny = Math.cos((START.a * Math.PI) / 180) * 3.2;

export default function Circuit2D({ points, sel, onSelect }) {
  const lit = useRef();
  const car = useRef();

  useEffect(() => {
    let last = -1;
    const tick = () => {
      const t = journey.t;
      if (t === last) return;
      last = t;
      lit.current.style.strokeDasharray = `${t} 2`; // style, not attribute: the CSS rule would win over an attribute
      const p = pointAt(t);
      car.current.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)}) rotate(${p.a.toFixed(1)})`);
    };
    tick();
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  return (
    <svg viewBox="0 0 100 60" preserveAspectRatio="xMidYMid meet" className="circuit-2d">
      <path d={pathD} className="c2-edge" />
      <path d={pathD} className="c2-road" />
      <path d={pathD} className="c2-centre" />
      <path ref={lit} d={pathD} pathLength="1" className="c2-lit" />
      <line x1={START.x - nx} y1={START.y - ny} x2={START.x + nx} y2={START.y + ny} className="c2-grid" />
      <g ref={car} className="c2-car">
        <rect x="-1.5" y="-0.8" width="3" height="1.6" rx="0.4" />
        <rect x="-1.5" y="-0.8" width="0.6" height="1.6" className="c2-tail" />
      </g>
      {points.map((p, i) => (
        <g key={i} transform={`translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`} className={`c2-cp ${i <= sel ? 'is-reached' : ''} ${i === sel ? 'is-on' : ''}`} onClick={() => onSelect(i)}>
          <circle r="5" className="c2-hit" />
          <circle r="3.3" className="c2-dot" />
          <text className="c2-n" textAnchor="middle" dy="0.36em">{i + 1}</text>
        </g>
      ))}
    </svg>
  );
}
