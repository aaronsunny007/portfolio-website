import { useState } from 'react';
import { profile } from '../content/profile';
import SectionHeader from '../components/SectionHeader';
import useReveal from '../components/useReveal';

export default function Finish() {
  const ref = useReveal();
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked: the mailto link still works */
    }
  };
  return (
    <section className="section finish" id="finish" aria-labelledby="finish-title" ref={ref}>
      <div className="flag" aria-hidden="true" />
      <SectionHeader id="finish-title" sector="S4 / Finish Line" title="Let’s build something that" accent="holds the line." />
      <div className="finish-row reveal">
        {profile.email && (
          <div className="copy">
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <button className="btn btn-secondary" type="button" onClick={copy}>
              Copy
            </button>
            <span className={`toast ${copied ? 'is-on' : ''}`} role="status">
              {copied ? '✓ Copied' : ''}
            </span>
          </div>
        )}
        <a className="btn btn-primary" href={profile.github} target="_blank" rel="noreferrer">
          GitHub
        </a>
        {profile.linkedin && (
          <a className="btn btn-secondary" href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
          </a>
        )}
        {profile.cv && (
          <a className="btn btn-secondary" href={profile.cv}>
            Download CV
          </a>
        )}
      </div>
      <p className="finish-meta reveal">
        {profile.status} · {profile.location}
      </p>
      <footer className="footer">
        <span>
          © 2026 {profile.first} {profile.last}
        </span>
        <span>Not affiliated with BMW AG. Built with three.js, React Three Fiber and Lenis.</span>
      </footer>
    </section>
  );
}
