import { useCallback, useId, useRef, useState } from 'react';
import { profile, roleCount } from '../content/profile';
import Arrow from '../components/Arrow';
import RoleList from '../components/RoleList';
import useEscape from '../components/useEscape';

export default function HeroOverlay({ showUi, ended, canReplay, onSkip, onReplay }) {
  const [open, setOpen] = useState(false);
  const trigger = useRef();
  const panelId = useId();

  // Escape closes the panel and hands focus back to the control that opened it
  const close = useCallback(() => {
    setOpen(false);
    trigger.current?.focus();
  }, []);
  useEscape(open, close);

  return (
    <div className={`hero-ui ${showUi ? 'is-on' : ''}`}>
      <div className={`hero-plate ${open ? 'is-open' : ''}`}>
        <div className="hero-copy">
          <span className="eyebrow">S0 / Ignition</span>
          <h1 id="hero-title" className="hero-name">
            <span>{profile.legal.given}</span> <span className="hero-name-last">{profile.legal.family}</span>
            <span className="sr-only">: {profile.role}</span>
          </h1>
          <p className="hero-alias">
            Known as <b>{profile.first} {profile.last}</b>
          </p>
          <p className="hero-tagline">{profile.tagline}</p>
          <div className="row">
            <a className="btn btn-primary btn-ig" href="#garage">Enter the Garage</a>
            <a className="btn btn-secondary btn-ig" href={profile.github} target="_blank" rel="noreferrer">
              GitHub
              <Arrow />
            </a>
          </div>
          <button ref={trigger} className="roles-trigger" type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
            <i className="roles-dot" aria-hidden="true" />
            {profile.status}
            <span className="roles-count">{roleCount} roles</span>
            <i className="roles-caret" aria-hidden="true" />
          </button>
        </div>
        <div id={panelId} className="hero-roles" inert={!open}>
          <div className="hero-roles-scroll" data-lenis-prevent tabIndex={0} role="region" aria-label="Roles I am open to">
            <RoleList />
          </div>
        </div>
      </div>
      {(!ended || canReplay) && (
        <button className="btn btn-ghost hero-skip" type="button" onClick={ended ? onReplay : onSkip}>
          {ended ? (
            'Replay intro'
          ) : (
            <>
              Skip intro
              <Arrow kind="right" />
            </>
          )}
        </button>
      )}
      <a className="scroll-cue" href="#pit-crew">
        Scroll to drive
        <Arrow kind="down" />
      </a>
    </div>
  );
}
