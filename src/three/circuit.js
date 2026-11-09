// Track geometry for the career map, shared by the 2D SVG and the 3D scene. Units: a 100 x 60 box.
const CTRL = [[12, 40], [10, 22], [22, 10], [40, 12], [52, 24], [64, 14], [82, 10], [92, 22], [88, 38], [74, 46], [60, 40], [48, 50], [30, 52], [18, 48]];
const PER = 20; // samples per control span

const cr = (a, b, c, d, t) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);

/** Closed Catmull-Rom loop through CTRL. */
export const samples = [];
CTRL.forEach((_, i) => {
  const p = (k) => CTRL[(i + k + CTRL.length) % CTRL.length];
  for (let s = 0; s < PER; s++) {
    const t = s / PER;
    samples.push({ x: cr(p(-1)[0], p(0)[0], p(1)[0], p(2)[0], t), y: cr(p(-1)[1], p(0)[1], p(1)[1], p(2)[1], t) });
  }
});

const n = samples.length;
const cum = [0];
for (let i = 1; i <= n; i++) cum.push(cum[i - 1] + Math.hypot(samples[i % n].x - samples[i - 1].x, samples[i % n].y - samples[i - 1].y));
const total = cum[n];

export const pathD = 'M' + samples.map((p) => `${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join('L') + 'Z';

/** Position along the loop, t in [0, 1) by distance. `a` is the heading in degrees, `i` a fractional sample index. */
export function pointAt(t) {
  const d = (((t % 1) + 1) % 1) * total;
  let lo = 0;
  let hi = n;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (cum[m] <= d) lo = m;
    else hi = m;
  }
  const a = samples[lo];
  const b = samples[(lo + 1) % n];
  const f = (d - cum[lo]) / (cum[lo + 1] - cum[lo] || 1);
  return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, a: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI, i: lo + f };
}

/** Where checkpoint i of count sits. The last ones stop short of the grid: the route is not finished. */
export const checkpointT = (i, count) => 0.03 + (i / (count - 1)) * 0.8;

/** Shared marker position, tweened by CircuitMap and read by whichever view is showing. */
export const journey = { t: checkpointT(0, 2) };
