import { useCallback, useEffect, useState } from 'react';
import StylisedDriver from './Driver';
import RealDriver from './RealDriver';

const BASE = import.meta.env.BASE_URL;

/*
  Drop-in avatar files (see README → "Your realistic avatar"):
    public/models/sunny.glb           the rigged avatar (required for the realistic version)
    public/models/anims/walk.(fbx|glb) a walk animation (Mixamo FBX is fine)
    public/models/anims/lean.(fbx|glb) optional: a lean/idle animation; otherwise the lean is posed automatically
  Dev override: ?avatar=<url>&walk=<url>&lean=<url>
*/

async function exists(url) {
  try {
    const r = await fetch(url, { method: 'HEAD' });
    const type = r.headers.get('content-type') || '';
    return r.ok && !type.includes('text/html'); // dev servers answer missing files with index.html
  } catch {
    return false;
  }
}

async function first(urls) {
  for (const u of urls) if (await exists(u)) return u;
  return null;
}

async function resolveAvatar() {
  const q = new URLSearchParams(window.location.search);
  const at = (p) => (/^(https?:)?\//.test(p) ? p : BASE + p);
  const model = q.get('avatar') ? at(q.get('avatar')) : await first([`${BASE}models/sunny.glb`]);
  if (!model) return null;
  const walk = q.get('walk') ? at(q.get('walk')) : await first([`${BASE}models/anims/walk.fbx`, `${BASE}models/anims/walk.glb`]);
  const lean = q.get('lean') ? at(q.get('lean')) : await first([`${BASE}models/anims/lean.fbx`, `${BASE}models/anims/lean.glb`]);
  return { model, walk, lean };
}

export default function SunnyDriver() {
  const [cfg, setCfg] = useState(undefined); // undefined: checking · null: no avatar · object: avatar files
  useEffect(() => {
    resolveAvatar().then(setCfg);
  }, []);
  const fail = useCallback(() => setCfg(null), []);
  if (cfg === undefined) return null;
  if (cfg === null) return <StylisedDriver />;
  return <RealDriver cfg={cfg} onFail={fail} />;
}
