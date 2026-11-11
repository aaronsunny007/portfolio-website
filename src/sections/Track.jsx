import SectionHeader from '../components/SectionHeader';
import { journeyHead } from '../content/profile';
import Career from '../components/Career';
import useReveal from '../components/useReveal';

export default function Track({ reduceMotion, flat }) {
  const ref = useReveal();
  return (
    <section className="section track" id="track" aria-labelledby="track-title" ref={ref}>
      <SectionHeader id="track-title" sector="S2 / The Track" title={journeyHead.title} intro={journeyHead.intro} />
      <Career reduceMotion={reduceMotion} flat={flat} />
    </section>
  );
}
