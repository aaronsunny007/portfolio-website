import test from 'node:test';
import assert from 'node:assert/strict';
import { PHOTO, SHOULDER, coverPoint, markGeometry } from './portraitMark.js';

const near = (a, b, e = 0.6) => assert.ok(Math.abs(a - b) <= e, `${a} is not within ${e} of ${b}`);

test('a box with the photo\'s own proportions maps the landmark by plain scaling', () => {
  const p = coverPoint({ w: 1608, h: 900 }, 0.7, 0.3);
  near(p.x, SHOULDER.x * 1608);
  near(p.y, SHOULDER.y * 900);
});

test('a taller box crops the sides and the landmark follows the object position', () => {
  const box = { w: 390, h: 523 };
  const p = coverPoint(box, 0.87, 0.3);
  const s = 523 / PHOTO.h;
  near(p.s, s, 1e-9);
  near(p.x, (390 - PHOTO.w * s) * 0.87 + SHOULDER.x * PHOTO.w * s);
  // the shoulder stays inside the crop on every phone width we ship
  for (const w of [360, 390, 412, 768]) {
    const q = coverPoint({ w, h: Math.max(340, 0.62 * (w < 500 ? 800 : 1024)) }, w <= 480 ? 0.87 : 0.8, 0.3);
    assert.ok(q.x > 0 && q.x < w, `shoulder x ${q.x} outside ${w}`);
  }
});

test('the arrow stops short of the shoulder and the tab stays on screen', () => {
  for (const [box, narrow, limitX] of [
    [{ w: 1608, h: 868 }, false, 1480],
    [{ w: 1287, h: 700 }, false, 1330],
    [{ w: 390, h: 523 }, true, 390],
    [{ w: 360, h: 496 }, true, 360],
  ]) {
    const g = markGeometry(box, narrow ? 0.87 : 0.7, 0.3, { narrow, limitX });
    const gap = Math.hypot(g.tip.x - g.shoulder.x, g.tip.y - g.shoulder.y);
    near(gap, 8, 0.3);
    assert.ok(g.tab.x + g.tab.w <= limitX - 10, `tab leaves the screen at ${box.w}`);
    assert.ok(g.tab.x > g.shoulder.x, 'the tab is to the right of the shoulder');
    assert.ok(g.tab.y >= 0, 'the tab is not above the photo');
    assert.match(g.line, /^M[\d. ]+ L[\d. ]+ L[\d. ]+$/);
  }
});
