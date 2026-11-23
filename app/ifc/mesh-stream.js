/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its errors are English (an app translates what it shows). */
/**
 * mesh-stream.js — 0.11 PERF.8: a model's whole geometry pass in a module Worker (mesh-worker.js), so the page keeps answering and can draw the
 * model as it arrives. The page keeps its own IfcFile (properties, editing, the tree); the worker gets a copy of the bytes for the length of the
 * pass and drops it after.
 *
 *   import { meshesInWorker, meshWorkerUsable, warmMeshWorker } from './ifc/mesh-stream.js';
 *   warmMeshWorker()   start it early (while the file is read and scanned)
 *   const r = await meshesInWorker(file, { settings, booleans, passes: [null, ['IFCSPACE']], onPieces(pieces) {…} });
 *   r === null  → no worker here (no Worker, a failed start, or the worker cannot do booleans the page can): run the page's own pass
 *   r = { C, elements }   C = the coordination matrix the worker used (give it to the page's model: IfcAPI.SetCoordinationMatrix)
 *   a pass that fails in the worker rejects: the caller drops what it got and runs the page's pass
 *
 * Pieces: { pass, id (expressID), index, total, color [r,g,b,a], pos, nrm (Float32Array x y z, placed in the world: metres, Y up, the
 * coordination matrix applied), idx (Uint32Array) }, in the order StreamAllMeshesAsync gives them. `window.ccIfcGeoWorker = false` (or
 * opts.worker false) keeps the pass on the page.
 */

let worker = null;   // Promise<{ w, booleans } | null>
let seq = 0;
const jobs = new Map();

export function meshWorkerUsable() { return typeof Worker !== 'undefined' && !(typeof window !== 'undefined' && window.ccIfcGeoWorker === false); }

export async function meshesInWorker(file, { settings = {}, booleans = false, passes = [null], sliceMs = 8, onPieces = () => {}, worker: want = true } = {}) {
  if (!want || !meshWorkerUsable()) return null;
  const st = await start();
  if (!st || (booleans && !st.booleans)) return null;   // the page would cut openings the worker cannot: the same model only from the page
  const id = ++seq;
  const ix = file.ix;
  // the index as it is (typed arrays copied by the structured clone); the bytes as a copy we hand over
  const msg = { cmd: 'stream', id, bytes: null, ix: { ...ix }, settings, passes, sliceMs };
  const copy = file.bytes.slice();
  msg.bytes = copy.buffer;
  return new Promise((resolve, reject) => {
    jobs.set(id, { resolve, reject, onPieces, C: null });
    st.w.postMessage(msg, [copy.buffer]);
  });
}

/** Start the worker now (its modules and manifold-3d load while the file is still being scanned); later calls reuse it. */
export function warmMeshWorker() { if (meshWorkerUsable()) start(); }

/** Stop a pass that is still running (its pieces stop coming; the promise resolves with { cancelled: true }). */
export function cancelMeshes() { worker?.then((st) => { if (st) for (const id of jobs.keys()) st.w.postMessage({ cmd: 'cancel', id }); }); }

function start() {
  if (worker) return worker;
  worker = (async () => {
    let manifoldUrl = null;
    try { manifoldUrl = typeof import.meta.resolve === 'function' ? import.meta.resolve('manifold-3d') : null; } catch (e) { manifoldUrl = null; }
    try {
      const w = new Worker(new URL('./mesh-worker.js', import.meta.url), { type: 'module' });
      const booleans = await new Promise((ok, fail) => {
        const t = setTimeout(() => fail(new Error('the IFC geometry worker did not start')), 20000);
        const onMsg = (e) => { if (e.data?.ready) { clearTimeout(t); w.removeEventListener('message', onMsg); ok(!!e.data.booleans); } };
        w.addEventListener('message', onMsg);
        w.addEventListener('error', (e) => { clearTimeout(t); fail(new Error(e.message || 'the IFC geometry worker failed to load')); }, { once: true });
        w.postMessage({ cmd: 'init', manifoldUrl });
      });
      w.addEventListener('message', (e) => {
        const d = e.data || {}, j = jobs.get(d.id);
        if (!j) return;
        if (d.error) { jobs.delete(d.id); const err = new Error(d.error.message); err.name = d.error.name; j.reject(err); return; }
        if (d.C) { j.C = d.C; return; }
        if (d.pieces) { try { j.onPieces(d.pieces); } catch (err) { jobs.delete(d.id); w.postMessage({ cmd: 'cancel', id: d.id }); j.reject(err); } return; }
        if (d.done) { jobs.delete(d.id); j.resolve({ C: j.C, elements: d.elements || 0, cancelled: !!d.cancelled }); }
      });
      w.addEventListener('error', (e) => {
        worker = Promise.resolve(null);
        for (const [id, j] of jobs) { jobs.delete(id); j.reject(new Error(e.message || 'the IFC geometry worker failed')); }
      });
      return { w, booleans };
    } catch (err) {
      if (typeof console !== 'undefined') console.warn('cc-ifc: geometry on the page instead of in a worker:', err?.message || err);
      return null;
    }
  })();
  return worker;
}
