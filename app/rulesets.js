/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rulesets.js — 0.11 SU.1937b: named rule sets for drainage, as data. No DOM.
 *
 * A rule set is what a design office or a regulation fixes before a pipe is sized: the rainfall by duration and return period, the pipe
 * materials with their roughness, the limits. CivilCraft ships NONE of these numbers (memory: never ship a country's numbers unverified):
 * every group of numbers in a rule set carries either `src` (the citation: document, edition, table) or `entered: true` (the person typed it
 * in and stands behind it), and a group with neither is dropped when the set is read.
 *
 *   { format: 'cadcraft-drainage-rules', version: 1, id, name, note,
 *     rainfall:  [{ ret (return period, years), tMin, tMax (minutes), form: 'idf' | 'montana', a, b, c, src | entered }]
 *                  idf       i = a / (t + b)^c          (the form the storm settings use)
 *                  montana   i = a · t^(−b)             (stored as idf with b = 0 and c = the exponent)
 *                  i in in/h (feet projects) or mm/h (metre projects), t in minutes; a row holds for tMin ≤ t ≤ tMax
 *     materials: [{ key, name, n (Manning), src | entered }]
 *     limits:    { minSlope (fraction), minCover, minDrop (project units), src | entered } }
 *
 *   cleanRuleset(o, units) → { rs | null, dropped: [{ group, at, why }] }     (untrusted: a file, the project)
 *   rainfallFor(rs, ret, tc) → { a, b, c, row, outside } | null   the row of that return period whose range holds tc; none holds it: the
 *       nearest range's row with outside: true (the person is told); no row of that return period: null
 *   returnPeriods(rs) → [years]    materialN(rs, key) → n | null
 *   applyRuleset(hydro, rules, rs, ret) → { hydro, rules }    the network's settings with the set in force (a copy; idf at the shortest range
 *       of that return period, so the plain boxes show something true)
 *   rulesetFile(list) / readRulesetFile(obj, units) → { rulesets, notes }    the .ccrules.json file
 *   ruleFromNetwork(net, name) → rule set   what the network uses now, as entered by the person
 */
export const RS_FORMAT = 'cadcraft-drainage-rules';
export const RS_VERSION = 1;
export const RS_EXT = '.ccrules.json';   // i18n-ignore: a file name ending
export const MAX_RULESETS = 50, MAX_ROWS = 200, MAX_MATS = 40;
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
const str = (v, n) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, n);
const KEY_RE = /^[a-z][a-z0-9_]{0,23}$/;

/** The proof a group carries: its citation, or the person's entry. */
const proof = (o) => (typeof o?.src === 'string' && str(o.src, 300) ? { src: str(o.src, 300) } : o?.entered === true ? { entered: true } : null);

export function cleanRuleset(o, units = 'ft') {
  const dropped = [];
  if (!o || typeof o !== 'object') return { rs: null, dropped };
  const rainfall = [], materials = [];
  (Array.isArray(o.rainfall) ? o.rainfall.slice(0, MAX_ROWS) : []).forEach((r, i) => {
    const pr = proof(r);
    const form = r?.form === 'montana' ? 'montana' : 'idf';
    if (!r || typeof r !== 'object' || !fin(r.ret) || !(r.ret > 0 && r.ret <= 10000) || !fin(r.tMin) || !fin(r.tMax) || !(r.tMin >= 0 && r.tMax > r.tMin && r.tMax <= 100000) || !fin(r.a) || !(r.a > 0 && r.a < 1e7) || !fin(r.c) || !(r.c > 0 && r.c < 10) || (form === 'idf' && !(fin(r.b) && r.b >= 0 && r.b < 1000))) { dropped.push({ group: 'rainfall', at: i + 1, why: 'bad' }); return; }
    if (!pr) { dropped.push({ group: 'rainfall', at: i + 1, why: 'nosource' }); return; }
    rainfall.push({ ret: r.ret, tMin: r.tMin, tMax: r.tMax, form, a: r.a, b: form === 'montana' ? 0 : r.b, c: r.c, ...pr });
  });
  (Array.isArray(o.materials) ? o.materials.slice(0, MAX_MATS) : []).forEach((m, i) => {
    const pr = proof(m);
    if (!m || typeof m !== 'object' || !KEY_RE.test(String(m.key)) || materials.some((x) => x.key === m.key) || !fin(m.n) || !(m.n > 0 && m.n < 1)) { dropped.push({ group: 'materials', at: i + 1, why: 'bad' }); return; }
    if (!pr) { dropped.push({ group: 'materials', at: i + 1, why: 'nosource' }); return; }
    materials.push({ key: m.key, name: str(m.name, 60) || m.key, n: m.n, ...pr });
  });
  let limits = null;
  if (o.limits && typeof o.limits === 'object') {
    const pr = proof(o.limits), L = {};
    for (const k of ['minSlope', 'minCover', 'minDrop']) if (fin(o.limits[k]) && o.limits[k] >= 0 && o.limits[k] < (k === 'minSlope' ? 1 : 1000)) L[k] = o.limits[k];
    if (Object.keys(L).length) { if (pr) limits = { ...L, ...pr }; else dropped.push({ group: 'limits', at: 1, why: 'nosource' }); }
  }
  if (!rainfall.length && !materials.length && !limits) return { rs: null, dropped };
  const rs = { name: str(o.name, 80) || 'Rule set', note: str(o.note, 500), rainfall, materials, ...(limits ? { limits } : {}) };   // i18n-ignore: a fallback name stored in a file (the UI names it)
  if (typeof o.id === 'string' && /^rs[0-9]{1,9}$/.test(o.id)) rs.id = o.id;
  return { rs, dropped };
}

export const returnPeriods = (rs) => [...new Set((rs?.rainfall || []).map((r) => r.ret))].sort((a, b) => a - b);
export const materialN = (rs, key) => (rs?.materials || []).find((m) => m.key === key)?.n ?? null;
export function rainfallFor(rs, ret, tc) {
  const rows = (rs?.rainfall || []).filter((r) => r.ret === ret);
  if (!rows.length) return null;
  const hit = rows.find((r) => tc >= r.tMin && tc <= r.tMax);
  if (hit) return { a: hit.a, b: hit.b, c: hit.c, row: hit, outside: false };
  const near = rows.reduce((b, r) => { const d = tc < r.tMin ? r.tMin - tc : tc - r.tMax; return !b || d < b.d ? { r, d } : b; }, null).r;
  return { a: near.a, b: near.b, c: near.c, row: near, outside: true };
}
export function applyRuleset(hydro, rules, rs, ret) {
  const first = rainfallFor(rs, ret, Math.min(...(rs.rainfall || []).filter((r) => r.ret === ret).map((r) => r.tMin), Infinity) || 0);
  const h = { ...hydro, rs, rsId: rs.id || null, ret: ret ?? null };
  if (first) h.idf = { a: first.a, b: first.b, c: first.c };
  return { hydro: h, rules: rs.limits ? { ...rules, ...Object.fromEntries(['minSlope', 'minCover', 'minDrop'].filter((k) => k in rs.limits).map((k) => [k, rs.limits[k]])) } : rules };
}

export function rulesetFile(list) { return { format: RS_FORMAT, version: RS_VERSION, rulesets: list }; }
export function readRulesetFile(obj, units = 'ft') {
  const notes = [], rulesets = [];
  if (!obj || obj.format !== RS_FORMAT || !Array.isArray(obj.rulesets)) return { rulesets, notes: ['format'] };
  for (const r of obj.rulesets.slice(0, MAX_RULESETS)) { const c = cleanRuleset(r, units); if (c.rs) rulesets.push(c.rs); for (const d of c.dropped) notes.push(d.group + ':' + d.at + ':' + d.why); }
  return { rulesets, notes };
}
/** What the network uses now (its storm settings and limits), as a rule set the person entered. */
export function ruleFromNetwork(net, name) {
  const h = net?.hydro, r = net?.rules || {}, out = { name, note: '', rainfall: [], materials: [], limits: { minSlope: r.minSlope || 0, minCover: r.minCover || 0, minDrop: r.minDrop || 0, entered: true } };
  if (h?.idf) out.rainfall.push({ ret: 10, tMin: 0, tMax: 1440, form: 'idf', a: h.idf.a, b: h.idf.b, c: h.idf.c, entered: true });
  if (h?.n) out.materials.push({ key: 'pipe', name: 'Pipe', n: h.n, entered: true });
  return out;
}
