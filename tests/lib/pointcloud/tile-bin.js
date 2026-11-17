/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tile-bin.js — tiling ONE bin of the octree build (tiler.js pass 2). Pure functions of their arguments, no store, no DOM: the same
 * code runs in the page's thread and in a tile worker (tile-worker.js, PERF.25), so a worker pool gives byte-identical nodes.
 *
 *   binPath(idx, d0) · cubeOfPath(path, cube0, size0) · loadBin(chunks, hasRgb, hasInt) → A · makeBinBuilder(P) → buildBin(binIdx, A, quotas)
 *   → { nodes: [{ id, cellSize, bytes, count, minZ, maxZ }], ups: [{ anc, bytes }] }
 */
import { encodeNode } from './octree.js';
import { MAX_DEPTH } from './util.js';

export const REC_BYTES = 20;


export const binPath = (idx, d0) => {
  const B = 2 ** d0, bx = idx % B, by = Math.floor(idx / B) % B, bz = Math.floor(idx / (B * B));
  let s = 'r';
  for (let l = d0 - 1; l >= 0; l--) s += ((bx >> l) & 1) | (((by >> l) & 1) << 1) | (((bz >> l) & 1) << 2);
  return s;
};
export const cubeOfPath = (path, cube0, size0) => {   // cube in file units
  const min = cube0.slice(); let size = size0;
  for (let k = 1; k < path.length; k++) { size /= 2; const o = path.charCodeAt(k) - 48; if (o & 1) min[0] += size; if (o & 2) min[1] += size; if (o & 4) min[2] += size; }
  return { min, size };
};


export function makeBinBuilder(P) {
  const { G, scale, origin, size, d0, nodeCap, hasRgb, hasInt } = P;
  const best = new Int32Array(G * G * G).fill(-1), bd = new Float32Array(G * G * G);
  return function buildBin(binIdx, A, quotas) {
    const n = A.n, taken = new Uint8Array(n), nodes = [], ups = [];
    const path = binPath(binIdx, d0);

    function pick(ids, cminU, sizeU, quota) {
      const inv0 = G / sizeU[0], inv1 = G / sizeU[1], inv2 = G / sizeU[2], g1 = G - 1;
      const touched = [];
      for (let q = 0; q < ids.length; q++) {
        const i = ids[q];
        const fx = (A.x[i] - cminU[0]) * inv0, fy = (A.y[i] - cminU[1]) * inv1, fz = (A.z[i] - cminU[2]) * inv2;
        let ix = Math.floor(fx), iy = Math.floor(fy), iz = Math.floor(fz);
        if (ix < 0) ix = 0; else if (ix > g1) ix = g1; if (iy < 0) iy = 0; else if (iy > g1) iy = g1; if (iz < 0) iz = 0; else if (iz > g1) iz = g1;
        const key = ix + G * (iy + G * iz);
        const dx = fx - ix - 0.5, dy = fy - iy - 0.5, dz = fz - iz - 0.5, d = Math.fround(dx * dx + dy * dy + dz * dz);
        const j = best[key];
        if (j < 0) { best[key] = i; bd[key] = d; touched.push(key); } else if (d < bd[key]) { best[key] = i; bd[key] = d; }
      }
      let win = new Array(touched.length), wd = new Array(touched.length);
      for (let t = 0; t < touched.length; t++) { const k = touched[t]; win[t] = best[k]; wd[t] = bd[k]; best[k] = -1; }
      if (win.length > quota) {
        const ord = win.map((_, t) => t).sort((a, b) => wd[a] - wd[b] || win[a] - win[b]).slice(0, quota);
        win = ord.map((t) => win[t]);
      }
      for (const i of win) taken[i] = 1;
      const rest = new Int32Array(ids.length - win.length);
      let r = 0;
      for (let q = 0; q < ids.length; q++) if (!taken[ids[q]]) rest[r++] = ids[q];
      return { win: Int32Array.from(win), rest };
    }

    function encode(ids) {
      const m = ids.length, a = { n: m, x: new Int32Array(m), y: new Int32Array(m), z: new Int32Array(m), cls: new Uint8Array(m), flags: new Uint8Array(m), inten: hasInt ? new Uint16Array(m) : null, rgb: hasRgb ? new Uint8Array(3 * m) : null };
      let minZ = Infinity, maxZ = -Infinity;
      for (let q = 0; q < m; q++) {
        const i = ids[q];
        a.x[q] = A.x[i]; a.y[q] = A.y[i]; a.z[q] = A.z[i]; a.cls[q] = A.cls[i]; a.flags[q] = A.flags[i];
        if (hasInt) a.inten[q] = A.inten[i];
        if (hasRgb) { a.rgb[3 * q] = A.rgb[3 * i]; a.rgb[3 * q + 1] = A.rgb[3 * i + 1]; a.rgb[3 * q + 2] = A.rgb[3 * i + 2]; }
        if (a.z[q] < minZ) minZ = a.z[q]; if (a.z[q] > maxZ) maxZ = a.z[q];
      }
      return { bytes: encodeNode(a, hasRgb, hasInt), count: m, minZ: m ? minZ * scale[2] : 0, maxZ: m ? maxZ * scale[2] : 0 };
    }

    const unitsOf = (cube) => ({ cminU: [(cube.min[0] - origin[0]) / scale[0], (cube.min[1] - origin[1]) / scale[1], (cube.min[2] - origin[2]) / scale[2]], sizeU: [cube.size / scale[0], cube.size / scale[1], cube.size / scale[2]] });

    let ids = new Int32Array(n);
    for (let i = 0; i < n; i++) ids[i] = i;
    // the levels above the bin
    for (let e = 0; e < d0; e++) {
      const anc = path.slice(0, 1 + e), cube = cubeOfPath(anc, origin, size), u = unitsOf(cube);
      const { win, rest } = pick(ids, u.cminU, u.sizeU, quotas[e]);
      if (win.length) ups.push({ anc, bytes: encode(win).bytes });
      ids = rest;
    }
    // the bin's own subtree
    const sub = (ids2, p, cube, depth) => {
      const u = unitsOf(cube), cellSize = cube.size / G;
      if (ids2.length <= nodeCap || depth >= MAX_DEPTH) { if (ids2.length) { const e = encode(ids2); nodes.push({ id: p, cellSize, ...e }); } return; }
      const { win, rest } = pick(ids2, u.cminU, u.sizeU, nodeCap);
      if (win.length) nodes.push({ id: p, cellSize, ...encode(win) });
      const h0 = cube.size / 2, cx = u.cminU[0] + u.sizeU[0] / 2, cy = u.cminU[1] + u.sizeU[1] / 2, cz = u.cminU[2] + u.sizeU[2] / 2;
      const cnt = new Int32Array(8);
      const oct = new Uint8Array(rest.length);
      for (let q = 0; q < rest.length; q++) { const i = rest[q]; const o = (A.x[i] >= cx ? 1 : 0) | (A.y[i] >= cy ? 2 : 0) | (A.z[i] >= cz ? 4 : 0); oct[q] = o; cnt[o]++; }
      const parts = []; for (let o = 0; o < 8; o++) parts.push(new Int32Array(cnt[o]));
      const fill = new Int32Array(8);
      for (let q = 0; q < rest.length; q++) { const o = oct[q]; parts[o][fill[o]++] = rest[q]; }
      for (let o = 0; o < 8; o++) {
        if (!cnt[o]) continue;
        const cm = cube.min.slice(); if (o & 1) cm[0] += h0; if (o & 2) cm[1] += h0; if (o & 4) cm[2] += h0;
        sub(parts[o], p + o, { min: cm, size: h0 }, depth + 1);
      }
    };
    sub(ids, path, cubeOfPath(path, origin, size), d0);
    return { nodes, ups };
  };
}

export function loadBin(chunks, hasRgb, hasInt) {
  let total = 0;
  for (const c of chunks) total += c.length / REC_BYTES;
  const A = { n: total, x: new Int32Array(total), y: new Int32Array(total), z: new Int32Array(total), cls: new Uint8Array(total), flags: new Uint8Array(total), inten: hasInt ? new Uint16Array(total) : null, rgb: hasRgb ? new Uint8Array(3 * total) : null };
  let o = 0;
  for (const c0 of chunks) {
    const c = (c0.byteOffset & 3) ? new Uint8Array(c0) : c0, m = c.length / REC_BYTES;
    const i32 = new Int32Array(c.buffer, c.byteOffset, m * 5), u16 = new Uint16Array(c.buffer, c.byteOffset, m * 10);
    for (let k = 0; k < m; k++, o++) {
      A.x[o] = i32[5 * k]; A.y[o] = i32[5 * k + 1]; A.z[o] = i32[5 * k + 2];
      A.cls[o] = c[REC_BYTES * k + 12]; A.flags[o] = c[REC_BYTES * k + 13];
      if (hasInt) A.inten[o] = u16[10 * k + 7];
      if (hasRgb) { A.rgb[3 * o] = c[REC_BYTES * k + 16]; A.rgb[3 * o + 1] = c[REC_BYTES * k + 17]; A.rgb[3 * o + 2] = c[REC_BYTES * k + 18]; }
    }
  }
  return A;
}

