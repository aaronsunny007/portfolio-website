import { useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import font900 from '@fontsource/big-shoulders-display/files/big-shoulders-display-latin-900-normal.woff?url';
import { T, clock, clamp01, easeOutBack, easeOutCubic } from './timeline';
import { profile } from '../content/profile';

// The giant name lives in the 3D scene behind the car, so the car and the driver stand in front of it.
const WORDS = [
  { text: profile.first.toUpperCase(), size: 2.5, color: '#edeff2' },
  { text: profile.last.toUpperCase(), size: 2.5, color: '#e10600' },
];
const GAP = 0.6;
const Z = -6.5;
const BASELINE = 0.9;
const DRAG = 18; // how far left the letters start

function Letter({ ch, x, y, size, color, delay }) {
  const ref = useRef();
  useFrame(() => {
    const m = ref.current;
    if (!m) return;
    const p = clamp01((clock.t - T.name - delay) / 1.15);
    const e = easeOutBack(p, 1.5);
    m.position.x = x - (1 - e) * DRAG;
    m.scale.x = 1 + (1 - easeOutCubic(p)) * 2.4; // stretched while it's being dragged
    m.fillOpacity = Math.min(1, p * 3.5);
    m.visible = p > 0;
  });
  return (
    <Text ref={ref} font={font900} fontSize={size} color={color} anchorX="center" anchorY="bottom-baseline" position={[x, y, 0]} visible={false}>
      {ch}
    </Text>
  );
}

function Streak() {
  const ref = useRef();
  useFrame(() => {
    const p = clamp01((clock.t - T.name) / 0.9);
    ref.current.visible = p > 0 && p < 1;
    ref.current.scale.x = easeOutCubic(p) * 26;
    ref.current.position.x = -13 + (easeOutCubic(p) * 26) / 2;
    ref.current.material.opacity = 1 - p;
  });
  return (
    <mesh ref={ref} position={[0, BASELINE - 0.35, Z + 0.3]} visible={false}>
      <planeGeometry args={[1, 0.08]} />
      <meshBasicMaterial color={[5, 0.15, 0.05]} toneMapped={false} transparent />
    </mesh>
  );
}

export default function Wordmark() {
  // Measure each word once (glyph bounds) so the letters can animate on their own.
  const [glyphs, setGlyphs] = useState({});
  const ready = WORDS.every((w) => glyphs[w.text]);

  // Portrait screens stack the two words; landscape sets them side by side.
  const aspect = useThree((s) => s.size.width / s.size.height);
  const portrait = aspect < 1;
  let layout = [];
  if (ready) {
    const widths = WORDS.map((w) => glyphs[w.text].width);
    const total = widths.reduce((a, b) => a + b, 0) + GAP * (WORDS.length - 1);
    let cursor = -total / 2;
    layout = WORDS.map((w, wi) => {
      const g = glyphs[w.text];
      const start = portrait ? -widths[wi] / 2 - g.left : cursor - g.left;
      const y = portrait ? (WORDS.length - 1 - wi) * w.size * 0.82 : 0;
      cursor += widths[wi] + GAP;
      return g.centers.map((cx, i) => ({
        y,
        ch: w.text[i],
        x: start + cx,
        size: w.size,
        color: w.color,
        // the letter nearest the car (rightmost) is pulled in first
        delay: wi * 0.14 + (w.text.length - 1 - i) * 0.075,
      }));
    });
  }

  // Scale the whole name down so it always fits ~90% of the screen width (matches CameraRig's framing).
  let fit = 1;
  if (ready) {
    const dist = portrait ? 13.5 - Z : 8.9 - Z;
    const fov = THREE.MathUtils.degToRad(portrait ? 44 : 31);
    const visible = 2 * dist * Math.tan(fov / 2) * aspect;
    const widths = WORDS.map((w) => glyphs[w.text].width);
    const need = portrait ? Math.max(...widths) : widths.reduce((a, b) => a + b, 0) + GAP * (WORDS.length - 1);
    fit = Math.min(1, (0.9 * visible) / need);
  }

  return (
    <group position={[0, BASELINE, Z]} scale={[fit, fit, 1]}>
      {WORDS.map((w) => (
        <Text
          key={'m' + w.text}
          font={font900}
          fontSize={w.size}
          anchorX="left"
          anchorY="bottom-baseline"
          visible={false}
          onSync={(m) => {
            const info = m.textRenderInfo;
            if (!info || glyphs[w.text]) return;
            const b = info.glyphBounds;
            const centers = [];
            for (let i = 0; i < w.text.length; i++) centers.push((b[i * 4] + b[i * 4 + 2]) / 2);
            const left = b[0];
            const right = b[(w.text.length - 1) * 4 + 2];
            setGlyphs((s) => ({ ...s, [w.text]: { centers, left, width: right - left } }));
          }}
        >
          {w.text}
        </Text>
      ))}
      {layout.flat().map((l, i) => (
        <Letter key={i} {...l} />
      ))}
      <Streak />
    </group>
  );
}
