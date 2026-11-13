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

/** Tileable night asphalt for the opening's floor: fine aggregate, darker patched repairs and a few pale wet patches. No marks or lines, so it can repeat without showing it. */
export function groundTexture() {
  const S = 512;
  const rand = rng(11);
  const [c, g] = canvas(S, S);
  g.fillStyle = '#14181e';
  g.fillRect(0, 0, S, S);
  const blob = (x, y, rx, ry, col) => {
    for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) { // drawn at every wrap offset, so the edges tile
      g.save();
      g.translate(x + ox, y + oy);
      g.scale(1, ry / rx);
      const r = g.createRadialGradient(0, 0, 0, 0, 0, rx);
      r.addColorStop(0, col);
      r.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = r;
      g.fillRect(-rx, -rx, rx * 2, rx * 2);
      g.restore();
    }
  };
  for (let i = 0; i < 14; i++) blob(rand() * S, rand() * S, 50 + rand() * 90, 30 + rand() * 60, 'rgba(3,5,8,0.75)'); // patched, darker tarmac
  for (let i = 0; i < 10; i++) blob(rand() * S, rand() * S, 40 + rand() * 70, 14 + rand() * 24, 'rgba(80,135,155,0.18)'); // wet sheen
  for (let i = 0; i < 9000; i++) {
    const l = rand() < 0.5;
    g.fillStyle = l ? `rgba(255,255,255,${0.03 + rand() * 0.07})` : `rgba(0,0,0,${0.15 + rand() * 0.25})`;
    g.fillRect(rand() * S, rand() * S, 1 + rand() * 1.6, 1 + rand() * 1.6);
  }
  const t = toTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(5, 5);
  t.anisotropy = 8;
  return t;
}
