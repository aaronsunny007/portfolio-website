import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { milestones, ahead } from '../content/profile';
import { N, EXIT, legAt, exitAt, view } from '../three/journey';
import { scroller } from '../scroller';

gsap.registerPlugin(ScrollTrigger);

// Sit on each corner for a stretch of scroll, travel between them in the rest.
const hold = (f) => {
  const x = Math.min(1, Math.max(0, (f - 0.2) / 0.6));
  return x * x * (3 - 2 * x);
};
const SPAN = N - 1 + EXIT; // the scroll runs on past the last milestone: the car leaves the route and drives onto the night road
const pad = (i) => String(i + 1).padStart(2, '0');

/**
 * The career journey. The route is drawn in the night scene (src/three/Route.jsx); this is its HTML: six cards, one per real
 * milestone, kept as a deck beside the car, plus the future destination as a card that is plainly not a milestone.
 * Scroll position is the single source of truth: scrolling moves the car, the camera and the deck together,
 * and choosing a milestone scrolls to it. Nothing here runs on a timer.
 */
export default function Career({ reduceMotion, flat }) {
  const root = useRef();
  const layer = useRef();
  const link = useRef();
  const st = useRef(null);
  const [sel, setSel] = useState(0);

  useEffect(() => {
    view.layer = layer.current;
    view.link = link.current;
    view.panels = [...layer.current.querySelectorAll('[data-panel]')];
    return () => {
      view.layer = null;
      view.link = null;
      view.panels = [];
    };
  }, []);

  useEffect(() => {
    if (flat) return;
    let cur = -1;
    const follow = reduceMotion ? null : gsap.quickTo(view, 't', { duration: 0.7, ease: 'power3.out' });
    const followXo = reduceMotion ? null : gsap.quickTo(view, 'xo', { duration: 0.7, ease: 'power3.out' });
    const apply = (progress) => {
      const u = progress * SPAN;
      const c = Math.min(N - 1, u);
      const i = Math.min(N - 2, Math.floor(c));
      view.ex = Math.min(1, Math.max(0, (u - (N - 1)) / EXIT));
      const [te, xo] = exitAt(view.ex);
      const to = view.ex > 0 ? te : legAt(i, hold(c - i));
      if (follow) {
        follow(to);
        followXo(xo);
      } else {
        view.t = to;
        view.xo = xo;
      }
      const s = Math.round(c);
      if (s !== cur) {
        cur = s;
        view.sel = s;
        setSel(s);
      }
      view.invalidate?.();
    };
    const ctx = gsap.context(() => {
      st.current = ScrollTrigger.create({ trigger: root.current, start: 'top top', end: 'bottom bottom', onUpdate: (self) => apply(self.progress) });
      apply(st.current.progress);
    }, root);
    return () => {
      ctx.revert();
      gsap.killTweensOf(view, 't,xo');
      view.ex = 0;
      view.xo = 0;
      st.current = null;
    };
  }, [flat, reduceMotion]);

  const select = (i) => {
    const s = st.current;
    // a longer ride when the way crosses the jump, so the take-off and the landing can be seen
    const dur = 1.1 + (i === N - 1 && sel < N - 1 ? 1.4 : 0);
    if (s) scroller.to(s.start + (s.end - s.start) * (i / SPAN), reduceMotion, dur);
  };

  return (
    <div id="career" className={`career ${flat ? 'is-flat' : ''}`} ref={root} style={{ '--n': SPAN }}>
      <div className="career-layer" ref={layer} data-on="0">
        <i className="deck-link" ref={link} aria-hidden="true" />
        <ol className="panels" aria-label="Career milestones, in order">
          {milestones.map((m, i) => (
            <li key={m.title} data-panel className={`panel ${i === sel ? 'is-active' : ''} ${i <= sel ? 'is-reached' : ''}`} data-kind={m.kind.toLowerCase()} style={{ '--p': (i + 1) / N }}>
              <div className="panel-shell" aria-hidden="true" />
              <div className="panel-face">
                <button type="button" className="panel-head" tabIndex={-1} aria-current={i === sel ? 'step' : undefined} onClick={() => select(i)}>
                  <span className="panel-n">{pad(i)}</span>
                  <span className="panel-meta">
                    {m.kind} · {m.year ?? m.tag}
                  </span>
                  <span className="panel-title">{m.title}</span>
                </button>
                <p className="panel-text">{m.text}</p>
                {m.point && <p className="panel-point">{m.point}</p>}
              </div>
            </li>
          ))}
        </ol>
        <aside data-panel className="panel panel-ahead" aria-label="Ahead, a plan and not a milestone">
          <div className="panel-shell" aria-hidden="true" />
          <div className="panel-face">
            <span className="panel-meta">Ahead · a plan, not a milestone</span>
            <strong className="panel-title">{ahead.title}</strong>
            <p className="panel-text">{ahead.text}</p>
          </div>
        </aside>
        {!flat && (
          <nav className="deck-nav" aria-label="Go to a milestone">
            {milestones.map((m, i) => (
              <button key={m.title} type="button" aria-label={`Milestone ${i + 1} of ${N}: ${m.title}`} aria-current={i === sel ? 'step' : undefined} className={i <= sel ? 'is-reached' : ''} onClick={() => select(i)}>
                {pad(i)}
              </button>
            ))}
          </nav>
        )}
      </div>
    </div>
  );
}
