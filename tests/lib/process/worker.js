/* SPDX-License-Identifier: Apache-2.0 */
/**
 * worker.js — runs a flowsheet in a worker (browser Worker or Node worker_threads); DOM-free. Message in { id, op: 'solve' | 'flash' | 'simulate' (dynamics.js) | 'schedule' | 'ferment' (batch.js), def | spec | recipe | par }
 * → out { id, ok, result } with plain JSON. `handle` is exported for tests and for hosts that call in-process.
 */
import { solve } from './flowsheet.js';
import { Thermo } from './thermo.js';
import { simulate } from './dynamics.js';
import { schedule, fermentation } from './batch.js';

export function handle(msg) {
  try {
    if (msg.op === 'solve') return { id: msg.id, ok: true, result: JSON.parse(JSON.stringify(solve(msg.def))) };
    if (msg.op === 'flash') { const th = new Thermo(msg.thermo); return { id: msg.id, ok: true, result: th.flashPT(msg.T, msg.P, msg.z) }; }
    if (msg.op === 'simulate') return { id: msg.id, ok: true, result: JSON.parse(JSON.stringify(simulate(msg.spec, msg.opts || { tEnd: msg.tEnd, dt: msg.dt }))) };
    if (msg.op === 'schedule') return { id: msg.id, ok: true, result: schedule(msg.recipe, msg.opts || {}) };
    if (msg.op === 'ferment') return { id: msg.id, ok: true, result: fermentation(msg.par, msg.opts || {}) };
    return { id: msg.id, ok: false, error: 'unknown op ' + msg.op };
  } catch (e) { return { id: msg.id, ok: false, error: String(e && e.message || e) }; }
}
if (typeof self !== 'undefined' && typeof self.postMessage === 'function' && typeof window === 'undefined') self.onmessage = (e) => self.postMessage(handle(e.data));
else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  import('node:worker_threads').then((w) => { if (!w.isMainThread && w.parentPort) w.parentPort.on('message', (m) => w.parentPort.postMessage(handle(m))); }).catch(() => {});
}
