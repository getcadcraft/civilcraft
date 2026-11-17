/* SPDX-License-Identifier: Apache-2.0 */
/**
 * compare.js — Compare with model (0.10 SU.1809): the distance from every scan point to the model's SURFACE, in tolerance bands, and a
 * report per element. DOM-free, no app imports. The model arrives as plain triangles (a thin adapter per app turns its elements into
 * them), so BimCraft's IFC, a mesh from ModelCraft or a made-up test model all use this one comparison.
 *
 *   await compareWithModel({ cloud | points, model, offset, tol, bands, maxDist, budget, minPoints, signal, progress }) → report
 *     cloud     an open engine cloud (openCloud); its nodes are read at full detail, thinned evenly to `budget` points; or
 *     points    { n, pos: Float32Array|Float64Array (3n) } already in the model's frame
 *     offset    [x, y, z] added to a cloud point (cloud.readNode's positions are relative to cloud.origin; the add-on's placement T)
 *     model     { elements: [{ key, name?, guid?, tris: Float32Array|number[] (9 numbers a triangle: ax ay az bx by bz cx cy cz) }] }
 *               (metres; `tol` and `bands` are in the same units)
 *     tol       the tolerance (default 0.02): an element is "within" when its points' mean distance and their 95th percentile fit it
 *     bands     ascending limits of the colour bands (default [tol/2, tol, 2*tol, 5*tol]) → band i = distance < bands[i]; the last = beyond
 *     maxDist   search radius (default 5*tol, at least 0.1): a point farther than that from every triangle is "unmatched" (not in the model)
 *     minPoints fewer points than this on an element = "unseen" (the scan never saw it; nothing is said about it), default 30
 *     minCoverage the scanned share of an element: the cells (coverCell, default 0.25) of its surface the points touch, times the cell area,
 *               over half the element's surface area; at least this (default 0.35), else it is "partial": a few points at a corner say nothing
 *               about a whole wall. A heuristic: the visible area of a real element is not always half its surface
 *   report = {
 *     ok, tol, bands, maxDist, points: { read, tested, matched, unmatched },
 *     bandCounts: [n per band + beyond], bandShare: [...],
 *     elements: [{ key, name, guid, state: 'within'|'outside'|'partial'|'unseen', n, coverage, mean, signedMean, rms, max, p95, withinShare }],
 *     totals: { elements, within, outside, unseen },
 *     sample: { pos: Float32Array(3m), dist: Float32Array(m), band: Uint8Array(m), key: Int32Array(m) }   the tested points, for colouring
 *   }
 *   A distance is to the nearest point of the element's triangles (never to a plane's extension). The signed distance is positive on the
 *   side the triangle's normal (by its winding) points to; meshes with mixed windings give a signed mean near zero, the others never use it.
 *   bandColor(i, n) → [r, g, b]   green (inside the tightest band) to red (beyond); colorize(report) → Uint8Array rgb of the sample
 *   fieldVerifiable(report, { minShare }) → keys of the 'within' elements (BK.49: the caller marks them field-verified, method scan)
 *   reportCsv(report) → CSV text (a file format: the column names are not screen words)
 * Not claimed: a survey. The numbers are what the scan gives against the model as placed; a scan that is shifted or at the wrong scale
 * shows as a large distance everywhere (see scan-check.js for the scale and level check made first).
 */
import { throwIfAborted, tick } from './util.js';

const PBINS = 2000;

/** Closest point on triangle abc to p (Ericson, Real-Time Collision Detection 5.1.5); writes into out [x,y,z]. */
function closest(px, py, pz, ax, ay, az, bx, by, bz, cx, cy, cz, out) {
  const abx = bx - ax, aby = by - ay, abz = bz - az, acx = cx - ax, acy = cy - ay, acz = cz - az;
  const apx = px - ax, apy = py - ay, apz = pz - az;
  const d1 = abx * apx + aby * apy + abz * apz, d2 = acx * apx + acy * apy + acz * apz;
  if (d1 <= 0 && d2 <= 0) { out[0] = ax; out[1] = ay; out[2] = az; return; }
  const bpx = px - bx, bpy = py - by, bpz = pz - bz;
  const d3 = abx * bpx + aby * bpy + abz * bpz, d4 = acx * bpx + acy * bpy + acz * bpz;
  if (d3 >= 0 && d4 <= d3) { out[0] = bx; out[1] = by; out[2] = bz; return; }
  const vc = d1 * d4 - d3 * d2;
  if (vc <= 0 && d1 >= 0 && d3 <= 0) { const v = d1 / (d1 - d3); out[0] = ax + v * abx; out[1] = ay + v * aby; out[2] = az + v * abz; return; }
  const cpx = px - cx, cpy = py - cy, cpz = pz - cz;
  const d5 = abx * cpx + aby * cpy + abz * cpz, d6 = acx * cpx + acy * cpy + acz * cpz;
  if (d6 >= 0 && d5 <= d6) { out[0] = cx; out[1] = cy; out[2] = cz; return; }
  const vb = d5 * d2 - d1 * d6;
  if (vb <= 0 && d2 >= 0 && d6 <= 0) { const w = d2 / (d2 - d6); out[0] = ax + w * acx; out[1] = ay + w * acy; out[2] = az + w * acz; return; }
  const va = d3 * d6 - d5 * d4;
  if (va <= 0 && d4 - d3 >= 0 && d5 - d6 >= 0) { const w = (d4 - d3) / ((d4 - d3) + (d5 - d6)); out[0] = bx + w * (cx - bx); out[1] = by + w * (cy - by); out[2] = bz + w * (cz - bz); return; }
  const den = 1 / (va + vb + vc), v = vb * den, w = vc * den;
  out[0] = ax + abx * v + acx * w; out[1] = ay + aby * v + acy * w; out[2] = az + abz * v + acz * w;
}

/** A hash grid of the model's triangles: each triangle is listed in every cell its box (grown by `reach`) touches, so a query reads ONE cell. */
export function buildTriangleGrid(model, reach) {
  const tris = [], owner = [];
  model.elements.forEach((e, ei) => { const t = e.tris; for (let i = 0; i + 8 < t.length; i += 9) { tris.push(t[i], t[i + 1], t[i + 2], t[i + 3], t[i + 4], t[i + 5], t[i + 6], t[i + 7], t[i + 8]); owner.push(ei); } });
  const T = Float64Array.from(tris), nT = owner.length;
  const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
  for (let i = 0; i < T.length; i += 3) for (let k = 0; k < 3; k++) { const v = T[i + k]; if (v < mn[k]) mn[k] = v; if (v > mx[k]) mx[k] = v; }
  if (!nT) return { nT: 0, T, owner: Int32Array.from(owner), cell: reach, mn, mx, cells: new Map(), dims: [0, 0, 0] };
  // the cell is at least `reach` so the box growth stays within one cell either side; and big enough that a huge model stays under ~4 M cells
  const ext = Math.max(mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2], 1e-9);
  const cell = Math.max(reach, ext / 160);
  const dims = [0, 1, 2].map((k) => Math.floor((mx[k] - mn[k] + 2 * reach) / cell) + 1);
  const cells = new Map();
  const key = (i, j, k) => i + dims[0] * (j + dims[1] * k);
  for (let t = 0; t < nT; t++) {
    const o = 9 * t, lo = [Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity];
    for (let v = 0; v < 3; v++) for (let k = 0; k < 3; k++) { const x = T[o + 3 * v + k]; if (x < lo[k]) lo[k] = x; if (x > hi[k]) hi[k] = x; }
    const i0 = Math.max(0, Math.floor((lo[0] - reach - mn[0] + reach) / cell)), i1 = Math.min(dims[0] - 1, Math.floor((hi[0] + reach - mn[0] + reach) / cell));
    const j0 = Math.max(0, Math.floor((lo[1] - reach - mn[1] + reach) / cell)), j1 = Math.min(dims[1] - 1, Math.floor((hi[1] + reach - mn[1] + reach) / cell));
    const k0 = Math.max(0, Math.floor((lo[2] - reach - mn[2] + reach) / cell)), k1 = Math.min(dims[2] - 1, Math.floor((hi[2] + reach - mn[2] + reach) / cell));
    for (let k = k0; k <= k1; k++) for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { const c = key(i, j, k); let l = cells.get(c); if (!l) cells.set(c, l = []); l.push(t); }
  }
  return { nT, T, owner: Int32Array.from(owner), cell, mn, mx, cells, dims, reach, key };
}

/** Nearest triangle to (x, y, z) within `reach`: writes { d, signed, tri } into out, returns false when none. */
function nearest(G, x, y, z, reach, out, tmp) {
  if (!G.nT) return false;
  const i = Math.floor((x - G.mn[0] + reach) / G.cell), j = Math.floor((y - G.mn[1] + reach) / G.cell), k = Math.floor((z - G.mn[2] + reach) / G.cell);
  if (i < 0 || j < 0 || k < 0 || i >= G.dims[0] || j >= G.dims[1] || k >= G.dims[2]) return false;
  const list = G.cells.get(G.key(i, j, k));
  if (!list) return false;
  const T = G.T; let best = reach * reach, bt = -1;
  for (let q = 0; q < list.length; q++) {
    const t = list[q], o = 9 * t;
    closest(x, y, z, T[o], T[o + 1], T[o + 2], T[o + 3], T[o + 4], T[o + 5], T[o + 6], T[o + 7], T[o + 8], tmp);
    const dx = x - tmp[0], dy = y - tmp[1], dz = z - tmp[2], d2 = dx * dx + dy * dy + dz * dz;
    if (d2 < best) { best = d2; bt = t; out.cx = tmp[0]; out.cy = tmp[1]; out.cz = tmp[2]; }
  }
  if (bt < 0) return false;
  const o = 9 * bt, ux = T[o + 3] - T[o], uy = T[o + 4] - T[o + 1], uz = T[o + 5] - T[o + 2], vx = T[o + 6] - T[o], vy = T[o + 7] - T[o + 1], vz = T[o + 8] - T[o + 2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  const d = Math.sqrt(best), s = (x - out.cx) * nx + (y - out.cy) * ny + (z - out.cz) * nz;
  out.d = d; out.signed = s >= 0 ? d : -d; out.tri = bt;
  return true;
}

export const bandColor = (i, n) => {
  const f = n <= 1 ? 1 : i / (n - 1);   // 0 = tightest band
  const h = (1 - f) * 120;              // green (120) → red (0)
  const c = (n2) => { const k = (n2 + h / 60) % 6, v = 0.85 * (1 - Math.max(0, Math.min(k, 4 - k, 1))) + 0.15; return Math.round(255 * v); };
  return [c(5), c(3), c(1)];
};

export async function compareWithModel(o) {
  const model = o.model;
  if (!model || !Array.isArray(model.elements)) throw Object.assign(new Error('compare: no model'), { code: 'compare_no_model' });
  const tol = o.tol > 0 ? o.tol : 0.02;
  const bands = (o.bands && o.bands.length ? o.bands : [tol / 2, tol, 2 * tol, 5 * tol]).slice().sort((a, b) => a - b);
  const reach = Math.max(o.maxDist > 0 ? o.maxDist : 5 * tol, 0.1, bands[bands.length - 1]);
  const budget = o.budget > 0 ? o.budget : 5e6, minPoints = o.minPoints >= 0 ? o.minPoints : 30;
  const off = o.offset || [0, 0, 0], signal = o.signal || null, progress = o.progress || null;
  const G = buildTriangleGrid(model, reach);
  if (!G.nT) return { ok: false, reason: 'no_triangles' };
  const E = model.elements, ne = E.length;
  const st = E.map(() => ({ n: 0, sum: 0, sgn: 0, sq: 0, max: 0, within: 0, hist: new Uint32Array(PBINS + 1), cells: new Set() }));
  // the area a scanner can see of an element is about half its surface (one side of a wall, the top of a slab)
  const seeable = E.map((e) => { let a = 0; const t = e.tris; for (let i = 0; i + 8 < t.length; i += 9) { const ux = t[i + 3] - t[i], uy = t[i + 4] - t[i + 1], uz = t[i + 5] - t[i + 2], vx = t[i + 6] - t[i], vy = t[i + 7] - t[i + 1], vz = t[i + 8] - t[i + 2]; const cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx; a += 0.5 * Math.sqrt(cx * cx + cy * cy + cz * cz); } return Math.max(a / 2, 1e-9); });
  const cellSize = o.coverCell > 0 ? o.coverCell : 0.25;
  const minCoverage = o.minCoverage >= 0 ? o.minCoverage : 0.35;
  const nb = bands.length + 1, bandCounts = new Array(nb).fill(0);
  let read = 0, tested = 0, matched = 0;
  const cap = Math.min(budget, 4e6), sPos = [], sDist = [], sBand = [], sKey = [];
  const out = { d: 0, signed: 0, tri: 0, cx: 0, cy: 0, cz: 0 }, tmp = [0, 0, 0];
  // thinning: every `stride`-th point of what the cloud holds
  const total = o.cloud ? o.cloud.count : o.points.n;
  const stride = Math.max(1, Math.ceil(total / budget));
  const sStride = Math.max(1, Math.ceil(Math.min(total, budget) / cap));
  let seen = 0;
  const test = (x, y, z) => {
    read++;
    if ((seen++ % stride) !== 0) return;
    tested++;
    let band = nb - 1, key = -1;
    if (nearest(G, x, y, z, reach, out, tmp)) {
      matched++;
      const ei = G.owner[out.tri], s = st[ei], d = out.d;
      s.n++; s.sum += d; s.sgn += out.signed; s.sq += d * d; if (d > s.max) s.max = d; if (d <= tol) s.within++;
      s.hist[Math.min(PBINS, Math.floor(d / reach * PBINS))]++;
      s.cells.add((Math.imul(Math.floor(out.cx / cellSize), 73856093) ^ Math.imul(Math.floor(out.cy / cellSize), 19349663) ^ Math.imul(Math.floor(out.cz / cellSize), 83492791)) | 0);
      band = bands.length; for (let b = 0; b < bands.length; b++) if (d < bands[b]) { band = b; break; }
      key = ei;
      if ((tested % sStride) === 0) { sPos.push(x, y, z); sDist.push(d); sBand.push(band); sKey.push(ei); }
    } else if ((tested % sStride) === 0) { sPos.push(x, y, z); sDist.push(reach); sBand.push(nb - 1); sKey.push(-1); }
    bandCounts[band]++;
    return key;
  };
  if (o.cloud) {
    const nodes = o.cloud.nodesIn(null);
    for (let q = 0; q < nodes.length; q++) {
      throwIfAborted(signal);
      const r = await o.cloud.readNode(nodes[q], { attrs: [] });
      for (let i = 0; i < r.n; i++) test(r.pos[3 * i] + off[0], r.pos[3 * i + 1] + off[1], r.pos[3 * i + 2] + off[2]);
      if (progress && (q & 7) === 7) { progress(q / nodes.length, 'compare'); await tick(); }
    }
  } else {
    const p = o.points.pos;
    for (let i = 0; i < o.points.n; i++) {
      test(p[3 * i] + off[0], p[3 * i + 1] + off[1], p[3 * i + 2] + off[2]);
      if (progress && (i & 65535) === 65535) { throwIfAborted(signal); progress(i / o.points.n, 'compare'); await tick(); }
    }
  }
  const elements = E.map((e, i) => {
    const s = st[i], n = s.n;
    let p95 = 0;
    if (n) { let acc = 0; const want = 0.95 * n; for (let b = 0; b <= PBINS; b++) { acc += s.hist[b]; if (acc >= want) { p95 = (b + 1) / PBINS * reach; break; } } p95 = Math.min(p95, s.max); }
    const mean = n ? s.sum / n : 0, withinShare = n ? s.within / n : 0;
    const coverage = n ? Math.min(1, s.cells.size * cellSize * cellSize / seeable[i]) : 0;
    const state = n < minPoints ? 'unseen' : coverage < minCoverage ? 'partial' : (mean <= tol && p95 <= 2 * tol ? 'within' : 'outside');
    return { key: e.key, name: e.name || '', guid: e.guid || '', state, n, coverage, mean, signedMean: n ? s.sgn / n : 0, rms: n ? Math.sqrt(s.sq / n) : 0, max: s.max, p95, withinShare };
  });
  const totals = { elements: ne, within: 0, outside: 0, partial: 0, unseen: 0 };
  for (const e of elements) totals[e.state]++;
  if (progress) progress(1, 'compare');
  return {
    ok: true, tol, bands, maxDist: reach, stride,
    points: { read, tested, matched, unmatched: tested - matched },
    bandCounts, bandShare: bandCounts.map((c) => (tested ? c / tested : 0)),
    elements, totals,
    sample: { pos: Float32Array.from(sPos), dist: Float32Array.from(sDist), band: Uint8Array.from(sBand), key: Int32Array.from(sKey) },
  };
}

/** One rgb triple per sampled point: its band's colour; points not in the model (beyond) the last colour. */
export function colorize(report) {
  const n = report.bands.length + 1, pal = Array.from({ length: n }, (_, i) => bandColor(i, n)), b = report.sample.band, rgb = new Uint8Array(b.length * 3);
  for (let i = 0; i < b.length; i++) { const c = pal[b[i]]; rgb[3 * i] = c[0]; rgb[3 * i + 1] = c[1]; rgb[3 * i + 2] = c[2]; }
  return rgb;
}

/** The keys of the elements that are within tolerance with enough of their points inside it (BK.49 marks them field-verified, method scan). */
export const fieldVerifiable = (report, { minShare = 0.8 } = {}) => report.elements.filter((e) => e.state === 'within' && e.withinShare >= minShare).map((e) => e.key);

const q = (s) => { s = String(s ?? ''); if (/^[=+\-@]/.test(s)) s = "'" + s; return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
export function reportCsv(report) {
  const f = (v) => (Number.isFinite(v) ? (v * 1000).toFixed(1) : '');
  const rows = [['key', 'guid', 'name', 'state', 'points', 'coverage', 'mean_mm', 'signed_mean_mm', 'rms_mm', 'p95_mm', 'max_mm', 'within_tol_share']];
  for (const e of report.elements) rows.push([e.key, e.guid, e.name, e.state, e.n, e.coverage.toFixed(2), f(e.mean), f(e.signedMean), f(e.rms), f(e.p95), f(e.max), e.n ? e.withinShare.toFixed(3) : '']);
  return rows.map((r) => r.map(q).join(',')).join('\n') + '\n';
}
