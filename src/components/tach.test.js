// Run with: node --test src/components/tach.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { LEDS, REDLINE, lit, ledAt, ledRed } from './tach.js';

test('idle and a gear\'s early climb light nothing', () => {
  assert.equal(lit(0.16), 0);
  assert.equal(lit(0.3), 0);
  assert.equal(lit(0.61), 0);
});

test('the lights come on in order as rpm rises, and all are lit at the top of a gear', () => {
  let prev = 0;
  for (let r = 0; r <= 1; r += 0.01) {
    const n = lit(r);
    assert.ok(n >= prev, 'never fewer lights at higher rpm');
    prev = n;
  }
  assert.equal(lit(0.92), LEDS); // the highest rpm a gear reaches in the dashboard
});

test('exactly the lights inside the redline zone are red, and they are the last ones', () => {
  const red = Array.from({ length: LEDS }, (_, i) => ledRed(i));
  assert.deepEqual(red, [false, false, false, false, false, true, true, true]);
  assert.ok(ledAt(4) < REDLINE && ledAt(5) >= REDLINE);
});
