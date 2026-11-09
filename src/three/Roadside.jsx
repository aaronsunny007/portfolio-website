import { useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// The places the night road passes: shopfronts and garages close to the barrier, tall dark blocks further out with lit
// windows on the faces that look at the road, small reflectors along the barrier, and a few cars ahead showing tail lights.
// Every light belongs to something. There are no free-floating dots. Positions come from a fixed seed, so it never changes between visits.
const TINT = ['#ffcf94', '#8fd9d6', '#d98ac0', '#dcebff'];
const LANES = [-3.6, -1.2, 1.2, 3.6];
const CARS = 6;
const SPEED = 7; // how fast the cars ahead drift away, world units per second
const dummy = new THREE.Object3D();

export default function Roadside({ glow, low, still, len, half }) {
  const data = useMemo(() => {
    let s = 11;
    const rnd = () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
    const pick = () => new THREE.Color(TINT[Math.floor(rnd() * TINT.length)]);
    const shops = [];
    for (const side of [-1, 1]) {
      for (let z = -14 - rnd() * 12; z > -len; z -= 28 + rnd() * 34) {
        shops.push({ side, z, w: 8 + rnd() * 6, h: 3 + rnd() * 3, d: 9 + rnd() * 6, off: half + 6 + rnd() * 4, c: pick(), sign: rnd() < 0.45 });
      }
    }
    const blocks = [];
    const nBlocks = low ? 16 : 28;
    for (let i = 0; i < nBlocks; i++) {
      const side = i % 2 ? -1 : 1;
      blocks.push({ side, z: -rnd() * (len + 60), w: 10 + rnd() * 12, h: 9 + rnd() * rnd() * 26, d: 12 + rnd() * 8, off: 36 + rnd() * 50 });
    }
    // lit windows on the road-facing wall of each block
    const nWin = low ? 120 : 220;
    const pos = new Float32Array(nWin * 3);
    const col = new Float32Array(nWin * 3);
    for (let i = 0; i < nWin; i++) {
      const b = blocks[Math.floor(rnd() * blocks.length)];
      pos.set([b.side * (b.off - b.d / 2 - 0.1), 1 + rnd() * (b.h - 2), b.z + (rnd() - 0.5) * (b.w - 2)], i * 3);
      pick().toArray(col, i * 3);
    }
    const reflectors = [];
    for (const side of [-1, 1]) for (let z = -6; z > -len; z -= 8) reflectors.push([side * (half + 0.36), 0.42, z]);
    const cars = Array.from({ length: CARS }, (_, i) => ({ x: LANES[(i * 3) % LANES.length] + (rnd() - 0.5) * 0.5, base: 30 + i * (len / CARS) + rnd() * 14 }));
    return { shops, blocks, pos, col, reflectors, cars };
  }, [low, len, half]);

  const shopBody = useRef();
  const shopLit = useRef();
  const blockBody = useRef();
  const marks = useRef();
  const tails = useRef();
  const bodies = useRef();

  useLayoutEffect(() => {
    const put = (mesh, i, x, y, z, sx, sy, sz, ry = 0, color) => {
      dummy.position.set(x, y, z);
      dummy.rotation.set(0, ry, 0);
      dummy.scale.set(sx, sy, sz);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
      if (color) mesh.setColorAt(i, color);
    };
    let k = 0;
    data.shops.forEach((o, i) => {
      put(shopBody.current, i, o.side * (o.off + o.d / 2), o.h / 2, o.z, o.d, o.h, o.w);
      const face = o.side * o.off - o.side * 0.04; // just in front of the wall that looks at the road
      put(shopLit.current, k++, face, 1.7, o.z, o.w * 0.8, 1.15, 1, (-o.side * Math.PI) / 2, o.c);
      if (o.sign) put(shopLit.current, k++, face, o.h - 0.45, o.z, o.w * 0.9, 0.3, 1, (-o.side * Math.PI) / 2, o.c);
    });
    for (let i = k; i < shopLit.current.count; i++) put(shopLit.current, i, 0, -50, 0, 0, 0, 0);
    data.blocks.forEach((o, i) => put(blockBody.current, i, o.side * o.off, o.h / 2, o.z, o.d, o.h, o.w));
    data.reflectors.forEach(([x, y, z], i) => put(marks.current, i, x, y, z, 0.1, 0.14, 0.04));
    [shopBody, shopLit, blockBody, marks].forEach((r) => {
      r.current.instanceMatrix.needsUpdate = true;
      if (r.current.instanceColor) r.current.instanceColor.needsUpdate = true;
    });
  }, [data]);

  useFrame(({ clock }) => {
    const t = still ? 0 : clock.elapsedTime;
    data.cars.forEach((c, i) => {
      const z = -((c.base + t * SPEED) % len);
      dummy.rotation.set(0, 0, 0);
      dummy.scale.set(1, 1, 1);
      dummy.position.set(c.x, 0.62, z);
      dummy.updateMatrix();
      bodies.current.setMatrixAt(i, dummy.matrix);
      [-0.68, 0.68].forEach((dx, j) => {
        dummy.position.set(c.x + dx, 0.72, z + 2.05);
        dummy.updateMatrix();
        tails.current.setMatrixAt(i * 2 + j, dummy.matrix);
      });
    });
    bodies.current.instanceMatrix.needsUpdate = true;
    tails.current.instanceMatrix.needsUpdate = true;
  });

  const litCount = data.shops.reduce((a, o) => a + (o.sign ? 2 : 1), 0);
  return (
    <>
      <instancedMesh ref={shopBody} args={[null, null, data.shops.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#0c1016" />
      </instancedMesh>
      <instancedMesh ref={shopLit} args={[null, null, litCount]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial transparent opacity={0.45} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={blockBody} args={[null, null, data.blocks.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#0a0d12" />
      </instancedMesh>
      <points>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[data.pos, 3]} />
          <bufferAttribute attach="attributes-color" args={[data.col, 3]} />
        </bufferGeometry>
        <pointsMaterial map={glow} size={2.2} vertexColors transparent opacity={0.75} blending={THREE.AdditiveBlending} depthWrite={false} />
      </points>
      <instancedMesh ref={marks} args={[null, null, data.reflectors.length]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#ffd9a0" transparent opacity={0.7} />
      </instancedMesh>
      <instancedMesh ref={bodies} args={[null, null, CARS]} frustumCulled={false}>
        <boxGeometry args={[1.8, 1.1, 4]} />
        <meshBasicMaterial color="#0b0e13" />
      </instancedMesh>
      <instancedMesh ref={tails} args={[null, null, CARS * 2]} frustumCulled={false}>
        <planeGeometry args={[1.1, 1.1]} />
        <meshBasicMaterial map={glow} color="#ff3b30" transparent opacity={0.85} blending={THREE.AdditiveBlending} depthWrite={false} />
      </instancedMesh>
    </>
  );
}
