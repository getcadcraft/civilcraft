/* SPDX-License-Identifier: Apache-2.0 */
/**
 * runtime.js — the page's one worker pool (0.7 CU.2): sized from the probe (cores − 1, capped by memory), shared memory when the
 * page is cross-origin isolated, started on first use. Every caller in an app (BVH builds, the render, modifiers, baking) asks
 * here instead of making its own pool, so the machine is never oversubscribed.
 *
 *   await pagePool({ sceneBytes }) → pool        (pool.js API; sceneBytes grows the memory reservation, never shrinks it)
 *   jobUrl(rel) → URL                            a job module beside this file (e.g. jobUrl('./bvh/build-job.js'))
 *   closePagePool()                              tests and page teardown
 * The worker script is ./pool-worker.js next to this file. In Node (tests, bench) pass { makeWorker } from
 * tools/compute-test/node-pool.mjs.
 */
import { createPool } from './pool.js';
import { probeCached, workerCount } from './probe.js';

let current = null;   // { pool, facts, sceneBytes }

export function jobUrl(rel) {
  return new URL(rel, import.meta.url).href;
}

export async function pagePool({ sceneBytes = 0, makeWorker, env } = {}) {
  if (!current) {
    const facts = await probeCached(env || globalThis);
    const size = workerCount(facts, { sceneBytes });
    const pool = createPool({ workerUrl: jobUrl('./pool-worker.js'), size, shared: facts.sharedMemory, ...(makeWorker ? { makeWorker } : {}) });
    current = { pool, facts, sceneBytes };
  } else if (sceneBytes > current.sceneBytes) {
    current.sceneBytes = sceneBytes;
    current.pool.resize(workerCount(current.facts, { sceneBytes }));
  }
  return current.pool;
}

export function closePagePool() {
  if (current) current.pool.close();
  current = null;
}
