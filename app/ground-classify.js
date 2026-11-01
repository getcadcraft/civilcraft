/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ground-classify.js — find the ground in a point cloud that has no ground class (a drone cloud) (0.8 SU.935). No DOM, no
 * strings, no dependencies. Tested by bin/test-civilcraft-ground.mjs.
 *
 * Method: the progressive morphological filter of Zhang, K., Chen, S.-C., Whitman, D., Shyu, M.-L., Yan, J., Zhang, C. (2003),
 * "A progressive morphological filter for removing nonground measurements from airborne LIDAR data", IEEE Trans. Geoscience
 * and Remote Sensing 41(4), 872–882 — maths from the paper, written here. It works on a grid of the LOWEST point in each cell
 * (the ground is under the trees), so the cost depends on the number of cells, not the number of points: a 50-million-point
 * cloud is first reduced by Thinner (thin.js, mode 'lowest', one streaming pass) and the result comes here.
 *
 *   classifyGround(points, { cell, maxObject, slope, initialHeight, maxHeight, lowNoise, maxCells })
 *       points  [{ x, y, z }] (any order; usually thin.js's lowest-per-cell points)
 *       cell          grid cell size (project units)
 *       maxObject     the largest thing to take out (a building's width): windows grow until they cover it   (default 20 cells)
 *       slope         steepest ground slope, rise over run   (0.3)
 *       initialHeight height above the opened surface that is still ground at the smallest window   (0.3·cell, at least 0.1 · …)
 *       maxHeight     the largest height difference ever accepted as ground   (cell · 6)
 *       lowNoise      a cell this far under the middle of its neighbours is a stray low point, dropped   (3 cells of the steepest slope + 3 · initialHeight)
 *   → { ground: [{ x, y, z }], counts: { points, cells, ground, objects, lowNoise, filled }, windows: [cells…], settings }
 *
 * Per round k the window w_k = 2^k + 1 cells; the surface is opened (minimum then maximum over the window) and a cell whose
 * lowest point rises more than dh_k = slope·(w_k − w_(k−1))·cell + initialHeight above the opened surface is an object.
 * Empty cells are filled from the nearest cell that has a point while filtering and never become ground points.
 */

export const DEFAULTS = { slope: 0.3, maxObjectCells: 20 };

export function classifyGround(points, opts = {}) {
  const cell = Number(opts.cell);
  if (!(cell > 0)) throw new Error('classifyGround: cell must be > 0');   // i18n-ignore: developer error
  const slope = opts.slope ?? DEFAULTS.slope;
  const maxObject = opts.maxObject ?? cell * DEFAULTS.maxObjectCells;
  const h0 = opts.initialHeight ?? cell * 0.3, hMax = opts.maxHeight ?? cell * 6, lowNoise = opts.lowNoise ?? slope * cell * 3 + 3 * h0;
  const maxCells = opts.maxCells ?? 2e7;
  const counts = { points: points.length, cells: 0, ground: 0, objects: 0, lowNoise: 0, filled: 0 };
  if (!points.length) return { ground: [], counts, windows: [], settings: { cell, slope, maxObject, initialHeight: h0, maxHeight: hMax, lowNoise } };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const p of points) { if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x; if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y; }
  const nx = Math.floor((maxX - minX) / cell) + 1, ny = Math.floor((maxY - minY) / cell) + 1;
  if (nx * ny > maxCells) throw Object.assign(new Error('classifyGround: too many cells'), { code: 'cells', cells: nx * ny, max: maxCells });   // i18n-ignore: the UI words it from the code
  const N = nx * ny, low = new Float64Array(N).fill(Infinity), pick = new Int32Array(N).fill(-1);
  points.forEach((p, i) => {
    const c = Math.floor((p.y - minY) / cell) * nx + Math.floor((p.x - minX) / cell);
    if (p.z < low[c]) { low[c] = p.z; pick[c] = i; }
  });
  const has = new Uint8Array(N);   // 1 = a real lowest point; 0 = empty
  for (let c = 0; c < N; c++) if (pick[c] >= 0) { has[c] = 1; counts.cells++; }

  // stray low points: well under the middle of the 8 neighbours that have points
  const stray = new Uint8Array(N), nb = [];
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const c = j * nx + i;
    if (!has[c]) continue;
    nb.length = 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue;
      const a = i + di, b = j + dj;
      if (a >= 0 && a < nx && b >= 0 && b < ny && has[b * nx + a]) nb.push(low[b * nx + a]);
    }
    if (nb.length >= 4) { nb.sort((p, q) => p - q); const med = (nb[(nb.length - 1) >> 1] + nb[nb.length >> 1]) / 2; if (med - low[c] > lowNoise) stray[c] = 1; }
  }
  // work surface: strays and empty cells take the nearest real cell's value (breadth-first over 4-neighbours)
  const z = new Float64Array(N), seen = new Uint8Array(N), queue = new Int32Array(N);
  let qh = 0, qt = 0;
  for (let c = 0; c < N; c++) if (has[c] && !stray[c]) { z[c] = low[c]; seen[c] = 1; queue[qt++] = c; }
  if (qt === 0) return { ground: [], counts, windows: [], settings: { cell, slope, maxObject, initialHeight: h0, maxHeight: hMax, lowNoise } };
  while (qh < qt) {
    const c = queue[qh++], i = c % nx, j = (c - i) / nx;
    if (i > 0 && !seen[c - 1]) { seen[c - 1] = 1; z[c - 1] = z[c]; queue[qt++] = c - 1; }
    if (i < nx - 1 && !seen[c + 1]) { seen[c + 1] = 1; z[c + 1] = z[c]; queue[qt++] = c + 1; }
    if (j > 0 && !seen[c - nx]) { seen[c - nx] = 1; z[c - nx] = z[c]; queue[qt++] = c - nx; }
    if (j < ny - 1 && !seen[c + nx]) { seen[c + nx] = 1; z[c + nx] = z[c]; queue[qt++] = c + nx; }
  }
  const object = new Uint8Array(N), tmp = new Float64Array(N);
  let cur = z, prevW = 1;
  const windows = [];
  for (let k = 1; ; k++) {
    const w = 2 ** k + 1;
    windows.push(w);
    const r = (w - 1) >> 1;
    const opened = open(cur, nx, ny, r, tmp);
    const dh = Math.min(hMax, slope * (w - prevW) * cell + h0);
    for (let c = 0; c < N; c++) if (has[c] && !stray[c] && cur[c] - opened[c] > dh) object[c] = 1;
    cur = opened; prevW = w;
    if (w * cell >= maxObject || w > Math.max(nx, ny)) break;
  }
  const ground = [];
  for (let c = 0; c < N; c++) {
    if (!has[c]) { counts.filled++; continue; }
    if (stray[c]) { counts.lowNoise++; continue; }
    if (object[c]) { counts.objects++; continue; }
    const p = points[pick[c]];
    ground.push({ x: p.x, y: p.y, z: p.z });
  }
  counts.ground = ground.length;
  counts.filled = N - counts.cells;
  return { ground, counts, windows, settings: { cell, slope, maxObject, initialHeight: h0, maxHeight: hMax, lowNoise } };
}

/** Opening (erosion then dilation) over a (2r+1)-cell square, edges clamped. Returns a new array (valid until the next call). */
function open(src, nx, ny, r, tmp) {
  const a = new Float64Array(src.length);
  sweep(src, a, nx, ny, r, Math.min, Infinity, tmp);
  const b = new Float64Array(src.length);
  sweep(a, b, nx, ny, r, Math.max, -Infinity, tmp);
  return b;
}
function sweep(src, dst, nx, ny, r, f, init, tmp) {
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {   // along x
    let v = init;
    for (let a = Math.max(0, i - r), e = Math.min(nx - 1, i + r); a <= e; a++) v = f(v, src[j * nx + a]);
    tmp[j * nx + i] = v;
  }
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {   // along y
    let v = init;
    for (let b = Math.max(0, j - r), e = Math.min(ny - 1, j + r); b <= e; b++) v = f(v, tmp[b * nx + i]);
    dst[j * nx + i] = v;
  }
}
