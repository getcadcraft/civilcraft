/* SPDX-License-Identifier: Apache-2.0 */
/**
 * bake-worker.js — computes one chunk of bricks (0.8 CE.1). Runs as a Web Worker (type: 'module') in a browser and as a
 * worker_threads Worker in Node. Message in: { spec (packSpec), h, band, keys }. Message out: { arrays: Float32Array[] }.
 */
import { bakeKeys, unpackSpec } from './bake.js';

function run(msg) {
  const arrays = bakeKeys(unpackSpec(msg.spec), msg.h, msg.band, msg.keys);
  return { arrays };
}
if (typeof self !== 'undefined' && typeof self.postMessage === 'function' && typeof process === 'undefined') {
  self.onmessage = (e) => { const r = run(e.data); self.postMessage(r, r.arrays.map((a) => a.buffer)); };
} else if (typeof process !== 'undefined') {
  const { parentPort } = await import('node:worker_threads');
  if (parentPort) parentPort.on('message', (msg) => { const r = run(msg); parentPort.postMessage(r, r.arrays.map((a) => a.buffer)); });
}
