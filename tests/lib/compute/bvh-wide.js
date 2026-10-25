/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: a developer error */
/**
 * bvh-wide.js — compressed 4-wide BVH nodes (0.7 CU.4), the layout the GPU and CPU kernels traverse (RENDER-SPEC § 6.3 v2,
 * proposed by `compute`). Built by collapsing a canonical binary tree (bvh-core.js): each wide node opens its largest inner
 * child until it has four children. Child boxes are stored as 8-bit offsets from the node's origin in steps of a power of two
 * per axis (exact to decode), rounded outward and checked in f32, so a decoded child box always contains its geometry.
 *
 * Node = 16 words (4 × vec4):
 *   w0..2  origin xyz (f32)             w3  ex | ey << 8 | ez << 16 | innerMask << 24   (e = exponent + 127; scale = 2^(e−127))
 *   w4     childBase: first inner child (inner children are contiguous, in child order)
 *   w5     primBase: first primitive slot of the first leaf child (leaf children's primitives are contiguous, in child order)
 *   w6     leaf counts: byte i = primitive count of child i when it is a leaf (0 for inner children and empty slots)
 *   w7     0 (reserved)
 *   w8..10 lo x / y / z: byte i = child i     w11..13 hi x / y / z: byte i = child i     w14, w15  0 (reserved)
 *   child i is inner when bit i of innerMask is set: node = childBase + popcount(innerMask & ((1 << i) − 1));
 *   a leaf when its count byte > 0: slots primBase + (counts of the leaf children before it) …; empty otherwise.
 *   child box = origin + q · scale per axis, lo from the lo bytes, hi from the hi bytes.
 *
 *   toWide(tree, { nodeOffset = 0, primOffset = 0 }) → { count, words: Uint32Array (16 × count), f: Float32Array view,
 *       order: Uint32Array (slot → primitive), boxes: Float32Array (6 × count, each node's exact box, for refit) }
 *     nodeOffset / primOffset make childBase / primBase absolute when several trees share one buffer (bvh-scene.js).
 *   decodeChild(words, node, i, out6) → out6 | null (empty)       childInfo(words, node, i) → { kind, node | first, count }
 *   refitWide(w, primBoxes, { nodeOffset, primOffset })           new primitive boxes, same topology; re-quantized
 *   traverseWide(words, f, root, ray, tmax, leafHit, any?, stack?) → nearest t   generic traversal (bvh-scene.js uses it)
 */
import { f32down, f32up } from './bvh-core.js';

export const WORDS = 16;
const f32 = Math.fround;

function popcount4(x) { x &= 15; return (x & 1) + ((x >> 1) & 1) + ((x >> 2) & 1) + ((x >> 3) & 1); }

/**
 * Quantize the child boxes of one node into its words. nodeBox: 6 numbers (f32-exact). kidBox(i, out6) fills child i's box
 * and returns 1 inner / 2 leaf / 0 empty.
 */
function quantize(words, f, base, nodeBox, nb0, kidKind, kidBoxes) {
  // origin = node min (already f32, rounded down); scale per axis: smallest power of two with 255 · s ≥ extent
  const ox = nodeBox[nb0], oy = nodeBox[nb0 + 1], oz = nodeBox[nb0 + 2];
  let ebits = 0, l0 = 0, l1 = 0, l2 = 0, h0 = 0, h1 = 0, h2 = 0, innerMask = 0;
  const S = [0, 0, 0], O = [ox, oy, oz];
  for (let ax = 0; ax < 3; ax++) {
    const ext = nodeBox[nb0 + 3 + ax] - nodeBox[nb0 + ax];
    let e = ext > 0 ? Math.ceil(Math.log2(ext / 255)) : -126;
    if (e < -126) e = -126; if (e > 127) e = 127;
    while (e < 127 && 255 * 2 ** e < ext) e++;   // log2 can land one short through rounding
    S[ax] = 2 ** e;
    ebits |= ((e + 127) & 255) << (8 * ax);
  }
  f[base] = ox; f[base + 1] = oy; f[base + 2] = oz;
  for (let i = 0; i < 4; i++) {
    const kind = kidKind[i];
    if (!kind) continue;
    if (kind === 1) innerMask |= 1 << i;
    const kb = i * 6;
    for (let ax = 0; ax < 3; ax++) {
      const o = O[ax], s = S[ax];
      let ql = Math.floor((kidBoxes[kb + ax] - o) / s), qh = Math.ceil((kidBoxes[kb + 3 + ax] - o) / s);
      ql = ql < 0 ? 0 : ql > 255 ? 255 : ql; qh = qh < 0 ? 0 : qh > 255 ? 255 : qh;
      // conservative in f32 (o + q·s with one rounding, as the kernels compute it)
      while (ql > 0 && f32(o + ql * s) > kidBoxes[kb + ax]) ql--;
      while (qh < 255 && f32(o + qh * s) < kidBoxes[kb + 3 + ax]) qh++;
      const sh = 8 * i;
      if (ax === 0) { l0 |= ql << sh; h0 |= qh << sh; } else if (ax === 1) { l1 |= ql << sh; h1 |= qh << sh; } else { l2 |= ql << sh; h2 |= qh << sh; }
    }
  }
  words[base + 3] = (ebits | (innerMask << 24)) >>> 0;
  words[base + 8] = l0 >>> 0; words[base + 9] = l1 >>> 0; words[base + 10] = l2 >>> 0;
  words[base + 11] = h0 >>> 0; words[base + 12] = h1 >>> 0; words[base + 13] = h2 >>> 0;
}

export function toWide(tree, { nodeOffset = 0, primOffset = 0 } = {}) {
  const { a, b, bmin, bmax } = tree;
  const maxNodes = Math.max(1, tree.count);   // never more wide nodes than binary nodes
  const words = new Uint32Array(maxNodes * WORDS);
  const f = new Float32Array(words.buffer);
  const boxes = new Float32Array(maxNodes * 6);
  const order = new Uint32Array(tree.order.length);
  // binary node areas once (which child to open next)
  const ar = new Float64Array(tree.count);
  for (let i = 0; i < tree.count; i++) { const dx = bmax[i * 3] - bmin[i * 3], dy = bmax[i * 3 + 1] - bmin[i * 3 + 1], dz = bmax[i * 3 + 2] - bmin[i * 3 + 2]; ar[i] = dx * dy + dy * dz + dz * dx; }
  const queue = new Uint32Array(maxNodes);   // binary node of each wide node, in wide order
  let qn = 1, count = 1, cursor = 0;
  queue[0] = 0;
  const kids = new Int32Array(4), kind = new Uint8Array(4), kb = new Float64Array(24), nb = new Float64Array(6);
  for (let w = 0; w < qn; w++) {
    const bn = queue[w];
    const base = w * WORDS;
    let nk;
    if (!tree.n) nk = 0;                                 // the empty tree: a node with no children
    else if (b[bn] !== 0) { kids[0] = bn; nk = 1; }      // a leaf at the root
    else {
      kids[0] = a[bn]; kids[1] = a[bn] + 1; nk = 2;
      // open the largest inner child until there are four (children keep their place: spatial order)
      while (nk < 4) {
        let pick = -1, best = -1;
        for (let i = 0; i < nk; i++) if (b[kids[i]] === 0 && ar[kids[i]] > best) { best = ar[kids[i]]; pick = i; }
        if (pick < 0) break;
        const c = kids[pick];
        for (let i = nk; i > pick + 1; i--) kids[i] = kids[i - 1];
        kids[pick] = a[c]; kids[pick + 1] = a[c] + 1; nk++;
      }
    }
    for (let k = 0; k < 3; k++) { nb[k] = bmin[bn * 3 + k]; nb[3 + k] = bmax[bn * 3 + k]; }
    boxes.set(nb, w * 6);
    const childBase = count, primBase = cursor;
    let counts = 0;
    for (let i = 0; i < 4; i++) {
      kind[i] = 0;
      if (i >= nk) continue;
      const c = kids[i];
      for (let k = 0; k < 3; k++) { kb[i * 6 + k] = bmin[c * 3 + k]; kb[i * 6 + 3 + k] = bmax[c * 3 + k]; }
      if (b[c] === 0) { kind[i] = 1; queue[qn++] = c; count++; }
      else {
        if (b[c] > 255) throw new Error('bvh: leaf larger than 255 primitives');
        for (let s = a[c]; s < a[c] + b[c]; s++) order[cursor++] = tree.order[s];
        counts |= b[c] << (8 * i);
        kind[i] = b[c] ? 2 : 0;
      }
    }
    words[base + 4] = childBase + nodeOffset;
    words[base + 5] = primBase + primOffset;
    words[base + 6] = counts >>> 0;
    quantize(words, f, base, nb, 0, kind, kb);
  }
  return { count, words: words.subarray(0, count * WORDS), f: f.subarray(0, count * WORDS), order, boxes: boxes.subarray(0, count * 6), nodeOffset, primOffset };
}

/** Child i of a node: { kind: 'inner', node } | { kind: 'leaf', first, count } | null. */
export function childInfo(words, node, i) {
  const base = node * WORDS;
  const mask = words[base + 3] >>> 24;
  if (mask & (1 << i)) return { kind: 'inner', node: words[base + 4] + popcount4(mask & ((1 << i) - 1)) };
  const counts = words[base + 6];
  const c = (counts >>> (8 * i)) & 255;
  if (!c) return null;
  let first = words[base + 5];
  for (let j = 0; j < i; j++) if (!(mask & (1 << j))) first += (counts >>> (8 * j)) & 255;
  return { kind: 'leaf', first, count: c };
}

/** The decoded box of child i, as the kernels compute it (f32), or null for an empty slot. */
export function decodeChild(words, f, node, i, out = new Float64Array(6)) {
  const base = node * WORDS;
  const mask = words[base + 3] >>> 24;
  const c = (words[base + 6] >>> (8 * i)) & 255;
  if (!(mask & (1 << i)) && !c) return null;
  const e = words[base + 3];
  for (let ax = 0; ax < 3; ax++) {
    const s = 2 ** ((((e >>> (8 * ax)) & 255)) - 127);
    const o = f[base + ax];
    out[ax] = f32(o + ((words[base + 8 + ax] >>> (8 * i)) & 255) * s);
    out[3 + ax] = f32(o + ((words[base + 11 + ax] >>> (8 * i)) & 255) * s);
  }
  return out;
}

/**
 * New primitive boxes (same topology): each node's exact box recomputed bottom up (children always come after their parent),
 * then every node re-quantized. primBoxes: 6 per primitive (by primitive id, as the tree was built).
 */
export function refitWide(w, primBoxes) {
  const { words, f, boxes, order, count, nodeOffset = 0, primOffset = 0 } = w;
  const kind = new Uint8Array(4), kb = new Float64Array(24);
  for (let node = count - 1; node >= 0; node--) {
    const base = node * WORDS;
    const mask = words[base + 3] >>> 24;
    const counts = words[base + 6];
    let ci = words[base + 4] - nodeOffset, slot = words[base + 5] - primOffset;
    const nb = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
    for (let i = 0; i < 4; i++) {
      kind[i] = 0;
      let bx;
      if (mask & (1 << i)) { bx = Array.from(boxes.subarray(ci * 6, ci * 6 + 6)); ci++; kind[i] = 1; kb.set(bx, i * 6); }
      else {
        const c = (counts >>> (8 * i)) & 255;
        if (!c) continue;
        bx = [Infinity, Infinity, Infinity, -Infinity, -Infinity, -Infinity];
        for (let s = slot; s < slot + c; s++) {
          const p = order[s] * 6;
          for (let k = 0; k < 3; k++) { if (primBoxes[p + k] < bx[k]) bx[k] = primBoxes[p + k]; if (primBoxes[p + 3 + k] > bx[3 + k]) bx[3 + k] = primBoxes[p + 3 + k]; }
        }
        for (let k = 0; k < 3; k++) { bx[k] = f32down(bx[k]); bx[3 + k] = f32up(bx[3 + k]); }
        slot += c;
        kind[i] = 2; kb.set(bx, i * 6);
      }
      for (let k = 0; k < 3; k++) { if (bx[k] < nb[k]) nb[k] = bx[k]; if (bx[3 + k] > nb[3 + k]) nb[3 + k] = bx[3 + k]; }
    }
    if (nb[0] === Infinity) nb.fill(0);
    boxes.set(nb, node * 6);
    quantize(words, f, base, nb, 0, kind, kb);
  }
  return w;
}

const SAFE = (x) => (x === 0 ? 1e30 : 1 / x);

/**
 * Generic closest-hit traversal of one wide tree whose node buffer is (words, f), from node `root`.
 * leafHit(firstSlot, count, ray, tmax) → t of the nearest hit among those slots (< tmax), or Infinity; it records what it hit.
 * ray = { ox, oy, oz, dx, dy, dz }. Returns the nearest t (Infinity = none). Nearer children first; a fixed stack.
 */
export const newStack = () => ({ s: new Uint32Array(256), t: new Float64Array(256) });
const st0 = newStack();
/** stk: a stack from newStack(); a traversal nested in another (instances: TLAS → BLAS) passes its own. */
export function traverseWide(words, f, root, ray, tmax, leafHit, any = false, st = st0) {
  const { ox, oy, oz, dx, dy, dz } = ray;
  const ix = SAFE(dx), iy = SAFE(dy), iz = SAFE(dz);
  let best = tmax;
  let sp = 0;
  const S = st.s, T = st.t;
  S[sp] = root; T[sp] = 0; sp++;
  const ct = [0, 0, 0, 0], ck = [0, 0, 0, 0];
  while (sp) {
    sp--;
    if (T[sp] > best) continue;
    const node = S[sp], base = node * WORDS;
    const e = words[base + 3], mask = e >>> 24, counts = words[base + 6];
    const sx = 2 ** ((e & 255) - 127), sy = 2 ** (((e >>> 8) & 255) - 127), sz = 2 ** (((e >>> 16) & 255) - 127);
    const nx = f[base], ny = f[base + 1], nz = f[base + 2];
    let ci = words[base + 4], slot = words[base + 5], nk = 0;
    for (let i = 0; i < 4; i++) {
      const sh = 8 * i;
      const inner = (mask >> i) & 1;
      const c = (counts >>> sh) & 255;
      if (!inner && !c) continue;
      const x0 = f32(nx + ((words[base + 8] >>> sh) & 255) * sx), x1 = f32(nx + ((words[base + 11] >>> sh) & 255) * sx);
      const y0 = f32(ny + ((words[base + 9] >>> sh) & 255) * sy), y1 = f32(ny + ((words[base + 12] >>> sh) & 255) * sy);
      const z0 = f32(nz + ((words[base + 10] >>> sh) & 255) * sz), z1 = f32(nz + ((words[base + 13] >>> sh) & 255) * sz);
      let a0 = (x0 - ox) * ix, a1 = (x1 - ox) * ix;
      let lo = a0 < a1 ? a0 : a1, hi = a0 < a1 ? a1 : a0;
      a0 = (y0 - oy) * iy; a1 = (y1 - oy) * iy;
      lo = Math.max(lo, a0 < a1 ? a0 : a1); hi = Math.min(hi, a0 < a1 ? a1 : a0);
      a0 = (z0 - oz) * iz; a1 = (z1 - oz) * iz;
      lo = Math.max(lo, a0 < a1 ? a0 : a1); hi = Math.min(hi, a0 < a1 ? a1 : a0);
      hi *= 1 + 4e-7;
      const hit = lo <= hi && hi >= 0 && lo <= best;
      if (inner) {
        if (hit) { ct[nk] = Math.max(lo, 0); ck[nk] = ci; nk++; }
        ci++;
      } else {
        if (hit) {
          const t = leafHit(slot, c, ray, best);
          if (t < best) { best = t; if (any) return best; }
        }
        slot += c;
      }
    }
    // push far to near so the nearest pops first (insertion sort of ≤ 4)
    for (let i = 1; i < nk; i++) { const t = ct[i], k = ck[i]; let j = i - 1; while (j >= 0 && ct[j] < t) { ct[j + 1] = ct[j]; ck[j + 1] = ck[j]; j--; } ct[j + 1] = t; ck[j + 1] = k; }
    if (sp + nk > S.length) { const s2 = new Uint32Array(S.length * 2), t2 = new Float64Array(S.length * 2); s2.set(S); t2.set(T); st.s = s2; st.t = t2; return traverseWide(words, f, root, ray, tmax, leafHit, any, st); }
    for (let i = 0; i < nk; i++) { S[sp] = ck[i]; T[sp] = ct[i]; sp++; }
  }
  return best;
}
