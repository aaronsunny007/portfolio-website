import { useId, useState } from 'react';
import { projects } from '../content/projects';
import SectionHeader from '../components/SectionHeader';
import useReveal from '../components/useReveal';
import Arrow from '../components/Arrow';

const BADGE = { PRO: 'badge-pro' };

// One small flow diagram per flagship, drawn from what the project description says. Conceptual, never a screenshot or a measurement.
const Node = ({ x, y, w, h, hot, label }) => (
  <>
    <rect className={hot ? 'nodea' : 'node'} x={x} y={y} width={w} height={h} rx="3" />
    {label && <text x={x + w / 2} y={y + h + 16}>{label}</text>}
  </>
);
const Arr = ({ d }) => <path className="ln" d={d} />;

function Art({ kind }) {
  const shapes = {
    // Warden: a request passes eight gates on its way from the agent to the tool server
    gate: (
      <>
        <Node x={16} y={78} w={52} h={44} label="AGENT" />
        <Node x={252} y={78} w={52} h={44} label="MCP SERVER" />
        {Array.from({ length: 8 }, (_, i) => (
          <path key={i} className={i === 7 ? 'a' : 'dim'} d={`M${96 + i * 15} 66 V134`} />
        ))}
        <Arr d="M68 100 H252" />
        <circle className="cf" cx="146" cy="100" r="4" />
        <text x="152" y="156">8 GATES</text>
      </>
    ),
    // Ledger: a report is retrieved from, an answer is cited, and a calculator rechecks the numbers
    curve: (
      <>
        <Node x={16} y={64} w={52} h={64} label="REPORT" />
        <path className="dim" d="M26 82H58M26 94H58M26 106H48" />
        <circle className="node" cx="148" cy="96" r="20" />
        <path className="ln" d="M162 111 L176 126" />
        <text x="148" y="148">RETRIEVE</text>
        <Node x={232} y={64} w={72} h={64} hot label="CITED ANSWER" />
        <path className="dim" d="M242 82H294M242 94H282" />
        <text x="268" y="116" style={{ fill: 'var(--signal-red)' }}>[1] ✓</text>
        <Arr d="M68 96 H126 M168 96 H232" />
      </>
    ),
    // Financial-NRF: the score barely moves between a correct and a wrong source
    bars: (
      <>
        <path className="dim" d="M40 150 H280" />
        <rect className="bf" x="84" y="66" width="52" height="84" />
        <rect className="cf" x="184" y="72" width="52" height="78" />
        <path className="dim" strokeDasharray="4 4" d="M84 66 H236" />
        <text x="110" y="168">CORRECT SOURCE</text>
        <text x="210" y="168">WRONG SOURCE</text>
        <text x="160" y="50">RELIABILITY SCORE</text>
      </>
    ),
    // AEGIS: spot the campaign, write the rule, prove it is safe, deploy it
    shield: (
      <>
        <Arr d="M56 100 H264" />
        {['ATTACK', 'RULE', 'VERIFY', 'DEPLOY'].map((t, i) => (
          <g key={t}>
            <circle className={i === 0 ? 'nodea' : 'node'} cx={56 + i * 69.3} cy="100" r="14" />
            <text x={56 + i * 69.3} y="140">{t}</text>
          </g>
        ))}
      </>
    ),
    // Red Team: versioned attacks go to a judge, and the verdict gates the release in CI
    grid: (
      <>
        {Array.from({ length: 9 }, (_, i) => (
          <rect key={i} className={i === 4 ? 'cf' : 'gf'} x={20 + (i % 3) * 22} y={64 + Math.floor(i / 3) * 22} width="16" height="16" />
        ))}
        <text x="52" y="150">ATTACKS</text>
        <Arr d="M92 96 H134" />
        <circle className="node" cx="160" cy="96" r="22" />
        <text x="160" y="100">AI</text>
        <text x="160" y="150">JUDGE</text>
        <Arr d="M184 96 H226" />
        <path className="nodea" d="M262 70 L288 96 L262 122 L236 96 Z" />
        <text x="262" y="150">CI GATE</text>
      </>
    ),
    // PulseCity: three lines polled every five minutes, landing in one lakehouse
    pulse: (
      <>
        {[['TUBE', 62], ['DLR', 100], ['OVERGROUND', 138]].map(([t, y]) => (
          <g key={t}>
            <path className="a" d={`M20 ${y} L70 ${y} L82 ${y - 14} L96 ${y + 12} L108 ${y} L190 ${y}`} />
            <text x="20" y={y - 10} style={{ textAnchor: 'start' }}>{t}</text>
          </g>
        ))}
        <Node x={212} y={50} w={92} h={100} />
        <text x="258" y="104">LAKEHOUSE</text>
      </>
    ),
  };
  return (
    <svg className="art" viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path className="g" d="M0 50H320M0 100H320M0 150H320M80 0V200M160 0V200M240 0V200" />
      {shapes[kind]}
    </svg>
  );
}

export default function Garage() {
  const ref = useReveal();
  const listId = useId();
  const [all, setAll] = useState(false);
  const featured = projects.filter((p) => p.cls === 'PRO');
  const rest = projects.filter((p) => p.cls !== 'PRO');

  return (
    <section className="section" id="garage" aria-labelledby="garage-title" ref={ref}>
      <SectionHeader
        id="garage-title"
        sector="S3 / The Garage"
        title="Every build"
        accent="in the bay."
        intro={`${featured.length} flagship builds up front, the other ${rest.length} in the full garage. Each one opens its code on GitHub.`}
      />
      <div className="bays">
        {featured.map((p, i) => (
          <a key={p.slug} className="bay" href={p.repo} target="_blank" rel="noreferrer">
            <div className="bay-media">
              <span className={`badge ${BADGE[p.cls] ?? ''} bay-badge`}>{p.cls}</span>
              <span className="bay-num">BAY {String(i + 1).padStart(2, '0')}</span>
              <Art kind={p.art} />
            </div>
            <p className="bay-cap">{p.flow}</p>
            <div className="bay-body">
              <span className="bay-area">{p.area}</span>
              <h3 className="bay-title">{p.title}</h3>
              <p className="bay-pitch">{p.pitch}</p>
              <div className="bay-foot">
                <span className="bay-repo">{p.repo.split('/').pop()}</span>
                <span className="bay-action">
                  Open the code
                  <Arrow />
                </span>
              </div>
            </div>
          </a>
        ))}
      </div>
      <p className="bays-note">Diagrams are conceptual sketches of how each build works, not screenshots.</p>
      <div className="fleet">
        <button className={`garage-toggle ${all ? 'is-open' : ''}`} type="button" aria-expanded={all} aria-controls={listId} onClick={() => setAll((v) => !v)}>
          <span>{all ? `Hide the full garage (${rest.length})` : `Full garage (${rest.length} more)`}</span>
          <Arrow kind="down" />
        </button>
        <ul id={listId} className="fleet-list surface" hidden={!all}>
          {rest.map((p) => (
            <li key={p.slug}>
              <span className={`badge ${BADGE[p.cls] ?? ''}`}>{p.cls}</span>
              <a className="fleet-link" href={p.repo} target="_blank" rel="noreferrer">
                {p.title}
                <Arrow />
              </a>
              <span className="fleet-area">{p.area}</span>
              <p>{p.pitch}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
