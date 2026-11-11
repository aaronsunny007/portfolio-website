import * as data from '../content/toolkit.js';
import { projectBySlug } from '../content/projects.js';

// The toolkit as the console reads it. Pure functions, no React: the section only renders what these return.
// buildKit resolves every relationship by slug and reports (never hides) anything that does not resolve, so
// toolkit.test.js can fail on a broken mapping instead of the page showing a dead link.

const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/['’]/g, '').replace(/[^a-z0-9.+# ]+/g, ' ').replace(/\s+/g, ' ').trim();

const LEAD = { dataset: 'Evaluation data in', evaluated: 'Evaluated in', target: 'Test target in', method: 'Applied in' };
// One kind across every use names that relationship ("Used in" for ordinary use); mixed kinds say "related" and each project row carries its own label.
const leadFor = (uses) => {
  const k = uses[0].kind;
  return uses.every((x) => x.kind === k) ? LEAD[k] ?? 'Used in' : null;
};
const projectsOf = (n) => `${n} ${n === 1 ? 'project' : 'projects'}`;
export const countLabel = (tool) => (tool.lead ? `${tool.lead} ${projectsOf(tool.count)}` : `${tool.count} related ${tool.count === 1 ? 'project' : 'projects'}`);

export function buildKit(src = data, find = (slug) => projectBySlug(slug) ?? src.supportProjects[slug]) {
  const errors = [];
  const groups = src.groups.map((g) => ({ id: g.id, name: g.name, subtitle: g.subtitle, sections: g.sections.map(([id, label]) => ({ id, label, tools: [] })), tools: [], featured: [], key: norm(`${g.name} ${g.subtitle}`) }));
  const byGroup = Object.fromEntries(groups.map((g) => [g.id, g]));
  const byId = {};
  for (const t of src.tools) {
    const g = byGroup[t.group];
    const sec = g?.sections.find((s) => s.id === t.section);
    if (!g || !sec) { errors.push(`${t.id}: unknown group/section ${t.group}/${t.section}`); continue; }
    if (byId[t.id]) { errors.push(`${t.id}: duplicate id`); continue; }
    const seen = new Set();
    const uses = [];
    for (const x of t.uses) {
      const project = find(x.p);
      if (!project) errors.push(`${t.id}: unknown project ${x.p}`);
      else if (seen.has(x.p)) errors.push(`${t.id}: ${x.p} listed twice`);
      else if (!src.KINDS[x.kind]) errors.push(`${t.id}: unknown kind ${x.kind}`);
      else { seen.add(x.p); uses.push({ project, kind: x.kind, note: x.note }); }
    }
    if (!uses.length) { errors.push(`${t.id}: no evidence`); continue; }
    const tool = { id: t.id, name: t.name, group: t.group, section: t.section, type: t.type, featured: !!t.featured, aliases: t.aliases ?? [], uses, count: uses.length, lead: leadFor(uses) };
    tool.key = { name: norm(t.name), aliases: tool.aliases.map(norm), projects: uses.map((x) => norm(`${x.project.title} ${x.project.slug}`)) };
    byId[t.id] = tool;
    g.tools.push(tool);
    sec.tools.push(tool);
    if (tool.featured) g.featured.push(tool);
  }
  const names = new Set();
  for (const t of Object.values(byId)) {
    const n = norm(t.name);
    if (names.has(n)) errors.push(`${t.id}: duplicate name ${t.name}`);
    names.add(n);
  }
  return { groups, byGroup, byId, errors };
}

export const KIT = buildKit();

// ---- selection ----
// state: { group, tool, project, open } where open maps a group id to "showing every tool". Every transition lands on a
// real tool and a real project of that tool, so evidence can never be stale.
const firstTool = (g) => (g.featured[0] ?? g.tools[0]).id;
export const start = (kit = KIT) => ({ group: kit.groups[0].id, tool: firstTool(kit.groups[0]), project: null, open: {} });
export const pickGroup = (kit, st, id) => (id === st.group ? st : { ...st, group: id, tool: firstTool(kit.byGroup[id]), project: null });
export const pickTool = (st, id) => (id === st.tool ? st : { ...st, tool: id, project: null });
export const pickProject = (st, slug) => ({ ...st, project: slug });
// A search result may be a tool the collapsed group hides: open that group so the selection is visible.
export const pickResult = (kit, st, id) => {
  const t = kit.byId[id];
  const open = t.featured ? st.open : { ...st.open, [t.group]: true };
  return { ...st, group: t.group, tool: id, project: null, open };
};
// Collapsing must not strand the selection on a hidden tool.
export const toggleOpen = (kit, st) => {
  const g = kit.byGroup[st.group];
  const open = { ...st.open, [g.id]: !st.open[g.id] };
  const hidden = !open[g.id] && !kit.byId[st.tool].featured;
  return { ...st, open, ...(hidden ? { tool: firstTool(g), project: null } : null) };
};

// What the console shows for the current state. An unknown project falls back to the tool's first, never to an empty panel.
export function view(kit, st) {
  const group = kit.byGroup[st.group];
  const tool = kit.byId[st.tool];
  const use = tool.uses.find((x) => x.project.slug === st.project) ?? tool.uses[0];
  const expanded = !!st.open[group.id];
  const shown = expanded ? group.tools : group.featured;
  return { group, tool, use, expanded, shown, hiddenCount: group.tools.length - group.featured.length, sections: expanded ? group.sections.filter((s) => s.tools.length) : null };
}

// ---- search ----
export const MAX_RESULTS = 12;
export function search(kit, q) {
  const qn = norm(q);
  if (!qn) return { items: [], total: 0 };
  const rows = [];
  for (const t of Object.values(kit.byId)) {
    const k = t.key;
    let rank = 9;
    let context = null;
    if (k.name === qn) rank = 0;
    else if (k.name.startsWith(qn)) rank = 1;
    else if (k.aliases.includes(qn)) rank = 2;
    else if (k.name.includes(qn) || k.aliases.some((a) => a.startsWith(qn))) rank = 3;
    else if (qn.length > 2 && kit.byGroup[t.group].key.includes(qn)) rank = 4;
    else if (qn.length > 2) {
      const i = k.projects.findIndex((p) => p.includes(qn));
      if (i >= 0) { rank = 5; context = t.uses[i].project.title; }
    }
    if (rank < 9) rows.push({ tool: t, rank, context });
  }
  rows.sort((a, b) => a.rank - b.rank || b.tool.featured - a.tool.featured || a.tool.name.localeCompare(b.tool.name));
  return { items: rows.slice(0, MAX_RESULTS), total: rows.length };
}
