/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: error codes and developer messages; callers turn codes into words */
/**
 * pool.js — a pool of module workers that run jobs (0.7 CU.2). Jobs are plain functions exported by a module ("kind"); the
 * worker imports the module once and calls the function with typed-array arguments. Used first by BVH builds and the render;
 * any other caller (subdivision, unwrapping, baking, export) uses it the same way — see docs/apps/compute.md § pool.
 * DOM-free: the Worker constructor is handed in (`makeWorker`), so Node tests run it on worker_threads.
 *
 *   const pool = createPool({ workerUrl, size, shared, makeWorker, graceMs })
 *     workerUrl   URL of pool-worker.js (the app passes import.meta.resolve('./compute/pool-worker.js'))
 *     size        worker count (probe.workerCount(facts, { sceneBytes })); grows/shrinks with pool.resize(n)
 *     shared      true when the page may use SharedArrayBuffer (facts.sharedMemory): shared data goes in once, for all
 *     makeWorker  (url) → Worker-like { postMessage, terminate, onmessage, onerror }   default: new Worker(url, {type: 'module'})
 *     graceMs     how long a cancelled running job may take to notice before its worker is stopped and replaced (250)
 *
 *   pool.run(kind, fn, args, opts) → Promise<result>     kind = module URL, fn = its export
 *     opts.priority   higher runs first (live view 10 beats batch 0); same priority = first come first served
 *     opts.transfer   ArrayBuffers to move rather than copy (the caller loses them)
 *     opts.signal     AbortSignal: a queued job is dropped; a running one is told (ctx.cancelled()) and, past graceMs, stopped
 *     opts.onProgress (fraction 0..1, detail) from ctx.progress()
 *     opts.device     label for throughput (default 'cpu'); opts.units = work units in this job (for the measured speed)
 *   pool.share(name, typedArray) → Promise   data every job may read as ctx.shared[name]: one SharedArrayBuffer copy when
 *                                 `shared`, else one copy per worker (sent once, kept until unshare / replaced)
 *   pool.unshare(name) · pool.resize(n) · pool.stats() → { size, busy, queued, done, failed, cancelled, speed{device: units/s} }
 *   pool.close()                  rejects whatever is left (code 'closed') and stops every worker
 *
 * Errors carry `code`: 'job_failed' (the job threw; message kept), 'worker_died' (the worker crashed; the job is not retried),
 * 'cancelled', 'closed', 'bad_kind'. A crashed or stopped worker is replaced; nothing else is lost.
 * Hot loops allocate nothing (KICKOFF rule 18): jobs get ctx.scratch(bytes), a per-worker ArrayBuffer reused across jobs.
 */

export const PRIORITY = Object.freeze({ live: 10, interactive: 5, batch: 0 });

function poolError(code, message) {
  const e = new Error(message || code);
  e.code = code;
  return e;
}

/** ArrayBuffers held by a value's typed arrays (not shared ones): moved back to the page instead of copied. */
export function transferablesOf(value, out = [], depth = 0) {
  if (!value || depth > 4) return out;
  if (ArrayBuffer.isView(value)) { if (value.buffer instanceof ArrayBuffer && !out.includes(value.buffer)) out.push(value.buffer); return out; }
  if (value instanceof ArrayBuffer) { if (!out.includes(value)) out.push(value); return out; }
  if (Array.isArray(value)) { for (const v of value.slice(0, 256)) transferablesOf(v, out, depth + 1); return out; }
  if (typeof value === 'object') for (const v of Object.values(value).slice(0, 256)) transferablesOf(v, out, depth + 1);
  return out;
}

function defaultMakeWorker(url) {
  if (typeof Worker !== 'function') throw poolError('no_workers', 'Workers are not available here');
  return new Worker(url, { type: 'module' });
}

export function createPool({ workerUrl, size = 1, shared = false, makeWorker = defaultMakeWorker, graceMs = 250 } = {}) {
  const useShared = !!shared && typeof SharedArrayBuffer === 'function';
  const SAB = useShared ? SharedArrayBuffer : null;
  const workers = [];            // { w, busy: job|null, id }
  const queue = [];              // jobs waiting
  const sharedData = new Map();  // name → { data (typed array; shared memory when useShared), version }
  const speed = new Map();       // device → units/s (exponential average)
  let seq = 0, wseq = 0, closed = false;
  const counts = { done: 0, failed: 0, cancelled: 0 };
  let want = Math.max(1, Math.floor(size) || 1);

  function spawn() {
    const rec = { id: ++wseq, busy: null, w: null, seen: new Map() };
    rec.w = makeWorker(workerUrl);
    rec.w.onmessage = (e) => onMessage(rec, e.data);
    rec.w.onerror = (e) => onCrash(rec, e?.message || 'worker error');
    rec.w.postMessage({ t: 'hello', worker: rec.id });
    // the shared data every job may read: sent once per worker (a SharedArrayBuffer is not copied)
    for (const [name, s] of sharedData) sendShared(rec, name, s);
    workers.push(rec);
    return rec;
  }
  function sendShared(rec, name, s) {
    rec.seen.set(name, s.version);
    rec.w.postMessage({ t: 'share', name, data: s.data });
  }
  function retire(rec) {
    const i = workers.indexOf(rec);
    if (i >= 0) workers.splice(i, 1);
    try { rec.w.terminate(); } catch { /* already gone */ }
  }
  function settle(job, err, value) {
    if (job.done) return;
    job.done = true;
    clearTimeout(job.timer);
    if (job.signal && job.onAbort) job.signal.removeEventListener('abort', job.onAbort);
    if (err) { if (err.code === 'cancelled') counts.cancelled++; else counts.failed++; job.reject(err); }
    else { counts.done++; job.resolve(value); }
  }
  function onMessage(rec, m) {
    const job = rec.busy;
    if (!m || !job || m.id !== job.id) return;
    if (m.t === 'progress') { try { job.onProgress?.(m.f, m.detail); } catch { /* a caller's bug stays the caller's */ } return; }
    if (m.t === 'done' || m.t === 'error') {
      rec.busy = null;
      if (m.t === 'done') {
        const secs = Math.max(1e-6, (now() - job.started) / 1000);
        if (job.units > 0) { const s = job.units / secs, old = speed.get(job.device); speed.set(job.device, old == null ? s : old * 0.7 + s * 0.3); }
        settle(job, job.cancelling ? poolError('cancelled') : null, m.value);
      } else settle(job, job.cancelling ? poolError('cancelled') : poolError(m.code === 'bad_kind' ? 'bad_kind' : 'job_failed', m.message));
      if (workers.length > want) retire(rec);
      pump();
    }
  }
  function onCrash(rec, message) {
    const job = rec.busy;
    rec.busy = null;
    retire(rec);
    if (job) settle(job, job.cancelling ? poolError('cancelled') : poolError('worker_died', message));
    if (!closed) { while (workers.length < want) spawn(); pump(); }
  }
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  function pump() {
    if (closed) return;
    while (workers.length < want) spawn();
    for (const rec of workers) {
      if (rec.busy || !queue.length) continue;
      const job = queue.shift();
      rec.busy = job;
      job.worker = rec;
      job.started = now();
      for (const [name, s] of sharedData) if (rec.seen.get(name) !== s.version) sendShared(rec, name, s);
      try {
        // shared memory: a cancel flag the job can see even while it never yields (Atomics); otherwise a message
        if (useShared) job.flag = new Int32Array(new SAB(4));
        rec.w.postMessage({ t: 'run', id: job.id, kind: job.kind, fn: job.fn, args: job.args, flag: job.flag || null }, job.transfer);
      } catch (e) {
        rec.busy = null;
        settle(job, poolError('job_failed', 'could not send the job: ' + (e?.message || e)));
      }
    }
  }

  function insert(job) {
    // higher priority first; equal priority keeps arrival order
    let i = queue.length;
    while (i > 0 && queue[i - 1].priority < job.priority) i--;
    queue.splice(i, 0, job);
  }

  function cancel(job) {
    if (job.done) return;
    const qi = queue.indexOf(job);
    if (qi >= 0) { queue.splice(qi, 1); settle(job, poolError('cancelled')); return; }
    const rec = job.worker;
    if (!rec || rec.busy !== job) return;
    job.cancelling = true;
    if (job.flag) Atomics.store(job.flag, 0, 1);
    try { rec.w.postMessage({ t: 'cancel', id: job.id }); } catch { /* the timer below still stops it */ }
    job.timer = setTimeout(() => {
      if (job.done || rec.busy !== job) return;
      rec.busy = null;
      retire(rec);
      settle(job, poolError('cancelled'));
      if (!closed) pump();
    }, graceMs);
  }

  const pool = {
    get size() { return want; },
    get shared() { return useShared; },

    run(kind, fn, args = {}, opts = {}) {
      if (closed) return Promise.reject(poolError('closed'));
      if (typeof kind !== 'string' || !kind || typeof fn !== 'string' || !/^[A-Za-z_$][\w$]*$/.test(fn)) return Promise.reject(poolError('bad_kind', 'kind must be a module URL and fn an export name'));
      return new Promise((resolve, reject) => {
        const job = {
          id: ++seq, kind, fn, args, resolve, reject, done: false,
          priority: Number.isFinite(opts.priority) ? opts.priority : PRIORITY.batch,
          transfer: Array.isArray(opts.transfer) ? opts.transfer : [],
          onProgress: typeof opts.onProgress === 'function' ? opts.onProgress : null,
          device: opts.device || 'cpu', units: Number.isFinite(opts.units) ? opts.units : 0,
          signal: opts.signal || null,
        };
        if (job.signal) {
          if (job.signal.aborted) { counts.cancelled++; reject(poolError('cancelled')); return; }
          job.onAbort = () => cancel(job);
          job.signal.addEventListener('abort', job.onAbort, { once: true });
        }
        insert(job);
        pump();
      });
    },

    async share(name, data) {
      if (typeof name !== 'string' || !name) throw poolError('bad_share', 'a name is needed');
      if (!ArrayBuffer.isView(data)) throw poolError('bad_share', 'shared data must be a typed array');
      let copy = data;
      if (useShared && !(data.buffer instanceof SAB)) {
        const sab = new SAB(data.byteLength);
        copy = new data.constructor(sab);
        copy.set(data);
      }
      const prev = sharedData.get(name);
      const s = { data: copy, version: (prev?.version || 0) + 1 };
      sharedData.set(name, s);
      // idle workers get it now; busy ones before their next job (pump)
      for (const rec of workers) if (!rec.busy) sendShared(rec, name, s);
      return copy;
    },

    unshare(name) {
      if (!sharedData.delete(name)) return;
      for (const rec of workers) { rec.seen.delete(name); try { rec.w.postMessage({ t: 'unshare', name }); } catch { /* gone */ } }
    },

    resize(n) {
      want = Math.max(1, Math.floor(n) || 1);
      // idle extras go now, busy ones when their job ends
      for (const rec of [...workers]) if (workers.length > want && !rec.busy) retire(rec);
      pump();
    },

    /** Measured speed of a device in work units per second (null until a job with units finished there). */
    speedOf(device = 'cpu') { return speed.get(device) ?? null; },
    recordSpeed(device, unitsPerSecond) { if (Number.isFinite(unitsPerSecond) && unitsPerSecond > 0) { const old = speed.get(device); speed.set(device, old == null ? unitsPerSecond : old * 0.7 + unitsPerSecond * 0.3); } },

    stats() {
      return { size: want, workers: workers.length, busy: workers.filter((r) => r.busy).length, queued: queue.length, ...counts, shared: useShared, speed: Object.fromEntries(speed) };
    },

    close() {
      if (closed) return;
      closed = true;
      for (const job of queue.splice(0)) settle(job, poolError('closed'));
      for (const rec of [...workers]) { if (rec.busy) settle(rec.busy, poolError('closed')); retire(rec); }
    },
  };
  pump();
  return pool;
}
