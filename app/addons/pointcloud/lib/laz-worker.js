/* SPDX-License-Identifier: Apache-2.0 */
/**
 * laz-worker.js — decodes whole LAZ chunks in a worker, each worker with its own laz-perf (0.11 PERF.25). One message per chunk:
 *   in   { job, init: { moduleUrl, wasmUrl }, bytes: Uint8Array (one chunk), format, L (record length), count, scale, offset, ext }
 *   out  { job, out: { n, xyz: Float64Array(3n), cls: Uint8Array(n) } } | { job, error }
 * Positions are already scaled and offset exactly as laz-stream.js does for the single thread path (int * scale + offset), so the points
 * handed to the tiler are the same numbers either way. Runs as a module Worker in a page and as a worker_threads Worker in Node.
 */
let M = null, loading = null;
async function start(init) {
  if (M) return M;
  loading ||= (async () => {
    // the vendored laz-perf is Emscripten's web build: it wants a `window` (a browser worker has importScripts; a Node worker has neither)
    if (typeof process !== 'undefined' && process.versions && process.versions.node && typeof window === 'undefined') globalThis.window = globalThis;
    const mod = await import(init.moduleUrl);
    let wasmBinary;
    if (typeof process !== 'undefined' && process.versions && process.versions.node && /^file:/.test(init.wasmUrl)) {
      const [{ readFileSync }, { fileURLToPath }] = await Promise.all([import('node:fs'), import('node:url')]);
      wasmBinary = readFileSync(fileURLToPath(init.wasmUrl));
    } else wasmBinary = new Uint8Array(await (await fetch(init.wasmUrl)).arrayBuffer());
    M = await mod.default({ wasmBinary });
    return M;
  })();
  return loading;
}

async function handle(m) {
  try {
    const Mod = await start(m.init);
    const { format, L, count, ext } = m, [sx, sy, sz] = m.scale, [ox, oy, oz] = m.offset;
    const bytes = m.bytes, inPtr = Mod._malloc(bytes.length), buf = Mod._malloc(L);
    if (!inPtr || !buf) { if (inPtr) Mod._free(inPtr); if (buf) Mod._free(buf); throw Object.assign(new Error('memory'), { code: 'laz_worker_memory' }); }
    const xyz = new Float64Array(3 * count), cls = new Uint8Array(count);
    try {
      Mod.HEAPU8.set(bytes, inPtr);
      const dec = new Mod.ChunkDecoder();
      try {
        dec.open(format, L, inPtr);
        let heap = Mod.HEAPU8.buffer, dv = new DataView(heap, buf, L);
        for (let i = 0; i < count; i++) {
          dec.getPoint(buf);
          if (Mod.HEAPU8.buffer !== heap) { heap = Mod.HEAPU8.buffer; dv = new DataView(heap, buf, L); }
          xyz[3 * i] = dv.getInt32(0, true) * sx + ox; xyz[3 * i + 1] = dv.getInt32(4, true) * sy + oy; xyz[3 * i + 2] = dv.getInt32(8, true) * sz + oz;
          cls[i] = ext ? dv.getUint8(16) : dv.getUint8(15) & 31;
        }
      } finally { dec.delete(); }
    } finally { Mod._free(buf); Mod._free(inPtr); }
    return { msg: { job: m.job, out: { n: count, xyz, cls } }, xfer: [xyz.buffer, cls.buffer] };
  } catch (e) { return { msg: { job: m.job, error: { code: e && e.code || 'laz_worker_failed', message: String(e && e.message || e) } }, xfer: [] }; }
}

if (typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined' && self instanceof WorkerGlobalScope) {
  self.onmessage = async (e) => { const r = await handle(e.data); self.postMessage(r.msg, r.xfer); };
} else if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  const wt = await import('node:worker_threads');
  if (!wt.isMainThread && wt.parentPort) wt.parentPort.on('message', async (m) => { const r = await handle(m); wt.parentPort.postMessage(r.msg, r.xfer); });
}
