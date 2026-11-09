import { useEffect, useRef } from 'react';
import { view } from '../three/journey';

// The instrument cluster and the foot of the windshield view: the hood's edge and the dashboard, with the tachometer, gear and speed.
// It is the one thing in front of the page, so copy scrolls up behind it instead of across the gauges, and the cards stop above it.
// Gears and the tachometer follow how fast the scene is moving: the needle climbs through each gear, drops at each shift, and settles
// to idle with the car at rest (N). Nothing here is random, and nothing runs on its own clock: the night scene's frame loop calls draw().
const GEAR_AT = [0.02, 0.17, 0.33, 0.5, 0.68, 0.86, 1.01]; // speed (0..1) at which each of the six gears starts and ends
const W = 640;
const H = 240;
const SCALE = 1.5;

const rrect = (g, x, y, w, h, r) => {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
};

function drawCluster(g, rpm, gear, kmh) {
  const mono = (w, px) => `${w} ${px}px "JetBrains Mono", monospace`;
  g.clearRect(0, 0, W, H);
  g.fillStyle = 'rgba(6, 8, 11, 0.96)';
  rrect(g, 4, 4, W - 8, H - 8, 22);
  g.fill();
  g.strokeStyle = 'rgba(150, 165, 180, 0.45)';
  g.lineWidth = 2;
  g.stroke();
  // the tachometer: a 270 degree arc, a red zone, ticks, numbers 0 to 8 (x1000), and a needle
  const cx = 168;
  const cy = 122;
  const R = 96;
  const a0 = 0.75 * Math.PI;
  const sweep = 1.5 * Math.PI;
  g.lineCap = 'butt';
  g.strokeStyle = 'rgba(255, 59, 48, 0.8)';
  g.lineWidth = 8;
  g.beginPath();
  g.arc(cx, cy, R + 3, a0 + sweep * 0.8125, a0 + sweep);
  g.stroke();
  for (let i = 0; i <= 32; i++) {
    const a = a0 + (sweep * i) / 32;
    const major = i % 4 === 0;
    g.strokeStyle = major ? '#e6ebf1' : '#6c7886';
    g.lineWidth = major ? 3.5 : 1.8;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * (R - (major ? 18 : 10)), cy + Math.sin(a) * (R - (major ? 18 : 10)));
    g.lineTo(cx + Math.cos(a) * (R - 2), cy + Math.sin(a) * (R - 2));
    g.stroke();
  }
  g.fillStyle = '#c3ccd6';
  g.font = mono(700, 20);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  for (let n = 0; n <= 8; n++) {
    const a = a0 + (sweep * n) / 8;
    g.fillText(String(n), cx + Math.cos(a) * (R - 38), cy + Math.sin(a) * (R - 38));
  }
  g.font = mono(600, 16);
  g.fillStyle = '#9aa4b0';
  g.fillText('x1000 rpm', cx, cy + 74);
  const a = a0 + sweep * Math.min(1, Math.max(0, rpm));
  g.strokeStyle = '#ff4a3f';
  g.lineWidth = 5;
  g.lineCap = 'round';
  g.beginPath();
  g.moveTo(cx - Math.cos(a) * 14, cy - Math.sin(a) * 14);
  g.lineTo(cx + Math.cos(a) * (R - 10), cy + Math.sin(a) * (R - 10));
  g.stroke();
  g.fillStyle = '#0f131a';
  g.strokeStyle = '#6a7684';
  g.lineWidth = 3;
  g.beginPath();
  g.arc(cx, cy, 11, 0, Math.PI * 2);
  g.fill();
  g.stroke();
  // the gear, large, and the speed
  g.fillStyle = '#9aa4b0';
  g.font = mono(700, 18);
  g.fillText('GEAR', 392, 46);
  g.fillStyle = '#f4f6f8';
  g.font = mono(700, 130);
  g.fillText(gear ? String(gear) : 'N', 392, 132);
  g.textAlign = 'right';
  g.font = mono(700, 72);
  g.fillText(String(kmh).padStart(3, '0'), 616, 118);
  g.fillStyle = '#9aa4b0';
  g.font = mono(600, 20);
  g.fillText('km/h', 616, 170);
}

export default function Dashboard() {
  const root = useRef();
  const cv = useRef();

  useEffect(() => {
    const el = root.current;
    const g = cv.current.getContext('2d');
    g.setTransform(SCALE, 0, 0, SCALE, 0, 0); // not scale(): the effect can run twice
    const st = { key: '', rpm: 0.16, gear: 0, sp: 0 };
    // the cards stop above it: tell the scene how much of the screen it takes
    const size = () => (view.dashH = el.offsetHeight);
    size();
    const ro = new ResizeObserver(size);
    ro.observe(el);

    const draw = (dtRaw = 0) => {
      const dt = Math.min(dtRaw, 0.05);
      // the readout eases toward the scene's speed, so the number, the gear and the needle move together and never flicker
      st.sp += (view.speed - st.sp) * (dt ? Math.min(1, dt * 8) : 1);
      const sp = st.sp;
      // pick the gear with a little hysteresis, so it does not chatter at a boundary
      let gear = st.gear;
      if (sp < 0.012) gear = 0;
      else {
        if (!gear) gear = 1;
        while (gear < 6 && sp > GEAR_AT[gear] + 0.015) gear++;
        while (gear > 1 && sp < GEAR_AT[gear - 1] - 0.015) gear--;
      }
      st.gear = gear;
      const lo = gear ? GEAR_AT[gear - 1] : 0;
      const hi = gear ? GEAR_AT[gear] : 1;
      const target = gear ? 0.3 + 0.62 * Math.min(1, Math.max(0, (sp - lo) / (hi - lo))) : 0.16;
      st.rpm += (target - st.rpm) * (dt ? Math.min(1, dt * 9) : 1);
      const kmh = Math.round(sp * 150);
      const key = `${Math.round(st.rpm * 80)}|${gear}|${kmh}`;
      if (key !== st.key) {
        st.key = key;
        drawCluster(g, st.rpm, gear, kmh);
      }
      // it rises from below the screen as the hero leaves (opaque throughout, so copy never shows through the gauges)
      el.style.transform = `translateY(${((1 - view.cock) * 101).toFixed(2)}%)`;
    };
    view.dash = draw;
    draw(0);
    document.fonts?.ready.then(() => {
      st.key = '';
      draw(0); // draw again once the mono face is in
    });
    return () => {
      view.dash = null;
      view.dashH = 0;
      ro.disconnect();
    };
  }, []);

  return (
    <div className="dash" ref={root} aria-hidden="true">
      <svg className="dash-body" viewBox="0 0 1000 160" preserveAspectRatio="none">
        <defs>
          <linearGradient id="dash-hood" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d1117" />
            <stop offset="1" stopColor="#07090d" />
          </linearGradient>
        </defs>
        {/* the upper edge of the hood, a little lighter, with the street's neon on its rim */}
        <path d="M0,46 C220,22 380,14 500,14 C620,14 780,22 1000,46 L1000,160 L0,160 Z" fill="url(#dash-hood)" />
        <path d="M0,46 C220,22 380,14 500,14 C620,14 780,22 1000,46" fill="none" stroke="rgba(58, 143, 208, 0.38)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {/* the dashboard, with the binnacle rising in the middle */}
        <path d="M0,78 C200,70 330,66 392,46 C412,40 440,34 480,34 L520,34 C560,34 588,40 608,46 C670,66 800,70 1000,78 L1000,160 L0,160 Z" fill="#05070a" />
        <path d="M0,78 C200,70 330,66 392,46 C412,40 440,34 480,34 L520,34 C560,34 588,40 608,46 C670,66 800,70 1000,78" fill="none" stroke="rgba(150, 165, 180, 0.3)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="dash-cluster">
        <canvas ref={cv} width={W * SCALE} height={H * SCALE} />
      </div>
    </div>
  );
}
