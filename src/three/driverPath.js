import * as THREE from 'three';
import { T, CAR_FINAL, carLocalToWorld, smooth, lerp } from './timeline';

// Shared by both drivers: where Sunny walks from, where he leans, and when.
export const LEAN_AT = carLocalToWorld({ x: CAR_FINAL.x, z: CAR_FINAL.z, yaw: CAR_FINAL.yaw }, -0.5, 0, 2.6);
export const LEAN_YAW = CAR_FINAL.yaw - 0.18; // back to the bonnet
const WALK_FROM = new THREE.Vector3(LEAN_AT.x + 4.6, 0, LEAN_AT.z + 0.7);
const WALK_DIR = new THREE.Vector3().subVectors(LEAN_AT, WALK_FROM);
export const WALK_DIST = WALK_DIR.length();
const WALK_YAW = Math.atan2(WALK_DIR.x, WALK_DIR.z);

/** Root pose at time t: visible, position, yaw, distance walked and turn (0 walking → 1 leaning). */
export function driverRoot(t, out = { pos: new THREE.Vector3() }) {
  const tw = t - T.walkStart;
  out.visible = tw >= 0;
  const walkU = Math.min(1, Math.max(0, tw) / T.walkLen);
  // constant pace, then braking over the last 20% of the walk
  const du = walkU - 0.8;
  const d = WALK_DIST * (walkU < 0.8 ? walkU / 0.9 : (0.8 + du - (du * du) / 0.4) / 0.9);
  out.dist = Math.min(WALK_DIST, d);
  out.turn = smooth(0, 1, (tw - T.walkLen) / T.turnLen);
  out.pos.copy(WALK_FROM).addScaledVector(WALK_DIR, out.dist / WALK_DIST);
  out.yaw = lerp(WALK_YAW, LEAN_YAW, out.turn);
  return out;
}
