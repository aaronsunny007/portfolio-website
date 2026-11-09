import { useLayoutEffect, useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { quality } from './webgl';
import { radialTexture, streakTexture, roadTexture, finishTexture } from './textures';
import { view, carAt, routeToWorld, airAt, flightAt, LIP_X, FLY, ROLL, LEN as ROUTE_LEN } from './journey';
import Route from './Route';
import Roadside from './Roadside';
import Dashboard from '../components/Dashboard';

gsap.registerPlugin(ScrollTrigger);

// One wet night road behind the whole page. The camera travels down it as the visitor scrolls.
const LEN = 760; // road length: the page's own travel, then the career route's length, then the page's travel after it
const TRAVEL = 240; // how far the camera moves over the page
const STILL_P = 0.32; // the single frame shown for reduced motion
const HALF = 6; // half road width
const LAMP_Z = Array.from({ length: 48 }, (_, i) => -8 - i * 16);
const FOG = '#07090d';

const TEAL = new THREE.Color('#1aa7ad');
const SKY = new THREE.Color('#3a8fd0');
const MAGENTA = new THREE.Color('#b0287f');
const RED = new THREE.Color('#e10600');
const run = { p: 0 }; // page progress 0..1, written by ScrollTrigger
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const ease = (x) => x * x * (3 - 2 * x);

const dummy = new THREE.Object3D();
function place(mesh, items) {
  items.forEach(([x, y, z, rx = -Math.PI / 2], i) => {
    dummy.position.set(x, y, z);
    dummy.rotation.set(rx, 0, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
}

const DASH_DEPTH = 1.4;
const RIM = '#2b3642'; // the thin edge light that makes the frame read against the night
const HALF_FOV = Math.tan(THREE.MathUtils.degToRad(25));

// The view from inside the car: a roof header, two A-pillars, a mirror, a low dashboard with the instrument cluster, and wipers.
// Kept dark and out of the way. It rides with the camera, so it frames the road and the career route alike.
function Windshield() {
  const g = useRef();
  const roof = useRef();
  const pillars = useRef([]);
  const mirror = useRef();
  const wipers = useRef([]);
  const mats = useRef([]);
  useLayoutEffect(() => {
    mats.current = [];
    g.current.traverse((o) => {
      if (!o.material) return;
      o.material.userData.base = o.material.opacity;
      o.material.transparent = true;
      mats.current.push(o.material);
    });
  }, []);
  useFrame(({ camera, size }) => {
    const k = view.cock;
    g.current.visible = k > 0.01;
    if (!g.current.visible) return;
    mats.current.forEach((m) => (m.opacity = m.userData.base * k));
    g.current.position.copy(camera.position);
    g.current.quaternion.copy(camera.quaternion);
    const aspect = size.width / size.height;
    const hw = HALF_FOV * DASH_DEPTH * aspect; // half the visible width at the dash
    roof.current.scale.x = hw * 2.4;
    mirror.current.scale.x = Math.min(1, hw * 1.2);
    pillars.current.forEach((p, i) => {
      p.visible = aspect > 1.15; // on a tall screen there is no room for them
      p.position.x = (i ? 1 : -1) * hw * 0.98;
      p.rotation.z = (i ? 1 : -1) * 0.42;
    });
    // wipers rest along the base of the glass and make one pass when a new section arrives
    const sweepA = Math.sin(Math.PI * view.wipe) * 1.5;
    wipers.current.forEach((w, i) => {
      w.position.x = hw * (i ? 0.1 : -0.42);
      w.rotation.z = -Math.PI / 2 + 0.05 + sweepA * (i ? 0.92 : 1);
    });
  }, -0.5);
  const dark = { color: '#080a0e', fog: false };
  return (
    <group ref={g} visible={false}>
      <mesh ref={roof} position={[0, 0.65, -DASH_DEPTH]}>
        <boxGeometry args={[1, 0.1, 0.1]} />
        <meshBasicMaterial {...dark} />
        <mesh position={[0, -0.05, 0.051]}>
          <boxGeometry args={[1, 0.006, 0.01]} />
          <meshBasicMaterial color={RIM} fog={false} />
        </mesh>
      </mesh>
      {[0, 1].map((i) => (
        <mesh key={i} ref={(el) => (pillars.current[i] = el)} position={[0, 0.05, -DASH_DEPTH]}>
          <boxGeometry args={[0.1, 2.4, 0.1]} />
          <meshBasicMaterial {...dark} />
          <mesh position={[i ? -0.05 : 0.05, 0, 0.051]}>
            <boxGeometry args={[0.006, 2.4, 0.01]} />
            <meshBasicMaterial color={RIM} fog={false} />
          </mesh>
        </mesh>
      ))}
      <mesh ref={mirror} position={[0.05, 0.56, -DASH_DEPTH + 0.05]}>
        <boxGeometry args={[0.5, 0.1, 0.05]} />
        <meshBasicMaterial {...dark} />
      </mesh>
      {[0, 1].map((i) => (
        <group key={i} ref={(el) => (wipers.current[i] = el)} position={[0, -0.455, -DASH_DEPTH + 0.3]}>
          <mesh position={[0, 0.3, 0]}>
            <boxGeometry args={[0.014, 0.6, 0.01]} />
            <meshBasicMaterial color="#1b222b" fog={false} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Scene({ still, low }) {
  const road = useMemo(() => roadTexture(low), [low]);
  const glow = useMemo(() => radialTexture(), []);
  const streak = useMemo(() => streakTexture(), []);
  const finish = useMemo(() => finishTexture(), []);
  useEffect(() => () => [road, glow, streak, finish].forEach((t) => t.dispose()), [road, glow, streak, finish]); // textures are ours; R3F does not free them

  const lampPts = useMemo(() => {
    const side = (s) => new Float32Array(LAMP_Z.flatMap((z) => [s * 4.6, 6.2, z]));
    return { l: side(-1), r: side(1) };
  }, []);
  const poles = useRef();
  const arms = useRef();
  const dashes = useRef();
  const streaksL = useRef();
  const streaksR = useRef();
  const lampL = useRef();
  const lampR = useRef();
  const streakL = useRef();
  const streakR = useRef();
  const railL = useRef();
  const railR = useRef();
  const horizon = useRef();
  const finishLine = useRef();
  const hazes = useRef([]);
  const haze = useMemo(() => Array.from({ length: low ? 12 : 20 }, (_, i) => ({ z: -22 - i * 38, k: i * 1.7 })), [low]);
  const tmp = useMemo(() => ({ l: new THREE.Color(), r: new THREE.Color(), h: new THREE.Color() }), []);
  const cams = useMemo(() => ({ a: new THREE.Vector3(), al: new THREE.Vector3(), b: new THREE.Vector3(), bl: new THREE.Vector3(), look: new THREE.Vector3(), cp: new THREE.Vector3(), car: new THREE.Vector3(), la: new THREE.Vector3(), s0: view.t * ROUTE_LEN, z0: null }), []);

  useLayoutEffect(() => {
    const both = (y, fn) => LAMP_Z.flatMap((z) => [-1, 1].map((s) => fn(s, z, y)));
    place(poles.current, both(3.1, (s, z, y) => [s * 7.2, y, z, 0]));
    place(arms.current, both(6.2, (s, z, y) => [s * 5.9, y, z, -Math.PI / 2]));
    place(streaksL.current, LAMP_Z.map((z) => [-4.4, 0.02, z + 7]));
    place(streaksR.current, LAMP_Z.map((z) => [4.4, 0.02, z + 7]));
    place(dashes.current, Array.from({ length: 84 }, (_, i) => [0, 0.015, -5 - i * 9]));
  }, []);

  // Runs before the route's frame callback, so panels are projected with this frame's camera.
  useFrame(({ camera, clock, size }, dt) => {
    const p = still ? STILL_P : run.p;
    const t = still ? 0 : clock.elapsedTime;
    const zPage = -p * TRAVEL; // where the page's own travel puts the windshield
    const sway = Math.sin(p * Math.PI * 2) * 1.1;

    // Two poses, blended by w: the windshield on the road, and a seat behind the car on the route. Both face down the road.
    // The second follows the car, so the camera, the car and the deck of cards all move with the one value, view.t.
    const aspect = size.width / size.height;
    view.tall = aspect < 1.15;
    // The camera rises into the route as the career section arrives, holds while the corners are driven, and comes down into the windshield
    // only once the car has left the lip and landed on the night road (view.ex), not when the section starts to scroll away.
    if (!still) view.w = Math.min(view.up, 1 - ease(clamp01((view.ex - 0.72) / 0.28)));
    view.ws = still ? view.w : view.ws + (view.w - view.ws) * Math.min(1, dt * 5);
    const e = view.ws * view.ws * (3 - 2 * view.ws);
    // where the car is, and a little way ahead of it, from its distance along the route (and beyond the lip)
    const s = view.t * ROUTE_LEN + view.xo;
    routeToWorld(carAt(s, cams.cp), cams.car);
    routeToWorld(carAt(s + 0.05 * ROUTE_LEN, cams.cp), cams.la);
    // The windshield's place. Before the career it is the page's travel. Through the way out it is the driver's seat of the car,
    // and after it the page's travel carries on from where the car landed: the camera only ever goes forward.
    const inExit = view.ex > 0.001 && view.ex < 0.9999;
    const baseY = 1.55 + 0.35 * Math.sin(p * Math.PI);
    let zA = zPage;
    if (view.ex >= 0.9999) zA = view.zr - (LIP_X + FLY + ROLL) - 0.4 - Math.max(0, p - view.pe) * TRAVEL;
    else if (inExit) zA = cams.car.z - 0.4;
    cams.a.set(sway, inExit ? cams.car.y + baseY : baseY, zA);
    cams.al.set(sway * 0.4 + Math.sin(p * Math.PI * 3) * 2.4, 1.0, zA - 34);
    const D = view.tall ? 12 : 8.8; // how far behind the car
    const cx = cams.car.x * 0.9;
    // The camera follows the road, not the jump: it rises only a little with the car in the air, so the arc reads.
    // It looks along the road ahead, so a climb tilts the view up and a bend swings it round.
    const air = Math.max(airAt(view.t), flightAt(view.xo));
    cams.b.set(cx, cams.car.y + (view.tall ? 8.5 : 4.6) + air * 0.3, cams.car.z + D);
    if (view.tall) cams.bl.set(cx, cams.car.y, cams.car.z + 2);
    else cams.bl.set(cams.car.x * 0.45 + cams.la.x * 0.55, cams.car.y * 0.6 + cams.la.y * 0.4 + 0.3 + air * 0.4, cams.car.z - 2.5);
    camera.position.lerpVectors(cams.a, cams.b, e);
    cams.look.lerpVectors(cams.al, cams.bl, e);
    camera.lookAt(cams.look);
    camera.updateMatrixWorld();
    if (import.meta.env.DEV) window.__cam = camera; // dev hook, like __clock

    // How fast things are moving, measured from the movement itself: the page's travel down the road, or the car's along the route.
    // The car's signed speed drives its slide and smoke; the 0..1 speed drives the instrument cluster. Both settle to zero when scrolling stops.
    if (dt > 1e-4 && !still) {
      const carV = (s - cams.s0) / dt;
      const camV = cams.z0 === null ? 0 : Math.abs(zA - cams.z0) / dt;
      view.v += (carV - view.v) * Math.min(1, dt * 10);
      const raw = THREE.MathUtils.lerp(Math.min(1, camV / 60), Math.min(1, Math.abs(view.v) / 40), e);
      view.speed += (raw - view.speed) * Math.min(1, dt * 8);
    } else if (still) {
      view.v = view.speed = 0;
    }
    cams.s0 = s;
    cams.z0 = zA;
    view.dash?.(dt);

    // grade: teal and blue at the start, magenta through the middle, a little red toward the finish
    tmp.l.copy(TEAL).lerp(SKY, Math.sin(p * Math.PI) * 0.6);
    tmp.r.copy(MAGENTA).lerp(RED, Math.max(0, (p - 0.6) / 0.4) * 0.55);
    tmp.h.copy(TEAL).lerp(MAGENTA, Math.min(1, p * 2)).lerp(RED, Math.max(0, (p - 0.5) / 0.5) * 0.3);
    lampL.current.color.copy(tmp.l);
    streakL.current.color.copy(tmp.l);
    railL.current.color.copy(tmp.l);
    lampR.current.color.copy(tmp.r);
    streakR.current.color.copy(tmp.r);
    railR.current.color.copy(tmp.r);
    horizon.current.material.color.copy(tmp.h);
    horizon.current.position.z = zA - 230;
    finishLine.current.position.z = view.zr - (LIP_X + FLY + ROLL) - 0.4 - (1 - view.pe) * TRAVEL - 24; // just past where the page's travel ends

    hazes.current.forEach((m, i) => {
      const h = haze[i];
      m.position.x = Math.sin(t * 0.05 + h.k) * 10;
      m.material.opacity = 0.1 * THREE.MathUtils.clamp((zA - h.z) / 20, 0, 1); // never close enough to veil the screen
    });
  }, -1);

  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    view.invalidate = invalidate;
    return () => (view.invalidate = null);
  }, [invalidate]);

  return (
    <>
      <color attach="background" args={[FOG]} />
      <fog attach="fog" args={[FOG, 20, 150]} />

      <mesh rotation-x={-Math.PI / 2} position={[0, -0.02, -LEN / 2]}>
        <planeGeometry args={[400, LEN + 60]} />
        <meshBasicMaterial color="#06080b" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, -LEN / 2 + 10]}>
        <planeGeometry args={[HALF * 2, LEN + 20]} />
        <meshBasicMaterial map={road} />
      </mesh>

      {/* edge lines and centre dashes */}
      {[-1, 1].map((s) => (
        <mesh key={s} rotation-x={-Math.PI / 2} position={[s * (HALF - 0.5), 0.01, -LEN / 2 + 10]}>
          <planeGeometry args={[0.12, LEN + 20]} />
          <meshBasicMaterial color="#edeff2" transparent opacity={0.26} />
        </mesh>
      ))}
      <instancedMesh ref={dashes} args={[null, null, 84]}>
        <planeGeometry args={[0.16, 3]} />
        <meshBasicMaterial color="#edeff2" transparent opacity={0.28} />
      </instancedMesh>

      {/* the finish line, painted across the road just past where the camera stops. It comes up out of the fog as the last section arrives. */}
      <mesh ref={finishLine} rotation-x={-Math.PI / 2} position={[0, 0.012, -TRAVEL - 20]}>
        <planeGeometry args={[HALF * 2 - 1, 6]} />
        <meshBasicMaterial map={finish} transparent opacity={0.55} depthWrite={false} />
      </mesh>

      {/* barriers */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * (HALF + 0.6), 0.4, -LEN / 2 + 10]}>
            <boxGeometry args={[0.5, 0.8, LEN + 20]} />
            <meshBasicMaterial color="#10141a" />
          </mesh>
          <mesh position={[s * (HALF + 0.33), 0.62, -LEN / 2 + 10]}>
            <boxGeometry args={[0.05, 0.1, LEN + 20]} />
            <meshBasicMaterial ref={s < 0 ? railL : railR} transparent opacity={0.45} />
          </mesh>
        </group>
      ))}

      {/* lamps: poles, arms, glow, and the reflection each one throws on the wet road */}
      <instancedMesh ref={poles} args={[null, null, LAMP_Z.length * 2]}>
        <boxGeometry args={[0.14, 6.2, 0.14]} />
        <meshBasicMaterial color="#1a1f27" />
      </instancedMesh>
      <instancedMesh ref={arms} args={[null, null, LAMP_Z.length * 2]}>
        <boxGeometry args={[0.1, 2.8, 0.1]} />
        <meshBasicMaterial color="#1a1f27" />
      </instancedMesh>
      {[
        ['l', lampL],
        ['r', lampR],
      ].map(([k, ref]) => (
        <points key={k}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[lampPts[k], 3]} />
          </bufferGeometry>
          <pointsMaterial ref={ref} map={glow} size={4.2} transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
        </points>
      ))}
      {[
        [streaksL, streakL],
        [streaksR, streakR],
      ].map(([mesh, mat], k) => (
        <instancedMesh key={k} ref={mesh} args={[null, null, LAMP_Z.length]}>
          <planeGeometry args={[0.9, 14]} />
          <meshBasicMaterial ref={mat} map={streak} transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </instancedMesh>
      ))}

      {/* shopfronts, tall blocks with lit windows, reflectors and cars ahead: the lights that belong to the roadside */}
      <Roadside glow={glow} low={low} still={still} len={LEN} half={HALF} />
      {/* horizon glow */}
      <mesh ref={horizon} position={[0, 12, -230]}>
        <planeGeometry args={[600, 90]} />
        <meshBasicMaterial map={glow} transparent opacity={0.22} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
      </mesh>

      {/* low haze */}
      {haze.map((h, i) => (
        <mesh key={i} ref={(el) => (hazes.current[i] = el)} position={[0, 1.6, h.z]}>
          <planeGeometry args={[80, 9]} />
          <meshBasicMaterial map={glow} color="#8aa0b0" transparent opacity={0.1} depthWrite={false} />
        </mesh>
      ))}

      <Windshield />
      <Route low={low} still={still} />
    </>
  );
}

export default function NightCircuit({ still, show }) {
  const wrap = useRef();
  const low = useMemo(() => quality() !== 'high', []);

  useEffect(() => {
    const pit = document.getElementById('pit-crew'); // elements, not selectors: the context scope is .night
    const fin = document.getElementById('finish');
    const career = document.getElementById('career');
    view.wrap = wrap.current;
    const ctx = gsap.context(() => {
      let runST = null;
      if (!still) {
        // camera progress over the sections below the hero
        runST = gsap.to(run, { p: 1, ease: 'none', scrollTrigger: { trigger: pit, endTrigger: fin, start: 'top bottom', end: 'bottom bottom', scrub: 1.2 } }).scrollTrigger;
      }
      // the cockpit (pillars, mirror, wipers, dashboard) comes in as the hero leaves; the road itself is there from the moment the opening resolves
      const cock = (s) => {
        view.cock = s.progress;
        view.invalidate?.();
      };
      cock(ScrollTrigger.create({ trigger: pit, start: 'top 95%', end: 'top 35%', onUpdate: cock, onRefresh: cock }));
      if (!career) return;
      // Where the route floats: ahead of the road at the point the career section reaches, and where the page's travel resumes after it.
      let careerST;
      const place = () => {
        if (!careerST) return; // onRefresh also fires inside create(), before careerST exists
        const span = runST ? runST.end - runST.start : 1;
        const at = (y) => (still || !runST ? STILL_P : THREE.MathUtils.clamp((y - runST.start) / span, 0, 1));
        view.zr = -TRAVEL * at(careerST.start + innerHeight * 0.5) - 44;
        view.pe = at(careerST.end - innerHeight); // the end of the pinned career: the car has landed, the page's travel picks up
        view.invalidate?.();
      };
      if (still) {
        // reduced motion: one composition or the other, swapped when the section is on screen. No travel between them.
        careerST = ScrollTrigger.create({
          trigger: career,
          start: 'top 55%',
          end: 'bottom 45%',
          onToggle: (s) => {
            view.w = s.isActive ? 1 : 0;
            view.invalidate?.();
          },
          onRefresh: place,
        });
        view.w = careerST.isActive ? 1 : 0;
      } else {
        // the camera rises into the route over one screen of scroll (the way down is driven by the car's exit, in the frame loop)
        const apply = (s) => {
          view.up = THREE.MathUtils.clamp((s.progress * (s.end - s.start)) / innerHeight, 0, 1);
        };
        careerST = ScrollTrigger.create({ trigger: career, start: 'top bottom', end: 'bottom top', onUpdate: apply, onRefresh: (s) => (apply(s), place()) });
        apply(careerST);
      }
      place();
    }, wrap);
    const late = requestAnimationFrame(() => ScrollTrigger.refresh()); // layout settles after mount
    return () => {
      cancelAnimationFrame(late);
      ctx.revert();
      view.w = 0;
      view.ws = 0;
      view.up = 0;
      view.cock = 0;
      view.wrap = null;
    };
  }, [still]);

  // Mounted while the opening is still playing so the scene is built and its first frame drawn; it draws every frame from the moment
  // the opening resolves (`show`), by which time the hero has opened onto it.
  return (
    <>
      <div ref={wrap} className={`night ${still ? 'is-still' : ''}`} aria-hidden="true">
        <Canvas
          flat
          dpr={low ? 1 : [1, 1.5]}
          frameloop={!still && show ? 'always' : 'demand'}
          gl={{ antialias: false, powerPreference: 'low-power' }}
          camera={{ fov: 50, near: 0.1, far: 420, position: [0, 1.55, 0] }}
        >
          <Scene still={still} low={low} />
        </Canvas>
      </div>
      <Dashboard />
    </>
  );
}
