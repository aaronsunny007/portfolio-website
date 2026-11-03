# Graph Report - portfolio-website  (2026-11-02)

## Corpus Check
- Corpus is ~4,928 words - fits in a single context window. You may not need a graph.

## Summary
- 133 nodes · 200 edges · 10 communities (8 shown, 2 thin omitted)
- Extraction: 86% EXTRACTED · 12% INFERRED · 2% AMBIGUOUS · INFERRED: 25 edges (avg confidence: 0.82)
- Token cost: 325,061 input · 0 output

## Community Hubs (Navigation)
- Runtime Dependencies
- Dev Tooling and Linting
- App Shell and Pages
- 3D Scenes (R3F)
- Car Model Textures
- Vite and React Template
- HTML Entry and Logos
- npm Scripts

## God Nodes (most connected - your core abstractions)
1. `react` - 10 edges
2. `framer-motion` - 9 edges
3. `Car 3D model (MDL14063 GLB, BMW)` - 9 edges
4. `React + Vite Template` - 6 edges
5. `scripts` - 5 edges
6. `@react-three/drei` - 5 edges
7. `@react-three/fiber` - 5 edges
8. `vite` - 5 edges
9. `Packed ORM texture (Image_1_1: R occlusion, G roughness, B metalness)` - 5 edges
10. `Image_4_4 packed occlusion/roughness/metalness texture` - 5 edges

## Surprising Connections (you probably didn't know these)
- `Vite Logo (with dark-mode parenthesis styling)` --references--> `vite`  [INFERRED]
  src/assets/vite.svg → package.json
- `React Logo (atom)` --references--> `react`  [INFERRED]
  src/assets/react.svg → package.json
- `Social Icon SVG Sprite (Bluesky, Discord, Docs, GitHub, Social, X)` --conceptually_related_to--> `Navbar()`  [AMBIGUOUS]
  public/icons.svg → src/components/Navbar.jsx
- `BMWScene()` --references--> `Car 3D model (MDL14063 GLB, BMW)`  [EXTRACTED]
  src/components/BMWScene.jsx → public/models/Image_0_0.jpeg
- `Vite Logo (with dark-mode parenthesis styling)` --semantically_similar_to--> `Favicon (Vite lightning-bolt logo, purple)`  [INFERRED] [semantically similar]
  src/assets/vite.svg → public/favicon.svg

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Unused Vite/React scaffold boilerplate assets** — readme_react_vite_template, src_assets_react_react_logo, src_assets_vite_vite_logo, public_icons_social_sprite [INFERRED 0.75]
- **Image_1_1 channel splits form one packed ORM texture** — public_models_image_1_1_channels_r_texture, public_models_image_1_1_channels_g_texture, public_models_image_1_1_channels_b_texture, public_models_image_1_1_packed_orm_texture [INFERRED 0.85]
- **PBR texture set of the MDL14063 car GLB** — public_models_image_0_0_texture, public_models_image_2_2_texture, public_models_image_3_3_texture, public_models_image_1_1_packed_orm_texture, public_models_mdl14063_reversed_car_model [INFERRED 0.85]
- **Image_4_4 R/G/B channel splits form one packed ORM texture** — public_models_image_4_4_channels_r_texture, public_models_image_4_4_channels_g_texture, public_models_image_4_4_channels_b_texture, public_models_image_4_4_orm_packed_texture [INFERRED 0.85]
- **Texture maps of the MDL14063 car GLB** — public_models_image_4_4_orm_packed_texture, public_models_image_5_5_texture, public_models_image_6_6_channels_r_texture, public_models_nomershax_7_texture, public_models_mdl14063_reversed_car_model [INFERRED 0.85]

## Communities (10 total, 2 thin omitted)

### Community 0 - "Runtime Dependencies"
Cohesion: 0.09
Nodes (30): dependencies, @fontsource/exo-2@^5.2.8, @fontsource/inter@^5.2.8, @fontsource/orbitron@^5.2.8, framer-motion@^12.38.0, gsap@^3.15.0, lenis@^1.3.23, react-icons@^5.6.0 (+22 more)

### Community 1 - "Dev Tooling and Linting"
Cohesion: 0.09
Nodes (24): devDependencies, autoprefixer@^10.5.0, eslint@^10.2.1, @eslint/js@^10.0.1, eslint-plugin-react-hooks@^7.1.1, eslint-plugin-react-refresh@^0.5.2, globals@^17.5.0, postcss@^8.5.14 (+16 more)

### Community 2 - "App Shell and Pages"
Cohesion: 0.16
Nodes (13): react@^19.2.5, Social Icon SVG Sprite (Bluesky, Discord, Docs, GitHub, Social, X), framer-motion, react, App(), React Logo (atom), AboutPage(), projects (+5 more)

### Community 3 - "3D Scenes (R3F)"
Cohesion: 0.17
Nodes (13): @react-three/drei@^10.7.7, @react-three/fiber@^9.6.1, @react-three/drei, @react-three/fiber, Hero Image (isometric layered tiles), Layered Stack / Build Layers Motif, BMW(), BMWScene() (+5 more)

### Community 4 - "Car Model Textures"
Cohesion: 0.17
Nodes (15): Image_0_0 - Normal map atlas (tyre tread/sidewall, grille mesh, BMW roundel emboss, wheel/brake rings), Image_1_1 B channel - Metalness (per-material flat tiles of 5x5 ORM atlas), Image_1_1 G channel - Roughness (per-material grey tiles, tyre tread, wheel UV islands), Image_1_1 R channel - Occlusion-slot mask (bright UV islands: 5-spoke rim, tyre, seats, body/interior panels), Packed ORM texture (Image_1_1: R occlusion, G roughness, B metalness), Image_2_2 - Base colour atlas (BMW roundel badges, M-stripe badge, tyre tread, brake disc, blue paint, brown leather swatches), Image_3_3 - Detail normal map (fine fabric/carbon weave, hex mesh, brushed lines for interior trim), Image_4_4 B channel (metalness map, trim/badge atlas) (+7 more)

### Community 5 - "Vite and React Template"
Cohesion: 0.28
Nodes (7): @vitejs/plugin-react@^6.0.1, Hot Module Replacement (HMR), React + Vite Template, @vitejs/plugin-react (Oxc), @vitejs/plugin-react-swc (SWC), vite, @vitejs/plugin-react

### Community 6 - "HTML Entry and Logos"
Cohesion: 0.29
Nodes (6): index.html SPA Entry Page, #root Mount Point, react-dom@^19.2.5, Favicon (Vite lightning-bolt logo, purple), react-dom, Vite Logo (with dark-mode parenthesis styling)

### Community 7 - "npm Scripts"
Cohesion: 0.40
Nodes (5): scripts, build, dev, lint, preview

## Ambiguous Edges - Review These
- `Hero()` → `Hero Image (isometric layered tiles)`  [AMBIGUOUS]
  src/assets/hero.png · relation: references
- `Navbar()` → `Social Icon SVG Sprite (Bluesky, Discord, Docs, GitHub, Social, X)`  [AMBIGUOUS]
  public/icons.svg · relation: conceptually_related_to
- `Image_1_1 R channel - Occlusion-slot mask (bright UV islands: 5-spoke rim, tyre, seats, body/interior panels)` → `Packed ORM texture (Image_1_1: R occlusion, G roughness, B metalness)`  [AMBIGUOUS]
  public/models/Image_1_1@channels=R.jpeg · relation: implements

## Knowledge Gaps
- **12 isolated node(s):** `Hot Module Replacement (HMR)`, `Social Icon SVG Sprite (Bluesky, Discord, Docs, GitHub, Social, X)`, `React Logo (atom)`, `Layered Stack / Build Layers Motif`, `Image_1_1 B channel - Metalness (per-material flat tiles of 5x5 ORM atlas)` (+7 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 28 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `App Shell and Pages` to `Runtime Dependencies`, `3D Scenes (R3F)`, `Vite and React Template`, `HTML Entry and Logos`?**
  _High betweenness centrality (0.221) - this node is a cross-community bridge._
- **Are the 8 inferred relationships involving `Car 3D model (MDL14063 GLB, BMW)` (e.g. with `Image_0_0 - Normal map atlas (tyre tread/sidewall, grille mesh, BMW roundel emboss, wheel/brake rings)` and `Packed ORM texture (Image_1_1: R occlusion, G roughness, B metalness)`) actually correct?**
  _`Car 3D model (MDL14063 GLB, BMW)` has 8 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Hot Module Replacement (HMR)`, `Social Icon SVG Sprite (Bluesky, Discord, Docs, GitHub, Social, X)`, `React Logo (atom)` to the rest of the system?**
  _12 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Runtime Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.09032258064516129 - nodes in this community are weakly interconnected._
- **Why does `BMWScene()` connect `3D Scenes (R3F)` to `Car Model Textures`?**
  _High betweenness centrality (0.198) - this node is a cross-community bridge._

### Low-confidence Hints
_AMBIGUOUS edges — the extractor was unsure. Verify before acting on these._

- **What is the exact relationship between `Hero()` and `Hero Image (isometric layered tiles)`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **What is the exact relationship between `Navbar()` and `Social Icon SVG Sprite (Bluesky, Discord, Docs, GitHub, Social, X)`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._