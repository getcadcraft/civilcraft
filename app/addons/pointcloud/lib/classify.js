/* SPDX-License-Identifier: Apache-2.0 */
/**
 * classify.js — ground and geometric classes (spec § 8, PC.5 / PC.6). Tile-wise, so memory is a tile, not the cloud.
 *
 *   await classifyGround(cloud, params, { progress, signal }) → { id, ground, noise, tiles, seamFlags[], ms, model }
 *     per tile (tileSize, default 256, anchored at cloud.origin) and a halo of one maxObject width from the neighbours:
 *       Thinner 'lowest' at `cell` → classifyGround (Zhang 2003, ground-classify.js) → TIN of the ground points (buildGround) →
 *       a ground height grid at `cell` → every point is compared with the grid (bilinear):
 *       |z − ground| ≤ tolerance ⇒ class 2; below −tolMul·tolerance ⇒ class 7 (low point); the rest keeps its class
 *       (start 'reset': becomes 1; start 'file': a file's class 2 that no longer qualifies becomes 1).
 *     params: cell 1, tolerance 0.15 (surveyGrade: true ⇒ 0.08), tolMul 4, slope 0.3, maxObject 20 (cells), initialHeight, maxHeight,
 *             tileSize 256, halo (default maxObject·cell), start 'file' | 'reset', region (only points inside change), label
 *     The heights are written as ground/<editId>/<tx>_<ty>.bin (read back by `cloud.ground()` and the heightAboveGround region).
 *     seamFlags: [{ a:[tx,ty], b:[tx,ty], step }] where two tiles' grids disagree on their shared edge by more than tolerance / 2.
 *
 *   await classifyGeometric(cloud, params, { progress, signal }) → { id, counts:{3,4,5,6}, tiles, ms }
 *     needs a ground (code 'no_ground'). For every point that is not ground, low point, water or high noise:
 *       h = z − ground. Planar = within `radius` (1) of the point the neighbours' covariance has flatness 1 − λ3/λ2 ≥ planarity (0.85)
 *       and the normals of its planar neighbours differ by at most `spread` (25°) on average. A building seed is a planar point
 *       with h ≥ minHeight (2.5) whose normal is within roofTilt (45°) of vertical or within wallTilt (20°) of horizontal; cells of
 *       `cell` (1) with at least `cellSeeds` (2) seeds are joined (8 neighbours); a region of at least minArea (12) square units is a
 *       building: its points with h ≥ minHeight become class 6. Everything else above ground is vegetation by height:
 *       h < 0.5 ⇒ 3, < 2 ⇒ 4, else 5.
 */
import { fail, dep, throwIfAborted, reporter } from './util.js';
import { tileList, Hash3, compileRegion, encodeGroundTile, bilinear, GroundModel } from './select.js';
import { PatchSet } from './edits.js';
import { jsonBytes } from './util.js';

const NOISE = new Set([7, 18]);

export async function classifyGround(cloud, params = {}, { progress = null, signal = null } = {}) {
  const t0 = Date.now(), rep = reporter(progress);
  const cell = params.cell ?? 1, tol = params.tolerance ?? (params.surveyGrade ? 0.08 : 0.15), tolMul = params.tolMul ?? 4, slope = params.slope ?? 0.3, maxObject = params.maxObject ?? 20;
  const start = params.start || 'file';
  const tileSize = Math.max(cell * 4, Math.round((params.tileSize ?? 256) / cell) * cell), halo = params.halo ?? maxObject * cell;
  if (!(cell > 0) || !(tol > 0)) fail('bad_params', { cell, tol });
  const { Thinner } = dep('thin'), GC = dep('groundClassify'), GS = dep('groundSurface');
  const region = params.region ? compileRegion(params.region, { ground: null }) : null;
  const id = cloud.edits.allocId(), ps = new PatchSet(cloud, id);
  const gx0 = cloud.origin[0], gy0 = cloud.origin[1], nx = Math.round(tileSize / cell) + 1;
  const tiles = tileList(cloud, tileSize, region && region.bbox), grids = new Map();
  let ground = 0, noise = 0, nt = 0;
  try {
    for (let ti = 0; ti < tiles.length; ti++) {
      throwIfAborted(signal);
      const T = tiles[ti];
      const D = await cloud.readRegion([T.x0 - halo, T.y0 - halo, T.x1 + halo, T.y1 + halo]);
      const th = new Thinner({ cell, mode: 'lowest', origin: [T.x0 - halo, T.y0 - halo] });
      let seen = 0;
      for (let i = 0; i < D.n; i++) { if (start === 'file' && NOISE.has(D.cls[i])) continue; th.add(D.x[i], D.y[i], D.z[i], D.cls[i]); seen++; }
      if (th.count < 8) continue;
      const gc = GC.classifyGround(th.points(), { cell, maxObject: maxObject * cell, slope, initialHeight: params.initialHeight, maxHeight: params.maxHeight, maxCells: 4e7 });
      if (gc.ground.length < 3) continue;
      const built = GS.buildGround({ points: gc.ground });
      if (!built.surface) continue;
      const S = built.surface, z = new Float32Array(nx * nx).fill(NaN);
      let known = 0;
      for (let j = 0; j < nx; j++) for (let i = 0; i < nx; i++) { const v = S.elevationAt(T.x0 + i * cell, T.y0 + j * cell, 1e-6); if (v !== null) { z[j * nx + i] = v; known++; } }
      if (!known) continue;
      fillNaN(z, nx, nx);
      nt++;
      const tile = { x0: T.x0, y0: T.y0, cell, nx, ny: nx, z };
      grids.set(T.tx + '_' + T.ty, tile);
      await cloud.put('ground/' + id + '/' + T.tx + '_' + T.ty + '.bin', encodeGroundTile(tile));
      for (let i = 0; i < D.n; i++) {
        const x = D.x[i], y = D.y[i];
        if (x < T.x0 || x >= T.x1 || y < T.y0 || y >= T.y1) continue;
        if (region && !region.test(x, y, D.z[i], D.cls[i])) continue;
        const d = D.z[i] - bilinear(tile, x, y), cur = D.cls[i];
        let c = cur;
        if (Math.abs(d) <= tol) c = 2;
        else if (d < -tolMul * tol) c = 7;
        else if (start === 'reset') c = NOISE.has(cur) || cur === 9 ? cur : 1;
        else if (cur === 2) c = 1;
        if (start === 'reset' && c === 1 && cur === 7) c = 1;
        if (c === 2) ground++; else if (c === 7) noise++;
        if (c !== cur) ps.setClass(D.node[i], D.idx[i], c);
      }
      rep((ti + 1) / tiles.length * 0.95, 'ground');
    }
    await ps.flush();
    await cloud.put('ground/' + id + '/meta.json', jsonBytes({ editId: id, tileSize, gx0, gy0, cell, tolerance: tol }));
  } catch (e) { cloud.edits.discard(id); throw e; }
  // seams: the shared edge of two neighbouring grids
  const seamFlags = [];
  for (const T of tiles) {
    const a = grids.get(T.tx + '_' + T.ty);
    if (!a) continue;
    const right = grids.get((T.tx + 1) + '_' + T.ty), up = grids.get(T.tx + '_' + (T.ty + 1));
    if (right) { let s = 0; for (let j = 0; j < nx; j++) s += Math.abs(a.z[j * nx + nx - 1] - right.z[j * nx]); s /= nx; if (s > tol / 2) seamFlags.push({ a: [T.tx, T.ty], b: [T.tx + 1, T.ty], step: s }); }
    if (up) { let s = 0; for (let i = 0; i < nx; i++) s += Math.abs(a.z[(nx - 1) * nx + i] - up.z[i]); s /= nx; if (s > tol / 2) seamFlags.push({ a: [T.tx, T.ty], b: [T.tx, T.ty + 1], step: s }); }
  }
  cloud.edits.addMaterialised({ id, op: 'ground', region: params.region || null, params: { cell, tolerance: tol, tolMul, slope, maxObject, tileSize, halo, start }, label: params.label || 'ground', summary: { ground, noise, tiles: nt, seamFlags: seamFlags.length } });
  await cloud.edits.saved();
  const model = new GroundModel({ editId: id, tileSize, gx0, gy0, cell, tolerance: tol }, grids);
  cloud._ground = model;
  rep(1, 'ground');
  return { id, ground, noise, tiles: nt, seamFlags, ms: Date.now() - t0, model };
}

/** Fill NaN nodes from the nearest known node (breadth first over 4 neighbours). */
function fillNaN(z, nx, ny) {
  const q = new Int32Array(nx * ny); let h = 0, t = 0;
  const seen = new Uint8Array(nx * ny);
  for (let c = 0; c < z.length; c++) if (z[c] === z[c]) { seen[c] = 1; q[t++] = c; }
  while (h < t) {
    const c = q[h++], i = c % nx, j = (c - i) / nx;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const a = i + di, b = j + dj;
      if (a < 0 || a >= nx || b < 0 || b >= ny) continue;
      const k = b * nx + a;
      if (!seen[k]) { seen[k] = 1; z[k] = z[c]; q[t++] = k; }
    }
  }
}

// Jacobi eigen-decomposition of a symmetric 3×3 (a = [a00,a01,a02,a11,a12,a22]) → values desc in out[0..2], smallest's vector in out[3..5]
const _A = new Float64Array(9), _V = new Float64Array(9);
function eig3(a, out) {
  const A = _A, V = _V;
  A[0] = a[0]; A[1] = a[1]; A[2] = a[2]; A[3] = a[1]; A[4] = a[3]; A[5] = a[4]; A[6] = a[2]; A[7] = a[4]; A[8] = a[5];
  V.fill(0); V[0] = V[4] = V[8] = 1;
  for (let sweep = 0; sweep < 12; sweep++) {
    const off = A[1] * A[1] + A[2] * A[2] + A[5] * A[5];
    if (off < 1e-24) break;
    for (const [p, q] of [[0, 1], [0, 2], [1, 2]]) {
      const apq = A[3 * p + q];
      if (Math.abs(apq) < 1e-30) continue;
      const th = (A[3 * q + q] - A[3 * p + p]) / (2 * apq), t = Math.sign(th || 1) / (Math.abs(th) + Math.sqrt(th * th + 1)), c = 1 / Math.sqrt(t * t + 1), s = t * c;
      for (let k = 0; k < 3; k++) { const akp = A[3 * k + p], akq = A[3 * k + q]; A[3 * k + p] = c * akp - s * akq; A[3 * k + q] = s * akp + c * akq; }
      for (let k = 0; k < 3; k++) { const apk = A[3 * p + k], aqk = A[3 * q + k]; A[3 * p + k] = c * apk - s * aqk; A[3 * q + k] = s * apk + c * aqk; }
      for (let k = 0; k < 3; k++) { const vkp = V[3 * k + p], vkq = V[3 * k + q]; V[3 * k + p] = c * vkp - s * vkq; V[3 * k + q] = s * vkp + c * vkq; }
    }
  }
  const e = [A[0], A[4], A[8]], ord = [0, 1, 2].sort((i, j) => e[j] - e[i]);
  out[0] = e[ord[0]]; out[1] = e[ord[1]]; out[2] = e[ord[2]];
  const m = ord[2]; out[3] = V[m]; out[4] = V[3 + m]; out[5] = V[6 + m];
}

export async function classifyGeometric(cloud, params = {}, { progress = null, signal = null } = {}) {
  const t0 = Date.now(), rep = reporter(progress);
  const model = await cloud.ground();
  if (!model) fail('no_ground');
  const radius = params.radius ?? 1, planarity = params.planarity ?? 0.85, spread = (params.spread ?? 25) * Math.PI / 180, minHeight = params.minHeight ?? 2.5;
  const roofCos = Math.cos((params.roofTilt ?? 45) * Math.PI / 180), wallSin = Math.sin((params.wallTilt ?? 20) * Math.PI / 180);
  const cellSize = params.cell ?? 1, cellSeeds = params.cellSeeds ?? 2, minArea = params.minArea ?? 12, minN = params.minNeighbours ?? 5, halo = params.halo ?? 40;
  const lowMax = params.lowMax ?? 0.5, midMax = params.midMax ?? 2;
  const tileSize = model.meta.tileSize, id = cloud.edits.allocId(), ps = new PatchSet(cloud, id);
  const region = params.region ? compileRegion(params.region, { ground: null }) : null;
  const tiles = tileList(cloud, tileSize, region && region.bbox);
  const counts = { 3: 0, 4: 0, 5: 0, 6: 0 }; let nt = 0;
  const ev = new Float64Array(6), cv = [0, 0, 0, 0, 0, 0];
  try {
    for (let ti = 0; ti < tiles.length; ti++) {
      throwIfAborted(signal);
      const T = tiles[ti];
      const D = await cloud.readRegion([T.x0 - halo, T.y0 - halo, T.x1 + halo, T.y1 + halo]);
      const cand = [], H = new Float32Array(D.n).fill(NaN);
      for (let i = 0; i < D.n; i++) {
        const c = D.cls[i];
        if (c === 2 || c === 7 || c === 9 || c === 18) continue;
        const g = model.at(D.x[i], D.y[i]);
        if (g !== g) continue;
        H[i] = D.z[i] - g; cand.push(i);
      }
      if (!cand.length) continue;
      nt++;
      const hash = new Hash3(D.x, D.y, D.z, cand, radius);
      const nrm = new Float32Array(3 * D.n), flat = new Uint8Array(D.n), nb = [];
      // pass 1: planarity and the normal
      for (const i of cand) {
        let sx = 0, sy = 0, sz = 0, m = 0; nb.length = 0;
        hash.near(D.x[i], D.y[i], D.z[i], radius, (j) => { nb.push(j); sx += D.x[j]; sy += D.y[j]; sz += D.z[j]; m++; });
        if (m < minN) continue;
        sx /= m; sy /= m; sz /= m;
        let a00 = 0, a01 = 0, a02 = 0, a11 = 0, a12 = 0, a22 = 0;
        for (const j of nb) { const dx = D.x[j] - sx, dy = D.y[j] - sy, dz = D.z[j] - sz; a00 += dx * dx; a01 += dx * dy; a02 += dx * dz; a11 += dy * dy; a12 += dy * dz; a22 += dz * dz; }
        cv[0] = a00 / m; cv[1] = a01 / m; cv[2] = a02 / m; cv[3] = a11 / m; cv[4] = a12 / m; cv[5] = a22 / m;
        eig3(cv, ev);
        if (!(ev[1] > 1e-9)) continue;
        if (1 - Math.max(ev[2], 0) / ev[1] >= planarity) { flat[i] = 1; nrm[3 * i] = ev[3]; nrm[3 * i + 1] = ev[4]; nrm[3 * i + 2] = ev[5]; }
      }
      // pass 2: do the planar neighbours agree on the normal? then seeds
      const seeds = [];
      for (const i of cand) {
        if (!flat[i] || !(H[i] >= minHeight)) continue;
        let s = 0, m = 0;
        hash.near(D.x[i], D.y[i], D.z[i], radius, (j, d2) => { if (j !== i && flat[j]) { const dot = Math.abs(nrm[3 * i] * nrm[3 * j] + nrm[3 * i + 1] * nrm[3 * j + 1] + nrm[3 * i + 2] * nrm[3 * j + 2]); s += Math.acos(Math.min(1, dot)); m++; } });
        if (m < 2 || s / m > spread) continue;
        const nz = Math.abs(nrm[3 * i + 2]);
        if (nz >= roofCos || nz <= wallSin) seeds.push(i);
      }
      // cells with seeds, joined into regions
      const bx0 = T.x0 - halo, by0 = T.y0 - halo, ncx = Math.ceil((T.x1 - T.x0 + 2 * halo) / cellSize) + 1, ncy = Math.ceil((T.y1 - T.y0 + 2 * halo) / cellSize) + 1;
      const cnt = new Uint16Array(ncx * ncy), cid = new Int32Array(ncx * ncy).fill(-1), good = new Uint8Array(ncx * ncy);
      const cellOf = (i) => Math.min(ncy - 1, Math.floor((D.y[i] - by0) / cellSize)) * ncx + Math.min(ncx - 1, Math.floor((D.x[i] - bx0) / cellSize));
      for (const i of seeds) { const c = cellOf(i); if (cnt[c] < 65535) cnt[c]++; }
      const stack = [];
      for (let c0 = 0; c0 < cnt.length; c0++) {
        if (cnt[c0] < cellSeeds || cid[c0] !== -1) continue;
        const comp = []; cid[c0] = c0; stack.push(c0);
        while (stack.length) {
          const c = stack.pop(); comp.push(c);
          const ci = c % ncx, cj = (c - ci) / ncx;
          for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
            const a = ci + di, b = cj + dj;
            if (a < 0 || a >= ncx || b < 0 || b >= ncy) continue;
            const k = b * ncx + a;
            if (cnt[k] >= cellSeeds && cid[k] === -1) { cid[k] = c0; stack.push(k); }
          }
        }
        if (comp.length * cellSize * cellSize >= minArea) for (const c of comp) good[c] = 1;
      }
      for (const i of cand) {
        const x = D.x[i], y = D.y[i];
        if (x < T.x0 || x >= T.x1 || y < T.y0 || y >= T.y1) continue;
        if (region && !region.test(x, y, D.z[i], D.cls[i])) continue;
        const h = H[i];
        let c;
        if (h >= minHeight && good[cellOf(i)]) c = 6;
        else c = h < lowMax ? 3 : h < midMax ? 4 : 5;
        counts[c]++;
        if (c !== D.cls[i]) ps.setClass(D.node[i], D.idx[i], c);
      }
      rep((ti + 1) / tiles.length * 0.95, 'geometric');
    }
    await ps.flush();
  } catch (e) { cloud.edits.discard(id); throw e; }
  cloud.edits.addMaterialised({ id, op: 'geometric', region: params.region || null, params: { radius, planarity, minHeight, minArea, cell: cellSize }, label: params.label || 'classes', summary: counts });
  await cloud.edits.saved();
  rep(1, 'geometric');
  return { id, counts, tiles: nt, ms: Date.now() - t0 };
}
