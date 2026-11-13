import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { FIXED, clock, carState, carLocalToWorld, smooth } from './timeline';

// rear tyre contact patches in car space (read off the model: track 0.805, rear axle z = -1.34)
const REAR = [
  [-0.805, 0.12, -1.34],
  [0.805, 0.12, -1.34],
];
const SMOKE_RATE = 85; // particles per second per rear tyre at full slide
const SLIP_MIN = 0.25;

/* ---------------- Tyre smoke: one Points draw call, CPU-updated pool ---------------- */
const MAX_SMOKE = 800;

const smokeVert = /* glsl */ `
  attribute float aSize; attribute float aAlpha; attribute float aTint;
  uniform float uScale;
  varying float vAlpha; varying float vTint;
  void main() {
    vAlpha = aAlpha; vTint = aTint;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
const smokeFrag = /* glsl */ `
  varying float vAlpha; varying float vTint;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    a *= a * vAlpha;
    vec3 grey = vec3(0.56, 0.62, 0.7); // cool, as if lit by the street
    vec3 red = vec3(1.0, 0.16, 0.08);   // the rear light on the plume
    vec3 cyan = vec3(0.16, 0.8, 0.95);  // the street's neon, caught in the older smoke
    gl_FragColor = vec4(mix(grey, vTint > 0.0 ? red : cyan, abs(vTint)), a);
  }`;

export function TyreSmoke() {
  const { size, camera } = useThree();
  const pts = useRef();
  const pool = useMemo(
    () =>
      Array.from({ length: MAX_SMOKE }, () => ({ life: 1, max: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, s0: 0, red: 0, a: 0 })),
    []
  );
  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_SMOKE * 3), 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(MAX_SMOKE), 1));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(MAX_SMOKE), 1));
    g.setAttribute('aTint', new THREE.BufferAttribute(new Float32Array(MAX_SMOKE), 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
    return g;
  }, []);
  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: smokeVert,
        fragmentShader: smokeFrag,
        uniforms: { uScale: { value: 1 } },
        transparent: true,
        depthWrite: false,
      }),
    []
  );
  const cursor = useRef(0);
  const seen = useRef(clock.resetId);
  const lastT = useRef(clock.t);
  const owed = useRef(0); // fractional particles carried between frames
  const w = useMemo(() => new THREE.Vector3(), []);

  function spawn(x, y, z, big) {
    const p = pool[cursor.current];
    cursor.current = (cursor.current + 1) % MAX_SMOKE;
    p.x = x + (Math.random() - 0.5) * 0.2;
    p.y = y;
    p.z = z + (Math.random() - 0.5) * 0.2;
    // low and slow: born at the tyre contact point and left where the car was (so it lies along the drift path), with a light drift to the
    // right, the way the car went, then it spreads and thins instead of rising as a column
    p.vx = (Math.random() - 0.3) * 0.7;
    p.vy = 0.15 + Math.random() * 0.55;
    p.vz = (Math.random() - 0.5) * 0.7;
    p.life = 0;
    p.max = big ? 2.4 + Math.random() * 1.6 : 3.2;
    p.s0 = big ? 0.25 + Math.random() * 0.3 : 0.8;
    const r = Math.random();
    p.red = r < 0.04 ? 0.5 : r < 0.12 ? -0.4 : 0; // a few red and cyan puffs: restrained, the smoke stays grey
    p.a = big ? 0.045 + Math.random() * 0.045 : 0.04;
  }

  useFrame((_, dt) => {
    // dev capture mode: smoke only moves on frames where the opening clock moved
    if (FIXED) {
      dt = clock.t !== lastT.current ? 1 / 30 : 0;
      lastT.current = clock.t;
    } else dt = Math.min(dt, 0.05);
    if (seen.current !== clock.resetId) {
      seen.current = clock.resetId;
      pool.forEach((p) => (p.life = p.max = 1));
    }
    mat.uniforms.uScale.value = size.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    const slipping = Math.abs(carState.slip) > SLIP_MIN && carState.speed > 1.5;
    if (slipping) {
      // restrained: a steady plume that thickens with slide angle, emitted by time rather than by frame
      owed.current += dt * SMOKE_RATE * smooth(SLIP_MIN, 0.85, Math.abs(carState.slip));
      for (; owed.current >= 1; owed.current -= 1) {
        for (const [lx, ly, lz] of REAR) {
          carLocalToWorld(carState, lx, ly, lz, w);
          spawn(w.x, w.y, w.z, true);
        }
      }
    }
    const pos = geo.attributes.position.array;
    const sz = geo.attributes.aSize.array;
    const al = geo.attributes.aAlpha.array;
    const rd = geo.attributes.aTint.array;
    for (let i = 0; i < MAX_SMOKE; i++) {
      const p = pool[i];
      p.life += dt;
      const k = Math.min(1, p.life / p.max);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      const drag = Math.pow(0.985, dt * 60); // per second, not per frame
      p.vx *= drag;
      p.vz *= drag;
      pos[i * 3] = p.x;
      pos[i * 3 + 1] = p.y;
      pos[i * 3 + 2] = p.z;
      sz[i] = p.s0 + 2.6 * Math.sqrt(k);
      al[i] = k >= 1 ? 0 : p.a * (1 - k) * Math.min(1, p.life * 6);
      rd[i] = p.red;
    }
    geo.attributes.position.needsUpdate = true;
    geo.attributes.aSize.needsUpdate = true;
    geo.attributes.aAlpha.needsUpdate = true;
    geo.attributes.aTint.needsUpdate = true;
  });

  return <points ref={pts} geometry={geo} material={mat} frustumCulled={false} renderOrder={5} />;
}

/* ---------------- Skid marks: two ribbons of quads laid while slipping ---------------- */
const MAX_QUADS = 700;
const WIDTH = 0.26;

export function SkidMarks() {
  const meshes = useMemo(
    () =>
      REAR.map(() => {
        const g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX_QUADS * 4 * 3), 3));
        const idx = new Uint32Array(MAX_QUADS * 6);
        for (let q = 0; q < MAX_QUADS; q++) {
          const v = q * 4;
          idx.set([v, v + 1, v + 2, v + 2, v + 1, v + 3], q * 6);
        }
        g.setIndex(new THREE.BufferAttribute(idx, 1));
        g.setDrawRange(0, 0);
        g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
        return { g, n: 0, last: null };
      }),
    []
  );
  const mat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: '#000000',
        transparent: true,
        opacity: 0.55,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -2,
      }),
    []
  );
  const seen = useRef(clock.resetId);
  const w = useMemo(() => new THREE.Vector3(), []);

  useEffect(() => () => meshes.forEach((m) => m.g.dispose()), [meshes]);

  useFrame(() => {
    if (seen.current !== clock.resetId) {
      seen.current = clock.resetId;
      meshes.forEach((m) => {
        m.n = 0;
        m.last = null;
        m.g.setDrawRange(0, 0);
      });
    }
    const slipping = Math.abs(carState.slip) > SLIP_MIN && carState.speed > 1;
    REAR.forEach(([lx, , lz], i) => {
      const m = meshes[i];
      carLocalToWorld(carState, lx, 0.012, lz, w);
      if (!slipping) {
        m.last = null;
        return;
      }
      if (!m.last) {
        m.last = w.clone();
        return;
      }
      const dx = w.x - m.last.x;
      const dz = w.z - m.last.z;
      const len = Math.hypot(dx, dz);
      if (len < 0.1 || m.n >= MAX_QUADS) return;
      const nx = (-dz / len) * WIDTH * 0.5;
      const nz = (dx / len) * WIDTH * 0.5;
      const a = m.g.attributes.position.array;
      const o = m.n * 12;
      a.set(
        [m.last.x + nx, 0.012, m.last.z + nz, m.last.x - nx, 0.012, m.last.z - nz, w.x + nx, 0.012, w.z + nz, w.x - nx, 0.012, w.z - nz],
        o
      );
      m.n++;
      m.g.attributes.position.needsUpdate = true;
      m.g.setDrawRange(0, m.n * 6);
      m.last.copy(w);
    });
  });

  return (
    <>
      {meshes.map((m, i) => (
        <mesh key={i} geometry={m.g} material={mat} frustumCulled={false} renderOrder={1} />
      ))}
    </>
  );
}
