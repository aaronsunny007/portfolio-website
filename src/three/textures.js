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
