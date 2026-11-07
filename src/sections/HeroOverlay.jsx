import { profile } from '../content/profile';

export default function HeroOverlay({ showUi, ended, canReplay, onSkip, onReplay }) {
  return (
    <div className={`hero-ui ${showUi ? 'is-on' : ''}`}>
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
          <a className="btn btn-primary" href="#garage">Enter the Garage</a>
          <a className="btn btn-secondary" href={profile.github} target="_blank" rel="noreferrer">
            GitHub
          </a>
        </div>
        <ul className="hero-chips" aria-label="At a glance">
          {profile.chips.map((c, i) => (
            <li key={c} className="chip" style={{ '--r': `${[-5, 4, -3][i % 3]}deg`, '--d': `${i * 40}ms` }}>
              {c}
            </li>
          ))}
          <li className="chip" style={{ '--r': '5deg', '--d': '30ms' }}>
            <i className="chip-dot" />
            {profile.location}
          </li>
          <li className="chip chip-live" style={{ '--r': '-4deg', '--d': '100ms' }}>
            <i className="chip-dot" />
            {profile.status}
          </li>
        </ul>
      </div>
      {(!ended || canReplay) && (
        <button className="btn btn-ghost hero-skip" type="button" onClick={ended ? onReplay : onSkip}>
          {ended ? 'Replay ↺' : 'Skip intro →'}
        </button>
      )}
      <a className="scroll-cue" href="#pit-crew">
        Scroll to drive <span aria-hidden="true">↓</span>
      </a>
    </div>
  );
}
