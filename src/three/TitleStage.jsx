import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import typeface from './fonts/oxanium-600.json'; // made by scripts/make-typeface.mjs from the licensed Oxanium file (OFL)
import { clock, titleMotion, clamp01, smooth } from './timeline';

/**
  The driver's name as real geometry: two lines of extruded Oxanium SemiBold with a small bevel, in a transparent canvas laid over the (invisible) HTML heading.
  One world unit is one CSS pixel at the heading's plane, so the meshes are sized and placed from the heading's own measured boxes and follow it at every breakpoint.
  Time comes from the opening's shared clock (titleMotion), so Skip, Replay and a held clock all give the same pose; nothing here keeps its own timeline.
  It draws until the name has settled and the tilt has caught up, then goes idle; it wakes on pointer movement and sleeps while the hero is off screen.
*/
const font = new FontLoader().parse(typeface);
const ASC = 0.79; // Oxanium's ascent in ems: where the baseline sits in a line box (see measure)
const SIZE = 100, DEPTH = 15, BEVEL_T = 2.4, BEVEL_S = 1.9; // geometry units before it is scaled to the heading
const FOV = 22;
const TILT = { yaw: 0.075, pitch: 0.045 }; // radians at the edge of the hero: about 4.3 and 2.6 degrees

// one shared set of uniforms: the light that sweeps the bevels and the red edge light
const U = { uSweep: { value: -1 }, uSweepAmt: { value: 0 }, uX0: { value: 0 }, uXW: { value: 1 }, uEdge: { value: 0.45 } };

function patch(m) {
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, U);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vOP;\nvarying vec3 vON;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\nvOP = position;\nvON = normal;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vOP;\nvarying vec3 vON;\nuniform float uSweep, uSweepAmt, uX0, uXW, uEdge;')
      .replace(
        '#include <emissivemap_fragment>',
        `#include <emissivemap_fragment>
        float bev = 1.0 - abs(normalize(vON).z);
        float band = smoothstep(0.05, 0.0, abs((vOP.x - uX0) / uXW - uSweep));
        totalEmissiveRadiance += vec3(0.86, 0.95, 1.0) * band * uSweepAmt * (0.14 + 1.7 * bev);
        float edgeMask = smoothstep(0.04, 0.1, bev) * (1.0 - smoothstep(0.88, 0.97, bev)); // the bevel facets only: not the flat face, not the straight side walls
        float low = clamp(dot(normalize(vON.xy + 1e-4), vec2(-0.6, -0.8)) * 0.5 + 0.5, 0.0, 1.0); // the facets that face down and left take the red rim
        totalEmissiveRadiance += vec3(1.0, 0.09, 0.04) * edgeMask * low * low * uEdge * 1.5;
        `,
      );
  };
}

/** Where each line sits, in CSS pixels relative to the canvas box, read from the real heading so the 3D and the HTML can never disagree. */
function measure(box) {
  const root = box.parentElement; // .hero-id
  const lines = [...root.querySelectorAll('.hn-ink')];
  if (lines.length < 2) return null;
  const b = box.getBoundingClientRect();
  if (!b.width) return null;
  return {
    w: b.width,
    h: b.height,
    lines: lines.map((el) => {
      const r = el.getBoundingClientRect();
      const fs = parseFloat(getComputedStyle(el).fontSize);
      return { text: el.textContent.toUpperCase(), left: r.left - b.left, width: r.width, base: r.top - b.top + (r.height - fs) / 2 + ASC * fs };
    }),
  };
}

function build(layout) {
  const gs = layout.lines.map((l) => new TextGeometry(l.text, { font, size: SIZE, depth: DEPTH, curveSegments: 5, bevelEnabled: true, bevelThickness: BEVEL_T, bevelSize: BEVEL_S, bevelSegments: 2 }));
  gs.forEach((g) => g.computeBoundingBox());
  // one scale for both lines, from the longer one: equal letter height, and GANDI stays the shorter line it naturally is
  const k = layout.lines[0].width / (gs[0].boundingBox.max.x - gs[0].boundingBox.min.x);
  gs.forEach((g, i) => {
    const l = layout.lines[i];
    g.scale(k, k, k);
    g.translate(l.left - layout.w / 2 - g.boundingBox.min.x * k, layout.h / 2 - l.base, -(DEPTH + BEVEL_T) * k); // front face on the heading's plane, the body behind it
  });
  U.uX0.value = -layout.w / 2;
  U.uXW.value = layout.w;
  return gs;
}

function Title({ onReady }) {
  const { gl, size, camera, setFrameloop } = useThree();
  const group = useRef();
  const box = useRef(gl.domElement.closest('.title3d'));
  const [layout, setLayout] = useState(null);
  const tilt = useRef({ x: 0, y: 0, tx: 0, ty: 0 });
  const ready = useRef(false);
  const asleep = useRef(false);
  const mats = useMemo(() => {
    const front = new THREE.MeshStandardMaterial({ color: '#f3efe7', metalness: 0.38, roughness: 0.34 }); // satin warm silver
    const side = new THREE.MeshStandardMaterial({ color: '#171a1f', metalness: 0.55, roughness: 0.46 }); // graphite
    patch(front);
    patch(side);
    return [front, side];
  }, []);
  const geoms = useMemo(() => layout && build(layout), [layout]);
  useEffect(() => () => geoms?.forEach((g) => g.dispose()), [geoms]);
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats]);

  // the camera is a plain perspective one placed so that z = 0 maps one unit to one CSS pixel
  useEffect(() => {
    camera.fov = FOV;
    camera.position.set(0, 0, size.height / 2 / Math.tan((FOV * Math.PI) / 360));
    camera.far = camera.position.z + 1200;
    camera.updateProjectionMatrix();
  }, [camera, size.height]);

  // measure once the face is loaded and whenever the heading changes size
  useEffect(() => {
    const el = box.current;
    let dead = false;
    const run = () => {
      if (dead) return;
      const m = measure(el);
      if (!m) return;
      setLayout((old) => (old && Math.abs(old.w - m.w) < 0.5 && Math.abs(old.h - m.h) < 0.5 && old.lines.every((l, i) => Math.abs(l.width - m.lines[i].width) < 0.5 && Math.abs(l.base - m.lines[i].base) < 0.5 && Math.abs(l.left - m.lines[i].left) < 0.5) ? old : m));
    };
    document.fonts.load('600 64px Oxanium').then(run, run);
    const ro = new ResizeObserver(run);
    ro.observe(el.parentElement);
    return () => {
      dead = true;
      ro.disconnect();
    };
  }, []);

  // pointer tilt (fine pointers only), and sleep while the hero is off screen
  useEffect(() => {
    const hero = box.current.closest('.hero');
    const wake = () => {
      asleep.current = false;
      setFrameloop('always');
    };
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? wake() : setFrameloop('never')));
    io.observe(hero);
    if (!window.matchMedia('(pointer: fine)').matches) return () => io.disconnect();
    const move = (e) => {
      const r = hero.getBoundingClientRect();
      tilt.current.tx = clamp01((e.clientX - r.left) / r.width) * 2 - 1;
      tilt.current.ty = clamp01((e.clientY - r.top) / r.height) * 2 - 1;
      if (asleep.current) wake();
    };
    const leave = () => {
      tilt.current.tx = tilt.current.ty = 0;
      if (asleep.current) wake();
    };
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', leave);
    return () => {
      io.disconnect();
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', leave);
    };
  }, [setFrameloop]);

  useEffect(() => {
    if (import.meta.env.DEV) window.__title = { tilt: tilt.current, group }; // dev hook, like window.__clock
  }, []);

  useFrame((_, dt) => {
    const m = titleMotion(clock.t);
    const t = tilt.current;
    const w = smooth(0.8, 1, m.p); // the pointer only takes over once the name has arrived
    t.x = THREE.MathUtils.damp(t.x, t.tx * w, 5, dt);
    t.y = THREE.MathUtils.damp(t.y, t.ty * w, 5, dt);
    const g = group.current;
    g.visible = m.p > 0;
    g.position.set(m.x, 0, m.z);
    g.rotation.set(m.pitch + t.y * TILT.pitch, m.yaw + t.x * TILT.yaw, 0);
    U.uSweep.value = -0.12 + 1.24 * m.sweep;
    U.uSweepAmt.value = Math.sin(Math.PI * m.sweep);
    U.uEdge.value = m.edge;
    box.current.style.opacity = m.opacity.toFixed(3);
    if (geoms && !ready.current) {
      ready.current = true;
      onReady?.();
    }
    const still = m.p >= 1 && Math.abs(t.x - t.tx) < 1e-3 && Math.abs(t.y - t.ty) < 1e-3;
    if (still && ready.current && !asleep.current) {
      asleep.current = true;
      setFrameloop('demand'); // the name has settled and this frame drew it: stop drawing until the pointer moves (invalidate here would loop forever)
    }
  });

  return (
    <>
      <group ref={group} visible={false}>
        {geoms?.map((g, i) => (
          <mesh key={i} geometry={g} material={mats} />
        ))}
      </group>
      <ambientLight intensity={0.6} />
      {/* key: warm, high and in front, the same side as the scene's own key light */}
      <directionalLight position={[-300, 420, 520]} intensity={2.6} color="#fff1dc" />
      {/* a red rim from behind and below, kept low: the red belongs to the bevel edge (see patch), not to the sides or the faces */}
      <directionalLight position={[420, -240, -320]} intensity={0.9} color="#ff2a14" />
      {/* the faintest cool lift from the right */}
      <directionalLight position={[520, -80, 260]} intensity={0.45} color="#7fdcff" />
      <Environment resolution={128} frames={1} environmentIntensity={0.8}>
        <Lightformer form="rect" intensity={3.4} position={[0, 3, 6]} scale={[22, 6, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#8fe3ff" position={[8, 0.5, 1]} rotation-y={-Math.PI / 2} scale={[6, 1.6, 1]} />
        <Lightformer form="rect" intensity={0.7} color="#e10600" position={[-7, -1, -4]} rotation-y={Math.PI / 2} scale={[8, 1.2, 1]} />
      </Environment>
    </>
  );
}

export default function TitleStage({ onReady }) {
  return (
    <div className="title3d" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        frameloop="always"
        gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
        camera={{ fov: FOV, near: 10, far: 4000, position: [0, 0, 1000] }}
        style={{ pointerEvents: 'none' }}
        onCreated={({ gl }) => gl.setClearColor(0x000000, 0)}
      >
        <Title onReady={onReady} />
      </Canvas>
    </div>
  );
}
