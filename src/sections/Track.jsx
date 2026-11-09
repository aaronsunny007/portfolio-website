import SectionHeader from '../components/SectionHeader';
import Career from '../components/Career';
import useReveal from '../components/useReveal';

export default function Track({ reduceMotion, flat }) {
  const ref = useReveal();
  return (
    <section className="section track" id="track" aria-labelledby="track-title" ref={ref}>
      <SectionHeader id="track-title" sector="S2 / The Track" title="Every corner," accent="so far." intro="Education, work and the builds that changed direction. One corner at a time." />
      <Career reduceMotion={reduceMotion} flat={flat} />
    </section>
  );
}
