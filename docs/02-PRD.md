# DRIFT — Portfolio Rebuild: Product Requirements Document

**Version:** 1.0 · **Date:** 2 Nov 2026 · **Owner:** Aaron (aaronsunny007)
**Status:** Ready to build · **Budget:** £0
**Read first:** [01-PROJECT-RESEARCH.md](01-PROJECT-RESEARCH.md) (why each decision was made)

Requirement IDs (`R-…`) are referenced in the acceptance checklist (§13). "Must" means v1 ships without it only if this document is changed. "Should" means v1 target. "Could" means stretch.

---

## 1. Summary

Rebuild `portfolio-website` as a scroll-driven, 3D cinematic portfolio themed as a **drift run**. A BMW-inspired (unbadged) car drifts through five sections (Ignition, Pit Crew, The Track, The Garage, Finish Line), each presenting part of Aaron's profile as an AI / ML / security engineer. The structure and choreography rules follow the `gireeshkumarreddy/cinematic-portofilo` reference; the subject, assets and engine are new.

The site has to work for two audiences at once:

1. **The 30-second recruiter.** Name, role, top 3 projects and a contact link must be reachable within 5 seconds of landing and in at most 2 interactions.
2. **The curious engineer.** The full drift run, project spec sheets, and a "how this site was built" note.

## 2. Goals and non-goals

### 2.1 Goals

| # | Goal | Measure |
|---|---|---|
| G1 | Get Aaron interviews for AI/ML engineering, AI security and MLOps roles | Recruiters reach a project or CV link; tracked via analytics events |
| G2 | Show the strongest work first | Top 6 projects are the newest, strongest repos (see doc 03) |
| G3 | Be memorable | The drift concept is visible within 3 seconds of first paint |
| G4 | Be fast and accessible despite the 3D | Budgets in §9; Lighthouse mobile Perf ≥ 85, A11y ≥ 95 |
| G5 | Be cheap to update | Adding a project = editing one data file plus one image |

### 2.2 Non-goals (v1)

- An open-world driving game (a guided run only; free drive is a "Could", §6.7).
- A blog or CMS.
- A backend. The site is fully static.
- Multi-language support.
- Reproducing the reference repo's custom WebGL engine.

## 3. Audience and key journeys

| Persona | Wants | Journey |
|---|---|---|
| Recruiter / talent partner | Role fit, location, availability, CV | Land → read hero line → "View CV" or "Skip to Garage" → open 1 project → email |
| Hiring manager / engineer | Depth, code quality, results | Land → full scroll → open 2–3 spec sheets → GitHub → "How this was built" |
| Peer / community | The effect | Full scroll → share link (needs a good Open Graph image) |

**R-J1 (Must):** From landing, a visitor can reach the CV, the GitHub profile and the email in one click each, at all times (persistent nav).
**R-J2 (Must):** "Skip intro" is visible from the first frame; the intro never blocks scrolling.

## 4. Concept

> A portfolio you watch like a drift run: the car carries you from ignition to the finish line, and each corner is a part of your career.

Tagline (draft, edit freely): **"Controlled chaos. AI systems that stay in line when things go sideways."**

### 4.1 Standing creative rules (apply to every section)

Adapted from the reference repo's `docs/PROMPTS.md`.

1. **R-C1** Entrances are choreographed: darkness → light → atmosphere → elements → settle → idle life. No plain fade-ins. A reveal takes about 1.5–2.5 s.
2. **R-C2** A set of items (cards, chips, bays) enters as **one event** driven by one shared progress value. Per-item variation is in path and rotation, not in start time (max 120 ms spread).
3. **R-C3** The car is the main character. Layer order in hero shots: background → giant wordmark → car → smoke → HUD labels → nav.
4. **R-C4** One palette per section (§7.1). Restrained; one accent colour at a time.
5. **R-C5** Portrait screens get their own composition. Never scale the desktop layout down.
6. **R-C6** Entrances are time-based (fire on enter); travel inside a section is scroll-based (scrubbed).
7. **R-C7** Nothing renders or decodes off-screen.
8. **R-C8** All readable text is DOM, never baked into a texture, except the giant wordmark, which has an `sr-only` DOM twin.
9. **R-C9** Motion has weight. Use accelerate/brake eases and settle-overshoot (`back.out(1.4)`, `power3.inOut`); no linear easing for objects.
10. **R-C10** No BMW logos, roundels or model names anywhere (§7.5).

## 5. Information architecture

```
/                       Single scroll page: the drift run
  #ignition             S0  Hero / loader
  #pit-crew             S1  About + toolkit
  #track                S2  Timeline (education, work, milestones)
  #garage               S3  Projects
  #finish               S4  Contact / footer
/garage/:slug           Project spec sheet (one per project, deep-linkable)
/build                  "How this site was built" (short write-up; Should)
/cv                     Redirect or link to /cv/Aaron-CV.pdf
404                     "You've gone off track" with a link home
```

**R-IA1 (Must):** Each section has an anchor; the URL hash updates as you scroll (`history.replaceState`, no history spam).
**R-IA2 (Must):** `/garage/:slug` works on direct load and refresh (GitHub Pages needs a `404.html` SPA fallback or hash routing; pick one in Phase 0).
**R-IA3 (Must):** Persistent nav: wordmark (home), Garage, Track, About, Contact, CV, plus a sound toggle and a "Reduce motion" toggle.
**R-IA4 (Should):** A mini track map with sector markers (S0–S4) acts as a scroll progress indicator and jump nav.

## 6. Section specifications

Timings are seconds from section entry. Each section must also define its reduced-motion state (§10).

### 6.0 Ignition (S0): loader and hero

**Purpose:** Name, role, concept, all in under 3 seconds.

**Loading state (R-S0-1, Must):**
- The HTML shell paints immediately with: name, role line, "Skip to Garage", nav. This is the LCP element. No blank screen while 3D loads.
- A tachometer (SVG) sweeps 0 → redline → back (real-car needle sweep, ~0.9 s), then its fill tracks real loading progress (drei `useProgress`).
- If 3D isn't ready after 4 s, keep the HTML hero and load 3D behind it. Never block.

**Beats (R-S0-2, Must):**

| t (s) | Beat |
|---|---|
| 0.0 | Black. Faint engine idle (only if sound is on). |
| 0.3 | Two headlight flares bloom from the dark, far away |
| 0.6 | Car launches toward camera, swings sideways into a drift, smoke trails off the rear wheels |
| 1.6 | Car settles sideways in front of the frame on its suspension (overshoot); smoke rolls forward |
| 1.4–2.4 | Giant **AARON** wordmark rises behind the car, dissolving from blur to sharp (the car occludes part of it) |
| 2.2 | HUD chips snap in: role chips ("AI Engineer", "AI Security", "MLOps"), location chip ("Belfast, NI"), status chip ("Open to roles: [month 2027]") |
| 2.6 | Nav rule draws left → right; nav items fade up |
| 3.0+ | Idle life: smoke drifts, headlights pulse slightly, car idles (micro-bob), pointer parallax ±1.5° camera |

**Content (R-S0-3, Must):**
- `h1` (DOM): "Aaron [surname]: AI Engineer" (final name per open question Q1)
- Sub-line: tagline (§4)
- CTAs: **"Enter the Garage"** (scrolls to S3), **"Download CV"**
- Scroll cue: "Scroll to drive" with an animated down chevron

**Interaction:** Pointer parallax on desktop; device tilt is off by default (permission prompts are annoying).

**Mobile (R-S0-4, Must):** Camera moves back and higher; wordmark stacks if needed; car is front-three-quarter so it fills a tall frame; chips go below the car in a row.

**Skip (R-S0-5, Must):** Returning visitors (`sessionStorage` flag) and `?t=end` see the settled state at once.

### 6.1 Pit Crew (S1): about and toolkit

**Purpose:** Who Aaron is, in 3 short paragraphs, plus what he builds with.

**Layout:** Pinned section (~200svh). Camera orbits slowly round the parked car (scroll-scrubbed). Left: "Driver profile" card (DOM). Right: toolkit grid.

**Driver profile card (R-S1-1, Must):** Styled like a racing licence. Photo (optional), name, "Class: AI Engineer", base: Belfast, education: MSc Artificial Intelligence, Ulster University; background: BSc Computer Science + Cybersecurity [confirm]. Then 3 short paragraphs (rewrite the current bio; keep the football + biriyani line).

**Toolkit (R-S1-2, Must):** 12–16 tools in 4 groups: **Engine** (Python, PyTorch, scikit-learn, LLM APIs), **Chassis** (FastAPI, Docker, GitHub Actions, Azure Databricks), **Safety systems** (MCP security, red-teaming, OWASP, AIF360), **Telemetry** (MLflow, Unity Catalog, dashboards). Adjust to the truth. Each chip shows the tool name and, on hover/focus, "Used in: Warden, Ledger".
- No percentage bars or star ratings (R-S1-3, Must).
- Chips enter as **one event** (R-C2): all rise together from the floor with slight per-chip rotation, settle, then float gently.

**3D:** A light-trail ribbon (the reference's red energy line) traced by a "ghost lap" around the parked car; trail cools from white → accent → dark as it ages.

**Mobile:** Profile card first, toolkit as a horizontally scrollable strip below; car stays as background.

### 6.2 The Track (S2): timeline

**Purpose:** Education, roles, and milestones, as corners of a track.

**Layout:** Pinned section (~300svh). The car drives a closed track (top-down three-quarter camera); scroll moves the car along it. Each corner = one milestone. Foreground: a large tachometer whose needle points at the current year.

**Beats (R-S2-1, Must):**

| Phase | What happens |
|---|---|
| Entry (time-based, ~2 s) | Track outline draws itself in light; sector markers pop in as one event; tacho fades up with a needle sweep |
| Scrub (scroll) | Car drives the track with drift on every corner (slip, counter-steer, smoke, skid marks). Passing a corner lights its milestone card. Needle swings to that year. |
| Exit | Car leaves the track toward the garage door (transition to S3) |

**Pointer mode (R-S2-2, Should):** On desktop, after the entry, moving the cursor along the tachometer arc also drives the needle (projected onto the arc, not raw X, as in the reference's clock). The active year's card lights. Hand-over from scroll to pointer is blended (no jumps).

**Milestones (R-S2-3, Must):** 5–8 entries, each with year, title, org, one-line outcome, optional link. Draft list (fill in real dates):
1. [Year] BSc Computer Science + Cybersecurity, [University]
2. [Year] First ML project shipped (loan-default-prediction)
3. [Year] MSc Artificial Intelligence starts, Ulster University
4. [Year] Robotics & AI coursework: autonomous warehouse robot (group project)
5. 2026 Financial-NRF dissertation + paper draft
6. 2026 Tom & Ollie storefront relaunch (real client)
7. 2026 Warden / AEGIS: validation-gated AI security agents
8. [Next] "Next corner": what role you're looking for

**Mobile (R-S2-4, Must):** The track becomes a vertical rail on the left with year tap targets; one milestone card at a time on the right (reference scene 3 portrait pattern). Car icon moves down the rail.

### 6.3 The Garage (S3): projects

**Purpose:** The main event. Show the work and get clicks to GitHub/demos.

**Layout:** A dark garage with wet floor. The car parks centre. Project "bays" stand in an arc around it (like the reference's amphitheatre of screens), each a lit panel showing the project image. Featured projects stand nearer and larger.

**Beats (R-S3-1, Must):**

| t (s) | Beat |
|---|---|
| 0.0 | Black. Garage door rolls up (light spills under it first) |
| 0.6 | Overhead strip lights flicker on in sequence, front to back |
| 1.0 | Floor circle under the car ignites with a travelling spark |
| 1.2–2.2 | All bays rise from below **as one event** with rotation, blur → sharp, small overshoot |
| 2.4+ | Idle: bays float out of phase; wet-floor glints; pointer parallax by depth (near bays move most) |

**Bay interaction (R-S3-2, Must):**
- Hover/focus: bay lifts toward camera, others ease back and dim; class badge and one-line summary appear.
- Click/Enter: opens `/garage/:slug` spec sheet (§6.3.1). Camera dollies into the bay during the route transition.
- Each bay is a real `<a>` element positioned over the 3D panel (DOM over canvas, same mapping), so keyboard and screen readers work.

**Filters (R-S3-3, Should):** Filter chips by area: All · AI Security · LLM / RAG · MLOps & Data · Robotics · Web. Changing filter re-forms the arc as one event.

**Projects shown (R-S3-4, Must):** The 6 "Pro" class projects as featured bays, then the rest in a second row or a "Full garage" list view. See doc 03 for the list and classes.

**List view (R-S3-5, Must):** A toggle switches to a plain, fast, accessible list (title, class, one line, links). This is also the reduced-motion and low-tier default.

**Mobile (R-S3-6, Must):** Bays become a vertical stack of cards with a swipe carousel for featured; car shrinks to a header strip.

#### 6.3.1 Project spec sheet (`/garage/:slug`)

Like a car brochure spec page. **R-S3-7 (Must)** content blocks:

1. Header: title, class badge, one-line pitch, links (GitHub, demo, paper)
2. Hero media: screenshot, GIF or short muted loop (≤ 2 MB)
3. **Spec table:** Problem · What I built · Result (numbers where they exist, e.g. Ledger "85.5% on 207 scored test questions") · Stack · My role (say "group project" where true) · Year
4. "Under the hood": 3–5 bullets on the hard part
5. Next / previous project ("Next bay →")

Spec sheets are DOM pages over a dimmed, slowly rotating 3D garage (or a static image on low tier).

### 6.4 Finish Line (S4): contact

**Purpose:** Convert. Email, CV, LinkedIn, GitHub.

**Beats (R-S4-1, Must):** Car crosses a chequered line, does a slow donut, parks in a cloud of backlit smoke under a giant wordmark; the smoke parts to reveal the contact row (reference finale pattern: content surfaces through the fog).

**Content (R-S4-2, Must):**
- Heading: "Let's build something that holds the line." (draft)
- Email with a **copy** button (shows "Copied" toast) and `mailto:` link
- Buttons: CV (PDF), GitHub, LinkedIn
- Availability line and location
- Footer: "© 2026 Aaron [surname] · Not affiliated with BMW AG · Car model by [author], [licence] · Built with three.js, R3F, GSAP"
- Link to `/build`

### 6.5 Global elements

- **R-G1 (Must)** Nav (§5). Shrinks to a burger on narrow screens; the menu is a full-screen overlay with focus trap.
- **R-G2 (Must)** Sector progress map (desktop) / thin progress bar (mobile).
- **R-G3 (Should)** Sound: off by default, toggle in nav, remembered in `localStorage`. Engine idle in S0, tyre squeal tied to slip amount, garage ambience in S3. All CC0.
- **R-G4 (Must)** Custom cursor is **not** required; if added, it must never hide the system cursor on form fields or links.
- **R-G5 (Could)** Konami-style easter egg: pressing `D` triggers a donut wherever the car is.

### 6.6 "How this site was built" (`/build`, Should)

One page: concept, stack, performance numbers, the drift maths (slip angle from curvature, counter-steer), credits and licences. Engineers love this, and it doubles as a project.

### 6.7 Free drive mode (Could, post-v1)

"Take the wheel" button in S4 → a small arena using `@react-three/rapier` raycast vehicle, keyboard/touch controls, skid marks and smoke reused from the run. Lazy-loaded chunk. Desktop only unless mobile performance passes budget.

## 7. Design system

### 7.1 Colour tokens

Defined as CSS variables on `:root`, mirrored in a `theme.ts` for 3D materials.

| Token | Value (starting point) | Use |
|---|---|---|
| `--asphalt-950` | `#07090D` | Page background (tinted, not pure black) |
| `--asphalt-900` | `#0E1117` | Panels |
| `--asphalt-700` | `#262B33` | Rules, borders |
| `--chalk-100` | `#EDEFF2` | Primary text (tinted, not pure white) |
| `--chalk-400` | `#9AA1AC` | Secondary text |
| `--livery-sky` | `#3FA9F5` | Accent 1 (S1 Pit Crew, links) |
| `--livery-navy` | `#1C3F94` | Accent 2 (S2 Track) |
| `--livery-red` | `#E2231A` | Accent 3 (S0 Ignition, S4 Finish, brake lights) |
| `--signal-amber` | `#FFB020` | Sodium lights, warnings, S3 Garage |

Rules: one accent per section (R-C4); text contrast ≥ 4.5:1 (body) and ≥ 3:1 (large); the three livery colours appear together only as a thin stripe motif, never as a logo.

### 7.2 Typography

Free, self-hosted via Fontsource. Pick one from each row and test with real copy:

| Role | Options | Notes |
|---|---|---|
| Display (wordmark, section titles) | Big Shoulders Display 800–900, Anton, Saira Extra Condensed 800 | Condensed, heavy, motorsport feel |
| HUD / telemetry | JetBrains Mono, IBM Plex Mono, Space Mono | Numbers, labels, sector codes; tabular figures |
| Body | Manrope, Geist, IBM Plex Sans | Avoid Inter and Orbitron (overused; Impeccable flags them) |

Scale: fluid with `clamp()`. Wordmark ~ `clamp(5rem, 22vw, 22rem)`; body 16–18px; HUD labels 11–12px uppercase with 0.12em tracking.

### 7.3 Spacing, grid, motion tokens

- 4px base spacing; 12-column grid on desktop, 4 on mobile; 16px side gutter minimum on mobile.
- Motion tokens: `--dur-fast: 160ms`, `--dur-ui: 280ms`, `--dur-reveal: 1800ms`; eases `launch: power3.in`, `brake: power3.out`, `settle: back.out(1.4)`, `travel: power2.inOut`.

### 7.4 Components

HUD chip · Section header (sector code + title + rule) · Driver licence card · Tool chip · Milestone card · Project bay · Class badge · Spec table · Primary/secondary button · Copy-email field · Toast · Nav · Sector map · Sound toggle · Motion toggle · Tachometer (SVG). Each gets default, hover, focus-visible, active and disabled states.

### 7.5 Project classes (replaces BMW model names)

| Class | Meaning | Badge |
|---|---|---|
| **PRO** | Flagship: original, measured results, strongest code | Red badge, featured bay |
| **COMPETITION** | Strong, complete, real users or real data | Navy badge |
| **SPORT** | Solid coursework or focused build | Sky badge |
| **STREET** | Early or learning projects | Grey badge; list view only |

## 8. Technical requirements

### 8.1 Stack

Vite · React 19 · TypeScript · three.js · @react-three/fiber · @react-three/drei · @react-three/postprocessing · GSAP 3 (+ ScrollTrigger, SplitText, `@gsap/react`) · Lenis · zustand · Tailwind 4 · react-router-dom (or hash routing for Pages) · dev only: leva, r3f-perf, Playwright.

Remove: `@studio-freight/lenis`, `three-stdlib` (drei covers it), and `framer-motion` unless kept as `motion` for UI presence only (decide in Phase 0; one owner per kind of motion).

### 8.2 Folder structure

```
src/
  app/            App.tsx, routes, providers (Lenis, GSAP registration)
  content/        projects.ts, milestones.ts, toolkit.ts, profile.ts   ← all copy lives here
  design/         tokens.css, theme.ts
  components/     DOM UI (Nav, HudChip, ProjectBay, SpecSheet, …)
  sections/       Ignition, PitCrew, Track, Garage, Finish (DOM layer per section)
  three/
    Stage.tsx     the single <Canvas>, quality tier, post-processing
    car/          Car.tsx (from gltfjsx), useDrift.ts, Wheels.ts
    fx/           SkidMarks.tsx, TyreSmoke.tsx, LightTrail.tsx
    scenes/       IgnitionScene, PitCrewScene, TrackScene, GarageScene, FinishScene
    track/        trackCurve.ts (CatmullRom points), corners.ts
  timeline/       per-section GSAP timelines (every beat in one file per section)
  state/          useScene.ts (zustand: section, progress, tier, sound, reducedMotion)
  lib/            quality.ts, devHooks.ts (?t=, __shot), a11y.ts
public/
  models/car.glb (≤ 2.5 MB)  env/  projects/<slug>.webp  cv/  og/
docs/
```

### 8.3 Rendering architecture

- **R-T1 (Must)** One `<Canvas>`, fixed behind the DOM, `dpr` from quality tier, `gl={{ antialias: false, powerPreference: 'high-performance' }}`, SMAA or FXAA in post if needed.
- **R-T2 (Must)** Scene switching by section: each scene mounts when its section is within one viewport of view and unmounts (and disposes) when two away. The car is one instance that persists across scenes.
- **R-T3 (Must)** No React state updates inside `useFrame`. Scroll progress lives in zustand and is read with `getState()` in the frame loop.
- **R-T4 (Must)** All animation uses `delta`, never frame counts.
- **R-T5 (Must)** Lenis drives scroll; GSAP ticker drives Lenis (one RAF loop); ScrollTrigger pins sections with `position: sticky` containers. `body` uses `overflow-x: clip`, never `hidden`.
- **R-T6 (Must)** When the tab is hidden or the canvas is fully covered (spec sheet open on mobile), `frameloop` switches to `"demand"`.
- **R-T7 (Must)** Quality tiers (High / Medium / Low) per research §4.2(i), picked at start and adjusted by `PerformanceMonitor` (max 2 flips, then lock).
- **R-T8 (Must)** WebGL failure (no context, context lost) falls back to a static poster image per section plus the full DOM content.

### 8.4 Drift system

- **R-D1 (Must)** Track is a closed `CatmullRomCurve3`; car pose from scroll-driven `u` with damped slip angle from signed curvature, body roll, counter-steered front wheels, wheel spin from distance (research §4.2a).
- **R-D2 (Must)** Skid marks: ring buffer per rear wheel (max ~400 samples), ribbon mesh rebuilt per frame, fade with age, laid only when `|slip| > 0.25`.
- **R-D3 (Must)** Tyre smoke: instanced billboards, count from quality tier, spawned proportional to slip.
- **R-D4 (Should)** Brake lights brighten (bloom) when the car decelerates into a corner.
- **R-D5 (Should)** Camera rig: chase camera with damped follow and a slight lag on yaw, so drifts read as sideways relative to the camera.

### 8.5 Content model

```ts
// src/content/projects.ts
export type ProjectClass = 'PRO' | 'COMPETITION' | 'SPORT' | 'STREET';
export type Area = 'ai-security' | 'llm-rag' | 'mlops-data' | 'robotics' | 'web' | 'ml';

export interface Project {
  slug: string;            // 'warden'
  title: string;           // 'Warden'
  class: ProjectClass;
  areas: Area[];
  year: number;
  pitch: string;           // one line, ≤ 110 chars
  problem: string;
  built: string;
  result: string;          // numbers where they exist
  hardPart: string[];      // 3–5 bullets
  stack: string[];
  role: 'Solo' | 'Group' | 'Client';
  links: { github?: string; demo?: string; paper?: string };
  image: string;           // /projects/warden.webp, 1600×1000
  featured?: boolean;
}
```

- **R-CM1 (Must)** All copy lives in `src/content/`. No strings hard-coded in scenes.
- **R-CM2 (Should)** A build-time script (`scripts/fetch-github.mjs`) pulls each repo's last-pushed date and stars from the public GitHub API into `src/content/github.json`. Unauthenticated limit (60 req/h) is enough. Failing fetch must not fail the build.

### 8.6 Dev tooling (Must)

- `?t=<seconds>` starts the current section's timeline there; `?t=end` jumps to settled.
- `?tier=low|medium|high` forces a quality tier.
- `window.__shot(name)` saves a canvas screenshot (dev only).
- leva panel for slip gain, smoke count, camera lag, bloom (dev only).
- Playwright script: screenshot each section at 390×844, 820×1180, 1440×900, in both normal and reduced motion.

## 9. Performance budget

| Metric | Budget | Enforced by |
|---|---|---|
| First view transfer | ≤ 5 MB | Lighthouse / DevTools in CI check |
| Initial JS (gzip) | ≤ 350 KB; 3D in a lazy chunk | `vite build` report |
| Car GLB | ≤ 2.5 MB (meshopt/Draco + WebP/KTX2) | file size check in CI |
| Project images | ≤ 200 KB each, WebP/AVIF, `loading="lazy"` | |
| Any video | ≤ 2 MB, muted, `playsinline`, poster, no audio track | |
| LCP (mobile, 4G) | ≤ 2.5 s | Lighthouse CI |
| CLS | ≤ 0.05 | Lighthouse CI |
| FPS | 60 desktop (mid laptop), ≥ 30 mid Android | r3f-perf manual check per section |
| Draw calls | ≤ 150 | r3f-perf |
| Lighthouse mobile | Perf ≥ 85, A11y ≥ 95, BP ≥ 95, SEO 100 | Lighthouse CI |

## 10. Accessibility and reduced motion

- **R-A1 (Must)** `prefers-reduced-motion: reduce` **or** the nav toggle → no scroll-jacking, no camera travel, no parallax, no smoke; each section shows its settled frame (static render or poster) with content fully visible. Lenis off.
- **R-A2 (Must)** Every interactive element is reachable and operable by keyboard, with a visible focus ring (2px livery-sky outline + offset).
- **R-A3 (Must)** Canvas has `aria-hidden="true"`; all meaning is in DOM. Real headings in order (`h1` once, `h2` per section).
- **R-A4 (Must)** Skip link to main content; skip intro link (R-J2).
- **R-A5 (Must)** Colour contrast per §7.1.
- **R-A6 (Must)** No flashing more than 3 times per second (headlight flicker, light strips).
- **R-A7 (Must)** Sound never autoplays.
- **R-A8 (Should)** Garage list view (R-S3-5) is the screen-reader default (`<ul>` of links), with 3D bays marked as presentational duplicates.

## 11. SEO and sharing

- **R-SEO1 (Must)** `<title>`: "Aaron [surname]: AI Engineer · Portfolio"; meta description (≤ 155 chars); canonical URL.
- **R-SEO2 (Must)** Open Graph + Twitter card image (1200×630): the hero frame, car in front of the wordmark. One per project page too (can be the project image).
- **R-SEO3 (Should)** JSON-LD `Person` schema with `sameAs` GitHub and LinkedIn.
- **R-SEO4 (Must)** `robots.txt`, `sitemap.xml`, favicon set, `theme-color`.
- **R-SEO5 (Should)** Pre-render the DOM content of `/` and each `/garage/:slug` at build time (e.g. `vite-plugin-ssg` or a small Playwright prerender script) so crawlers and link previews see real text.

## 12. Delivery plan

Each phase ends with a deploy to the live URL. Estimated effort assumes part-time solo work with Claude.

| Phase | Scope | Exit criteria | Est. |
|---|---|---|---|
| **0. Clean-up** | Delete dead components and the 7 MB of loose textures; remove duplicate packages; fix `overflow-x`; add TS; folder structure (§8.2); content files with real copy; GitHub Pages deploy via Actions; decide routing (R-IA2) and name (Q1) | Site deploys from `main`; lint clean; no unused files | 2–3 days |
| **1. Content-first site** | All five sections as **DOM-only** with final copy, design tokens, nav, list-view garage, spec sheets, contact, SEO. No 3D yet. | A recruiter could use it today. Lighthouse ≥ 95 on all four. | 4–6 days |
| **2. Asset pipeline** | Car model chosen + licence confirmed; badges/plate swapped in Blender; gltfjsx transform; Lightformer environment; project images at 1600×1000 WebP | `car.glb` ≤ 2.5 MB; renders correctly in a test scene | 2–3 days |
| **3. Stage + Ignition** | Single canvas, quality tiers, Lenis/GSAP wiring, dev hooks, S0 full choreography, loader tacho | S0 beats match §6.0 at 3 viewports; 60 fps desktop | 4–5 days |
| **4. Drift system + Track** | Track curve, drift pose, skid marks, smoke, chase cam, S2 timeline and tacho pointer mode | Car reads as drifting (counter-steer visible); S2 portrait rail works | 5–7 days |
| **5. Garage + Pit Crew + Finish** | S3 bays + hover + route dolly, S1 toolkit event + light trail, S4 donut + smoke reveal | All "Must" section requirements pass | 6–8 days |
| **6. Polish + QA** | Sound, reduced-motion pass, a11y audit, Lighthouse CI, Playwright screenshots, copy pass with humanizer, `/build` page, OG images | §13 checklist all green | 3–4 days |
| **7. Stretch** | Free drive mode, easter egg, filters animation | | optional |

**Phase 1 matters most.** It makes the site useful even if the 3D phases take longer than planned.

## 13. Acceptance checklist

- [ ] R-J1, R-J2: CV, GitHub, email are one click from anywhere; intro is skippable from frame one
- [ ] S0 name + role + CTA visible as HTML within 1 s on 4G throttling, before 3D loads
- [ ] All section beats match §6 timing tables within ±0.3 s
- [ ] Card/chip/bay sets enter as one event (R-C2)
- [ ] Car drifts with visible counter-steer, smoke and skid marks on every Track corner
- [ ] Every project bay is a keyboard-focusable link; Enter opens its spec sheet
- [ ] Garage list view works with 3D disabled
- [ ] `/garage/:slug` loads directly and on refresh
- [ ] Reduced motion: no camera travel, no scroll-jacking, all content visible (R-A1)
- [ ] No BMW logos, roundel or model names anywhere; footer disclaimer and model credit present
- [ ] Budgets in §9 met; Lighthouse mobile Perf ≥ 85, A11y ≥ 95, BP ≥ 95, SEO 100
- [ ] Playwright screenshots at 3 viewports × 2 motion modes reviewed, no overlaps or clipped text
- [ ] WebGL disabled in browser → site fully usable with posters (R-T8)
- [ ] `/code-review` and `/security-review` pass with no open high findings
- [ ] Every project in `projects.ts` has a working GitHub link and an image
- [ ] Copy reviewed for AI-sounding phrasing

## 14. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Car model licence unclear | High | High | Phase 2 gate: no model ships without a confirmed licence |
| 3D phases overrun | High | Medium | Phase 1 ships a complete DOM site first |
| Mobile GPUs too slow for smoke + reflections | Medium | Medium | Quality tiers; low tier is static posters |
| Scroll-jacking annoys users | Medium | Medium | Pins are short (≤ 300svh); skip links; reduced-motion toggle |
| GSAP + Lenis + R3F jank | Medium | Medium | One RAF loop (R-T5); no React state in frame loop (R-T3) |
| BMW trademark complaint | Low | Medium | R-C10, footer disclaimer, unbadged model |
| Content gets stale | Medium | Low | Content files + GitHub fetch script |

## 15. Open questions (answer before Phase 0 ends)

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | Public name: "Aaron Sunny" or "Aaron Prakash Gandi"? (The current site uses both.) | Use the name on your CV and LinkedIn |
| Q2 | Exact years for degree, MSc start/end, and any jobs/internships? | Placeholders stay in `milestones.ts` |
| Q3 | Target roles and availability date? | "AI Engineer / AI Security / MLOps · Open to roles" |
| Q4 | Keep the existing car model (needs licence) or replace? | Replace with a CC BY / CC0 model |
| Q5 | Keep the intro video at all? | No; the 3D Ignition replaces it |
| Q6 | Custom domain? | `aaronsunny007.github.io` |
| Q7 | Wordmark text: first name, full name, or a handle? | "AARON" |
| Q8 | LinkedIn URL and CV PDF | Needed for S4 |
