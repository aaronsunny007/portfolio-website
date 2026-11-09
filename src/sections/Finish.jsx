import { useCallback, useId, useRef, useState } from 'react';
import { profile, roleCount } from '../content/profile';
import { view } from '../three/journey';
import { scroller } from '../scroller';
import SectionHeader from '../components/SectionHeader';
import ContactActions from '../components/ContactActions';
import RoleList from '../components/RoleList';
import useEscape from '../components/useEscape';
import useReveal from '../components/useReveal';

export default function Finish() {
  const ref = useReveal();
  const [open, setOpen] = useState(false);
  const trigger = useRef();
  const panel = useRef();
  const panelId = useId();
  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);
  useEscape(open, close);

  // The panel opens here, not up in the hero. Once it has finished unrolling, bring it into the clear space between the nav and the cockpit.
  const reveal = (e) => {
    if (!open || e.target !== e.currentTarget) return;
    const r = panel.current.getBoundingClientRect();
    const clear = window.innerHeight - (view.dashH || 0) - 24;
    const dy = Math.min(r.bottom - clear, r.top - 88); // its top must also stay below the nav
    if (dy > 1) scroller.to(window.scrollY + dy, window.matchMedia('(prefers-reduced-motion: reduce)').matches, 0.8);
  };

  const hasEmail = Boolean(profile.email);
  return (
    <section className="section finish" id="finish" aria-labelledby="finish-title" ref={ref}>
      <div className="stopline" aria-hidden="true" />
      <SectionHeader
        id="finish-title"
        sector="S4 / Finish Line"
        title="Let’s build something that"
        accent="holds the line."
        intro={`${profile.status} for AI engineering, AI security and MLOps. ${hasEmail ? 'Email is the quickest way in.' : 'The code is on GitHub.'}`}
      />
      <div className="reveal">
        <ContactActions />
        <div className="finish-roles-bar">
          <button ref={trigger} className="btn btn-secondary roles-btn" type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
            <i className="roles-dot" aria-hidden="true" />
            {profile.status}
            <span className="roles-count">{roleCount} roles</span>
            <i className={`roles-caret ${open ? 'is-open' : ''}`} aria-hidden="true" />
          </button>
          <span className="finish-meta">{profile.location}</span>
        </div>
        <div id={panelId} className={`finish-roles ${open ? 'is-open' : ''}`} inert={!open} ref={panel} onTransitionEnd={reveal}>
          <div className="finish-roles-inner surface">
            <header className="finish-roles-head">
              <div>
                <h3>Roles I am open to</h3>
                <p>{profile.location} · {profile.status}</p>
              </div>
              <button className="btn btn-ghost" type="button" onClick={close}>
                Close
              </button>
            </header>
            <div className="finish-roles-list" data-lenis-prevent tabIndex={0} role="region" aria-label="Roles I am open to">
              <RoleList />
            </div>
            <ContactActions />
          </div>
        </div>
      </div>
      <footer className="footer">
        <span>
          © 2026 {profile.first} {profile.last}
        </span>
        <span>Not affiliated with BMW AG. Built with three.js, React Three Fiber and Lenis.</span>
      </footer>
    </section>
  );
}
