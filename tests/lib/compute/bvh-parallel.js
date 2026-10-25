/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: a developer error */
/**
 * bvh-parallel.js — the binned-SAH build on every core (0.7 CU.4). The calling thread splits the top of the tree (the same
 * decisions a one-thread build makes) until each remaining node holds at most `n / (4 · workers)` primitives, then the pool
 * builds those subtrees at once (bvh-build-job.js) and they are spliced back in. After canonical() the result is byte for
 * byte the tree a one-thread build gives (tested), so nothing downstream can tell how it was built.
 *
 *   await buildTreeParallel(pool, boxes, { maxLeaf, bins, minTask = 8192, signal, onProgress, priority }) → tree (core.js shape)
 *     pool: lib/compute/pool.js (runtime.js pagePool()) or null → built here, in this thread
 *     Small inputs (< 2 · minTask primitives) are built here: sending them costs more than it saves.
 */
import { buildTree, DEFERRED } from './bvh-core.js';

const JOB = new URL('./bvh-build-job.js', import.meta.url).href;

export async function buildTreeParallel(pool, boxes, { maxLeaf = 4, bins = 12, minTask = 8192, signal = null, onProgress = null, priority = 0 } = {}) {
  const n = Math.floor(boxes.length / 6);
  if (!pool || n < 2 * minTask) return buildTree(boxes, { maxLeaf, bins });
  const deferAbove = Math.max(minTask, Math.ceil(n / (4 * Math.max(1, pool.size))));
  const top = buildTree(boxes, { maxLeaf, bins, deferAbove });
  if (!top.deferred.length) return top;
  let doneUnits = 0;
  const subs = await Promise.all(top.deferred.map((node) => {
    const first = top.a[node], cnt = top.dcount[node];
    const sub = new Float64Array(cnt * 6);
    for (let s = 0; s < cnt; s++) { const p = top.order[first + s] * 6; for (let k = 0; k < 6; k++) sub[s * 6 + k] = boxes[p + k]; }
    return pool.run(JOB, 'buildSubtree', { boxes: sub, maxLeaf, bins }, { transfer: [sub.buffer], units: cnt, priority, signal })
      .then((r) => { doneUnits += cnt; try { onProgress?.(doneUnits / n); } catch { /* advisory */ } return r; });
  }));
  // splice: each subtree's root takes the deferred node's place, the rest go after the top's nodes
  let total = top.count;
  for (const s of subs) total += s.count - 1;
  const bmin = new Float32Array(total * 3), bmax = new Float32Array(total * 3), a = new Uint32Array(total), b = new Uint32Array(total);
  bmin.set(top.bmin); bmax.set(top.bmax); a.set(top.a); b.set(top.b);
  const order = top.order;
  let base = top.count;
  top.deferred.forEach((node, k) => {
    const s = subs[k], first = top.a[node];
    const ids = order.slice(first, first + top.dcount[node]);
    for (let j = 0; j < s.count; j++) {
      const at = j === 0 ? node : base + j - 1;
      bmin.set(s.bmin.subarray(j * 3, j * 3 + 3), at * 3);
      bmax.set(s.bmax.subarray(j * 3, j * 3 + 3), at * 3);
      if (s.b[j] === 0) { a[at] = base + s.a[j] - 1; b[at] = 0; }
      else { a[at] = first + s.a[j]; b[at] = s.b[j]; }
    }
    for (let i = 0; i < s.order.length; i++) order[first + i] = ids[s.order[i]];
    base += s.count - 1;
  });
  if (b.some((x) => x === DEFERRED)) throw new Error('bvh: a deferred node was left unbuilt');
  return { count: total, bmin, bmax, a, b, order, n, deferred: [], dcount: new Uint32Array(total) };
}
