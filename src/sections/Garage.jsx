import { useState } from 'react';
import { projects } from '../content/projects';
import SectionHeader from '../components/SectionHeader';
import useReveal from '../components/useReveal';
import Arrow from '../components/Arrow';

const BADGE = { PRO: 'badge-pro', COMPETITION: 'badge-competition', SPORT: 'badge-sport', STREET: 'badge-street' };

function Art({ kind, stat }) {
  const grid = 'M0 50H320M0 100H320M0 150H320M80 0V200M160 0V200M240 0V200';
  const shapes = {
    gate: <><path className="a" d="M20 150 L90 150 L120 60 L160 60 L190 120 L300 120" /><circle className="c" cx="160" cy="60" r="5" /><text x="168" y="52">GATE 8/8</text></>,
    curve: <><path className="b" d="M20 170 C 80 160, 110 90, 160 80 S 250 40, 300 30" /><text x="24" y="40">ACC {stat}</text></>,
    bars: <>{[60, 110, 40, 140, 90, 70].map((h, i) => <rect key={i} className={i === 3 ? 'cf' : 'bf'} x={40 + i * 42} y={180 - h} width="22" height={h} />)}</>,
    shield: <><path className="a" d="M160 30 L230 55 L222 120 C 214 150, 190 168, 160 178 C 130 168, 106 150, 98 120 L90 55 Z" /><path className="b" d="M130 105 L152 128 L195 80" /></>,
    grid: <>{Array.from({ length: 24 }, (_, i) => <rect key={i} className={[3, 9, 14, 20].includes(i) ? 'cf' : 'gf'} x={44 + (i % 8) * 30} y={40 + Math.floor(i / 8) * 42} width="22" height="30" />)}</>,
    pulse: <><path className="a" d="M10 110 L90 110 L110 60 L130 160 L150 90 L165 110 L310 110" /><text x="24" y="40">EVERY 5 MIN</text></>,
  };
  return (
    <svg className="art" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path className="g" d={grid} />
      {shapes[kind]}
    </svg>
  );
}

export default function Garage() {
  const ref = useReveal();
  const [all, setAll] = useState(false);
  const featured = projects.filter((p) => p.cls === 'PRO');
  const rest = projects.filter((p) => p.cls !== 'PRO');

  return (
    <section className="section" id="garage" aria-labelledby="garage-title" ref={ref}>
      <SectionHeader id="garage-title" sector="S3 / The Garage" title="Every build" accent="in the bay." intro="Six flagship builds up front, the rest of the fleet behind them. Each bay opens the code on GitHub." />
      <div className="bays">
        {featured.map((p, i) => (
          <a key={p.slug} className="bay" href={p.repo} target="_blank" rel="noreferrer" style={{ '--r': `${(i % 3) - 1}deg` }}>
            <div className="bay-media">
              <span className={`badge ${BADGE[p.cls]} bay-badge`}>{p.cls}</span>
              <span className="bay-num">BAY {String(i + 1).padStart(2, '0')}</span>
              <Art kind={p.art} stat={p.stat} />
              <span className="bay-note">Schematic, not a screenshot</span>
            </div>
            <div className="bay-body">
              <span className="bay-area">{p.area}</span>
              <h3 className="bay-title">{p.title}</h3>
              <p className="bay-pitch">{p.pitch}</p>
              <div className="bay-foot">
                <span className="bay-repo">GitHub · {p.repo.split('/').pop()}</span>
                <span className="bay-action">
                  Open the code
                  <Arrow />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <div className="fleet">
        <button className={`garage-toggle ${all ? 'is-open' : ''}`} type="button" aria-expanded={all} onClick={() => setAll((v) => !v)}>
          <span className="garage-toggle-label">{all ? 'Hide the full garage' : `Full garage (${rest.length} more)`}</span>
          <Arrow kind="down" />
        </button>
        {all && (
          <ul className="fleet-list">
            {rest.map((p) => (
              <li key={p.slug}>
                <span className={`badge ${BADGE[p.cls]}`}>{p.cls}</span>
                <a className="fleet-link" href={p.repo} target="_blank" rel="noreferrer">
                  {p.title}
                  <Arrow />
                </a>
                <span className="fleet-area">{p.area}</span>
                <p>{p.pitch}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
