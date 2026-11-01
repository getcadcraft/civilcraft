/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer messages and problem codes; the words reach people through the Problems panel's catalog keys (problems-partcraft.js) */
/**
 * mfg.js — manufacturing checks on a voxel solid (0.8 CE.6; DOM-free). The checks a generated part needs before it goes to a
 * printer: the wall that is too thin, the gap or hole that is too narrow, the loose piece, the sealed cavity that traps
 * powder or resin, and the cavity whose way out is narrower than a powder-removal hole needs.
 *
 *   analyze(vox, profile) → { islands, voids, thinWalls, thinGaps, ... , problems: [problem] }
 *   vox = { h, nx, ny, nz, origin, solid: Uint8Array } (voxels.js toVoxelGrid, or voxel.js); lengths in the unit of h (millimetres).
 *   profile = a process profile (process.js): minWall, minGap, drain (or 0), needsDrain.
 *
 * Methods (all textbook image analysis, run on the voxel grid so the answer is only as fine as the voxel size, about one voxel):
 *   - Euclidean distance transform: Felzenszwalb and Huttenlocher, "Distance transforms of sampled functions", Theory of Computing 8 (2012) 415.
 *   - A wall thinner than t is a part of the solid that no ball of diameter t fits into: the morphological opening by a ball
 *     (Serra, Image Analysis and Mathematical Morphology, 1982), done as erosion then dilation, each a threshold on a distance
 *     transform. Convex corners are cut a little by an opening; a thin region counts only when some of it lies more than two
 *     voxels from the thick material, so corner roundings are not reported. The same on the empty space gives gaps and holes.
 *   - Islands and cavities: connected components with 6-neighbours; empty space reached from the outside is open, the rest sealed.
 *   - A cavity whose exits are narrower than the drain diameter: the empty space eroded by the drain radius no longer connects it
 *     to the outside.
 * Problems come in the shared shape (docs/0.8-PROBLEMS-SPEC.md § 1): code, severity, req/found in mm, about, where.
 */
const INF = 1e20;

// ---- squared Euclidean distance transform in voxel units -------------------------------------------------------------------
function edt1d(f, n, d, v, z) {                     // lower envelope of parabolas rooted at the samples f[q]
  let k = 0;
  v[0] = 0; z[0] = -INF; z[1] = INF;
  for (let q = 1; q < n; q++) {
    let s;
    for (;;) {
      const p = v[k];
      s = ((f[q] + q * q) - (f[p] + p * p)) / (2 * q - 2 * p);
      if (s <= z[k] && k > 0) k--; else break;
    }
    if (s <= z[k]) { v[0] = q; z[0] = -INF; z[1] = INF; k = 0; continue; }
    k++; v[k] = q; z[k] = s; z[k + 1] = INF;
  }
  k = 0;
  for (let q = 0; q < n; q++) {
    while (z[k + 1] < q) k++;
    const dq = q - v[k];
    d[q] = dq * dq + f[v[k]];
  }
}
/** src: Uint8Array, 1 = in the set. Returns Float32Array: for a voxel in the set the squared distance (voxels²) to the nearest voxel not in the set; 0 outside. */
export function distanceSquared(src, nx, ny, nz) {
  const out = new Float32Array(src.length);
  for (let i = 0; i < src.length; i++) out[i] = src[i] ? INF : 0;
  const m = Math.max(nx, ny, nz), f = new Float64Array(m), d = new Float64Array(m), v = new Int32Array(m), z = new Float64Array(m + 1);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) {                               // along x
    const o = nx * (j + ny * k);
    for (let i = 0; i < nx; i++) f[i] = out[o + i];
    edt1d(f, nx, d, v, z);
    for (let i = 0; i < nx; i++) out[o + i] = d[i];
  }
  for (let k = 0; k < nz; k++) for (let i = 0; i < nx; i++) {                               // along y
    for (let j = 0; j < ny; j++) f[j] = out[i + nx * (j + ny * k)];
    edt1d(f, ny, d, v, z);
    for (let j = 0; j < ny; j++) out[i + nx * (j + ny * k)] = d[j];
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {                               // along z
    for (let k = 0; k < nz; k++) f[k] = out[i + nx * (j + ny * k)];
    edt1d(f, nz, d, v, z);
    for (let k = 0; k < nz; k++) out[i + nx * (j + ny * k)] = d[k];
  }
  return out;
}

/** Connected components (6-neighbours) of the voxels where mask[i] = 1 → { label: Int32Array (−1 outside), sizes: number[], sum: [[x,y,z sums]] }. */
export function components(mask, nx, ny, nz) {
  const n = mask.length, label = new Int32Array(n).fill(-1), sizes = [], sums = [], stack = new Int32Array(n);
  const nxy = nx * ny;
  for (let s = 0; s < n; s++) {
    if (!mask[s] || label[s] >= 0) continue;
    const id = sizes.length;
    let sp = 0, cnt = 0, sx = 0, sy = 0, sz = 0;
    stack[sp++] = s; label[s] = id;
    while (sp) {
      const c = stack[--sp], i = c % nx, j = Math.floor(c / nx) % ny, k = Math.floor(c / nxy);
      cnt++; sx += i; sy += j; sz += k;
      if (i > 0 && mask[c - 1] && label[c - 1] < 0) { label[c - 1] = id; stack[sp++] = c - 1; }
      if (i < nx - 1 && mask[c + 1] && label[c + 1] < 0) { label[c + 1] = id; stack[sp++] = c + 1; }
      if (j > 0 && mask[c - nx] && label[c - nx] < 0) { label[c - nx] = id; stack[sp++] = c - nx; }
      if (j < ny - 1 && mask[c + nx] && label[c + nx] < 0) { label[c + nx] = id; stack[sp++] = c + nx; }
      if (k > 0 && mask[c - nxy] && label[c - nxy] < 0) { label[c - nxy] = id; stack[sp++] = c - nxy; }
      if (k < nz - 1 && mask[c + nxy] && label[c + nxy] < 0) { label[c + nxy] = id; stack[sp++] = c + nxy; }
    }
    sizes.push(cnt); sums.push([sx, sy, sz]);
  }
  return { label, sizes, sums };
}

/**
 * The parts of `mask` that are thinner than `t` voxels: the opening by a ball of diameter t removes them; a thin region counts when some of
 * it lies more than two voxels from the material that survives. → { count, voxels, thinnest (voxels, the thickest point of the thinnest region), at: [voxel centres of the regions] }
 */
function thinRegions(mask, nx, ny, nz, tVox) {
  // a voxel grid cannot tell 3.26 from 3.0 mm at 0.4 mm voxels: a feature is reported only when it is thinner than the limit by more than one voxel
  const d2 = distanceSquared(mask, nx, ny, nz), dk = (Math.max(1, tVox - 1) + 1) / 2, n = mask.length;
  const core = new Uint8Array(n);
  let anyCore = false;
  for (let i = 0; i < n; i++) if (mask[i] && d2[i] >= dk * dk - 1e-6) { core[i] = 1; anyCore = true; }
  // distance to the core: where it is within dk − 0.5 the voxel belongs to the opened (thick enough) set
  const notCore = new Uint8Array(n);
  for (let i = 0; i < n; i++) notCore[i] = core[i] ? 0 : 1;
  const toCore = anyCore ? distanceSquared(notCore, nx, ny, nz) : null;            // for a non-core voxel: squared distance to the nearest core voxel
  const thin = new Uint8Array(n), far = new Uint8Array(n);
  const r2 = (dk - 0.5) * (dk - 0.5);
  // an opening cuts an edge of the shape to a depth of 0.41 and a corner to 0.73 of its radius (distance to the surviving core beyond the
  // dilation reach: 0.41 dk + 0.5 and 0.73 dk + 0.5); only a region that reaches farther than that is a thin part of the shape
  const farD = (dk - 0.5) + 0.75 * dk + 1.5;
  for (let i = 0; i < n; i++) {
    if (!mask[i] || core[i]) continue;
    const dc = toCore ? toCore[i] : INF;
    if (dc > r2) { thin[i] = 1; if (dc > farD * farD) far[i] = 1; }
  }
  const comp = components(thin, nx, ny, nz), keep = new Uint8Array(comp.sizes.length);
  for (let i = 0; i < n; i++) if (far[i] && thin[i]) keep[comp.label[i]] = 1;
  const regions = [];
  const dmax = new Float64Array(comp.sizes.length);
  for (let i = 0; i < n; i++) if (thin[i] && keep[comp.label[i]]) { const c = comp.label[i]; if (d2[i] > dmax[c]) dmax[c] = d2[i]; }
  keep.forEach((k, c) => { if (k) regions.push({ voxels: comp.sizes[c], c: comp.sums[c].map((s) => s / comp.sizes[c]), thickness: Math.max(1, 2 * Math.sqrt(dmax[c]) - 0.5) }); });
  return regions;
}

/** Copy a voxel set into a bigger box with `pad` empty voxels all round. */
function padded(src, nx, ny, nz, pad, fill = 0) {
  const NX = nx + 2 * pad, NY = ny + 2 * pad, NZ = nz + 2 * pad, out = new Uint8Array(NX * NY * NZ).fill(fill);
  for (let k = 0; k < nz; k++) for (let j = 0; j < ny; j++) {
    const so = nx * (j + ny * k), dO = (pad) + NX * ((j + pad) + NY * (k + pad));
    for (let i = 0; i < nx; i++) out[dO + i] = src[so + i];
  }
  return { a: out, nx: NX, ny: NY, nz: NZ, pad };
}

export function analyze(vox, profile, { maxVoxels = 60e6 } = {}) {
  const { h, nx, ny, nz, origin } = vox, S = vox.solid;
  if (nx * ny * nz > maxVoxels) throw Object.assign(new Error('mfg: the part has more than ' + maxVoxels + ' voxels at this size'), { code: 'toobig' });
  const rd = profile.drain > 0 ? Math.ceil(profile.drain / h / 2) + 2 : 0;
  const pad = Math.max(3, rd + 1, Math.ceil(profile.minGap / h) + 2);
  const P = padded(S, nx, ny, nz, pad), N = P.a.length;
  const at = (c) => [origin[0] + (c[0] - pad + 0.5) * h, origin[1] + (c[1] - pad + 0.5) * h, origin[2] + (c[2] - pad + 0.5) * h];
  const out = { h, islands: [], sealed: [], drainTooSmall: [], thinWalls: [], thinGaps: [], problems: [] };
  const mm = (x) => +x.toFixed(3);
  const problems = out.problems;
  // ---- islands: solid pieces other than the largest
  const sol = components(P.a, P.nx, P.ny, P.nz);
  if (sol.sizes.length > 1) {
    const main = sol.sizes.indexOf(Math.max(...sol.sizes));
    sol.sizes.forEach((n, c) => { if (c !== main) out.islands.push({ volume: n * h ** 3, at: at(sol.sums[c].map((s) => s / n)) }); });
  }
  // ---- empty space: reached from the outside or sealed
  const empty = new Uint8Array(N);
  for (let i = 0; i < N; i++) empty[i] = P.a[i] ? 0 : 1;
  const emp = components(empty, P.nx, P.ny, P.nz), outsideId = emp.label[0];
  emp.sizes.forEach((n, c) => { if (c !== outsideId) out.sealed.push({ volume: n * h ** 3, at: at(emp.sums[c].map((s) => s / n)) }); });
  // ---- cavities with exits narrower than the drain
  if (profile.drain > 0) {
    const dE = distanceSquared(empty, P.nx, P.ny, P.nz), dk = (Math.max(1, profile.drain / h - 1) + 1) / 2;   // the same one-voxel slack as thinRegions
    const core = new Uint8Array(N);
    for (let i = 0; i < N; i++) if (empty[i] && dE[i] >= dk * dk - 1e-6) core[i] = 1;
    const cc = components(core, P.nx, P.ny, P.nz), reach = cc.label[0] >= 0 ? cc.label[0] : -2;   // the padded corner is far from the part, so it is in the core
    const notReach = new Uint8Array(N);
    for (let i = 0; i < N; i++) notReach[i] = core[i] && cc.label[i] === reach ? 0 : 1;
    const dR = distanceSquared(notReach, P.nx, P.ny, P.nz), r2 = (dk - 0.5) * (dk - 0.5);
    const unreached = new Uint8Array(N), farMask = new Uint8Array(N);
    const farR = Math.sqrt(r2) + 0.75 * dk + 1.5;      // beyond the corner-rounding depth, as in thinRegions
    for (let i = 0; i < N; i++) if (empty[i] && emp.label[i] === outsideId && dR[i] > r2) { unreached[i] = 1; if (dR[i] > farR * farR) farMask[i] = 1; }
    const uc = components(unreached, P.nx, P.ny, P.nz), keep = new Uint8Array(uc.sizes.length);
    for (let i = 0; i < N; i++) if (farMask[i]) keep[uc.label[i]] = 1;
    keep.forEach((k, c) => { if (k && uc.sizes[c] * h ** 3 >= (profile.drain / 2) ** 3) out.drainTooSmall.push({ volume: uc.sizes[c] * h ** 3, at: at(uc.sums[c].map((s) => s / uc.sizes[c])) }); });
  }
  // ---- thin walls and narrow gaps
  if (profile.minWall > 0) for (const r of thinRegions(P.a, P.nx, P.ny, P.nz, profile.minWall / h)) out.thinWalls.push({ volume: r.voxels * h ** 3, at: at(r.c), thickness: r.thickness * h });
  if (profile.minGap > 0) for (const r of thinRegions(empty, P.nx, P.ny, P.nz, profile.minGap / h)) out.thinGaps.push({ volume: r.voxels * h ** 3, at: at(r.c), thickness: r.thickness * h });
  // ---- the problems, in the shared shape
  const tiny = h ** 3 * 4;                                   // a handful of voxels is noise at this size
  const speck = h ** 3 * 27;                                 // a piece under three voxels across is a clipping speck, not a loose part
  const big = (a, min = tiny) => a.filter((x) => x.volume >= min).sort((p, q) => q.volume - p.volume);
  const mark = (list) => list.slice(0, 20).map((x) => x.at.map(mm));
  const walls = big(out.thinWalls), gaps = big(out.thinGaps), isl = big(out.islands, speck), sealed = big(out.sealed, speck), drain = big(out.drainTooSmall);
  if (walls.length) problems.push({ code: 'mfg.wall.thin', severity: 'warning', req: { op: '>=', value: profile.minWall, unit: 'mm' }, found: { value: mm(Math.min(...walls.map((x) => x.thickness))), unit: 'mm' }, vars: { n: walls.length, min: profile.minWall, found: mm(Math.min(...walls.map((x) => x.thickness))), process: profile.short || profile.name }, at: mark(walls) });
  if (gaps.length) problems.push({ code: 'mfg.gap.thin', severity: 'warning', req: { op: '>=', value: profile.minGap, unit: 'mm' }, found: { value: mm(Math.min(...gaps.map((x) => x.thickness))), unit: 'mm' }, vars: { n: gaps.length, min: profile.minGap, found: mm(Math.min(...gaps.map((x) => x.thickness))), process: profile.short || profile.name }, at: mark(gaps) });
  if (isl.length) problems.push({ code: 'mfg.island', severity: profile.supportsIslands ? 'note' : 'error', vars: { n: isl.length, volume: mm(isl.reduce((s, x) => s + x.volume, 0)), process: profile.short || profile.name }, found: { value: isl.length, unit: '' }, at: mark(isl) });
  if (sealed.length) problems.push({ code: 'mfg.void.sealed', severity: profile.needsDrain ? 'error' : 'note', vars: { n: sealed.length, volume: mm(sealed.reduce((s, x) => s + x.volume, 0)), process: profile.short || profile.name }, found: { value: sealed.length, unit: '' }, at: mark(sealed) });
  if (drain.length) problems.push({ code: 'mfg.void.drain', severity: profile.needsDrain ? 'warning' : 'note', req: { op: '>=', value: profile.drain, unit: 'mm' }, vars: { n: drain.length, drain: profile.drain, volume: mm(drain.reduce((s, x) => s + x.volume, 0)), process: profile.short || profile.name }, at: mark(drain) });
  out.counts = { thinWalls: walls.length, thinGaps: gaps.length, islands: isl.length, sealed: sealed.length, drainTooSmall: drain.length };
  return out;
}

/**
 * Downward-facing surface that is steeper than the process prints without support, with the build direction +z. A face needs support when
 * its overhang angle from vertical (asin of the downward part of its normal) is above `angle`; the faces on the lowest plane lie on the bed and need none.
 * mesh = { positions, indices } in the printer's frame (z up). → { area, share (of the total area), at: [centroids of the 20 biggest], count }
 */
export function overhang(mesh, angle) {
  const P = mesh.positions, I = mesh.indices, lim = Math.sin(angle * Math.PI / 180);
  let zmin = Infinity;
  for (let i = 2; i < P.length; i += 3) if (P[i] < zmin) zmin = P[i];
  let area = 0, total = 0, count = 0;
  const hits = [];
  for (let t = 0; t < I.length; t += 3) {
    const a = I[t] * 3, b = I[t + 1] * 3, c = I[t + 2] * 3;
    const ux = P[b] - P[a], uy = P[b + 1] - P[a + 1], uz = P[b + 2] - P[a + 2], vx = P[c] - P[a], vy = P[c + 1] - P[a + 1], vz = P[c + 2] - P[a + 2];
    const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (!(len > 0)) continue;
    const ar = len / 2;
    total += ar;
    if (-nz / len > lim + 1e-9 && Math.max(P[a + 2], P[b + 2], P[c + 2]) > zmin + 1e-6 * (1 + Math.abs(zmin))) {
      // a face right on the lowest plane is the bed face
      if (Math.abs(P[a + 2] - zmin) < 1e-6 && Math.abs(P[b + 2] - zmin) < 1e-6 && Math.abs(P[c + 2] - zmin) < 1e-6) continue;
      area += ar; count++;
      hits.push([ar, (P[a] + P[b] + P[c]) / 3, (P[a + 1] + P[b + 1] + P[c + 1]) / 3, (P[a + 2] + P[b + 2] + P[c + 2]) / 3]);
    }
  }
  hits.sort((p, q) => q[0] - p[0]);
  return { area, total, share: total > 0 ? area / total : 0, count, at: hits.slice(0, 20).map((h) => [h[1], h[2], h[3]]) };
}
