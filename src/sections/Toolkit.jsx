import { useEffect, useId, useRef, useState } from 'react';
import { KINDS } from '../content/toolkit';
import { view as scene } from '../three/journey';
import { scroller } from '../scroller';
import { KIT, start, pickGroup, pickTool, pickProject, pickResult, toggleOpen, view, search, countLabel } from '../components/toolkit';
import Arrow from '../components/Arrow';
import useMedia from '../components/useMedia';

const said = (t) => `${t.name} selected. ${t.count} related ${t.count === 1 ? 'project' : 'projects'}.`;
const heard = (n) => (n === 0 ? 'No matching tools or projects.' : n === 1 ? '1 matching tool or project.' : `${n} matching tools and projects.`);

export default function Toolkit() {
  const [st, setSt] = useState(start);
  const [q, setQ] = useState('');
  const [note, setNote] = useState(''); // the selection announcement; empty until the visitor chooses something
  const id = useId();
  const root = useRef();
  const out = useRef();
  const input = useRef();
  const touched = useRef(false); // only a deliberate choice may move the page, never the first render
  const refocus = useRef(null); // a search result unmounts when chosen, so focus goes to the tool it selected
  const stacked = useMedia('(max-width: 900px)');
  const v = view(KIT, st);
  const found = q.trim() ? search(KIT, q) : null;

  // Stacked layout: if the evidence sits behind the cockpit after a choice, bring it into the clear space, gently.
  useEffect(() => {
    if (!touched.current || !stacked || !out.current) return;
    const r = out.current.getBoundingClientRect();
    const clear = window.innerHeight - (scene.dashH || 0) - 16;
    const dy = Math.min(r.bottom - clear, r.top - 88);
    if (dy > 1) scroller.to(window.scrollY + dy, window.matchMedia('(prefers-reduced-motion: reduce)').matches, 0.6);
  }, [st, stacked]);
  useEffect(() => {
    if (!refocus.current) return;
    root.current.querySelector(`[data-tool="${refocus.current}"]`)?.focus({ preventScroll: true });
    refocus.current = null;
  }, [st]);

  const choose = (next) => {
    touched.current = true;
    setSt(next);
    setNote(said(KIT.byId[next.tool]));
  };
  const toggle = () => {
    const next = toggleOpen(KIT, st);
    setSt(next);
    if (next.tool !== st.tool) setNote(said(KIT.byId[next.tool])); // collapsing moved the selection off a hidden tool
  };
  const pickFound = (tool) => {
    refocus.current = tool.id;
    setQ('');
    choose(pickResult(KIT, st, tool.id));
  };
  const keys = (e) => {
    if (e.key === 'Escape' && q) { e.preventDefault(); setQ(''); return; }
    const list = [...root.current.querySelectorAll('.tk-results button')];
    if (!list.length || (e.key !== 'ArrowDown' && e.key !== 'ArrowUp')) return;
    const at = list.indexOf(document.activeElement);
    const to = e.key === 'ArrowDown' ? at + 1 : at - 1;
    e.preventDefault();
    (to < 0 ? input.current : list[Math.min(to, list.length - 1)]).focus();
  };

  const toolButton = (t) => (
    <li key={t.id}>
      <button className="tool" type="button" data-tool={t.id} aria-pressed={t.id === st.tool} aria-controls={`${id}-out`} onClick={() => choose(pickTool(st, t.id))}>
        <i className="contact" aria-hidden="true" />
        <span className="tool-text">
          <span className="tool-name">{t.name}</span>
          <span className="tool-type">{t.type}</span>
        </span>
        <span className="tool-n" aria-label={`${t.count} ${t.count === 1 ? 'project' : 'projects'}`}>{t.count}</span>
      </button>
    </li>
  );

  return (
    <div className="tk reveal" ref={root}>
      <p className="tk-eyebrow">The setup</p>
      <h3 className="sub">Under the hood.</h3>
      <p className="bench-hint">Pick a system. Choose a tool. See what I built with it.</p>
      <div className="tk-groups" role="group" aria-label="Choose a toolkit department">
        {KIT.groups.map((g) => (
          <button key={g.id} className="grp" type="button" aria-pressed={g.id === st.group} onClick={() => choose(pickGroup(KIT, st, g.id))}>
            <span className="grp-name">{g.name}</span>
            <span className="grp-sub">{g.subtitle}</span>
          </button>
        ))}
      </div>
      <div className="tk-main">
        <div className="tk-pick surface">
          <div className="tk-search">
            <label htmlFor={`${id}-q`}>Find a tool or project</label>
            <div className="tk-field">
              <input ref={input} id={`${id}-q`} type="search" autoComplete="off" spellCheck="false" placeholder="Python, Warden, Docker…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={keys} />
              {q && (
                <button className="tk-clear" type="button" aria-label="Clear search" onClick={() => { setQ(''); input.current.focus(); }}>
                  Clear
                </button>
              )}
            </div>
          </div>
          {found ? (
            <div className="tk-tools">
              {found.total === 0 ? (
                <p className="tk-empty">Nothing matches that search. Try a tool or project name.</p>
              ) : (
                <ul className="tk-results" aria-label="Search results" onKeyDown={keys}>
                  {found.items.map(({ tool: t, context }) => (
                    <li key={t.id}>
                      <button className="tool" type="button" onClick={() => pickFound(t)}>
                        <span className="tool-text">
                          <span className="tool-name">{t.name}</span>
                          <span className="tool-type">{KIT.byGroup[t.group].name} · {context ? `in ${context}` : `${t.count} ${t.count === 1 ? 'project' : 'projects'}`}</span>
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {found.total > found.items.length && <p className="tk-empty">Showing {found.items.length} of {found.total} matches. Narrow your search to find a specific tool.</p>}
            </div>
          ) : (
            <>
              <div className="tk-tools" id={`${id}-tools`} role="group" aria-label={`Choose a tool in ${v.group.name}`}>
                {v.sections ? (
                  v.sections.map((s) => (
                    <div key={s.id} className="tk-sec">
                      <h5>{s.label}</h5>
                      <ul>{s.tools.map(toolButton)}</ul>
                    </div>
                  ))
                ) : (
                  <ul>{v.shown.map(toolButton)}</ul>
                )}
              </div>
              <button className="bay-more tk-more" type="button" aria-expanded={v.expanded} aria-controls={`${id}-tools`} onClick={toggle}>
                {v.expanded ? 'Show fewer tools' : 'Show all tools'}
                {!v.expanded && <span className="tk-more-n">· {v.hiddenCount} more</span>}
                <Arrow kind="down" />
              </button>
            </>
          )}
        </div>
        <section id={`${id}-out`} ref={out} key={v.tool.id} className="tk-out" aria-labelledby={`${id}-h`}>
          <header>
            <p className="tk-eyebrow">{v.group.name} / {v.tool.type}</p>
            <h4 id={`${id}-h`} className="tk-title">{v.tool.name}</h4>
            <p className="tk-count">{countLabel(v.tool)}</p>
          </header>
          <div>
            <h5 className="tk-h">In the garage</h5>
            <ul className="tk-projects">
              {v.tool.uses.map((x) => (
                <li key={x.project.slug}>
                  <button className="tk-proj" type="button" aria-pressed={x.project.slug === v.use.project.slug} onClick={() => setSt(pickProject(st, x.project.slug))}>
                    <span className="tk-proj-title">{x.project.title}</span>
                    <span className="tk-kind">{KINDS[x.kind]}</span>
                  </button>
                  {x.project.repo && (
                    <a className="evidence" href={x.project.repo} target="_blank" rel="noreferrer" aria-label={`View the ${x.project.title} repository on GitHub`}>
                      View code
                      <Arrow />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div className="tk-how">
            <h5 className="tk-h">My use of it</h5>
            <p className="tk-note">{v.use.note}</p>
            <p className="tk-about">
              <span>{v.use.project.title} · {v.use.project.area}</span>
              {v.use.project.pitch}
            </p>
          </div>
        </section>
      </div>
      <p className="sr-only" role="status">{found ? heard(found.total) : ''}</p>
      <p className="sr-only" role="status">{note}</p>
    </div>
  );
}
