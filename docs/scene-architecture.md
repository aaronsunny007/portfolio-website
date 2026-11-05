# Scene architecture

How the reference organises its scenes, renderer and lifecycle (**[SRC]** unless stated), and the recommended structure for the drift R3F portfolio.

Related: [reference-analysis](reference-analysis.md) · [animation-specification](animation-specification.md) · [interaction-map](interaction-map.md) · [implementation-roadmap](implementation-roadmap.md)

## 1. Reference architecture

### 1.1 Page skeleton

```
<html class="is-booting ...is-live is-settled ...">
  .stage-wrap         fixed layer
    canvas#stage        hero compositor (WebGL2)
    header#hdr          nav, rail, furniture (DOM)
    #boot               black loader
    #menu               mobile menu
  main.flow           scrolls over the fixed hero
    .hero-spacer
    section#walk        .walk__pin     > canvas#walkStage (2D) + SVG route + DOM lines
    section#stack       .universe__pin > canvas#uniStage  (WebGL2) + DOM deck + caption
    section#chrono      .chrono__pin   > canvas#chronoStage + DOM deck + canvas#chronoFront
    section#gallery     .gallery__pin  > canvas#galleryStage + DOM deck + <img> person
  footer#fin            .fin__pin      > canvas#finBack + canvas#finMan + DOM captions
```

- Each scene is a **tall section** (1.7 to 3.2 screens on desktop) holding one **`position: sticky` pin**. Scroll length is the scrub budget. [SRC][OBS]
- The hero is **fixed behind** the flow and pauses when off-screen. [SRC]
- State is exposed as classes on `<html>` (`is-booting`, `is-live`, `is-welcome`, `is-settled`, `is-portrait`, `is-menu`) so CSS can respond without JS style writes. [SRC][OBS]

### 1.2 Module layout (35 modules, about 5,600 lines)

| Folder | Role |
|---|---|
| `main.js` | Boot, loader gates, hero frame loop, CUES to classes |
| `scrollengine.js`, `ux.js` | Scroll, cursor, rail, nav, kinetic titles, menu |
| `gl/renderer.js` | `createGL` (context, program cache, FBO helpers); `stage.js` hero compositor; `shaders*.js` GLSL per scene |
| `lib/` | `clip.js` (video and still), `ease.js`, `mat4.js` |
| `scene/` | Hero timeline, layout, furniture, text atlas |
| `scene1/` to `scene6/` | `bootN.js` (wire to DOM, observer, loop), `<name>.js` (renderer), `layoutN.js` (fitted geometry), `timelineN.js` (beat table) |

The four-file recipe per scene is the key repeatable pattern: **boot (lifecycle) / renderer (draw) / layout (geometry from viewport) / timeline (beats)**.

### 1.3 Lifecycle of a scene (identical across 2, 3, 4, 6)

1. `boot` finds its section and pin, creates a WebGL2 context. On failure it adds `is-fallback` and returns.
2. `IntersectionObserver` with a 100 % root margin starts and stops the rAF loop; `visibilitychange` does the same.
3. On first intersection it records `t0`. Every frame: `t = (now - t0)/1000 * INTRO_SPEED`.
4. `layout.resize(w, h, dpr)` recomputes one geometry object `L` (DPR capped at 2). DOM cards read `L` for their position, so canvas and DOM share one fitted layout (`fitCover()` in the gallery).
5. Draw pass order is fixed per scene, finishing with post (grain, vignette).
6. Pointer is damped into `camX, camY`; each depth layer multiplies it by its own factor.
7. `reduced` or `coarse` flags skip parallax and the cursor; reduced motion renders the settled state once.

### 1.4 Rendering approach

- **Raw WebGL2, no engine.** One program per effect, custom `mat4`, premultiplied alpha throughout. [SRC]
- **Several contexts**: hero, walk (2D), stack, chrono (two canvases), gallery, finale (two canvases). That is **7 canvases** on the page, one of them 2D; the WebGL context count is about 6 (I did not verify whether the two-canvas scenes share a context). [SRC]
- **Costs the architecture avoids**: no per-frame CPU for particles (vertex shader), cards are quads not meshes, a single shared material for 18 cards.
- **Costs it pays**: per-scene context creation, repeated shader compilation, duplicated texture uploads, and an increased chance of context loss on mobile. [ASSUMPTION about mobile context pressure; I did not test a low-end device.]

### 1.5 Layering trick (worth copying)

Chrono and the gallery put a **DOM deck between two canvases or between a canvas and a matted `<img>`**, so the person stands in front of the cards while the cards stay real, selectable DOM. [SRC][OBS]

```
z0  canvas   environment (room, rings, floor)
z1  DOM      cards (crisp text, buttons)
z2  canvas / img   the person (matted)
z3  DOM      labels, hints, captions
```

## 2. Recommended architecture for the drift portfolio

The portfolio already uses three, `@react-three/fiber`, drei and postprocessing, with a procedural car, smoke pool, skid marks and a 3D wordmark. Do **not** rewrite to raw WebGL. Reinterpret the structure.

### 2.1 Canvas strategy

**Option A (recommended): one persistent fixed `<Canvas>` plus drei `<View>`** per pinned section.
- One WebGL context, one shader and texture cache, one frameloop.
- Each section renders its own scene into a `<View>` tied to a DOM `div` (the pin).
- Matches how the reference *feels* (independent scenes) without 6 contexts.
- Risk: `View` uses scissor rendering; large overlapping views cost fill rate. Mitigate by only enabling views that are intersecting.

**Option B: one `<Canvas>` per scene** (closest to the reference).
- Simple isolation, easy to pause with `frameloop="never"`.
- More contexts; stop or dispose when far from the viewport.

Pick A unless profiling shows `View` overhead; fall back to B for a single heavy scene.

### 2.2 Proposed module layout

```
src/
  scenes/
    Scene.jsx            wrapper: pin + <View> + visibility gate + clock
    useSceneClock.js     { t, live } from first-intersection, with INTRO_SPEED
    useScrollProgress.js damped 0..1 from the pin's rect
    garage/ track/ pitcrew/ finish/
      index.jsx          scene component (R3F)
      timeline.js        beat table (like timeline2/3/4/6)
      layout.js          geometry from viewport (shared with DOM cards)
  ui/
    Cursor.jsx           DOM + rAF, no React state
    ChapterRail.jsx      gear indicator
    Furniture.jsx        DOM chips and dividers toggled by html classes
  three/   (existing: Stage, Car, DriftFx, Wordmark, driverPath, ...)
```

### 2.3 Scene table (Garage, Track, Pit Crew, Finish, as in your current sections)

| Scene | Reference analogue | Content | Driver |
|---|---|---|---|
| Hero | Hero (00) | Existing 9.6 s opening, with cast shadow and worn ink | Time |
| Track | Walk (01) | Chase camera along `driverPath`, racing-line route draw | Scroll |
| Pit Crew | Stack (02) | Skills as cards in depth around the car on a lift, pointer-reactive | Pointer plus hover |
| Garage | Chrono (03) / Gallery (04) | Projects as cards in depth, or a timeline rail with a tachometer hand | Pointer plus hover |
| Finish | Finale (05) | Push-in toward the cockpit, contact card as finish line | Scroll |

### 2.4 Rules to adopt

1. **DOM for text and clicks; canvas for atmosphere.**
2. **One clock and one beat table per scene.**
3. **Class cues on `<html>`** for anything that is not 3D.
4. **Intersection-gated frameloop** per scene.
5. **Shared layout object** feeding both canvas and DOM.
6. **Quality tiers** apply per scene (you already have `?tier=`).
7. **Fallback ladder:** WebGL, then a static poster (`is-fallback`), then plain markup.

### 2.5 Things not to copy

| Reference choice | Why not |
|---|---|
| Six WebGL contexts | Heavy on mobile; use one Canvas with Views |
| Raw GL and hand-rolled text atlas | R3F and drei already solve this |
| Photo-based cut-out figures | Your brand is the car; no portrait video needed |
| Unbundled module serving | Your Vite build already bundles |
| Roughly 100 requests, 1.5 MB hero video | Stay procedural, keep under 40 requests |
