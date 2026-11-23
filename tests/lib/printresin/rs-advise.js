/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-advise.js — the advice a resin print needs before it is sliced (roadmap RSN.9): which tilt to print at, whether a cavity will act as a suction cup,
 * where thin supports need bracing, and how much of the layer pulls on the film. Our own, Apache-2.0; the methods are plain geometry, written here. No DOM,
 * imports nothing. Everything this file returns is an ESTIMATE from a model of the part: nothing here has met a printer, and the numbers (the weights
 * of the tilt score, the slenderness limit, the voxel size) are ours, not a maker's. The one number that would make a force real, how hard a layer of
 * a given area pulls off the film, depends on the resin, the film and the printer, so it is the person's to enter (job.peelStress); without it the
 * answer is an area, never a force.
 *
 *   columnsOf(tris, { cell, max }) → { x0, y0, cell, nx, ny, iv: [[z0, z1, …] per column], open }   the solid as vertical runs: where a line straight up through each
 *       column's middle is inside the part (crossings sorted, taken in pairs; `open` counts columns with an odd number, so a part with holes in its skin says so)
 *   tiltedBy(tris, deg) → tris    tilt about the X axis through the middle of the box and drop on the plate: the same move rs-slice.js makes for job.tilt
 *   overhangArea(tris, overhangDeg, { onPlate }) → mm²    the faces leaning out and down by more than the overhang angle (a flat underside on the plate is not one)
 *   autoOrient(tris, job, { tilts, cell }) → { best, candidates, estimate: true }   the tilts the slicer offers (0 to 60 degrees) scored by overhang area, the largest
 *       layer, height and suction cups; candidates [{ tilt, overhangMm2, peakMm2, heightMm, cups, cost }], best = the lowest cost (a smaller tilt wins a tie)
 *   suctionCups(cols, { minMm2 }) → [{ x, y, z, areaMm2, kind: 'cup' | 'void' }]   an empty pocket that only opens toward the film is a cup; a closed one is a void.
 *       The picture is made of voxels `cols.cell` wide, so a pocket narrower than one is not seen.
 *   layerAreas(cols, layerHeight) → Float64Array of mm² a layer (the part alone)
 *   peelEstimate(areas, { layerHeight, stress }) → { maxMm2, atLayer, jumpMm2, jumpAtLayer, forceN, estimate: true }   forceN only when stress (N per cm²) is given
 *   braceSupports(pillars, { spacing, slender, levelStep }) → [{ a: [x, y], b: [x, y], z, r }]   cross braces between tall thin pillars
 *       pillars: [{ x, y, z0, z1, r }] (mm); a pillar taller than `slender` times its width is braced about every `levelStep` widths of height to its nearest
 *       neighbours that also reach that height, within 2.2 grid spacings.
 */

const area3 = (a, b, c) => {
  const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
  const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
  return { a: Math.hypot(nx, ny, nz) / 2, nz: nx || ny || nz ? nz / Math.hypot(nx, ny, nz) : 0 };
};

export function boxOfTris(tris) {
  let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
  for (const t of tris) for (const p of t) {
    if (p[0] < x0) x0 = p[0]; if (p[0] > x1) x1 = p[0];
    if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1];
    if (p[2] < z0) z0 = p[2]; if (p[2] > z1) z1 = p[2];
  }
  return { x0, y0, z0, x1, y1, z1 };
}

export function tiltedBy(tris, deg) {
  const b = boxOfTris(tris);
  if (!deg) return b.z0 === 0 ? tris : tris.map((t) => t.map((p) => [p[0], p[1], p[2] - b.z0]));
  const cy = (b.y0 + b.y1) / 2, cz = (b.z0 + b.z1) / 2, c = Math.cos(deg * Math.PI / 180), s = Math.sin(deg * Math.PI / 180);
  const r = tris.map((t) => t.map((p) => [p[0], cy + (p[1] - cy) * c - (p[2] - cz) * s, cz + (p[1] - cy) * s + (p[2] - cz) * c]));
  const zMin = boxOfTris(r).z0;
  return r.map((t) => t.map((p) => [p[0], p[1], p[2] - zMin]));
}

export function overhangArea(tris, overhangDeg = 40, { onPlate = false } = {}) {
  const lim = -Math.sin(overhangDeg * Math.PI / 180);
  const zMin = onPlate ? boxOfTris(tris).z0 : -Infinity;
  let sum = 0;
  for (const t of tris) {
    const { a, nz } = area3(t[0], t[1], t[2]);
    if (nz < lim && !(onPlate && Math.max(t[0][2], t[1][2], t[2][2]) - zMin < 0.02)) sum += a;
  }
  return sum;
}

export function columnsOf(tris, { cell = 0, max = 110 } = {}) {
  const b = boxOfTris(tris);
  const sx = b.x1 - b.x0, sy = b.y1 - b.y0;
  const cs = cell > 0 ? cell : Math.max(sx, sy, 1e-6) / max;
  const nx = Math.max(1, Math.ceil(sx / cs)), ny = Math.max(1, Math.ceil(sy / cs));
  // a cell's line runs through its middle, nudged by a tiny amount so a line never falls exactly on a shared edge
  const ex = 1.37e-7 * cs, ey = 2.11e-7 * cs;
  const hits = new Array(nx * ny);
  for (const t of tris) {
    const [p, q, r] = t;
    const d = (q[0] - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (q[1] - p[1]);
    if (Math.abs(d) < 1e-14) continue;
    const i0 = Math.max(0, Math.floor((Math.min(p[0], q[0], r[0]) - b.x0) / cs - 0.5)), i1 = Math.min(nx - 1, Math.ceil((Math.max(p[0], q[0], r[0]) - b.x0) / cs - 0.5));
    const j0 = Math.max(0, Math.floor((Math.min(p[1], q[1], r[1]) - b.y0) / cs - 0.5)), j1 = Math.min(ny - 1, Math.ceil((Math.max(p[1], q[1], r[1]) - b.y0) / cs - 0.5));
    for (let j = j0; j <= j1; j++) {
      const y = b.y0 + (j + 0.5) * cs + ey;
      for (let i = i0; i <= i1; i++) {
        const x = b.x0 + (i + 0.5) * cs + ex;
        const u = ((x - p[0]) * (r[1] - p[1]) - (r[0] - p[0]) * (y - p[1])) / d;
        const v = ((q[0] - p[0]) * (y - p[1]) - (x - p[0]) * (q[1] - p[1])) / d;
        if (u < 0 || v < 0 || u + v > 1) continue;
        const k = j * nx + i;
        (hits[k] || (hits[k] = [])).push(p[2] + u * (q[2] - p[2]) + v * (r[2] - p[2]));
      }
    }
  }
  let open = 0;
  const iv = new Array(nx * ny);
  for (let k = 0; k < iv.length; k++) {
    const h = hits[k];
    if (!h) { iv[k] = []; continue; }
    h.sort((a, c) => a - c);
    if (h.length & 1) { open++; h.pop(); }
    iv[k] = h;
  }
  return { x0: b.x0, y0: b.y0, z0: b.z0, z1: b.z1, cell: cs, nx, ny, iv, open };
}

const inRuns = (runs, z) => { for (let i = 0; i + 1 < runs.length; i += 2) if (z >= runs[i] && z < runs[i + 1]) return true; return false; };
const solidAbove = (runs, z) => { for (let i = 1; i < runs.length; i += 2) if (runs[i] > z) return true; return false; };

export function layerAreas(cols, layerHeight) {
  const n = Math.max(1, Math.ceil((cols.z1 - cols.z0) / layerHeight - 1e-6)), out = new Float64Array(n), c2 = cols.cell * cols.cell;
  for (const runs of cols.iv) for (let i = 0; i + 1 < runs.length; i += 2) {
    const l0 = Math.max(0, Math.ceil((runs[i] - cols.z0) / layerHeight - 0.5)), l1 = Math.min(n - 1, Math.ceil((runs[i + 1] - cols.z0) / layerHeight - 0.5) - 1);
    for (let l = l0; l <= l1; l++) out[l] += c2;
  }
  return out;
}

export function peelEstimate(areas, { layerHeight = 0.05, stress = 0 } = {}) {
  let maxMm2 = 0, atLayer = 0, jumpMm2 = 0, jumpAtLayer = 0;
  for (let l = 0; l < areas.length; l++) {
    const a = areas[l];
    if (a > maxMm2) { maxMm2 = a; atLayer = l; }
    const up = a - (l ? areas[l - 1] : 0);
    if (l && up > jumpMm2) { jumpMm2 = up; jumpAtLayer = l; }
  }
  const forceN = stress > 0 ? maxMm2 / 100 * stress : null;
  return { maxMm2, atLayer, jumpMm2, jumpAtLayer, forceN, layerHeight, estimate: true };
}

export function suctionCups(cols, { minMm2 = 4 } = {}) {
  const { nx, ny, iv, cell } = cols;
  const nz = Math.max(1, Math.ceil((cols.z1 - cols.z0) / cell)), W = nx + 2, H = ny + 2, D = nz + 2;   // a ring of empty voxels round the part
  const idx = (i, j, k) => (k * H + j) * W + i;
  const solid = new Uint8Array(W * H * D);
  const top = new Int32Array(W * H).fill(-1);   // the highest solid voxel of each column (-1: none), to tell a pocket open to the film from one under a roof
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const runs = iv[j * nx + i];
    for (let k = 0; k < nz; k++) {
      const z = cols.z0 + (k + 0.5) * cell;
      if (inRuns(runs, z)) { solid[idx(i + 1, j + 1, k + 1)] = 1; top[(j + 1) * W + i + 1] = Math.max(top[(j + 1) * W + i + 1], k + 1); }
    }
  }
  // air that can leave: empty voxels reached from the sides and the plate side without passing through the top face (the film)
  const seen = new Uint8Array(W * H * D), stack = [];
  const push = (i, j, k) => { const n = idx(i, j, k); if (!solid[n] && !seen[n]) { seen[n] = 1; stack.push(i, j, k); } };
  for (let k = 0; k < D - 1; k++) for (let j = 0; j < H; j++) { push(0, j, k); push(W - 1, j, k); }
  for (let k = 0; k < D - 1; k++) for (let i = 0; i < W; i++) { push(i, 0, k); push(i, H - 1, k); }
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) push(i, j, 0);
  while (stack.length) {
    const k = stack.pop(), j = stack.pop(), i = stack.pop();
    if (i > 0) push(i - 1, j, k); if (i < W - 1) push(i + 1, j, k);
    if (j > 0) push(i, j - 1, k); if (j < H - 1) push(i, j + 1, k);
    if (k > 0) push(i, j, k - 1); if (k < D - 2) push(i, j, k + 1);
  }
  const out = [], mark = new Uint8Array(W * H * D), c2 = cell * cell;
  for (let k = 1; k < D - 1; k++) for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++) {
    const n = idx(i, j, k);
    if (solid[n] || seen[n] || mark[n]) continue;
    // one pocket: flood it, count what it holds, note whether any of its columns reaches the film with nothing over it
    let count = 0, openUp = false, sx = 0, sy = 0, sz = 0, floor = 0;
    const st = [i, j, k]; mark[n] = 1;
    const cols2 = new Set();
    while (st.length) {
      const kk = st.pop(), jj = st.pop(), ii = st.pop();
      count++; sx += ii; sy += jj; sz += kk;
      if (kk > top[jj * W + ii]) openUp = true;
      const key = jj * W + ii; if (!cols2.has(key)) cols2.add(key);
      for (const [di, dj, dk] of [[-1, 0, 0], [1, 0, 0], [0, -1, 0], [0, 1, 0], [0, 0, -1], [0, 0, 1]]) {
        const a = ii + di, b = jj + dj, c = kk + dk;
        if (a < 1 || b < 1 || c < 1 || a > W - 2 || b > H - 2 || c > D - 2) continue;
        const m = idx(a, b, c);
        if (!solid[m] && !seen[m] && !mark[m]) { mark[m] = 1; st.push(a, b, c); }
      }
    }
    floor = cols2.size * c2;
    if (floor < minMm2) continue;
    out.push({ x: cols.x0 + (sx / count - 0.5) * cell, y: cols.y0 + (sy / count - 0.5) * cell, z: cols.z0 + (sz / count - 0.5) * cell, areaMm2: floor, kind: openUp ? 'cup' : 'void' });
  }
  return out;
}

const TILTS = Array.from({ length: 13 }, (_, i) => i * 5);

export function autoOrient(tris, job = {}, { tilts = TILTS, cell = 0 } = {}) {
  const lh = job.layerHeight || 0.05, overhang = job.overhang || 40, lifted = !!job.supports;
  const cands = [];
  for (const tilt of tilts) {
    const T = tiltedBy(tris, tilt);
    const cols = columnsOf(T, { cell });
    const areas = layerAreas(cols, lh), pk = peelEstimate(areas, { layerHeight: lh });
    const cups = cols.open ? [] : suctionCups(cols).filter((c) => c.kind === 'cup');
    cands.push({ tilt, overhangMm2: overhangArea(T, overhang, { onPlate: !lifted }), peakMm2: pk.maxMm2, heightMm: cols.z1 - cols.z0, cups: cups.length, open: cols.open > 0 });
  }
  const top = (k) => Math.max(1e-9, ...cands.map((c) => c[k]));
  const mo = top('overhangMm2'), mp = top('peakMm2'), mh = top('heightMm');
  for (const c of cands) c.cost = 0.5 * c.overhangMm2 / mo + 0.3 * c.peakMm2 / mp + 0.2 * c.heightMm / mh + 0.5 * Math.min(3, c.cups);
  const best = cands.reduce((a, c) => (c.cost < a.cost - 1e-9 ? c : a), cands[0]);
  return { best, candidates: cands, estimate: true };
}

export function braceSupports(pillars, { spacing = 4.5, slender = 15, levelStep = 10 } = {}) {
  const out = [], seen = new Set();
  const reach = spacing * 2.2;
  for (let i = 0; i < pillars.length; i++) {
    const p = pillars[i], width = 2 * p.r, height = p.z1 - p.z0;
    if (!(height > slender * width)) continue;
    const near = [];
    for (let j = 0; j < pillars.length; j++) {
      if (j === i) continue;
      const q = pillars[j], d = Math.hypot(q.x - p.x, q.y - p.y);
      if (d > 0 && d <= reach) near.push({ j, d });
    }
    near.sort((a, b) => a.d - b.d || a.j - b.j);
    const step = levelStep * width;
    for (let z = p.z0 + step; z < p.z1 - width; z += step) {
      let made = 0;
      for (const { j } of near) {
        const q = pillars[j];
        if (z < q.z0 + width || z > q.z1 - width) continue;
        const key = (i < j ? i + ':' + j : j + ':' + i) + '@' + Math.round(z * 100);
        if (seen.has(key)) { made++; continue; }
        seen.add(key);
        out.push({ a: [p.x, p.y], b: [q.x, q.y], z, r: Math.max(0.2, Math.min(p.r, q.r) * 0.6) });
        if (++made >= 2) break;
      }
    }
  }
  return out;
}
