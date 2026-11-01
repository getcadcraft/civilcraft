/* SPDX-License-Identifier: Apache-2.0 */
/**
 * parallel.js — bake over several workers (0.8 CE.1). `makeWorker()` returns a Worker running bake-worker.js (the caller knows
 * how to start one in its environment: `new Worker(new URL('./bake-worker.js', import.meta.url), { type: 'module' })` in a
 * page, `new (require('node:worker_threads').Worker)(path)` in Node). The result is bit-identical to bake() whatever `n` is,
 * because every brick is a pure function of the spec and its key and the chunks are rejoined in key order.
 */
import { plan, assemble, chunks, packSpec } from './bake.js';

export async function bakeParallel(spec, opts, makeWorker, n = 4) {
  const p = plan(spec, opts), parts = chunks(p.keys, n), packed = packSpec(spec);
  const results = await Promise.all(parts.map((keys) => new Promise((resolve, reject) => {
    const w = makeWorker();
    const done = (fn) => (v) => { try { w.terminate && w.terminate(); } catch (e) { /* gone already */ } fn(v); };
    const onmsg = done((m) => resolve((m && m.data ? m.data : m).arrays));
    const onerr = done(reject);
    if (w.on) { w.on('message', onmsg); w.on('error', onerr); } else { w.onmessage = onmsg; w.onerror = onerr; }
    w.postMessage({ spec: packed, h: p.h, band: p.band, keys });
  })));
  return assemble(p, results.flat());
}
