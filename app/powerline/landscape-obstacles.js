/* SPDX-License-Identifier: Apache-2.0 */
/**
 * powerline/landscape-obstacles.js — what the Landscape workspace puts above the ground, as obstacles under overhead lines (0.7
 * PL.11; asked by the requester of Track PL). No DOM. The obstacles are worked out again from the landscape each time (never saved
 * in `powerlines.obstacles`), so moving a tree or raising a wall changes the checks at once.
 *
 *   landscapeObstacles(ls, { index, units, rules, groundAt, wallLayout }) → [obstacle]
 *     ls          project.state.landscape (or null)
 *     index       Map key → species (landscape/planting.js speciesIndex); a plant whose species is unknown is left out
 *     rules       the power lines' rule set: lsTrees / lsWalls = the clearance rule for plants / walls, null = left out
 *     groundAt    (x, y) → ground elevation (project units) | null
 *     wallLayout  landscape/hardscape.js wallLayout bound to the surface: (wall) → { stations: [{ x, y, ground, top }] } (optional)
 *     nameOf      (species) → the name shown in the checks (optional; default the English common name, else the botanical)
 *   obstacle = { id 'ls:<kind>:<id>', name, pts (closed rings repeat the first point), h (above the ground, project units),
 *                ground (z | null: the obstacle's own ground, else the span's), top (absolute z | null: wins over ground + h),
 *                clearance, source: 'landscape', kind: 'plant'|'hedge'|'bed'|'wall', box: { x0, y0, x1, y1 } }
 *
 * A plant is its canopy at mature spread (a 12-sided ring) and mature height; a hedge is its line at the tallest species' height
 * (its row gap widens it by nothing: a design aid, checked where the span crosses the line); a bed is its outline at the tallest
 * species in its mix; a wall is its line at its top (the highest station). The clearance is measured straight up from the top
 * of the obstacle to the conductor where the span crosses it in plan — the horizontal distance to a canopy next to the line is
 * not checked.
 */

const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const FT_M = 1200 / 3937;
export const LS_LIMIT = 20000;   // obstacles from one landscape (planting.js MAX_PLANTS)

const boxOf = (pts) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of pts) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
  return { x0, y0, x1, y1 };
};
function ring(x, y, r, n = 12) {
  const pts = [];
  for (let k = 0; k <= n; k++) { const a = (k % n) / n * 2 * Math.PI; pts.push({ x: x + r * Math.cos(a), y: y + r * Math.sin(a) }); }
  return pts;
}
const mature = (sp) => (sp?.size?.mature && fin(sp.size.mature.h) && fin(sp.size.mature.s) ? sp.size.mature : null);

export function landscapeObstacles(ls, { index, units, rules, groundAt, wallLayout, nameOf } = {}) {
  const out = [];
  const label = (sp) => { try { return (nameOf ? nameOf(sp) : sp?.names?.en || sp?.botanical) || sp?.key || ''; } catch { return sp?.key || ''; } };
  if (!ls || typeof ls !== 'object') return out;
  const perM = 1 / (units === 'm' ? 1 : FT_M);   // project units per metre (plant sizes are metres)
  const g = (x, y) => { try { const z = groundAt ? groundAt(x, y) : null; return fin(z) ? z : null; } catch { return null; } };
  const idx = index instanceof Map ? index : new Map();
  const trees = rules?.lsTrees ?? null, walls = rules?.lsWalls ?? null;
  const push = (o) => { if (out.length < LS_LIMIT && o.pts.length >= 2) out.push({ ...o, source: 'landscape', box: boxOf(o.pts) }); };
  if (trees) {
    for (const p of Array.isArray(ls.plants) ? ls.plants : []) {
      const sp = idx.get(p?.key), m = mature(sp);
      if (!m || !fin(p.x) || !fin(p.y)) continue;
      push({ id: 'ls:plant:' + p.id, kind: 'plant', name: label(sp), pts: ring(p.x, p.y, Math.max(m.s * perM / 2, 0.1)), h: m.h * perM, ground: fin(p.z) ? p.z : g(p.x, p.y), top: null, clearance: trees });
    }
    for (const hd of Array.isArray(ls.hedges) ? ls.hedges : []) {
      const m = mature(idx.get(hd?.key));
      const pts = (Array.isArray(hd?.pts) ? hd.pts : []).filter((q) => q && fin(q.x) && fin(q.y));
      if (!m || pts.length < 2) continue;
      push({ id: 'ls:hedge:' + hd.id, kind: 'hedge', name: hd.name || label(idx.get(hd.key)), pts, h: m.h * perM, ground: null, top: null, clearance: trees });
    }
    for (const b of Array.isArray(ls.beds) ? ls.beds : []) {
      const pts = (Array.isArray(b?.pts) ? b.pts : []).filter((q) => q && fin(q.x) && fin(q.y));
      const h = Math.max(0, ...(Array.isArray(b?.mix) ? b.mix : []).map((x) => mature(idx.get(x?.key))?.h ?? 0));
      if (pts.length < 3 || !(h > 0)) continue;
      push({ id: 'ls:bed:' + b.id, kind: 'bed', name: b.name || '', pts: [...pts, pts[0]], h: h * perM, ground: null, top: null, clearance: trees });
    }
  }
  if (walls) {
    for (const w of Array.isArray(ls.hardscape) ? ls.hardscape : []) {
      if (w?.kind !== 'wall') continue;
      const pts = (Array.isArray(w.pts) ? w.pts : []).filter((q) => q && fin(q.x) && fin(q.y));
      if (pts.length < 2) continue;
      let top = null;
      try { for (const st of wallLayout ? wallLayout(w).stations || [] : []) if (fin(st.top)) top = top == null ? st.top : Math.max(top, st.top); } catch { top = null; }
      if (top == null && fin(w.top)) top = w.top;
      push({ id: 'ls:wall:' + w.id, kind: 'wall', name: w.name || '', pts, h: fin(w.height) ? w.height : 0, ground: null, top, clearance: walls });
    }
  }
  return out;
}
