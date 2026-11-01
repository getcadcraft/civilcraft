/* SPDX-License-Identifier: Apache-2.0 */
/**
 * plate-draw.js — plates' results as plain geometry for a 3D view (0.8 SU.1056 step 2), the plate half of frame-draw.js. DOM-free; imports
 * plate-solve.js. Colours come from frame-draw.js's RAMP, passed in (no import cycle).
 *
 *   PLATE_MODES = ['plateMx', 'plateMy', 'plateMxy', 'plateW']      the moment contours (bending about the plate's own x, y; twisting) and the deflection
 *   plateGeometry(sol, key, mode, RAMP) → { max, unit, tris, triColors, lines, lineColors, labels }   mm, kN·m/m or mm
 *       each plate as two triangles coloured by its corners' values (node values: Gauss values extrapolated, averaged at shared nodes, patch-recovered on
 *       edges: plateNodeResults); w = the node displacement magnitude. The sign is in the labels (largest + and − value of each plate set).
 *   plateEdgesDeflected(sol, key, scale, colour) → { lines, lineColors }   the plates' outlines moved by the displacements × scale
 *   plateTables(model, sol, key, t) → report tables: one row per element (a slab, a wall) with its largest deflection, Mx, My, Mxy and shear
 */
import { plateNodeResults, plateCentre } from './plate-solve.js';

export const PLATE_MODES = ['plateMx', 'plateMy', 'plateMxy', 'plateW'];
const COMP = { plateMx: 3, plateMy: 4, plateMxy: 5 };
const qkey = (ax) => ax.ez.map((v) => Math.round(v * 1e6)).join(',');

export function plateGeometry(sol, key, mode, RAMP) {
  const out = { max: 0, unit: mode === 'plateW' ? 'mm' : 'kNm/m', tris: [], triColors: [], lines: [], lineColors: [], labels: [] };
  const R = sol?.results?.[key], pl = sol?.prep?.shell?.pl;
  if (!R || !pl?.length || !PLATE_MODES.includes(mode)) return out;
  const prep = sol.prep, P = prep.P;
  const disp = (nd) => Math.hypot(R.u[6 * nd], R.u[6 * nd + 1], R.u[6 * nd + 2]);
  const node = mode === 'plateW' ? null : plateNodeResults(prep, R);
  const corner = (k, c) => {
    const nd = pl[k].nodes[c];
    if (mode === 'plateW') return disp(nd);
    const e = node.get(nd)?.find((q) => q.axes === qkey(pl[k].el.ax));
    return e ? e.values[COMP[mode]] / 1e3 : 0;                          // N·mm/mm → kN·m/m
  };
  const vals = pl.map((_, k) => [0, 1, 2, 3].map((c) => corner(k, c)));
  for (const v of vals) for (const x of v) out.max = Math.max(out.max, Math.abs(x));
  const col = (v) => RAMP(out.max > 0 ? Math.abs(v) / out.max : 0);
  pl.forEach((p, k) => {
    const q = p.nodes.map((nd) => P[nd]);
    for (const tri of [[0, 1, 2], [0, 2, 3]]) for (const c of tri) { out.tris.push(...q[c]); out.triColors.push(...col(vals[k][c])); }
    for (let c = 0; c < 4; c++) { out.lines.push(...q[c], ...q[(c + 1) % 4]); out.lineColors.push(0.25, 0.25, 0.25, 0.25, 0.25, 0.25); }
  });
  // the largest value of each plate set, positive and negative, at the plate it is in
  const groups = new Map();
  pl.forEach((p, k) => { const g = p.el.ax.ez.map((v) => Math.round(v * 1e3)).join(',') + '|' + (prep.model.plates[k].from?.ref || prep.model.plates[k].id.split('.p')[0]); if (!groups.has(g)) groups.set(g, []); groups.get(g).push(k); });
  for (const list of groups.values()) {
    let hi = null, lo = null;
    for (const k of list) for (let c = 0; c < 4; c++) { const v = vals[k][c]; if (!hi || v > hi.v) hi = { v, k, c }; if (!lo || v < lo.v) lo = { v, k, c }; }
    for (const b of mode === 'plateW' ? [hi] : [hi, lo]) if (b && Math.abs(b.v) >= 0.05 * out.max && out.max > 0) out.labels.push({ p: [...P[pl[b.k].nodes[b.c]]], value: b.v, unit: out.unit, text: (Math.abs(b.v) >= 100 ? b.v.toFixed(0) : b.v.toFixed(2)) + (mode === 'plateW' ? ' mm' : '') });
  }
  return out;
}

export function plateEdgesDeflected(sol, key, scale, colour) {
  const out = { lines: [], lineColors: [] };
  const R = sol?.results?.[key], pl = sol?.prep?.shell?.pl;
  if (!R || !pl?.length) return out;
  const P = sol.prep.P;
  const at = (nd) => [0, 1, 2].map((a) => P[nd][a] + scale * R.u[6 * nd + a]);
  for (const p of pl) for (let c = 0; c < 4; c++) { out.lines.push(...at(p.nodes[c]), ...at(p.nodes[(c + 1) % 4])); out.lineColors.push(...colour, ...colour); }
  return out;
}

export function plateTables(model, sol, key, t) {
  const R = sol?.results?.[key], pl = sol?.prep?.shell?.pl;
  if (!R || !pl?.length) return [];
  const groups = new Map();
  model.plates.forEach((p, k) => { const g = p.from?.ref || p.id.split('.p')[0]; if (!groups.has(g)) groups.set(g, []); groups.get(g).push(k); });
  const kNm = (v) => (v / 1e3).toFixed(2), kN = (v) => (v / 1e3).toFixed(2);
  const rows = [];
  for (const [g, list] of groups) {
    let w = 0, mx = [0, 0], my = [0, 0], mxy = 0, q = 0;
    for (const k of list) {
      const c = plateCentre(sol.prep, R, k);
      mx = [Math.max(mx[0], c[3]), Math.min(mx[1], c[3])]; my = [Math.max(my[0], c[4]), Math.min(my[1], c[4])];
      mxy = Math.max(mxy, Math.abs(c[5])); q = Math.max(q, Math.hypot(c[6], c[7]));
      for (const nd of pl[k].nodes) w = Math.max(w, Math.hypot(R.u[6 * nd], R.u[6 * nd + 1], R.u[6 * nd + 2]));
    }
    rows.push([g, String(list.length), (model.plates[list[0]].t).toFixed(0), w.toFixed(2), kNm(mx[0]), kNm(mx[1]), kNm(my[0]), kNm(my[1]), kNm(mxy), kN(q)]);
  }
  /* i18n-ignore-start: column heads that are symbols / units */
  return [{ title: t('frame.pl.title'), head: [t('frame.pl.element'), t('frame.pl.n'), 't (mm)', 'w (mm)', 'Mx+ (kN·m/m)', 'Mx− (kN·m/m)', 'My+ (kN·m/m)', 'My− (kN·m/m)', '|Mxy| (kN·m/m)', 'Q (kN/m)'], numeric: [1, 2, 3, 4, 5, 6, 7, 8, 9], rows },
    { title: t('frame.pl.about'), head: [t('frame.rep.item'), t('frame.rep.value')], numeric: [], rows: [[t('frame.pl.method'), t('frame.pl.method-text')], [t('frame.pl.limits'), t('frame.pl.limits-text')]] }];
  /* i18n-ignore-end */
}
