import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { ARC, FLY, route, view, airAt, squashAt, stretchAt, flightAt, landSquash, carAt, newFrame, routeToWorld, LEN } from './journey';
import { liftWheels, TYRE_R } from './wheels';
import { underglowTexture, contactTexture } from './textures';

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
  const poolTex = useMemo(() => underglowTexture(), []);
  const contactTex = useMemo(() => contactTexture(), []);
  const groundYaw = useRef(); // the footprint on the road: it turns with the body's slide, but does not lean with it
  const poolMat = useRef();
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
  useEffect(() => () => [poolTex, contactTex].forEach((t) => t.dispose()), [poolTex, contactTex]);

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
    poolMat.current.opacity = 0.95 * grounded;
    shadowMat.current.opacity = 0.7 * grounded;

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
  const bladeMat = { color: BLADE, side: THREE.DoubleSide, fog: false };
  return (
    <>
      <group ref={root} visible={false} scale={SCALE}>
        <group ref={body}>
          <primitive object={car.m} />
          {/* neon-green blades: a skirt and a fender flick down each side, a splitter and a tail strip */}
          {[1, -1].map((s) => (
            <group key={s}>
              <mesh geometry={skirt} position={[s > 0 ? w : -w - 0.022, 0.2, -0.9]} scale={[s, 1, 1]}>
                <meshBasicMaterial {...bladeMat} />
              </mesh>
              <mesh geometry={flick} position={[s > 0 ? w * 0.97 : -w * 0.97 - 0.022, 0.5, 0.95]} scale={[s, 1, 1]}>
                <meshBasicMaterial {...bladeMat} />
              </mesh>
            </group>
          ))}
          <mesh geometry={edge} position={[0, 0.07, zMax - 0.04]}>
            <meshBasicMaterial {...bladeMat} />
          </mesh>
          <mesh geometry={edge} position={[0, 0.5, zMin + 0.02]} scale={[0.9, 1, 1]}>
            <meshBasicMaterial {...bladeMat} />
          </mesh>
          {/* a restrained green on the lower body, from the emitter underneath */}
          <pointLight position={[0, 0.1, 0]} color={GREEN} intensity={6} distance={2.4} decay={2} />
          <hemisphereLight args={['#8fdcd8', '#b0287f', 0.45]} />
          <directionalLight position={[-3, 6, -4]} intensity={0.8} color="#dff1ff" />
          <pointLight position={[-3.2, 1.4, -1.2]} color="#1aa7ad" intensity={14} distance={9} decay={1.6} />
          <pointLight position={[3.2, 1.4, -1.2]} color="#b0287f" intensity={14} distance={9} decay={1.6} />
        </group>
        <group ref={groundYaw}>
          {/* the body's shadow, then a dark contact patch under each tyre, then the green pool falling on the road around the chassis */}
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
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.03, 0]} renderOrder={7}>
            <planeGeometry args={[4.4, 6.4]} />
            <meshBasicMaterial ref={poolMat} map={poolTex} color={GREEN} transparent blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
          </mesh>
        </group>
      </group>
      <points geometry={smoke.geo} material={smoke.mat} frustumCulled={false} renderOrder={8} />
    </>
  );
}

useGLTF.preload(URL);
