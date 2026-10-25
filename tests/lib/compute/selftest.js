/* SPDX-License-Identifier: Apache-2.0 */
/**
 * selftest.js — small job module for checking the pool on a real page and for the bench page's CPU scaling curve (0.7 CU.2 /
 * CU.8). Nothing here touches a model.
 *
 *   echo({ x }, ctx) → { x, worker, shared }          round trip; shared = whether shared memory reached this worker
 *   throughput({ iters }) → { iters, sum }             a fixed floating-point loop (no allocation): the same work on any
 *                                                      device, so units/s compare across cores, workers and machines
 *   waitCancel({ ms }, ctx) → { stopped }              runs until cancelled or ms pass, looking at ctx.cancelled()
 */
export function echo({ x }, ctx) {
  const s = ctx.shared.selftest;
  return { x, worker: ctx.worker, shared: !!s && typeof SharedArrayBuffer === 'function' && s.buffer instanceof SharedArrayBuffer };
}

export function throughput({ iters = 1e6 }) {
  const n = Math.max(1, Math.min(1e9, Math.floor(iters) || 1));
  let a = 1.0000001, b = 0.9999999, sum = 0;
  for (let i = 0; i < n; i++) { a = a * b + 1e-9; b = b * a - 1e-9; sum += a - b; }
  return { iters: n, sum };
}

export function waitCancel({ ms = 2000 }, ctx) {
  const end = Date.now() + Math.min(60000, Math.max(0, ms));
  let n = 0;
  while (Date.now() < end) { if ((++n & 4095) === 0 && ctx.cancelled()) return { stopped: true }; }
  return { stopped: false };
}
