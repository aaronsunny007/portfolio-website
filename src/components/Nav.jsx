import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { FaGithub } from 'react-icons/fa';
import { profile } from '../content/profile';

const LINKS = [
  ['#pit-crew', 'Pit Crew'],
  ['#track', 'Track'],
  ['#garage', 'Garage'],
  ['#finish', 'Contact'],
];

const SEASONS = ['Ignition', 'Pit Crew', 'The Track', 'The Garage', 'Finish Line'];

export default function Nav({ visible }) {
  const [current, setCurrent] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const list = useRef();
  const items = useRef([]);

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

  // One red marker slides between destinations: it is placed from the active link's own box, so it follows the labels at any width or font.
  const at = LINKS.findIndex(([h]) => h.slice(1) === current);
  useLayoutEffect(() => {
    const ul = list.current;
    const place = () => {
      const el = items.current[at];
      ul.style.setProperty('--on', el ? 1 : 0);
      if (!el) return;
      ul.style.setProperty('--x', `${el.offsetLeft}px`);
      ul.style.setProperty('--w', `${el.offsetWidth}px`);
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(ul);
    document.fonts?.ready.then(place);
    return () => ro.disconnect();
  }, [at]);

  const sector = Math.max(0, ['ignition', 'pit-crew', 'track', 'garage', 'finish'].indexOf(current));

  return (
    <header className={`nav ${visible || scrolled ? 'is-on' : ''} ${scrolled ? 'is-solid' : ''}`}>
      <a className="nav-mark" href="#ignition" aria-label={`${profile.first} ${profile.last} — home`}>
        {profile.first}
        <span>.</span>
      </a>
      <nav aria-label="Main">
        <ul className="rail" ref={list}>
          {LINKS.map(([href, label], i) => (
            <li key={href} ref={(el) => (items.current[i] = el)}>
              <a href={href} aria-current={i === at ? 'true' : undefined}>
                {label}
              </a>
            </li>
          ))}
          <i className="rail-mark" aria-hidden="true" />
        </ul>
      </nav>
      <div className="nav-right">
        <span className="nav-sector">
          <span aria-hidden="true">S{sector} / 4</span>
          <span className="sr-only">Season {sector}: {SEASONS[sector]}</span>
        </span>
        {/* GitHub stays here whatever else exists; the CV and LinkedIn keys live in the hero. */}
        <a className="key" data-spec href={profile.github} target="_blank" rel="noreferrer">
          <FaGithub aria-hidden="true" />
          GitHub
        </a>
      </div>
    </header>
  );
}
