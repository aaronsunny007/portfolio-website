import { useId, useState } from 'react';
import { projects } from '../content/projects';
import SectionHeader from '../components/SectionHeader';
import useReveal from '../components/useReveal';
import Arrow from '../components/Arrow';
import { FlagshipArt, Vignette } from './ProjectArt';

const pad = (n) => String(n).padStart(2, '0');

// One build on the bench: a compact header, the drawing beside a short explanation, one evidence line, and a disclosure for the rest.
// Choosing a build and opening its code are separate controls; the code link never sits inside the disclosure.
function Display({ p, id }) {
  const [run, setRun] = useState(0);
  const [open, setOpen] = useState(false);
  const moreId = useId();
  return (
    <article id={id} className={`bay ac-${p.accent}`} aria-label={`${p.title}, selected build`}>
      <header className="bay-head">
        <div className="bay-id">
          <span className="bay-area">{p.area}</span>
          <h3 className="bay-title">{p.title}</h3>
        </div>
        <a className="btn btn-primary btn-edge" href={p.repo} target="_blank" rel="noreferrer" aria-label={`Open the ${p.title} code on GitHub`}>
          Open code
          <Arrow />
        </a>
      </header>
      <div className="bay-main">
        <figure className="bay-art" aria-label={p.flow}>
          <div className="bay-art-svg">
            <FlagshipArt kind={p.art} run={run} />
          </div>
          <figcaption className="bay-art-bar">
            <span className="bay-tag">Conceptual demonstration</span>
            <button className="bay-replay" type="button" onClick={() => setRun((r) => r + 1)} aria-label={`Replay the ${p.title} demonstration`}>
              Replay
            </button>
          </figcaption>
        </figure>
        <div className="bay-copy">
          <p className="bay-pitch">{p.pitch}</p>
          <p className="bay-evidence">
            <span>Evidence</span>
            {p.facts[p.lead ?? 0]}
          </p>
        </div>
      </div>
      <div className="bay-foot">
        <button className="bay-more" type="button" aria-expanded={open} aria-controls={moreId} onClick={() => setOpen((o) => !o)}>
          Explore the build
          <Arrow kind="down" />
        </button>
        <span className="bay-repo">{p.repo.split('/').pop()}</span>
      </div>
      <div id={moreId} className="bay-detail" data-open={open} inert={!open}>
        <div className="bay-detail-in">
          <ul aria-label="Evidence from the project description">
            {p.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <p>
            {p.flow}.<small>Conceptual diagram, not a screenshot and not a live result.</small>
          </p>
        </div>
      </div>
    </article>
  );
}

export default function Garage() {
  const ref = useReveal();
  const listId = useId();
  const bayId = useId();
  const [all, setAll] = useState(false);
  const featured = projects.filter((p) => p.cls === 'PRO');
  const rest = projects.filter((p) => p.cls !== 'PRO');
  const [sel, setSel] = useState(featured[0].slug);
  const at = Math.max(0, featured.findIndex((p) => p.slug === sel));
  const active = featured[at];

  return (
    <section className="section section-garage" id="garage" aria-labelledby="garage-title" ref={ref}>
      <SectionHeader
        id="garage-title"
        sector="S3 / The Garage"
        title="Every build"
        accent="in the bay."
        intro={`${featured.length} flagship builds to inspect, the other ${rest.length} in the full garage. Each one opens its code on GitHub.`}
      />
      <div className="bay-layout reveal">
        <ul className="bay-rail" aria-label="Flagship builds">
          {featured.map((p, i) => (
            <li key={p.slug}>
              <button className="bay-pick" data-tilt type="button" aria-pressed={i === at} aria-controls={bayId} onClick={() => setSel(p.slug)}>
                <span className="bay-plate">
                  <span className="bay-pick-n">{pad(i + 1)}</span>
                  <span className="bay-pick-name">{p.title}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
        <Display key={active.slug} p={active} id={bayId} />
      </div>
      <div className="fleet">
        <button className={`garage-toggle ${all ? 'is-open' : ''}`} type="button" aria-expanded={all} aria-controls={listId} onClick={() => setAll((v) => !v)}>
          <span className="gt-face">
            {all ? 'Hide full garage' : 'Full garage'}
            <span className="gt-count">{all ? `${rest.length} shown` : `${rest.length} more`}</span>
            <Arrow kind="down" />
          </span>
        </button>
        <ul id={listId} className="paddock" hidden={!all}>
          {rest.map((p) => (
            <li key={p.slug} className={`pad ac-${p.accent}`}>
              <div className="pad-face">
                <div className="pad-art">
                  <Vignette kind={p.vg} />
                </div>
                <div className="pad-body">
                  <span className="pad-class">
                    {p.cls}
                    <i aria-hidden="true" />
                    {p.area}
                  </span>
                  <h4 className="pad-title">{p.title}</h4>
                  <p>{p.pitch}</p>
                  <a className="btn btn-secondary btn-sm btn-edge" href={p.repo} target="_blank" rel="noreferrer" aria-label={`Open the ${p.title} code on GitHub`}>
                    Open code
                    <Arrow />
                  </a>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
