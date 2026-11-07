import * as THREE from 'three';

/*
  The car model ships as four welded meshes: the wheels are baked into the body, so they can neither steer nor spin.
  This lifts them out at load time. Every connected piece of geometry that sits wholly inside a wheel's envelope
  (tyre, rim, bolts, disc) moves into its own pivot group; the body keeps everything else. The vertex buffers are shared,
  so only index lists are rebuilt: cheap, and nothing is re-authored.

  Wheel centres are read off the model (metres, car space, +z is the nose).
*/
export const TYRE_R = 0.345;
const AXLES = { front: 1.485, rear: -1.34 };
const HALF_TRACK = { front: 0.79, rear: 0.805 };
const PAD = 0.025;

export const WHEEL_DEFS = [
  { id: 'fl', front: true, side: -1 },
  { id: 'fr', front: true, side: 1 },
  { id: 'rl', front: false, side: -1 },
  { id: 'rr', front: false, side: 1 },
].map((w) => ({
  ...w,
  centre: new THREE.Vector3(w.side * HALF_TRACK[w.front ? 'front' : 'rear'], TYRE_R, w.front ? AXLES.front : AXLES.rear),
}));

/** Moves the wheels of `root` into pivot groups. Returns [{ ...def, pivot }] (pivots are already added to `root`). */
export function liftWheels(root) {
  root.updateMatrixWorld(true);
  const rootInv = new THREE.Matrix4().copy(root.matrixWorld).invert();
  const wheels = WHEEL_DEFS.map((d) => {
    const pivot = new THREE.Group();
    pivot.name = `wheel_${d.id}`;
    pivot.position.copy(d.centre);
    pivot.rotation.order = 'YXZ'; // steer (about the car's up axis) after spin (about the axle)
    return { ...d, pivot };
  });

  const meshes = [];
  root.traverse((o) => o.isMesh && meshes.push(o));
  const v = new THREE.Vector3();

  for (const mesh of meshes) {
    const geo = mesh.geometry;
    const pos = geo.attributes.position;
    const index = geo.index;
    if (!index) continue;
    const toRoot = new THREE.Matrix4().multiplyMatrices(rootInv, mesh.matrixWorld);

    // connected pieces (union-find over shared vertices) and their bounds in car space
    const n = pos.count;
    const parent = new Int32Array(n);
    for (let i = 0; i < n; i++) parent[i] = i;
    const find = (a) => {
      while (parent[a] !== a) {
        parent[a] = parent[parent[a]];
        a = parent[a];
      }
      return a;
    };
    for (let t = 0; t < index.count; t += 3) {
      const a = find(index.getX(t));
      parent[find(index.getX(t + 1))] = a;
      parent[find(index.getX(t + 2))] = a;
    }
    const bounds = new Map();
    for (let i = 0; i < n; i++) {
      v.fromBufferAttribute(pos, i).applyMatrix4(toRoot);
      const r = find(i);
      const b = bounds.get(r);
      if (!b) bounds.set(r, [v.x, v.y, v.z, v.x, v.y, v.z]);
      else {
        if (v.x < b[0]) b[0] = v.x;
        if (v.y < b[1]) b[1] = v.y;
        if (v.z < b[2]) b[2] = v.z;
        if (v.x > b[3]) b[3] = v.x;
        if (v.y > b[4]) b[4] = v.y;
        if (v.z > b[5]) b[5] = v.z;
      }
    }
    const owner = new Map(); // piece root -> wheel index (or -1)
    for (const [r, b] of bounds) {
      let w = -1;
      for (let k = 0; k < wheels.length && w < 0; k++) {
        const { centre, side } = wheels[k];
        const x0 = Math.min(b[0], b[3]) * side; // distance out from the centreline
        const x1 = Math.max(b[0], b[3]) * side;
        const lo = Math.min(x0, x1);
        const inside =
          lo > 0.46 && Math.max(x0, x1) < 1.0 &&
          b[1] > -PAD && b[4] < 2 * TYRE_R + PAD &&
          b[2] > centre.z - TYRE_R - PAD && b[5] < centre.z + TYRE_R + PAD;
        if (inside) w = k;
      }
      owner.set(r, w);
    }

    // split the index list
    const lists = [[], [], [], []];
    const body = [];
    for (let t = 0; t < index.count; t += 3) {
      const a = index.getX(t);
      const w = owner.get(find(a));
      const dst = w >= 0 ? lists[w] : body;
      dst.push(a, index.getX(t + 1), index.getX(t + 2));
    }
    if (!lists.some((l) => l.length)) continue;

    // the source geometry is cached and shared by every clone of the scene, so give this mesh its own (vertex buffers shared)
    const shared = (indices) => {
      const g = new THREE.BufferGeometry();
      for (const name of Object.keys(geo.attributes)) g.setAttribute(name, geo.attributes[name]);
      g.setIndex(new THREE.BufferAttribute(new Uint32Array(indices), 1));
      g.boundingSphere = geo.boundingSphere;
      g.boundingBox = geo.boundingBox;
      return g;
    };
    mesh.geometry = shared(body);
    for (let k = 0; k < wheels.length; k++) {
      if (!lists[k].length) continue;
      const wm = new THREE.Mesh(shared(lists[k]), mesh.material);
      wm.castShadow = mesh.castShadow;
      wm.receiveShadow = mesh.receiveShadow;
      // same car-space transform as the source mesh, expressed relative to the wheel pivot
      const m = new THREE.Matrix4().makeTranslation(-wheels[k].centre.x, -wheels[k].centre.y, -wheels[k].centre.z).multiply(toRoot);
      m.decompose(wm.position, wm.quaternion, wm.scale);
      wheels[k].pivot.add(wm);
    }
  }

  wheels.forEach((w) => root.add(w.pivot));
  return wheels;
}
