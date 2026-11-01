/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: cc-ifc is a standalone library; its errors are English (an app translates what it shows). */
/**
 * open-async.js — openIfcAsync(bytes) → Promise<IfcFile>: the one pass over the whole file (step.js scanStep, the part
 * that grows with the file — about 2 s for 200 MB) runs in a module Worker, so the page keeps answering while a big
 * model opens. Lines are then parsed on the page as they are read (model.js).
 *
 *   import { openIfcAsync } from './ifc/open-async.js';
 *   const file = await openIfcAsync(bytes);                 // same IfcFile as IfcFile.open(bytes)
 *   openIfcAsync(bytes, { worker: false })                   // on this thread (what happens anyway in Node)
 *   ifcWorkerState() → 'idle' | 'worker' | 'main'
 *
 * The worker is built from step.js fetched through `import.meta.resolve` (so an app's import map and its offline copy
 * apply) as a blob: module. The caller's bytes are copied into the worker and the copy comes back with the index (both
 * transferred, never cloned twice); the caller's own buffer is left alone. No Worker, a blocked blob: URL or a worker
 * that fails → the scan runs here, and later ones too.
 */

import { scanStep } from './step.js';
import { IfcFile } from './model.js';

let worker = null;            // Promise<Worker | null>
let state = 'idle';
let seq = 0;
const pending = new Map();

export function ifcWorkerState() { return state; }

export async function openIfcAsync(bytes, opts = {}) {
  const data = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const w = opts.worker === false ? null : await startWorker();
  if (!w) { state = 'main'; return new IfcFile(data, scanStep(data)); }
  const copy = data.slice();
  return new Promise((resolve, reject) => {
    const id = ++seq;
    pending.set(id, { resolve, reject, data });
    w.postMessage({ id, bytes: copy.buffer }, [copy.buffer]);
  });
}

function startWorker() {
  if (worker) return worker;
  worker = (async () => {
    if (typeof Worker === 'undefined' || typeof Blob === 'undefined' || typeof URL?.createObjectURL !== 'function' || typeof import.meta.resolve !== 'function') return null;
    try {
      const res = await fetch(import.meta.resolve('./step.js'));
      if (!res.ok) throw new Error('could not load step.js (' + res.status + ')');
      const stepUrl = URL.createObjectURL(new Blob([await res.text()], { type: 'text/javascript' }));
      const body = `import { scanStep } from '${stepUrl}';
self.onmessage = (e) => {
  const { id, bytes } = e.data;
  try {
    const ix = scanStep(new Uint8Array(bytes));
    const arrays = [ix.ids, ix.starts, ix.ends, ix.types].map((a) => a.slice());
    const [ids, starts, ends, types] = arrays;
    self.postMessage({ id, bytes, ix: { ...ix, ids, starts, ends, types } }, [bytes, ...arrays.map((a) => a.buffer)]);
  } catch (err) { self.postMessage({ id, bytes, error: { name: err && err.name || 'Error', message: String(err && err.message || err) } }, [bytes]); }
};
self.postMessage({ ready: true });`;
      const w = new Worker(URL.createObjectURL(new Blob([body], { type: 'text/javascript' })), { type: 'module' });
      await new Promise((ok, fail) => {
        const t = setTimeout(() => fail(new Error('the IFC worker did not start')), 15000);
        w.addEventListener('message', function ready(e) { if (e.data?.ready) { clearTimeout(t); w.removeEventListener('message', ready); ok(); } });
        w.addEventListener('error', (e) => { clearTimeout(t); fail(new Error(e.message || 'the IFC worker failed to load')); }, { once: true });
      });
      w.addEventListener('message', (e) => {
        const p = pending.get(e.data?.id);
        if (!p) return;
        pending.delete(e.data.id);
        if (e.data.error) { const err = new Error(e.data.error.message); err.name = e.data.error.name; p.reject(err); return; }
        state = 'worker';
        p.resolve(new IfcFile(new Uint8Array(e.data.bytes), e.data.ix));
      });
      w.addEventListener('error', () => {
        worker = Promise.resolve(null);
        for (const [id, p] of pending) { pending.delete(id); try { state = 'main'; p.resolve(new IfcFile(p.data, scanStep(p.data))); } catch (err) { p.reject(err); } }
      });
      return w;
    } catch (err) {
      if (typeof console !== 'undefined') console.warn('cc-ifc: reading on the page instead of in a worker:', err?.message || err);
      return null;
    }
  })();
  return worker;
}
