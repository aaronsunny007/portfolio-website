import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { milestones, ahead } from '../content/profile';
import { projects } from '../content/projects';
import Arrow from './Arrow';
import { N, EXIT, legAt, exitAt, view, cardSide, switchAt, sideAt } from '../three/journey';
import { scroller } from '../scroller';

gsap.registerPlugin(ScrollTrigger);

// Sit on each corner for a stretch of scroll, travel between them in the rest.
const hold = (f) => {
  const x = Math.min(1, Math.max(0, (f - 0.2) / 0.6));
  return x * x * (3 - 2 * x);
};
const BASE = import.meta.env.BASE_URL; // the site may be served from a sub-path (GitHub Pages)
const SPAN = N - 1 + EXIT; // the scroll runs on past the last milestone: the car leaves the route and drives onto the night road
const pad = (i) => String(i + 1).padStart(2, '0');
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const stacked = () => window.matchMedia('(max-width: 899px), (max-aspect-ratio: 23/20)').matches; // mirrors view.tall: the card docks under the scene
// The way a card leaves toward, and arrives from, its own edge of the screen. A docked card has one position, so it only rises and settles.
const edge = (i) => (stacked() ? { x: 0, y: 14 } : { x: -cardSide(i) * 28, y: 0 });

function Chapter({ m, i, flat, open, onToggle }) {
  const [broken, setBroken] = useState(false);
  const links = (m.evidence || []).map((e) => ({ ...e, p: projects.find((x) => x.slug === e.slug) }));
  const shown = flat || open;
  const copy = useRef();
  const [more, setMore] = useState(false); // the copy scrolls and has more below
  useEffect(() => {
    const el = copy.current;
    const check = () => setMore(el.scrollHeight - el.clientHeight - el.scrollTop > 4);
    check();
    el.addEventListener('scroll', check, { passive: true });
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', check);
      ro.disconnect();
    };
  }, [open]);
  useEffect(() => {
    // opened notes slide in below the button: bring them into view once the panel has grown
    if (!open) return;
    const t = setTimeout(() => copy.current.scrollTo({ top: copy.current.scrollHeight, behavior: 'smooth' }), 280);
    return () => clearTimeout(t);
  }, [open]);
  return (
    <article className="chapter-card" aria-label={`Chapter ${i + 1} of ${N}: ${m.label}`} data-kind={m.kind.toLowerCase()}>
      <figure className="chapter-photo">
        {!broken && (
          <img src={BASE + m.photo.src} alt={m.photo.alt} width="900" height="1200" loading={i === 0 ? 'eager' : 'lazy'} decoding="async" style={{ '--pos': m.photo.pos, '--pos-m': m.photo.posM }} onError={() => setBroken(true)} />
        )}
        <figcaption aria-hidden="true">
          {pad(i)} / {pad(N - 1)}
        </figcaption>
      </figure>
      <div className="chapter-copy" ref={copy} data-more={more} data-lenis-prevent>
        <p className="chapter-meta">
          <span className="chapter-n">{pad(i)}</span>
          {m.meta}
        </p>
        <h3 className="chapter-title">{m.title}</h3>
        <p className="chapter-text">{m.text}</p>
        {m.status && <p className="chapter-status">{m.status}</p>}
        {links.length > 0 && (
          <div className="chapter-links">
            {links.map(({ slug, label, p }) => (
              <a key={slug} className="evidence" href={p.repo} target="_blank" rel="noreferrer">
                {label}
                <Arrow />
              </a>
            ))}
          </div>
        )}
        {m.notes && (
          <>
            {!flat && (
              <button className="chapter-more-btn" type="button" aria-expanded={open} aria-controls={`notes-${m.id}`} onClick={onToggle}>
                {open ? 'Close build notes −' : 'Read the build notes +'}
              </button>
            )}
            <div id={`notes-${m.id}`} className="chapter-notes" data-open={shown} inert={!shown}>
              <div>
                <h4>Inside the work</h4>
                <p>{m.notes}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  );
}

/**
 * The career journey. The route is drawn in the night scene (src/three/Route.jsx); this is its HTML: one photographic spread for the
 * chapter in focus, a rail of six chapters, and the future destination as a card that is plainly not a chapter.
 * Scroll position is the single source of truth: scrolling moves the car, the camera and the chapter together,
 * and choosing a chapter scrolls to it. Nothing here runs on a timer.
 */
export default function Career({ reduceMotion, flat }) {
  const root = useRef();
  const layer = useRef();
  const stage = useRef();
  const rail = useRef();
  const mark = useRef();
  const st = useRef(null);
  const prev = useRef(0);
  const shownRef = useRef(0);
  const [sel, setSel] = useState(0);
  const [shown, setShown] = useState(0); // the chapter on the card: it follows sel once the old card has gone
  const [more, setMore] = useState(-1); // the chapter whose build notes are open; moving to another chapter closes them

  useEffect(() => {
    view.layer = layer.current;
    // later photographs load once the page is idle, so a chapter change never waits on one
    const warm = () => milestones.forEach((m) => Object.assign(new Image(), { src: BASE + m.photo.src }));
    const idle = window.requestIdleCallback ? window.requestIdleCallback(warm) : setTimeout(warm, 1500);
    return () => {
      (window.cancelIdleCallback || clearTimeout)(idle);
      view.layer = null;
    };
  }, []);

  useEffect(() => {
    if (flat) return;
    let cur = -1;
    const follow = reduceMotion ? null : gsap.quickTo(view, 't', { duration: 0.7, ease: 'power3.out' });
    const followXo = reduceMotion ? null : gsap.quickTo(view, 'xo', { duration: 0.7, ease: 'power3.out' });
    const followSx = reduceMotion ? null : gsap.quickTo(view, 'sx', { duration: 0.7, ease: 'power2.out' });
    const plan = layer.current.querySelector('[data-panel]');
    const apply = (progress) => {
      const u = progress * SPAN;
      const c = Math.min(N - 1, u);
      const i = Math.min(N - 2, Math.floor(c));
      view.ex = Math.min(1, Math.max(0, (u - (N - 1)) / EXIT));
      const [te, xo] = exitAt(view.ex);
      const to = view.ex > 0 ? te : legAt(i, hold(c - i));
      const f = c - i; // how far along the leg: the scene's side and the card both follow it, after the car has settled
      const sx = sideAt(i, f);
      if (follow) {
        follow(to);
        followXo(xo);
        followSx(sx);
      } else {
        view.t = to;
        view.xo = xo;
        view.sx = sx;
      }
      // the chapter card gives way as the car leaves the route; the plan ahead then takes the same place on the left, never both at once
      const o = 1 - clamp01(view.ex / 0.15);
      const a = clamp01((view.ex - 0.3) / 0.15);
      [stage.current, rail.current].forEach((el) => {
        if (!el) return;
        el.style.opacity = o.toFixed(3);
        el.style.visibility = o < 0.02 ? 'hidden' : ''; // '' keeps the layer's own hidden state: nothing here is focusable while the chapters are off screen
      });
      plan.style.opacity = a.toFixed(3);
      plan.style.visibility = a < 0.02 ? 'hidden' : 'visible';
      const s = f >= switchAt(i) ? i + 1 : i;
      if (s !== cur) {
        cur = s;
        view.sel = s;
        setSel(s);
        setMore(-1);
      }
      view.invalidate?.();
    };
    const ctx = gsap.context(() => {
      st.current = ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', onUpdate: (self) => apply(self.progress) });
      apply(st.current.progress);
    }, root);
    return () => {
      ctx.revert();
      gsap.killTweensOf(view, 't,xo,sx');
      view.ex = 0;
      view.xo = 0;
      view.sx = -1;
      st.current = null;
    };
  }, [flat, reduceMotion]);

  // A chapter change deals one card away and the next in: the old one slips right and fades, the new one settles in from the left.
  // The text swaps only while the card is invisible, so two chapters are never readable together. A newer change replaces a running one.
  useEffect(() => {
    if (flat) return;
    const card = stage.current?.firstElementChild;
    const from = shownRef.current;
    if (from === sel) {
      if (card) gsap.to(card, { x: 0, y: 0, opacity: 1, duration: 0.2, overwrite: true, clearProps: 'transform,opacity' });
      return;
    }
    const swap = () => {
      shownRef.current = sel;
      setShown(sel);
    };
    if (reduceMotion || !card) return swap();
    gsap.to(card, { ...edge(from), opacity: 0, duration: 0.16, ease: 'power2.in', overwrite: true, onComplete: swap });
    return () => gsap.killTweensOf(card);
  }, [sel, flat, reduceMotion]);

  useLayoutEffect(() => {
    const card = stage.current?.firstElementChild;
    const from = prev.current;
    prev.current = shown;
    if (flat || reduceMotion || !card || from === shown) return;
    gsap.fromTo(card, { ...edge(shown), opacity: 0 }, { x: 0, y: 0, opacity: 1, duration: 0.28, ease: 'power3.out', overwrite: true, clearProps: 'transform,opacity' });
  }, [shown, flat, reduceMotion]);

  // the red line under the rail follows the selected chapter; measured again whenever the rail changes size (fonts, window)
  useLayoutEffect(() => {
    const r = rail.current;
    if (!r) return;
    const place = () => {
      const b = r.querySelector('[aria-current="step"]');
      if (!b || !b.offsetWidth) return;
      mark.current.style.transform = `translate(${b.offsetLeft}px,${b.offsetTop + b.offsetHeight - 3}px)`;
      mark.current.style.width = `${b.offsetWidth}px`;
      if (r.scrollWidth > r.clientWidth) r.scrollTo({ left: b.offsetLeft - (r.clientWidth - b.offsetWidth) / 2 });
    };
    place();
    const ro = new ResizeObserver(place);
    ro.observe(r);
    return () => ro.disconnect();
  }, [sel, flat]);

  const select = (i) => {
    const s = st.current;
    // a longer ride when the way crosses the jump, so the take-off and the landing can be seen
    const dur = 1.1 + (i === N - 1 && sel < N - 1 ? 1.4 : 0);
    if (s) scroller.to(s.start + (s.end - s.start) * (i / SPAN), reduceMotion, dur);
  };

  const plan = (
    <aside data-panel className="panel panel-ahead" aria-label={ahead.label}>
      <div className="panel-shell" aria-hidden="true" />
      <div className="panel-face">
        <span className="panel-meta">{ahead.meta}</span>
        <strong className="panel-title">{ahead.title}</strong>
        <p className="panel-text">{ahead.text}</p>
        <a className="evidence" href="#finish">
          {ahead.action}
          <Arrow />
        </a>
      </div>
    </aside>
  );

  return (
    <div id="career" className={`career ${flat ? 'is-flat' : ''}`} ref={root} style={{ '--n': SPAN }}>
      <div className="career-layer" ref={layer} data-on="0">
        {flat ? (
          <>
            <ol className="chapters" aria-label="Education, experience and projects in chronological order">
              {milestones.map((m, i) => (
                <li key={m.id}>
                  <Chapter m={m} i={i} flat />
                </li>
              ))}
            </ol>
            {plan}
          </>
        ) : (
          <>
            <div className="chapter-dock" data-side={cardSide(shown) > 0 ? 'left' : 'right'}>
            <div className="chapter-slot">
              <div className="chapter" ref={stage}>
                <Chapter key={shown} m={milestones[shown]} i={shown} open={more === shown} onToggle={() => setMore(more === shown ? -1 : shown)} />
              </div>
              {plan}
            </div>
            </div>
            <nav className="chapter-rail" aria-label="Career chapters" ref={rail}>
              {milestones.map((m, i) => (
                <button key={m.id} type="button" aria-current={i === sel ? 'step' : undefined} aria-label={`Milestone ${i + 1} of ${N}: ${m.label}`} onClick={() => select(i)}>
                  {pad(i)}
                </button>
              ))}
              <span className="chapter-now" aria-hidden="true">
                {milestones[sel].label}
              </span>
              <i className="chapter-mark" ref={mark} aria-hidden="true" />
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
