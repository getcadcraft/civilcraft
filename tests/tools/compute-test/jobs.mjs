/* SPDX-License-Identifier: Apache-2.0 */
/**
 * jobs.mjs — job modules for the pool tests (bin/test-compute.mjs § pool): each export is a job the pool can run. Test-only.
 */
export function sum({ data }) {
  let s = 0;
  for (let i = 0; i < data.length; i++) s += data[i];
  return { s, worker: 0 };
}
export function who(_, ctx) { return { worker: ctx.worker }; }
export function square({ n }) {
  const out = new Float64Array(n);
  for (let i = 0; i < n; i++) out[i] = i * i;
  return { out };
}
export async function slow({ steps = 50, ms = 10 }, ctx) {
  for (let i = 0; i < steps; i++) {
    if (ctx.cancelled()) return { stopped: i };
    ctx.progress(i / steps, { step: i });
    await new Promise((r) => setTimeout(r, ms));
  }
  ctx.progress(1);
  return { stopped: -1 };
}
/** A loop that never yields but looks at ctx.cancelled(): stops only through the shared-memory flag. */
export function busyLooks({ ms = 5000 }, ctx) {
  const t0 = Date.now();
  let n = 0;
  while (Date.now() - t0 < ms) { n++; if ((n & 1023) === 0 && ctx.cancelled()) return { stopped: true, ms: Date.now() - t0 }; }
  return { stopped: false, ms: Date.now() - t0 };
}
/** Never looks: only the pool's graceMs stops it (its worker is replaced). */
export function spin({ ms = 5000 }) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { /* spin */ }
  return { done: true };
}
export function boom({ msg = 'boom' }) { throw new Error(msg); }
export function crash() { process.exit(3); }
export function readShared({ name = 'scene' }, ctx) {
  const d = ctx.shared[name];
  if (!d) return { missing: true };
  let s = 0;
  for (let i = 0; i < d.length; i++) s += d[i];
  return { s, isShared: typeof SharedArrayBuffer === 'function' && d.buffer instanceof SharedArrayBuffer };
}
let scratchSeen = null;
export function scratchTwice({ bytes = 1024 }, ctx) {
  const b = ctx.scratch(bytes);
  const same = scratchSeen === b;
  scratchSeen = b;
  return { same, len: b.byteLength };
}
/** Pixel rows for the scheduler tests: deterministic values from the row index only. */
export function rows({ start, count, width }) {
  const out = new Float32Array(count * width);
  for (let r = 0; r < count; r++) for (let x = 0; x < width; x++) out[r * width + x] = Math.sin((start + r) * 0.37 + x * 0.11);
  return { start, out };
}
