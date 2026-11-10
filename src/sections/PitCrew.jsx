import { useEffect, useId, useRef, useState } from 'react';
import { profile } from '../content/profile';
import { view } from '../three/journey';
import { scroller } from '../scroller';
import { buildGroups, START, pickGroup, pickTool, current } from '../components/toolkit';
import Arrow from '../components/Arrow';
import SectionHeader from '../components/SectionHeader';
import useReveal from '../components/useReveal';
import useMedia from '../components/useMedia';

// Each tool, with the real projects it was used in. The names come from content/profile.js, the descriptions from content/projects.js.
const GROUPS = buildGroups();
const pad = (n) => String(n).padStart(2, '0');

export default function PitCrew() {
  const ref = useReveal();
  const [sel, setSel] = useState(START);
  const evId = useId();
  const out = useRef();
  const touched = useRef(false); // only a deliberate choice may move the page, never the first render
  const stacked = useMedia('(max-width: 900px)');
  const group = GROUPS[sel.g];
  const tool = current(GROUPS, sel);
  const n = tool.projects.length;

  // Stacked layout: if the result sits behind the cockpit after a choice, bring it into the clear space, gently.
  useEffect(() => {
    if (!touched.current || !stacked || !out.current) return;
    const r = out.current.getBoundingClientRect();
    const clear = window.innerHeight - (view.dashH || 0) - 16;
    const dy = Math.min(r.bottom - clear, r.top - 88);
    if (dy > 1) scroller.to(window.scrollY + dy, window.matchMedia('(prefers-reduced-motion: reduce)').matches, 0.6);
  }, [sel, stacked]);
  const choose = (next) => {
    touched.current = true;
    setSel(next);
  };

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
      <p className="bench-hint reveal">Choose a group, then a tool, to see the projects it was used in.</p>
      <div className="console reveal">
        <div className="console-pick surface">
          <div className="console-groups" role="group" aria-label="Toolkit groups">
            {GROUPS.map((g, i) => (
              <button key={g.group} className="grp" type="button" aria-pressed={i === sel.g} onClick={() => choose(pickGroup(i))}>
                <i className="contact" aria-hidden="true" />
                <span className="grp-name">{g.group}</span>
                <span className="grp-n">{pad(g.tools.length)}</span>
              </button>
            ))}
          </div>
          <ul className="console-tools" aria-label={`${group.group} tools`}>
            {group.tools.map((t, i) => (
              <li key={t.name}>
                <button className="tool" type="button" aria-pressed={i === sel.t} aria-controls={evId} onClick={() => choose(pickTool(sel, i))}>
                  <i className="contact" aria-hidden="true" />
                  <span className="tool-name">{t.name}</span>
                  <span className="tool-n" aria-label={`${t.projects.length} ${t.projects.length === 1 ? 'project' : 'projects'}`}>
                    {t.projects.length}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
        <section id={evId} ref={out} key={`${group.group}/${tool.name}`} className="console-out" aria-label={`Projects that used ${tool.name}`}>
          <p className="console-label">
            {tool.name} <span>· used in {n} {n === 1 ? 'project' : 'projects'}</span>
          </p>
          <ul>
            {tool.projects.map((p) => (
              <li key={p.slug}>
                <div className="ev-top">
                  <h4>{p.title}</h4>
                  <a className="evidence" href={p.repo} target="_blank" rel="noreferrer" aria-label={`Open the ${p.title} code on GitHub`}>
                    Open code
                    <Arrow />
                  </a>
                </div>
                <span className="ev-area">{p.area}</span>
                <p>{p.pitch}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>
      <p className="sr-only" role="status">
        {tool.name}: used in {tool.projects.map((p) => p.title).join(', ')}.
      </p>
    </section>
  );
}
