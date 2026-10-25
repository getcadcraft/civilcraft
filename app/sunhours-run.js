/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: developer messages */
/**
 * sunhours-run.js — the page side of sunhours-worker.js (0.7 LC.1 M4).
 *
 *   runSunHours(input, { workers, makeWorker, onProgress, signal }) → Promise<result>
 * The days are dealt out to up to `workers` workers (default: cores − 1, at most 4, at least 1; one day is one job), each runs
 * sunhours.js over its days, and mergeResults puts the means together. Without Worker support (or workers: 0) it runs in the page.
 * `makeWorker` is for tests (worker_threads in Node).
 */
import { sunHours, mergeResults } from './sunhours.js';

export function runSunHours(input, { workers, makeWorker, onProgress = () => {}, signal } = {}) {
  const days = input.days, hw = globalThis.navigator?.hardwareConcurrency || 2;
  const n = Math.max(0, Math.min(workers ?? Math.max(1, hw - 1), 4, days.length));
  const canWorker = !!makeWorker || typeof Worker === 'function';
  if (!n || !canWorker || days.length < 2) return Promise.resolve().then(() => { onProgress(1); return sunHours(input); });
  const chunks = Array.from({ length: n }, () => []);
  days.forEach((d, i) => chunks[i % n].push(d));
  const make = makeWorker || (() => new Worker(new URL('./sunhours-worker.js', import.meta.url), { type: 'module' }));
  let done = 0;
  const ws = [];
  const stop = () => { for (const w of ws) w.terminate?.(); };
  return new Promise((resolve, reject) => {
    const parts = new Array(n);
    if (signal) signal.addEventListener('abort', () => { stop(); reject(Object.assign(new Error('cancelled'), { code: 'cancelled' })); }, { once: true });
    chunks.forEach((chunk, i) => {
      let w;
      try { w = make(); } catch (err) { stop(); reject(err); return; }
      ws.push(w);
      w.onmessage = (e) => {
        if (e.data.error) { stop(); reject(new Error(e.data.error)); return; }
        parts[i] = e.data.result; w.terminate?.();
        onProgress(++done / n);
        if (done === n) resolve(mergeResults(parts));
      };
      w.onerror = (e) => { stop(); reject(new Error(e?.message || 'worker_failed')); };
      w.postMessage({ id: i, input: { ...input, days: chunk } });
    });
  });
}
