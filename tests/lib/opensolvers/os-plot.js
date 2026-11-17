/* SPDX-License-Identifier: Apache-2.0 */
/**
 * os-plot.js — a result read from a solver's file as colour bands of display bodies (lib/opensolvers; suggestion 1309). DOM-free.
 * The bodies have the shape the hosts' result display takes (PartCraft api.model.addBodies: { name, color, mesh: { positions, indices } }),
 * the same eight-colour ramp as the Solid FEM plot (lib/fem/solid-study.js RAMP), blue = lowest, red = highest.
 *
 *   bands(surface, values, opts) → { bodies, legend: [{ lo, hi, color }], lo, hi, scale, triangles, thinned } | null
 *     surface = { positions (x y z …), tris: Int32Array (i j k …), triCell?: Int32Array }
 *     values  = { where: 'point' | 'cell', values: Float64Array }  (cell values need surface.triCell)
 *     opts    = { n = 8, disp: Float64Array(3·points) | null, scale = 1, toMm = 1 (file length unit → mm), offset = [0, 0, 0] mm,
 *                 maxTriangles = 60000 }
 *   A surface with more triangles than the display takes is thinned by vertex clustering (Rossignac and Borrel, "Multi-resolution 3D
 *   approximations for rendering complex scenes", 1993): points in one grid cell become their mean, triangles that collapse are dropped.
 */
export const RAMP = ['#2c4ea3', '#2a8bd0', '#2fb5b0', '#5bc16a', '#b5d33d', '#f1c232', '#ef8a2a', '#d3392b'];

function cluster(P, tris, triVal, cell) {
  const key = new Map(), np = P.length / 3, map = new Int32Array(np), sum = [], cnt = [];
  let mn = [Infinity, Infinity, Infinity];
  for (let i = 0; i < np; i++) for (let d = 0; d < 3; d++) if (P[3 * i + d] < mn[d]) mn[d] = P[3 * i + d];
  for (let i = 0; i < np; i++) {
    const k = Math.floor((P[3 * i] - mn[0]) / cell) + ',' + Math.floor((P[3 * i + 1] - mn[1]) / cell) + ',' + Math.floor((P[3 * i + 2] - mn[2]) / cell);
    let id = key.get(k);
    if (id === undefined) { id = cnt.length; key.set(k, id); sum.push(0, 0, 0); cnt.push(0); }
    map[i] = id; cnt[id]++; for (let d = 0; d < 3; d++) sum[3 * id + d] += P[3 * i + d];
  }
  const Q = new Float64Array(sum.length);
  for (let i = 0; i < cnt.length; i++) for (let d = 0; d < 3; d++) Q[3 * i + d] = sum[3 * i + d] / cnt[i];
  const T = [], V = [];
  for (let t = 0; t < tris.length / 3; t++) {
    const a = map[tris[3 * t]], b = map[tris[3 * t + 1]], c = map[tris[3 * t + 2]];
    if (a === b || b === c || a === c) continue;
    T.push(a, b, c); V.push(triVal[t]);
  }
  return { P: Q, tris: Int32Array.from(T), triVal: Float64Array.from(V) };
}

export function bands(surface, values, { n = 8, disp = null, scale = 1, toMm = 1, offset = [0, 0, 0], maxTriangles = 60000 } = {}) {
  const src = surface.positions, np = src.length / 3, nt = surface.tris.length / 3;
  if (!nt || !values) return null;
  let P = new Float64Array(3 * np);
  for (let i = 0; i < np; i++) for (let d = 0; d < 3; d++) P[3 * i + d] = (src[3 * i + d] + (disp ? scale * disp[3 * i + d] : 0)) * toMm + offset[d];
  // one value a triangle
  let triVal = new Float64Array(nt);
  const v = values.values;
  if (values.where === 'cell') { if (!surface.triCell) return null; for (let t = 0; t < nt; t++) triVal[t] = v[surface.triCell[t]]; }
  else for (let t = 0; t < nt; t++) triVal[t] = (v[surface.tris[3 * t]] + v[surface.tris[3 * t + 1]] + v[surface.tris[3 * t + 2]]) / 3;
  let tris = surface.tris, thinned = false;
  if (nt > maxTriangles) {
    let mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
    for (let i = 0; i < np; i++) for (let d = 0; d < 3; d++) { mn[d] = Math.min(mn[d], P[3 * i + d]); mx[d] = Math.max(mx[d], P[3 * i + d]); }
    let cell = Math.hypot(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]) / 400 || 1;
    for (let pass = 0; pass < 40; pass++) {
      const c = cluster(P, surface.tris, triVal, cell);
      if (c.tris.length / 3 <= maxTriangles) { P = c.P; tris = c.tris; triVal = c.triVal; thinned = true; break; }
      cell *= 1.3;
    }
    if (!thinned) return null;
  }
  let lo = Infinity, hi = -Infinity;
  for (const x of triVal) if (Number.isFinite(x)) { if (x < lo) lo = x; if (x > hi) hi = x; }
  if (!(hi >= lo)) return null;
  if (hi - lo < 1e-12 * Math.max(1, Math.abs(hi))) hi = lo + 1e-12 * Math.max(1, Math.abs(lo)) + 1e-30;
  const band = (x) => Math.min(n - 1, Math.max(0, Math.floor((x - lo) / (hi - lo) * n)));
  const groups = Array.from({ length: n }, () => ({ pos: [], idx: [], map: new Map() }));
  for (let t = 0; t < tris.length / 3; t++) {
    if (!Number.isFinite(triVal[t])) continue;
    const gr = groups[band(triVal[t])];
    for (let k = 0; k < 3; k++) {
      const q = tris[3 * t + k]; let id = gr.map.get(q);
      if (id === undefined) { id = gr.pos.length / 3; gr.map.set(q, id); gr.pos.push(P[3 * q], P[3 * q + 1], P[3 * q + 2]); }
      gr.idx.push(id);
    }
  }
  const bodies = [], legend = [];
  groups.forEach((gr, b) => {
    legend.push({ lo: lo + (hi - lo) * b / n, hi: lo + (hi - lo) * (b + 1) / n, color: RAMP[Math.min(RAMP.length - 1, Math.round(b * (RAMP.length - 1) / Math.max(1, n - 1)))] });
    if (gr.idx.length) bodies.push({ name: 'band ' + (b + 1), color: legend[b].color, mesh: { positions: gr.pos, indices: gr.idx } });
  });
  return { bodies, legend, lo, hi, scale, triangles: tris.length / 3, thinned };
}

/** Largest length of a 3-vector field. */
export function maxMag(v) { let m = 0; if (v) for (let i = 0; i < v.length; i += 3) m = Math.max(m, Math.hypot(v[i], v[i + 1], v[i + 2])); return m; }
