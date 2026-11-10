import { useCallback, useId, useRef, useState } from 'react';
import { profile, roleCount } from '../content/profile';
import Arrow from '../components/Arrow';
import RoleList from '../components/RoleList';
import useEscape from '../components/useEscape';

/**
  The hero's words, set straight over the photograph: no panel. Reading order is the visual order (name, alias, focus, signature, actions).
  The reveal is CSS keyed on `.is-on` (see styles/hero.css), so re-renders never restart it; a replay removes and re-adds the class.
*/
export default function HeroOverlay({ showUi, fast, ended, canReplay, onSkip, onReplay }) {
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
    <div className={`hero-ui ${showUi ? 'is-on' : ''} ${fast ? 'is-fast' : ''} ${open ? 'is-open' : ''}`}>
      <div className="hero-copy">
        <h1 id="hero-title" className="hero-name">
          <span className="hero-name-ink">
            <span className="hero-name-first">{profile.legal.given}</span> <span className="hero-name-last">{profile.legal.family}</span>
          </span>
          <i className="hero-stroke" aria-hidden="true" />
          <span className="sr-only">: {profile.role}</span>
        </h1>
        <p className="hero-alias">
          Known as <b>{profile.first} {profile.last}</b>
        </p>
        <p className="hero-focus">{profile.focus}</p>
        <p className="hero-tagline">{profile.tagline}</p>
        <div className="hero-actions">
          <a className="btn btn-primary btn-ig hero-go" href="#garage">
            Enter the Garage
            <Arrow />
          </a>
          <div className="hero-roles-wrap">
            <button ref={trigger} className="roles-trigger" type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
              <i className="roles-dot" aria-hidden="true" />
              {profile.statusTitle}
              <Arrow />
            </button>
            <div id={panelId} className="hero-roles" inert={!open}>
              <div className="hero-roles-scroll" data-lenis-prevent tabIndex={0} role="region" aria-label="Roles I am open to">
                <p className="roles-total">{roleCount} roles I am open to</p>
                <RoleList />
              </div>
            </div>
          </div>
          {/* The nav carries GitHub top right; it hides that key at phone widths, so this quiet link stands in for it there only. */}
          <a className="btn btn-ghost hero-gh" href={profile.github} target="_blank" rel="noreferrer">
            GitHub
            <Arrow />
          </a>
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
