/* SPDX-License-Identifier: Apache-2.0 */
/**
 * tile-pool.js — a small pool of tile workers (0.10 PERF.25). DOM-free.
 *
 *   const pool = await createTilePool(n, spawn?) → { size, run(job) → Promise<{ nodes, ups }>, close() }  | null when no worker can start
 *   spawn() → a Worker-like { postMessage(msg), onmessage = fn(data), onerror = fn(err), terminate() }
 *   Default spawn: a module Worker beside this file in a page, a worker_threads Worker in Node.
 * Jobs go to the first idle worker; run() waits when all are busy. A worker that errors fails the job in flight with the error's code.
 */
import { PcError } from './util.js';

export async function defaultSpawn() {
  const url = new URL('./tile-worker.js', import.meta.url);
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const { Worker: NW } = await import('node:worker_threads');
    return () => {
      const w = new NW(url), o = { postMessage: (m, x) => w.postMessage(m, x), terminate: () => w.terminate(), onmessage: null, onerror: null };
      w.on('message', (d) => o.onmessage && o.onmessage(d)); w.on('error', (e) => o.onerror && o.onerror(e));
      return o;
    };
  }
  if (typeof Worker === 'undefined') return null;
  return () => new Worker(url, { type: 'module' });
}

export async function createTilePool(n, spawn = null) {
  if (!(n >= 1)) return null;
  let make = spawn;
  try { if (!make) make = await defaultSpawn(); } catch { return null; }
  if (!make) return null;
  const workers = [];
  try { for (let i = 0; i < n; i++) workers.push({ w: make(), busy: null }); } catch { for (const x of workers) try { x.w.terminate(); } catch { /* gone */ } return null; }
  const waiting = []; let seq = 0;
  const RESERVED = {};   // a worker handed to a waiter stays taken until its job is posted
  const free = (x) => { const next = waiting.shift(); if (next) { x.busy = RESERVED; next(x); } else x.busy = null; };
  for (const x of workers) {
    x.w.onmessage = (d) => {  const j = x.busy; if (!j) return; const msg = d && d.data !== undefined && d.job === undefined ? d.data : d; if (msg.error) j.reject(new PcError(msg.error.code || 'tile_failed', null, msg.error.message)); else j.resolve(msg.out); free(x); };
    x.w.onerror = (e) => {  const j = x.busy; if (j) j.reject(new PcError('tile_failed', null, String(e && e.message || e))); x.dead = true; x.busy = null; };
  }
  const acquire = () => new Promise((r) => { const x = workers.find((q) => !q.busy && !q.dead); if (x) { x.busy = RESERVED; r(x); } else waiting.push(r); });
  return {
    size: workers.length,
    async run(job) {
      const x = await acquire();
      return new Promise((resolve, reject) => { x.busy = { resolve, reject }; x.w.postMessage({ ...job, job: ++seq }); });
    },
    close() { for (const x of workers) try { x.w.terminate(); } catch { /* gone */ } },
  };
}
