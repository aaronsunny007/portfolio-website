# Graph Report - portfolio-website  (2026-11-10)

## Corpus Check
- 110 files · ~114,800 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 6 file(s) not represented in the graph (top: .css 4, (none) 1, .glb 1)

## Summary
- 400 nodes · 907 edges · 20 communities (16 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 4 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Scroll Journey and DriftCar
- UI Components and Nav
- Opening Car and Drift FX
- Driver Avatars (legacy)
- Night Circuit Scene
- App Shell and Ignition
- Dashboard Cluster and Tach
- Package Manifest
- Runtime Dependencies
- Dev Dependencies
- READMEs and Design Canvas
- Styles and Entry Point
- Project Art and Gates
- ESLint Config
- NPM Scripts
- GitHub Pages Deploy
- Screenshot Script
- Vite Config

## God Nodes (most connected - your core abstractions)
1. `react` - 28 edges
2. `three` - 17 edges
3. `App()` - 17 edges
4. `DriftCar()` - 16 edges
5. `Scene()` - 16 edges
6. `Route()` - 14 edges
7. `Arrow()` - 12 edges
8. `@react-three/fiber` - 11 edges
9. `PitCrew()` - 11 edges
10. `SectionHeader()` - 9 edges

## Surprising Connections (you probably didn't know these)
- `Check car model licence before publishing` --semantically_similar_to--> `Car model licence unconfirmed (ItsDiyor, BMW badges)`  [INFERRED] [semantically similar]
  design/README.md → README.md
- `Design tokens at canvas/ds/drift/tokens.json` --conceptually_related_to--> `Portfolio told as a drift run`  [INFERRED]
  design/README.md → README.md
- `App()` --indirect_call--> `installPointerFx()`  [INFERRED]
  src/App.jsx → src/components/pointerFx.js
- `App()` --calls--> `Finish()`  [EXTRACTED]
  src/App.jsx → src/sections/Finish.jsx
- `App()` --calls--> `Garage()`  [EXTRACTED]
  src/App.jsx → src/sections/Garage.jsx

## Import Cycles
- None detected.

## Communities (20 total, 4 thin omitted)

### Community 0 - "Scroll Journey and DriftCar"
Cohesion: 0.06
Nodes (60): gsap, SECTIONS, wiper, blade(), clamp(), DriftCar(), POOL, sstep() (+52 more)

### Community 1 - "UI Components and Nav"
Cohesion: 0.09
Nodes (43): react, Arrow(), Career(), hold(), pad(), ContactActions(), LINKS, RoleList() (+35 more)

### Community 2 - "Opening Car and Drift FX"
Cohesion: 0.08
Nodes (45): @react-three/drei, @react-three/fiber, three, Car(), Headlights(), REAR, SkidMarks(), TyreSmoke() (+37 more)

### Community 3 - "Driver Avatars (legacy)"
Cohesion: 0.09
Nodes (36): apply(), buildRig(), C, KEYS, LEAN, mix(), rng(), root$ (+28 more)

### Community 4 - "Night Circuit Scene"
Cohesion: 0.13
Nodes (28): clamp01(), dummy, ease(), HALF_FOV, LAMP_Z, MAGENTA, NightCircuit(), place() (+20 more)

### Community 5 - "App Shell and Ignition"
Cohesion: 0.13
Nodes (19): App(), loadNight(), NightCircuit, ORDER, SceneGuard, Stage, IDLE, MAX_WAIT_MS (+11 more)

### Community 6 - "Dashboard Cluster and Tach"
Cohesion: 0.22
Nodes (15): Dashboard(), drawCluster(), GEAR_AT, rrect(), shape(), arc(), drawTach(), LED_FROM (+7 more)

### Community 7 - "Package Manifest"
Cohesion: 0.12
Nodes (15): name, private, type, version, autoprefixer, lenis, postcss, react-icons (+7 more)

### Community 8 - "Runtime Dependencies"
Cohesion: 0.13
Nodes (15): dependencies, @fontsource/big-shoulders-display, @fontsource/jetbrains-mono, @fontsource/manrope, gsap, lenis, react, react-dom (+7 more)

### Community 9 - "Dev Dependencies"
Cohesion: 0.14
Nodes (14): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, postcss (+6 more)

### Community 10 - "READMEs and Design Canvas"
Cohesion: 0.17
Nodes (9): DRIFT design canvas: 7 boards (hero, phone hero, opening storyboard, Pit Crew, Track, Garage, Finish), render/: three.js page and Playwright script rendering the car stills, Design tokens at canvas/ds/drift/tokens.json, All copy lives in src/content (edit there), Dev hooks: ?t=, ?tier=, ?fixed, window.__clock, Portfolio told as a drift run, Portrait: full-res photo, long eased left scrim, no blur, Reduced motion skips dial, 3D scene and drift (+1 more)

### Community 11 - "Styles and Entry Point"
Cohesion: 0.18
Nodes (5): @fontsource/big-shoulders-display, @fontsource/jetbrains-mono, @fontsource/manrope, react-dom, startTimeFromUrl()

### Community 12 - "Project Art and Gates"
Cohesion: 0.33
Nodes (4): at(), dot(), FLAGSHIP, GATE_X

### Community 13 - "ESLint Config"
Cohesion: 0.33
Nodes (5): eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals

### Community 14 - "NPM Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

### Community 15 - "GitHub Pages Deploy"
Cohesion: 1.00
Nodes (3): build job: npm ci, lint, build, upload dist, deploy job: actions/deploy-pages to github-pages, Deploy to GitHub Pages workflow

## Knowledge Gaps
- **13 isolated node(s):** `@tailwindcss/vite`, `react-router-dom`, `@tailwindcss/postcss`, `@types/react`, `@types/react-dom` (+8 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 140 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `UI Components and Nav` to `Scroll Journey and DriftCar`, `Opening Car and Drift FX`, `Driver Avatars (legacy)`, `Night Circuit Scene`, `App Shell and Ignition`, `Dashboard Cluster and Tach`, `Package Manifest`, `Styles and Entry Point`?**
  _High betweenness centrality (0.284) - this node is a cross-community bridge._
- **What connects `@tailwindcss/vite`, `react-router-dom`, `@tailwindcss/postcss` to the rest of the system?**
  _13 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Scroll Journey and DriftCar` be split into smaller, more focused modules?**
  _Cohesion score 0.06349206349206349 - nodes in this community are weakly interconnected._
- **Why does `three` connect `Opening Car and Drift FX` to `Scroll Journey and DriftCar`, `Driver Avatars (legacy)`, `Night Circuit Scene`, `Package Manifest`?**
  _High betweenness centrality (0.144) - this node is a cross-community bridge._
- **Should `UI Components and Nav` be split into smaller, more focused modules?**
  _Cohesion score 0.08630952380952381 - nodes in this community are weakly interconnected._
- **Why does `dependencies` connect `Runtime Dependencies` to `Package Manifest`?**
  _High betweenness centrality (0.067) - this node is a cross-community bridge._
- **Should `Opening Car and Drift FX` be split into smaller, more focused modules?**
  _Cohesion score 0.08455625436757512 - nodes in this community are weakly interconnected._