import { profile } from '../content/profile';
import SectionHeader from '../components/SectionHeader';
import Toolkit from './Toolkit';
import useReveal from '../components/useReveal';

export default function PitCrew() {
  const ref = useReveal();

  return (
    <section className="section" id="pit-crew" aria-labelledby="pit-crew-title" ref={ref}>
      <SectionHeader id="pit-crew-title" sector="S1 / Pit Crew" title="Behind the wheel." />
      <article className="credential surface reveal" aria-label="Driver profile">
        <div className="credential-id">
          <div className="licence-plate" aria-hidden="true">
            <span>SA</span>
            <b>07</b>
          </div>
          <div className="credential-head">
            <div className="licence-no">{profile.licenceNo.toUpperCase()}</div>
            <h3>
              {profile.first} {profile.last}
            </h3>
          </div>
          <dl>
            {profile.licence.map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="credential-intro">
          {profile.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </article>
      <Toolkit />
    </section>
  );
}
