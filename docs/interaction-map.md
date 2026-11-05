# Interaction map

Every input the reference reacts to, what it drives, and how to carry the idea over. Labels: **[SRC]** source, **[OBS]** seen in a headless render, **[ASSUMPTION]** inferred.

Related: [reference-analysis](reference-analysis.md) · [animation-specification](animation-specification.md) · [scene-architecture](scene-architecture.md) · [implementation-roadmap](implementation-roadmap.md)

## 1. Inputs, global

| Input | Handler | Effect | Notes |
|---|---|---|---|
| Wheel / trackpad | `scrollengine.js` | Moves a target; scroll position eases to it (K 3.4/s) | Off for coarse pointer, reduced motion, `?free=1` [SRC] |
| Keyboard (space, arrows, page keys) | `scrollengine.js` | Manual handling so the inertial scroll stays consistent | [SRC] |
| Nav / rail click | `window.__glideTo` | 1.4 s cubic-out glide to the target section | [SRC] |
| Pointer move | `main.js` and each scene | Damped x,y in -1..1, shared by parallax | rate 3.1 in hero, 14 for ring cursor [SRC] |
| Pointer down | `ux.js` | `is-down` on the cursor | [SRC] |
| Resize | Per scene | Recompute layout (`L`), canvas size at DPR cap 2 | [SRC] |
| `visibilitychange` | Per scene and hero video | Pause loops and video | [SRC] |
| Esc | Menu | Close mobile menu | [SRC] |
| Touch | n/a | No cursor, native scroll, no inertial engine | [SRC] |

## 2. Per-scene interactions

### Hero (00)
| Trigger | Result |
|---|---|
| Page load | Black boot, bar fills, letters and furniture build (see animation spec) |
| Pointer move (after 6.25 s) | Parallax: letters and figure shift by depth, gated in over 1.2 s [SRC] |
| "Enter" button (only if autoplay blocked) | Starts the clip. Hover widens letter-spacing 0.3 to 0.4 em, fills red [SRC] |
| Scroll | Hero stays fixed behind the flow, the walk scene scrolls over it. The video pauses when off-screen [SRC] |

### Walk (01)
| Trigger | Result |
|---|---|
| Scroll | Camera zoom, story lines, route draw, destination band (see animation spec) |
| Pointer | Light parallax on the photo [SRC] |

### Stack (02)
| Trigger | Result |
|---|---|
| Pointer move | Whole room yaws and parallaxes by depth; hint text "Move to look around" [SRC][OBS] |
| Hover a tool | Caption (`TOOL_NOTES`, `aria-live="polite"`) updates; the pointer is mapped to the card shell [SRC]; a light-catch effect is an [ASSUMPTION] |

### Chrono (03)
| Trigger | Result |
|---|---|
| Pointer move | Cursor is projected onto the polyline through card centres; the clock hand and the lit year follow [SRC][OBS: dial hand tracking the cursor] |
| Resting state | The last card (2026) is shown lit and enlarged with its year glowing; earlier cards are tilted back on the rail [OBS]. Hover behaviour on the other cards was not captured (my selector found none), so any hover scaling is an [ASSUMPTION]. |
| Click a card | Opens or links (arrow glyph in the corner) [OBS][ASSUMPTION about the destination] |

### Gallery (04)
| Trigger | Result |
|---|---|
| Scroll | Dollies the whole universe [SRC] |
| Pointer move | Damped yaw and parallax by depth [SRC] |
| Hover a card (`.g-card`) | Card lifts, siblings ease back (`.is-hot` on the deck), bottom caption shows the project name, cursor gets `is-link` [SRC][OBS: caption plus `cur is-link`] |
| Focus (keyboard) | Same as hover via `:focus-visible` [SRC] |
| Click | Opens the project [ASSUMPTION about the destination] |

### Finale (05)
| Trigger | Result |
|---|---|
| Scroll | Push-in on the subject, `--push` var, `is-pushed`, `is-close`, closing card fades in [SRC] |
| Hover on contact links / CTA | Border goes red, background tint, arrow extends from 1em to 3.6em, 4 px nudge [SRC] |

## 3. Navigation

- **Header** (`#hdr`): logo, three roles, five links, meta label, burger on mobile. Links use `data-nav`. [SRC]
- **Active link:** an IntersectionObserver on each pinned element marks the link active when the section is at least 50 % visible. [SRC]
- **Chapter rail** (`#rail`, 00 to 05): right edge, small index numbers, active red dot. Updates on scroll. Hover reveals labels. [SRC][OBS]
- **Mobile menu:** `#burger` toggles `is-menu`, shows `#menu` (same five links plus "Welcome to my world" tag). [SRC] I could not open it in headless emulation. [OBS]

## 4. Cursor logic (`ux.js`)

```
dot  : transform = pointer position, no smoothing
ring : damp(ring, pointer, 14, dt) every rAF, transforms only
state: is-link on  a, button, [data-hover], .g-card, .uni-card, .chrono__card
       is-down on pointerdown
       hidden on mouseleave
off  : (pointer: coarse) or prefers-reduced-motion
```

No React state is involved: the loop writes `style.transform` directly. [SRC]

**Adapt:** a two-part cursor suits the drift brand: a small dot plus a ring that behaves like a **tachometer needle** or a tyre-width marker; `is-link` can change the ring to a "boost" arc. Keep it DOM and rAF-driven, never React state.

## 5. Accessibility observations

Good [SRC]:
- Real DOM buttons for cards, `aria-live="polite"` captions, `aria-hidden` on decorative canvases, a visually hidden `<h1>` and `<h2>`s, `:focus-visible` styles, a `noscript` message, reduced-motion path.

Weak [OBS][ASSUMPTION]:
- Contrast of small grey rail labels and tool-card captions on black is low.
- On the iPhone profile text clipped at the left edge and one label overprinted a card.

**Adapt:** meet the good list; beat the weak list (min 4.5:1 contrast for body text, 44 px touch targets, safe-area insets).

## 6. Drift portfolio mapping (inputs to features)

| Reference interaction | Drift-native version |
|---|---|
| Hover tool card lifts, siblings recede | Hover a project card: it rises into a "pit lane" focus, siblings dim like a car in the shadow |
| Cursor drives clock hand along timeline | Cursor drives a **tachometer / lap timeline** across milestones |
| Pointer parallax by depth | Pointer swings the camera around the car (you already damp camera parallax) |
| Scroll dolly | Scroll drives the chase camera along `driverPath` |
| Closing push-in | Final scroll pushes the camera into the cockpit; contact card as a "finish line" overlay |
| Chapter rail 00 to 05 | Rail as a **gear indicator** (1 to 5 plus N) |
