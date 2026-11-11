import { lazy, Suspense, useCallback, useId, useRef, useState } from 'react';
import { FaLinkedinIn } from 'react-icons/fa';
import { profile, rolesPanel } from '../content/profile';
import Arrow from '../components/Arrow';
import RoleList, { RolesFoot } from '../components/RoleList';
import ContactActions from '../components/ContactActions';
import useEscape from '../components/useEscape';
import SceneGuard from '../components/SceneGuard';

const TitleStage = lazy(() => import('../three/TitleStage'));

/**
  The hero's words, set straight over the photograph: no panel. Reading order is the visual order (name, alias, focus, signature, actions).
  The reveal is CSS keyed on `.is-on` (see styles/hero.css), so re-renders never restart it; a replay removes and re-adds the class.
*/
export default function HeroOverlay({ showTitle, showUi, fast, ended, canReplay, onSkip, onReplay, title3d, titleMode, onTitleReady, onTitleFail, run }) {
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
    <div className={`hero-ui ${showTitle ? 'is-title' : ''} ${showUi ? 'is-on' : ''} ${fast ? 'is-fast' : ''} ${open ? 'is-open' : ''}`}>
      <div className="hero-copy">
        {/* Three groups, one left edge: who (name, alias), what (focus, signature), then what to do. P1 is not here: it marks the portrait (see Portrait). */}
        <div className="hero-group hero-who">
          {/* The name. The heading is real text in the page and is the visible fallback; with the 3D title running it is only transparent, never removed, so it is announced once. */}
          <div className="hero-id">
            <h1 id="hero-title" className="hero-name" data-title={titleMode}>
              <span className="hn-line hn-first">
                <span className="hn-ink">{profile.legal.given}</span>
              </span>{' '}
              <span className="hn-line hn-last">
                <span className="hn-ink">{profile.legal.family}</span>
              </span>
              <span className="sr-only"> — {profile.role}</span>
            </h1>
            {title3d && (
              <SceneGuard onFail={onTitleFail}>
                <Suspense fallback={null}>
                  <TitleStage key={run} onReady={onTitleReady} />
                </Suspense>
              </SceneGuard>
            )}
          </div>
          <p className="hero-alias">
            Known as <b>{profile.first} {profile.last}</b>
          </p>
        </div>
        <div className="hero-group hero-intro">
          <p className="hero-focus">{profile.focus}</p>
          <p className="hero-tagline">{profile.tagline}</p>
          <p className="hero-sub">{profile.intro}</p>
        </div>
        <div className="hero-actions">
          <div className="hero-row">
            <a className="btn btn-primary btn-ig hero-go" href="#garage">
              Enter the Garage
              <Arrow />
            </a>
            {/* Shows only when the destination exists in src/content/profile.js, so there is never a dead or placeholder link. */}
            {profile.linkedin && (
              <a className="btn btn-secondary btn-ig hero-li" href={profile.linkedin} target="_blank" rel="noreferrer">
                <FaLinkedinIn aria-hidden="true" focusable="false" />
                LinkedIn
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
          <div className="hero-roles-wrap">
            <button ref={trigger} className="roles-trigger" type="button" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((o) => !o)}>
              <i className="roles-dot" aria-hidden="true" />
              {profile.statusTitle}
              <Arrow />
            </button>
            <div id={panelId} className="hero-roles" inert={!open}>
              <div className="hero-roles-scroll" data-lenis-prevent tabIndex={0} role="region" aria-label={rolesPanel.label}>
                <h3 className="roles-total">{rolesPanel.heading}</h3>
                <p className="roles-intro">{rolesPanel.intro}</p>
                <RoleList />
                <RolesFoot />
                <ContactActions />
                <button className="btn btn-ghost roles-close" type="button" onClick={close}>
                  Close
                </button>
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
            'Replay the drift'
          ) : (
            <>
              Skip intro
              <Arrow kind="right" />
            </>
          )}
        </button>
      )}
      <a className="scroll-cue" href="#pit-crew" aria-label="Continue to Season 1: Pit Crew">
        Take the next corner
        <Arrow kind="down" />
      </a>
    </div>
  );
}
