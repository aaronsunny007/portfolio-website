import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { clock, carState } from './timeline';
import { drivePose } from './drive';
import { liftWheels, TYRE_R } from './wheels';

// A host that can't serve .glb can point at the same file under another name (window.__CAR_URL).
const URL = (typeof window !== 'undefined' && window.__CAR_URL) || `${import.meta.env.BASE_URL}models/car.glb`;

export default function Car() {
  const { scene } = useGLTF(URL);
  const outer = useRef();
  const inner = useRef();

  const { model, wheels } = useMemo(() => {
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
    return { model: m, wheels: liftWheels(m) }; // wheels lifted out of the body so they can steer and spin
  }, [scene]);

  useFrame(() => {
    const p = drivePose(clock.t);
    const yaw = p.yaw;
    const roll = -p.slip * 0.05 * Math.min(1, p.speed / 6); // weight transfers onto the outside tyres
    // nose lifts on power, drops as it straightens and lifts off; then the suspension settles with one small, quickly damped rebound
    const k = Math.max(0, p.u - 0.78) / 0.22;
    const pitch = (p.u > 0.8 ? 0.008 : -0.012 * Math.min(1, p.speed / 8)) + Math.sin(k * Math.PI * 3) * Math.exp(-3.2 * k) * 0.014;
    outer.current.position.set(p.x, 0, p.z);
    outer.current.rotation.y = yaw;
    inner.current.rotation.set(pitch, 0, roll);

    // Counter-steer: the front wheels point along the direction of travel, not along the body (about two thirds of the slide angle, as real lock runs out).
    const steer = THREE.MathUtils.clamp(-p.slip * 0.65, -0.55, 0.55);
    const roll0 = (p.dist / TYRE_R) % (Math.PI * 2);
    for (const w of wheels) {
      w.pivot.rotation.y = w.front ? steer : 0;
      w.pivot.rotation.x = w.front ? roll0 : (roll0 * 1.35) % (Math.PI * 2); // the driven rears spin faster than the car moves
    }
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
        intensity={50}
        angle={0.5}
        penumbra={0.7}
        distance={22}
        decay={1.6}
      />
    </>
  );
}

useGLTF.preload(URL);
