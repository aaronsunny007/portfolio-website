---
name: react-bits
description: React Bits (reactbits.dev) animated React components, backgrounds, text animations and micro-interactions. Use when the user mentions React Bits or wants a ready-made animated component (e.g. Dither, Aurora, SplitText, FadeContent, BlurText) installed into a React/Next.js project.
---

# React Bits

`references/llms.txt` is React Bits' official component index for agents: every component, its category, variants and props. Search it (grep) for the component name before using one; don't invent props.

## Installing a component

Each component comes in 4 variants: JS-CSS, JS-TW, TS-CSS, TS-TW. Pick the one that matches the project (TypeScript? Tailwind?).

`npx shadcn@latest add https://reactbits.dev/r/<Component>-<LANG>-<STYLE>`, e.g. `https://reactbits.dev/r/SplitText-TS-TW`
(or the same URL with `npx jsrepo@latest add`). Exact names are in `llms.txt`.

For the shadcn MCP server, the project's `components.json` needs:
```json
{ "registries": { "@react-bits": "https://reactbits.dev/r/{name}.json" } }
```
React Bits Pro is a separate paid registry: never suggest its commands unless the user has a license.

If the shadcn MCP server is connected (tools named like `mcp__shadcn__*`), use it to search, view and add `@react-bits` items instead of guessing.

## Gotchas
- Many components need extra deps (gsap, motion, ogl, three, @react-three/fiber); install what the component's file imports.
- Components are copied into the project, so edit them freely afterwards.
- WebGL backgrounds are heavy: one per page, and lazy-load them when below the fold.
- In Next.js App Router, add `'use client'` where the component uses hooks.
