// The tachometer face, drawn once and shared: the persistent dashboard cluster and the opening ignition gauge use the same
// markings, numerals and needle, so the opening reads as the same instrument the visitor then drives with.
export const mono = (w, px) => `${w} ${px}px "JetBrains Mono", monospace`;

const R = 96; // the face is authored at this radius; `scale` resizes it
const A0 = 0.75 * Math.PI;
const SWEEP = 1.5 * Math.PI;

export const REDLINE = 0.8125; // the arc fraction where the redline starts: 6.5 of 8 (x1000 rpm)
const LIT = 'rgba(214, 228, 244, 0.9)';
const arc = (g, r, from, to) => {
  g.beginPath();
  g.arc(0, 0, r, A0 + SWEEP * from, A0 + SWEEP * to);
  g.stroke();
};

/** Draw the tach with its centre at (cx, cy). rpm is 0..1 of the arc. */
export function drawTach(g, cx, cy, rpm, scale = 1) {
  g.save();
  g.translate(cx, cy);
  g.scale(scale, scale);
  const r = Math.min(1, Math.max(0, rpm));
  g.lineCap = 'butt';
  // the scale's track, the redline zone (dim until it is reached), and an arc lit up to the actual rpm
  g.lineWidth = 6;
  g.strokeStyle = 'rgba(255, 255, 255, 0.07)';
  arc(g, R + 3, 0, 1);
  g.strokeStyle = 'rgba(255, 59, 48, 0.5)';
  arc(g, R + 3, REDLINE, 1);
  if (r > 0.004) {
    g.strokeStyle = LIT;
    arc(g, R + 3, 0, Math.min(r, REDLINE));
    if (r > REDLINE) {
      g.strokeStyle = '#ff3b30';
      arc(g, R + 3, REDLINE, r);
    }
  }
  // graduations: a long mark each 1000 rpm, a medium one each 500, a short one each 250; the redline's marks are red
  for (let i = 0; i <= 32; i++) {
    const a = A0 + (SWEEP * i) / 32;
    const major = i % 4 === 0;
    const mid = i % 2 === 0;
    const r0 = R - (major ? 18 : mid ? 13 : 9);
    const hot = i / 32 >= REDLINE;
    g.strokeStyle = hot ? '#ff4a3f' : major ? '#e6ebf1' : mid ? '#a2adba' : '#5d6977';
    g.lineWidth = major ? 3.2 : mid ? 2 : 1.4;
    g.beginPath();
    g.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
    g.lineTo(Math.cos(a) * (R - 2), Math.sin(a) * (R - 2));
    g.stroke();
  }
  g.font = mono(700, 20);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (let n = 0; n <= 8; n++) {
    const a = A0 + (SWEEP * n) / 8;
    g.fillStyle = n >= 7 ? '#ff6a5e' : '#c3ccd6';
    g.fillText(String(n), Math.cos(a) * (R - 38), Math.sin(a) * (R - 38));
  }
  g.font = mono(600, 16);
  g.fillStyle = '#9aa4b0';
  g.fillText('x1000 rpm', 0, 74);
  // the needle: a narrow taper with a shadow on the face and a thin highlight along its length
  g.save();
  g.rotate(A0 + SWEEP * r);
  const needle = (dx, dy, fill) => {
    g.fillStyle = fill;
    g.beginPath();
    g.moveTo(-16 + dx, -3.4 + dy);
    g.lineTo(R - 8 + dx, -1 + dy);
    g.lineTo(R - 8 + dx, 1 + dy);
    g.lineTo(-16 + dx, 3.4 + dy);
    g.closePath();
    g.fill();
  };
  needle(1.5, 2.5, 'rgba(0, 0, 0, 0.5)');
  needle(0, 0, '#ff4a3f');
  g.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  g.lineWidth = 0.9;
  g.beginPath();
  g.moveTo(-6, -1.1);
  g.lineTo(R - 10, -0.4);
  g.stroke();
  g.restore();
  // the hub: a machined cap with a lit rim and a dark centre
  const hub = g.createRadialGradient(-3, -4, 1, 0, 0, 14);
  hub.addColorStop(0, '#5c6672');
  hub.addColorStop(1, '#12161c');
  g.fillStyle = hub;
  g.beginPath();
  g.arc(0, 0, 13, 0, Math.PI * 2);
  g.fill();
  g.strokeStyle = 'rgba(0, 0, 0, 0.8)';
  g.lineWidth = 2;
  g.stroke();
  g.strokeStyle = 'rgba(255, 255, 255, 0.22)';
  g.lineWidth = 1;
  g.beginPath();
  g.arc(0, 0, 11.5, Math.PI * 1.05, Math.PI * 1.75);
  g.stroke();
  g.fillStyle = '#0a0d11';
  g.beginPath();
  g.arc(0, 0, 4.5, 0, Math.PI * 2);
  g.fill();
  g.restore();
}

// Shift lights: eight indicators from 62% of the arc in 4% steps. `lit` is how many are on at this rpm; those at 82% and above
// (the last three) sit inside the redline zone and are red. One source for the drawing and the test, so they cannot drift apart.
export const LEDS = 8;
export const LED_FROM = 0.62;
export const LED_STEP = 0.04;
export const ledAt = (i) => LED_FROM + LED_STEP * i;
export const ledRed = (i) => ledAt(i) >= REDLINE;
export const lit = (rpm) => Array.from({ length: LEDS }, (_, i) => rpm >= ledAt(i)).filter(Boolean).length;
