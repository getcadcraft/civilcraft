/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: error codes and developer messages carried back to pool.js */
/**
 * pool-worker.js — the worker side of pool.js (0.7 CU.2). Runs one job at a time: imports the job's module once (cached),
 * calls its export with (args, ctx) and posts the result back, moving typed-array buffers rather than copying them.
 *
 *   ctx.progress(fraction, detail?)   at most ~20 messages a second reach the page
 *   ctx.cancelled() → bool            true once the page cancelled this job: stop at the next convenient point and return
 *                                     anything (it is dropped). With shared memory it turns true even inside a loop that
 *                                     never yields (an Atomics flag); without, only between awaits. A job that never looks
 *                                     is stopped after the pool's graceMs (its worker replaced).
 *   ctx.shared[name]                  data the page shared with pool.share() (a SharedArrayBuffer view when isolated)
 *   ctx.scratch(bytes) → ArrayBuffer  a per-worker buffer reused across jobs (grows, never shrinks): hot loops allocate
 *                                     nothing (KICKOFF rule 18). Views over it are only valid until the job returns.
 *   ctx.worker                        this worker's number in its pool (1, 2, …), for per-thread seeds
 *
 * Messages in: {t:'hello', worker} · {t:'run', id, kind, fn, args, flag} · {t:'cancel', id} · {t:'share', name, data} · {t:'unshare', name}
 * Messages out: {t:'progress', id, f, detail} · {t:'done', id, value} · {t:'error', id, code, message}
 * A job module's URL comes from the page's own code (never from a file or a script): the same origin as this worker.
 */
import { transferablesOf } from './pool.js';

const scope = globalThis.self || globalThis;
const modules = new Map();     // kind → Promise<module>
const shared = Object.create(null);
let scratchBuf = null;
let current = null;            // { id, cancelled, flag }
let workerId = 0;
let lastProgress = 0;
const clock = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

function scratch(bytes) {
  const n = Math.max(0, Math.ceil(bytes) || 0);
  if (!scratchBuf || scratchBuf.byteLength < n) scratchBuf = new ArrayBuffer(Math.max(n, scratchBuf ? scratchBuf.byteLength * 2 : 1 << 16));
  return scratchBuf;
}

function sameOrigin(kind) {
  try {
    const base = scope.location?.href;
    if (!base) return true;                       // Node tests: file URLs
    return new URL(kind, base).origin === new URL(base).origin;
  } catch { return false; }
}

async function run(m) {
  const job = { id: m.id, cancelled: false, flag: m.flag instanceof Int32Array ? m.flag : null };
  current = job;
  lastProgress = 0;
  try {
    if (!sameOrigin(m.kind)) throw Object.assign(new Error('job module from another origin'), { code: 'bad_kind' });
    let p = modules.get(m.kind);
    if (!p) { p = import(m.kind); modules.set(m.kind, p); p.catch(() => modules.delete(m.kind)); }
    const mod = await p;
    const fn = mod[m.fn];
    if (typeof fn !== 'function') throw Object.assign(new Error(m.fn + ' is not a function of the job module'), { code: 'bad_kind' });
    const ctx = {
      shared,
      worker: workerId,
      scratch,
      cancelled: () => job.cancelled || (job.flag !== null && Atomics.load(job.flag, 0) === 1),
      progress(f, detail) {
        const t = clock();
        if (t - lastProgress < 50 && f < 1) return;
        lastProgress = t;
        scope.postMessage({ t: 'progress', id: job.id, f: Math.min(1, Math.max(0, +f || 0)), detail: detail ?? null });
      },
    };
    const value = await fn(m.args, ctx);
    const transfer = transferablesOf(value);
    scope.postMessage({ t: 'done', id: job.id, value }, transfer);
  } catch (e) {
    scope.postMessage({ t: 'error', id: job.id, code: e?.code || 'job_failed', message: String(e?.message || e).slice(0, 500) });
  } finally {
    if (current === job) current = null;
  }
}

scope.onmessage = (e) => {
  const m = e.data;
  if (!m || typeof m !== 'object') return;
  if (m.t === 'run') run(m);
  else if (m.t === 'hello') workerId = m.worker | 0;
  else if (m.t === 'cancel') { if (current && current.id === m.id) current.cancelled = true; }
  else if (m.t === 'share' && typeof m.name === 'string') shared[m.name] = m.data;
  else if (m.t === 'unshare' && typeof m.name === 'string') delete shared[m.name];
};
