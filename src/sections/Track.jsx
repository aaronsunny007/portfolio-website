import { milestones } from '../content/profile';
import SectionHeader from '../components/SectionHeader';
import useReveal from '../components/useReveal';

export default function Track() {
  const ref = useReveal();
  return (
    <section className="section" id="track" aria-labelledby="track-title" ref={ref}>
      <SectionHeader id="track-title" sector="S2 / The Track" title="Every corner," accent="so far." intro="Education, work and the builds that changed direction. One corner at a time." />
      <ol className="track">
        {milestones.map((m, i) => (
          <li key={m.title} className="milestone" style={{ '--i': i }}>
            <div className="milestone-year">{m.year ?? '—'}</div>
            <div className="milestone-corner">CORNER {String(i + 1).padStart(2, '0')}</div>
            <h3>{m.title}</h3>
            <p>{m.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
