import * as THREE from 'three';
import { T, clamp01, smooth } from './timeline';

/*
  One drift pass: in from beyond the left edge, sideways across the frame with the nose swung toward the camera,
  out through the right. The line bows toward the camera in the middle (the car is biggest at the apex), and the
  slide angle builds on entry, holds with a little driver correction, then eases as the car straightens and leaves.
*/
const path = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-14, 0, -1.9),
    new THREE.Vector3(-6.5, 0, -0.2),
    new THREE.Vector3(0, 0, 0.95),
    new THREE.Vector3(6.5, 0, 0.45),
    new THREE.Vector3(14, 0, -1.5),
  ],
  false,
  'centripetal'
);
export const PATH_LENGTH = path.getLength();
const tmp = new THREE.Vector3();
const tan = new THREE.Vector3();

/** Slide angle in radians (negative = nose toward the camera) at pass progress u in 0..1. */
export function slideAngle(u) {
  const build = smooth(0, 0.3, u); // flick: the tail comes round as the car enters
  const ease = smooth(0.72, 1, u); // straightening out of the slide
  const wobble = 0.07 * Math.sin((u - 0.3) * Math.PI * 2.6) * smooth(0.25, 0.45, u) * (1 - ease); // driver modulating the angle
  return -(0.28 + 0.52 * build - 0.42 * ease + wobble);
}

/**
  Car pose at time t. `slip` is the angle between the body and its direction of travel, `speed` is in metres/second,
  `dist` is distance travelled along the line (drives the wheel spin), `u` is pass progress.
*/
export function drivePose(t) {
  const u = clamp01((t - T.driftStart) / T.driftLen);
  const s = u + 0.035 * Math.sin(2 * Math.PI * u); // quick in, a little drag through the slide, quick out
  path.getPointAt(s, tmp);
  path.getTangentAt(s, tan);
  const heading = Math.atan2(tan.x, tan.z);
  const slip = slideAngle(u);
  const moving = u > 0 && u < 1; // parked off-screen before and after the pass
  const speed = moving ? ((1 + 0.22 * Math.cos(2 * Math.PI * u)) * PATH_LENGTH) / T.driftLen : 0;
  return { x: tmp.x, z: tmp.z, yaw: heading + slip, slip, speed, dist: s * PATH_LENGTH, u };
}
