import * as THREE from 'three';

// Every beat of the opening, in seconds from the moment the 3D scene is ready.
export const T = {
  driftStart: 0.5, // the car enters from beyond the left edge
  driftLen: 2.8, // ...one sideways pass across the frame, and out through the right
  reveal: 1.0, // the zip starts as the car enters: the wipe edge trails the car's tail across the frame (car centre ~0.8 screen-widths/s)
  revealLen: 2.45, // keep in step with --wipe in index.css
  ui: 3.4, // nav, copy, chips, CTAs
  end: 4.2,
  // Legacy: only read by the unused avatar / wordmark modules (Driver, RealDriver, driverPath, Wordmark).
  name: 2.5,
  walkStart: 4.0,
  walkLen: 3.4,
  turnLen: 1.0,
};

// Shared mutable state read inside useFrame (never React state in the frame loop).
export const clock = { t: 0, running: false, resetId: 0, hold: false, step: 0 }; // dev hooks: hold freezes the opening (window.__clock.hold = true); step = n then advances n frames while held
if (typeof window !== 'undefined') window.__clock = clock; // dev hook for screenshots
export const FIXED = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('fixed'); // dev: advance exactly 1/30 s per frame for frame-accurate captures
export const carState = { x: -30, z: 0, yaw: Math.PI / 2, slip: 0, speed: 0 };

// Legacy: where the old opening parked the car (read by driverPath / Driver).
export const CAR_FINAL = { x: 0.1, z: -0.3, yaw: 0.72 };

export const clamp01 = (v) => Math.min(1, Math.max(0, v));
export const smooth = (a, b, v) => {
  const x = clamp01((v - a) / (b - a));
  return x * x * (3 - 2 * x);
};
export const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
export const easeOutBack = (x, s = 1.4) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2);
export const lerp = THREE.MathUtils.lerp;

/** Car → world transform helper: local point (x, y, z) to world, given pose. */
export function carLocalToWorld(pose, lx, ly, lz, out = new THREE.Vector3()) {
  const c = Math.cos(pose.yaw), s = Math.sin(pose.yaw);
  return out.set(pose.x + lx * c + lz * s, ly, pose.z - lx * s + lz * c);
}

/** Read ?t=<seconds> or ?t=end to jump the opening (dev + returning-visitor hook). */
export function startTimeFromUrl() {
  const q = new URLSearchParams(window.location.search).get('t');
  if (q === 'end') return T.end;
  const n = parseFloat(q);
  return Number.isFinite(n) ? n : 0;
}
