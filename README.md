# Sunny Aaron · DRIFT portfolio

A 3D portfolio told as a drift run. The opening: the rev-counter dial sweeps, then a black BMW makes one sideways drift pass across the screen, smoke off the rear tyres, and leaves through the right. The portrait is uncovered behind its tail and settles as the hero.

Built with Vite, React 19, three.js, React Three Fiber, drei, postprocessing and Lenis. Design rules come from the DRIFT design system.

## Run it

```bash
npm install
npm run dev
```

## Where things live

| Path | What |
|---|---|
| `src/content/` | All copy: profile, toolkit, milestones, projects. Edit here. |
| `src/three/timeline.js` | Every beat of the opening, in seconds |
| `src/three/drive.js` | The drift pass: line, slide angle, speed |
| `src/three/Car.jsx` | Car model, paint, headlights, counter-steer and wheel spin |
| `src/three/wheels.js` | Lifts the wheels out of the welded car model so they can steer and spin |
| `src/three/DriftFx.jsx` | Tyre smoke and skid marks |
| `src/sections/Portrait.jsx` | The settled hero portrait, its reveal and its blend into the page |
| `public/images/portrait.webp` | The portrait (see below) |
| `src/sections/` | Hero overlay, Pit Crew, Track, Garage, Finish |

`Driver.jsx`, `RealDriver.jsx`, `SunnyDriver.jsx`, `driverPath.js` and `Wordmark.jsx` (the old walk-in avatar and 3D name) are no longer mounted by the opening. They are kept untouched, and `timeline.js` still carries the few legacy keys they read.

## The portrait

`public/images/portrait.webp` is cut from a screenshot (the photo itself is only about 385×221 px), so it is soft when shown full-bleed. **Replace it with the original photo** for a sharp hero: keep roughly the same framing (about 16:9, the person right of centre). If the new framing differs, adjust `object-position` on `.hero-portrait img` in `src/index.css` (one value for desktop, one in the `max-width: 720px` block for phones).

## Dev hooks

- `?t=end` jumps to the settled hero; `?t=2.2` starts the opening at 2.2 s
- `?tier=high|medium|low` forces a quality tier
- `?fixed` advances exactly 1/30 s per frame (for frame-accurate screenshots)
- `window.__clock.hold = true` freezes the opening; `window.__clock.t = 2` sets the time
- With `prefers-reduced-motion`, the dial, the 3D scene and the drift are skipped and the settled hero shows immediately

## Credits

Car model: BMW 8 Series convertible by ItsDiyor (licence to confirm), repainted with a custom plate. Not affiliated with BMW AG. The portrait photo shows an M6; the animated car is the 8 Series model until an M6 model is added.
