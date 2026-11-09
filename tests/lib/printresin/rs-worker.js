/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-worker.js — the resin slicer on a worker thread (roadmap RSN.8), so the page stays alive while a big plate is sliced. No DOM.
 * Loaded as a module worker by rs-run.js (`new Worker(url, { type: 'module' })`); the same file's `handle` runs in Node for the test.
 *
 *   page → worker   { cmd: 'slice', manifoldUrl, plateUrl, tris: Float64Array (9 numbers a triangle, mm), job }
 *                   plateUrl is the print stage's ps-slice.js (the one that makes a solid of the triangles), named by the page: a worker cannot see the page's import map
 *   worker → page   { type: 'progress', p } … then { type: 'done', result } | { type: 'error', message }
 *                   result.sliced carries the layers as `rle` (one Uint8Array a layer, moved not copied); the page puts `layer(i)` back
 *
 * Cancel is the page ending the worker (`terminate()`): nothing in here needs to notice.
 */
import { sliceResin } from './rs-slice.js';

let MF = null, plate = null;
export async function handle(msg, post, load = (u) => import(u)) {
  try {
    if (!msg || msg.cmd !== 'slice') throw new Error('unknown command');
    if (!MF) { const mod = await load(msg.manifoldUrl); MF = await mod.default(); MF.setup(); }
    if (!plate) plate = (await load(msg.plateUrl)).plateSolid;
    const f = msg.tris, tris = [];
    if (!(f instanceof Float64Array) || f.length % 9) throw new Error('bad triangles');
    for (let i = 0; i < f.length; i += 9) tris.push([[f[i], f[i + 1], f[i + 2]], [f[i + 3], f[i + 4], f[i + 5]], [f[i + 6], f[i + 7], f[i + 8]]]);
    const result = await sliceResin(MF, tris, msg.job, { plateSolid: plate, onProgress: (p) => post({ type: 'progress', p }) });
    let move = [];
    if (result.sliced) { const { layer, ...rest } = result.sliced; result.sliced = rest; move = rest.rle.map((r) => r.buffer); }
    post({ type: 'done', result }, move);
  } catch (e) { post({ type: 'error', message: String(e?.message || e).slice(0, 300) }); }
}
if (typeof WorkerGlobalScope !== 'undefined' && globalThis instanceof WorkerGlobalScope) {
  globalThis.onmessage = (e) => handle(e.data, (m, t) => globalThis.postMessage(m, t || []));
}
