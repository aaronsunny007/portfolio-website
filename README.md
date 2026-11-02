# Sunny Aaron · DRIFT portfolio

A 3D portfolio told as a drift run. The opening: a black convertible drifts in from the left, smoke off the rear tyres, and slides to a stop. Two seconds in, **SUNNY AARON** is dragged in behind it. Then Sunny walks in and leans back on the bonnet, and the site opens.

Built with Vite, React 19, three.js, React Three Fiber, drei, postprocessing and Lenis. Design rules come from the DRIFT design system.

## Run it

```bash
npm install
npm run dev
```

## Where things live

| Path | What |
|---|---|
| `src/content/` | All copy: profile, toolkit, milestones, projects. Edit here. |
| `src/three/timeline.js` | Every beat of the opening, in seconds |
| `src/three/drive.js` | The drift line, slip angle and handbrake stop |
| `src/three/Car.jsx` | Car model, paint, headlights, suspension settle |
| `src/three/Driver.jsx` | Sunny as a 3D figure: look, outfit, walk cycle, lean pose |
| `src/three/DriftFx.jsx` | Tyre smoke and skid marks |
| `src/three/Wordmark.jsx` | The 3D name behind the car |
| `src/sections/` | Hero overlay, Pit Crew, Track, Garage, Finish |

## Dev hooks

- `?t=end` jumps to the settled hero; `?t=3.2` starts the opening at 3.2 s
- `?tier=high|medium|low` forces a quality tier
- `?cam=driver` close-up on the driver
- `?fixed` advances exactly 1/30 s per frame (for frame-accurate screenshots)

## Credits

Car model: BMW 8 Series convertible by ItsDiyor (licence to confirm), repainted with a custom plate. Not affiliated with BMW AG.
