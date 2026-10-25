/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bvh-build-job.js — pool job (lib/compute/pool.js): build one BVH subtree in a worker (0.7 CU.4; bvh-parallel.js sends them).
 *   buildSubtree({ boxes: Float64Array (6 per primitive, in the parent's slot order), maxLeaf, bins }) →
 *     { count, bmin, bmax (Float32Array), a, b (Uint32Array), order (Uint32Array: local slot → local primitive) }
 */
import { buildTree } from './bvh-core.js';

export function buildSubtree({ boxes, maxLeaf = 4, bins = 12 }) {
  const t = buildTree(boxes, { maxLeaf, bins });
  return { count: t.count, bmin: t.bmin.slice(), bmax: t.bmax.slice(), a: t.a.slice(), b: t.b.slice(), order: t.order };
}
