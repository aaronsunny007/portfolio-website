import { profile } from '../content/profile';
import SectionHeader from '../components/SectionHeader';
import Toolkit from './Toolkit';
import useReveal from '../components/useReveal';

// Two balanced areas: who (the plate and the fields), then the introduction. Natural document flow, so it never sits behind the cockpit.
export default function PitCrew() {
  const ref = useReveal();
  const field = (k) => profile.licence.find(([name]) => name === k)?.[1];

  return (
    <section className="section" id="pit-crew" aria-labelledby="pit-crew-title" ref={ref}>
      <SectionHeader id="pit-crew-title" sector="S1 / Pit Crew" title="Behind the wheel." />
      <article className="credential surface reveal" aria-label="Driver profile">
        <div className="credential-id">
          <div className="licence-plate" aria-hidden="true">
            <span>SA</span>
            <b>07</b>
          </div>
          <div className="licence-no">{profile.licenceNo.toUpperCase()}</div>
          <h3>
            {profile.first} {profile.last}
          </h3>
          <p className="credential-role">{profile.role}</p>
          <p className="credential-base">{profile.location}</p>
          <p className="credential-focus">{field('Discipline')}</p>
        </div>
        <div className="credential-intro">
          <p className="credential-statement">{profile.statement}</p>
          {profile.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <ul className="credential-refs" aria-label="Projects that show how I work">
            {profile.references.map((r) => (
              <li key={r.name}>
                <a href="#garage">{r.name}</a> {r.line}
              </li>
            ))}
          </ul>
          <p className="credential-off">{profile.offDuty}</p>
          <details className="credential-bg">
            <summary>Background</summary>
            <dl>
              {profile.background.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </details>
        </div>
      </article>
      <Toolkit />
    </section>
  );
}
