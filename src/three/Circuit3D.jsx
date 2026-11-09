import { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { samples, pointAt, journey } from './circuit';
import { radialTexture } from './textures';

// The career circuit in 3D: the same track as Circuit2D, seen from a tilted overhead camera.
// Decorative: the milestone list is the accessible version, so the badges here are mouse-only.
const S = 0.155; // track units to world units
const w = (p) => [(p.x - 50) * S, (p.y - 30) * S];

function ribbon(width) {
  const n = samples.length;
  const pos = new Float32Array((n + 1) * 6);
  const hw = width / (2 * S);
  for (let i = 0; i <= n; i++) {
    const a = samples[(i - 1 + n) % n];
    const b = samples[(i + 1) % n];
    const c = samples[i % n];
    const l = Math.hypot(b.x - a.x, b.y - a.y) || 1;
    const nx = (-(b.y - a.y) / l) * hw;
    const ny = ((b.x - a.x) / l) * hw;
    pos.set([(c.x - nx - 50) * S, 0, (c.y - ny - 30) * S, (c.x + nx - 50) * S, 0, (c.y + ny - 30) * S], i * 6);
  }
  const idx = [];
  for (let i = 0; i < n; i++) idx.push(2 * i, 2 * i + 1, 2 * i + 2, 2 * i + 1, 2 * i + 3, 2 * i + 2);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  return g;
}

const Strip = ({ geo, color, y, ...rest }) => (
  <mesh geometry={geo} position-y={y}>
    <meshBasicMaterial color={color} side={THREE.DoubleSide} {...rest} />
  </mesh>
);

function Track({ points, sel, onSelect }) {
  const glow = useMemo(() => radialTexture(), []);
  const geo = useMemo(
    () => ({ edge: ribbon(0.9), road: ribbon(0.78), centre: ribbon(0.04), lit: ribbon(0.1), litGlow: ribbon(0.42) }),
    []
  );
  const car = useRef();
  const pad = useRef();

  useFrame(({ camera }) => {
    const p = pointAt(journey.t);
    const [x, z] = w(p);
    const count = Math.floor(p.i) * 6;
    geo.lit.setDrawRange(0, count);
    geo.litGlow.setDrawRange(0, count);
    car.current.position.set(x, 0.07, z);
    car.current.rotation.y = (-p.a * Math.PI) / 180;
    pad.current.position.set(x, 0.04, z);
    camera.position.x += (x * 0.1 - camera.position.x) * 0.04;
    camera.lookAt(x * 0.18, 0, z * 0.18 + 0.3);
  });

  const start = w(pointAt(0));
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.02}>
        <planeGeometry args={[40, 24]} />
        <meshBasicMaterial color="#0a0d12" />
      </mesh>
      <Strip geo={geo.edge} color="#3a414c" y={-0.006} />
      <Strip geo={geo.road} color="#1d232c" y={0} />
      <Strip geo={geo.centre} color="#3b434f" y={0.01} />
      <Strip geo={geo.litGlow} color="#e10600" y={0.015} transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      <Strip geo={geo.lit} color="#ff3b30" y={0.02} />

      <mesh position={[start[0], 0.025, start[1]]} rotation-y={(-pointAt(0).a * Math.PI) / 180}>
        <boxGeometry args={[0.1, 0.02, 0.9]} />
        <meshBasicMaterial color="#edeff2" />
      </mesh>

      {points.map((p, i) => {
        const [x, z] = w(p);
        const on = i === sel;
        const reached = i <= sel;
        return (
          <group key={i} position={[x, 0, z]}>
            <mesh rotation-x={-Math.PI / 2} position-y={0.03}>
              <circleGeometry args={[on ? 0.36 : 0.3, 32]} />
              <meshBasicMaterial color={on ? '#ff3b30' : reached ? '#e10600' : '#5a616d'} />
            </mesh>
            <mesh rotation-x={-Math.PI / 2} position-y={0.035}>
              <circleGeometry args={[on ? 0.22 : 0.2, 32]} />
              <meshBasicMaterial color={on ? '#ff3b30' : '#0e1117'} />
            </mesh>
            <Html position={[0, 0.2, 0]} center zIndexRange={[10, 0]}>
              <button type="button" tabIndex={-1} aria-hidden="true" className={`cp-badge ${on ? 'is-on' : ''}`} onClick={() => onSelect(i)}>
                {i + 1}
              </button>
            </Html>
          </group>
        );
      })}

      <mesh ref={pad} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshBasicMaterial map={glow} color="#ff3b30" transparent opacity={0.55} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <group ref={car}>
        <mesh>
          <boxGeometry args={[0.42, 0.09, 0.2]} />
          <meshBasicMaterial color="#edeff2" />
        </mesh>
        <mesh position={[-0.2, 0.01, 0]}>
          <boxGeometry args={[0.05, 0.1, 0.2]} />
          <meshBasicMaterial color="#ff3b30" />
        </mesh>
      </group>
    </>
  );
}

export default function Circuit3D({ points, sel, onSelect, visible }) {
  return (
    <Canvas
      flat
      dpr={[1, 1.75]}
      frameloop={visible ? 'always' : 'never'}
      camera={{ fov: 38, position: [0, 10.5, 7.5], near: 0.1, far: 60 }}
      onCreated={({ camera }) => camera.lookAt(0, 0, 0.3)}
    >
      <color attach="background" args={['#07090d']} />
      <Track points={points} sel={sel} onSelect={onSelect} />
    </Canvas>
  );
}
