// Run with: node --test src/components/ignition.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { needleAt, nextPercent, IDLE, SWEEP_END } from './ignition.js';

test('the sweep goes up once, comes back to idle and stays there', () => {
  let peak = 0;
  for (let t = 0; t <= SWEEP_END; t += 0.01) peak = Math.max(peak, needleAt(t));
  assert.ok(peak > 0.99 && peak <= 1);
  assert.equal(needleAt(SWEEP_END), IDLE);
  assert.equal(needleAt(60), IDLE); // no second revolution however long loading takes
});

test('after the peak the needle only falls', () => {
  let prev = 1;
  for (let t = 0.45; t <= SWEEP_END; t += 0.01) {
    const v = needleAt(t);
    assert.ok(v <= prev + 1e-9);
    prev = v;
  }
});

test('loading percent never goes backwards and ignores garbage', () => {
  let p = 0;
  for (const raw of [20, 97, 0, NaN, 50, undefined, 100, 3]) {
    const n = nextPercent(p, raw);
    assert.ok(n >= p);
    p = n;
  }
  assert.equal(p, 100);
});
