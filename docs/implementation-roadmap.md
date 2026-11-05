# Implementation roadmap

Concrete plan to bring the reference's interaction and animation principles into the drift R3F portfolio, with a **retain / replace / redesign / introduce** verdict for each area, a technical report, and a recommended order of work.

**Status of this document:** a plan only. No production files were changed while preparing it.

Related: [reference-analysis](reference-analysis.md) · [animation-specification](animation-specification.md) · [interaction-map](interaction-map.md) · [scene-architecture](scene-architecture.md)

## 1. Existing portfolio, as read

(Read from the repo; nothing run.)

- Stack: Vite 8, React 19, three 0.184, `@react-three/fiber` 9, drei 10, `@react-three/postprocessing` 3, Lenis, Tailwind 4 (configured, CSS unused), gsap and react-router-dom (installed, unused).
- Design tokens: asphalt-950 `#07090d`, drift-red `#e10600`, signal-red `#ff3b30`, livery-sky `#3fa9f5`, signal-amber `#ffb020`; fonts Big Shoulders Display, JetBrains Mono, Manrope; eases `launch`, `brake`, `settle`, `travel`.
- Opening: 9.6 s time-based timeline driven by a shared mutable `clock` in `three/timeline.js`: procedural drifting car, smoke pool, skid marks, 3D wordmark, driver figure, damped camera parallax, quality tiers, Bloom plus Vignette, frameloop paused off-screen, dev hooks (`?t=end`, `?tier=`, `?cam=driver`, `?fixed`).
- Page: rev-counter loader, `useReveal` sections (HeroOverlay, PitCrew, Track, Garage, Finish), section-tracking nav, reduced-motion support.
- Gaps: email, LinkedIn and CV are TODOs; milestone years are `null`; no `sunny.glb`; `graphify-out` is stale; sections below the hero are ordinary stacked blocks with no scene of their own.

## 2. Retain / replace / redesign / introduce

| Area | Verdict | Detail |
|---|---|---|
| Procedural drift car, smoke pool, skid marks, 3D wordmark | **Retain** | This is your identity and already beats the reference's "photo" approach for your subject. |
| Shared `clock`, 9.6 s timeline | **Retain** | Same idea as the reference's single `T`. Extend with DOM cues. |
| Quality tiers, paused off-screen frameloop, reduced motion, dev hooks | **Retain** | Matches the reference's gating and review hooks. |
| Design tokens, fonts | **Retain** | Do not import the reference's palette or fonts. |
| Lenis | **Retain, tune** | Match damping and glide timings (see animation spec section 5). |
| Rev-counter loader | **Redesign** | Hold true black for a minimum, gate on real readiness (fonts, textures, first frame), show the bar, add a patience cap and a still fallback. |
| Hero overlay text | **Redesign** | Move from `useReveal` to class cues driven by the clock; add chips, dividers and furniture in DOM. |
| Sections below hero (PitCrew, Track, Garage, Finish) | **Redesign** | Turn each into a pinned scene (tall section plus sticky pin) with an intro on arrival. |
| Wordmark material | **Redesign** | Worn-ink or screen-print texture; cast shadow of the car across it. |
| Nav | **Redesign** | Active section from IntersectionObserver ratio, add a right-edge chapter rail shown as gears, glide on click. |
| Cursor | **Introduce** | DOM two-part cursor driven by rAF, not React state; link and press states. |
| Scroll-scrubbed chase camera and racing-line route | **Introduce** | The drift equivalent of the reference's "walk". |
| Cursor-driven mechanism | **Introduce** | Tachometer or lap-timeline hand that follows the pointer. |
| Card scenes (skills, projects) in depth | **Introduce** | DOM cards over a canvas with parallax-by-depth and sibling-recede on hover. |
| Finale push-in | **Introduce** | Scroll pushes into the cockpit; contact card as finish line. |
| Static posters and `is-fallback` styles | **Introduce** | A real fallback ladder. |
| gsap, react-router-dom, unused Tailwind | **Replace or remove** | Either adopt (gsap for non-3D timelines) or delete to cut weight. |
| Content TODOs (email, LinkedIn, CV, milestone years, `sunny.glb`) | **Fix first** | The new scenes need real content (chrono-like timeline needs years). |
| Raw WebGL, per-scene contexts, portrait video, photo cut-outs | **Do not adopt** | See scene architecture, section 2.5. |

## 3. Technical report

### What was confirmed
- The deployed reference is a vanilla-JS, raw-WebGL2, hand-built cinematic site (35 modules, about 5,600 lines, 7 CSS files, 57.6 KB CSS). [SRC]
- It renders correctly in headless Chromium with software WebGL; all five scenes drew. There were no console errors, only a GPU-stall performance warning from `readPixels` from software rendering. [OBS]
- Page weight: about 100 requests. Largest: `hero.webm` 1.48 MB, `lab_plate.jpg` 1.14 MB, `walk/frame.jpg` 0.66 MB, project art 0.35 to 0.50 MB each. [OBS]
- Document height 12,150 px on desktop (13.5 screens); shorter on phone. [OBS]

### What was not confirmed
- Real frame rate and GPU cost (no GPU in the sandbox).
- Behaviour on a real phone (mobile defects seen in emulation may be partly artefacts; the burger menu did not open under automation).
- Content of the GLSL beyond the first lines of each file.
- Link destinations of cards.
- How the packed-alpha video and cut-out art were produced (offline, presumably AI tools: **[ASSUMPTION]**).

### Risks to manage
| Risk | Mitigation |
|---|---|
| Scope creep: reference has 6 bespoke scenes | Build one reusable `Scene` wrapper, then scenes as data and a small component each |
| Performance on phones with heavy 3D | Tiers, DPR cap, one shared Canvas, pause hidden views |
| Accessibility regression | DOM for text, keyboard focus, reduced-motion path from day one |
| Copying instead of reinterpreting | Do not reuse its copy, fonts, palette, layout of cards or art |
| Content incomplete | Complete TODO content before scene 4 |

## 4. Recommended implementation sequence

Each phase is independently shippable and testable. Effort is a rough guess (S under half a day, M 1 to 2 days, L 3 or more).

| Phase | Work | Effort | Done when |
|---|---|---|---|
| 0 | Fix content gaps (email, LinkedIn, CV, years); remove or use gsap and react-router; add a design note for tokens | S | No TODOs visible |
| 1 | `useSceneClock`, `useScrollProgress`, `Scene` wrapper (pin, visibility gate, fallback class) | M | A dummy scene runs only while on screen and obeys reduced motion |
| 2 | Loader redesign: true black minimum, readiness gate, patience cap, still fallback | S | Throttled network never shows a half-built hero |
| 3 | Hero polish: DOM cues from the clock, furniture, worn-ink wordmark, cast shadow | M | Hero matches the animation spec's overlap pattern |
| 4 | Lenis tuning, nav glide, section observer, chapter rail (gears) | S | Click glides at about 1.4 s and the rail follows scroll |
| 5 | Cursor component (dot, ring, link, down), off on touch and reduced motion | S | No React re-renders from pointer movement |
| 6 | Track scene: scroll-scrubbed chase camera along `driverPath`, racing-line draw | L | Scrubbing is smooth both ways, route draws with scroll |
| 7 | Pit Crew scene: skill cards in depth, parallax by depth, hover caption | M | Hover and keyboard focus both work |
| 8 | Garage scene: project cards, sibling-recede hover, optional tachometer-hand timeline | L | All projects reachable with keyboard |
| 9 | Finish scene: push-in to cockpit, contact card as finish line | M | Contact links usable at the end state |
| 10 | Mobile pass: coarse-pointer path, portrait layouts, safe areas, weight budget | M | No horizontal overflow; under 40 requests; 60 fps on a mid phone |
| 11 | QA: Lighthouse, keyboard run-through, reduced-motion run, low-tier run | S | No blocking issues |

Suggested order of value: 2, 3, 4, 5 (quick, visible polish), then 1 and 6 (structure and signature scene), then 7 to 9, then 10 and 11.

## 5. Review hooks to add (mirroring the reference)

- `?t=<sec>` and `?t=end` per scene.
- `?scene=<id>` jumps to a scene with its clock at `live`.
- `window.__tune` object for live-tweaking uniforms.
- `?free=1` disables smooth scroll for debugging.

## 6. Open questions for you

1. Do you want a person (you) on the site at all, or keep it purely automotive? This changes the layering trick: figure in front of cards or car in front of cards.
2. Should project cards be illustrated art (as in the reference) or live screenshots and short loops?
3. Keep the site single-page, or use routes for project detail pages (react-router is already installed)?
