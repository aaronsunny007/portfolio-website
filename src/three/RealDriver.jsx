import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';
import { clock } from './timeline';
import { driverRoot } from './driverPath';

/*
  A realistic, rigged avatar of Sunny (e.g. an Avaturn export) that walks in and leans on the bonnet.
  Works with any Mixamo-compatible humanoid rig (bones named Hips, Spine, LeftUpLeg… with or without "mixamorig").
  - walk: a walk clip (Mixamo FBX or GLB), retargeted onto the avatar by bone name, played in place.
  - lean: an optional lean/idle clip. Without one, the lean pose is built from the skeleton (see LEAN_AIMS).
*/

const WALK_SPEED = 1.3; // m/s a typical Mixamo walk covers per second of clip
const draco = new DRACOLoader().setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.5/');
const gltf = new GLTFLoader().setDRACOLoader(draco).setMeshoptDecoder(MeshoptDecoder);

const norm = (n) => n.replace(/^mixamorig[:_]?/i, '').replace(/[^a-z0-9]/gi, '').toLowerCase();

async function loadAny(url) {
  if (/\.fbx(\?|$)/i.test(url)) {
    const o = await new FBXLoader().loadAsync(url);
    return { scene: o, animations: o.animations };
  }
  return gltf.loadAsync(url);
}

function boneMap(root) {
  const m = new Map();
  root.traverse((o) => {
    if (o.isBone && !m.has(norm(o.name))) m.set(norm(o.name), o);
  });
  return m;
}

/**
 * Retarget a clip onto the avatar in world space, so rigs with different axes or rest poses still line up:
 * each bone gets the source bone's world rotation change since its rest pose. Baked at 30 fps.
 * Hips height is kept (scaled to the avatar); hips travel is removed because the site moves the root itself.
 */
function retarget(clip, srcRoot, dstRoot, dst) {
  const src = boneMap(srcRoot);
  const pairs = [];
  dst.forEach((bone, name) => {
    const s = src.get(name);
    if (s) pairs.push({ bone, s, depth: depthOf(bone) });
  });
  pairs.sort((a, b) => a.depth - b.depth); // parents first
  srcRoot.updateMatrixWorld(true);
  dstRoot.updateMatrixWorld(true);
  for (const p of pairs) {
    p.srcRest = p.s.getWorldQuaternion(new THREE.Quaternion()).invert();
    p.dstRest = p.bone.getWorldQuaternion(new THREE.Quaternion());
    p.values = [];
  }
  const hips = pairs.find((p) => norm(p.bone.name) === 'hips');
  const srcHipY0 = hips ? hips.s.getWorldPosition(new THREE.Vector3()).y : 1;
  const dstHipW = hips ? hips.bone.getWorldPosition(new THREE.Vector3()) : null;
  const hipVals = [];

  const mixer = new THREE.AnimationMixer(srcRoot);
  mixer.clipAction(clip).play();
  const fps = 30;
  const frames = Math.max(2, Math.round(clip.duration * fps) + 1);
  const times = [];
  const world = new Map();
  const q = new THREE.Quaternion();
  const pw = new THREE.Quaternion();
  const v = new THREE.Vector3();
  for (let f = 0; f < frames; f++) {
    const t = Math.min(clip.duration, f / fps);
    times.push(t);
    mixer.setTime(t);
    srcRoot.updateMatrixWorld(true);
    world.clear();
    for (const p of pairs) {
      const w = p.s.getWorldQuaternion(new THREE.Quaternion()).multiply(p.srcRest).multiply(p.dstRest);
      world.set(p.bone, w);
      const parentW = world.get(p.bone.parent) || p.bone.parent.getWorldQuaternion(pw);
      q.copy(parentW).invert().multiply(w);
      p.values.push(q.x, q.y, q.z, q.w);
    }
    if (hips) {
      const k = hips.s.getWorldPosition(v).y / srcHipY0;
      const target = dstHipW.clone();
      target.y *= k;
      hips.bone.parent.worldToLocal(target);
      hipVals.push(target.x, target.y, target.z);
    }
  }
  mixer.stopAllAction();
  const tracks = pairs.map((p) => new THREE.QuaternionKeyframeTrack(`${p.bone.name}.quaternion`, times, p.values));
  if (hips) tracks.push(new THREE.VectorKeyframeTrack(`${hips.bone.name}.position`, times, hipVals));
  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}

function depthOf(o) {
  let d = 0;
  while (o.parent) {
    d++;
    o = o.parent;
  }
  return d;
}

/* ---------- the bonnet lean, built by aiming bones (rig-agnostic; character faces +Z, his left is +X) ---------- */
const D = (x, y, z) => new THREE.Vector3(x, y, z).normalize();
const LEG_L = D(-0.16, -0.85, 0.53); // left ankle crossed over the right
const LEG_R = D(0.06, -0.86, 0.5);
const LEAN_AIMS = [
  ['spine', ['spine1', 'spine2', 'neck'], D(0, 1, -0.16)], // leaning back
  ['spine1', ['spine2', 'neck'], D(0, 1, -0.28)],
  ['spine2', ['neck', 'head'], D(0, 1, -0.34)],
  ['neck', ['head'], D(0, 1, -0.08)],
  ['leftupleg', ['leftleg'], LEG_L],
  ['leftleg', ['leftfoot'], LEG_L],
  ['leftfoot', ['lefttoebase'], D(0, -0.4, 1)],
  ['rightupleg', ['rightleg'], LEG_R],
  ['rightleg', ['rightfoot'], LEG_R],
  ['rightfoot', ['righttoebase'], D(0, -0.4, 1)],
  ['leftarm', ['leftforearm'], D(0.42, -0.72, -0.55)], // both palms planted on the bonnet behind him
  ['leftforearm', ['lefthand'], D(0.4, -0.74, -0.55)],
  ['lefthand', ['lefthandmiddle1'], D(0.15, -0.3, -1)],
  ['rightarm', ['rightforearm'], D(-0.42, -0.72, -0.55)],
  ['rightforearm', ['righthand'], D(-0.4, -0.74, -0.55)],
  ['righthand', ['righthandmiddle1'], D(-0.15, -0.3, -1)],
];
const HEAD_TURN = -0.45; // towards the camera
const HEAD_TILT = 0.08;

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _w = new THREE.Quaternion();
const _p = new THREE.Quaternion();
const _r = new THREE.Quaternion();

function aim(root, bone, child, dirRoot) {
  root.updateMatrixWorld(true);
  bone.getWorldPosition(_a);
  child.getWorldPosition(_b);
  const cur = _b.sub(_a).normalize();
  // character space = the frame the avatar faces +Z in, i.e. its holder's parent
  if (root.parent) root.parent.getWorldQuaternion(_r);
  else _r.identity();
  const tgt = dirRoot.clone().applyQuaternion(_r);
  _q.setFromUnitVectors(cur, tgt);
  bone.getWorldQuaternion(_w).premultiply(_q);
  bone.parent.getWorldQuaternion(_p).invert();
  bone.quaternion.copy(_p.multiply(_w));
}

/** Rotate a bone about an axis given in the character's root space. */
function rotateInRoot(root, bone, axisRoot, angle) {
  root.updateMatrixWorld(true);
  // character space = the frame the avatar faces +Z in, i.e. its holder's parent
  if (root.parent) root.parent.getWorldQuaternion(_r);
  else _r.identity();
  const axis = axisRoot.clone().applyQuaternion(_r);
  _q.setFromAxisAngle(axis, angle);
  bone.getWorldQuaternion(_w).premultiply(_q);
  bone.parent.getWorldQuaternion(_p).invert();
  bone.quaternion.copy(_p.multiply(_w));
}

function buildLean(root, bones) {
  const rest = new Map();
  bones.forEach((b) => rest.set(b, b.quaternion.clone()));
  for (const [name, childNames, dir] of LEAN_AIMS) {
    const bone = bones.get(name);
    const child = childNames.map((c) => bones.get(c)).find(Boolean);
    if (bone && child) aim(root, bone, child, dir);
  }
  const head = bones.get('head');
  if (head) {
    rotateInRoot(root, head, new THREE.Vector3(0, 1, 0), HEAD_TURN);
    rotateInRoot(root, head, new THREE.Vector3(0, 0, 1), HEAD_TILT);
  }
  const lean = new Map();
  bones.forEach((b) => lean.set(b, b.quaternion.clone()));
  rest.forEach((q, b) => b.quaternion.copy(q));
  root.updateMatrixWorld(true);
  return lean;
}

export default function RealDriver({ cfg, onFail }) {
  const outer = useRef();
  const [rig, setRig] = useState(null);
  const root$ = useRef({ pos: new THREE.Vector3() });

  useEffect(() => {
    let alive = true;
    (async () => {
      const avatar = await loadAny(cfg.model);
      const scene = avatar.scene;
      scene.traverse((o) => {
        if (o.isMesh) {
          o.castShadow = true;
          o.receiveShadow = true;
          if (o.isSkinnedMesh) o.frustumCulled = false;
        }
      });
      // real-world scale: keep it if it's human-sized, otherwise normalise to 1.78 m
      scene.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(scene, true);
      const h = box.max.y - box.min.y;
      if (h < 1.3 || h > 2.3) scene.scale.multiplyScalar(1.78 / h);

      const bones = boneMap(scene);
      if (!bones.get('hips')) throw new Error('Avatar has no Hips bone');
      const facing = new THREE.Group();
      facing.add(scene);
      const lx = bones.get('leftupleg')?.getWorldPosition(new THREE.Vector3()).x ?? 1;
      const rx = bones.get('rightupleg')?.getWorldPosition(new THREE.Vector3()).x ?? 0;
      if (lx < rx) facing.rotation.y = Math.PI; // model faces -Z: turn it round
      facing.updateMatrixWorld(true);
      const mixer = new THREE.AnimationMixer(scene);

      const pick = async (url, re) => {
        if (url) {
          const src = await loadAny(url);
          const clip = src.animations.find((c) => re.test(c.name)) || src.animations[0];
          return clip && retarget(clip, src.scene, facing, bones);
        }
        const own = avatar.animations.find((c) => re.test(c.name));
        return own && retarget(own, scene, facing, bones);
      };
      const walkClip = await pick(cfg.walk, /walk/i);
      const leanClip = await pick(cfg.lean, /lean/i);
      const walk = walkClip && mixer.clipAction(walkClip);
      const lean = leanClip && mixer.clipAction(leanClip);
      walk?.play();
      lean?.play();

      // how far the hips drop when the legs angle forward into the lean
      scene.updateMatrixWorld(true);
      const hipY = bones.get('hips').getWorldPosition(new THREE.Vector3()).y;
      const ankle = bones.get('leftfoot') || bones.get('rightfoot');
      const legLen = ankle ? hipY - ankle.getWorldPosition(new THREE.Vector3()).y : hipY * 0.9;
      const drop = lean ? 0 : legLen * (1 - Math.abs(LEG_L.y));
      const leanPose = lean ? null : buildLean(facing, bones);

      const rigData = { scene, facing, mixer, walk, lean, leanPose, drop, bones };
      window.__sunnyRig = rigData; // dev hook
      if (alive) setRig(rigData);
    })().catch((e) => {
      console.warn('Avatar failed to load, using the stylised driver instead:', e);
      if (alive) onFail();
    });
    return () => {
      alive = false;
    };
  }, [cfg, onFail]);

  useFrame(() => {
    const g = outer.current;
    if (!g || !rig) return;
    const t = clock.t;
    const r = driverRoot(t, root$.current);
    // without a walk clip he can't walk in, so he's simply there once the walk would have ended
    const turn = rig.walk ? r.turn : r.turn > 0 ? 1 : 0;
    g.visible = r.visible && (rig.walk || turn > 0);
    if (!g.visible) return;
    g.position.copy(r.pos);
    g.rotation.y = r.yaw;

    if (rig.walk) {
      rig.walk.time = (r.dist / WALK_SPEED) % rig.walk.getClip().duration;
      rig.walk.setEffectiveWeight(rig.lean ? 1 - turn : 1);
    }
    if (rig.lean) {
      rig.lean.setEffectiveWeight(turn);
      rig.lean.time = Math.max(0, t) % rig.lean.getClip().duration;
    }
    rig.mixer.update(0);

    if (rig.leanPose && turn > 0) {
      rig.leanPose.forEach((q, bone) => bone.quaternion.slerp(q, turn));
      rig.facing.position.y = -rig.drop * turn;
      if (turn >= 1) {
        const head = rig.bones.get('head');
        if (head) rotateInRoot(rig.facing, head, new THREE.Vector3(0, 1, 0), Math.sin(t * 0.45) * 0.06); // a slow look
      }
    } else {
      rig.facing.position.y = 0;
    }
  });

  return <group ref={outer}>{rig && <primitive object={rig.facing} />}</group>;
}
