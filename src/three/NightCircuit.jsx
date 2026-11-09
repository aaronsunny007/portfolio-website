import { useLayoutEffect, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { quality } from './webgl';
import { radialTexture, streakTexture, roadTexture, finishTexture } from './textures';

gsap.registerPlugin(ScrollTrigger);

// One wet night road behind the whole page. The camera travels down it as the visitor scrolls.
const LEN = 320; // road length
const TRAVEL = 240; // how far the camera moves over the page
const STILL_P = 0.32; // the single frame shown for reduced motion
const HALF = 6; // half road width
const LAMP_Z = Array.from({ length: 20 }, (_, i) => -8 - i * 16);
const FOG = '#07090d';

const TEAL = new THREE.Color('#1aa7ad');
const SKY = new THREE.Color('#3a8fd0');
const MAGENTA = new THREE.Color('#b0287f');
const RED = new THREE.Color('#e10600');
const run = { p: 0 }; // page progress 0..1, written by ScrollTrigger

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
  const city = useMemo(() => {
    let s = 11;
    const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    const palette = [new THREE.Color('#ffcf94'), new THREE.Color('#8fd9d6'), new THREE.Color('#d98ac0'), new THREE.Color('#dcebff')];
    const count = low ? 150 : 260;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const side = rnd() < 0.5 ? -1 : 1;
      pos.set([side * (30 + rnd() * 90), 0.4 + rnd() * rnd() * 12, -rnd() * (LEN + 60)], i * 3);
      palette[Math.floor(rnd() * palette.length)].toArray(col, i * 3);
    }
    return { pos, col };
  }, [low]);

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
  const hazes = useRef([]);
  const haze = useMemo(() => Array.from({ length: low ? 5 : 8 }, (_, i) => ({ z: -22 - i * 38, k: i * 1.7 })), [low]);
  const tmp = useMemo(() => ({ l: new THREE.Color(), r: new THREE.Color(), h: new THREE.Color() }), []);

  useLayoutEffect(() => {
    const both = (y, fn) => LAMP_Z.flatMap((z) => [-1, 1].map((s) => fn(s, z, y)));
    place(poles.current, both(3.1, (s, z, y) => [s * 7.2, y, z, 0]));
    place(arms.current, both(6.2, (s, z, y) => [s * 5.9, y, z, -Math.PI / 2]));
    place(streaksL.current, LAMP_Z.map((z) => [-4.4, 0.02, z + 7]));
    place(streaksR.current, LAMP_Z.map((z) => [4.4, 0.02, z + 7]));
    place(dashes.current, Array.from({ length: 36 }, (_, i) => [0, 0.015, -5 - i * 9]));
  }, []);

  useFrame(({ camera, clock }) => {
    const p = still ? STILL_P : run.p;
    const t = still ? 0 : clock.elapsedTime;
    const z = -p * TRAVEL;
    const sway = Math.sin(p * Math.PI * 2) * 1.1;
    camera.position.set(sway, 1.55 + 0.35 * Math.sin(p * Math.PI), z);
    camera.lookAt(sway * 0.4 + Math.sin(p * Math.PI * 3) * 2.4, 1.0, z - 34);

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
    horizon.current.position.z = z - 230;

    hazes.current.forEach((m, i) => {
      const h = haze[i];
      m.position.x = Math.sin(t * 0.05 + h.k) * 10;
      m.material.opacity = 0.1 * THREE.MathUtils.clamp((z - h.z) / 20, 0, 1); // never close enough to veil the screen
    });
  });

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
      <instancedMesh ref={dashes} args={[null, null, 36]}>
        <planeGeometry args={[0.16, 3]} />
        <meshBasicMaterial color="#edeff2" transparent opacity={0.28} />
      </instancedMesh>

      {/* the finish line, painted across the road just past where the camera stops. It comes up out of the fog as the last section arrives. */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.012, -TRAVEL - 20]}>
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

      {/* distant city and horizon glow */}
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[city.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[city.col, 3]} />
        </bufferGeometry>
        <pointsMaterial map={glow} size={2.4} vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} depthWrite={false} fog={false} />
      </points>
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
    </>
  );
}

export default function NightCircuit({ still }) {
  const wrap = useRef();
  const [active, setActive] = useState(true);
  const low = useMemo(() => quality() !== 'high', []);

  useEffect(() => {
    if (still) return;
    const pit = document.getElementById('pit-crew'); // elements, not selectors: the context scope is .night
    const fin = document.getElementById('finish');
    const ctx = gsap.context(() => {
      // camera progress over the sections below the hero
      gsap.to(run, { p: 1, ease: 'none', scrollTrigger: { trigger: pit, endTrigger: fin, start: 'top bottom', end: 'bottom bottom', scrub: 1.2 } });
      // arrives as the hero leaves; the hero covers it before that
      gsap.fromTo(wrap.current, { autoAlpha: 0 }, { autoAlpha: 1, ease: 'none', scrollTrigger: { trigger: pit, start: 'top 95%', end: 'top 35%', scrub: true } });
      // not drawing while the hero fills the screen
      ScrollTrigger.create({ trigger: pit, start: 'top bottom', end: 'max', onToggle: (s) => setActive(s.isActive) });
    }, wrap);
    return () => ctx.revert();
  }, [still]);

  return (
    <div ref={wrap} className={`night ${still ? 'is-still' : ''}`} aria-hidden="true">
      <Canvas
        flat
        dpr={low ? 1 : [1, 1.5]}
        frameloop={still ? 'demand' : active ? 'always' : 'never'}
        gl={{ antialias: false, powerPreference: 'low-power' }}
        camera={{ fov: 50, near: 0.1, far: 420, position: [0, 1.55, 0] }}
      >
        <Scene still={still} low={low} />
      </Canvas>
    </div>
  );
}
