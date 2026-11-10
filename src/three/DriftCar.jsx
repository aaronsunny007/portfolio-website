import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ARC, FLY, ROAD_W, route, view, airAt, squashAt, stretchAt, flightAt, landSquash, carAt, newFrame, routeToWorld, LEN } from './journey';
import { liftWheels, TYRE_R } from './wheels';
import { contactTexture } from './textures';

// The hero's car, on the career route: dark body, neon-green blades, the same wheels that steer and spin.
const URL = (typeof window !== 'undefined' && window.__CAR_URL) || `${import.meta.env.BASE_URL}models/car.glb`;
const SCALE = 0.68; // the model is in metres; the road is 2.8 wide
const GREEN = '#5dff3c'; // the underglow light
const BLADE = '#1f8a18'; // the trim itself: a darker green, so it reads as paint and plastic rather than a glowing outline
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const sstep = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
const UP = new THREE.Vector3(0, 1, 0);

/** A blade: a long sliver with a swept tip, lying in the car's side plane (z along the car, y up), thickness along x. */
function blade(len, h, th = 0.022) {
  const s = new THREE.Shape();
  s.moveTo(0, 0);
  s.lineTo(len, 0);
  s.lineTo(len - h * 2.6, h);
  s.lineTo(h * 0.6, h * 0.4);
  s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: false });
  g.rotateY(-Math.PI / 2); // shape x becomes +z, the extrusion runs toward -x
  return g;
}

// The underglow, as light falling on the road. The road is an unlit material, so scene lights cannot reach it: the light is computed here,
// per pixel, from concealed strip emitters under the sills (inverse-square-like falloff from the nearest strip, a finite reach), and it is
// seen through the asphalt's own grain, which is anchored to the road (not to the car) so it does not swim as the car moves.
// The mesh follows the road under the car (see the per-frame rows in DriftCar), and fades out before the road's edge so no light lands off it.
const POOL = { NX: 12, NZ: 18, HX: 2.0, HZ: 3.2 }; // the footprint in model units, wider and longer than the chassis (about 1.7 x 4.0)
const poolVert = /* glsl */ `
  attribute vec2 aLocal;
  uniform float uS; uniform float uScale;
  varying vec2 vL; varying vec2 vRoad;
  void main() {
    vL = aLocal;
    vRoad = vec2(aLocal.x * uScale, uS + aLocal.y * uScale);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }`;
const poolFrag = /* glsl */ `
  uniform vec3 uColor; uniform float uOpacity; uniform float uYaw; uniform float uHalf;
  varying vec2 vL; varying vec2 vRoad;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float vnoise(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
  }
  float seg(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a; vec2 ba = b - a; return length(pa - ba * clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0)); }
  void main() {
    // the light belongs to the body, so it turns with the body's slide; the road does not
    float c = cos(uYaw); float s = sin(uYaw);
    vec2 p = vec2(c * vL.x - s * vL.y, s * vL.x + c * vL.y);
    float d = min(min(seg(p, vec2(-0.6, -1.4), vec2(-0.6, 1.4)), seg(p, vec2(0.6, -1.4), vec2(0.6, 1.4))), min(seg(p, vec2(-0.5, -1.7), vec2(0.5, -1.7)), seg(p, vec2(-0.5, 1.7), vec2(0.5, 1.7))));
    float e = 1.0 / pow(1.0 + (d * d) / 0.12, 1.5);
    e *= 1.0 - smoothstep(0.7, 1.55, d);
    // asphalt: grain and larger wear catch the light unevenly
    float g = 0.55 * vnoise(vRoad * 26.0) + 0.3 * vnoise(vRoad * 7.0 + 3.1) + 0.15 * vnoise(vRoad * 2.3);
    float tex = mix(0.5, 1.35, g);
    float road = 1.0 - smoothstep(uHalf - 0.3, uHalf, abs(vRoad.x));
    gl_FragColor = vec4(uColor * e * tex * road * uOpacity, 1.0);
    #include <colorspace_fragment>
  }`;

const smokeVert = /* glsl */ `
  attribute float aSize; attribute float aAlpha;
  uniform float uScale;
  varying float vAlpha;
  void main() {
    vAlpha = aAlpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * uScale / -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
const smokeFrag = /* glsl */ `
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vec3(0.56, 0.62, 0.7), a * a * vAlpha);
  }`;

export default function DriftCar({ low, still }) {
  const { scene } = useGLTF(URL);
  const { size, camera } = useThree();
  const root = useRef(); // where the car is, in the world
  const body = useRef(); // its lean and slide
  const contactTex = useMemo(() => contactTexture(), []);
  const groundYaw = useRef(); // the footprint on the road: it turns with the body's slide, but does not lean with it
  const poolMesh = useRef();
  const shadowMat = useRef();

  const car = useMemo(() => {
    const m = scene.clone(true);
    const paints = [];
    m.traverse((o) => {
      if (!o.isMesh) return;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((mat, i) => {
        if (mat.name !== 'Paint_Color') return;
        const paint = new THREE.MeshPhysicalMaterial({ name: 'Paint_Color', color: '#06070a', metalness: 0.4, roughness: 0.38, clearcoat: 1, clearcoatRoughness: 0.05 });
        paints.push(paint);
        if (Array.isArray(o.material)) o.material[i] = paint;
        else o.material = paint;
      });
    });
    const wheels = liftWheels(m);
    const box = new THREE.Box3().setFromObject(m);
    return { m, wheels, box, paints };
  }, [scene]);
  useEffect(() => () => car.paints.forEach((p) => p.dispose()), [car]);

  const blades = useMemo(() => {
    const { box } = car;
    const w = box.max.x;
    const skirt = blade(1.8, 0.13);
    const flick = blade(1.0, 0.08);
    const edge = new THREE.BoxGeometry(1.5, 0.022, 0.1);
    return { w, zMax: box.max.z, zMin: box.min.z, skirt, flick, edge };
  }, [car]);
  useEffect(() => () => [blades.skirt, blades.flick, blades.edge].forEach((g) => g.dispose()), [blades]);

  // tyre smoke: a small world-space pool, in one Points draw call
  const MAX = low ? 90 : 150;
  const smoke = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(MAX * 3), 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(MAX), 1));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(MAX), 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1000);
    const mat = new THREE.ShaderMaterial({ vertexShader: smokeVert, fragmentShader: smokeFrag, uniforms: { uScale: { value: 1 } }, transparent: true, depthWrite: false });
    const pool = Array.from({ length: MAX }, () => ({ life: 1, max: 1, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, s0: 0, a: 0 }));
    return { geo, mat, pool, cursor: 0, owed: 0 };
  }, [MAX]);
  useEffect(() => () => [smoke.geo, smoke.mat].forEach((o) => o.dispose()), [smoke]);

  // the light on the road: a grid under the car whose rows are laid on the road ahead and behind it (see useFrame), with the shader above
  const glow = useMemo(() => {
    const { NX, NZ, HX, HZ } = POOL;
    const n = (NX + 1) * (NZ + 1);
    const pos = new Float32Array(n * 3);
    const loc = new Float32Array(n * 2);
    const idx = [];
    for (let j = 0; j <= NZ; j++) {
      for (let i = 0; i <= NX; i++) {
        const k = j * (NX + 1) + i;
        loc[k * 2] = -HX + (2 * HX * i) / NX;
        loc[k * 2 + 1] = -HZ + (2 * HZ * j) / NZ;
        pos[k * 3] = loc[k * 2];
        pos[k * 3 + 1] = 0.03;
        pos[k * 3 + 2] = loc[k * 2 + 1];
        if (i < NX && j < NZ) idx.push(k, k + NX + 1, k + 1, k + 1, k + NX + 1, k + NX + 2);
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aLocal', new THREE.BufferAttribute(loc, 2));
    geo.setIndex(idx);
    const mat = new THREE.ShaderMaterial({
      vertexShader: poolVert,
      fragmentShader: poolFrag,
      uniforms: { uColor: { value: new THREE.Color(GREEN) }, uOpacity: { value: 0 }, uYaw: { value: 0 }, uS: { value: 0 }, uScale: { value: SCALE }, uHalf: { value: ROAD_W / 2 } },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
      polygonOffset: true,
      polygonOffsetFactor: -2,
      polygonOffsetUnits: -2,
    });
    return { geo, mat };
  }, []);
  useEffect(() => () => [glow.geo, glow.mat].forEach((o) => o.dispose()), [glow]);
  useEffect(() => () => contactTex.dispose(), [contactTex]);

  const S = useMemo(
    () => ({
      f: newFrame(),
      a: new THREE.Vector3(),
      b: new THREE.Vector3(),
      c: new THREE.Vector3(),
      fwd: new THREE.Vector3(),
      up: new THREE.Vector3(),
      x: new THREE.Vector3(),
      m4: new THREE.Matrix4(),
      w: new THREE.Vector3(),
      a2: new THREE.Vector3(),
      r: new THREE.Vector3(),
      lastU: view.t,
      lastS: view.t * LEN + view.xo,
      slip: 0,
      spin: 0,
    }),
    []
  );

  // a point on the way, in world space: s units from the start of the route (past its end: off the lip and down onto the night road)
  const at = (s, out) => {
    carAt(s, S.a2);
    S.a2.y += airAt(Math.min(1, s / LEN));
    return routeToWorld(S.a2, out);
  };

  useFrame((state, dtRaw) => {
    const g = root.current;
    const on = view.ws > 0.01;
    g.visible = on;
    smoke.mat.uniforms.uScale.value = size.height / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
    if (!on) return;
    const dt = Math.min(dtRaw, 0.05);
    const u = view.t;
    const xo = view.xo;
    const sNow = u * LEN + xo;

    // the path it is on: position, the road's lean, and the direction it is actually travelling, arc and flight included
    const pos = at(sNow, S.a);
    const f = S.f;
    at(sNow + 1.4, S.b);
    at(sNow - 1.4, S.c);
    S.fwd.subVectors(S.b, S.c).normalize();
    route.frame(u, f);
    const k = f.k;
    const air = Math.max(airAt(u), flightAt(xo));
    const flying = sstep(0.05, 0.6, air);
    S.up.set(f.up.z, f.up.y, -f.up.x).lerp(UP, flying).normalize(); // the road's normal, in world space
    S.x.crossVectors(S.up, S.fwd).normalize();
    S.up.crossVectors(S.fwd, S.x).normalize();
    S.m4.makeBasis(S.x, S.up, S.fwd);
    g.quaternion.setFromRotationMatrix(S.m4);
    g.scale.setScalar(SCALE * sstep(0.02, 0.4, view.ws)); // grows in with the route, rather than appearing
    g.position.copy(pos);

    // how fast it is going decides how much it slides
    const sp = still ? 0 : clamp(Math.abs(view.v) / 16, 0, 1);
    // no slide in the air or through the straight around the jump: it leaves and lands pointing down the road
    const slipT = -clamp(k * 7.5, -0.55, 0.55) * sstep(0.12, 0.5, sp) * (view.v >= 0 ? 1 : 0.4) * (1 - sstep(0.02, 0.4, air));
    S.slip += (slipT - S.slip) * Math.min(1, dt * 6);
    const squash = Math.max(squashAt(u), landSquash(xo));
    const stretch = stretchAt(u);
    const lean = -k * 1.6 * sp;
    body.current.rotation.set(0.09 * squash - 0.05 * stretch, S.slip, lean, 'YXZ');
    // the light and the shadows are on the road: gone while the car is airborne, back as it touches down
    groundYaw.current.rotation.y = S.slip;
    const grounded = (1 - sstep(0.02, 0.45, air)) * view.ws;
    shadowMat.current.opacity = 0.7 * grounded;
    // the light on the road: each row of the grid is laid on the road at its own distance ahead or behind, so it follows crests, dips and
    // bends instead of lying as one flat sheet (a gentle cross-slope between rows is not followed)
    const pm = poolMesh.current;
    pm.visible = grounded > 0.01;
    if (pm.visible) {
      const { NX, NZ, HX, HZ } = POOL;
      const P = glow.geo.attributes.position;
      const sc = g.scale.x || SCALE;
      for (let j = 0; j <= NZ; j++) {
        const z = -HZ + (2 * HZ * j) / NZ;
        at(sNow + z * sc, S.r).sub(pos);
        const lx = clamp(S.r.dot(S.x) / sc, -1.5, 1.5);
        const ly = clamp(S.r.dot(S.up) / sc, -0.8, 0.8);
        for (let i = 0; i <= NX; i++) P.setXYZ(j * (NX + 1) + i, -HX + (2 * HX * i) / NX + lx, ly + 0.03, z);
      }
      P.needsUpdate = true;
      const u = glow.mat.uniforms;
      u.uOpacity.value = 0.45 * grounded;
      u.uYaw.value = S.slip;
      u.uS.value = sNow;
    }

    // suspension: the body drops onto its wheels after landing and lifts a little before the lip
    const c = 0.3 * squash - 0.07 * stretch;
    car.m.position.y = -c;
    const dS = sNow - S.lastS;
    S.spin += dS / (TYRE_R * SCALE);
    const driftK = sstep(0.1, 0.4, Math.abs(S.slip));
    const steer = clamp(-S.slip * 0.65 - k * 1.2 * (1 - driftK), -0.55, 0.55);
    for (const w of car.wheels) {
      w.pivot.position.y = TYRE_R + c;
      w.pivot.rotation.y = w.front ? steer : 0;
      w.pivot.rotation.x = w.front ? S.spin : S.spin * (1 + 0.35 * driftK);
    }

    // smoke: a thin plume off the rear tyres while it slides, and one short burst when it lands
    g.updateMatrixWorld(true);
    const { pool } = smoke;
    const spawn = (x, y, z, big) => {
      const p = pool[smoke.cursor];
      smoke.cursor = (smoke.cursor + 1) % MAX;
      p.x = x + (Math.random() - 0.5) * 0.15;
      p.y = y;
      p.z = z + (Math.random() - 0.5) * 0.15;
      p.vx = (Math.random() - 0.5) * 0.5;
      p.vy = 0.18 + Math.random() * 0.3;
      p.vz = (Math.random() - 0.5) * 0.5;
      p.life = 0;
      p.max = big ? 1.1 + Math.random() * 0.7 : 0.9 + Math.random() * 0.6;
      p.s0 = big ? 0.28 : 0.2;
      p.a = big ? 0.2 : 0.14;
    };
    const wheelAt = (wi, out) => car.m.localToWorld(out.set(car.wheels[wi].centre.x, 0.1, car.wheels[wi].centre.z));
    if (!still) {
      smoke.owed += dt * 34 * driftK * sstep(0.1, 0.4, sp) * (air > 0.05 ? 0 : 1);
      for (; smoke.owed >= 1; smoke.owed -= 1) {
        spawn(...wheelAt(2, S.w).toArray(), false);
        spawn(...wheelAt(3, S.w).toArray(), false);
      }
      const crossed = (S.lastU < ARC.b && u >= ARC.b) || (S.lastU > ARC.b && u <= ARC.b) || (S.lastS < LEN + FLY && sNow >= LEN + FLY) || (S.lastS > LEN + FLY && sNow <= LEN + FLY);
      if (crossed && Math.abs(view.v) > 1.5) {
        for (let i = 0; i < 4; i++) for (let n = 0; n < 6; n++) spawn(...wheelAt(i, S.w).toArray(), true);
      }
    }
    S.lastU = u;
    S.lastS = sNow;
    const pos3 = smoke.geo.attributes.position.array;
    const sz = smoke.geo.attributes.aSize.array;
    const al = smoke.geo.attributes.aAlpha.array;
    for (let i = 0; i < MAX; i++) {
      const p = pool[i];
      p.life += still ? 0 : dt;
      const t = Math.min(1, p.life / p.max);
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      pos3[i * 3] = p.x;
      pos3[i * 3 + 1] = p.y;
      pos3[i * 3 + 2] = p.z;
      sz[i] = p.s0 + 0.9 * Math.sqrt(t);
      al[i] = t >= 1 ? 0 : p.a * (1 - t) * Math.min(1, p.life * 8) * view.ws;
    }
    smoke.geo.attributes.position.needsUpdate = true;
    smoke.geo.attributes.aSize.needsUpdate = true;
    smoke.geo.attributes.aAlpha.needsUpdate = true;
  });

  const { w, zMax, zMin, skirt, flick, edge } = blades;
  // lit, not flat: the trim takes the scene's light (and the underglow's), so it reads as painted plastic rather than a glowing outline
  const bladeMat = { color: BLADE, emissive: BLADE, emissiveIntensity: 0.1, roughness: 0.55, metalness: 0.2, side: THREE.DoubleSide, fog: false };
  return (
    <>
      <group ref={root} visible={false} scale={SCALE}>
        <group ref={body}>
          <primitive object={car.m} />
          {/* neon-green blades: a skirt and a fender flick down each side, a splitter and a tail strip */}
          {[1, -1].map((s) => (
            <group key={s}>
              <mesh geometry={skirt} position={[s > 0 ? w : -w - 0.022, 0.2, -0.9]} scale={[s, 1, 1]}>
                <meshStandardMaterial {...bladeMat} />
              </mesh>
              <mesh geometry={flick} position={[s > 0 ? w * 0.97 : -w * 0.97 - 0.022, 0.5, 0.95]} scale={[s, 1, 1]}>
                <meshStandardMaterial {...bladeMat} />
              </mesh>
            </group>
          ))}
          <mesh geometry={edge} position={[0, 0.07, zMax - 0.04]}>
            <meshStandardMaterial {...bladeMat} />
          </mesh>
          <mesh geometry={edge} position={[0, 0.5, zMin + 0.02]} scale={[0.9, 1, 1]}>
            <meshStandardMaterial {...bladeMat} />
          </mesh>
          {/* a restrained green on the lower body: two low lights just outside the sills, where the strips under the chassis would spill */}
          {[1, -1].map((x) => (
            <pointLight key={x} position={[x * (w + 0.25), 0.07, 0]} color={GREEN} intensity={2.2} distance={1.7} decay={2} />
          ))}
          <hemisphereLight args={['#8fdcd8', '#b0287f', 0.45]} />
          <directionalLight position={[-3, 6, -4]} intensity={0.8} color="#dff1ff" />
          <pointLight position={[-3.2, 1.4, -1.2]} color="#1aa7ad" intensity={14} distance={9} decay={1.6} />
          <pointLight position={[3.2, 1.4, -1.2]} color="#b0287f" intensity={14} distance={9} decay={1.6} />
        </group>
        <mesh ref={poolMesh} geometry={glow.geo} material={glow.mat} frustumCulled={false} renderOrder={6} />
        <group ref={groundYaw}>
          {/* the light on the road is drawn first (above); the body's shadow and a dark contact patch under each tyre then dim it where the chassis blocks it */}
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.022, 0]} renderOrder={7}>
            <planeGeometry args={[2.5, 4.6]} />
            <meshBasicMaterial ref={shadowMat} map={contactTex} transparent depthWrite={false} fog={false} />
          </mesh>
          {car.wheels.map((w, i) => (
            <mesh key={i} rotation-x={-Math.PI / 2} position={[w.centre.x, 0.026, w.centre.z]} renderOrder={7}>
              <planeGeometry args={[0.75, 1.15]} />
              <meshBasicMaterial map={contactTex} transparent opacity={0.6} depthWrite={false} fog={false} />
            </mesh>
          ))}
        </group>
      </group>
      <points geometry={smoke.geo} material={smoke.mat} frustumCulled={false} renderOrder={8} />
    </>
  );
}

useGLTF.preload(URL);
