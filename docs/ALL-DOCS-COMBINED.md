# Portfolio Rebuild: All Docs (combined)

This file contains three documents, one after another:
1. Project Research
2. Product Requirements Document (PRD)
3. GitHub Projects Update Checklist



---
---

<!-- FILE: 01-PROJECT-RESEARCH.md -->

# DRIFT — Portfolio Rebuild: Project Research

**Owner:** Aaron (aaronsunny007) · **Date:** 2 Nov 2026 · **Budget:** £0
**Companion docs:** [02-PRD.md](02-PRD.md) (what to build) · [03-GITHUB-PROJECTS-UPDATE.md](03-GITHUB-PROJECTS-UPDATE.md) (repo clean-up)

---

## 0. TL;DR

- The current site works only as a demo. The app shows an 11-second, 28 MB video, then a name animation, then a static list of cards. Most of the 3D work (the drifting BMW scene, the hero, the garage carousel) is written but never shown.
- Keep the stack you already have (Vite, React, React Three Fiber, GSAP, Lenis). It's the right stack for a car-centred 3D site. The reference repo is hand-written WebGL with about 5,400 lines of shader code. Copy its **direction and rules**, not its engine.
- The concept is a **drift run**. The visitor scrolls, and the car carries them through five sections: Ignition → Pit Crew → The Track → The Garage → Finish Line. Every section is a moment in a drift event, the same way the reference repo makes every section a scene in a film.
- Everything you need is free: CC0 HDRIs and textures (Poly Haven, ambientCG), free hosting (GitHub Pages or Cloudflare Pages), GSAP (all plugins free since 2025), and a set of free Claude skills listed in §7.
- The biggest wins, in order: (1) show your real work fast (recruiters give you ~30 seconds), (2) cut the load from ~45 MB to under 5 MB, (3) add the 6 strong projects missing from the site (Warden, Ledger, Financial-NRF, AEGIS, PulseCity, Tom & Ollie), (4) then the 3D drift polish.

---

## 1. Audit of the current repo (`aaronsunny007/portfolio-website`)

Measured on the `claude/zen-knuth-1oqvrt` branch, commit `e267a05` ("initial portfolio").

### 1.1 What's there

| Area | Finding |
|---|---|
| Stack | Vite 8, React 19, Tailwind 4, R3F 9, drei 10, postprocessing, GSAP 3.15, Framer Motion 12, Lenis, react-router-dom 7 |
| What actually renders | `App.jsx` → `IntroSequence` (video, then name) → `AboutPage` (bio + 12 project cards). Nothing else. |
| Unused components | `BMWScene.jsx`, `Hero.jsx`, `IntroScene.jsx`, `Projects.jsx`, `Navbar.jsx`, `pages/Home.jsx`, `pages/Garage.jsx`, `App.css`, `assets/hero.png` |
| JS bundle | 325 KB (104 KB gzip), and that's *without* three.js, because the 3D scenes are never imported |
| Intro video | `public/videos/Video Project 3.mp4`: 1920×1080, 11 s, **21 Mbit/s, 28 MB**, has an audio track that's never played (autoplay is muted) |
| Car model | `public/models/MDL14063_reversed.glb`: **10 MB**, ~361k vertices, 4 meshes, 8 embedded textures, includes a Russian number-plate texture (`nomerSHAX`). Source and licence unknown. |
| Dead weight | 13 loose texture files in `public/models/` (~7 MB) duplicate the textures already embedded in the GLB. Nothing references them. |
| Lint | 1 warning: missing `onFinish` dependency in `IntroSequence` |
| SEO | `<title>portfolio-website</title>`, no description, no Open Graph image; README is the Vite template |

### 1.2 Problems, ranked

1. **Time to content is about 17 seconds**, and the intro can't be skipped. The video runs 11 s, then the timers add 6 s more before the bio appears. A recruiter on a phone will leave before then.
2. **Load weight is about 45 MB** (video + GLB + loose textures). On 4G that's 30+ seconds. Target: under 5 MB for the first view.
3. **The concept isn't on screen.** The "drift" and "BMW" ideas live in `BMWScene.jsx`, which never renders. Visitors see pink neon cards.
4. **Mixed visual identities.** Pink/purple neon (`#FF3CAC`, `#9D4DFF`) in the intro and about page, cyan in `Hero.jsx`, red/cyan in `BMWScene.jsx`. None of these reads as motorsport or BMW M.
5. **Names don't match.** The intro says "AARON SUNNY" and the about page says "Aaron Prakash Gandi". Pick one public name (see PRD open questions).
6. **The buttons do nothing.** "ENTER MACHINE" and "SOURCE" on every card have no `href`. Twelve projects and zero links to GitHub.
7. **The strongest projects are missing.** Warden, Ledger, Financial-NRF (with a paper and a live demo), AEGIS, PulseCity and Tom & Ollie are all newer and better than half the listed cards. Details in doc 03.
8. **Trademark exposure.** Tier labels like "M5 COMPETITION" and "M8 COMPETITION" plus "BMW M SERIES" copy use BMW's marks directly. BMW enforces the M logo, including over use on websites (see §4.3).
9. **Two animation systems and two Lenis packages.** `framer-motion` and `gsap` both installed; `lenis` and the deprecated `@studio-freight/lenis` both installed.
10. **`overflow-x: hidden` on `body`** in `index.css`. The reference repo's README calls out that this breaks every `position: sticky` pin. Use `overflow-x: clip`.
11. **Timers without cleanup.** `setTimeout` in `useEffect` without clearing; with React StrictMode in dev, `onFinish` can fire twice.
12. **The drift scene has no camera direction.** The car follows `Math.sin` curves while OrbitControls lets the user drag it away. No skid marks, no smoke, no track. It reads as a car floating on a sine wave.

### 1.3 What's worth keeping

- The project write-ups in `AboutPage.jsx` are a good starting point (rewrite them with outcomes; see doc 03).
- The bio paragraphs (Ulster University MSc AI; CS + Cybersecurity background; the football and biriyani line is a good human detail, keep it).
- The "tier" idea, where projects are ranked like a car range. Keep the idea and change the labels so they don't use BMW marks.
- The stack.

---

## 2. Reference repo teardown (`gireeshkumarreddy/cinematic-portofilo`)

Cloned and read in full. It's a five-scene cinematic portfolio for a creative ("GIREESH — Artist · Creative · Storyteller").

### 2.1 How it's built

- **No framework, no build step.** Plain ES modules, a custom WebGL renderer (`src/gl/`), shaders inside JS template literals, about 5,400 lines across 37 files.
- **One scene per folder** (`scene/`, `scene2/` … `scene6/`), each with a `boot` (lifecycle), a `timeline` (every beat in seconds), a `layout` (measured geometry) and shaders.
- **Python offline pipeline** (`tools/`): removes the white background from studio video (`matte.py`), packs colour + alpha side by side into one H.264 file so transparency works in Safari, tracks the subject's feet per frame, and cuts reference images into layered sprites.
- **A directing log** (`docs/PROMPTS.md`) records the brief for each scene plus a set of standing rules applied to every scene.

### 2.2 The scenes

| # | Scene | What happens | Your drift version |
|---|---|---|---|
| 1 | Opening | Black → man walks out of darkness → giant red GIREESH rises behind him → chips/arrows fly in → header draws itself → breathes | **Ignition**: black → headlights → car drifts in → giant AARON wordmark behind it → HUD chips snap in → nav draws in |
| 2 | Creative universe | 12 tool cards materialise together as one event; red energy ribbon | **Pit Crew**: your tools/stack as one coordinated reveal; a light-trail ribbon traced by the car |
| 3 | Time machine | Giant clock; cursor drives the hand across 2021–2026; matching year card lights up | **The Track**: a giant tachometer; cursor or scroll swings the needle across your years; each "corner" of the track is a milestone |
| 4 | Project universe | Amphitheatre of 12 project screens around the creator; pointer parallax by depth; hover lifts a card | **The Garage**: project bays arranged around the car; hover pulls a bay forward |
| 6 | Finale | Smoking man in front of a giant wordmark in red fog; contact row | **Finish Line**: car parked under the wordmark in tyre smoke; contact, CV, socials |

### 2.3 Borrow these (rules, not code)

From `docs/PROMPTS.md` and the README:

1. **Entrances are choreographed, never plain fades:** darkness → light → atmosphere → elements → settle → subtle continuous life. About 2 seconds per reveal.
2. **A set of cards appears as one event**, never one by one in a queue. One shared progress value that every card reads, with small per-card variation in *how* it travels.
3. **The hero object goes in front of the wordmark.** Layer order: background → giant name → car → labels → header. This is what makes the reference's hero look like a poster instead of a web page.
4. **Strict palette per scene.** Restrained, not flashy.
5. **Portrait gets its own composition.** On a phone the timeline stands up vertically, and one card at a time takes the stage. Never shrink the desktop layout.
6. **Time-based entrances, scroll-based travel.** The reveal fires when a section enters view and runs on a clock, so a fast flick can't skip it and a slow drag can't smear it. Scroll then drives camera travel inside a pinned section (`position: sticky` in a ~190svh container).
7. **Stop work off-screen.** Video decoding and rendering stop when a section leaves the viewport.
8. **Text stays DOM.** Real `<h1>` (screen-reader only if the visible title is drawn in WebGL), real `<button>`s for cards, so keyboard, screen readers and SEO work.
9. **Developer hooks.** `?t=3.2` jumps the timeline to 3.2 s; `?t=end` jumps to the settled state; `window.__shot('name')` saves a screenshot. Build the same hooks; they make tuning ten times faster.
10. **Cursor mapping done properly.** The clock hand maps cursor position by projecting it onto the curved timeline, not by raw mouse X. Use the same idea for the tachometer needle.
11. **Control is handed over, not switched.** Intro animation and user input are blended on a ramp so nothing jumps when the user takes over.

### 2.4 Don't copy these

- **The custom WebGL engine.** It's impressive but very expensive for one person to maintain, and you'd be rebuilding what three.js and R3F already give you (PBR car paint, environment maps, glTF loading, post-processing).
- **Their assets.** The images, videos, figure and wordmark are theirs. Use the repo for structure and direction only.
- **The "pixel-perfect replication of a reference image" approach.** It works for a still-life artist's poster. A car moving through space needs a real 3D scene.
- **The video-matting pipeline**, unless you film yourself. It's a good option for a later "driver" shot (you in a race suit or jacket, filmed on a white wall), but it's not needed for v1.

### 2.5 Getting the reference repo on your computer

It's someone else's code, so I didn't copy it into your repo. Clone it next to your project to study it:

```bash
git clone https://github.com/gireeshkumarreddy/cinematic-portofilo.git
```

Run it with any static server (it has no build step):

```bash
cd cinematic-portofilo && python tools/serve.py 5173
```

---

## 3. The concept: DRIFT

### 3.1 The idea in one line

> **A portfolio you watch like a drift run: the car carries you from ignition to the finish line, and each corner is a part of your career.**

### 3.2 Why drift fits an AI / security engineer

Drifting is controlled loss of traction: the car is sideways on purpose, and the driver is in control the whole time. That's a fair picture of the work in your repos: agents with validation gates (Warden, AEGIS), answers verified by a calculator (Ledger), red-teaming that measures failure on purpose (llm-eval-redteam, Financial-NRF). The tagline can say it directly, e.g. *"Controlled chaos. AI systems that stay in line when things go sideways."*

### 3.3 Visual language

| Element | Direction |
|---|---|
| Mood | Night track or empty multi-storey car park, wet tarmac, sodium and LED lights, tyre smoke backlit |
| Palette | Near-black tinted blue (`#07090D`), asphalt grey, one hero colour per scene. The motorsport tricolour (light blue / dark blue / red) can appear as a thin livery stripe, used sparingly. |
| Type | A condensed, heavy display face for the wordmark; a monospaced face for HUD/telemetry text; a plain sans for body copy |
| UI motif | Race HUD and telemetry: thin rules, numbered sectors (S1, S2…), lap timer, gear indicator, small caps labels. The reference's "chips and arrows" become HUD chips. |
| Texture | Film grain, light vignette, subtle chromatic aberration on fast moves only |
| Motion | Weight and inertia. Things accelerate and brake; they don't glide linearly. Ease-in for launch, overshoot for a car settling on its suspension. |

### 3.4 Motorsport UI patterns worth using

- **Loading = ignition.** The tachometer sweeps to the redline and back (like a real car's needle sweep on start), and its fill is driven by real asset-loading progress.
- **Section counter = sector timing.** "S1 / S5" in the corner, with a mini track map that fills as you scroll.
- **Project tier = class.** A racing class system instead of BMW model names (see PRD §7.5).
- **Project card = spec sheet.** Like a car brochure spec table: Problem · Build · Result · Stack · Links.
- **Skills = telemetry.** Don't use percentage bars ("Python 90%"); recruiters read them as made up. Show what you shipped with each tool instead.

### 3.5 BMW: what you can and can't use

BMW actively enforces its marks. A UK High Court found that a garage infringed the BMW roundel and the "M" logo, partly through use on its website, and BMW has sued a US garage for showing its logos online. Those were businesses, and a personal portfolio is lower risk, but there's no upside in testing it. So:

- **Don't** use the roundel, the "M" logo, or model names (M3, M5, "M Competition", "M Performance") as your own branding or as tier labels.
- **Do** use a BMW-*inspired* car model with the badges removed (strip them in Blender), call it "the car" or give it your own name, and add a footer line: *"Not affiliated with BMW AG. Car model by [author], licensed [licence]."*
- Colours on their own (light blue / dark blue / red) are fine as a nod, but don't recreate the M stripe as a logo.

---

## 4. Technical research

### 4.1 Recommended stack (all free and open source)

| Layer | Pick | Why |
|---|---|---|
| Build | **Vite** (keep) | Fast, already set up |
| UI | **React 19** (keep) + **TypeScript** (add) | TS catches scene-state bugs early; optional but recommended |
| 3D | **three.js + @react-three/fiber + @react-three/drei** (keep) | PBR car paint, `Environment` + `Lightformer` for showroom reflections, `MeshReflectorMaterial` for wet floors, `useGLTF`, `PerformanceMonitor`, `AdaptiveDpr`, `View` |
| Post | **@react-three/postprocessing** (keep) | Bloom on headlights and brake lights, vignette, noise, chromatic aberration |
| Timelines & scroll | **GSAP 3 + ScrollTrigger + SplitText + `@gsap/react` (`useGSAP`)** | Free including all plugins. One system for every timed beat and every scroll-driven value. |
| Smooth scroll | **Lenis** (keep `lenis`, remove `@studio-freight/lenis`) | Wire it to GSAP's ticker so there's one animation loop |
| UI micro-motion | **CSS transitions**, optionally **Motion** (`motion/react`, the renamed Framer Motion) | Hover and focus states. If you keep Motion, migrate imports from `framer-motion` to `motion/react` and use it only for component presence. |
| State | **zustand** | Tiny; lets `useFrame` read scroll progress without React re-renders |
| Styling | **Tailwind 4** (keep) + CSS variables for design tokens | |
| Physics (stretch goal only) | **@react-three/rapier** | Only for an optional "Take the wheel" free-drive mode |
| Audio (optional) | **Howler.js** or plain Web Audio | Muted by default, opt-in toggle |
| Dev tuning | **leva** (sliders), **r3f-perf** (FPS/draw calls) | Dev builds only |
| Testing | **Playwright** (already installed in this environment) | Screenshot each section at 3 viewports; catches layout breaks |

**Alternative considered: no framework, like the reference.** Rejected. You'd spend months on a renderer instead of the portfolio.

**Alternative considered: Spline or another no-code 3D tool.** Free tiers add a watermark or limit exports, and you lose control of performance. Rejected.

### 4.2 Core techniques

**a) Scroll-driven drift without a physics engine.** For the main experience you don't need physics. Author the run:

1. Draw the track as a closed `CatmullRomCurve3` (8–12 control points).
2. Scroll progress `u` (0→1) picks a point and tangent on the curve.
3. Car heading = tangent angle **+ slip angle**. Slip angle comes from the curve's local curvature (sharper corner → more sideways), smoothed with damping so the car swings into and out of the slide with weight.
4. Add body roll (`rotation.z`) proportional to slip and a little suspension bob.
5. Spin the wheels from distance travelled; steer the front wheels *opposite* to the slide (counter-steer). That one detail is what makes it read as drifting.

```js
// Sketch: called inside useFrame with damped scroll progress u
const p = track.getPointAt(u);
const t = track.getTangentAt(u);
const tAhead = track.getTangentAt((u + 0.01) % 1);
const curvature = t.clone().cross(tAhead).y;           // signed: left vs right corner
const targetSlip = THREE.MathUtils.clamp(curvature * SLIP_GAIN, -0.9, 0.9);
slip = THREE.MathUtils.damp(slip, targetSlip, 4, delta); // weight in and out of the slide
car.position.copy(p);
car.rotation.y = Math.atan2(t.x, t.z) + slip;
car.rotation.z = -slip * 0.06;                           // body roll
frontWheels.forEach(w => (w.rotation.y = -slip * 0.8)); // counter-steer
```

**b) Skid marks.** Keep a ring buffer of rear-wheel contact points while `|slip| > threshold`. Rebuild a flat ribbon mesh (two vertices per sample) each frame, alpha fading with age. One draw call per wheel. Same idea as the reference's light-painting ribbon (`scene2/ribbon.js`), which rebuilds a strip from the last few seconds of a moving head.

**c) Tyre smoke.** An `InstancedMesh` of camera-facing quads with a soft noise texture, spawned at the rear wheels when slipping; each grows, rises, drifts with the car's lateral velocity and fades. Cap it at about 150–250 instances. Backlight it (a light behind the smoke, facing the camera) so it glows like the reference's red fog.

**d) Car paint that looks expensive.** Use drei's `<Environment>` with a few `<Lightformer>` rectangles (a long ceiling strip, two side softboxes) instead of an HDRI file. You get the studio reflection streaks seen in car commercials, it's tiny to load, and you can animate the lights. Use `MeshPhysicalMaterial` with `clearcoat: 1` on the body.

**e) Wet floor.** drei's `MeshReflectorMaterial` (blurred reflections, roughness map) on a ground plane. Expensive; disable it on the low quality tier.

**f) Name behind the car.** Render the giant wordmark as a plane in the 3D scene *behind* the car (drei `<Text>` with a font file, or a pre-made texture). Then the car can physically occlude it and smoke can drift in front of it, giving the reference's layered-poster look with real depth.

**g) One canvas.** Use a single fixed full-screen `<Canvas>` behind the DOM, and switch or move scene content by scroll position. Several canvases means several WebGL contexts, which costs memory and breaks on some phones. drei's `<View>` is an option if you need 3D inside specific DOM boxes.

**h) Lenis + GSAP on one loop:**

```js
const lenis = new Lenis({ autoRaf: false });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);
```

**i) Quality tiers.** Detect once at start (GPU tier via `navigator.hardwareConcurrency`, `deviceMemory`, screen size, plus a short FPS sample with `PerformanceMonitor`), then pick:

| Tier | DPR | Reflections | Post | Smoke | Shadows |
|---|---|---|---|---|---|
| High | up to 2 | MeshReflectorMaterial | Bloom + vignette + noise + CA | 250 | contact shadows |
| Medium | 1.5 | Off (rough floor + baked AO) | Bloom + vignette | 120 | baked |
| Low / reduced motion | 1 | Off | Off | Off; static poster images instead of animated beats | baked |

### 4.3 Asset pipeline

**Car model.** Your current GLB has an unknown source and licence and weighs 10 MB. Two options:

1. **Find the source** of `MDL14063` and confirm the licence allows use on a public site. If it does, keep it and optimise it.
2. **Replace it** with a model whose licence you can confirm. On Sketchfab, filter by *Downloadable* and licence *CC Attribution* or *CC0*. Many BMW models there are CC BY-NC-ND (the M6 GT3 that came up in research is one), which forbids changes like removing badges. Check every model's licence on its own page. Low-poly free options exist on itch.io (an E46 Compact, a 350Z-style drift car), but their licences weren't stated.

Then optimise. pmndrs `gltfjsx` does it in one command and also writes a typed React component:

```bash
npx gltfjsx public/models/car.glb --transform --resolution 1024 --types
```

Or with glTF-Transform directly:

```bash
npx @gltf-transform/cli optimize car.glb car.opt.glb --compress meshopt --texture-compress webp --texture-size 2048
```

Target **≤ 2.5 MB** for the car. Also: delete the 13 loose `Image_*.jpeg/png` files in `public/models/` (they're already inside the GLB), and in Blender remove the interior if the camera never sees it, remove badges and the Russian plate (replace with your own plate, e.g. `AARON 26` or `AI 007`).

**Intro video.** If you keep a video, re-encode it: drop audio, 1080p, CRF ~26, `faststart`, plus a WebM and a poster frame. That should take 28 MB to roughly 2–4 MB.

```bash
ffmpeg -i "Video Project 3.mp4" -an -c:v libx264 -crf 26 -preset slow -movflags +faststart -vf "scale=1920:-2" intro.mp4
```

```bash
ffmpeg -i "Video Project 3.mp4" -an -c:v libvpx-vp9 -crf 36 -b:v 0 -vf "scale=1920:-2" intro.webm
```

```bash
ffmpeg -ss 0 -i "Video Project 3.mp4" -frames:v 1 -q:v 3 intro-poster.jpg
```

Better: replace the video with the live 3D ignition scene, since the car is already loaded for the rest of the site. Use video only for things 3D can't do (real driving footage, if you have any).

### 4.4 Performance budget

| Metric | Target |
|---|---|
| First view transfer (HTML + JS + CSS + fonts + car + env) | ≤ 5 MB |
| Initial JS (gzip) | ≤ 350 KB; lazy-load the 3D chunk after first paint |
| Largest Contentful Paint (mobile, 4G) | ≤ 2.5 s (the HTML name + tagline counts as LCP, so show it before 3D loads) |
| Frame rate | 60 fps on a mid laptop; ≥ 30 fps on a mid Android phone |
| Lighthouse (mobile) | Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95, SEO 100 |
| Draw calls | ≤ 150 in any section |

---

## 5. Free asset sources

| Need | Source | Licence notes |
|---|---|---|
| HDRIs (night, studio, car park) | [Poly Haven](https://polyhaven.com/) | All assets CC0 |
| Asphalt, concrete, metal textures | [Poly Haven](https://polyhaven.com/), [ambientCG](https://ambientcg.com/) | CC0 (confirm on each asset page) |
| Car models | [Sketchfab](https://sketchfab.com/) (filter CC BY / CC0, downloadable), itch.io | Check every licence; avoid NC-ND if you need to edit |
| Tyre squeal / engine | [Big Sound Bank](https://bigsoundbank.com/), [Freesound](https://freesound.org/) (filter CC0) | Big Sound Bank's tyre squeal #0500 is CC0. Avoid ElevenLabs free clips (they require attribution) and paid libraries. |
| Fonts | [Google Fonts](https://fonts.google.com/) via [Fontsource](https://fontsource.org/) (already used) | OFL. Self-host; preload the display face. |
| Icons | [Lucide](https://lucide.dev/), `react-icons` (installed) | ISC / MIT |
| Noise / grain textures | Generate in a shader, or Poly Haven | |
| Your own imagery | Phone photos of a real car meet or track day; a screen recording of each project running | Yours. The most original assets you can have. |

---

## 6. Free hosting, analytics, forms

| Need | Pick | Notes |
|---|---|---|
| Hosting | **GitHub Pages** (deploy via GitHub Actions) | Free, you already use it for the Financial-NRF demo. 1 GB site limit, 100 MB per file. |
| Hosting (alternative) | **Cloudflare Pages** | Free tier doesn't meter bandwidth for static assets and allows commercial use. Vercel Hobby is non-commercial only. |
| Domain | `aaronsunny007.github.io` (free) | A custom domain costs about £10/year; optional. |
| Analytics | **Cloudflare Web Analytics** or **GoatCounter** | Free, no cookie banner needed |
| Contact | `mailto:` link + a "copy email" button | No form backend to maintain. Formspree or Web3Forms free tiers if you want a form. |
| CV | A PDF in `/public/cv/` | Link from the nav and the finish line |

---

## 7. Claude skills and tools

All free. Third-party skills run with your permissions, so read each `SKILL.md` before installing. Install commands are from each project's listing; check the repo README for the current command.

### 7.1 Design and UI

| Skill | What it does | Install |
|---|---|---|
| **frontend-design** (official, `anthropics/skills`, Apache 2.0) | Pushes Claude away from generic "AI-looking" frontends: bolder typography, committed colour choices, motion with intent | `npx skills add https://github.com/anthropics/skills --skill frontend-design` |
| **Impeccable** (`pbakaus/impeccable`) | Builds on frontend-design. Bans the default "AI palette" (cyan on dark, purple-to-blue gradients, neon on dark, which is exactly what your current site uses). Adds `/audit`, `/critique`, `/polish`, `/distill` commands and a detector CLI that needs no API key. | `/plugin marketplace add pbakaus/impeccable` |
| **UI UX Pro Max** (`nextlevelbuilder/ui-ux-pro-max-skill`) | Searchable library of UI styles, palettes, font pairings and UX rules | See the repo; some marketplace copies leave out the data files, so install from upstream |
| **web-design-guidelines** (`vercel-labs/agent-skills`) | Reviews UI code against 100+ rules: accessibility, animation, forms, images | `npx skills add vercel-labs/agent-skills` |
| **claude-skill-awwwards** (`tponscr-debug`, community) | High-end frontend direction: type, motion, Three.js/WebGL references | Clone into `~/.claude/skills/awwwards`. Small community project; review it first. |

### 7.2 Animation and 3D

| Skill | What it does | Install |
|---|---|---|
| **gsap-skills** (official, `greensock/gsap-skills`) | GSAP core, timelines, ScrollTrigger, plugins, React (`useGSAP`, cleanup), performance | `/plugin marketplace add greensock/gsap-skills` or `npx skills add https://github.com/greensock/gsap-skills` |
| **r3f-best-practices** + **three-best-practices** (`emalorenzo/three-agent-skills`) | R3F rules: no React state in `useFrame`, delta-time animation, disposing GPU resources, zustand selectors | `npx skills add https://github.com/emalorenzo/three-agent-skills --skill r3f-best-practices` |
| **react-best-practices** (`vercel-labs/agent-skills`) | React performance rules ranked by impact | Same repo as web-design-guidelines |

### 7.3 Already in your Claude environment

- **humanizer**: run project write-ups and your bio through it so they don't read as AI-written. Recruiters notice.
- **code-review** and **security-review**: run before each merge. A security engineer's portfolio should pass its own security review.
- **run** / Playwright: launch the dev server and screenshot every section at phone, tablet and desktop widths.

### 7.4 Suggested working loop with Claude

1. Install frontend-design, Impeccable, gsap-skills and r3f-best-practices in the project (`.claude/skills/`) so every session gets them.
2. Run `/teach-impeccable` once. Give it the PRD's audience and brand sections so it saves your design context.
3. Build one section per session, following the PRD section spec. Start each session with: *"Read docs/02-PRD.md §N and build it."*
4. After each section: screenshot at 3 widths → `/critique` → fix → `/polish`.
5. Before merging: `/code-review`, Lighthouse, and the acceptance checks in PRD §13.

---

## 8. Learning resources (free)

- three.js docs and examples: https://threejs.org/examples/
- React Three Fiber docs (read "Performance pitfalls" and "Scaling performance"): https://r3f.docs.pmnd.rs/
- drei docs (Environment, Lightformer, MeshReflectorMaterial, PerformanceMonitor, Text, View): https://drei.docs.pmnd.rs/
- GSAP docs, ScrollTrigger and `useGSAP`: https://gsap.com/docs/v3/
- Codrops, camera fly-through on scroll with R3F: https://tympanus.net/codrops/2023/02/14/animate-a-camera-fly-through-on-scroll-using-theatre-js-and-react-three-fiber/
- SimonDev on YouTube: particle and smoke systems in three.js
- Bruno Simon's driving portfolio (MIT, `brunosimon/folio-2025`): the best-known car portfolio. Study how it loads, how it handles input and how it falls back on weak devices. Don't recreate it; your site is a guided cinematic drift run, not an open-world toy.
- Your reference repo's README: the best write-up of choreography rules you'll find.

---

## 9. Cost

| Item | Cost |
|---|---|
| All libraries (three, R3F, drei, GSAP + plugins, Lenis, zustand, Rapier) | £0 |
| Claude skills listed | £0 |
| HDRIs, textures, CC0 sounds, fonts | £0 |
| Car model (CC BY / CC0) | £0 |
| Hosting (GitHub Pages / Cloudflare Pages), analytics | £0 |
| Custom domain (optional) | ~£10/year |
| **Total** | **£0** |

---

## 10. Sources

Research gathered 2 Nov 2026. Third-party directory listings were used for some skill details; confirm on each project's GitHub page.

- Reference repo: https://github.com/gireeshkumarreddy/cinematic-portofilo
- Anthropic frontend-design skill: https://github.com/anthropics/skills/tree/main/skills/frontend-design · listing: https://www.truefoundry.com/skills-registry/skill/anthropics-skills-frontend-design
- GSAP skills: https://github.com/greensock/gsap-skills
- three-agent-skills (r3f-best-practices): https://skillselion.com/skills/emalorenzo/three-agent-skills/r3f-best-practices
- Vercel agent-skills: https://github.com/vercel-labs/agent-skills/wiki · https://vibeindex.ai/skills/vercel-labs/agent-skills/vercel-react-best-practices
- Impeccable: https://emelia.io/hub/impeccable-ai-design-skill · https://sharedcontext.ai/plugins/external/pbakaus/impeccable
- UI UX Pro Max: https://docsearch.algolia.com/mcp/docs/repo/nextlevelbuilder/ui-ux-pro-max-skill
- claude-skill-awwwards: https://github.com/tponscr-debug/claude-skill-awwwards
- Web animation skills overview: https://skillselion.com/guides/best-web-animation-skills-for-claude-code
- Motion (Framer Motion rename): https://motion.dev/docs/migration
- drei PerformanceMonitor docs (copy): https://app.unpkg.com/glodrei@0.0.2/files/docs/performances/performance-monitor.mdx
- Lenis + ScrollTrigger: https://svilenkovic.com/3d/lenis-smooth-scroll-tutorial · https://www.hontran.dev/blog/gsap-scrolltrigger-tutorial-pin-scrub-parallax
- GSAP + R3F performance thread: https://gsap.com/community/forums/topic/43299-performance-issues-on-desktop-and-mobile-devices-using-gsap-with-react-three-fiber/
- Codrops R3F camera fly-through: https://tympanus.net/codrops/2023/02/14/animate-a-camera-fly-through-on-scroll-using-theatre-js-and-react-three-fiber/
- glTF optimisation: https://app.cinevva.com/guides/optimize-glb-for-web · https://www.ui-skills.com/skills/cloudai-x/threejs-asset-pipeline
- Instanced smoke: https://discourse.threejs.org/t/smoke-effect-instancedmesh2/80341 · https://varun.ca/three-js-particles/
- Bruno Simon portfolio: https://www.creativebloq.com/news/3d-car-portfolio · https://news.hada.io/topic?id=24963
- Free car models: https://nickaruxe.itch.io/lowpoly-bmw-e46-compact · https://designersoup.itch.io/ · https://sketchfab.com/3d-models/bmw-m6-gt3-shiny-evil-27956e4ebaaa468980bc48e50106d5c6
- Poly Haven licence: https://docs.polyhaven.com/en/faq · https://polyhaven.com/
- Free textures overview: https://app.cinevva.com/guides/free-textures-hdris-materials
- CC0 tyre squeal: https://bigsoundbank.com/tire-squeal-s0500.html · ElevenLabs attribution terms: https://elevenlabs.io/sound-effects/tire-screech
- BMW trademark enforcement: https://ipkitten.blogspot.com/2017/06/bmw-wins-appeal-over-use-of-trade-mark.html · https://www.worldipreview.com/trademark/bmw-targets-us-based-car-garage-in-trademark-suit-11932 · https://osborneclarke.com/insights/trade-marks-in-the-automotive-sector-brand-protection-and-its-limitations
- Hosting free tiers: https://flaviocopes.com/hosting-free-tiers/ · https://dev.to/libme/vercel-vs-netlify-vs-cloudflare-pages-where-your-side-project-should-actually-live-1j30


---
---

<!-- FILE: 02-PRD.md -->

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


---
---

<!-- FILE: 03-GITHUB-PROJECTS-UPDATE.md -->

# GitHub Projects Update Checklist

**Date:** 2 Nov 2026 · Checked against the 19 public repos on `github.com/aaronsunny007`.

The portfolio links to these repos, so the repos are part of the portfolio. A recruiter who clicks through to a repo with no description and a broken README heading loses the impression the site just made.

---

## 1. What's wrong today

| Issue | Repos affected |
|---|---|
| Strong recent projects **missing from the portfolio** | Warden, ledger, Financial-NRF, AI-CySec-defence-system (AEGIS), pulsegrid-belfast-smart-city-intelligence, tom.n.ollie |
| **No GitHub description** (the one-liner under the repo name) | Warden, portfolio-website, AI-CySec-defence-system, cicd-mlops-pipeline, tom.n.ollie, pulsegrid-belfast-smart-city-intelligence, web-security-scanner, ledger, Financial-NRF, rl-gridworld, github-ai-agent, autonomous-warehouse-surveillance-robot, smart-ai-agent, loan-default-prediction |
| **README headings show a literal `\#`** (escaped markdown, so the title renders as text, not a heading) | smart-ai-agent, loan-default-prediction, ros-formation-control |
| **No README at all** | rl-gridworld |
| README title is a coursework code, not a project name | autonomous-warehouse-surveillance-robot (`# com760cw2_group9`) |
| Repo name doesn't match the project name | AI-CySec-defence-system (README says AEGIS), pulsegrid-belfast-smart-city-intelligence (README says PulseCity SmartGrid, and it covers London first) |
| Description is just the repo name | dsm-regulatory-compliance-ontology |
| portfolio-website README is the Vite template | portfolio-website |

## 2. Profile-level fixes

- [ ] **Pin 6 repos** on your profile, the Pro class below: Warden, ledger, Financial-NRF, AI-CySec-defence-system, llm-eval-redteam, pulsegrid-belfast-smart-city-intelligence.
- [ ] **Profile README:** create a repo named exactly `aaronsunny007` with a `README.md`. Three lines: who you are, what you're looking for, link to the portfolio. Optionally a small table of the 6 pinned projects.
- [ ] **Profile bio, location, website** fields: set website to the portfolio URL.
- [ ] **Social preview image** (Settings → Social preview, 1280×640) for each Pro and Competition repo. Make these in the portfolio's style (dark asphalt, class badge, project name). The same images, cropped to 1600×1000, become the Garage bay images, so you only design them once.

## 3. Per-repo plan

Class meanings are in PRD §7.5. "Description" is a draft for the GitHub About box (≤ 350 chars). "Topics" go in the About box too; they help search.

### PRO (featured bays, pinned)

| Repo | Description (draft) | Topics | To do |
|---|---|---|---|
| **Warden** | Security gateway between AI agents and MCP tool servers. Inspects tool descriptions, arguments and outputs, tracks taint, and only enforces new defences after an 8-stage validation gate. | `mcp` `ai-security` `llm-agents` `prompt-injection` `red-team` | Add description + topics; add a diagram or GIF at the top of README |
| **ledger** | Ask questions about company annual reports and get cited answers. Every number is recomputed by a calculator before you see it. 85.5% on 207 scored test questions. | `rag` `llm` `finance` `sec-filings` `evaluation` | Add description; add a screenshot of a cited answer |
| **Financial-NRF** | Do LLM "reliability scores" notice when the source document is wrong? Tested on two finance datasets and four open models: mostly no. Paper draft and live demo. | `llm-evaluation` `rag` `hallucination` `finqa` `research` | Add description; set website field to the live demo |
| **AI-CySec-defence-system** (AEGIS) | Autonomous web-app defence agent: spots an attack campaign, writes a new blocking rule, proves it won't break legitimate traffic, then deploys it without a restart. | `ai-security` `waf` `autonomous-agents` `intrusion-detection` | Consider renaming the repo to `aegis` (GitHub redirects old URLs); add description |
| **llm-eval-redteam** | (has one) Shorten to: "Red-team an LLM app with versioned attacks and a validated AI judge, compare defences statistically, and gate releases in CI." | `llm` `red-teaming` `prompt-injection` `ci` `github-action` | Add topics |
| **pulsegrid-belfast-smart-city-intelligence** (PulseCity) | Transport reliability lakehouse on Azure Databricks: polls every London Underground, DLR and Overground line every 5 minutes and measures how reliably each line actually ran. Belfast next. | `databricks` `lakehouse` `azure` `data-engineering` `tfl` | Consider renaming to `pulsecity-smartgrid`; add description |

### COMPETITION

| Repo | Description (draft) | Topics | To do |
|---|---|---|---|
| **tom.n.ollie** | Storefront relaunch for Tom & Ollie, Belfast cheesemongers: FastAPI backend with chilled-aware checkout and order admin, plus a no-build storefront. | `fastapi` `ecommerce` `client-work` | Add description; screenshot of the storefront; say "client project" in README |
| **fair-federated-learning-healthcare-ai** | (has one) Fine as is. | `federated-learning` `fairness` `flower` `aif360` `healthcare` | Add topics; add the baseline vs fair-FL results chart to README |
| **cicd-mlops-pipeline** | Predicts CI/CD stage failures from run features; model served with FastAPI and packaged in Docker, with an automated train-evaluate-deploy pipeline. | `mlops` `fastapi` `docker` `ci-cd` | Add description |
| **github-ai-agent** | Fetches real GitHub issues and uses an LLM (Groq) to analyse them and suggest likely fixes. | `llm` `github-api` `ai-agent` `groq` | Add description; remove the emoji from the H1 (optional) |
| **autonomous-warehouse-surveillance-robot** | Gazebo warehouse patrol robot: Bug2 or Q-learning navigation plus motion, fire and intruder detection on its camera. Group coursework (COM760). | `ros` `gazebo` `q-learning` `robotics` `computer-vision` | Change README title from `com760cw2_group9` to the project name; credit teammates; add description |

### SPORT

| Repo | Description (draft) | Topics | To do |
|---|---|---|---|
| **ros-formation-control** | (has one) Fine. | `ros` `multi-agent` `turtlesim` | **Fix escaped `\#` headings** in README |
| **smart-ai-agent** | Conversational agent with RAG, memory, entity tracking, web search and local LLM support, in a Streamlit UI. | `rag` `llm` `streamlit` `ai-agent` | **Fix escaped `\#` headings**; add description |
| **loan-default-prediction** | Predicts loan default risk on the Lending Club dataset with logistic regression, decision tree and random forest. | `machine-learning` `classification` `scikit-learn` | **Fix escaped `\#` headings**; add description; put the results table at the top |
| **web-security-scanner** | Educational rebuild of a 2024 internship project: Flask app for Nmap scans on approved demo targets, Google dork generation and subdomain enumeration. | `security` `flask` `nmap` `reconnaissance` | Add description; keep the authorised-use disclaimer prominent |
| **dsm-regulatory-compliance-ontology** | OWL ontology that models regulatory compliance for deep-sea mining, with HermiT reasoning over harm and compensation rules. | `ontology` `owl` `protege` `knowledge-representation` | Replace the description (currently just the repo name) |

### STREET (list view only, not pinned)

| Repo | Description (draft) | Topics | To do |
|---|---|---|---|
| **secure-password-manager** | (has one) Fine. | `flask` `security` `2fa` `encryption` | Add topics |
| **rl-gridworld** | Reinforcement learning agents in a GridWorld environment. | `reinforcement-learning` `gridworld` | **Write a README** (what it does, how to run, one results plot) or archive it |
| **portfolio-website** | 3D drift-themed portfolio built with React Three Fiber and GSAP. | `portfolio` `threejs` `react-three-fiber` `gsap` | Replace Vite template README once the rebuild starts |

## 4. README template for Pro and Competition repos

Keep it short at the top; a recruiter reads the first screen only.

```markdown
# Project Name

One sentence: what it does and for whom.

![screenshot or GIF](docs/hero.png)

**Result:** the headline number or outcome, in plain words.

## How it works
3–5 bullets or one diagram.

## Run it
The fewest commands that work.

## Stack
Python · FastAPI · …

## Limitations
What it doesn't do yet. (You already do this well in Warden and Ledger; keep it.)
```

## 5. How to apply this

I can't edit these repos from this session (access here is limited to `portfolio-website`). Two ways to do it:

1. **By hand** on github.com: About box (gear icon) for description, website and topics; Settings → Social preview for the image; edit README in the browser for the `\#` fixes.
2. **With the GitHub CLI**, one command per repo:

```bash
gh repo edit aaronsunny007/Warden --description "Security gateway between AI agents and MCP tool servers. Inspects tool descriptions, arguments and outputs, tracks taint, and only enforces new defences after an 8-stage validation gate." --add-topic mcp,ai-security,llm-agents,prompt-injection,red-team
```

Or start a Claude session with access to all your repos and ask it to apply this file.
