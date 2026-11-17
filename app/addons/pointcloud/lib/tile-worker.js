/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tile-worker.js — the tile pass of the octree build in a worker (0.10 PERF.25). One message per bin:
 *   in   { job, P, b, path, chunks: [Uint8Array], quotas }      P = { G, scale, origin, size, d0, nodeCap, hasRgb, hasInt }
 *   out  { job, out: { nodes, ups } } | { job, error }          node and ancestor bytes are transferred back
 * Runs as a module Worker in a page (type: 'module') and as a worker_threads Worker in Node; the same file, no imports from an app.
 */
import { makeBinBuilder, loadBin } from './tile-bin.js';

let key = '', build = null;
function handle(m) {
  try {
    const k = JSON.stringify(m.P);
    if (k !== key) { key = k; build = makeBinBuilder(m.P); }
    const A = loadBin(m.chunks, m.P.hasRgb, m.P.hasInt);
    const out = build(m.b, A, m.quotas);
    const xfer = [];
    for (const n of out.nodes) xfer.push(n.bytes.buffer);
    for (const u of out.ups) xfer.push(u.bytes.buffer);
    return { msg: { job: m.job, out }, xfer };
  } catch (e) { return { msg: { job: m.job, error: { code: e && e.code || 'tile_failed', message: String(e && e.message || e) } }, xfer: [] }; }
}

if (typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined' && self instanceof WorkerGlobalScope) {
  self.onmessage = (e) => { const r = handle(e.data); self.postMessage(r.msg, r.xfer); };
} else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  const wt = await import('node:worker_threads');
  if (!wt.isMainThread && wt.parentPort) wt.parentPort.on('message', (m) => { const r = handle(m); wt.parentPort.postMessage(r.msg, r.xfer); });
}
