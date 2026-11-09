/* SPDX-License-Identifier: Apache-2.0 */
/**
 * runner.js — start a simulation in a worker, with progress and cancel (0.8 SU.858 step 4, session flow-08). DOM-free: the
 * Worker class and the worker's address are passed in (the page passes `Worker` and new URL('./lib/worker.js', import.meta.url));
 * where there is no Worker, or it fails to start, the run happens on the calling thread, once, and says so (`inWorker: false`).
 *
 *   const job = runSim(graph, opts, { Worker, url, onProgress({t, until, events}) })
 *   job.promise → { result, inWorker, ms }          rejects with {cancelled: true} after job.cancel()
 *   job.cancel()
 */
import { Sim } from './sim.js';

export function runSim(graph, opts = {}, { Worker: W = globalThis.Worker, url, onProgress, clock = () => Date.now() } = {}) {
  const t0 = clock();
  let worker = null, settled = false, rejectFn = null;
  const local = (progress) => {
    const sim = new Sim(graph, { ...opts, onProgress: progress });
    return { result: sim.run(), inWorker: false, ms: clock() - t0 };
  };
  const promise = new Promise((resolve, reject) => {
    rejectFn = reject;
    if (!W || !url) { try { resolve(local(onProgress)); } catch (e) { reject(e); } return; }
    const fallback = () => {
      if (settled) return;
      settled = true; try { worker && worker.terminate(); } catch { /* gone */ }
      try { resolve(local(onProgress)); } catch (e) { reject(e); }
    };
    try { worker = new W(url, { type: 'module' }); } catch { fallback(); return; }
    worker.onerror = fallback;
    worker.onmessageerror = fallback;
    worker.onmessage = (e) => {
      const m = e.data;
      if (!m || settled) return;
      if (m.type === 'progress') { if (onProgress) onProgress({ t: m.t, until: m.until, events: m.events }); }
      else if (m.type === 'done') { settled = true; worker.terminate(); resolve({ result: m.result, inWorker: true, ms: clock() - t0 }); }
      else if (m.type === 'error') { settled = true; worker.terminate(); reject(new Error(m.message)); }
    };
    worker.postMessage({ graph, opts: { ...opts, onProgress: undefined } });
  });
  return {
    promise,
    cancel() { if (settled) return; settled = true; try { worker && worker.terminate(); } catch { /* gone */ } rejectFn({ cancelled: true }); },
  };
}
