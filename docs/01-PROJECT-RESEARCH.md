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
