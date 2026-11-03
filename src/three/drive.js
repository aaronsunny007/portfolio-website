import * as THREE from 'three';
import { T, CAR_FINAL, clamp01, smooth } from './timeline';

// The drift line: in from just beyond the left edge, sideways across the frame, then a handbrake stop at CAR_FINAL.
const path = new THREE.CatmullRomCurve3([
  new THREE.Vector3(-12, 0, 1.3),
  new THREE.Vector3(-6.8, 0, 1.0),
  new THREE.Vector3(-3, 0, 0.35),
  new THREE.Vector3(CAR_FINAL.x, 0, CAR_FINAL.z),
]);
const tmp = new THREE.Vector3();
const tan = new THREE.Vector3();
const endTan = path.getTangentAt(1);
const END_HEADING = Math.atan2(endTan.x, endTan.z);

export function drivePose(t) {
  const u = clamp01((t - T.driftStart) / T.driftLen);
  const s = 1 - Math.pow(1 - u, 2.1); // fast entry, braking into the stop
  path.getPointAt(s, tmp);
  path.getTangentAt(s, tan);
  const heading = Math.atan2(tan.x, tan.z);
  const mid = -0.82 - 0.2 * Math.sin(u * Math.PI * 2.4); // sideways, nose toward the camera, swinging like a pendulum
  const slipEnd = CAR_FINAL.yaw - END_HEADING; // the handbrake swing into the final pose
  const slip = THREE.MathUtils.lerp(mid, slipEnd, smooth(0.55, 1, u));
  const speed = u < 1 ? (2.1 * Math.pow(1 - u, 1.1) * path.getLength()) / T.driftLen : 0;
  return { x: tmp.x, z: tmp.z, yaw: heading + slip, slip: u < 1 ? slip : 0, speed, u };
}

