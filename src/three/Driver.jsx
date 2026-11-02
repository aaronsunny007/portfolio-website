import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { T, clock, CAR_FINAL, carLocalToWorld, smooth, lerp } from './timeline';

/*
  Sunny, as a stylised 3D figure. Built from primitives so it loads instantly.
  Look (from his photos): warm brown skin, messy black hair with a fringe, short stubble, round gold wire specs.
  Fit (chosen for warm brown skin: contrast + warm earth tones): ecru bomber with black rib trim,
  rust tee, gold chain, black tapered trousers, white sneakers with a drift-red heel tab.
*/

const C = {
  skin: '#7c4c31',
  skinDark: '#5f3722',
  hair: '#0b0909',
  beard: '#1a100b',
  jacket: '#d8ccb6',
  rib: '#15161a',
  tee: '#a2401d',
  pants: '#131417',
  shoe: '#f3f2ee',
  sole: '#d8d1c3',
  red: '#e10600',
  gold: '#d6a84e',
};

// Deterministic randomness so the hair is the same on every load.
function rng(seed) {
  let s = seed;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

function buildRig() {
  const M = {
    skin: new THREE.MeshStandardMaterial({ color: C.skin, roughness: 0.55 }),
    skinDark: new THREE.MeshStandardMaterial({ color: C.skinDark, roughness: 0.6 }),
    hair: new THREE.MeshStandardMaterial({ color: C.hair, roughness: 0.45 }),
    beard: new THREE.MeshStandardMaterial({ color: C.beard, roughness: 1, transparent: true, opacity: 0.55 }),
    jacket: new THREE.MeshStandardMaterial({ color: C.jacket, roughness: 0.9, side: THREE.DoubleSide }),
    rib: new THREE.MeshStandardMaterial({ color: C.rib, roughness: 0.9 }),
    tee: new THREE.MeshStandardMaterial({ color: C.tee, roughness: 0.92 }),
    pants: new THREE.MeshStandardMaterial({ color: C.pants, roughness: 0.78 }),
    shoe: new THREE.MeshStandardMaterial({ color: C.shoe, roughness: 0.55 }),
    sole: new THREE.MeshStandardMaterial({ color: C.sole, roughness: 0.7 }),
    red: new THREE.MeshStandardMaterial({ color: C.red, roughness: 0.5 }),
    gold: new THREE.MeshStandardMaterial({ color: C.gold, metalness: 1, roughness: 0.22 }),
    lens: new THREE.MeshPhysicalMaterial({ color: '#3a1806', metalness: 0.7, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.92 }),
  };

  const add = (parent, geo, mat, pos = [0, 0, 0], rot = [0, 0, 0], scl = [1, 1, 1]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...pos);
    m.rotation.set(...rot);
    m.scale.set(...scl);
    m.castShadow = true;
    parent.add(m);
    return m;
  };
  const pivot = (parent, pos) => {
    const g = new THREE.Group();
    g.position.set(...pos);
    parent.add(g);
    return g;
  };
  const cap = (r, len) => new THREE.CapsuleGeometry(r, len, 6, 16);

  const root = new THREE.Group();
  const J = {};
  J.hips = pivot(root, [0, 0.92, 0]);
  add(J.hips, new THREE.SphereGeometry(1, 20, 14), M.pants, [0, -0.02, 0], [0, 0, 0], [0.165, 0.12, 0.115]);

  // legs
  for (const side of ['L', 'R']) {
    const sx = side === 'L' ? 1 : -1;
    const hip = (J['leg' + side] = pivot(J.hips, [0.092 * sx, -0.04, 0]));
    add(hip, cap(0.078, 0.3), M.pants, [0, -0.21, 0]);
    const knee = (J['knee' + side] = pivot(hip, [0, -0.43, 0]));
    add(knee, cap(0.06, 0.3), M.pants, [0, -0.2, 0], [0, 0, 0], [1, 1, 0.95]);
    const ankle = (J['ankle' + side] = pivot(knee, [0, -0.41, 0]));
    add(ankle, new RoundedBoxGeometry(0.105, 0.085, 0.28, 3, 0.035), M.shoe, [0, -0.025, 0.055]);
    add(ankle, new RoundedBoxGeometry(0.112, 0.03, 0.29, 2, 0.012), M.sole, [0, -0.07, 0.055]);
    add(ankle, new THREE.BoxGeometry(0.035, 0.05, 0.02), M.red, [0, 0.0, -0.088]);
    add(ankle, new THREE.BoxGeometry(0.06, 0.004, 0.08), M.red, [0.054 * sx, -0.02, 0.06], [0, 0, Math.PI / 2]);
  }

  // torso
  const spine = (J.spine = pivot(J.hips, [0, 0.04, 0]));
  add(spine, cap(0.145, 0.28), M.tee, [0, 0.25, 0.005], [0, 0, 0], [1.08, 1, 0.68]);
  const GAP = 0.8;
  add(spine, new THREE.CylinderGeometry(0.205, 0.178, 0.45, 32, 1, true, GAP / 2, Math.PI * 2 - GAP), M.jacket, [0, 0.245, 0], [0, 0, 0], [1, 1, 0.7]);
  add(spine, new THREE.SphereGeometry(0.205, 32, 12, 0, Math.PI * 2, 0, Math.PI / 2), M.jacket, [0, 0.47, 0], [0, 0, 0], [1, 0.32, 0.7]);
  add(spine, new THREE.TorusGeometry(0.178, 0.032, 10, 40), M.rib, [0, 0.03, 0], [Math.PI / 2, 0, 0], [1, 0.7, 1]);
  add(spine, new THREE.TorusGeometry(0.18, 0.006, 6, 40), M.red, [0, 0.045, 0], [Math.PI / 2, 0, 0], [1, 0.7, 1]);
  add(spine, new THREE.TorusGeometry(0.075, 0.024, 10, 28), M.rib, [0, 0.5, 0.005], [Math.PI / 2, 0, 0], [1, 0.85, 1]);
  add(spine, new THREE.TorusGeometry(0.068, 0.0055, 6, 32), M.gold, [0, 0.45, 0.04], [1.15, 0, 0], [1, 1.15, 1]);
  for (const sx of [1, -1]) add(spine, new THREE.SphereGeometry(0.085, 16, 12), M.jacket, [0.19 * sx, 0.425, 0]);

  // arms
  for (const side of ['L', 'R']) {
    const sx = side === 'L' ? 1 : -1;
    const sh = (J['arm' + side] = pivot(spine, [0.205 * sx, 0.43, 0]));
    add(sh, cap(0.066, 0.2), M.jacket, [0, -0.15, 0]);
    const el = (J['elbow' + side] = pivot(sh, [0, -0.29, 0]));
    add(el, cap(0.057, 0.18), M.jacket, [0, -0.12, 0]);
    add(el, new THREE.CylinderGeometry(0.052, 0.05, 0.05, 16), M.rib, [0, -0.25, 0]);
    const hand = pivot(el, [0, -0.28, 0]);
    add(hand, new THREE.SphereGeometry(1, 14, 10), M.skin, [0, -0.04, 0.005], [0, 0, 0], [0.04, 0.055, 0.028]);
    add(hand, cap(0.014, 0.03), M.skin, [-0.03 * sx, -0.03, 0.02], [0.4, 0, 0.5 * sx]);
  }

  // neck + head
  const neck = (J.neck = pivot(spine, [0, 0.5, 0]));
  add(neck, new THREE.CylinderGeometry(0.048, 0.054, 0.12, 16), M.skin, [0, 0.04, 0]);
  const head = (J.head = pivot(neck, [0, 0.1, 0]));
  head.scale.setScalar(1.1);
  const H = 0.1; // head centre height inside the head pivot
  add(head, new THREE.SphereGeometry(0.112, 32, 24), M.skin, [0, H, 0], [0, 0, 0], [0.9, 1.08, 0.98]);
  add(head, new THREE.SphereGeometry(0.1, 24, 16), M.skin, [0, H - 0.04, 0.012], [0, 0, 0], [0.86, 0.9, 0.95]); // jaw
  // short boxed beard / stubble over the jaw
  add(head, new THREE.SphereGeometry(0.117, 32, 16, 0, Math.PI, 1.98, 0.98), M.beard, [0, H, 0], [0, 0, 0], [0.92, 1.09, 1.0]);
  add(head, cap(0.007, 0.04), M.beard, [0, H - 0.035, 0.108], [0, 0, Math.PI / 2]); // moustache
  add(head, new THREE.TorusGeometry(0.022, 0.0045, 6, 16, Math.PI * 0.8), M.skinDark, [0, H - 0.052, 0.103], [0, 0, Math.PI * 1.1]); // smirk
  add(head, cap(0.017, 0.03), M.skin, [0, H - 0.005, 0.113], [-0.25, 0, 0], [1, 1, 1.1]); // nose
  for (const sx of [1, -1]) {
    add(head, new THREE.SphereGeometry(0.03, 12, 10), M.skin, [0.1 * sx, H, -0.005], [0, 0, 0], [0.45, 1, 0.8]); // ears
    add(head, new THREE.BoxGeometry(0.052, 0.012, 0.014), M.hair, [0.043 * sx, H + 0.052, 0.104], [0.1, 0, -0.12 * sx]); // brows
    // round gold wire specs with tinted lenses
    add(head, new THREE.TorusGeometry(0.03, 0.0035, 8, 36), M.gold, [0.043 * sx, H + 0.018, 0.112]);
    add(head, new THREE.CircleGeometry(0.029, 28), M.lens, [0.043 * sx, H + 0.018, 0.111]);
    add(head, new THREE.CylinderGeometry(0.0028, 0.0028, 0.12, 6), M.gold, [0.09 * sx, H + 0.022, 0.055], [Math.PI / 2, 0, 0]);
  }
  add(head, new THREE.TorusGeometry(0.012, 0.003, 6, 12, Math.PI), M.gold, [0, H + 0.022, 0.114]);

  // hair: base cap + messy volume on top + fringe falling forward
  add(head, new THREE.SphereGeometry(0.121, 28, 16, 0, Math.PI * 2, 0, 1.5), M.hair, [0, H + 0.012, -0.004], [0, 0, 0], [0.95, 1.06, 1.03]);
  add(head, new THREE.SphereGeometry(0.119, 24, 16, Math.PI, Math.PI, 0, 2.15), M.hair, [0, H + 0.008, -0.006], [0, 0, 0], [0.95, 1.04, 1.02]);
  const r = rng(7);
  for (let i = 0; i < 26; i++) {
    const th = r() * 1.15; // from the crown
    const ph = r() * Math.PI * 2;
    const rad = 0.118;
    const x = Math.sin(th) * Math.cos(ph) * rad * 0.95;
    const z = Math.sin(th) * Math.sin(ph) * rad;
    const y = Math.cos(th) * rad * 1.06;
    const s = 0.036 + r() * 0.03;
    add(head, new THREE.SphereGeometry(s, 10, 8), M.hair, [x, H + 0.015 + y, z], [r() * 0.8 - 0.4, r() * 3, r() * 0.8 - 0.4], [1.3, 0.7, 1.15]);
  }
  // fringe locks, swept to his left
  const locks = [
    [-0.05, 0.085, 0.085, 0.5],
    [-0.015, 0.075, 0.1, 0.35],
    [0.025, 0.08, 0.098, 0.2],
    [0.06, 0.088, 0.08, 0.1],
  ];
  for (const [x, y, z, tilt] of locks) {
    add(head, new THREE.SphereGeometry(0.034, 10, 8), M.hair, [x, H + y, z], [0.5, 0, tilt], [0.9, 1.5, 0.6]);
  }

  return { root, J };
}

/* ---------------- poses ---------------- */
const KEYS = ['hipsY', 'hipsRx', 'hipsRy', 'hipsRz', 'spineRx', 'spineRy', 'spineRz', 'headRx', 'headRy', 'headRz',
  'armLRx', 'armLRz', 'elbowL', 'armRRx', 'armRRz', 'elbowR', 'legLRx', 'legLRz', 'legLRy', 'kneeL', 'legRRx', 'legRRz', 'legRRy', 'kneeR', 'ankleL', 'ankleR'];

function walkPose(phi) {
  const s = Math.sin(phi), c = Math.cos(phi);
  const kneeL = 0.06 + 0.9 * Math.pow(Math.max(0, c), 1.5);
  const kneeR = 0.06 + 0.9 * Math.pow(Math.max(0, -c), 1.5);
  const legL = -0.42 * s, legR = 0.42 * s;
  return {
    hipsY: 0.905 + Math.abs(c) * 0.028, hipsRx: 0.02, hipsRy: s * 0.15, hipsRz: s * 0.06,
    spineRx: -0.06, spineRy: -s * 0.22, spineRz: -s * 0.045, // shoulders swing against the hips: the swagger
    headRx: -0.05, headRy: 0.55 + s * 0.04, headRz: 0.04, // eyes on the camera while he walks
    armLRx: 0.14, armLRz: 0.16, elbowL: -0.5, // left hand in the jacket pocket
    armRRx: -0.4 * s, armRRz: -0.1, elbowR: -0.22 - 0.25 * Math.max(0, s),
    legLRx: legL, legLRz: 0.02, legLRy: 0, kneeL, legRRx: legR, legRRz: -0.02, legRRy: 0, kneeR,
    ankleL: -(legL + kneeL) * 0.55, ankleR: -(legR + kneeR) * 0.55,
  };
}

const LEAN = {
  hipsY: 0.79, hipsRx: -0.14, hipsRy: 0, hipsRz: 0.04,
  spineRx: -0.2, spineRy: 0.1, spineRz: 0.05,
  headRx: 0.02, headRy: -0.42, headRz: 0.09, // turned to the camera, slight head tilt
  armLRx: 0.72, armLRz: 0.42, elbowL: -0.06, // both palms planted on the bonnet behind him
  armRRx: 0.68, armRRz: -0.46, elbowR: -0.06,
  legLRx: -0.62, legLRz: -0.16, legLRy: 0.1, kneeL: 0.1, // left ankle crossed over the right
  legRRx: -0.56, legRRz: 0.06, legRRy: -0.06, kneeR: 0.16,
  ankleL: 0.62, ankleR: 0.5,
};

function mix(a, b, k) {
  const o = {};
  for (const key of KEYS) o[key] = lerp(a[key], b[key], k);
  return o;
}

function apply(J, P) {
  J.hips.position.y = P.hipsY;
  J.hips.rotation.set(P.hipsRx, P.hipsRy, P.hipsRz);
  J.spine.rotation.set(P.spineRx, P.spineRy, P.spineRz);
  J.head.rotation.set(P.headRx, P.headRy, P.headRz);
  J.armL.rotation.set(P.armLRx, 0, P.armLRz);
  J.armR.rotation.set(P.armRRx, 0, P.armRRz);
  J.elbowL.rotation.x = P.elbowL;
  J.elbowR.rotation.x = P.elbowR;
  J.legL.rotation.set(P.legLRx, P.legLRy, P.legLRz);
  J.legR.rotation.set(P.legRRx, P.legRRy, P.legRRz);
  J.kneeL.rotation.x = P.kneeL;
  J.kneeR.rotation.x = P.kneeR;
  J.ankleL.rotation.x = P.ankleL;
  J.ankleR.rotation.x = P.ankleR;
}

// Lean spot: just in front of the bonnet's camera-side corner.
const LEAN_AT = carLocalToWorld({ x: CAR_FINAL.x, z: CAR_FINAL.z, yaw: CAR_FINAL.yaw }, -0.5, 0, 2.6);
const LEAN_YAW = CAR_FINAL.yaw - 0.18; // back to the bonnet
const WALK_FROM = new THREE.Vector3(LEAN_AT.x + 4.6, 0, LEAN_AT.z + 0.7);
const WALK_DIR = new THREE.Vector3().subVectors(LEAN_AT, WALK_FROM);
const WALK_DIST = WALK_DIR.length();
const WALK_YAW = Math.atan2(WALK_DIR.x, WALK_DIR.z);
const STRIDE = 0.78;

export default function Driver() {
  const { root, J } = useMemo(() => buildRig(), []);
  const ref = useRef();

  useFrame(() => {
    const t = clock.t;
    const g = ref.current;
    const tw = t - T.walkStart;
    if (tw < 0) {
      g.visible = false;
      return;
    }
    g.visible = true;
    const walkU = Math.min(1, tw / T.walkLen);
    // constant pace, then braking over the last 20% of the walk
    const du = walkU - 0.8;
    const d = WALK_DIST * (walkU < 0.8 ? walkU / 0.9 : (0.8 + du - (du * du) / 0.4) / 0.9);
    const dist = Math.min(WALK_DIST, d);
    const phi = (dist / STRIDE) * Math.PI;
    const turn = smooth(0, 1, (tw - T.walkLen) / T.turnLen);

    g.position.copy(WALK_FROM).addScaledVector(WALK_DIR, dist / WALK_DIST);
    g.rotation.y = lerp(WALK_YAW, LEAN_YAW, turn);

    const P = mix(walkPose(phi), LEAN, turn);
    if (turn >= 1) {
      // idle life: breathing, a slow look
      const b = Math.sin(t * 1.6);
      P.spineRx += b * 0.012;
      P.headRy += Math.sin(t * 0.45) * 0.06;
      P.headRx += Math.sin(t * 0.7) * 0.02;
    }
    apply(J, P);
  });

  return (
    <group ref={ref} visible={false}>
      <primitive object={root} />
    </group>
  );
}
