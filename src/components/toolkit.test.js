// Run with: node --test src/components/toolkit.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import { toolkit } from '../content/profile.js';
import { buildGroups, START, pickGroup, pickTool, current } from './toolkit.js';

const groups = buildGroups();

test('every tool keeps every project it names: nothing is dropped, counts match the data', () => {
  assert.equal(groups.length, toolkit.length);
  toolkit.forEach((g, gi) =>
    g.tools.forEach(([name, used], ti) => {
      const t = groups[gi].tools[ti];
      assert.equal(t.name, name);
      assert.equal(t.projects.length, used.split(', ').length, `${name} lost a project`);
    })
  );
});

test('the console opens on Python, with its three projects', () => {
  assert.equal(current(groups, START).name, 'Python');
  assert.deepEqual(current(groups, START).projects.map((p) => p.slug), ['warden', 'ledger', 'financial-nrf']);
});

test('changing group always lands on that group’s own first tool, never a stale one', () => {
  let sel = pickTool(START, 3); // LLM APIs
  groups.forEach((g, gi) => {
    sel = pickGroup(gi);
    assert.equal(current(groups, sel).name, g.tools[0].name);
  });
});
