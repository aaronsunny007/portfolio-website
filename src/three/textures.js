import * as THREE from 'three';

// Small seeded generator so the road looks the same on every load.
function rng(seed) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function toTexture(canvas) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  return [c, c.getContext('2d')];
}

/** White soft round glow. Tinted by the material colour. */
export function radialTexture(size = 128) {
  const [c, g] = canvas(size, size);
  const r = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)');
  r.addColorStop(0.35, 'rgba(255,255,255,0.28)');
  r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, size, size);
  return toTexture(c);
}

/**
 * The underglow's pool, in the car's own footprint (plane 4.4 x 6.4 model units, chassis about 1.7 x 4.0). The emitter is under the chassis
 * and hidden by it, so the light is strongest just outside the sills and falls off softly with distance; it breaks up where wet asphalt
 * scatters it. White: the material tints it. Drawn once, nothing is lit in real time.
 */
export function underglowTexture() {
  const W = 256;
  const H = 384;
  const [c, g] = canvas(W, H);
  const fw = 100;
  const fh = 236;
  const off = 1000; // the shape is drawn off the canvas and only its blurred shadow lands on it: glow with no hard outline
  g.shadowColor = 'rgba(255,255,255,1)';
  g.shadowOffsetX = off;
  g.fillStyle = '#fff';
  for (const [blur, a] of [[96, 0.9], [52, 0.75], [20, 0.55]]) {
    g.shadowBlur = blur;
    g.globalAlpha = a;
    g.beginPath();
    g.roundRect((W - fw) / 2 - off, (H - fh) / 2, fw, fh, 42);
    g.fill();
  }
  g.shadowBlur = 0;
  g.shadowOffsetX = 0;
  g.globalAlpha = 1;
  const rand = rng(11);
  g.globalCompositeOperation = 'destination-out'; // breakup: patches and faint streaks along the wet surface
  for (let i = 0; i < 240; i++) {
    const x = rand() * W;
    const y = rand() * H;
    const r = 3 + rand() * 15;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(0,0,0,${0.08 + rand() * 0.22})`);
    gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  for (let i = 0; i < 36; i++) {
    g.fillStyle = `rgba(0,0,0,${0.03 + rand() * 0.07})`;
    g.fillRect(rand() * W, 0, 1 + rand() * 3, H);
  }
  g.globalCompositeOperation = 'destination-in'; // nothing reaches the edge of the plane
  g.save();
  g.translate(W / 2, H / 2);
  g.scale(W / H, 1);
  const m = g.createRadialGradient(0, 0, 0, 0, 0, H / 2);
  m.addColorStop(0, '#fff');
  m.addColorStop(0.72, 'rgba(255,255,255,0.9)');
  m.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = m;
  g.fillRect(-H / 2, -H / 2, H, H);
  g.restore();
  return toTexture(c);
}

/** A soft black blob with a darker core: the contact shadow under a tyre, and the body's shadow on the road. */
export function contactTexture() {
  const [c, g] = canvas(64, 64);
  const r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  r.addColorStop(0, 'rgba(0,0,0,1)');
  r.addColorStop(0.45, 'rgba(0,0,0,0.55)');
  r.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = r;
  g.fillRect(0, 0, 64, 64);
  return toTexture(c);
}

/** The floating route's surface: asphalt, worn edge lines, a dashed centre line and a chevron that points the way. v runs along the direction of travel. */
export function routeTexture() {
  const [c, g] = canvas(128, 300);
  g.fillStyle = '#161b22';
  g.fillRect(0, 0, 128, 300);
  const rand = rng(3);
  for (let i = 0; i < 700; i++) {
    g.fillStyle = `rgba(255,255,255,${0.02 + rand() * 0.04})`;
    g.fillRect(rand() * 128, rand() * 300, 1.5, 1.5);
  }
  g.fillStyle = 'rgba(235,238,242,0.42)'; // lane edges, just inside the kerbs, and a dashed centre line
  g.fillRect(14, 0, 3, 300);
  g.fillRect(111, 0, 3, 300);
  for (let y = 10; y < 300; y += 100) g.fillRect(62.5, y, 3, 50);
  const t = toTexture(c);
  t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}

/** A painted chequered finish line, worn: 16 x 3 squares, hard edges, grain over the top. */
export function finishTexture() {
  const [c, g] = canvas(256, 48);
  for (let y = 0; y < 3; y++) for (let x = 0; x < 16; x++) {
    g.fillStyle = (x + y) % 2 ? 'rgba(235,238,242,0.9)' : 'rgba(235,238,242,0.12)';
    g.fillRect(x * 16, y * 16, 16, 16);
  }
  const rand = rng(21);
  for (let i = 0; i < 500; i++) {
    g.fillStyle = 'rgba(18,22,28,0.5)';
    g.fillRect(rand() * 256, rand() * 48, 2, 2);
  }
  const t = toTexture(c);
  t.magFilter = THREE.NearestFilter;
  return t;
}

/** Bright at the top, fading down: a lamp's reflection on wet tarmac. */
export function streakTexture() {
  const [c, g] = canvas(32, 256);
  const v = g.createLinearGradient(0, 0, 0, 256);
  v.addColorStop(0, 'rgba(255,255,255,1)');
  v.addColorStop(0.2, 'rgba(255,255,255,0.45)');
  v.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = v;
  g.fillRect(0, 0, 32, 256);
  g.globalCompositeOperation = 'destination-in';
  const h = g.createLinearGradient(0, 0, 32, 0);
  h.addColorStop(0, 'rgba(255,255,255,0)');
  h.addColorStop(0.5, 'rgba(255,255,255,1)');
  h.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = h;
  g.fillRect(0, 0, 32, 256);
  return toTexture(c);
}

/** Charcoal asphalt with wet sheen along the wheel tracks, speckle and a few drift tyre marks. Road runs along y. */
export function roadTexture(low) {
  const W = low ? 256 : 512;
  const H = low ? 1024 : 2048;
  const k = W / 512;
  const rand = rng(7);
  const [c, g] = canvas(W, H);
  g.fillStyle = '#12161c';
  g.fillRect(0, 0, W, H);
  g.scale(k, k);

  // wet sheen: soft pale bands where the tyres run, broken into patches
  for (const x of [150, 362]) {
    const band = g.createLinearGradient(x - 70, 0, x + 70, 0);
    band.addColorStop(0, 'rgba(90,125,150,0)');
    band.addColorStop(0.5, 'rgba(90,125,150,0.07)');
    band.addColorStop(1, 'rgba(90,125,150,0)');
    g.fillStyle = band;
    g.fillRect(x - 70, 0, 140, H / k);
  }
  for (let i = 0; i < 40; i++) {
    g.save();
    g.translate(rand() * 512, rand() * (H / k));
    g.scale(1, 3);
    const r = 30 + rand() * 90;
    const p = g.createRadialGradient(0, 0, 0, 0, 0, r);
    p.addColorStop(0, 'rgba(80,110,135,0.09)');
    p.addColorStop(1, 'rgba(80,110,135,0)');
    g.fillStyle = p;
    g.fillRect(-r, -r, r * 2, r * 2);
    g.restore();
  }

  // speckle
  for (let i = 0; i < 5000; i++) {
    g.fillStyle = `rgba(255,255,255,${0.02 + rand() * 0.04})`;
    g.fillRect(rand() * 512, rand() * (H / k), 1.4, 1.4);
  }

  // tyre marks: a pair of curved strokes that fade in and out
  for (let n = 0; n < 5; n++) {
    const y0 = (H / k) * (0.08 + n * 0.19) + rand() * 40;
    const len = 380 + rand() * 160;
    const x0 = 120 + rand() * 270;
    const x1 = x0 + (rand() < 0.5 ? -1 : 1) * (90 + rand() * 90);
    const fade = g.createLinearGradient(0, y0, 0, y0 + len);
    fade.addColorStop(0, 'rgba(0,0,0,0)');
    fade.addColorStop(0.2, 'rgba(0,0,0,0.78)');
    fade.addColorStop(0.8, 'rgba(0,0,0,0.78)');
    fade.addColorStop(1, 'rgba(0,0,0,0)');
    for (const off of [-30, 30]) {
      g.beginPath();
      g.moveTo(x0 + off, y0);
      g.bezierCurveTo(x0 + off, y0 + len * 0.45, x1 + off, y0 + len * 0.55, x1 + off, y0 + len);
      g.strokeStyle = 'rgba(120,150,170,0.05)';
      g.lineWidth = 24;
      g.stroke();
      g.strokeStyle = fade;
      g.lineWidth = 12;
      g.stroke();
    }
  }
  const t = toTexture(c);
  t.anisotropy = 4;
  return t;
}
