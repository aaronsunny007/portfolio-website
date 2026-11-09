import { useEffect, useRef, useState } from 'react';
import { profile } from '../content/profile';
import Arrow from './Arrow';

// The ways to get in touch, in one place so the finish row and the roles panel offer exactly the same actions.
// Email is the primary action when there is an address; otherwise the code on GitHub is.
export default function ContactActions() {
  const [copy, setCopy] = useState(null); // null | 'ok' | 'fail'
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const onCopy = async () => {
    let result = 'ok';
    try {
      await navigator.clipboard.writeText(profile.email);
    } catch {
      result = 'fail'; // clipboard blocked or unavailable: the address is still a link and can be selected
    }
    setCopy(result);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopy(null), 3000);
  };
  const hasEmail = Boolean(profile.email);
  return (
    <div className="finish-row">
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
      <a className={hasEmail ? 'btn btn-secondary' : 'btn btn-primary'} href={profile.github} target="_blank" rel="noreferrer">
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
  );
}
