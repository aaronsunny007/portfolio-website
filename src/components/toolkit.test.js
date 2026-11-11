// Run with: node --test src/components/toolkit.test.js
import test from 'node:test';
import assert from 'node:assert/strict';
import * as data from '../content/toolkit.js';
import { projects } from '../content/projects.js';
import { KIT, buildKit, start, pickGroup, pickTool, pickProject, pickResult, toggleOpen, view, search, countLabel, MAX_RESULTS } from './toolkit.js';

const norm = (s) => s.toLowerCase();

test('the data resolves: every project slug is real, no duplicates, nothing without evidence', () => {
  assert.deepEqual(KIT.errors, []);
  assert.equal(Object.keys(KIT.byId).length, data.tools.length);
});

test('each technology exists once, by id and by name', () => {
  const ids = data.tools.map((t) => t.id);
  const names = data.tools.map((t) => norm(t.name));
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(new Set(names).size, names.length);
});

test('every group opens on a small curated set and keeps the rest reachable', () => {
  for (const g of KIT.groups) {
    assert.ok(g.featured.length >= 4 && g.featured.length <= 6, `${g.name} shows ${g.featured.length}`);
    assert.ok(g.tools.length > g.featured.length, `${g.name} has nothing behind Show all tools`);
  }
});

test('the toolkit leaves out what is planned, private or only declared', () => {
  const text = JSON.stringify(data.tools).toLowerCase();
  for (const bad of ['neon', 'supabase', 'ai-career-agent', 'react router', 'rl-gridworld']) assert.ok(!text.includes(bad), `${bad} should not be a toolkit entry`);
  assert.ok(!data.tools.some((t) => norm(t.name) === 'tailwind css' && t.uses.some((u) => u.p === 'portfolio')), 'this site does not import Tailwind');
});

test('private and unread repos are never an evidence destination', () => {
  const slugs = new Set(data.tools.flatMap((t) => t.uses.map((u) => u.p)));
  assert.ok(!slugs.has('rl-gridworld'));
  for (const s of slugs) assert.ok(projects.some((p) => p.slug === s) || data.supportProjects[s], `${s} has no public destination`);
});

test('Tom & Ollie stays built, not deployed, on every tool that cites it', () => {
  const uses = data.tools.flatMap((t) => t.uses.filter((u) => u.p === 'tom-and-ollie').map((u) => ({ t: t.id, note: u.note })));
  assert.ok(uses.length >= 4);
  for (const { t, note } of uses) assert.match(note, /not deployed/i, `${t} implies Tom & Ollie is live`);
});

test('a test target, benchmark or config is never labelled as shipped code', () => {
  const kind = (id, slug) => KIT.byId[id].uses.find((u) => u.project.slug === slug).kind;
  assert.equal(kind('juice-shop', 'aegis'), 'target');
  assert.equal(kind('spring-boot', 'warden'), 'target');
  assert.equal(kind('agentdojo', 'warden'), 'test');
  assert.equal(kind('terraform', 'warden'), 'infra');
  assert.equal(kind('kappa', 'llm-eval-redteam'), 'method');
  assert.equal(countLabel(KIT.byId['juice-shop']), 'Test target in 1 project');
  assert.equal(countLabel(KIT.byId.qwen), 'Evaluated in 1 project');
});

test('a tool whose projects use it in different ways says "related"; one kind names the relationship', () => {
  assert.equal(countLabel(KIT.byId.ollama), '4 related projects');
  assert.equal(countLabel(KIT.byId['github-actions']), 'Used in 8 projects');
  assert.equal(countLabel(KIT.byId.kappa), 'Applied in 1 project');
});

test('the console opens on a real tool with real evidence', () => {
  const v = view(KIT, start());
  assert.equal(v.tool.name, 'Python');
  assert.equal(countLabel(v.tool), 'Used in 4 projects');
  assert.equal(v.use.project.slug, 'warden');
});

test('a tool with several projects lists each, and picking one swaps the explanation', () => {
  let st = pickTool(start(), 'github-actions');
  const v = view(KIT, st);
  assert.equal(v.tool.uses.length, 8);
  assert.equal(new Set(v.tool.uses.map((u) => u.project.slug)).size, 8);
  st = pickProject(st, 'aegis');
  assert.equal(view(KIT, st).use.project.slug, 'aegis');
  assert.match(view(KIT, st).use.note, /Go tests/);
});

test('a tool with one project works the same way', () => {
  const v = view(KIT, pickTool(start(), 'deberta'));
  assert.equal(v.tool.uses.length, 1);
  assert.equal(v.use.project.slug, 'warden');
  assert.equal(countLabel(v.tool), 'Used in 1 project');
});

test('changing group lands on that group’s own first tool and never keeps stale evidence', () => {
  let st = pickProject(pickTool(start(), 'pytorch'), 'financial-nrf');
  for (const g of KIT.groups) {
    st = pickGroup(KIT, pickGroup(KIT, st, g.id === 'specialist' ? 'models' : 'specialist'), g.id);
    const v = view(KIT, st);
    assert.equal(v.tool.group, g.id);
    assert.equal(v.tool.id, g.featured[0].id);
    assert.equal(v.use.project.slug, v.tool.uses[0].project.slug);
  }
});

test('a project from another tool cannot leak in: unknown projects fall back to the tool’s first', () => {
  const st = { ...pickTool(start(), 'deberta'), project: 'ledger' };
  assert.equal(view(KIT, st).use.project.slug, 'warden');
});

test('search resolves an alias to its tool, group and evidence', () => {
  const { items } = search(KIT, 'k8s');
  assert.equal(items[0].tool.id, 'kind');
  const st = pickResult(KIT, start(), items[0].tool.id);
  const v = view(KIT, st);
  assert.equal(v.group.id, 'cloud');
  assert.equal(v.tool.id, 'kind');
  assert.equal(search(KIT, 'postgres').items[0].tool.id, 'postgresql');
  assert.equal(search(KIT, 'Docker-Compose').items[0].tool.id, 'docker-compose');
  assert.equal(search(KIT, 'cohens kappa').items[0].tool.id, 'kappa');
  assert.equal(search(KIT, 'three.js').items[0].tool.id, 'threejs');
});

test('search reaches tools by project name and capability group, with context', () => {
  const r = search(KIT, 'tom & ollie');
  assert.ok(r.items.length && r.items.every((x) => x.context === 'Tom & Ollie'));
  assert.ok(r.items.some((x) => x.tool.id === 'fastapi'));
  const g = search(KIT, 'safety cell');
  assert.ok(g.items.length && g.items.every((x) => x.tool.group === 'security'));
});

test('a result hidden by a collapsed group opens that group, and collapsing never strands the selection', () => {
  const hidden = KIT.byId.ray;
  assert.ok(!hidden.featured);
  let st = pickResult(KIT, start(), 'ray');
  assert.equal(view(KIT, st).expanded, true);
  assert.ok(view(KIT, st).shown.includes(hidden));
  st = toggleOpen(KIT, st);
  const v = view(KIT, st);
  assert.equal(v.expanded, false);
  assert.ok(v.shown.includes(v.tool), 'the selected tool must stay visible');
});

test('Show all tools reveals every tool of the group', () => {
  const st = toggleOpen(KIT, start());
  const v = view(KIT, st);
  assert.equal(v.shown.length, v.group.tools.length);
  assert.equal(v.sections.flatMap((s) => s.tools).length, v.group.tools.length);
});

test('no match, empty and whitespace queries return nothing, and results are capped', () => {
  assert.equal(search(KIT, 'zzzz-not-a-tool').total, 0);
  assert.equal(search(KIT, '').total, 0);
  assert.equal(search(KIT, '   ').total, 0);
  const wide = search(KIT, 'in');
  assert.ok(wide.total > MAX_RESULTS && wide.items.length === MAX_RESULTS);
});

test('clearing a search leaves the selection exactly as it was', () => {
  const st = pickTool(pickGroup(KIT, start(), 'security'), 'nmap');
  assert.deepEqual(view(KIT, st).tool.id, 'nmap'); // the query lives outside the selection, so clearing it changes nothing
});

test('a broken mapping is reported, not shown', () => {
  const bad = buildKit({ ...data, tools: [{ id: 'x', name: 'X', group: 'models', section: 'training', type: 'Tool', uses: [{ p: 'no-such-project', kind: 'implemented', note: 'n' }] }] });
  assert.equal(bad.errors.length, 2);
  assert.ok(bad.errors[0].includes('unknown project'));
});

test('portfolio evidence is limited to what this checkout uses, and links to a public destination', () => {
  const used = data.tools.filter((t) => t.uses.some((u) => u.p === 'portfolio')).map((t) => t.id).sort();
  assert.deepEqual(used, ['gsap', 'lenis', 'react', 'threejs', 'vite']);
  assert.match(data.supportProjects.portfolio.repo, /^https:\/\/github\.com\/aaronsunny007\/portfolio-website$/);
});
