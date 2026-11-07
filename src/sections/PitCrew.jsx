import { profile, toolkit } from '../content/profile';
import { evidenceRepo } from '../content/projects';
import Arrow from '../components/Arrow';
import SectionHeader from '../components/SectionHeader';
import useReveal from '../components/useReveal';

export default function PitCrew() {
  const ref = useReveal();
  return (
    <section className="section" id="pit-crew" aria-labelledby="pit-crew-title" ref={ref}>
      <SectionHeader id="pit-crew-title" sector="S1 / Pit Crew" title="The" accent="driver." />
      <div className="pit-grid">
        <article className="licence reveal" aria-label="Driver profile">
          <div className="licence-plate" aria-hidden="true">
            <span>SA</span>
            <b>07</b>
          </div>
          <div>
            <div className="licence-no">LICENCE NO. SA-007 · CLASS AI</div>
            <h3>
              {profile.first} {profile.last}
            </h3>
            <dl>
              {profile.licence.map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </article>
        <div className="bio reveal">
          {profile.bio.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>
      <h3 className="sub reveal">Toolkit</h3>
      <div className="toolkit">
        {toolkit.map((g, gi) => (
          <div key={g.group} className="toolgroup">
            <div className="toolgroup-label">
              <span>{g.group}</span>
              <span className="toolgroup-count">{String(g.tools.length).padStart(2, '0')}</span>
            </div>
            <ul>
              {g.tools.map(([name, used], i) => (
                <li key={name} className="tool" style={{ '--r': `${((gi * 4 + i) % 5) - 2}deg` }}>
                  {name}
                  <small className="tool-used">
                    <span>Used in:</span>
                    {used.split(', ').map((alias) => {
                      const repo = evidenceRepo(alias);
                      return repo ? (
                        <a key={alias} className="evidence" href={repo} target="_blank" rel="noreferrer">
                          {alias}
                          <Arrow />
                        </a>
                      ) : (
                        <span key={alias}>{alias}</span>
                      );
                    })}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
