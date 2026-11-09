/* SPDX-License-Identifier: Apache-2.0 */
/**
 * engine.js — scan to BIM (0.9 SU.1132, session `scan-bim-09`): walls, floors and openings PROPOSED from a point cloud. DOM-free; nothing here changes a model.
 * It sits on the 0.7 plan-trace code (scan-walls.js, scan-propose.js, cloud-slice.js, model-rooms.js, copied byte for byte from BimCraft by tools/scanbim/sync.mjs) and adds
 * what a whole building needs: the floors found from a histogram of heights, a slice per level, the thickness read from the points when a wall was scanned from both sides,
 * the height of each wall, door and window openings found as gaps in the wall's own points, and a measured deviation (mm) for every proposal.
 * Points are plain arrays in millimetres in the plan's axes (x, y) and z up; the host puts the cloud's file coordinates there.
 *
 *   new ZHistogram(bin = 20)   .add(zMm) · .addMany(array) · .planes() → [{ z, count }]      the horizontal planes: peaks of the height histogram
 *   storeysFromPlanes(planes) → [{ floor, ceiling|null, height|null, floorCount, ceilingCount, note }]   the lowest plane is a floor; a plane at least 1.8 m above a floor is its
 *        ceiling; a plane less than 1.8 m above is furniture or a ledge and is left out; the next plane after a ceiling is the next floor. A guess the person can overrule.
 *   proposeStorey({ n, x, y, z }, { floor, ceiling }, opts) → { walls, openings, floors, rooms, problems, notes, slice }
 *        walls     [{ id, a, b, thickness, thicknessFrom: 'points'|'assumed', height, heightFrom: 'ceiling'|'points'|'assumed', deviation: { rms, max, n } mm, points }]
 *        openings  [{ id, kind: 'door'|'window', wall, offset, width, sill, height, deviation: { rms, n } mm }]     offset = from the wall's start to the opening's near edge
 *        floors    [{ id, poly, area (m²), z, deviation: { rms, n } mm }]   one per closed room the walls make; deviation = how far the floor points sit from the plane
 *   Every number is measured from the points; `thicknessFrom: 'assumed'` and `heightFrom: 'assumed'` say it was not (a wall seen from one side has no measurable thickness).
 */
import { proposeFromScan } from './scan-propose.js';
import { squareAngle } from './cloud-slice.js';
import { scanWalls } from './scan-walls.js';
import { planLoops, inPoly } from './model-rooms.js';

export const DEFAULTS = { thickness: 150, snap: 350, sliceAt: 1200, sliceThick: 200, maxSlice: 250000, cell: 50, doorMax: 3200, minOpening: 400, assumedHeight: 2700 };
const r1 = (v) => Math.round(v * 10) / 10;
const rms = (a) => (a.length ? Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length) : null);

// ------------------------------------------------------------------------------------------------ floors: the horizontal planes
export class ZHistogram {
  constructor(bin = 20) { this.bin = bin; this.c = new Map(); this.s = new Map(); this.n = 0; }
  /** From the host's { bin, counts: [[bin, n]…], sums: [[bin, Σz]…] }. */
  static fromData(d) { const h = new ZHistogram(d.bin); for (const [k, c] of d.counts) { h.c.set(k, c); h.n += c; } for (const [k, v] of d.sums) h.s.set(k, v); return h; }
  add(z) { const k = Math.floor(z / this.bin); this.c.set(k, (this.c.get(k) || 0) + 1); this.s.set(k, (this.s.get(k) || 0) + z); this.n++; }
  addMany(zs) { for (let i = 0; i < zs.length; i++) this.add(zs[i]); }
  /** Peaks of the height histogram: where many points share one height (a floor, a ceiling, a table top). */
  planes({ minShare = 0.12, minCount = 100, prominence = 4 } = {}) {
    if (!this.c.size) return [];
    const ks = [...this.c.keys()], lo = Math.min(...ks) - 2, hi = Math.max(...ks) + 2, n = hi - lo + 1;
    const c = new Float64Array(n), s = new Float64Array(n);
    for (const [k, v] of this.c) { c[k - lo] = v; s[k - lo] = this.s.get(k); }
    const w = new Float64Array(n);
    for (let i = 1; i < n - 1; i++) w[i] = c[i - 1] + c[i] + c[i + 1];
    let max = 0; for (let i = 0; i < n; i++) if (w[i] > max) max = w[i];
    // a plane stands out from the background of wall and furniture points: several times the median of the occupied bins
    const occ = []; for (let i = 0; i < n; i++) if (w[i] > 0) occ.push(w[i]);
    occ.sort((a, b) => a - b);
    const bg = occ.length ? occ[occ.length >> 1] : 0;
    const reach = Math.max(2, Math.round(60 / this.bin)), peaks = [];
    for (let i = 1; i < n - 1; i++) {
      if (w[i] < minCount || w[i] < minShare * max || w[i] < prominence * bg) continue;
      let top = true;
      for (let j = Math.max(1, i - reach); j <= Math.min(n - 2, i + reach) && top; j++) if (j !== i && (w[j] > w[i] || (w[j] === w[i] && j < i))) top = false;
      if (!top) continue;
      const cnt = c[i - 1] + c[i] + c[i + 1], sum = s[i - 1] + s[i] + s[i + 1];
      peaks.push({ z: sum / cnt, count: cnt });
    }
    peaks.sort((a, b) => a.z - b.z);
    const out = [];   // peaks within 100 mm are one plane
    for (const p of peaks) { const last = out[out.length - 1]; if (last && p.z - last.z < 100) { if (p.count > last.count) out[out.length - 1] = p; } else out.push(p); }
    return out;
  }
}

export function storeysFromPlanes(planes, { minHeight = 1800, maxHeight = 12000 } = {}) {
  const out = [];
  let cur = null, last = null;   // last = the plane the next one is measured from
  for (const p of planes) {
    if (!cur) { cur = { floor: p.z, ceiling: null, floorCount: p.count, ceilingCount: 0 }; last = p; continue; }
    if (cur.ceiling == null) {
      const gap = p.z - cur.floor;
      if (gap < minHeight) continue;                                     // furniture, a ledge, a stair landing: not a floor
      if (gap <= maxHeight) { cur.ceiling = p.z; cur.ceilingCount = p.count; last = p; continue; }
      out.push(cur); cur = { floor: p.z, ceiling: null, floorCount: p.count, ceilingCount: 0 }; last = p; continue;   // too far: no ceiling seen, a new floor
    }
    out.push(cur);                                                       // the plane after a ceiling is the next floor
    cur = { floor: p.z, ceiling: null, floorCount: p.count, ceilingCount: 0 }; last = p;
  }
  if (cur) out.push(cur);
  return out.map((s, i) => ({ ...s, index: i, height: s.ceiling != null ? s.ceiling - s.floor : null,
    note: s.ceiling != null ? 'floor and ceiling seen' : 'no ceiling seen above this floor' }));
}

// ------------------------------------------------------------------------------------------------ one level
const unit = (a, b) => { const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1; return [(b[0] - a[0]) / L, (b[1] - a[1]) / L, L]; };

/** The slice of a level at `at` mm over the floor, thinned: Float64Array xy, n. */
export function sliceAt(P, floor, { at = DEFAULTS.sliceAt, thick = DEFAULTS.sliceThick, max = DEFAULTS.maxSlice } = {}) {
  const keep = [];
  for (let i = 0; i < P.n; i++) { const dz = P.z[i] - floor; if (dz >= at - thick / 2 && dz <= at + thick / 2) keep.push(i); }
  const step = keep.length > max ? keep.length / max : 1, cnt = Math.min(keep.length, max), xy = new Float64Array(cnt * 2);
  for (let k = 0; k < cnt; k++) { const i = keep[Math.floor(k * step)]; xy[2 * k] = P.x[i]; xy[2 * k + 1] = P.y[i]; }
  return { xy, n: cnt, total: keep.length };
}

/**
 * A wall scanned from both sides shows two faces 60 to 500 mm apart. Find those pairs (in the squared frame): two thin piles of points on parallel lines, both running
 * together for at least 600 mm; pull the points of both onto the middle line so the wall finder sees one wall, and keep the measured gap. A cabinet front beside a wall
 * looks the same (solid between two faces); the person sees "thickness from points" and can change it.
 */
function collapseFaces(xy, n, angle) {
  const ca = Math.cos((-angle * Math.PI) / 180), sa = Math.sin((-angle * Math.PI) / 180);
  const uv = (p) => [p[0] * ca - p[1] * sa, p[0] * sa + p[1] * ca];
  const U = new Float64Array(n), V = new Float64Array(n);
  for (let i = 0; i < n; i++) { const q = uv([xy[2 * i], xy[2 * i + 1]]); U[i] = q[0]; V[i] = q[1]; }
  const pairs = [];
  for (const dir of ['x', 'y']) {
    const P = dir === 'x' ? V : U, Q = dir === 'x' ? U : V, bin = 10;
    let lo = Infinity; for (let i = 0; i < n; i++) if (P[i] < lo) lo = P[i];
    const h = new Map();
    for (let i = 0; i < n; i++) { const k = Math.floor((P[i] - lo) / bin); h.set(k, (h.get(k) || 0) + 1); }
    const peaks = [];
    for (const [k, c] of h) {
      if (c < 25) continue;
      let top = true;
      for (let d = -2; d <= 2 && top; d++) { const o = h.get(k + d) || 0; if (d && (o > c || (o === c && d < 0))) top = false; }
      if (top) peaks.push({ k, c });
    }
    peaks.sort((a, b) => b.c - a.c);
    // each peak: the mean across position and the runs along it
    const info = peaks.slice(0, 60).map((pk) => {
      const own = [], sum = { s: 0, c: 0 };
      for (let i = 0; i < n; i++) if (Math.abs(P[i] - (lo + (pk.k + 0.5) * bin)) <= 15) { own.push(Q[i]); sum.s += P[i]; sum.c++; }
      own.sort((a, b) => a - b);
      const runs = []; let st = own[0], prev = own[0], cnt = 1;
      for (let i = 1; i <= own.length; i++) {
        if (i === own.length || own[i] - prev > 450) { if (prev - st >= 600 && cnt >= 25) runs.push([st, prev]); st = own[i]; cnt = 0; }
        prev = own[i]; cnt++;
      }
      return { c: pk.c, at: sum.s / sum.c, runs };
    }).filter((x) => x.runs.length);
    const used = new Set();
    for (let i = 0; i < info.length; i++) for (let j = 0; j < info.length; j++) {
      if (i === j || used.has(i) || used.has(j) || info[i].at >= info[j].at) continue;
      const gap = info[j].at - info[i].at;
      if (gap < 60 || gap > 500) continue;
      const segs = [];
      for (const a of info[i].runs) for (const b of info[j].runs) { const s0 = Math.max(a[0], b[0]), s1 = Math.min(a[1], b[1]); if (s1 - s0 >= 600) segs.push([s0, s1]); }
      if (!segs.length) continue;
      used.add(i); used.add(j);
      for (const [s0, s1] of segs) pairs.push({ dir, lo: s0 - 60, hi: s1 + 60, c0: info[i].at, c1: info[j].at, gap, mid: (info[i].at + info[j].at) / 2 });
    }
  }
  if (!pairs.length) return { xy, pairs: [], uv };
  const out = new Float64Array(xy.length), cb = Math.cos((angle * Math.PI) / 180), sb = Math.sin((angle * Math.PI) / 180);
  for (let i = 0; i < n; i++) {
    let u = U[i], v = V[i];
    for (const p of pairs) {
      const across = p.dir === 'x' ? v : u, along = p.dir === 'x' ? u : v;
      if (along >= p.lo && along <= p.hi && across >= p.c0 - 25 && across <= p.c1 + 25) { if (p.dir === 'x') v = p.mid; else u = p.mid; break; }
    }
    out[2 * i] = u * cb - v * sb; out[2 * i + 1] = u * sb + v * cb;
  }
  return { xy: out, pairs, uv };
}

export function proposeStorey(P, level, o = {}) {
  const O = { ...DEFAULTS, ...o }, problems = [], notes = [];
  const floor = level.floor, ceiling = level.ceiling ?? null;
  const sl = sliceAt(P, floor, { at: O.sliceAt, thick: O.sliceThick, max: O.maxSlice });
  if (sl.n < 100) return { walls: [], openings: [], floors: [], rooms: [], problems, notes: ['Too few points at ' + O.sliceAt + ' mm over this floor (' + sl.n + ') to find walls.'], slice: { n: sl.n } };
  // the scan's own wall direction, as propose does
  const sq = squareAngle(sl.xy, sl.n, { cell: 200 }), sure = sq && sq.strength >= 0.2 && sq.walls >= 40, angle = sure ? sq.angle : 0;
  const col = collapseFaces(sl.xy, sl.n, angle);
  const r = proposeFromScan(col.xy, sl.n, { thickness: O.thickness, snap: O.snap, doorMax: O.doorMax });
  notes.push(...r.notes);
  const walls = [];
  const wallProps = r.proposals.filter((p) => p.kind === 'wall');
  // the scan's points near every wall, in the wall's own axes
  for (const p of wallProps) {
    const [ex, ey, L] = unit(p.a, p.b), nx = -ey, ny = ex;
    // thickness: from a measured face pair on this line (points), else the assumed one
    let thickness = O.thickness, from = 'assumed';
    const ua = col.uv(p.a), ub = col.uv(p.b);
    let gs = 0, gl = 0;
    for (const pr of col.pairs) {
      if ((pr.dir === 'x') !== (p.dir === 'x')) continue;
      const across = pr.dir === 'x' ? (ua[1] + ub[1]) / 2 : (ua[0] + ub[0]) / 2, a0 = pr.dir === 'x' ? Math.min(ua[0], ub[0]) : Math.min(ua[1], ub[1]), a1 = pr.dir === 'x' ? Math.max(ua[0], ub[0]) : Math.max(ua[1], ub[1]);
      const ov = Math.min(a1, pr.hi) - Math.max(a0, pr.lo);
      if (Math.abs(across - pr.mid) < 60 && ov > 300) { gs += pr.gap * ov; gl += ov; }
    }
    if (gl) { thickness = Math.round(gs / gl / 5) * 5; from = 'points'; }
    // wall height and the points of the wall over its whole height
    const band = thickness / 2 + 120, near = [];
    for (let i = 0; i < P.n; i++) {
      const dz = P.z[i] - floor;
      if (dz < -60 || (ceiling != null && dz > ceiling - floor + 60)) continue;
      const dx = P.x[i] - p.a[0], dy = P.y[i] - p.a[1], along = dx * ex + dy * ey, across = dx * nx + dy * ny;
      if (along < -60 || along > L + 60 || Math.abs(across) > band) continue;
      near.push(along, across, dz);
    }
    let height = O.assumedHeight, hFrom = 'assumed';
    if (ceiling != null) { height = Math.round(ceiling - floor); hFrom = 'ceiling'; }
    else if (near.length >= 150) { const zs = []; for (let k = 2; k < near.length; k += 3) zs.push(near[k]); zs.sort((a, b) => a - b); height = Math.round(zs[Math.floor(zs.length * 0.98)] / 10) * 10; hFrom = 'points'; }
    // deviation: the slice points of this wall against its two faces (a wall seen from one side shows one face)
    const dev = [];
    for (let i = 0; i < sl.n; i++) {
      const dx = sl.xy[2 * i] - p.a[0], dy = sl.xy[2 * i + 1] - p.a[1], along = dx * ex + dy * ey, across = dx * nx + dy * ny;
      if (along < 0 || along > L || Math.abs(across) > thickness / 2 + 120) continue;
      const d = Math.abs(Math.abs(across) - thickness / 2);
      if (d <= 60) dev.push(d);   // the scatter of the points that sit on a face (other walls meeting this one are not counted)
    }
    // a collapsed pair is measured on the original points, not the collapsed ones
    const w = { id: p.id, a: p.a, b: p.b, thickness, thicknessFrom: from, height, heightFrom: hFrom, points: p.points, ends: p.ends,
      deviation: { rms: dev.length ? r1(rms(dev)) : null, max: dev.length ? r1(Math.max(...dev)) : null, n: dev.length }, _near: near };
    walls.push(w);
  }
  // face pairs were collapsed for the finder: measure the deviation of those walls on the original slice
  for (const w of walls) if (w.thicknessFrom === 'points') {
    const [ex, ey, L] = unit(w.a, w.b), nx = -ey, ny = ex, dev = [];
    for (let i = 0; i < sl.n; i++) {
      const dx = sl.xy[2 * i] - w.a[0], dy = sl.xy[2 * i + 1] - w.a[1], along = dx * ex + dy * ey, across = dx * nx + dy * ny;
      if (along < 0 || along > L || Math.abs(across) > w.thickness / 2 + 120) continue;
      const d = Math.abs(Math.abs(across) - w.thickness / 2);
      if (d <= 60) dev.push(d);
    }
    w.deviation = { rms: dev.length ? r1(rms(dev)) : null, max: dev.length ? r1(Math.max(...dev)) : null, n: dev.length };
  }
  // openings: gaps in the wall's own points (elevation: along the wall × height over the floor)
  const openings = [];
  let on = 0;
  for (const w of walls) {
    const [, , L] = unit(w.a, w.b), H = w.height, cell = O.cell, nc = Math.ceil(L / cell), nr = Math.ceil(H / cell);
    if (nc < 4 || nr < 4) continue;
    const g = new Uint16Array(nc * nr), near = w._near;
    for (let k = 0; k < near.length; k += 3) {
      const c = Math.floor(near[k] / cell), rr = Math.floor(near[k + 2] / cell);
      if (c >= 0 && c < nc && rr >= 0 && rr < nr) g[rr * nc + c]++;
    }
    const seen = new Uint8Array(nc * nr), minW = Math.round(O.minOpening / cell);
    for (let s = 0; s < nc * nr; s++) {
      if (g[s] || seen[s]) continue;
      const q = [s]; seen[s] = 1;
      let c0 = nc, c1 = -1, r0 = nr, r1_ = -1, size = 0;
      for (let h = 0; h < q.length; h++) {
        const v = q[h], c = v % nc, rr = (v - c) / nc; size++;
        if (c < c0) c0 = c; if (c > c1) c1 = c; if (rr < r0) r0 = rr; if (rr > r1_) r1_ = rr;
        for (const nb of [c > 0 ? v - 1 : -1, c < nc - 1 ? v + 1 : -1, rr > 0 ? v - nc : -1, rr < nr - 1 ? v + nc : -1]) if (nb >= 0 && !g[nb] && !seen[nb]) { seen[nb] = 1; q.push(nb); }
      }
      const bw = c1 - c0 + 1, bh = r1_ - r0 + 1;
      if (bw < minW || bh < minW || bw * cell > 3600 || size < 0.8 * bw * bh) continue;   // not a rectangle, too small or too big for an opening
      if (c0 <= 1 || c1 >= nc - 2) continue;                                                // reaches the wall's end: a corner the scan missed, not an opening
      if (r1_ >= nr - 1) continue;                                                          // reaches the top: no wall above it
      // refine the four edges from the points beside them: the 98th percentile of the points that end there (an outlier does not move an edge); the gap from each edge
      // to the nearest point is the deviation, and the points left INSIDE the rectangle are counted
      const lo = c0 * cell, hi = (c1 + 1) * cell, bot = r0 * cell, top = (r1_ + 1) * cell;
      const edge = { l: [], r: [], b: [], t: [] };
      let inside = 0;
      for (let k = 0; k < near.length; k += 3) {
        const al = near[k], dz = near[k + 2];
        if (dz > bot + 40 && dz < top - 40) { if (al < lo && al >= lo - 120) edge.l.push(al); if (al >= hi && al < hi + 120) edge.r.push(al); }
        if (al > lo + 40 && al < hi - 40) { if (dz < bot && dz >= bot - 120) edge.b.push(dz); if (dz >= top && dz < top + 120) edge.t.push(dz); }
        if (al > lo + 40 && al < hi - 40 && dz > bot + 40 && dz < top - 40) inside++;
      }
      const pct = (a, q, up) => { if (!a.length) return null; a = a.slice().sort((x, y) => x - y); return up ? a[Math.min(a.length - 1, Math.floor(a.length * q))] : a[Math.max(0, Math.ceil(a.length * (1 - q)) - 1)]; };
      let lE = pct(edge.l, 0.98, true) ?? lo, rE = pct(edge.r, 0.98, false) ?? hi, bE = pct(edge.b, 0.98, true) ?? bot, tE = pct(edge.t, 0.98, false) ?? top;
      // the nearest sampled point to a true edge is, on average, half the point spacing short of it: move each edge half a spacing into the opening
      const sp = Math.min(60, Math.sqrt((L * H) / Math.max(1, near.length / 3))), half = sp / 2;
      const raw = { l: lE, r: rE, b: bE, t: tE };
      if (edge.l.length) lE += half; if (edge.r.length) rE -= half; if (edge.b.length && bE > 100) bE += half; if (edge.t.length) tE -= half;
      const gaps = [];
      if (edge.l.length) gaps.push(raw.l - Math.max(...edge.l)); if (edge.r.length) gaps.push(Math.min(...edge.r) - raw.r);
      if (edge.b.length) gaps.push(raw.b - Math.max(...edge.b)); if (edge.t.length) gaps.push(Math.min(...edge.t) - raw.t);
      const resid = gaps;
      const sill = Math.max(0, bE <= 100 || bot === 0 ? 0 : Math.round(bE)), width = Math.round(rE - lE), height = Math.round(tE - (sill === 0 ? 0 : sill));
      const kind = sill === 0 ? 'door' : 'window';
      if (width < O.minOpening || height < O.minOpening) continue;
      openings.push({ id: (kind === 'door' ? 'd' : 'n') + (++on), kind, wall: w.id, offset: Math.max(0, Math.round(lE)), width, sill, height, deviation: { rms: resid.length ? r1(rms(resid)) : null, n: edge.l.length + edge.r.length + edge.b.length + edge.t.length, inside } });
    }
  }
  for (const w of walls) delete w._near;
  // rooms and floors: rectangles of the walls as scan-propose does, with the measured thickness
  const polys = walls.map((w) => {
    const [ex, ey, L] = unit(w.a, w.b), h = w.thickness / 2, nx = -ey * h, ny = ex * h, e0 = w.ends[0] ? h : 0, e1 = w.ends[1] ? h : 0;
    const a = [w.a[0] - ex * e0, w.a[1] - ey * e0], b = [w.b[0] + ex * e1, w.b[1] + ey * e1];
    void L;
    return [[a[0] - nx, a[1] - ny], [b[0] - nx, b[1] - ny], [b[0] + nx, b[1] + ny], [a[0] + nx, a[1] + ny]];
  });
  const rooms = polys.length ? planLoops(polys).rooms.map((m) => ({ area: r1(m.area / 1e6), centroid: m.centroid.map(r1), poly: m.poly.map((q) => q.map(r1)) })) : [];
  const floors = rooms.map((m, i) => {
    const dz = [];
    const edgeDist = (x, y) => { let best = Infinity; for (let q = 0; q < m.poly.length; q++) { const a = m.poly[q], b = m.poly[(q + 1) % m.poly.length], vx = b[0] - a[0], vy = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / (vx * vx + vy * vy || 1))); best = Math.min(best, Math.hypot(x - a[0] - t * vx, y - a[1] - t * vy)); } return best; };
    for (let k = 0; k < P.n; k++) { const d = P.z[k] - floor; if (d > -60 && d < 60 && inPoly(P.x[k], P.y[k], m.poly) && edgeDist(P.x[k], P.y[k]) > 200) dz.push(d); }   // away from the walls, whose lowest points are not floor
    const mean = dz.length ? dz.reduce((s, v) => s + v, 0) / dz.length : 0;
    return { id: 'f' + (i + 1), poly: m.poly, area: m.area, z: Math.round(floor), deviation: { rms: dz.length ? r1(rms(dz.map((v) => v - mean))) : null, n: dz.length } };
  });
  problems.push(...r.problems);
  if (walls.length && !rooms.length) problems.push({ code: 'scanbim.noroom', severity: 'note', text: 'The proposed walls do not close a room, so no floor is proposed.' });
  if (ceiling == null) problems.push({ code: 'scanbim.noceiling', severity: 'note', text: 'No ceiling was seen above this floor: wall heights are taken from the wall points (or ' + O.assumedHeight + ' mm where there are too few).' });
  notes.push('Windows lower or higher than the cut are found only when the points around them show the gap; a shadow in the scan looks like an opening, so each one shows its size and edge scatter.');
  return { walls, openings, floors, rooms, problems, notes, angle, slice: { n: sl.n, total: sl.total } };
}

/** A Plan-axes point to mm: file metres + offset (metres) → mm. */
export const toMm = (v, off) => (v + off) * 1000;
