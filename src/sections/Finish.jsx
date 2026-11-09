import { useEffect, useRef, useState } from 'react';
import { profile } from '../content/profile';
import SectionHeader from '../components/SectionHeader';
import Arrow from '../components/Arrow';
import useReveal from '../components/useReveal';

export default function Finish() {
  const ref = useReveal();
  const [copy, setCopy] = useState(null); // null | 'ok' | 'fail'
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const onCopy = async () => {
    let result = 'ok';
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      result = 'fail'; // clipboard blocked or unavailable: the address above is still a link and can be selected
    }
    setCopy(result);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopy(null), 3000);
  };
  // the next step: email when there is an address, otherwise the code on GitHub
  const hasEmail = Boolean(profile.email);
  const githubClass = hasEmail ? 'btn btn-secondary' : 'btn btn-primary';
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
      <div className="finish-row reveal">
        {hasEmail && (
          <>
            <a className="btn btn-primary" href={`mailto:${profile.email}`}>
              Email me
            </a>
            <div className="copy">
              <a href={`mailto:${profile.email}`}>{profile.email}</a>
              <button className="btn btn-secondary" type="button" onClick={onCopy}>
                Copy
              </button>
            </div>
          </>
        )}
        <a className={githubClass} href={profile.github} target="_blank" rel="noreferrer">
          GitHub
          <Arrow />
        </a>
        {profile.linkedin && (
          <a className="btn btn-secondary" href={profile.linkedin} target="_blank" rel="noreferrer">
            LinkedIn
            <Arrow />
          </a>
        )}
        {profile.cv && (
          <a className="btn btn-secondary" href={profile.cv}>
            Download CV
          </a>
        )}
        {hasEmail && (
          <p className={`copy-status ${copy === 'fail' ? 'is-fail' : ''}`} role="status">
            {copy === 'ok' && 'Copied to clipboard.'}
            {copy === 'fail' && 'Could not copy. Select the address above instead.'}
          </p>
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
