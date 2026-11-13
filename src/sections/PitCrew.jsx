import { profile } from '../content/profile';
import { projects } from '../content/projects';
import SectionHeader from '../components/SectionHeader';
import Arrow from '../components/Arrow';
import Toolkit from './Toolkit';
import useReveal from '../components/useReveal';

const BASE = import.meta.env.BASE_URL; // the site may be served from a sub-path (GitHub Pages)

// A night-time pit stop: a motorsport-style pass, a short statement, three project references. Three columns when there is room,
// each at its own height; the references drop under the statement when it is tight. Natural document flow, so it never sits behind the cockpit.
export default function PitCrew() {
  const ref = useReveal();
  const { pass, statement, references } = profile;

  return (
    <section className="section pit" id="pit-crew" aria-labelledby="pit-crew-title" ref={ref}>
      <SectionHeader id="pit-crew-title" sector="S1 / Pit Crew" title="Behind the wheel." />
      <div className="pit-bay reveal">
        <div className="pass" role="group" aria-label={`${profile.first} ${profile.last}, driver pass`}>
          <div className="pass-sheet">
            <span className="pass-slot" aria-hidden="true" />
            <div className="pass-photo">
              <img src={BASE + pass.src} alt={pass.alt} width="900" height="1200" loading="lazy" decoding="async" style={{ '--pos': pass.pos, '--zoom': pass.zoom }} />
            </div>
            <div className="pass-text">
              <span className="pass-name">
                {profile.first} {profile.last}
              </span>
              <span className="pass-role">{profile.role}</span>
              <span className="pass-base">{profile.location}</span>
            </div>
            <span className="pass-reg" aria-label={`Registration ${pass.reg}`}>
              {pass.reg}
            </span>
          </div>
        </div>

        <div className="pit-statement">
          <h3 className="pit-lead">{statement.lead}</h3>
          {statement.body.map((p) => (
            <p key={p}>{p}</p>
          ))}
          <p className="pit-off">{statement.off}</p>
        </div>

        <ul className="pit-refs" aria-label="Projects that show how I work">
          {references.map((r) => {
            const p = projects.find((x) => x.slug === r.slug);
            return (
              <li key={r.slug}>
                <a href={p.repo} target="_blank" rel="noreferrer" className="pit-ref-name">
                  {p.title}
                  <Arrow />
                </a>
                <span className="pit-ref-q">{r.question}</span>
                <span className="pit-ref-line">{r.line}</span>
              </li>
            );
          })}
        </ul>
      </div>
      <Toolkit />
    </section>
  );
}
