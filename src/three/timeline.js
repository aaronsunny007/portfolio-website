import * as THREE from 'three';

// Every beat of the opening, in seconds from the moment the 3D scene is ready.
export const T = {
  flare: 0.3, // headlight flare off the left edge
  driftStart: 0.5, // car enters from outside the left edge
  driftLen: 3.2, // ...sideways across the frame, to a stop in the middle
  name: 2.5, // 2 s into the drift, the name is dragged in
  walkStart: 4.0, // driver walks in from the right
  walkLen: 3.4,
  turnLen: 1.0, // turns to camera and leans back on the bonnet
  ui: 8.0, // nav, chips, CTAs
  end: 9.6,
};

// Shared mutable state read inside useFrame (never React state in the frame loop).
export const clock = { t: 0, running: false, resetId: 0 };
if (typeof window !== 'undefined') window.__clock = clock; // dev hook for screenshots
export const carState = { x: -20, z: 0, yaw: Math.PI / 2, slip: 0, speed: 0 };

// Where the car comes to rest.
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
