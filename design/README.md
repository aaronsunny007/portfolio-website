# DRIFT design canvas

Source files for the DRIFT portfolio design canvas (7 boards: hero, phone hero,
opening-sequence storyboard, Pit Crew, Track, Garage, Finish).

- Live canvas (private, owner only): https://claude.ai/artifact/XM6JysrWbUZN33Dr9aL1wk
- Design system it follows: https://claude.ai/artifact/CxCS2jgZ1FKQ8EzFNQzXZP
- `canvas/` holds the board files (`*.dc.html`), the layout index (`canvas.json`) and the
  design tokens (`ds/drift/tokens.json`). The boards open only inside the Claude Design
  canvas viewer; they are not part of the Vite app build.
- `render/` holds the three.js page and Playwright script used to render
  `public/models/MDL14063_reversed.glb` to the car stills embedded in the boards
  (black paint, number plate texture swapped to "SUNNY 07").

Not included: personal photos and the photo cut-out versions of the scenes.

Licence note: the car model carries real BMW badges and came with a third-party plate
("ItsDiyor"). Check its licence before publishing the site.
