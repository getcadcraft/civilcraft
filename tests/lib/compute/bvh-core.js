/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer errors */
/**
 * bvh-core.js — the binary BVH (0.7 CU.4): binned SAH build over primitive boxes, a canonical node order, refit, and traversal
 * (closest hit and any hit against triangles). DOM-free, import-free. Its output is exactly RENDER-SPEC § 6.3 version 1 (binary
 * nodes: 2 × vec4 = (bmin.xyz, a), (bmax.xyz, b); inner b = 0, a = left child, right = a + 1; leaf b = count, a = first), and
 * it is the first stage of the wide two-level layout (bvh-wide.js, bvh-scene.js).
 *
 *   buildTree(boxes, opts) → tree                 boxes: Float32Array|Float64Array, 6 per primitive (min xyz, max xyz)
 *     opts: { maxLeaf = 4, bins = 12, deferAbove = Infinity }
 *     tree = { count (nodes), bmin, bmax (Float32Array 3/node, rounded outward), a, b (Uint32Array), order (Uint32Array:
 *              slot → primitive), n (primitives), deferred: [node], dcount }
 *   deferAbove: a node with ≤ deferAbove primitives (and more than maxLeaf) is not split here: it is marked deferred
 *     (b = DEFERRED, a = first slot, dcount[node] = its count). The parallel builder (bvh-parallel.js) builds those subtrees
 *     in workers and splices them in. The default (0) never defers.
 *   canonical(tree) → tree                        nodes renumbered depth first (children in pairs), so the same topology
 *                                                 gives the same bytes however it was built (serial or parallel)
 *   refit(tree, boxes)                            new primitive boxes, same topology (animation, live edits): bottom up
 *   packV1(tree, triRecords?) → { nodes: ArrayBuffer (8 words/node), order }   RENDER-SPEC § 6.3 v1 bytes
 *   triBoxes(tris) → Float64Array                 boxes of RENDER-SPEC § 6.2 `tris` records (v0, e1, e2 per triangle)
 *   closestHit(tree, tris, o, d, tmax?, out?) → out | null    out = { t, prim, u, v } (prim = original triangle index)
 *   anyHit(tree, tris, o, d, tmax) → bool
 *   intersectTri(tris, i, o, d, tmin, tmax, out) → bool       Möller–Trumbore, double-sided (RENDER-SPEC § 6.2)
 *
 * Determinism: every decision depends only on the boxes of the node's own primitives and their order, ties go to the lower
 * axis / lower bin, and degenerate nodes split at the middle slot — so the result does not depend on the thread that built it.
 * SAH: traversal cost 1, intersection cost 1 per primitive; binning on centroid bounds; nodes with all centroids in one point
 * split in half by slot.
 */

export const DEFERRED = 0xffffffff;

// ---- f32 rounding outward (boxes stored as f32 must still contain the f64 geometry)
const F = new Float32Array(1), U = new Uint32Array(F.buffer);
export function f32down(x) {
  F[0] = x;
  if (F[0] <= x || !Number.isFinite(x)) return F[0];
  // F[0] > x: step one ulp toward −∞
  if (F[0] === 0) return -1.401298464324817e-45;
  U[0] += F[0] > 0 ? -1 : 1;
  return F[0];
}
export function f32up(x) {
  F[0] = x;
  if (F[0] >= x || !Number.isFinite(x)) return F[0];
  if (F[0] === 0) return 1.401298464324817e-45;
  U[0] += F[0] > 0 ? 1 : -1;
  return F[0];
}

/** Boxes of RENDER-SPEC § 6.2 triangle records (12 floats per triangle: v0.xyz, mat, e1.xyz, 0, e2.xyz, 0). */
export function triBoxes(tris, n = Math.floor(tris.length / 12)) {
  const out = new Float64Array(n * 6);
  for (let i = 0; i < n; i++) {
    const k = i * 12;
    const x0 = tris[k], y0 = tris[k + 1], z0 = tris[k + 2];
    const x1 = x0 + tris[k + 4], y1 = y0 + tris[k + 5], z1 = z0 + tris[k + 6];
    const x2 = x0 + tris[k + 8], y2 = y0 + tris[k + 9], z2 = z0 + tris[k + 10];
    const o = i * 6;
    out[o] = Math.min(x0, x1, x2); out[o + 1] = Math.min(y0, y1, y2); out[o + 2] = Math.min(z0, z1, z2);
    out[o + 3] = Math.max(x0, x1, x2); out[o + 4] = Math.max(y0, y1, y2); out[o + 5] = Math.max(z0, z1, z2);
  }
  return out;
}

const area = (dx, dy, dz) => (dx < 0 || dy < 0 || dz < 0 ? 0 : dx * dy + dy * dz + dz * dx);

/**
 * Build a binary BVH. Iterative (explicit stack), typed arrays only; scratch arrays are allocated once per build.
 */
export function buildTree(boxes, { maxLeaf = 4, bins = 12, deferAbove = 0, axes = 'longest' } = {}) {
  const n = Math.floor(boxes.length / 6);
  const leafMax = Math.max(1, Math.floor(maxLeaf));
  const B = Math.max(2, Math.min(64, Math.floor(bins)));
  const cap = Math.max(1, 2 * n);
  const bmin = new Float32Array(cap * 3), bmax = new Float32Array(cap * 3);
  const a = new Uint32Array(cap), b = new Uint32Array(cap), dcount = new Uint32Array(cap);
  const order = new Uint32Array(n);
  // slot data: box (6) + centroid (3) per slot, moved with `order` by the partition, so every pass reads memory in order
  const D = new Float64Array(n * 9);
  for (let i = 0; i < n; i++) {
    order[i] = i;
    const o = i * 6, d = i * 9;
    for (let k = 0; k < 6; k++) D[d + k] = boxes[o + k];
    for (let k = 0; k < 3; k++) D[d + 6 + k] = (boxes[o + k] + boxes[o + 3 + k]) * 0.5;
  }
  // per axis per bin: count, primitive box (6), centroid box (6)
  const binCount = new Uint32Array(3 * B), binBox = new Float64Array(3 * B * 12);
  const rightArea = new Float64Array(B), rightCount = new Uint32Array(B);
  const deferred = [];
  // a node's box and centroid box travel with it (from its parent's bins): no pass over the primitives just for bounds
  let ustack = new Uint32Array(3 * 64), fstack = new Float64Array(12 * 64), sp = 0;
  const push = (node, first, cnt, bx) => {
    if (sp + 1 > ustack.length / 3) {
      const u2 = new Uint32Array(ustack.length * 2); u2.set(ustack); ustack = u2;
      const f2 = new Float64Array(fstack.length * 2); f2.set(fstack); fstack = f2;
    }
    ustack[sp * 3] = node; ustack[sp * 3 + 1] = first; ustack[sp * 3 + 2] = cnt;
    for (let k = 0; k < 12; k++) fstack[sp * 12 + k] = bx[k];
    sp++;
  };
  /** box (0..5) and centroid box (6..11) of slots first..first+cnt, by one pass (the root, and slot splits). */
  const scan = (first, cnt, out) => {
    out[0] = out[1] = out[2] = out[6] = out[7] = out[8] = Infinity;
    out[3] = out[4] = out[5] = out[9] = out[10] = out[11] = -Infinity;
    for (let s = first; s < first + cnt; s++) {
      const d = s * 9;
      for (let k = 0; k < 3; k++) {
        if (D[d + k] < out[k]) out[k] = D[d + k];
        if (D[d + 3 + k] > out[3 + k]) out[3 + k] = D[d + 3 + k];
        if (D[d + 6 + k] < out[6 + k]) out[6 + k] = D[d + 6 + k];
        if (D[d + 6 + k] > out[9 + k]) out[9 + k] = D[d + 6 + k];
      }
    }
    return out;
  };
  const setBox = (node, bx, cnt) => {
    const k = node * 3;
    if (!cnt) { bmin[k] = bmin[k + 1] = bmin[k + 2] = bmax[k] = bmax[k + 1] = bmax[k + 2] = 0; return; }
    bmin[k] = f32down(bx[0]); bmin[k + 1] = f32down(bx[1]); bmin[k + 2] = f32down(bx[2]);
    bmax[k] = f32up(bx[3]); bmax[k + 1] = f32up(bx[4]); bmax[k + 2] = f32up(bx[5]);
  };
  const cur = new Float64Array(12), L = new Float64Array(12), R = new Float64Array(12);

  let count = 1;
  if (n === 0) { setBox(0, cur, 0); a[0] = 0; b[0] = 0; return finish(); }
  push(0, 0, n, scan(0, n, cur));
  while (sp) {
    sp--;
    const node = ustack[sp * 3], first = ustack[sp * 3 + 1], cnt = ustack[sp * 3 + 2];
    for (let k = 0; k < 12; k++) cur[k] = fstack[sp * 12 + k];
    setBox(node, cur, cnt);
    if (cnt <= leafMax) { a[node] = first; b[node] = cnt; continue; }
    if (cnt <= deferAbove) { a[node] = first; b[node] = DEFERRED; dcount[node] = cnt; deferred.push(node); continue; }
    const lx = cur[6], ly = cur[7], lz = cur[8];
    const ex = cur[9] - lx, ey = cur[10] - ly, ez = cur[11] - lz;
    let kx = ex > 0 ? B / ex : 0, ky = ey > 0 ? B / ey : 0, kz = ez > 0 ? B / ez : 0;
    // 'longest': bin only the axis with the longest centroid extent (a third of the work; the others only if it finds no split)
    const all = { kx, ky, kz };
    if (axes === 'longest') {
      const big = ex >= ey && ex >= ez ? 0 : ey >= ez ? 1 : 2;
      if (big !== 0) kx = 0; if (big !== 1) ky = 0; if (big !== 2) kz = 0;
    }
    let bestAxis = -1, bestBin = -1, bestCost = Infinity;
    const end = first + cnt;
    for (let attempt = 0; attempt < 2; attempt++) {
    binCount.fill(0);
    for (let i = 0; i < binBox.length; i += 6) { binBox[i] = binBox[i + 1] = binBox[i + 2] = Infinity; binBox[i + 3] = binBox[i + 4] = binBox[i + 5] = -Infinity; }
    // one pass: every primitive into its bin on every axis
    for (let s = first; s < end; s++) {
      const d = s * 9;
      const x0 = D[d], y0 = D[d + 1], z0 = D[d + 2], x1 = D[d + 3], y1 = D[d + 4], z1 = D[d + 5], cx = D[d + 6], cy = D[d + 7], cz = D[d + 8];
      for (let ax = 0; ax < 3; ax++) {
        const k = ax === 0 ? kx : ax === 1 ? ky : kz;
        if (k === 0) continue;
        let bi = (((ax === 0 ? cx - lx : ax === 1 ? cy - ly : cz - lz)) * k) | 0;
        if (bi >= B) bi = B - 1; else if (bi < 0) bi = 0;
        const j = ax * B + bi, bo = j * 12;
        binCount[j]++;
        if (x0 < binBox[bo]) binBox[bo] = x0;
        if (y0 < binBox[bo + 1]) binBox[bo + 1] = y0;
        if (z0 < binBox[bo + 2]) binBox[bo + 2] = z0;
        if (x1 > binBox[bo + 3]) binBox[bo + 3] = x1;
        if (y1 > binBox[bo + 4]) binBox[bo + 4] = y1;
        if (z1 > binBox[bo + 5]) binBox[bo + 5] = z1;
        if (cx < binBox[bo + 6]) binBox[bo + 6] = cx; if (cx > binBox[bo + 9]) binBox[bo + 9] = cx;
        if (cy < binBox[bo + 7]) binBox[bo + 7] = cy; if (cy > binBox[bo + 10]) binBox[bo + 10] = cy;
        if (cz < binBox[bo + 8]) binBox[bo + 8] = cz; if (cz > binBox[bo + 11]) binBox[bo + 11] = cz;
      }
    }
    for (let ax = 0; ax < 3; ax++) {
      if ((ax === 0 ? kx : ax === 1 ? ky : kz) === 0) continue;
      let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity, c = 0;
      for (let i = B - 1; i > 0; i--) {
        const j = ax * B + i, bo = j * 12;
        if (binCount[j]) {
          c += binCount[j];
          if (binBox[bo] < x0) x0 = binBox[bo]; if (binBox[bo + 1] < y0) y0 = binBox[bo + 1]; if (binBox[bo + 2] < z0) z0 = binBox[bo + 2];
          if (binBox[bo + 3] > x1) x1 = binBox[bo + 3]; if (binBox[bo + 4] > y1) y1 = binBox[bo + 4]; if (binBox[bo + 5] > z1) z1 = binBox[bo + 5];
        }
        rightCount[i] = c; rightArea[i] = c ? area(x1 - x0, y1 - y0, z1 - z0) : 0;
      }
      x0 = y0 = z0 = Infinity; x1 = y1 = z1 = -Infinity; c = 0;
      for (let i = 0; i < B - 1; i++) {
        const j = ax * B + i, bo = j * 12;
        if (binCount[j]) {
          c += binCount[j];
          if (binBox[bo] < x0) x0 = binBox[bo]; if (binBox[bo + 1] < y0) y0 = binBox[bo + 1]; if (binBox[bo + 2] < z0) z0 = binBox[bo + 2];
          if (binBox[bo + 3] > x1) x1 = binBox[bo + 3]; if (binBox[bo + 4] > y1) y1 = binBox[bo + 4]; if (binBox[bo + 5] > z1) z1 = binBox[bo + 5];
        }
        const rc = rightCount[i + 1];
        if (!c || !rc) continue;
        const cost = c * area(x1 - x0, y1 - y0, z1 - z0) + rc * rightArea[i + 1];
        if (cost < bestCost) { bestCost = cost; bestAxis = ax; bestBin = i; }
      }
    }
    if (bestAxis >= 0 || axes !== 'longest' || attempt) break;
    // the longest axis found no split: try the other two
    const was = [kx, ky, kz];
    kx = was[0] ? 0 : all.kx; ky = was[1] ? 0 : all.ky; kz = was[2] ? 0 : all.kz;
    if (!kx && !ky && !kz) break;
    }
    let mid;
    if (bestAxis < 0) {
      // every centroid in one point: split by slot, bounds by a pass
      mid = first + (cnt >> 1);
      scan(first, mid - first, L); scan(mid, end - mid, R);
    } else {
      // children's bounds from the bins on the chosen axis
      L[0] = L[1] = L[2] = L[6] = L[7] = L[8] = R[0] = R[1] = R[2] = R[6] = R[7] = R[8] = Infinity;
      L[3] = L[4] = L[5] = L[9] = L[10] = L[11] = R[3] = R[4] = R[5] = R[9] = R[10] = R[11] = -Infinity;
      for (let i = 0; i < B; i++) {
        const j = bestAxis * B + i;
        if (!binCount[j]) continue;
        const T = i <= bestBin ? L : R, bo = j * 12;
        for (let k = 0; k < 3; k++) {
          if (binBox[bo + k] < T[k]) T[k] = binBox[bo + k];
          if (binBox[bo + 3 + k] > T[3 + k]) T[3 + k] = binBox[bo + 3 + k];
          if (binBox[bo + 6 + k] < T[6 + k]) T[6 + k] = binBox[bo + 6 + k];
          if (binBox[bo + 9 + k] > T[9 + k]) T[9 + k] = binBox[bo + 9 + k];
        }
      }
      // partition by the same bin formula: bins ≤ bestBin to the left (two pointers: deterministic); data moves with order
      const lo = bestAxis === 0 ? lx : bestAxis === 1 ? ly : lz, k = bestAxis === 0 ? kx : bestAxis === 1 ? ky : kz;
      const off = 6 + bestAxis;
      let i = first, j = end - 1;
      while (i <= j) {
        let bi = ((D[i * 9 + off] - lo) * k) | 0;
        if (bi >= B) bi = B - 1; else if (bi < 0) bi = 0;
        if (bi <= bestBin) { i++; continue; }
        const t = order[i]; order[i] = order[j]; order[j] = t;
        const di = i * 9, dj = j * 9;
        for (let q = 0; q < 9; q++) { const v = D[di + q]; D[di + q] = D[dj + q]; D[dj + q] = v; }
        j--;
      }
      mid = i;
    }
    const left = count;
    count += 2;
    a[node] = left; b[node] = 0;
    // right pushed first so the left subtree is built (and numbered) first
    push(left + 1, mid, end - mid, R);
    push(left, first, mid - first, L);
  }
  return finish();

  function finish() {
    return { count, bmin: bmin.subarray(0, count * 3), bmax: bmax.subarray(0, count * 3), a: a.subarray(0, count), b: b.subarray(0, count), dcount: dcount.subarray(0, count), order, deferred, n };
  }
}

/** Renumber depth first with children in pairs: the same topology gives the same arrays, however it was built. */
export function canonical(tree) {
  const { count, bmin, bmax, a, b } = tree;
  if (!tree.n) return { ...tree, deferred: [] };   // the empty tree: one empty node
  const nb0 = new Float32Array(count * 3), nb1 = new Float32Array(count * 3), na = new Uint32Array(count), nbb = new Uint32Array(count);
  const stack = new Uint32Array(Math.max(64, count * 2));
  // stack of (old, new)
  let sp = 0, next = 1;
  stack[sp++] = 0; stack[sp++] = 0;
  while (sp) {
    const nw = stack[--sp], old = stack[--sp];
    nb0.set(bmin.subarray(old * 3, old * 3 + 3), nw * 3);
    nb1.set(bmax.subarray(old * 3, old * 3 + 3), nw * 3);
    if (b[old] !== 0) { na[nw] = a[old]; nbb[nw] = b[old]; continue; }
    const l = next; next += 2;
    na[nw] = l; nbb[nw] = 0;
    stack[sp++] = a[old] + 1; stack[sp++] = l + 1;
    stack[sp++] = a[old]; stack[sp++] = l;
  }
  return { ...tree, bmin: nb0, bmax: nb1, a: na, b: nbb, deferred: [], dcount: new Uint32Array(count) };
}

/** New primitive boxes, same tree: every node box recomputed bottom up (children always have higher indices). */
export function refit(tree, boxes) {
  const { count, bmin, bmax, a, b, order } = tree;
  if (!tree.n) return tree;
  for (let node = count - 1; node >= 0; node--) {
    const k = node * 3;
    let x0 = Infinity, y0 = Infinity, z0 = Infinity, x1 = -Infinity, y1 = -Infinity, z1 = -Infinity;
    if (b[node] !== 0) {
      for (let s = a[node]; s < a[node] + b[node]; s++) {
        const o = order[s] * 6;
        if (boxes[o] < x0) x0 = boxes[o]; if (boxes[o + 1] < y0) y0 = boxes[o + 1]; if (boxes[o + 2] < z0) z0 = boxes[o + 2];
        if (boxes[o + 3] > x1) x1 = boxes[o + 3]; if (boxes[o + 4] > y1) y1 = boxes[o + 4]; if (boxes[o + 5] > z1) z1 = boxes[o + 5];
      }
      if (!b[node]) { x0 = y0 = z0 = x1 = y1 = z1 = 0; }
      bmin[k] = f32down(x0); bmin[k + 1] = f32down(y0); bmin[k + 2] = f32down(z0);
      bmax[k] = f32up(x1); bmax[k + 1] = f32up(y1); bmax[k + 2] = f32up(z1);
    } else {
      const l = a[node] * 3, r = (a[node] + 1) * 3;
      for (let i = 0; i < 3; i++) { bmin[k + i] = Math.min(bmin[l + i], bmin[r + i]); bmax[k + i] = Math.max(bmax[l + i], bmax[r + i]); }
    }
  }
  return tree;
}

/** RENDER-SPEC § 6.3 v1: 8 words per node, (bmin.xyz, a), (bmax.xyz, b). */
export function packV1(tree) {
  const buf = new ArrayBuffer(tree.count * 32);
  const f = new Float32Array(buf), u = new Uint32Array(buf);
  for (let i = 0; i < tree.count; i++) {
    const o = i * 8, k = i * 3;
    f[o] = tree.bmin[k]; f[o + 1] = tree.bmin[k + 1]; f[o + 2] = tree.bmin[k + 2]; u[o + 3] = tree.a[i];
    f[o + 4] = tree.bmax[k]; f[o + 5] = tree.bmax[k + 1]; f[o + 6] = tree.bmax[k + 2]; u[o + 7] = tree.b[i];
  }
  return { nodes: buf, order: tree.order };
}

/** Möller–Trumbore, double-sided; tris are RENDER-SPEC § 6.2 records (in original triangle order). */
export function intersectTri(tris, i, ox, oy, oz, dx, dy, dz, tmin, tmax, out) {
  const k = i * 12;
  const e1x = tris[k + 4], e1y = tris[k + 5], e1z = tris[k + 6];
  const e2x = tris[k + 8], e2y = tris[k + 9], e2z = tris[k + 10];
  const px = dy * e2z - dz * e2y, py = dz * e2x - dx * e2z, pz = dx * e2y - dy * e2x;
  const det = e1x * px + e1y * py + e1z * pz;
  if (det > -1e-12 && det < 1e-12) return false;
  const inv = 1 / det;
  const sx = ox - tris[k], sy = oy - tris[k + 1], sz = oz - tris[k + 2];
  const u = (sx * px + sy * py + sz * pz) * inv;
  if (u < 0 || u > 1) return false;
  const qx = sy * e1z - sz * e1y, qy = sz * e1x - sx * e1z, qz = sx * e1y - sy * e1x;
  const v = (dx * qx + dy * qy + dz * qz) * inv;
  if (v < 0 || u + v > 1) return false;
  const t = (e2x * qx + e2y * qy + e2z * qz) * inv;
  if (!(t > tmin && t < tmax)) return false;
  if (out) { out.t = t; out.u = u; out.v = v; }
  return true;
}

const SAFE = (x) => (x === 0 ? 1e30 : 1 / x);

function slab(bmin, bmax, k, ox, oy, oz, ix, iy, iz, tmax) {
  let t0 = (bmin[k] - ox) * ix, t1 = (bmax[k] - ox) * ix;
  let lo = t0 < t1 ? t0 : t1, hi = t0 < t1 ? t1 : t0;
  t0 = (bmin[k + 1] - oy) * iy; t1 = (bmax[k + 1] - oy) * iy;
  lo = Math.max(lo, t0 < t1 ? t0 : t1); hi = Math.min(hi, t0 < t1 ? t1 : t0);
  t0 = (bmin[k + 2] - oz) * iz; t1 = (bmax[k + 2] - oz) * iz;
  lo = Math.max(lo, t0 < t1 ? t0 : t1); hi = Math.min(hi, t0 < t1 ? t1 : t0);
  hi *= 1 + 4e-7;   // f32 boxes, f64 rays: never miss a grazing hit
  return lo <= hi && hi >= 0 && lo <= tmax ? Math.max(lo, 0) : Infinity;
}

const travStack = { s: new Uint32Array(256) };
/** Closest hit along o + t·d for 0 < t < tmax. out = { t, prim, u, v } (prim: original triangle index), or null. */
export function closestHit(tree, tris, o, d, tmax = Infinity, out = { t: 0, prim: -1, u: 0, v: 0 }) {
  const { bmin, bmax, a, b, order } = tree;
  if (!tree.n) return null;
  const [ox, oy, oz] = o, [dx, dy, dz] = d;
  const ix = SAFE(dx), iy = SAFE(dy), iz = SAFE(dz);
  let best = tmax, hitPrim = -1, hu = 0, hv = 0;
  const stack = travStack.s;
  let sp = 0;
  if (slab(bmin, bmax, 0, ox, oy, oz, ix, iy, iz, best) === Infinity) return null;
  stack[sp++] = 0;
  const tmp = { t: 0, u: 0, v: 0 };
  while (sp) {
    const node = stack[--sp];
    if (b[node] !== 0) {
      for (let s = a[node]; s < a[node] + b[node]; s++) {
        const p = order[s];
        if (intersectTri(tris, p, ox, oy, oz, dx, dy, dz, 0, best, tmp)) { best = tmp.t; hitPrim = p; hu = tmp.u; hv = tmp.v; }
      }
      continue;
    }
    const l = a[node], r = l + 1;
    const tl = slab(bmin, bmax, l * 3, ox, oy, oz, ix, iy, iz, best);
    const tr = slab(bmin, bmax, r * 3, ox, oy, oz, ix, iy, iz, best);
    if (sp + 2 > stack.length) { const s2 = new Uint32Array(stack.length * 2); s2.set(stack); travStack.s = s2; return closestHit(tree, tris, o, d, tmax, out); }
    // nearer child on top
    if (tl <= tr) { if (tr !== Infinity) stack[sp++] = r; if (tl !== Infinity) stack[sp++] = l; }
    else { if (tl !== Infinity) stack[sp++] = l; if (tr !== Infinity) stack[sp++] = r; }
  }
  if (hitPrim < 0) return null;
  out.t = best; out.prim = hitPrim; out.u = hu; out.v = hv;
  return out;
}

/** True when anything is hit with 0 < t < tmax (shadow rays). */
export function anyHit(tree, tris, o, d, tmax) {
  const { bmin, bmax, a, b, order } = tree;
  if (!tree.n) return false;
  const [ox, oy, oz] = o, [dx, dy, dz] = d;
  const ix = SAFE(dx), iy = SAFE(dy), iz = SAFE(dz);
  const stack = travStack.s;
  let sp = 0;
  if (slab(bmin, bmax, 0, ox, oy, oz, ix, iy, iz, tmax) === Infinity) return false;
  stack[sp++] = 0;
  while (sp) {
    const node = stack[--sp];
    if (b[node] !== 0) {
      for (let s = a[node]; s < a[node] + b[node]; s++) if (intersectTri(tris, order[s], ox, oy, oz, dx, dy, dz, 0, tmax, null)) return true;
      continue;
    }
    const l = a[node];
    if (sp + 2 > stack.length) { const s2 = new Uint32Array(stack.length * 2); s2.set(stack); travStack.s = s2; return anyHit(tree, tris, o, d, tmax); }
    if (slab(bmin, bmax, (l + 1) * 3, ox, oy, oz, ix, iy, iz, tmax) !== Infinity) stack[sp++] = l + 1;
    if (slab(bmin, bmax, l * 3, ox, oy, oz, ix, iy, iz, tmax) !== Infinity) stack[sp++] = l;
  }
  return false;
}

/** SAH cost of a built tree (relative to the root's area): a quality number for tests and the bench. */
export function sahCost(tree) {
  const { count, bmin, bmax, b } = tree;
  const A = (i) => area(bmax[i * 3] - bmin[i * 3], bmax[i * 3 + 1] - bmin[i * 3 + 1], bmax[i * 3 + 2] - bmin[i * 3 + 2]);
  const root = A(0) || 1;
  let c = 0;
  for (let i = 0; i < count; i++) c += (b[i] === 0 ? 1 : b[i]) * A(i) / root;
  return c;
}
