import { useId, useState } from 'react';
import { profile, toolkit } from '../content/profile';
import { evidenceProject } from '../content/projects';
import Arrow from '../components/Arrow';
import SectionHeader from '../components/SectionHeader';
import useReveal from '../components/useReveal';
import useMedia from '../components/useMedia';

// Each tool, with the real projects it was used in. The names come from content/profile.js, the descriptions from content/projects.js.
const TOOLS = toolkit.map((g) => ({
  group: g.group,
  tools: g.tools.map(([name, used]) => ({ name, projects: used.split(', ').map(evidenceProject).filter(Boolean) })),
}));

function Evidence({ tool, id }) {
  const n = tool.projects.length;
  return (
    <div id={id} className="bench-evidence">
      <p className="bench-evidence-label">
        {tool.name} <span>· used in {n} {n === 1 ? 'project' : 'projects'}</span>
      </p>
      <ul>
        {tool.projects.map((p) => (
          <li key={p.slug}>
            <h4>{p.title}</h4>
            <p>{p.pitch}</p>
            <a className="evidence" href={p.repo} target="_blank" rel="noreferrer">
              Open the code
              <Arrow />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PitCrew() {
  const ref = useReveal();
  const [sel, setSel] = useState('Python');
  const inline = useMedia('(max-width: 720px)'); // on a phone the evidence opens under the row that was tapped
  const evId = useId();
  const current = TOOLS.flatMap((g) => g.tools).find((t) => t.name === sel);
  return (
    <section className="section" id="pit-crew" aria-labelledby="pit-crew-title" ref={ref}>
      <SectionHeader id="pit-crew-title" sector="S1 / Pit Crew" title="The" accent="driver." />
      <article className="credential surface reveal" aria-label="Driver profile">
        <div className="credential-id">
          <div className="licence-plate" aria-hidden="true">
            <span>SA</span>
            <b>07</b>
          </div>
          <div className="credential-head">
            <div className="licence-no">LICENCE NO. SA-007 · CLASS AI</div>
            <h3>
              {profile.first} {profile.last}
            </h3>
          </div>
          <dl>
            {profile.licence.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="credential-intro">
          {profile.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </article>
      <h3 className="sub reveal">Toolkit</h3>
      <p className="bench-hint reveal">Select a tool to see where it was used.</p>
      <div className="toolkit surface reveal">
        {TOOLS.map((g) => (
          <div key={g.group} className="toolgroup">
            <div className="toolgroup-label">
              <span>{g.group}</span>
              <span className="toolgroup-count">{String(g.tools.length).padStart(2, '0')}</span>
            </div>
            <ul>
              {g.tools.map((t) => {
                const on = t.name === sel;
                return (
                  <li key={t.name} className={on ? 'is-on' : ''}>
                    <button className="tool" type="button" aria-pressed={on} aria-controls={evId} onClick={() => setSel(t.name)}>
                      <span className="tool-name">{t.name}</span>
                      <span className="tool-n">{t.projects.length}</span>
                    </button>
                    {inline && on && <Evidence tool={t} id={evId} />}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      {!inline && <Evidence key={current.name} tool={current} id={evId} />}
      <p className="sr-only" role="status">
        {current.name}: used in {current.projects.map((p) => p.title).join(', ')}.
      </p>
    </section>
  );
}
