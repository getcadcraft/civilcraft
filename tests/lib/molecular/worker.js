/* SPDX-License-Identifier: Apache-2.0 */
/**
 * worker.js — runs a molecular dynamics job off the page thread (browser Worker or Node worker thread). One message in, one out:
 *   { id, op: 'run', def: { system: createSystem options, steps, dt, thermostat?, barostat?, sample?: n }}  →  { id, ok, result: { energies, pe, samples[], rdf?, x } }
 * Deterministic: the same definition (and seed) gives the same bytes.
 */
import { createSystem, run, energies, wrap } from './md.js';
export function solveJob(def) {
  const s = createSystem(def.system), samples = [];
  run(s, def.steps, def.dt, { thermostat: def.thermostat || null, barostat: def.barostat || null, every: def.sample || 0, onSample: (sy) => samples.push({ step: sy.step, ...energies(sy) }) });
  wrap(s); return { energies: energies(s), pe: s.pe, samples, x: Array.from(s.x), box: s.box.slice() };
}
const post = (typeof self !== 'undefined' && typeof self.postMessage === 'function' && typeof window === 'undefined') ? (m) => self.postMessage(m) : null;
if (post) self.onmessage = (e) => { const { id, op, def } = e.data || {}; try { if (op !== 'run') throw new Error('unknown op'); post({ id, ok: true, result: solveJob(def) }); } catch (err) { post({ id, ok: false, error: String(err.message || err) }); } };
