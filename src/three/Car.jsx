import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { T, clock, carState } from './timeline';
import { drivePose } from './drive';

// A host that can't serve .glb can point at the same file under another name (window.__CAR_URL).
const URL = (typeof window !== 'undefined' && window.__CAR_URL) || `${import.meta.env.BASE_URL}models/car.glb`;

export default function Car() {
  const { scene } = useGLTF(URL);
  const outer = useRef();
  const inner = useRef();

  const model = useMemo(() => {
    const m = scene.clone(true);
    m.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = true;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      mats.forEach((mat, i) => {
        if (mat.name === 'Paint_Color') {
          const paint = new THREE.MeshPhysicalMaterial({
            name: 'Paint_Color',
            color: '#0a0b0e',
            metalness: 0.55,
            roughness: 0.32,
            clearcoat: 1,
            clearcoatRoughness: 0.03,
          });
          if (Array.isArray(o.material)) o.material[i] = paint;
          else o.material = paint;
        } else {
          mat.envMapIntensity = 1.2;
        }
      });
    });
    return m;
  }, [scene]);

  useFrame(() => {
    const t = clock.t;
    const p = drivePose(t);
    let yaw = p.yaw;
    let roll = -p.slip * 0.05 * Math.min(1, p.speed / 6);
    let pitch = p.u > 0.72 && p.u < 1 ? 0.025 : 0; // nose dives under braking
    const tau = t - (T.driftStart + T.driftLen);
    if (tau > 0) {
      // settle on the suspension after the stop
      const k = Math.exp(-5 * tau);
      yaw += 0.06 * k * Math.sin(11 * tau);
      roll += 0.02 * k * Math.sin(13 * tau);
      pitch += -0.02 * k * Math.cos(9 * tau);
    }
    outer.current.position.set(p.x, 0, p.z);
    outer.current.rotation.y = yaw;
    inner.current.rotation.set(pitch, 0, roll);
    Object.assign(carState, { x: p.x, z: p.z, yaw, slip: p.slip, speed: p.speed });
  });

  return (
    <group ref={outer} position={[-20, 0, 0]}>
      <group ref={inner}>
        <primitive object={model} />
        {/* headlights: real light on the wet floor */}
        <Headlights />
      </group>
    </group>
  );
}

function Headlights() {
  const target = useMemo(() => {
    const o = new THREE.Object3D();
    o.position.set(0, 0, 10);
    return o;
  }, []);
  return (
    <>
      <primitive object={target} />
      <spotLight
        position={[0, 0.7, 2.3]}
        target={target}
        color="#dcebff"
        intensity={80}
        angle={0.5}
        penumbra={0.7}
        distance={22}
        decay={1.6}
      />
    </>
  );
}

useGLTF.preload(URL);
