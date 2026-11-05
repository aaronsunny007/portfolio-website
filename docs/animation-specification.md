# Animation specification

Timings and easings of the reference (**[SRC]**, read from its source constants) and how to reinterpret each in the drift portfolio (**Adapt**). Nothing here is measured from a running page: it is what the code is told to do.

Related: [reference-analysis](reference-analysis.md) · [interaction-map](interaction-map.md) · [scene-architecture](scene-architecture.md) · [implementation-roadmap](implementation-roadmap.md)

## 1. Principles

| # | Principle | Reference behaviour | Adapt for the drift portfolio |
|---|---|---|---|
| P1 | One clock per scene | `t` in seconds from `performance.now()`; every beat is `span(t, start, dur)` through an ease | You already have a shared mutable `clock` in `timeline.js`. Keep it. Give each new scene its own `clock` instance. |
| P2 | Overlap, never chain | Each beat starts before the previous one ends | Define beats as `[start, dur]` pairs; forbid "on complete" callbacks |
| P3 | Fast intros | Scene intros run at 2.0 to 2.6x (`INTRO_SPEED`) | Same: first-view intro 1.5 to 2.5 s, then live |
| P4 | Damp, do not set | `v += (target - v) * (1 - exp(-k*dt))` everywhere | Use `THREE.MathUtils.damp` or the same formula; never assign pointer or scroll values directly |
| P5 | Gate by visibility | IntersectionObserver (100 % margin) plus `visibilitychange` | `frameloop="demand"` or `invalidate()` only when intersecting (you already pause off-screen) |
| P6 | Reduced motion = settled state | Jumps to the final timeline value and shows a still | Already supported; extend to every new scene |

Easing tokens in the reference: `--ease-out: cubic-bezier(.16, 1, .3, 1)` and `--ease-in-out: cubic-bezier(.76, 0, .24, 1)`. Scroll glides use cubic ease-out `1 - (1 - t)^3`. Your drift tokens (`launch`, `brake`, `settle`, `travel`) already play this role; map them rather than adding new ones.

## 2. Hero opening (reference timeline `T`, seconds)

| Beat | Start | Duration / stagger | Effect |
|---|---|---|---|
| boot black | 0 | min 620 ms | Fill bar, 4 steps. Waits for fonts, 2 textures, clip decodable. Patience cap 4,500 ms. |
| `heroIn` | 0.30 | 2.05 | Figure fades in |
| `letters` | 2.10 | stagger 0.145, 1.65 each | 7 quads, centre-outward order |
| `ember` | 2.45 | n/a | Red glow behind letters |
| `welcome` | 2.90 | n/a | Welcome strip |
| `artist` | 3.18 | n/a | Name chip |
| `legend` | 3.32 | n/a | Location chip |
| `arrows` | 3.46 | n/a | Triangle columns |
| `dots` | 3.62 | n/a | Dot grids |
| `header` | 4.45 | n/a | Header and rule |
| `settled` | 6.25 | n/a | Idle bob, pointer parallax gated in (damp 3.1, gate over 1.2 s starting 0.9 s before `settled`) |

DOM cues are plain class toggles on `<html>` (`is-welcome`, `is-artist`, `is-legend`, `is-arrows`, `is-dots`, `is-header`, `is-settled`), each CSS-transitioned. The timeline does not touch the DOM styles, only the classes. [SRC][OBS: all seven classes present at 9 s]

**Adapt (drift opening, existing 9.6 s):** keep your beats; add DOM cues for the same elements you already show (wordmark, name, role, nav). Add one new beat: the car's shadow falling across the wordmark as it enters (see section 6).

## 3. Scene intros (all `T*` tables, seconds, then divided by `INTRO_SPEED`)

| Scene | INTRO_SPEED | Beats |
|---|---|---|
| Stack (`T2`) | 2.0 | wake .2, gather 1.1, materialise 2.5 (all cards at once, one shared `mat`), rise 3.1, settle 4.9, hold 5.5, float 6.0, alive 7.4 |
| Chrono (`T3`) | 2.0 | warm .25, rail .8, clock 1.5, cards 2.05 (stagger .11), figure 2.75, rings 3.15, energy 3.5, live 4.2 |
| Gallery (`T4`) | 2.6 | wake 0 to .85, ring .5 to 1.55 (flicker like a struck tube), floor ignition .85 to 1.95, deck 1.25 to 3.4 (far row first), person 2.75 to 3.85, labels 3.3 to 4.35, live 4.1 |
| Finale (`T6`) | 2.0 | glow .25 to 1.8, fog .8 to 2.35, word 1.35 to 2.75, man 2.1 to 3.15, caps 2.8 to 3.95, bar 3.6 to 4.55, live 4.2 |

Pattern shared by all four: **environment wakes, then structure (ring / rail), then content (cards), then the human, then labels, then "live"**. After `live`, idle motion (float, ember drift, parallax) takes over for ever.

**Adapt:** for Garage, Track, Pit Crew, Finish use the same order: asphalt and light wake, track / grid lines, content cards, the car or driver figure, then labels.

## 4. Scroll-scrubbed motion

| Scene | Driver | Mapping |
|---|---|---|
| Walk | Section progress `p`, damped rate 14 | Camera zoom from face close-up (zoom 2.6, centre x .37 y .39) to full frame, smoothstep. Story lines keyed in scroll windows: name 0.02 to 0.34, statement 0.34 to 0.58. Route stroke draw 0.58 to 0.94 (4 cities, cubic bezier, portrait variant). Destination band above 0.85. |
| Finale | Progress over `p2` in [0.06, 0.86] | smoothstep push toward the face; writes `--push`; `is-pushed` above 0.35; `is-close` above 0.72; closing card fades in 0.62 to 0.96 |
| Gallery | Section scroll | Dolly of the whole universe |

**Adapt:** the drift-native equivalent of "the walk" is a **scroll-scrubbed chase camera**: progress `p` moves the camera along your existing `driverPath` from a tight cockpit view to a wide track view, with the route (home to the places you have worked) drawn like a racing line (`stroke-dashoffset` on an SVG path). This keeps the idea, not the picture.

## 5. Scroll engine

| Parameter | Value | Source |
|---|---|---|
| Damping K | 3.4 per second (about 1 s to settle) | scrollengine.js [SRC] |
| Wheel gain | 0.9 | [SRC] |
| Update | `y += (target - y) * (1 - exp(-K*dt)); scrollTo(0, y)` | [SRC] |
| Nav glide | 1.4 s, `1 - (1-t)^3` | [SRC] |
| Disabled when | reduced motion, coarse pointer, or `?free=1` | [SRC] |
| Keys | Handled manually | [SRC] |

**Adapt:** you already ship Lenis. Match: `lerp` about 0.1, `wheelMultiplier` about 0.9, `duration` for anchor `scrollTo` 1.4 s. Do not write a custom engine.

## 6. Hero depth and material (reference rendering details)

- Pass order: plate (mottled black, vignette, red ember) then letter quads (one shared glyph atlas) then **shadow of figure onto letters** then figure then post (grain, vignette, pulse). Premultiplied alpha throughout. [SRC]
- Ink: `#de1b1c`, wear uniforms `wear 0.44`, `wearGain 2.1`, `wearScale 5.6`. [SRC]
- Loop seam: the figure fades into darkness at the seam. [SRC]

**Adapt:** use `@react-three/postprocessing` (already installed) for grain and vignette; give the 3D wordmark a roughness map or a screen-print alpha texture; render a cheap fake shadow of the car on the wordmark with a projected blob (a dark plane or decal) instead of real shadow maps.

## 7. Idle ("live") motion

| Element | Motion | Source |
|---|---|---|
| Hero letters | Sine bob, small phase offset per letter | [SRC] |
| Tool cards | Float 6.0 s, alive 7.4 s onward | [SRC] |
| Embers | 900 particles in the vertex shader (no CPU) | [SRC] |
| Ribbon | Light-paints a curve over 7.5 s in 340 segments | [SRC] |
| Rings | Slow rotation | [SRC] |

**Adapt:** instanced mesh for embers (sparks and tyre smoke already exist in `DriftFx`); do the drift in the vertex shader or via a single `useFrame` writing instance matrices.

## 8. Reduced motion and fallbacks

- `prefers-reduced-motion`: the opening jumps to settled, scenes show their final state, smooth scroll is off, cursor is off. [SRC]
- No WebGL: each scene gets `is-fallback` and shows a still or plain markup. [SRC]
- Clip slow: still first, video at the next loop seam. [SRC]

**Adapt:** the drift site needs a still poster per scene (a static render) and CSS for `is-fallback`. This is a gap today.

## 9. Budgets worth copying

| Item | Reference | Target for drift site |
|---|---|---|
| DPR cap | 2 | 2 (1.5 on low tier) |
| Intro length | 2 to 5 s real time | 2 to 3 s |
| Per-scene contexts | One WebGL2 context each (about 5) | One shared Canvas (see scene-architecture) |
| Hero video | 1.5 MB webm | If you add video, keep under 1.5 MB, otherwise stay procedural |
| Requests | about 100 | under 40 |
