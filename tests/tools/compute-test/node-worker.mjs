/* SPDX-License-Identifier: Apache-2.0 */
/**
 * node-worker.mjs — lets lib/compute/pool-worker.js (written for a browser module Worker) run on Node's worker_threads, for
 * bin/test-compute.mjs and the bench in Node. Messages that arrive before the worker module has loaded are held, then
 * delivered in order. Test-only; never shipped.
 */
import { parentPort, workerData } from 'node:worker_threads';

globalThis.self = globalThis;
globalThis.postMessage = (m, transfer) => parentPort.postMessage(m, transfer);
const held = [];
let ready = false;
parentPort.on('message', (data) => { if (ready) globalThis.onmessage?.({ data }); else held.push(data); });
await import(workerData.url);
ready = true;
for (const data of held.splice(0)) globalThis.onmessage?.({ data });
