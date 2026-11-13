import * as THREE from 'three';
import { milestones } from '../content/profile';

// The career route, in its own space: x is the direction of travel, z is sideways (right on screen), y is up.
// The night scene turns it to run away from the camera, the same way the road runs.
// It never doubles back, so the car always faces away from the viewer. It rises and falls, banks into its bends,
// jumps a gap, and ends on a launch lip a few units over the night road, which the car leaves to land on the road and drive on.
export const N = milestones.length;
export const RY = 6; // how high the route floats above the road
export const ROAD_W = 2.8;
export const U_END = 1; // the road is built to the end of the route: the launch lip over the night road
const TILE = 6; // world length of one road texture tile
const HW = ROAD_W / 2;
const UP = new THREE.Vector3(0, 1, 0);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const sstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

/**
 * A track: a curve plus the frame (position, tangent, bank, curvature) at any point, and a sweep that extrudes a
 * cross-section along it. The bank follows the bend, so the road leans into its corners and the car leans with it.
 */
function createTrack(points, { bankK = 0, maxBank = 0.3, calm = null } = {}) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  const len = curve.getLength();
  const S = 480;
  const h = new Float32Array(S + 1);
  const t = new THREE.Vector3();
  let prev = 0;
  for (let k = 0; k <= S; k++) {
    curve.getTangentAt(k / S, t);
    let a = Math.atan2(t.z, t.x);
    if (k) a += Math.round((prev - a) / (2 * Math.PI)) * 2 * Math.PI;
    h[k] = prev = a;
  }
  const raw = new Float32Array(S + 1);
  for (let k = 1; k < S; k++) raw[k] = (h[k + 1] - h[k - 1]) / ((2 * len) / S);
  raw[0] = raw[1];
  raw[S] = raw[S - 1];
  const kap = new Float32Array(S + 1); // curvature (heading change per unit length), smoothed; positive turns toward +z
  const bank = new Float32Array(S + 1);
  const R = 9;
  for (let k = 0; k <= S; k++) {
    let sum = 0;
    for (let j = k - R; j <= k + R; j++) sum += raw[clamp(j, 0, S)];
    kap[k] = sum / (2 * R + 1);
    const u = k / S;
    const flat = calm ? 1 - sstep(calm[0] - 0.05, calm[0] - 0.015, u) * (1 - sstep(calm[1] + 0.015, calm[1] + 0.05, u)) : 1;
    bank[k] = clamp(kap[k] * bankK, -maxBank, maxBank) * flat;
  }

  /** The frame at u: o.p position, o.t tangent, o.lat sideways (leaning with the bank), o.up the road's normal, o.k curvature, o.bank. */
  const frame = (u, o) => {
    curve.getPointAt(u, o.p);
    curve.getTangentAt(u, o.t);
    const f = clamp(u, 0, 1) * S;
    const i = Math.min(S - 1, Math.floor(f));
    const a = f - i;
    o.k = kap[i] * (1 - a) + kap[i + 1] * a;
    o.bank = bank[i] * (1 - a) + bank[i + 1] * a;
    const l = Math.hypot(o.t.x, o.t.z) || 1;
    o.n.set(-o.t.z / l, 0, o.t.x / l);
    const c = Math.cos(o.bank);
    const s = Math.sin(o.bank);
    o.lat.copy(o.n).multiplyScalar(c).addScaledVector(UP, -s);
    o.up.copy(UP).multiplyScalar(c).addScaledVector(o.n, s);
    return o;
  };

  /**
   * Extrude a cross-section along the track. ranges: [[u0, u1, segments], ...] (the gap is simply a range that is not listed).
   * profile: [[sideways, up, r, g, b?], ...], one polyline. Index order follows the track, so a draw range reveals it progressively.
   */
  const sweep = (ranges, profile, caps = false) => {
    const P = profile.length;
    const colour = profile[0].length > 2;
    const rings = ranges.reduce((a, r) => a + r[2] + 1, 0);
    const pos = new Float32Array(rings * P * 3);
    const col = colour ? new Float32Array(rings * P * 3) : null;
    const uv = new Float32Array(rings * P * 2);
    const idx = [];
    const f = { p: new THREE.Vector3(), t: new THREE.Vector3(), n: new THREE.Vector3(), lat: new THREE.Vector3(), up: new THREE.Vector3(), k: 0, bank: 0 };
    let ring = 0;
    const ends = [];
    for (const [u0, u1, segs] of ranges) {
      ends.push(ring);
      for (let k = 0; k <= segs; k++) {
        const u = u0 + ((u1 - u0) * k) / segs;
        frame(u, f);
        for (let j = 0; j < P; j++) {
          const [l, v] = profile[j];
          const o = (ring * P + j) * 3;
          pos[o] = f.p.x + f.lat.x * l + f.up.x * v;
          pos[o + 1] = f.p.y + f.lat.y * l + f.up.y * v;
          pos[o + 2] = f.p.z + f.lat.z * l + f.up.z * v;
          if (colour) col.set([profile[j][2], profile[j][3], profile[j][4]], o);
          uv.set([(l + HW) / ROAD_W, ((u - u0) * len) / TILE], (ring * P + j) * 2);
        }
        if (k) {
          const a = (ring - 1) * P;
          const b = ring * P;
          for (let j = 0; j < P - 1; j++) idx.push(a + j, a + j + 1, b + j, a + j + 1, b + j + 1, b + j);
        }
        ring++;
      }
      ends.push(ring - 1);
    }
    // closed ends, after everything else so a draw range never reaches them first
    if (caps) for (const r of ends) for (let j = 1; j < P - 1; j++) idx.push(r * P, r * P + j, r * P + j + 1);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    if (col) g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setIndex(idx);
    g.userData = { ranges, per: (P - 1) * 6 };
    return g;
  };

  /** How many indices of a sweep are behind u, for a draw range that follows the car. */
  const drawCount = (g, u) => {
    let n = 0;
    for (const [u0, u1, segs] of g.userData.ranges) n += Math.floor(clamp((u - u0) / (u1 - u0), 0, 1) * segs);
    return n * g.userData.per;
  };

  return { curve, len, frame, sweep, drawCount };
}

export const newFrame = () => ({ p: new THREE.Vector3(), t: new THREE.Vector3(), n: new THREE.Vector3(), lat: new THREE.Vector3(), up: new THREE.Vector3(), k: 0, bank: 0 });

// x forward, y up, z sideways. Checkpoints sit at the outer edge of a bend, alternating right and left, so the road
// swings away from the panel beside it and the panels beside it alternate: the road runs between them.
const PTS = [
  [-22, -0.4, 2.8], [-14, 0.4, 3.8], [8, 1.4, 0.2], [30, 2.6, -4], [52, 3.6, -0.2], [74, 4, 4], [96, 2.8, 0.2], [118, 1.4, -4], [140, 2.4, -0.2], [162, 3.4, 3.8],
  [178, 3.8, 1.2], [192, 4.3, 0.5], [204, 4.6, 0.5], [216, 3.5, 0.5], [228, 3.4, 0.5], [244, 3.2, -1.5], [262, 2.8, -3.4], [276, 2.4, -1.4], [290, 1.5, -0.3], [304, 0.1, 0], [318, -1.3, 0], [332, -2.4, 0], [344, -3, 0],
]; // about 40 route units between checkpoints; the jump runs along a straight, so the car leaves and lands in line with the road
const CP_AT = [1, 3, 5, 7, 9, 16]; // the points that are checkpoints: the outer edge of each bend, alternating right and left
const LIP_AT = 12; // the launch lip
const LAND_AT = 13; // the landing
export const route = createTrack(PTS, { bankK: 4, maxBank: 0.24 });
export const curve = route.curve;
export const LEN = route.len;

// The slip road: it leaves the night road below and climbs into the start of the route, so the road leads into the journey.
const RAMP = [[-76, -RY + 0.03, 0], [-62, -RY + 0.03, 0.4], [-49, -RY * 0.84, 1.6], [-38, -RY * 0.46, 3], [-30, -RY * 0.14, 3.2], PTS[0]];
export const ramp = createTrack(RAMP, { bankK: 3 });

// Where things sit along the route, found from the points above (by their x, which only ever increases).
const uAtX = (x) => {
  const p = new THREE.Vector3();
  let best = 0;
  let d = Infinity;
  for (let k = 0; k <= 3000; k++) {
    route.curve.getPointAt(k / 3000, p);
    if (Math.abs(p.x - x) < d) {
      d = Math.abs(p.x - x);
      best = k / 3000;
    }
  }
  return best;
};
const CPU = CP_AT.map((k) => uAtX(PTS[k][0]));
/** Where checkpoint i sits along the route, 0..1 by distance. */
export const cpU = (i) => CPU[i];
/** How far through the cards the car is (in cards), from its place on the route. */
export const deckAt = (u) => {
  let i = 0;
  while (i < N - 2 && u > CPU[i + 1]) i++;
  return i + (u - CPU[i]) / (CPU[i + 1] - CPU[i]);
};

// The gap: the launch lip and the landing, between the last two checkpoints.
export const GAP = { u0: uAtX(PTS[LIP_AT][0]), u1: uAtX(PTS[LAND_AT][0]) };
const AIR = 2.4; // how far above the road the arc peaks
// The car is about 3 units long. It leaves the ground once its rear wheels are past the lip, and touches down once its front and rear
// wheels are both on the landing road: the arc starts a little after the lip and ends a little after the landing edge.
export const ARC = { a: GAP.u0 + 1.6 / LEN, b: GAP.u1 + 2.8 / LEN };

/** Height above the road while airborne: a controlled arc that leaves and lands level with the road (no slope jump at either end). */
export const airAt = (u) => (u <= ARC.a || u >= ARC.b ? 0 : AIR * Math.pow(Math.sin((Math.PI * (u - ARC.a)) / (ARC.b - ARC.a)), 1.6));
/** The suspension after touchdown: it compresses, then settles (0..1 at its deepest). */
export const squashAt = (u) => {
  const x = (u - ARC.b) / 0.014;
  return x > 0 ? x * Math.exp(1 - x) : 0;
};
/** …and extends just before the lip. */
export const stretchAt = (u) => {
  const x = (ARC.a - u) / 0.012;
  return x > 0 && x < 1 ? Math.sin(Math.PI * x) * 0.5 : 0;
};

/**
 * Where the car is on the route between checkpoint i and i+1, for x in 0..1 of the way (scroll). The last leg holds the jump back:
 * the approach, the air and the landing each get their own share of the scroll, with the air taking the longest for its length.
 */
const JUMP_X = [0, 0.3, 0.68, 1];
export const legAt = (i, x) => {
  const a = CPU[i];
  const b = CPU[i + 1];
  if (i !== N - 2) return a + (b - a) * x;
  const k = [a, ARC.a - 0.012, ARC.b + 0.012, b];
  const j = x < JUMP_X[1] ? 0 : x < JUMP_X[2] ? 1 : 2;
  return k[j] + ((k[j + 1] - k[j]) * (x - JUMP_X[j])) / (JUMP_X[j + 1] - JUMP_X[j]);
};

// The way out. After the last milestone the route runs on, straight and gently downhill, to a lip over the night road. The car leaves the lip,
// glides down level onto the road (FLY units), and drives on (ROLL). Distances beyond the end of the curve are measured in `xo`.
export const EXIT = 1.8; // scroll after the last milestone, in cards
export const LIP_X = PTS[PTS.length - 1][0];
export const FLY = 30;
export const ROLL = 24;
const LIP_DROP = RY + PTS[PTS.length - 1][1]; // how far the lip is above the night road
/** The lowering over the flight: level at the lip and level on touchdown. */
const drop = (xo) => {
  const e = clamp(xo / FLY, 0, 1);
  return LIP_DROP * e * e * (3 - 2 * e);
};
/** 0..1..0 while the car is off the lip and in the air. */
export const flightAt = (xo) => (xo <= 0 || xo >= FLY ? 0 : Math.sin((Math.PI * xo) / FLY));
/** The suspension after touchdown on the night road. */
export const landSquash = (xo) => {
  const x = (xo - FLY) / 5;
  return x > 0 ? x * Math.exp(1 - x) : 0;
};
/** Where the car is, in route space, `s` units from the start of the route (past the end: off the lip and down onto the road). */
export const carAt = (s, out) => {
  route.curve.getPointAt(clamp(s / LEN, 0, 1), out);
  if (s > LEN) {
    out.x += s - LEN;
    out.y -= drop(s - LEN);
  }
  return out;
};
/** Scroll through the exit (0..1) to the car's place: [t along the route, xo beyond it]. */
export const exitAt = (ex) => {
  const a = sstep(0, 0.25, ex);
  const t = CPU[N - 1] + (1 - CPU[N - 1]) * a;
  const xo = ex < 0.25 ? 0 : ex < 0.7 ? (FLY * (ex - 0.25)) / 0.45 : FLY + (ROLL * (ex - 0.7)) / 0.3;
  return [t, xo];
};

/** Restrained accent per kind of milestone. Red is kept for the active checkpoint. */
export const ACCENT = { Education: '#1aa7ad', Internship: '#3a8fd0', Project: '#b0287f' };

/** Which side of the road each panel waits on: right, left, right… so the road runs between them. The ahead card is last. */
export const sideOf = (i) => (i % 2 ? -1 : 1);
/** How high each panel floats above the road, so they hang at different heights. */
export const HEIGHT = [2.6, 3.8, 2.3, 3.6, 2.5, 3.4, 3.1];

/**
 * The journey's cards alternate: 01 on the right, 02 on the left, and so on. +1 is a card on the left (the scene slides right to leave it
 * room), -1 a card on the right. Chapter 06 is on the left, and so is the plan ahead.
 */
export const cardSide = (i) => (i % 2 ? 1 : -1);
// The card's column and the page gutter beside it, in px; src/index.css (.chapter-dock) uses the same numbers.
export const cardW = (vw) => Math.min(760, Math.max(520, vw * 0.46));
export const gutter = (vw) => Math.min(64, Math.max(24, vw * 0.04));
// How far along a leg (0..1 of the scroll between two checkpoints) things happen, so the order is always: the car drives into the bend
// (the jump leg: airborne, landing), then the scene slides to make room on the other side, then the new card arrives. Never all at once.
const SHIFT = [0.5, 0.8]; // the scene's slide across
const SHIFT_JUMP = [0.62, 0.84]; // after the landing (the landing is done by about 0.57)
const SWITCH = 0.85; // the card changes
const SWITCH_JUMP = 0.88;
export const switchAt = (leg) => (leg === N - 2 ? SWITCH_JUMP : SWITCH);
/** The scene's side factor at f of the way along `leg`: from cardSide(leg) to cardSide(leg + 1). */
export const sideAt = (leg, f) => {
  const [a, b] = leg === N - 2 ? SHIFT_JUMP : SHIFT;
  return cardSide(leg) + (cardSide(leg + 1) - cardSide(leg)) * sstep(a, b, f);
};

/**
 * State shared by the page (DOM, ScrollTrigger) and the night scene. Plain mutable fields, read inside the frame loop.
 * The car, the camera and the cards are driven by scroll position only: nothing here advances on a timer.
 */
export const view = {
  w: 0, // 0 = windshield on the road, 1 = following the car on the route. Written by a ScrollTrigger.
  ws: 0, // w after smoothing; what the scene actually uses
  t: cpU(0), // the car's place on the route
  xo: 0, // distance beyond the end of the route: off the lip and down onto the road
  ex: 0, // 0..1 through the way out after the last milestone (scroll)
  up: 0, // 0..1 the camera rising from the road into the route (scroll)
  cock: 0, // 0..1 the cockpit (dashboard, pillars, mirror, wipers) coming in as the hero leaves
  dashH: 0, // px, the height the dashboard takes at the foot of the screen
  dash: null, // redraws the instrument cluster (set by the dashboard)
  sel: 0, // the active checkpoint
  sx: -1, // which side the card is on, smoothed with the scroll (see cardSide): the scene slides to the other side
  v: 0, // the car's speed along the route, signed, smoothed (route units per second)
  speed: 0, // 0..1, how fast the scene is moving, for the instrument cluster
  wipe: 0, // 0..1 while the wipers make one pass (set by the section shutters)
  zr: -120, // world z of the route's origin, set from where the career section sits on the page
  pe: 0.6, // page progress (0..1) at the end of the career section: where the page's travel picks up after the car has landed
  tall: false, // portrait screens: the active card docks to the bottom and the car rides high in the frame
  panels: [], // DOM cards, in checkpoint order, then the ahead card
  heights: [], // px, each card's own height (cards are as tall as their content)
  layer: null, // the fixed layer the cards live in
  link: null, // the thin line from the active card to the car
  wrap: null, // the .night wrapper
  invalidate: null, // redraw one frame (used when frames are on demand)
};

if (import.meta.env.DEV) window.__view = view; // dev hook, like __cam

/** A point on the route, in world space (the route group is turned a quarter turn and lifted to RY). */
export const routeToWorld = (p, out) => out.set(p.z, RY + p.y, view.zr - p.x);
