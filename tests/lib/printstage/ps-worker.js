/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ps-worker.js — CadCraft basic's slicer on a worker thread (roadmap PS.10), so the page stays alive while a big plate is sliced. No DOM.
 * Loaded as a module worker by ps-engines.js (`new Worker(url, { type: 'module' })`); the same file's `handle` runs in Node for the test.
 *
 *   page → worker   { cmd: 'slice', manifoldUrl, tris: Float64Array (9 numbers a triangle, mm), job }
 *   worker → page   { type: 'progress', p } … then { type: 'done', result } | { type: 'error', message }
 *
 * Cancel is the page ending the worker (`terminate()`): nothing in here needs to notice. manifold-3d is imported by its resolved URL,
 * because an import map of the page does not reach a worker.
 */
import { slice } from './ps-slice.js';
import { cleanJob } from './ps-profiles.js';

let MF = null;
export async function handle(msg, post, load = (u) => import(u)) {
  try {
    if (!msg || msg.cmd !== 'slice') throw new Error('unknown command');
    if (!MF) { const mod = await load(msg.manifoldUrl); MF = await mod.default(); MF.setup(); }
    const f = msg.tris, tris = [];
    if (!(f instanceof Float64Array) || f.length % 9) throw new Error('bad triangles');
    for (let i = 0; i < f.length; i += 9) tris.push([[f[i], f[i + 1], f[i + 2]], [f[i + 3], f[i + 4], f[i + 5]], [f[i + 6], f[i + 7], f[i + 8]]]);
    const result = await slice(MF, tris, cleanJob(msg.job), { onProgress: (p) => post({ type: 'progress', p }) });
    post({ type: 'done', result });
  } catch (e) { post({ type: 'error', message: String(e?.message || e).slice(0, 300) }); }
}
if (typeof WorkerGlobalScope !== 'undefined' && globalThis instanceof WorkerGlobalScope) {
  globalThis.onmessage = (e) => handle(e.data, (m) => globalThis.postMessage(m));
}
