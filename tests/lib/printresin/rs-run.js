/* SPDX-License-Identifier: Apache-2.0 */
/**
 * rs-run.js — slices a plate for resin, on a worker thread when the page can start one and on the page when it cannot (roadmap RSN.8).
 *
 *   runResin(host, tris, job, { plateSolid, signal, onProgress }) → Promise<the sliceResin answer>
 *     host.worker { url, manifoldUrl }   the print stage's worker and manifold file (url sits beside ps-slice.js, which the resin worker borrows)
 *     host.manifold()                    used only for the on-the-page fallback
 *   A worker that cannot start, or says it could not do the job, hands the job to the page, which slices exactly as before and reports what is wrong if something is.
 *   Cancel (signal) ends the worker and rejects with AbortError.
 */
import { sliceResin } from './rs-slice.js';
import { decodeLayer } from './rs-rle.js';

const onPage = async (host, tris, job, o) => sliceResin(await host.manifold(), tris, job, { plateSolid: o.plateSolid, signal: o.signal, onProgress: o.onProgress });

function inWorker(host, tris, job, { signal, onProgress }) {
  const w = host.worker;
  if (!w?.url || !w.manifoldUrl || typeof Worker === 'undefined') return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    let worker, started = false;
    try { worker = new Worker(new URL('./rs-worker.js', import.meta.url), { type: 'module' }); } catch { resolve(null); return; }
    const end = () => { signal?.removeEventListener('abort', onAbort); worker.terminate(); };
    const onAbort = () => { end(); reject(new DOMException('aborted', 'AbortError')); };
    if (signal?.aborted) { onAbort(); return; }
    signal?.addEventListener('abort', onAbort);
    worker.onmessage = (e) => {
      started = true;
      const m = e.data;
      if (m.type === 'progress') onProgress?.(m.p);
      else if (m.type === 'done') {
        end();
        const r = m.result;
        if (r.sliced) { const s = r.sliced; s.layer = (i) => decodeLayer(s.rle[i], s.w, s.h); }
        resolve(r);
      } else { end(); resolve(null); }
    };
    // a crash after it began (out of memory in the worker, say) is the person's answer "failed"; one before it began is only "no worker here"
    worker.onerror = () => { end(); resolve(started ? { ok: false, error: 'failed', sliced: null, stats: null, warnings: [], islands: [] } : null); };
    const f = new Float64Array(tris.length * 9);
    tris.forEach((t, i) => { for (let k = 0; k < 3; k++) { f[i * 9 + k * 3] = t[k][0]; f[i * 9 + k * 3 + 1] = t[k][1]; f[i * 9 + k * 3 + 2] = t[k][2]; } });
    const plateUrl = new URL('./ps-slice.js', w.url).href;
    worker.postMessage({ cmd: 'slice', manifoldUrl: w.manifoldUrl, plateUrl, tris: f, job }, [f.buffer]);
  });
}

export async function runResin(host, tris, job, opts = {}) {
  if (!tris.length) return sliceResin(null, tris, job, opts);   // 'empty', as ever
  return (await inWorker(host, tris, job, opts)) || onPage(host, tris, job, opts);
}
