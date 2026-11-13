# Project notes: journey cards, deploy and open items

Last updated 2026-11-13. Live site: https://aaronsunny007.github.io/portfolio-website/ (GitHub Pages, deployed from `main` by `.github/workflows/deploy.yml`: `npm ci`, lint, build, deploy-pages).

## What changed in the latest round

**Journey cards (`src/content/profile.js`, `src/components/Career.jsx`, `src/index.css`)**
- Each milestone photo carries its own focal point: `pos` (wide layout), `posM` (stacked layout) and an optional `tall` flag (`'y'` = deeper photo strip on desktop and mobile, `'m'` = mobile only).
- Card 03 shows the whole head; card 04 shows the full face (tall strip); card 05 (Tom & Ollie) uses the new castle photo, `public/images/journey/05-tom-and-ollie.webp`; card 06 was nudged to keep the head in frame.
- Card spacing tightened so six cards fit at 1366x768 with the "Read the build notes" control and chapter rail visible. On shorter or narrower screens the copy area scrolls, with a bottom fade (`data-more`) as the cue; opening notes scrolls them into view.
- Tom & Ollie keeps its truthful status: "Built · Not deployed".

**Sub-path hosting fixes**
- Vite `base` is `./`, so photo URLs are relative and read through `import.meta.env.BASE_URL`.
- A `url()` inside a CSS custom property resolves against the stylesheet (`assets/`), not the page. The hero ambient portrait (`src/sections/Portrait.jsx`) now builds an absolute URL from `document.baseURI`.

**Commits**: `d4225be` (journey work plus the other pending portfolio changes), `5aa7a3a` (portrait 404 fix). `main` was fast-forwarded; no force-push, no history rewrite.

## Checks run

- `npm run lint`: clean. `node --test src`: 35 pass. `vite build`: OK, all six journey images in `dist`.
- Browser: cards checked at 1366x768, 1366x640 and a phone width; local production preview had no console errors or failed requests.
- Live: new bundle served, no failed resources, chapters 01 and 05 load their photos. Both Pages runs after the fix succeeded.

## Open items (not done or not verified)

- Not tested: tablet width, keyboard navigation, reduced motion, rapid input, the no-WebGL fallback, the "Ahead" state on the live site.
- Card 06 crop and cards 01/02 on mobile were not re-viewed after the change.
- On phones the card copy still scrolls internally; there is not room for it all.
- The repo homepage also lists a Vercel URL (https://portfolio-website-eight-swart-77.vercel.app); it was not touched or checked.
- `npm audit --omit=dev` reports 7 vulnerabilities (including a Vite dev-server `server.fs.deny` issue on Windows). Nothing was upgraded.
- No custom domain / CNAME exists; the site is on the github.io URL.
- `graphify-out/` is regenerated locally and deliberately left uncommitted.
- `public/cv/` is empty and `profile.email` / `profile.cv` are blank, so no email or CV control shows (see the TODO in `profile.js`).
