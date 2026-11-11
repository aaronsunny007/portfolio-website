// Run with: node --test src/three/timeline.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { T, revealAt, titleMotion } from './timeline.js';

test('the photo is covered until the reveal beat and fully uncovered at its end', () => {
  assert.equal(revealAt(0), 0);
  assert.equal(revealAt(T.reveal), 0);
  assert.equal(revealAt(T.reveal + T.revealLen), 1);
  assert.equal(revealAt(60), 1);
});

test('the reveal only ever advances with the clock', () => {
  let prev = 0;
  for (let t = 0; t <= T.end; t += 0.01) {
    const v = revealAt(t);
    assert.ok(v >= prev && v >= 0 && v <= 1);
    prev = v;
  }
});

test('the beats are in order and the photo is fully uncovered before the opening ends', () => {
  assert.ok(T.driftStart < T.reveal && T.reveal < T.title && T.title < T.ui && T.ui < T.end);
  assert.ok(T.title + T.titleLen <= T.end);
  assert.ok(T.reveal + T.revealLen <= T.end);
});

test('the name waits for the drift, arrives from deeper and yawed, and rests exactly at its place', () => {
  const before = titleMotion(T.title - 0.5);
  assert.equal(before.p, 0);
  assert.equal(before.opacity, 0);
  const start = titleMotion(T.title);
  assert.ok(start.z < -100 && start.yaw > 0.3);
  const rest = titleMotion(T.title + T.titleLen);
  for (const k of ['z', 'x', 'yaw', 'pitch']) assert.ok(Math.abs(rest[k]) < 1e-6, k);
  assert.equal(rest.opacity, 1);
  assert.equal(titleMotion(99).p, 1);
});

test('the name only moves towards the viewer until the final settle, and its light sweep stays inside the name', () => {
  let z = -Infinity;
  for (let t = T.title; t <= T.title + T.titleLen * 0.78; t += 0.01) {
    const m = titleMotion(t);
    assert.ok(m.z >= z);
    z = m.z;
  }
  for (let t = 0; t <= T.end; t += 0.01) {
    const m = titleMotion(t);
    assert.ok(m.sweep >= 0 && m.sweep <= 1 && m.edge >= 0.44 && m.edge <= 1.36);
    assert.ok(Math.abs(m.yaw) <= 0.62 + 1e-9);
  }
});
