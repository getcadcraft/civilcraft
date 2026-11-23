/* SPDX-License-Identifier: Apache-2.0 */
/**
 * hosts/civil.js — the CivilCraft adapter of the lighting design add-on (copied to civilcraft/dev/addons/lightdesign/host.js by tools/lightdesign/sync.mjs).
 * 0.11 SU.1816 (su-finish-11 `site-light`): site and landscape lighting for what a CivilCraft project holds. The add-on is off until the person switches it on
 * (Settings › Add-ons), as in CadCraft and BimCraft. Read-only: it never writes into the project.
 *
 *   detect(api, { t }) → the host, or null when this is not CivilCraft (no window.civilcraft.project)
 *   host.rooms() → [{ name, poly [[x, y]] mm, area m², outdoor: true, features: { trees: [{ x, y }], paths: [{ pts: [[x, y]] }], spots: [] } mm, origin: { x, y, units } }]
 *       the areas of the project, largest first, at most 60: parking lots (their outline), parcels, paving and planting beds of the Landscape workspace. Each area is in
 *       millimetres from its own lower-left corner (`origin`, in project units), so survey coordinates stay small for the picture; its features are the trees
 *       (single plants whose species is a tree in the project's plant list or CivilCraft's seed list) and the Landscape paths that come within 2 m of it, in the same frame.
 *   host.roads() → [{ name, section: { strips }, note }] (0.11 IL.10): each alignment's assembly as a road lighting cross-section (roadSections below).
 *   No draw() or erase(): the panel offers no Draw in CivilCraft (the luminaires are not CivilCraft objects yet); Report, CSV, the night view's false colour and the
 *   lamps file work. renderer: false (CivilCraft carries no path tracer), axes 'z'.
 */
const MM = { m: 1000, ft: 304.8 };
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const ptsOf = (pts) => (Array.isArray(pts) ? pts.filter((q) => q && fin(q.x) && fin(q.y)).map((q) => [q.x, q.y]) : []);
function areaOf(P) { let s = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; s += a[0] * b[1] - b[0] * a[1]; } return Math.abs(s) / 2; }
function inside(P, x, y) { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > y) !== (b[1] > y) && x < ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]) + a[0]) c = !c; } return c; }
function near(P, x, y, d) {
  if (inside(P, x, y)) return true;
  for (let i = 0; i < P.length; i++) {
    const a = P[i], b = P[(i + 1) % P.length], dx = b[0] - a[0], dy = b[1] - a[1], L = dx * dx + dy * dy || 1, u = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / L));
    if (Math.hypot(x - a[0] - u * dx, y - a[1] - u * dy) <= d) return true;
  }
  return false;
}

/** Does the open line Q come within d of the area P? (its points, and points along each segment every d / 2, at most 400 per segment) */
function touches(P, Q, d) {
  for (let i = 0; i < Q.length; i++) {
    if (near(P, Q[i][0], Q[i][1], d)) return true;
    if (i + 1 < Q.length) { const a = Q[i], b = Q[i + 1], n = Math.min(400, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / (d / 2))); for (let k = 1; k < n; k++) if (near(P, a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n, d)) return true; }
  }
  return false;
}

/** The areas and their landscape features, in each area's own millimetres. state = the project's state; trees = Set of species keys that are trees. Exported for the tests. */
export function siteAreas(state, { trees = new Set(), names = {} } = {}) {
  const units = state && state.units === 'm' ? 'm' : 'ft', k = MM[units], L = (state && state.landscape) || {};
  const list = [];
  const add = (kind, name, pts) => { const P = ptsOf(pts); if (P.length >= 3 && areaOf(P) > 0) list.push({ kind, name: String(name || ''), P }); };
  for (const r of (state && state.parking) || []) add('lot', r.name || r.id, r.boundary);
  for (const r of (state && state.parcels) || []) add('parcel', r.name || r.id, r.pts);
  for (const h of L.hardscape || []) if (h && h.kind === 'paving') add('paving', h.name || h.id, h.pts);
  for (const b of L.beds || []) add('bed', b.name || b.id, b.pts);
  const plants = (L.plants || []).filter((p) => p && fin(p.x) && fin(p.y) && trees.has(p.key));
  const paths = (L.hardscape || []).filter((h) => h && h.kind === 'path').map((h) => ptsOf(h.pts)).filter((P) => P.length >= 2);
  const reach = 2000 / k;   // 2 m in project units
  const out = list.map(({ kind, name, P }) => {
    const x0 = Math.min(...P.map((q) => q[0])), y0 = Math.min(...P.map((q) => q[1])), mm = (q) => [Math.round((q[0] - x0) * k), Math.round((q[1] - y0) * k)];
    return {
      name: (names[kind] ? names[kind](name) : name), kind, poly: P.map(mm), area: areaOf(P) * (k / 1000) ** 2, outdoor: true, origin: { x: x0, y: y0, units },
      features: {
        trees: plants.filter((p) => inside(P, p.x, p.y)).map((p) => { const q = mm([p.x, p.y]); return { x: q[0], y: q[1] }; }),
        paths: paths.filter((Q) => touches(P, Q, reach)).map((Q) => ({ pts: Q.map(mm) })),
        spots: [],
      },
    };
  });
  return out.sort((a, b) => b.area - a.area).slice(0, 60);
}

/**
 * 0.11 IL.10 (road-light-11): the road lighting cross-section of each alignment, from its corridor's assembly (corridor.js parts, centre out on each side: lane,
 * shoulder, gutter, curb, strip, walk, daylight) or, without parts, the simple assembly (one lane and one shoulder a side). Left side reversed + right side, in
 * metres: the lanes next to the centre line make one carriageway (left lanes run the other way); walk = footway; shoulder, gutter, curb and strip = verge;
 * daylight (the slope to the ground) is left out. A second corridor on the same alignment is listed too. Exported for the tests.
 */
export function roadSections(state) {
  const units = state && state.units === 'm' ? 'm' : 'ft', k = MM[units] / 1000, out = [];
  const simple = (c) => { const lane = fin(c && c.lane) ? c.lane : units === 'm' ? 3.6 : 12, sh = fin(c && c.shoulder) ? c.shoulder : units === 'm' ? 1.2 : 4; return [{ type: 'lane', w: lane }, { type: 'shoulder', w: sh }]; };
  const kindOf = (q) => (q.type === 'lane' ? 'lane' : q.type === 'walk' ? 'footway' : ['shoulder', 'gutter', 'curb', 'strip'].includes(q.type) ? 'verge' : null);
  const one = (name, c) => {
    const sides = c && c.parts && (c.parts.L || c.parts.R) ? { L: c.parts.L || [], R: c.parts.R || [] } : { L: simple(c), R: simple(c) };
    const seq = [...sides.L.slice().reverse().map((q) => ({ q, side: 'L' })), ...sides.R.map((q) => ({ q, side: 'R' }))];
    const strips = [];
    for (const { q, side } of seq) {
      const kind = kindOf(q), w = fin(q.w) ? q.w * k : 0;
      if (!kind || !(w > 0.05)) continue;
      const last = strips[strips.length - 1];
      if (kind === 'lane') {
        if (last && last.kind === 'carriageway') { last.width += w; last.lanes += 1; last.dirs.push(side === 'L' ? -1 : 1); }
        else strips.push({ kind: 'carriageway', width: w, lanes: 1, dirs: [side === 'L' ? -1 : 1] });
      } else strips.push({ kind, width: w });
    }
    for (const s of strips) s.width = Math.round(s.width * 1000) / 1000;
    if (strips.some((s) => s.kind === 'carriageway')) out.push({ name, section: { strips }, simple: !(c && c.parts) });
  };
  for (const a of (state && state.alignments) || []) {
    if (!a || a.rail) continue;   // a track, not a road
    one(String(a.name || a.id || ''), a.corridor || null);
    for (const c of a.corridors || []) if (c) one(String(a.name || a.id || '') + ' · ' + String(c.name || c.id || ''), c);
  }
  return out.slice(0, 60);
}

export function detect(api, { t }) {
  const cv = () => (typeof window !== 'undefined' && window.civilcraft) || null;
  if (!api || !cv() || !cv().project || (api.app && api.app.slug && api.app.slug !== 'civilcraft')) return null;
  let seedTrees = null;
  async function treeKeys(state) {
    if (!seedTrees) {
      seedTrees = new Set();
      try { const r = await fetch(new URL('../../landscape/plants-seed.json', import.meta.url)); const j = await r.json(); for (const s of j.species || []) if (s && s.type === 'tree') seedTrees.add(s.key); } catch { /* offline without the list: the project's own list only */ }
    }
    const keys = new Set(seedTrees);
    for (const s of (state.landscape && state.landscape.palette) || []) { if (s && s.type === 'tree') keys.add(s.key); else if (s && s.key) keys.delete(s.key); }
    return keys;
  }
  return {
    id: 'civil',
    renderer: false,
    axes: 'z',
    async rooms() {
      const st = cv().project.state;
      const names = { lot: (n) => t('civ.area.lot', { name: n }), parcel: (n) => t('civ.area.parcel', { name: n }), paving: (n) => t('civ.area.paving', { name: n }), bed: (n) => t('civ.area.bed', { name: n }) };
      return siteAreas(st, { trees: await treeKeys(st), names });
    },
    roads() { return roadSections(cv().project.state).map((r) => ({ name: r.name, section: r.section, note: r.simple ? t('civ.road.simple') : '' })); },
    count: () => 0,
    start() { /* the panel is the whole interface */ },
  };
}
