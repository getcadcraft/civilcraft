/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: errors for developers and tests */
/**
 * parity.js — statistical parity of rendered pictures (0.7 CU.8; KICKOFF rule 17 "two kernels, one picture"; RENDER-SPEC § 9).
 * Kernels are compared by what Monte Carlo allows: means of blocks of pixels agree within a bound set by the pictures' own
 * variance — never pixel-exact. DOM-free, import-free; the same code runs in Node tests, the browser tests and the bench page.
 *
 * A picture's statistics come from one of:
 *   fromBatches(batches, w, h) → stats     k ≥ 2 independent batch pictures (Float32Array w·h·3, each the mean radiance of its
 *                                          own samples; e.g. 4 batches of 4 spp with disjoint sample indices). Batch means:
 *                                          var(mean) = s² / k per pixel and channel.
 *   fromSums(sum, sumSq, n, w, h) → stats  per-pixel Σx and Σx² over n samples (a kernel's test channel)
 *   stats = { w, h, mean: Float64Array (w·h·3), varMean: Float64Array (w·h·3) }
 *
 *   compareImages(ref, test, { block = 8, k = 4.5, maxFail = 0.01, floor = 1e-4 }) → { ok, blocks, failed, worst: {z, bx, by,
 *       channel}, image: { ref, test, z } }   per block × channel: z = |μt − μr| / √(σ²r + σ²t + (floor · max(1, μr))²).
 *       ok when at most maxFail of the blocks have z > k AND the whole-image mean's z ≤ k. With hundreds of blocks a few
 *       large z happen by chance; a real difference (a lobe off by a few %) shows up as many failed blocks and an image z ≫ k.
 *   furnace(stats, expected = 1, { block = 8, k = 4.5 }) → { ok, mean, worstZ, failed, blocks }   every block's mean = expected
 *       within k σ (RENDER-SPEC § 9's scene furnace, by blocks so chance outliers of single pixels don't decide it)
 *   meanOf(stats) → [r, g, b]
 */

export function fromBatches(batches, w, h) {
  const k = batches.length, n = w * h * 3;
  if (k < 2) throw new Error('parity: at least two batches');
  const mean = new Float64Array(n), varMean = new Float64Array(n);
  for (const b of batches) { if (b.length < n) throw new Error('parity: a batch is smaller than w·h·3'); for (let i = 0; i < n; i++) mean[i] += b[i] / k; }
  for (const b of batches) for (let i = 0; i < n; i++) { const d = b[i] - mean[i]; varMean[i] += (d * d) / (k - 1); }
  for (let i = 0; i < n; i++) varMean[i] /= k;
  return { w, h, mean, varMean };
}

export function fromSums(sum, sumSq, nSamples, w, h) {
  const n = w * h * 3;
  if (!(nSamples >= 2)) throw new Error('parity: at least two samples');
  const mean = new Float64Array(n), varMean = new Float64Array(n);
  for (let i = 0; i < n; i++) {
    const m = sum[i] / nSamples;
    const v = Math.max(0, (sumSq[i] - nSamples * m * m) / (nSamples - 1));
    mean[i] = m; varMean[i] = v / nSamples;
  }
  return { w, h, mean, varMean };
}

function blocksOf(st, block) {
  const { w, h, mean, varMean } = st;
  const bw = Math.ceil(w / block), bh = Math.ceil(h / block);
  const bm = new Float64Array(bw * bh * 3), bv = new Float64Array(bw * bh * 3);
  for (let by = 0; by < bh; by++) for (let bx = 0; bx < bw; bx++) {
    let cnt = 0;
    const o = (by * bw + bx) * 3;
    for (let y = by * block; y < Math.min(h, (by + 1) * block); y++) for (let x = bx * block; x < Math.min(w, (bx + 1) * block); x++) {
      const p = (y * w + x) * 3;
      for (let c = 0; c < 3; c++) { bm[o + c] += mean[p + c]; bv[o + c] += varMean[p + c]; }
      cnt++;
    }
    for (let c = 0; c < 3; c++) { bm[o + c] /= cnt; bv[o + c] /= cnt * cnt; }
  }
  return { bw, bh, bm, bv };
}

export function meanOf(st) {
  const out = [0, 0, 0], n = st.w * st.h;
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) out[c] += st.mean[i * 3 + c] / n;
  return out;
}
function varOfMean(st) {
  const out = [0, 0, 0], n = st.w * st.h;
  for (let i = 0; i < n; i++) for (let c = 0; c < 3; c++) out[c] += st.varMean[i * 3 + c] / (n * n);
  return out;
}

export function compareImages(ref, test, { block = 8, k = 4.5, maxFail = 0.01, floor = 1e-4 } = {}) {
  if (ref.w !== test.w || ref.h !== test.h) throw new Error('parity: pictures of different sizes');
  const A = blocksOf(ref, block), B = blocksOf(test, block);
  let failed = 0;
  const worst = { z: 0, bx: -1, by: -1, channel: -1 };
  const blocks = A.bw * A.bh;
  for (let i = 0; i < blocks; i++) {
    let bad = false;
    for (let c = 0; c < 3; c++) {
      const mr = A.bm[i * 3 + c], mt = B.bm[i * 3 + c];
      const e = floor * Math.max(1, Math.abs(mr));
      const z = Math.abs(mt - mr) / Math.sqrt(A.bv[i * 3 + c] + B.bv[i * 3 + c] + e * e);
      if (z > worst.z) { worst.z = z; worst.bx = i % A.bw; worst.by = Math.floor(i / A.bw); worst.channel = c; }
      if (z > k) bad = true;
    }
    if (bad) failed++;
  }
  const mr = meanOf(ref), mt = meanOf(test), vr = varOfMean(ref), vt = varOfMean(test);
  let iz = 0;
  for (let c = 0; c < 3; c++) { const e = floor * Math.max(1, Math.abs(mr[c])); iz = Math.max(iz, Math.abs(mt[c] - mr[c]) / Math.sqrt(vr[c] + vt[c] + e * e)); }
  return { ok: failed <= Math.floor(maxFail * blocks) && iz <= k, blocks, failed, worst, image: { ref: mr, test: mt, z: iz } };
}

export function furnace(st, expected = 1, { block = 8, k = 4.5, floor = 1e-4 } = {}) {
  const B = blocksOf(st, block);
  let failed = 0, worstZ = 0;
  const blocks = B.bw * B.bh;
  for (let i = 0; i < blocks; i++) for (let c = 0; c < 3; c++) {
    const e = floor * Math.max(1, Math.abs(expected));
    const z = Math.abs(B.bm[i * 3 + c] - expected) / Math.sqrt(B.bv[i * 3 + c] + e * e);
    if (z > worstZ) worstZ = z;
    if (z > k) { failed++; break; }
  }
  return { ok: failed === 0, mean: meanOf(st), worstZ, failed, blocks };
}
