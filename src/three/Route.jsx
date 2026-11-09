import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { milestones } from '../content/profile';
import { N, RY, ROAD_W, U_END, GAP, LIP_X, FLY, ROLL, route, ramp, cpU, deckAt, newFrame, routeToWorld, sideOf, HEIGHT, ACCENT, view } from './journey';
import { routeTexture, radialTexture } from './textures';
import DriftCar from './DriftCar';

const HW = ROAD_W / 2;
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const ease = (x) => x * x * (3 - 2 * x);

const COLD = new THREE.Color('#3a414c');
const HOT = new THREE.Color('#ff3b30');
const TEAL = '#1aa7ad';

// How visible a card is, by how far it is from focus (d, in cards). Cards waiting ahead fade out the further they are.
const OPACITY = [[-1, 0], [0, 1], [1, 0.8], [2, 0.42], [3.2, 0]];
function opacityAt(d) {
  const c = clamp(d, OPACITY[0][0], OPACITY[OPACITY.length - 1][0]);
  let k = 0;
  while (k < OPACITY.length - 2 && c > OPACITY[k + 1][0]) k++;
  const [d0, a] = OPACITY[k];
  const [d1, b] = OPACITY[k + 1];
  return a + (b - a) * ease((c - d0) / (d1 - d0));
}

// The cross-sections the road is built from: a slab with kerbs, a chamfered underside, and the lit lines on top.
const KERB = [0.3, 0.34, 0.4];
const SLAB = [
  [-HW + 0.12, 0.07, ...KERB], [-HW, 0.07, ...KERB], [-HW, -0.16, 0.1, 0.12, 0.15], [-HW * 0.9, -0.5, 0.05, 0.06, 0.08], [-HW * 0.5, -0.8, 0.03, 0.035, 0.05],
  [HW * 0.5, -0.8, 0.03, 0.035, 0.05], [HW * 0.9, -0.5, 0.05, 0.06, 0.08], [HW, -0.16, 0.1, 0.12, 0.15], [HW, 0.07, ...KERB], [HW - 0.12, 0.07, ...KERB],
];
const TOP = [[-HW + 0.12, 0.002], [HW - 0.12, 0.002]];
const EDGE_L = [[-HW + 0.02, 0.078], [-HW + 0.1, 0.078]];
const EDGE_R = [[HW - 0.1, 0.078], [HW - 0.02, 0.078]];
const HALO = [[-2.5, -0.9], [2.5, -0.9]];
const LIT = [[-0.06, 0.012], [0.06, 0.012]];
const LIT_GLOW = [[-0.45, 0.01], [0.45, 0.01]];

// The career route: an elevated one-way road in the night scene, a slip road that climbs to it from the road below,
// a gate and a mast at each real milestone, a gap to jump, and the car. It also places the HTML panels:
// each waits beside the road at its checkpoint, on alternating sides, and the one in focus comes forward beside the car.
export default function Route({ low, still }) {
  const group = useRef();
  const gates = useRef([]);
  const masts = useRef([]);

  const tex = useMemo(() => routeTexture(), []);
  const glow = useMemo(() => radialTexture(), []);
  const geo = useMemo(() => {
    const total = low ? 260 : 400;
    const span = U_END - (GAP.u1 - GAP.u0);
    const A = [0, GAP.u0, Math.round((total * GAP.u0) / span)];
    const B = [GAP.u1, U_END, Math.round((total * (U_END - GAP.u1)) / span)];
    const both = [A, B];
    return {
      top: route.sweep(both, TOP),
      slab: route.sweep(both, SLAB, true),
      edgeL: route.sweep(both, EDGE_L),
      edgeR: route.sweep(both, EDGE_R),
      halo: route.sweep(both, HALO),
      lit: route.sweep(both, LIT),
      litGlow: route.sweep(both, LIT_GLOW),
      slipTop: ramp.sweep([[0, 1, 70]], [[-HW + 0.12, 0.002], [HW - 0.12, 0.002]]),
      slipSlab: ramp.sweep([[0, 1, 70]], SLAB, true),
      slipEdgeL: ramp.sweep([[0, 1, 70]], EDGE_L),
      slipEdgeR: ramp.sweep([[0, 1, 70]], EDGE_R),
    };
  }, [low]);
  useEffect(() => () => [tex, glow].forEach((t) => t.dispose()), [tex, glow]);
  useEffect(() => () => Object.values(geo).forEach((g) => g.dispose()), [geo]);

  // where each gate, mast and panel anchor sits (route space). The last entry is the ahead destination.
  const spots = useMemo(() => {
    const f = newFrame();
    return Array.from({ length: N + 1 }, (_, i) => {
      // the plan ahead is not on the route: it waits on the night road beyond the landing, and is never reached
      if (i < N) route.frame(cpU(i), f);
      else {
        f.p.set(LIP_X + FLY + ROLL + 16, -RY + 0.03, 0);
        f.lat.set(0, 0, 1);
        f.up.set(0, 1, 0);
      }
      const side = sideOf(i);
      const q = new THREE.Matrix4().makeBasis(f.lat.clone(), f.up.clone(), new THREE.Vector3().crossVectors(f.lat, f.up));
      return {
        p: f.p.clone(),
        q: new THREE.Quaternion().setFromRotationMatrix(q),
        mast: f.p.clone().addScaledVector(f.lat, side * (HW + 0.32)).addScaledVector(f.up, 0.07),
        color: new THREE.Color(i < N ? ACCENT[milestones[i].kind] : '#edeff2'),
        side,
      };
    });
  }, []);
  // the launch line and the landing line, across the road at each end of the gap
  const ends = useMemo(() => {
    const f = newFrame();
    return [GAP.u0, GAP.u1, 0.9985].map((u) => {
      route.frame(u, f);
      const q = new THREE.Matrix4().makeBasis(f.lat.clone(), f.up.clone(), new THREE.Vector3().crossVectors(f.lat, f.up));
      return { p: f.p.clone().addScaledVector(f.up, 0.085), q: new THREE.Quaternion().setFromRotationMatrix(q) };
    });
  }, []);

  const mats = useRef([]);
  useLayoutEffect(() => {
    mats.current = [];
    group.current.traverse((o) => {
      if (!o.material) return;
      o.material.userData.base = o.material.opacity;
      o.material.transparent = true;
      mats.current.push(o.material);
    });
  }, []);

  const S = useMemo(
    () => ({
      v: new THREE.Vector3(),
      f: newFrame(),
      P0: { x: 0, y: 0, d: 1 },
      P1: { x: 0, y: 0, d: 1 },
      PC: { x: 0, y: 0, d: 1 },
      card: { w: 0, h: 0, sw: 0, sh: 0 },
      xs: new Float32Array(N + 1),
      ys: new Float32Array(N + 1),
      ss: new Float32Array(N + 1),
    }),
    []
  );

  useFrame(({ camera, clock, size }) => {
    const w = view.ws;
    const g = group.current;
    g.visible = w > 0.01;
    if (view.layer) {
      // the panels arrive once the camera is mostly up, after the section heading has scrolled clear
      const a = clamp((w - 0.55) / 0.45, 0, 1);
      view.layer.style.opacity = a.toFixed(3);
      view.layer.dataset.on = a > 0.5 ? '1' : '0';
    }
    view.wrap?.style.setProperty('--scrim', (1 - 0.6 * w).toFixed(3));
    if (!g.visible) return;

    g.position.set(0, RY, view.zr);
    g.rotation.y = Math.PI / 2; // the route runs away from the camera, like the road
    g.updateMatrixWorld();
    mats.current.forEach((m) => (m.opacity = m.userData.base * w));

    const u = view.t;
    // the route lights up behind the car
    geo.lit.setDrawRange(0, route.drawCount(geo.lit, u));
    geo.litGlow.setDrawRange(0, route.drawCount(geo.litGlow, u));

    for (let i = 0; i < N; i++) {
      const reached = u >= cpU(i) - 0.003;
      const col = gates.current[i].material.color;
      col.copy(i === view.sel ? HOT : reached ? spots[i].color : COLD);
      masts.current[i].material.color.copy(col);
    }

    // ---- the panels ----
    const exitK = clamp(view.xo / (FLY + ROLL), 0, 1);
    const f = Math.min(N - 1, deckAt(u)); // the last milestone stays in focus through the jump and the landing
    const fa = f + 0.6 * exitK; // ...while the plan ahead comes up as the car lands on the road beside it
    const t = still ? 0 : clock.elapsedTime;
    const tall = view.tall;
    const phone = size.width < 721;
    const el0 = view.panels[0];
    if (!el0) return;
    const card = S.card;
    if (card.sw !== size.width || card.sh !== size.height) {
      card.sw = size.width;
      card.sh = size.height;
      card.w = el0.offsetWidth;
      card.h = el0.offsetHeight;
    }
    const cw = card.w;
    const ch = card.h;
    const fpx = (camera.projectionMatrix.elements[5] * size.height) / 2; // pixels per unit at depth 1
    const { v } = S;
    const project = (wx, wy, wz, out) => {
      v.set(wx, wy, wz).applyMatrix4(camera.matrixWorldInverse);
      out.d = Math.max(0.5, -v.z);
      v.applyMatrix4(camera.projectionMatrix);
      out.x = (v.x * 0.5 + 0.5) * size.width;
      out.y = (-v.y * 0.5 + 0.5) * size.height;
    };

    // where the car is on screen: the focus slot is beside it
    route.frame(u, S.f);
    routeToWorld(S.f.p, v);
    project(v.x, v.y, v.z, S.PC);
    const slotX = tall || phone ? size.width / 2 : clamp(S.PC.x, 0, size.width);
    const dashH = view.dashH;

    for (let i = 0; i <= N; i++) {
      const el = view.panels[i];
      if (!el) continue;
      const ahead = i === N;
      const d = i - (ahead ? fa : f);
      const op = opacityAt(d);
      el.style.opacity = op.toFixed(3);
      el.style.pointerEvents = !ahead && op > 0.3 ? 'auto' : 'none';
      if (op < 0.004) continue;
      const side = spots[i].side;
      const chi = view.heights[i] || ch; // each card is as tall as its own content
      const slotY = tall || phone ? size.height - dashH - 12 - chi / 2 : size.height / 2 - dashH * 0.25;

      // its place beside the road at its own checkpoint, seen from here
      const sp = spots[i];
      routeToWorld(sp.p, v);
      const wx = v.x;
      const wy = v.y;
      const wz = v.z;
      project(wx, wy, wz, S.P0);
      project(wx, wy + HEIGHT[i], wz, S.P1);
      const fs = ahead ? (tall ? 0.5 : 0.82) : tall ? 0.42 : clamp(26 / S.P0.d, 0.5, 0.7);
      const half = (HW * fpx) / S.P0.d;
      const gap = 22 + (i % 3) * 16;
      let fx = S.P0.x + side * (half + gap + (cw * fs) / 2);
      let fy = S.P1.y;
      fx = clamp(fx, (cw * fs) / 2 + 6, size.width - (cw * fs) / 2 - 6);
      fy = clamp(fy, (chi * fs) / 2 + (tall ? 124 : 64), size.height - dashH - (chi * fs) / 2 - (tall ? chi + 24 : 24));

      // the focus slot: beside the car on a wide screen, docked at the bottom on a tall one
      let sx = tall || phone ? slotX : slotX + side * ((HW * fpx) / S.PC.d + 76 + cw / 2);
      sx = clamp(sx, cw / 2 + 18, size.width - cw / 2 - 18);

      let cx;
      let cy;
      let s;
      let ry;
      if (d >= 0) {
        const k = ease(clamp(d, 0, 1));
        cx = sx + (fx - sx) * k;
        cy = slotY + (fy - slotY) * k;
        s = 1 + (fs - 1) * k;
        ry = -side * 9 * k;
        if (ahead) {
          cx = fx;
          cy = fy;
          s = fs;
          ry = -side * 10;
        }
      } else {
        const k = -d; // slips away outward and upward, the way it came
        cx = sx + (tall || phone ? 0 : side * k * 170);
        cy = slotY - k * (tall || phone ? 120 : 70);
        s = 1 - 0.1 * k;
        ry = -side * 14 * k;
      }
      // a slow float of its own: waiting cards drift a little, the one in focus barely moves
      const away = Math.min(1, Math.abs(d)) * (still ? 0 : 1);
      cx += Math.sin(t * 0.37 + i * 1.3) * 3.5 * away;
      cy += Math.sin(t * 0.55 + i * 1.9) * 3 * away;
      ry += Math.sin(t * 0.3 + i) * 0.8 * away;

      el.style.transform = `translate3d(${(cx - cw / 2).toFixed(1)}px,${(cy - chi / 2).toFixed(1)}px,0) rotateY(${ry.toFixed(2)}deg) scale(${s.toFixed(3)})`;
      el.style.zIndex = String(d >= 0 ? 30 - Math.round(d * 4) : 20 + Math.round(d * 4));
      // a card's text shows only when it is in focus. The plan ahead is read when the route gets there.
      el.style.setProperty('--body', (ahead ? ease(clamp(1.6 - d, 0, 1)) : clamp(1 - Math.abs(d) * 1.7, 0, 1)).toFixed(3));
      S.xs[i] = cx;
      S.ys[i] = cy;
      S.ss[i] = s;
    }

    // a thin line from the card in focus to the car, so the card stays tied to the road
    if (view.link) {
      const i = clamp(Math.round(f), 0, N - 1);
      const side = spots[i].side;
      const ax = S.xs[i] - side * (cw * S.ss[i]) * 0.5;
      const ay = S.ys[i] - (view.heights[i] || ch) * S.ss[i] * 0.16;
      const len = Math.hypot(S.PC.x - ax, S.PC.y - ay);
      const fade = 1 - clamp(Math.abs(i - f) * 2, 0, 1);
      view.link.style.opacity = tall || phone || len < 24 || !view.panels[i] ? '0' : fade.toFixed(3);
      view.link.style.width = `${len.toFixed(1)}px`;
      view.link.style.transform = `translate(${ax.toFixed(1)}px,${ay.toFixed(1)}px) rotate(${Math.atan2(S.PC.y - ay, S.PC.x - ax).toFixed(4)}rad)`;
    }
  });

  const flat = { transparent: true, depthWrite: false, side: THREE.DoubleSide };
  return (
    <>
      <group ref={group} visible={false}>
        {/* the glow under the road, then the slip road, then the route: slab, surface, kerb lines, the lit progress line */}
        <mesh geometry={geo.halo} renderOrder={1}>
          <meshBasicMaterial color={TEAL} opacity={0.12} blending={THREE.AdditiveBlending} {...flat} />
        </mesh>
        <mesh geometry={geo.slipSlab} renderOrder={2}>
          <meshBasicMaterial vertexColors opacity={1} {...flat} />
        </mesh>
        <mesh geometry={geo.slipTop} renderOrder={3}>
          <meshBasicMaterial map={tex} opacity={0.95} {...flat} />
        </mesh>
        {[geo.slipEdgeL, geo.slipEdgeR].map((e, i) => (
          <mesh key={i} geometry={e} renderOrder={4}>
            <meshBasicMaterial color={TEAL} opacity={0.7} {...flat} />
          </mesh>
        ))}
        <mesh geometry={geo.slab} renderOrder={2}>
          <meshBasicMaterial vertexColors opacity={1} {...flat} />
        </mesh>
        <mesh geometry={geo.top} renderOrder={3}>
          <meshBasicMaterial map={tex} opacity={1} {...flat} />
        </mesh>
        {[geo.edgeL, geo.edgeR].map((e, i) => (
          <mesh key={i} geometry={e} renderOrder={4}>
            <meshBasicMaterial color={i ? '#b0287f' : TEAL} opacity={0.85} {...flat} />
          </mesh>
        ))}
        <mesh geometry={geo.litGlow} renderOrder={4}>
          <meshBasicMaterial color="#e10600" opacity={0.12} blending={THREE.AdditiveBlending} {...flat} />
        </mesh>
        <mesh geometry={geo.lit} renderOrder={5}>
          <meshBasicMaterial color="#ff3b30" opacity={0.9} {...flat} />
        </mesh>

        {/* launch line and landing line across the road, either side of the gap */}
        {ends.map((e, i) => (
          <mesh key={i} position={e.p} quaternion={e.q} renderOrder={6}>
            <boxGeometry args={[ROAD_W - 0.25, 0.012, 0.14]} />
            <meshBasicMaterial color={i === 1 ? '#1aa7ad' : '#edeff2'} opacity={0.8} {...flat} />
          </mesh>
        ))}

        {/* a timing gate across the road and a mast at its edge, one per real milestone */}
        {spots.slice(0, N).map((s, i) => (
          <group key={i}>
            <mesh ref={(el) => (gates.current[i] = el)} position={s.p} quaternion={s.q} renderOrder={6}>
              <boxGeometry args={[ROAD_W - 0.25, 0.03, 0.12]} />
              <meshBasicMaterial opacity={0.95} {...flat} />
            </mesh>
            <mesh ref={(el) => (masts.current[i] = el)} position={[s.mast.x, s.mast.y + (HEIGHT[i] - 0.5) / 2, s.mast.z]} renderOrder={6}>
              <boxGeometry args={[0.06, HEIGHT[i] - 0.5, 0.06]} />
              <meshBasicMaterial opacity={0.9} {...flat} />
            </mesh>
          </group>
        ))}
        {/* the future destination: a hollow marker, never lit and never reached */}
        <mesh position={[spots[N].p.x, spots[N].p.y + 0.04, spots[N].p.z]} rotation-x={-Math.PI / 2} renderOrder={6}>
          <ringGeometry args={[0.7, 0.82, 40]} />
          <meshBasicMaterial color="#edeff2" opacity={0.45} {...flat} />
        </mesh>
      </group>
      <Suspense fallback={null}>
        <DriftCar low={low} still={still} />
      </Suspense>
    </>
  );
}
