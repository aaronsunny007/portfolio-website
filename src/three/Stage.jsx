import { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer, MeshReflectorMaterial } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import Car from './Car';
import { TyreSmoke, SkidMarks } from './DriftFx';
import { T, clock, carState } from './timeline';

const BEATS = ['driftStart', 'reveal', 'ui', 'end'];

function quality() {
  const forced = new URLSearchParams(window.location.search).get('tier');
  if (forced) return forced;
  const small = window.matchMedia('(max-width: 720px)').matches;
  const weak = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  return small || weak ? 'medium' : 'high';
}

/** Advances the shared clock and tells the DOM when a beat is crossed. Runs before everything else. */
function ClockDriver({ onBeat }) {
  const last = useRef(-1);
  useFrame((_, dt) => {
    clock.running = true;
    if (!clock.hold) clock.t += FIXED ? 1 / 30 : Math.min(dt, 1 / 20);
    let idx = -1;
    BEATS.forEach((b, i) => {
      if (clock.t >= T[b]) idx = i;
    });
    if (idx !== last.current) {
      last.current = idx;
      onBeat(idx >= 0 ? BEATS[idx] : null);
    }
  }, -1);
  return null;
}

const QS = new URLSearchParams(window.location.search);
const FIXED = QS.has('fixed'); // dev: advance exactly 1/30 s per frame for frame-accurate captures

function CameraRig() {
  const { camera, size, pointer } = useThree();
  const look = useMemo(() => new THREE.Vector3(), []);
  const par = useRef({ x: 0, y: 0 });
  const follow = useRef(0);
  useFrame((_, dt) => {
    const portrait = size.width / size.height < 1;
    const base = portrait ? [0.5, 2.2, 12.5] : [0.3, 1.5, 8.9];
    const target = portrait ? [0.3, 1.25, 0] : [0.15, 0.95, 0];
    camera.fov = portrait ? 44 : 31;
    camera.updateProjectionMatrix();
    // ±1.5° of pointer parallax, damped
    par.current.x = THREE.MathUtils.damp(par.current.x, pointer.x, 3, dt);
    par.current.y = THREE.MathUtils.damp(par.current.y, pointer.y, 3, dt);
    camera.position.set(base[0] + par.current.x * 0.35, base[1] + par.current.y * 0.15, base[2]);
    // pan a little with the car, like an operator tracking it across the frame
    follow.current = THREE.MathUtils.damp(follow.current, THREE.MathUtils.clamp(carState.x, -8, 8) * (portrait ? 0.07 : 0.14), 4, dt);
    look.set(target[0] + follow.current, target[1], target[2]);
    camera.lookAt(look);
  });
  return null;
}

function Floor({ tier }) {
  return (
    <mesh rotation-x={-Math.PI / 2} receiveShadow>
      <planeGeometry args={[90, 90]} />
      {tier === 'high' ? (
        <MeshReflectorMaterial
          blur={[400, 120]}
          resolution={768}
          mixBlur={1}
          mixStrength={22}
          roughness={0.85}
          depthScale={1.1}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0c0e12"
          metalness={0.55}
          mirror={0.6}
        />
      ) : (
        <meshStandardMaterial color="#0c0e12" roughness={0.6} metalness={0.2} />
      )}
    </mesh>
  );
}

function Lights() {
  const keyTarget = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0.4, 0.8, 1.6);
    return o;
  }, []);
  return (
    <>
      <ambientLight intensity={0.12} />
      <primitive object={keyTarget} />
      {/* key: high and front-right, a hard sodium-white pool */}
      <spotLight
        position={[5, 8, 7]}
        target={keyTarget}
        intensity={190}
        angle={0.42}
        penumbra={0.75}
        decay={1.7}
        color="#fff3e2"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0004}
      />
      {/* red rim from behind, kept off the bonnet and the floor */}
      <pointLight position={[0, 1.6, -4.5]} intensity={10} distance={6} color="#ff2410" />
      {/* cool fill from the left */}
      <pointLight position={[-6, 3, 5]} intensity={14} distance={16} color="#7fb8ff" />
    </>
  );
}

export default function Stage({ active, onBeat }) {
  const tier = useMemo(() => quality(), []);
  return (
    <Canvas
      className="stage"
      aria-hidden="true"
      shadows
      dpr={tier === 'high' ? [1, 2] : [1, 1.5]}
      frameloop={active ? 'always' : 'never'}
      gl={{ antialias: false, powerPreference: 'high-performance' }}
      camera={{ fov: 31, position: [0.3, 1.6, 10.2], near: 0.1, far: 80 }}
    >
      <color attach="background" args={['#07090d']} />
      <fog attach="fog" args={['#07090d', 15, 38]} />
      <CameraRig />
      <Lights />
      <Environment resolution={256} frames={1}>
        <Lightformer form="rect" intensity={3} position={[0, 6, 0]} rotation-x={Math.PI / 2} scale={[14, 1.4, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-9, 2.5, 2]} rotation-y={Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[9, 2.5, 2]} rotation-y={-Math.PI / 2} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#e10600" position={[0, 1.5, -9]} scale={[16, 1.2, 1]} />
      </Environment>
      <Suspense fallback={null}>
        <ClockDriver onBeat={onBeat} />
        <Car />
        <SkidMarks />
        <TyreSmoke />
      </Suspense>
      <Floor tier={tier} />
      {tier !== 'low' && (
        <EffectComposer multisampling={tier === 'high' ? 4 : 0}>
          <Bloom mipmapBlur luminanceThreshold={1.15} intensity={0.9} radius={0.7} />
          <Vignette offset={0.25} darkness={0.75} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
