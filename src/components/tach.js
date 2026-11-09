// The tachometer face, drawn once and shared: the persistent dashboard cluster and the opening ignition gauge use the same
// markings, numerals and needle, so the opening reads as the same instrument the visitor then drives with.
export const mono = (w, px) => `${w} ${px}px "JetBrains Mono", monospace`;

const R = 96; // the face is authored at this radius; `scale` resizes it
const A0 = 0.75 * Math.PI;
const SWEEP = 1.5 * Math.PI;

/** Draw the tach with its centre at (cx, cy). rpm is 0..1 of the arc. */
export function drawTach(g, cx, cy, rpm, scale = 1) {
  g.save();
  g.translate(cx, cy);
  g.scale(scale, scale);
  g.lineCap = 'butt';
  g.strokeStyle = 'rgba(255, 59, 48, 0.8)';
  g.lineWidth = 8;
  g.beginPath();
  g.arc(0, 0, R + 3, A0 + SWEEP * 0.8125, A0 + SWEEP);
  g.stroke();
  for (let i = 0; i <= 32; i++) {
    const a = A0 + (SWEEP * i) / 32;
    const major = i % 4 === 0;
    const r0 = R - (major ? 18 : 10);
    g.strokeStyle = major ? '#e6ebf1' : '#6c7886';
    g.lineWidth = major ? 3.5 : 1.8;
    g.beginPath();
    g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    g.lineTo(Math.cos(a) * (R - 2), Math.sin(a) * (R - 2));
    g.stroke();
  }
  g.fillStyle = '#c3ccd6';
  g.font = mono(700, 20);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (let n = 0; n <= 8; n++) {
    const a = A0 + (SWEEP * n) / 8;
    g.fillText(String(n), Math.cos(a) * (R - 38), Math.sin(a) * (R - 38));
  }
  g.font = mono(600, 16);
  g.fillStyle = '#9aa4b0';
  g.fillText('x1000 rpm', 0, 74);
  const a = A0 + SWEEP * Math.min(1, Math.max(0, rpm));
  g.strokeStyle = '#ff4a3f';
  g.lineWidth = 5;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(-Math.cos(a) * 14, -Math.sin(a) * 14);
  g.lineTo(Math.cos(a) * (R - 10), Math.sin(a) * (R - 10));
  g.stroke();
  g.fillStyle = '#0f131a';
  g.strokeStyle = '#6a7684';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(0, 0, 11, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  g.restore();
}
