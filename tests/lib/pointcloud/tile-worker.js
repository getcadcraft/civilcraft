/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tile-worker.js — the tile pass of the octree build in a worker (0.10 PERF.25), and (0.11) the merge of an upper node's per-bin parts. One message per bin:
 *   in   { job, P, b, path, chunks: [Uint8Array], quotas }      P = { G, scale, origin, size, d0, nodeCap, hasRgb, hasInt }
 *   out  { job, out: { nodes, ups } } | { job, error }          node and ancestor bytes are transferred back
 * Runs as a module Worker in a page (type: 'module') and as a worker_threads Worker in Node; the same file, no imports from an app.
 */
import { makeBinBuilder, loadBin } from './tile-bin.js';
import { decodeNode, encodeNode } from './octree.js';

let key = '', build = null;
/** 0.11 PERF.25: the merge pass, one upper node: join its parts (bin order), encode once. */
function merge(m) {
  const parts = m.parts.map((b) => decodeNode(b));
  let total = 0;
  for (const d of parts) total += d.n;
  const { hasRgb, hasInt } = m;
  const a = { n: total, x: new Int32Array(total), y: new Int32Array(total), z: new Int32Array(total), cls: new Uint8Array(total), flags: new Uint8Array(total), inten: hasInt ? new Uint16Array(total) : null, rgb: hasRgb ? new Uint8Array(3 * total) : null };
  let o = 0, minZ = Infinity, maxZ = -Infinity;
  for (const d of parts) {
    a.x.set(d.x, o); a.y.set(d.y, o); a.z.set(d.z, o); a.cls.set(d.cls, o); a.flags.set(d.flags, o);
    if (hasInt) a.inten.set(d.inten, o); if (hasRgb) a.rgb.set(d.rgb, 3 * o);
    for (let k = 0; k < d.n; k++) { if (d.z[k] < minZ) minZ = d.z[k]; if (d.z[k] > maxZ) maxZ = d.z[k]; }
    o += d.n;
  }
  const bytes = encodeNode(a, hasRgb, hasInt);
  return { msg: { job: m.job, out: { bytes, n: total, minZ: total ? minZ : 0, maxZ: total ? maxZ : 0 } }, xfer: [bytes.buffer] };
}
function handle(m) {
  if (m.kind === 'merge') { try { return merge(m); } catch (e) { return { msg: { job: m.job, error: { code: e && e.code || 'tile_failed', message: String(e && e.message || e) } }, xfer: [] }; } }
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
