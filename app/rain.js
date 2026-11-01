/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rain.js — "Make it rain" (0.8 EG.69): 2D overland flow on the graded ground. Rain falls on a grid made from the ground surface;
 * the water runs downhill, collects in low spots (ponding), spills over rims (overtopping) and leaves at the edges, with the
 * depths kept as frames so the UI can play it. No DOM, no strings (the UI words the codes). Tested by bin/test-civilcraft-rain.mjs.
 *
 * Maths (all published, nothing copied):
 *  - Flow: the local inertial form of the shallow-water equations, Bates, Horritt and Fewtrell (2010), "A simple inertial
 *    formulation of the shallow water equations for efficient two-dimensional flood inundation modelling", J. Hydrology 387,
 *    33–45. Per cell face: q = (q − g·hf·dt·dη/dx) / (1 + g·dt·n²·|q| / hf^(7/3)), hf = max(η) − max(z) between the two cells,
 *    dt = α·Δx / √(g·hmax). Cell depths by continuity. Froude capped at 1 on faces (as flood codes do for stability).
 *  - Depressions: the Priority-Flood fill, Barnes, Lehman and Mulla (2014), Computers & Geosciences 62, 117–127 — the
 *    filled surface minus the ground is the water a low spot holds before it spills; its highest filled level is the SILL.
 *  - Design storm from an IDF curve: the alternating block method (Chow, Maidment and Mays 1988, Applied Hydrology § 14.4).
 *
 * Everything inside is SI (metres, seconds). A DEM keeps `cellM` (metres) and `unit` (project length per metre) so results map back.
 *
 *   demFromSurface(surface, { cell, units, bounds, maxCells, mask }) → dem | null
 *       cell = grid size in project units. dem = { nx, ny, cell (project units), cellM, unit, x0, y0, z: Float64Array (metres; NaN = no ground),
 *       block: Uint8Array (1 = a wall: a building), n: Float64Array|null (roughness by cell), loss: Float64Array|null (mm/h by cell) }
 *   demFromGrid(z, nx, ny, cellM, { x0, y0, unit }) → dem      a ready grid (tests, imported DEMs)
 *   paint(dem, polys, field, value)        field 'block' | 'n' | 'loss': set cells whose centres lie inside any polygon [{ x, y }]
 *   findDepressions(dem, { minDepth }) → { filled, label, ponds: [{ id, cells, area, volume, maxDepth, sill, x, y }] }
 *   new RainSim(dem, opts) → sim            opts: rain (mm/h number | [{ t (min), i (mm/h) }]), duration (min), tEnd (min), n (Manning, default 0.035),
 *       lossRate (mm/h, default 0), abstraction (mm, default 0), edge ('open' | 'closed'), edgeSlope, alpha (0.7), dtMax (s),
 *       drains [{ x, y, cap (L/s), name }], gauges [{ x, y, name }], frames (max count), frameBytes (budget), hmin (m), minPond (m)
 *   sim.advance(maxSteps) → true while there is more to do;  sim.run() runs it all;  sim.result() → the numbers below
 *   result = { t, steps, cells, volumes {rain, loss, out, drained, stored, error}, hydrograph [{ t, out, rain, stored }],
 *       maxDepth: Float32Array, maxSpeed, firstWet (s; -1 = never), endDepth, frames [{ t, depth: Float32Array }],
 *       ponds [{ …findDepressions, peakVolume, endVolume, overtopped, overtopAt (s), spilled (m³) }], drains [{ name, taken (m³), offered, bypass }],
 *       gauges [{ name, t[], depth[] }], peak { q, t }, problems [{ code, … }] }
 *   alternatingBlock(idf, duration, step) → [{ t, i }]    idf(minutes) → mm/h; minutes, mm/h
 *   hyetoDepth(rain, duration) → mm   the rain's depth over its duration
 */

export const G = 9.80665;
const FT = 0.3048;

// ---------------------------------------------------------------------------
// The grid

export function demFromGrid(z, nx, ny, cellM, { x0 = 0, y0 = 0, unit = 1 } = {}) {
  return { nx, ny, cell: cellM * unit, cellM, unit, x0, y0, z: z instanceof Float64Array ? z : Float64Array.from(z), block: new Uint8Array(nx * ny), n: null, loss: null };
}

export function demFromSurface(surface, { cell, units = 'ft', bounds = null, maxCells = 4e6, mask = null } = {}) {
  if (!surface) return null;
  const b = bounds || surface.stats().bounds;
  const W = b.maxX - b.minX, H = b.maxY - b.minY;
  if (!(W > 0 && H > 0)) return null;
  let c = cell > 0 ? cell : Math.sqrt((W * H) / 40000);
  while ((W / c) * (H / c) > maxCells) c *= 1.25;
  const unit = units === 'm' ? 1 : 1 / FT, f = units === 'm' ? 1 : FT;   // unit = project length per metre; f = metres per project length
  const nx = Math.max(1, Math.round(W / c)), ny = Math.max(1, Math.round(H / c));
  c = Math.max(W / nx, H / ny);
  const z = new Float64Array(nx * ny);
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const x = b.minX + (i + 0.5) * c, y = b.minY + (j + 0.5) * c;
    const v = surface.elevationAt(x, y);
    z[j * nx + i] = v === null || v === undefined ? NaN : v * f;
  }
  const dem = { nx, ny, cell: c, cellM: c * f, unit, x0: b.minX, y0: b.minY, z, block: new Uint8Array(nx * ny), n: null, loss: null };
  if (mask) for (let k = 0; k < z.length; k++) if (!mask(dem.x0 + ((k % nx) + 0.5) * c, dem.y0 + (Math.floor(k / nx) + 0.5) * c)) z[k] = NaN;
  return dem;
}

const inPoly = (poly, x, y) => { let k = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const p = poly[i], q = poly[j]; if ((p.y > y) !== (q.y > y) && x < ((q.x - p.x) * (y - p.y)) / (q.y - p.y) + p.x) k = !k; } return k; };

export function paint(dem, polys, field, value) {
  if (!['block', 'n', 'loss'].includes(field)) return 0;
  if (field === 'n' && !dem.n) dem.n = new Float64Array(dem.nx * dem.ny).fill(NaN);
  if (field === 'loss' && !dem.loss) dem.loss = new Float64Array(dem.nx * dem.ny).fill(NaN);
  const list = (Array.isArray(polys?.[0]) ? polys : [polys]).filter((p) => p && p.length >= 3);
  let count = 0;
  for (const poly of list) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const p of poly) { x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y); }
    const i0 = Math.max(0, Math.floor((x0 - dem.x0) / dem.cell)), i1 = Math.min(dem.nx - 1, Math.ceil((x1 - dem.x0) / dem.cell));
    const j0 = Math.max(0, Math.floor((y0 - dem.y0) / dem.cell)), j1 = Math.min(dem.ny - 1, Math.ceil((y1 - dem.y0) / dem.cell));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
      if (!inPoly(poly, dem.x0 + (i + 0.5) * dem.cell, dem.y0 + (j + 0.5) * dem.cell)) continue;
      const k = j * dem.nx + i;
      if (field === 'block') dem.block[k] = value ? 1 : 0; else dem[field][k] = value;
      count++;
    }
  }
  return count;
}

export const cellAt = (dem, x, y) => {
  const i = Math.floor((x - dem.x0) / dem.cell), j = Math.floor((y - dem.y0) / dem.cell);
  return i >= 0 && j >= 0 && i < dem.nx && j < dem.ny ? j * dem.nx + i : -1;
};

// ---------------------------------------------------------------------------
// Depressions (Priority-Flood)

class Heap {
  constructor() { this.k = []; this.v = []; }
  get size() { return this.k.length; }
  push(key, val) {
    const K = this.k, V = this.v; let i = K.length; K.push(key); V.push(val);
    while (i > 0) { const p = (i - 1) >> 1; if (K[p] <= key) break; K[i] = K[p]; V[i] = V[p]; i = p; }
    K[i] = key; V[i] = val;
  }
  pop() {
    const K = this.k, V = this.v, rv = V[0], lk = K.pop(), lv = V.pop(), n = K.length;
    if (n) { let i = 0; for (;;) { let c = 2 * i + 1; if (c >= n) break; if (c + 1 < n && K[c + 1] < K[c]) c++; if (K[c] >= lk) break; K[i] = K[c]; V[i] = V[c]; i = c; } K[i] = lk; V[i] = lv; }
    return rv;
  }
}

export function findDepressions(dem, { minDepth = 0.005 } = {}) {
  const { nx, ny, z, block } = dem, N = nx * ny;
  const F = new Float64Array(N).fill(Infinity), done = new Uint8Array(N), heap = new Heap();
  const usable = (k) => !Number.isNaN(z[k]) && !block[k];
  const nb = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const k = j * nx + i;
    if (!usable(k)) continue;
    let edge = i === 0 || j === 0 || i === nx - 1 || j === ny - 1;
    if (!edge) for (const [di, dj] of nb) if (Number.isNaN(z[k + dj * nx + di])) { edge = true; break; }   // next to no ground = leaves the map
    if (edge) { F[k] = z[k]; done[k] = 1; heap.push(z[k], k); }
  }
  while (heap.size) {
    const k = heap.pop(), i = k % nx, j = (k - i) / nx;
    for (const [di, dj] of nb) {
      const a = i + di, b = j + dj;
      if (a < 0 || b < 0 || a >= nx || b >= ny) continue;
      const m = b * nx + a;
      if (done[m] || !usable(m)) continue;
      done[m] = 1;
      F[m] = Math.max(z[m], F[k]);
      heap.push(F[m], m);
    }
  }
  const label = new Int32Array(N).fill(-1), ponds = [];
  const stack = [];
  for (let k = 0; k < N; k++) {
    if (label[k] >= 0 || !done[k] || F[k] - z[k] <= minDepth) continue;
    const id = ponds.length, p = { id, cells: 0, area: 0, volume: 0, maxDepth: 0, sill: -Infinity, x: 0, y: 0, low: z[k] };
    stack.push(k); label[k] = id;
    while (stack.length) {
      const q = stack.pop(), i = q % nx, j = (q - i) / nx, d = F[q] - z[q];
      p.cells++; p.volume += d; if (d > p.maxDepth) p.maxDepth = d; if (F[q] > p.sill) p.sill = F[q];
      if (z[q] < p.low) { p.low = z[q]; p.x = dem.x0 + (i + 0.5) * dem.cell; p.y = dem.y0 + (j + 0.5) * dem.cell; }
      for (const [di, dj] of nb) {
        const a = i + di, b = j + dj;
        if (a < 0 || b < 0 || a >= nx || b >= ny) continue;
        const m = b * nx + a;
        if (label[m] >= 0 || !done[m] || F[m] - z[m] <= minDepth) continue;
        label[m] = id; stack.push(m);
      }
    }
    p.area = p.cells * dem.cellM * dem.cellM; p.volume *= dem.cellM * dem.cellM;
    ponds.push(p);
  }
  return { filled: F, label, ponds };
}

// ---------------------------------------------------------------------------
// Rain

export function rainAt(rain, tMin) {
  if (typeof rain === 'number') return rain;
  if (!Array.isArray(rain) || !rain.length) return 0;
  let v = 0;
  for (const r of rain) { if (r.t <= tMin) v = r.i; else break; }
  return v;
}

export function hyetoDepth(rain, duration) {
  if (typeof rain === 'number') return (rain * duration) / 60;
  let mm = 0;
  for (let k = 0; k < rain.length; k++) { const a = rain[k].t, b = k + 1 < rain.length ? Math.min(rain[k + 1].t, duration) : duration; if (b > a) mm += (rain[k].i * (b - a)) / 60; }
  return mm;
}

/** Alternating blocks: the biggest block in the middle, the next to its right, then left, and so on. */
export function alternatingBlock(idf, duration, step = 5) {
  const n = Math.max(1, Math.round(duration / step)), depths = [];
  let prev = 0;
  for (let k = 1; k <= n; k++) { const d = (idf(k * step) * k * step) / 60; depths.push(d - prev); prev = d; }
  const out = new Array(n); let lo = Math.floor((n - 1) / 2), hi = lo + 1, right = true;
  out[lo] = depths[0]; lo--;
  for (let k = 1; k < n; k++) { if (right && hi < n) out[hi++] = depths[k]; else if (lo >= 0) out[lo--] = depths[k]; else out[hi++] = depths[k]; right = !right; }
  return out.map((d, k) => ({ t: k * step, i: (d * 60) / step }));
}

// ---------------------------------------------------------------------------
// The simulation

export class RainSim {
  constructor(dem, opts = {}) {
    this.dem = dem;
    const { nx, ny } = dem, N = nx * ny;
    this.o = {
      rain: opts.rain ?? 50, duration: opts.duration ?? 60, tEnd: opts.tEnd ?? (opts.duration ?? 60) + 30, n: opts.n ?? 0.035,
      lossRate: opts.lossRate ?? 0, abstraction: opts.abstraction ?? 0, edge: opts.edge ?? 'open', edgeSlope: opts.edgeSlope ?? 0.001,
      alpha: opts.alpha ?? 0.7, dtMax: opts.dtMax ?? 5, hmin: opts.hmin ?? 1e-5, minPond: opts.minPond ?? 0.005,
      sides: opts.sides ?? null, frames: opts.frames ?? 60, frameBytes: opts.frameBytes ?? 96e6, rec: opts.rec ?? 0,
    };
    this.t = 0; this.steps = 0;
    this.h = new Float64Array(N);
    this.qx = new Float64Array((nx + 1) * ny);
    this.qy = new Float64Array(nx * (ny + 1));
    this.nCell = dem.n || null; this.lossCell = dem.loss || null;
    this.absLeft = new Float64Array(N).fill(this.o.abstraction / 1000);   // metres of depression storage still to fill
    this.maxDepth = new Float32Array(N); this.maxSpeed = new Float32Array(N); this.firstWet = new Float32Array(N).fill(-1);
    this.A = dem.cellM * dem.cellM;
    this.vol = { rain: 0, loss: 0, out: 0, drained: 0 };
    this.hydro = []; this.frames = []; this.hmax = 0.01;
    const live = []; for (let k = 0; k < N; k++) if (!Number.isNaN(dem.z[k]) && !dem.block[k]) live.push(k);
    this.live = Int32Array.from(live); this.activeCells = live.length;
    const tEndS = this.o.tEnd * 60;
    const nF = Math.max(2, Math.min(this.o.frames, Math.floor(this.o.frameBytes / Math.max(1, N * 4))));
    this.frameEvery = tEndS / nF; this.nextFrame = 0;
    this.recEvery = this.o.rec > 0 ? this.o.rec : Math.max(1, tEndS / 400); this.nextRec = 0;
    this.drains = (opts.drains || []).map((d, k) => ({ name: d.name || 'D' + (k + 1), cell: cellAt(dem, d.x, d.y), cap: Math.max(0, d.cap || 0) / 1000, taken: 0, offered: 0 })).filter((d) => d.cell >= 0 && !Number.isNaN(dem.z[d.cell]));
    this.gauges = (opts.gauges || []).map((g, k) => ({ name: g.name || 'G' + (k + 1), cell: cellAt(dem, g.x, g.y), t: [], depth: [] })).filter((g) => g.cell >= 0);
    this.problems = [];
    // depressions and their rims
    const dep = findDepressions(dem, { minDepth: this.o.minPond });
    this.ponds = dep.ponds.map((p) => ({ ...p, peakVolume: 0, endVolume: 0, overtopped: false, overtopAt: -1, spilled: 0, cellList: [] }));
    this.pondOf = dep.label;
    for (let k = 0; k < N; k++) if (dep.label[k] >= 0) this.ponds[dep.label[k]].cellList.push(k);
    this.rims = [];   // faces between a pond cell and anything else: [kind 0 x | 1 y, face index, pond of the low side, pond of the high side]
    if (this.ponds.length) {
      for (let j = 0; j < ny; j++) for (let i = 1; i < nx; i++) { const a = this.pondOf[j * nx + i - 1], b = this.pondOf[j * nx + i]; if (a !== b) this.rims.push(0, j * (nx + 1) + i, a, b); }
      for (let j = 1; j < ny; j++) for (let i = 0; i < nx; i++) { const a = this.pondOf[(j - 1) * nx + i], b = this.pondOf[j * nx + i]; if (a !== b) this.rims.push(1, j * nx + i, a, b); }
    }
    this.pondVol = new Float64Array(this.ponds.length);
    this.spillOut = new Float64Array(this.ponds.length);
    this.done = false;
  }

  intensity(t) { const o = this.o; return t >= o.duration * 60 ? 0 : rainAt(o.rain, t / 60) / 3.6e6; }   // mm/h → m/s

  step() {
    const { dem, h, qx, qy, o } = this, { nx, ny, z, cellM: dx } = dem, block = dem.block;
    const edgeOpen = o.edge === 'open', sd = o.sides || {};
    const openAt = (side) => (sd[side] === undefined ? edgeOpen : !!sd[side]);
    let dt = Math.min(o.dtMax, (o.alpha * dx) / Math.sqrt(G * Math.max(this.hmax, 0.01)));
    const tEndS = o.tEnd * 60;
    if (this.t + dt > tEndS) dt = tEndS - this.t;
    if (dt <= 0) { this.done = true; return; }
    const hmin = o.hmin, defN = o.n, nC = this.nCell;
    const nOf = (k) => { const v = nC ? nC[k] : NaN; return Number.isNaN(v) || v === undefined ? defN : v; };
    const wet = (k) => !Number.isNaN(z[k]) && !block[k];
    let qOutEdge = 0;
    // ---- face flows: x faces (between cell i-1 and i of row j)
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i <= nx; i++) {
        const f = j * (nx + 1) + i, a = i > 0 ? j * nx + i - 1 : -1, b = i < nx ? j * nx + i : -1;
        const A = a >= 0 && wet(a), B = b >= 0 && wet(b);
        if (A && B) {
          const ea = z[a] + h[a], eb = z[b] + h[b], hf = Math.max(ea, eb) - Math.max(z[a], z[b]);
          if (hf <= hmin) { qx[f] = 0; continue; }
          const n = (nOf(a) + nOf(b)) / 2, q0 = qx[f];
          let q = (q0 - G * hf * dt * ((eb - ea) / dx)) / (1 + (G * dt * n * n * Math.abs(q0)) / Math.pow(hf, 7 / 3));
          const lim = hf * Math.sqrt(G * hf); if (q > lim) q = lim; else if (q < -lim) q = -lim;
          qx[f] = q;
        } else if (A !== B) {   // one side is the outside (an edge, or no ground); a wall (building) is closed
          const c = A ? a : b, w = A ? b : a;
          if (!(w < 0 ? openAt(i === 0 ? 'w' : 'e') : edgeOpen) || (w >= 0 && block[w]) || h[c] <= hmin) { qx[f] = 0; continue; }
          const inner = A ? (i - 2 >= 0 ? j * nx + i - 2 : -1) : (i + 1 < nx ? j * nx + i + 1 : -1);   // the cell on the other side of c
          let S = o.edgeSlope;
          if (inner >= 0 && wet(inner)) S = Math.max(S, (z[c] - z[inner]) / dx);
          const q = Math.pow(h[c], 5 / 3) * Math.sqrt(S) / nOf(c), lim = h[c] * Math.sqrt(G * h[c]);
          qx[f] = (A ? 1 : -1) * Math.min(q, lim);
        } else qx[f] = 0;
      }
    }
    for (let j = 0; j <= ny; j++) {
      for (let i = 0; i < nx; i++) {
        const f = j * nx + i, a = j > 0 ? (j - 1) * nx + i : -1, b = j < ny ? j * nx + i : -1;
        const A = a >= 0 && wet(a), B = b >= 0 && wet(b);
        if (A && B) {
          const ea = z[a] + h[a], eb = z[b] + h[b], hf = Math.max(ea, eb) - Math.max(z[a], z[b]);
          if (hf <= hmin) { qy[f] = 0; continue; }
          const n = (nOf(a) + nOf(b)) / 2, q0 = qy[f];
          let q = (q0 - G * hf * dt * ((eb - ea) / dx)) / (1 + (G * dt * n * n * Math.abs(q0)) / Math.pow(hf, 7 / 3));
          const lim = hf * Math.sqrt(G * hf); if (q > lim) q = lim; else if (q < -lim) q = -lim;
          qy[f] = q;
        } else if (A !== B) {
          const c = A ? a : b, w = A ? b : a;
          if (!(w < 0 ? openAt(j === 0 ? 's' : 'n') : edgeOpen) || (w >= 0 && block[w]) || h[c] <= hmin) { qy[f] = 0; continue; }
          const inner = A ? (j - 2 >= 0 ? (j - 2) * nx + i : -1) : (j + 1 < ny ? (j + 1) * nx + i : -1);
          let S = o.edgeSlope;
          if (inner >= 0 && wet(inner)) S = Math.max(S, (z[c] - z[inner]) / dx);
          const q = Math.pow(h[c], 5 / 3) * Math.sqrt(S) / nOf(c), lim = h[c] * Math.sqrt(G * h[c]);
          qy[f] = (A ? 1 : -1) * Math.min(q, lim);
        } else qy[f] = 0;
      }
    }
    // ---- rain and losses first (they set how much water a cell has to give), then continuity with a limiter so no depth goes negative
    const rain = this.intensity(this.t + dt / 2), rainD = rain * dt;
    const lossD = ((this.o.lossRate) / 3.6e6) * dt;
    let hmax = 0, rainV = 0, lossV = 0;
    const live = this.live, k2 = dt / dx;
    for (let m = 0; m < live.length; m++) {
      const k = live[m], i = k % nx, j = (k - i) / nx;
      let add = rainD;
      rainV += rainD;
      // losses: depression storage first (a puddle store that fills), then the infiltration rate
      let have = h[k] + add;
      if (this.absLeft[k] > 0 && have > 0) { const s = Math.min(this.absLeft[k], have); this.absLeft[k] -= s; have -= s; add -= s; lossV += s; }
      const lr = this.lossCell && !Number.isNaN(this.lossCell[k]) ? (this.lossCell[k] / 3.6e6) * dt : lossD;
      if (lr > 0 && have > 0) { const s = Math.min(lr, have); add -= s; have -= s; lossV += s; }
      // outward flux of this cell
      const fW = j * (nx + 1) + i, fE = fW + 1, fS = j * nx + i, fN = fS + nx;
      let out = 0;
      if (qx[fW] < 0) out -= qx[fW]; if (qx[fE] > 0) out += qx[fE]; if (qy[fS] < 0) out -= qy[fS]; if (qy[fN] > 0) out += qy[fN];
      const avail = Math.max(0, h[k] + add);   // the water this cell may give away this step
      if (out * k2 > avail && out > 0) {
        const s = avail / (out * k2);
        if (qx[fW] < 0) qx[fW] *= s; if (qx[fE] > 0) qx[fE] *= s; if (qy[fS] < 0) qy[fS] *= s; if (qy[fN] > 0) qy[fN] *= s;
      }
      this.tmpAdd = this.tmpAdd || new Float64Array(nx * ny);
      this.tmpAdd[k] = add;
    }
    // a second pass: neighbours may have scaled a shared face from the other side; the smaller flux wins, so mass stays balanced
    const tmp = this.tmpAdd;
    for (let m = 0; m < live.length; m++) {
      const k = live[m], i = k % nx, j = (k - i) / nx;
      const fW = j * (nx + 1) + i, fE = fW + 1, fS = j * nx + i, fN = fS + nx;
      const inflow = qx[fW] - qx[fE] + qy[fS] - qy[fN];
      let hn = h[k] + tmp[k] + k2 * inflow;
      if (hn < 0) { if (hn < -1e-12) this.negativeSeen = true; hn = 0; }
      h[k] = hn;
      if (hn > hmax) hmax = hn;
      if (hn > this.maxDepth[k]) this.maxDepth[k] = hn;
      if (hn > hmin) {
        if (this.firstWet[k] < 0) this.firstWet[k] = this.t + dt;
        const u = (qx[fW] + qx[fE]) / 2, v = (qy[fS] + qy[fN]) / 2, sp = Math.hypot(u, v) / hn;
        if (sp > this.maxSpeed[k]) this.maxSpeed[k] = sp;
      }
    }
    // ---- drains (storm inlets): take water from their cell up to the capacity
    for (const d of this.drains) {
      const want = d.cap * dt, have = h[d.cell] * this.A, take = Math.min(want, have);
      d.offered += Math.max(want, 0); d.taken += take; this.vol.drained += take; h[d.cell] -= take / this.A;
      if (h[d.cell] < 0) h[d.cell] = 0;
    }
    // ---- water leaving across the edges, rims, hydrograph
    let outV = 0;
    const edgeSpill = (k, q) => { const pid = this.pondOf[k]; if (pid >= 0) this.spillOut[pid] += q * dx * dt; };   // a pond that touches the map edge spills off the map
    for (let j = 0; j < ny; j++) {
      const a = j * nx, b = j * nx + nx - 1, f0 = j * (nx + 1), f1 = f0 + nx;
      if (!Number.isNaN(z[a]) && !block[a] && qx[f0] < 0) { outV -= qx[f0]; edgeSpill(a, -qx[f0]); }
      if (!Number.isNaN(z[b]) && !block[b] && qx[f1] > 0) { outV += qx[f1]; edgeSpill(b, qx[f1]); }
    }
    for (let i = 0; i < nx; i++) {
      const a = i, b = (ny - 1) * nx + i;
      if (!Number.isNaN(z[a]) && !block[a] && qy[i] < 0) { outV -= qy[i]; edgeSpill(a, -qy[i]); }
      if (!Number.isNaN(z[b]) && !block[b] && qy[ny * nx + i] > 0) { outV += qy[ny * nx + i]; edgeSpill(b, qy[ny * nx + i]); }
    }
    // faces beside cells that have no ground (holes, edge of the TIN)
    let holeOut = 0;
    if (this.hasHoles === undefined) { this.hasHoles = false; for (let k = 0; k < z.length; k++) if (Number.isNaN(z[k])) { this.hasHoles = true; break; } }
    if (this.hasHoles) {
      for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
        const k = j * nx + i; if (!wet(k)) continue;
        const fW = j * (nx + 1) + i, fE = fW + 1, fS = j * nx + i, fN = fS + nx;
        if (i > 0 && Number.isNaN(z[k - 1]) && qx[fW] < 0) { holeOut -= qx[fW]; edgeSpill(k, -qx[fW]); }
        if (i < nx - 1 && Number.isNaN(z[k + 1]) && qx[fE] > 0) { holeOut += qx[fE]; edgeSpill(k, qx[fE]); }
        if (j > 0 && Number.isNaN(z[k - nx]) && qy[fS] < 0) { holeOut -= qy[fS]; edgeSpill(k, -qy[fS]); }
        if (j < ny - 1 && Number.isNaN(z[k + nx]) && qy[fN] > 0) { holeOut += qy[fN]; edgeSpill(k, qy[fN]); }
      }
    }
    outV += holeOut;
    const outStep = outV * dx * dt;   // m³ this step (q is m²/s along a face of length dx)
    this.vol.out += outStep; this.vol.rain += rainV * this.A; this.vol.loss += lossV * this.A;
    // rims: water crossing the edge of a pond (overtopping)
    const rims = this.rims;
    for (let r = 0; r < rims.length; r += 4) {
      const q = rims[r] === 0 ? qx[rims[r + 1]] : qy[rims[r + 1]];
      if (q === 0) continue;
      const lowP = rims[r + 2], highP = rims[r + 3], m = Math.abs(q) * dx * dt;
      if (q > 0 && lowP >= 0) this.spillOut[lowP] += m; else if (q < 0 && highP >= 0) this.spillOut[highP] += m;
    }
    this.t += dt; this.steps++; this.hmax = hmax;
    for (let p = 0; p < this.ponds.length; p++) {
      const P = this.ponds[p];
      if (!P.overtopped && this.spillOut[p] > Math.max(1e-3 * P.volume, 1e-4)) { P.overtopped = true; P.overtopAt = this.t; }
    }
    if (this.t >= this.nextRec - 1e-9) {
      this.nextRec += this.recEvery;
      let stored = 0; for (let m = 0; m < live.length; m++) stored += h[live[m]];
      this.hydro.push({ t: this.t, out: (outV * dx), rain: rain * this.activeCells * this.A, stored: stored * this.A });
      for (const g of this.gauges) { g.t.push(this.t); g.depth.push(h[g.cell]); }
      for (let p = 0; p < this.ponds.length; p++) {
        let v = 0; const c = this.ponds[p].cellList, F = this._filled || (this._filled = findDepressions(dem, { minDepth: this.o.minPond }).filled);
        for (let m = 0; m < c.length; m++) { const k = c[m], d = Math.min(h[k], Math.max(0, F[k] - z[k]) + h[k]); v += Math.min(d, h[k]); }
        v *= this.A; this.pondVol[p] = v; if (v > this.ponds[p].peakVolume) this.ponds[p].peakVolume = v;
      }
    }
    if (this.t >= this.nextFrame - 1e-9 && this.frames.length < this.o.frames + 1) { this.nextFrame += this.frameEvery; this.frames.push({ t: this.t, depth: Float32Array.from(h) }); }
    if (this.t >= tEndS - 1e-9) this.done = true;
  }

  advance(maxSteps = 200) {
    for (let s = 0; s < maxSteps && !this.done; s++) this.step();
    return !this.done;
  }

  run() { while (!this.done) this.step(); return this.result(); }

  result() {
    const { dem, h } = this, N = dem.nx * dem.ny;
    let stored = 0; for (let m = 0; m < this.live.length; m++) stored += h[this.live[m]];
    stored *= this.A;
    const v = this.vol, error = v.rain > 0 ? (v.rain - v.loss - v.out - v.drained - stored) / v.rain : 0;
    const F = this._filled || (this._filled = findDepressions(dem, { minDepth: this.o.minPond }).filled);
    const ponds = this.ponds.map((p) => {
      let held = 0; for (const k of p.cellList) held += Math.min(h[k], Math.max(0, F[k] - dem.z[k]) + 0) ;
      return { id: p.id, cells: p.cells, area: p.area, volume: p.volume, maxDepth: p.maxDepth, sill: p.sill, x: p.x, y: p.y, peakVolume: p.peakVolume, endVolume: held * this.A, overtopped: p.overtopped, overtopAt: p.overtopAt, spilled: this.spillOut[p.id] };
    });
    let peak = { q: 0, t: 0 }; for (const r of this.hydro) if (r.out > peak.q) peak = { q: r.out, t: r.t };
    const problems = [];
    if (this.negativeSeen) problems.push({ code: 'negative' });
    if (Math.abs(error) > 0.02) problems.push({ code: 'balance', error });
    for (const p of ponds) if (p.overtopped) problems.push({ code: 'overtop', pond: p.id, x: p.x, y: p.y, at: p.overtopAt, spilled: p.spilled });
    for (const d of this.drains) if (d.offered > 0 && d.taken < d.offered * 0.5 && d.taken < this.vol.rain * 0.0 + 1e9) { /* a drain that is not asked for its capacity is fine */ }
    return {
      t: this.t, steps: this.steps, cells: this.activeCells, volumes: { rain: v.rain, loss: v.loss, out: v.out, drained: v.drained, stored, error },
      hydrograph: this.hydro, maxDepth: this.maxDepth, maxSpeed: this.maxSpeed, firstWet: this.firstWet, endDepth: Float32Array.from(h), frames: this.frames,
      ponds, drains: this.drains.map((d) => ({ name: d.name, taken: d.taken, offered: d.offered, bypass: Math.max(0, d.offered - d.taken) })), gauges: this.gauges, peak, problems, dem: { nx: dem.nx, ny: dem.ny, cell: dem.cell, cellM: dem.cellM, unit: dem.unit, x0: dem.x0, y0: dem.y0 },
    };
  }
}

/** Run a whole simulation in slices (the UI's play button): calls onProgress(sim) every `slice` steps and yields to the page. */
export async function runSliced(sim, { slice = 40, onProgress = null, signal = null } = {}) {
  while (sim.advance(slice)) {
    if (signal?.aborted) return null;
    if (onProgress) onProgress(sim);
    await new Promise((r) => setTimeout(r, 0));
  }
  return sim.result();
}
