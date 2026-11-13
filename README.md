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
| `docs/PROJECT_NOTES.md` | Latest changes, checks run, deploy details and open items |
| `src/three/timeline.js` | Every beat of the opening, in seconds |
| `src/three/drive.js` | The drift pass: line, slide angle, speed |
| `src/three/Car.jsx` | Car model, paint, headlights, counter-steer and wheel spin |
| `src/three/wheels.js` | Lifts the wheels out of the welded car model so they can steer and spin |
| `src/three/DriftFx.jsx` | Tyre smoke and skid marks |
| `src/sections/Portrait.jsx` | The settled hero portrait, its reveal and its blend into the page |
| `public/images/portrait.webp` | The portrait (see below) |
| `src/sections/` | Hero overlay, Pit Crew, Track, Garage, Finish |
| `src/sections/ProjectArt.jsx` | Conceptual drawings for the six flagships and the full-garage vignettes |
| `src/styles/projects.css`, `controls.css` | Toolkit console, garage display and paddock; the per-season control families |
| `src/styles/hardware.css`, `src/components/pointerFx.js` | The tactile parts: SUNNY emblem, GitHub key, Open code, selector plates, Full garage; one delegated pointer handler for tilt and specular edge |
| `src/styles/hero.css` | The hero's words set straight over the photo (no panel), the name's fallback styling, the Garage/LinkedIn keys and the Open to Roles panel |
| `src/three/TitleStage.jsx` | The name as real 3D lettering (extruded Oxanium SemiBold, small bevel) in its own small transparent canvas over the heading; sized from the heading's measured boxes, timed by the opening clock (`titleMotion`), tilts a few degrees with a fine pointer, sleeps once settled |

`Driver.jsx`, `RealDriver.jsx`, `SunnyDriver.jsx`, `driverPath.js` and `Wordmark.jsx` (the old walk-in avatar and 3D name) are no longer mounted by the opening. They are kept untouched, and `timeline.js` still carries the few legacy keys they read.

## The portrait

`public/images/portrait.webp` is the full-resolution photo (1362×762) shown as shot: no blur filter and no dimming, only a long eased scrim on the left so the copy stays readable and there is no seam between text and picture. To swap it, keep roughly the same framing (about 16:9, the person right of centre) and update the `aspect-ratio` on `.hero-portrait` and the `width`/`height` in `Portrait.jsx`. If the framing differs, adjust `--fx` / `--fy` (the crop's focal point, read by the photo and its ambient copies) on `.hero-portrait` in `src/index.css`: one pair for desktop, one in the phone blocks.

The photo is uncovered by `--rv` (0 to 1), which the opening stage writes on `.hero` every frame from its own clock (`revealAt` in `src/three/timeline.js`), so the photo can never run ahead of the car. P1 marks his shoulder in the photo: `src/components/portraitMark.js` finds the landmark through the photo's real crop (box size and object-position) and the tab and connector are drawn in the photo's own box, so a different photo needs only the `SHOULDER` fractions changed. There is no CV control: `profile.cv` stays empty until a CV exists. The title face is Oxanium SemiBold (OFL), used by the HTML heading and, as typeface JSON (`src/three/fonts/oxanium-600.json`, made by `node scripts/make-typeface.mjs 600` from the licensed font file, glyphs AARON PRAKASH GANDI only), by the 3D lettering. The heading stays in the page as the visible fallback (no WebGL, reduced motion, a failed 3D layer) and is only made transparent while the 3D name is on screen. The hero's View CV and LinkedIn keys appear when `cv` and `linkedin` are set in `src/content/profile.js` (`cv` needs the PDF in `public/cv/`); GitHub stays in the nav.

## Dev hooks

- `?t=end` jumps to the settled hero; `?t=2.2` starts the opening at 2.2 s
- `?tier=high|medium|low` forces a quality tier
- `?fixed` advances exactly 1/30 s per frame (for frame-accurate screenshots)
- `window.__clock.hold = true` freezes the opening; `window.__clock.t = 2` sets the time
- With `prefers-reduced-motion`, the dial, the 3D scene and the drift are skipped and the settled hero shows immediately

## Credits

Car model: BMW 8 Series convertible by ItsDiyor (licence to confirm), repainted with a custom plate. Not affiliated with BMW AG. The portrait photo shows an M6; the animated car is the 8 Series model until an M6 model is added.
