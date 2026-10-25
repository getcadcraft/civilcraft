/* SPDX-License-Identifier: Apache-2.0 */
/**
 * node-pool.mjs — makeWorker for lib/compute/pool.js on Node (worker_threads through node-worker.mjs). Test and bench only.
 *   nodeMakeWorker(url) → { postMessage, terminate, onmessage, onerror }
 */
import { Worker } from 'node:worker_threads';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SHIM = path.join(path.dirname(fileURLToPath(import.meta.url)), 'node-worker.mjs');

export function nodeMakeWorker(url) {
  const w = new Worker(SHIM, { workerData: { url: String(url) } });
  const o = {
    onmessage: null, onerror: null, exited: false,
    postMessage: (m, transfer) => w.postMessage(m, transfer),
    terminate: () => { o.exited = true; return w.terminate(); },
  };
  w.on('message', (data) => o.onmessage?.({ data }));
  w.on('error', (e) => o.onerror?.({ message: e?.message || String(e) }));
  w.on('exit', (code) => { if (!o.exited && code !== 0) o.onerror?.({ message: 'worker exited with ' + code }); o.exited = true; });
  return o;
}
