import { useEffect, useState } from 'react';
import { profile } from '../content/profile';

const LINKS = [
  ['#pit-crew', 'Pit Crew'],
  ['#track', 'Track'],
  ['#garage', 'Garage'],
  ['#finish', 'Contact'],
];

export default function Nav({ visible }) {
  const [current, setCurrent] = useState('');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const ids = ['ignition', ...LINKS.map(([h]) => h.slice(1))];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setCurrent(e.target.id);
            history.replaceState(null, '', e.target.id === 'ignition' ? window.location.pathname + window.location.search : '#' + e.target.id);
          }
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      io.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const sector = ['ignition', 'pit-crew', 'track', 'garage', 'finish'].indexOf(current);

  return (
    <header className={`nav ${visible || scrolled ? 'is-on' : ''} ${scrolled ? 'is-solid' : ''}`}>
      <a className="nav-mark" href="#ignition" aria-label={`${profile.first} ${profile.last}, home`}>
        {profile.first}
        <span>.</span>
      </a>
      <nav aria-label="Main">
        <ul>
          {LINKS.map(([href, label]) => (
            <li key={href}>
              <a href={href} aria-current={current === href.slice(1) ? 'true' : undefined}>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="nav-right">
        <span className="nav-sector">S{Math.max(0, sector)} / 4</span>
        <a className="btn btn-primary btn-sm" href={profile.cv || profile.github} target="_blank" rel="noreferrer">
          {profile.cv ? 'CV' : 'GitHub'}
        </a>
      </div>
    </header>
  );
}
