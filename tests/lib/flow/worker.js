/* SPDX-License-Identifier: Apache-2.0 */
/**
 * worker.js — runs a Material flow simulation off the page's thread (0.8 SU.858 step 4, session flow-08). A module worker (and a
 * Node worker thread, for the tests): it takes {graph, opts}, sends {type:'progress', t, until, events} now and then, and
 * {type:'done', result} or {type:'error', message}. It imports only sim.js, which has no DOM.
 */
import { Sim } from './sim.js';

const isNode = typeof globalThis.WorkerGlobalScope === 'undefined';
let post, listen;
if (isNode) {
  const { parentPort } = await import('node:worker_threads');
  post = (m) => parentPort.postMessage(m);
  listen = (fn) => parentPort.on('message', fn);
} else {
  post = (m) => self.postMessage(m);
  listen = (fn) => { self.onmessage = (e) => fn(e.data); };
}

listen((msg) => {
  try {
    const { graph, opts } = msg;
    const sim = new Sim(graph, { ...opts, onProgress: (p) => post({ type: 'progress', ...p }) });
    post({ type: 'done', result: sim.run() });
  } catch (e) {
    post({ type: 'error', message: String(e && e.message || e) });
  }
});
