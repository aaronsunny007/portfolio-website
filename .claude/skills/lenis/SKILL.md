---
name: lenis
description: Smooth scrolling with Lenis (darkroomengineering). Use when adding smooth scroll, inertia scrolling, scroll snapping, or syncing scroll with GSAP ScrollTrigger / Framer Motion, in vanilla JS, React/Next.js (lenis/react) or Vue (lenis/vue).
---

# Lenis

Official docs are copied in `references/` (Lenis v1.3.27). Read the one that matches the stack before writing code:
- `lenis-core.md`: vanilla setup, all options, methods, events, nested scroll, anchors, reduced motion, troubleshooting
- `lenis-react.md`: `<ReactLenis>` and `useLenis`
- `lenis-vue.md`, `lenis-snap.md`: Vue and snapping

## Essentials

Install: `npm i lenis`. Always import the CSS: `import 'lenis/dist/lenis.css'`.

Vanilla:
```js
import Lenis from 'lenis'
const lenis = new Lenis({ autoRaf: true })
```

React / Next.js (client component):
```jsx
import { ReactLenis } from 'lenis/react'
<ReactLenis root />   // useLenis() anywhere to get the instance
```

With GSAP ScrollTrigger, drive Lenis from GSAP's ticker and do NOT also set `autoRaf: true`:
```js
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((time) => lenis.raf(time * 1000))
gsap.ticker.lagSmoothing(0)
```
In React use `<ReactLenis root options={{ autoRaf: false }} ref={lenisRef} />` and add `lenisRef.current?.lenis?.raf(time * 1000)` to the GSAP ticker in a `useEffect` (remove it on cleanup). See `lenis-react.md`.

## Gotchas
- Scroll stuck or jumpy: missing `lenis.css`, or no raf loop (neither `autoRaf` nor `lenis.raf`).
- Nested scrollable areas (modals, dropdowns): add `data-lenis-prevent` to them.
- Use `lenis.scrollTo(target)` instead of `window.scrollTo`; set `anchors: true` for `#hash` links.
- Respect reduced motion (see "Reduced motion" in `lenis-core.md`).
- Call `lenis.destroy()` on unmount when not using `ReactLenis`.
