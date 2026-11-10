import { toolkit } from '../content/profile.js';
import { evidenceProject } from '../content/projects.js';

// The toolkit as the console reads it: groups, each with tools, each tool with the real projects it was used in.
// An alias that matches no project is dropped here, and toolkit.test.js fails if any ever is.
export const buildGroups = (kit = toolkit, find = evidenceProject) =>
  kit.map((g) => ({ group: g.group, tools: g.tools.map(([name, used]) => ({ name, projects: used.split(', ').map(find).filter(Boolean) })) }));

// The first group opens on its first tool (Python), and a new group always opens on its own first tool, so evidence can never be stale.
export const START = { g: 0, t: 0 };
export const pickGroup = (g) => ({ g, t: 0 });
export const pickTool = (sel, t) => ({ g: sel.g, t });
export const current = (groups, sel) => groups[sel.g].tools[sel.t];
