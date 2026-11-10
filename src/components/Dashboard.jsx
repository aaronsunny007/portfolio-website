import { useEffect, useRef } from 'react';
import { view } from '../three/journey';
import { LEDS, ledRed, lit, drawTach, mono } from './tach';

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

// Shift lights (thresholds in tach.js): eight small indicators along the top of the digital panel, following the needle's rpm.
// A shift drops the rpm, and they go out with it.
const BOOT_S = 0.9; // the one power-on sequence: the faces come up and the lights run across once
const FLASH_S = 0.22; // a gear change: the new digit settles in

const shape = (g, x, y, w, h, r, fill, stroke, lw = 1) => {
  rrect(g, x, y, w, h, r);
  if (fill) {
    g.fillStyle = fill;
    g.fill();
  }
  if (stroke) {
    g.strokeStyle = stroke;
    g.lineWidth = lw;
    g.stroke();
  }
};

// one frame of the cluster: satin housing, two recessed faces (analogue left, digital right), a lens reflection over each
function drawCluster(g, rpm, gear, kmh, fx) {
  const { flash, boot } = fx;
  g.clearRect(0, 0, W, H);
  // outer housing
  const hs = g.createLinearGradient(0, 0, 0, H);
  hs.addColorStop(0, '#232a34');
  hs.addColorStop(0.45, '#141920');
  hs.addColorStop(1, '#0a0d11');
  shape(g, 3, 3, W - 6, H - 6, 22, hs);
  const rim = g.createLinearGradient(0, 0, 0, H);
  rim.addColorStop(0, 'rgba(200, 212, 226, 0.55)');
  rim.addColorStop(0.5, 'rgba(150, 165, 180, 0.12)');
  rim.addColorStop(1, 'rgba(0, 0, 0, 0.7)');
  shape(g, 3, 3, W - 6, H - 6, 22, null, rim, 2);
  // the faces
  const dial = g.createRadialGradient(168, 118, 10, 168, 122, 106);
  dial.addColorStop(0, '#0c1016');
  dial.addColorStop(1, '#04060a');
  g.fillStyle = dial;
  g.beginPath();
  g.arc(168, 122, 107, 0, Math.PI * 2);
  g.fill();
  shape(g, 292, 22, 334, 196, 14, '#03050a');
  // the tachometer's inset bezel: a graphite ring, a dark seat inside it, a lit lower lip
  const ring = g.createLinearGradient(100, 16, 236, 228);
  ring.addColorStop(0, '#46505c');
  ring.addColorStop(0.5, '#1a1f26');
  ring.addColorStop(1, '#2f3741');
  g.strokeStyle = ring;
  g.lineWidth = 4;
  g.beginPath();
  g.arc(168, 122, 106, 0, Math.PI * 2);
  g.stroke();
  g.strokeStyle = 'rgba(0, 0, 0, 0.85)';
  g.lineWidth = 1.5;
  g.beginPath();
  g.arc(168, 122, 103.2, 0, Math.PI * 2);
  g.stroke();
  // the digital panel's recess: a shadow under its upper lip and a faint lit lower edge
  const rec = g.createLinearGradient(0, 22, 0, 52);
  rec.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
  rec.addColorStop(1, 'rgba(0, 0, 0, 0)');
  shape(g, 292, 22, 334, 196, 14, rec);
  shape(g, 292, 22, 334, 196, 14, null, 'rgba(255, 255, 255, 0.09)', 1.5);
  g.strokeStyle = 'rgba(255, 255, 255, 0.07)'; // the divider between the gear and the speed
  g.lineWidth = 1;
  g.beginPath();
  g.moveTo(470.5, 66);
  g.lineTo(470.5, 196);
  g.stroke();

  drawTach(g, 168, 122, rpm);

  // shift lights, lit by the rpm; during the power-on they run across once instead
  const x0 = 459 - (LEDS * 16 + (LEDS - 1) * 6) / 2;
  for (let i = 0; i < LEDS; i++) {
    const run = boot < 1 ? boot * (LEDS + 3) - i : -1;
    const on = boot < 1 ? run > 0 && run < 3 : i < lit(rpm);
    shape(g, x0 + i * 22, 31, 16, 7, 2, on ? (ledRed(i) ? '#ff3b30' : '#dcebff') : '#10151c', on ? null : 'rgba(255, 255, 255, 0.06)');
  }

  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillStyle = '#9aa4b0';
  g.font = mono(700, 18);
  g.fillText('GEAR', 392, 57);
  // the gear: a change settles in (a little larger and dimmer, then home); nothing in between is ever shown
  g.save();
  g.translate(392, 132);
  g.scale(1 + 0.07 * flash, 1 + 0.07 * flash);
  g.fillStyle = `rgba(244, 246, 248, ${(1 - 0.5 * flash).toFixed(2)})`;
  g.font = mono(700, 130);
  g.fillText(gear ? String(gear) : 'N', 0, 0);
  g.restore();
  // the speed: fixed-pitch digits right-aligned in the panel, the unused leading zeros dimmed
  g.font = mono(700, 72);
  g.textAlign = 'left';
  const cw = g.measureText('0').width;
  const txt = String(kmh).padStart(3, '0');
  const lead = txt.length - String(kmh).length;
  for (let i = 0; i < txt.length; i++) {
    g.fillStyle = i < lead ? '#3b434d' : '#f4f6f8';
    g.fillText(txt[i], 616 - (txt.length - i) * cw, 118);
  }
  g.textAlign = 'right';
  g.fillStyle = '#9aa4b0';
  g.font = mono(600, 20);
  g.fillText('km/h', 616, 170);

  // the lens: a faint edge reflection along the top of each face, kept clear of the numerals
  g.save();
  g.beginPath();
  g.arc(168, 122, 103, 0, Math.PI * 2);
  g.clip();
  const lensA = g.createLinearGradient(80, 20, 190, 120);
  lensA.addColorStop(0, 'rgba(255, 255, 255, 0.06)');
  lensA.addColorStop(1, 'rgba(255, 255, 255, 0)');
  g.fillStyle = lensA;
  g.fillRect(40, 10, 260, 120);
  g.restore();
  g.strokeStyle = 'rgba(255, 255, 255, 0.13)';
  g.lineWidth = 1.5;
  g.beginPath();
  g.arc(168, 122, 98, Math.PI * 1.12, Math.PI * 1.5);
  g.stroke();
  g.save();
  rrect(g, 292, 22, 334, 196, 14);
  g.clip();
  const lensB = g.createLinearGradient(292, 22, 400, 120);
  lensB.addColorStop(0, 'rgba(255, 255, 255, 0.055)');
  lensB.addColorStop(1, 'rgba(255, 255, 255, 0)');
  g.fillStyle = lensB;
  g.fillRect(292, 22, 334, 70);
  g.restore();
  if (boot < 1) {
    // the faces come up from dark during the power-on
    g.fillStyle = `rgba(4, 6, 10, ${(0.8 * (1 - boot)).toFixed(2)})`;
    rrect(g, 8, 8, W - 16, H - 16, 18);
    g.fill();
  }
}

export default function Dashboard() {
  const root = useRef();
  const cv = useRef();

  useEffect(() => {
    const el = root.current;
    const g = cv.current.getContext('2d');
    g.setTransform(SCALE, 0, 0, SCALE, 0, 0); // not scale(): the effect can run twice
    const st = { key: '', rpm: 0.16, gear: 0, sp: 0, flash: 0, boot: matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : 0 }; // reduced motion: no power-on sequence, fully lit
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
      if (gear !== st.gear) st.flash = 1;
      st.gear = gear;
      st.flash = Math.max(0, st.flash - dt / FLASH_S);
      if (view.cock > 0.1 && st.boot < 1) {
        st.bootAt ??= performance.now(); // wall clock, so a slow frame cannot stretch it; once: it does not start again
        st.boot = Math.min(1, (performance.now() - st.bootAt) / (BOOT_S * 1000));
      }
      const lo = gear ? GEAR_AT[gear - 1] : 0;
      const hi = gear ? GEAR_AT[gear] : 1;
      const target = gear ? 0.3 + 0.62 * Math.min(1, Math.max(0, (sp - lo) / (hi - lo))) : 0.16;
      st.rpm += (target - st.rpm) * (dt ? Math.min(1, dt * 9) : 1);
      const kmh = Math.round(sp * 150);
      const key = `${Math.round(st.rpm * 80)}|${gear}|${kmh}|${Math.round(st.flash * 8)}|${Math.round(st.boot * 24)}`;
      if (key !== st.key) {
        st.key = key;
        drawCluster(g, st.rpm, gear, kmh, st);
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
        <path d="M0,108 C230,90 380,14 500,14 C620,14 770,90 1000,108 L1000,160 L0,160 Z" fill="url(#dash-hood)" />
        <path d="M0,108 C230,90 380,14 500,14 C620,14 770,90 1000,108" fill="none" stroke="rgba(58, 143, 208, 0.38)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        {/* the dashboard, with the binnacle rising in the middle */}
        <path d="M0,128 C200,124 330,100 392,46 C412,40 440,34 480,34 L520,34 C560,34 588,40 608,46 C670,100 800,124 1000,128 L1000,160 L0,160 Z" fill="#05070a" />
        <path d="M0,128 C200,124 330,100 392,46 C412,40 440,34 480,34 L520,34 C560,34 588,40 608,46 C670,100 800,124 1000,128" fill="none" stroke="rgba(150, 165, 180, 0.3)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="dash-cluster">
        <canvas ref={cv} width={W * SCALE} height={H * SCALE} />
      </div>
    </div>
  );
}
