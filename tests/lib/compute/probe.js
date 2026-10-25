/* SPDX-License-Identifier: Apache-2.0 */
/**
 * probe.js — what this machine can compute with (0.7 CU.1): the WebGPU adapter and its limits, WebGL 2, CPU cores, cross-origin
 * isolation (shared memory), device memory, WebAssembly SIMD and threads — and from those a **tier** that sets the defaults
 * (texture sizes, samples, real-time effects, instance budgets) so a GPU-less 8 GB laptop stays usable.
 * Canonical in lib/compute/ (tools/compute/sync.mjs copies it byte for byte into modelcraft/dev/compute/ and
 * bimcraft/dev/compute/). No DOM except what `env` hands in; every browser object comes through `env`, so Node tests run it
 * with stand-in adapters.
 *
 *   await probe(env?, { gpu: true, webgl: true }) → facts     (env defaults to globalThis; never throws)
 *   facts = { version, gpu: null | { vendor, architecture, device, description, fallback, limits{…}, features{…} },
 *             webgl2: null | { renderer, software }, cores, isolated, memoryGB (null = not reported),
 *             wasm: { simd, threads }, sharedMemory, notes[] }
 *   tierOf(facts, override?) → { tier, reasons[], override }   tier: 'gpu-high' | 'gpu-low' | 'cpu'
 *   TIER_DEFAULTS[tier]                                        the defaults a tier sets (read-only)
 *   tierFromQuery(search) → tier | null                        '?tier=cpu' (tests, and to see what a slower machine gets)
 *   workerCount(facts, { sceneBytes, perWorkerBytes, reserve }) → n   CPU workers to start; capped by cores AND memory
 *   machineRows(facts, tierInfo) → [{ key, value?, fills? }]   what the "Your machine" card says (keys compute.card.*)
 *   probeCached(env?, opts?)                                   one probe per page (the adapter request is not free)
 *
 * Tier rules (written here once; docs/RENDER-BENCH.md quotes them):
 *   gpu-high  a WebGPU adapter that is not a software fallback, storage buffers ≥ 1 GiB per binding, ≥ 256 invocations per
 *             workgroup, not a known integrated or phone GPU, and memory ≥ 8 GB when the browser reports it
 *   gpu-low   any other hardware WebGPU adapter, or hardware WebGL 2 without WebGPU
 *   cpu       no hardware GPU reachable (none, or software only: SwiftShader, llvmpipe, Microsoft Basic Render)
 *   A device reporting ≤ 4 GB never gets gpu-high (the 8 GB laptop principle: RAM, not the GPU, is what runs out first).
 * WebGPU being present is a separate fact from the tier: the path tracer needs it, the real-time view does not.
 */

export const VERSION = 1;
export const TIERS = ['gpu-high', 'gpu-low', 'cpu'];

/** The defaults each tier sets. Sessions read these; they never invent their own per-tier numbers. */
export const TIER_DEFAULTS = Object.freeze({
  'gpu-high': Object.freeze({ textureMax: 4096, samples: 1024, previewSamples: 64, realtime: 'high', shadowMap: 4096, instances: 1000000, maxPixels: 3840 * 2160 }),
  'gpu-low': Object.freeze({ textureMax: 2048, samples: 256, previewSamples: 16, realtime: 'medium', shadowMap: 2048, instances: 100000, maxPixels: 1920 * 1080 }),
  cpu: Object.freeze({ textureMax: 1024, samples: 64, previewSamples: 4, realtime: 'low', shadowMap: 1024, instances: 20000, maxPixels: 1280 * 720 }),
});

const GiB = 1024 ** 3;
const SOFTWARE_RE = /swiftshader|llvmpipe|softpipe|lavapipe|software|basic render|microsoft basic|mesa offscreen/i;
// integrated and phone GPUs: never gpu-high (Intel Arc discrete reports an "xe-hpg" architecture and is left alone)
const LOW_RE = /\b(adreno|mali|powervr|videocore|tegra|img |uhd graphics|hd graphics|iris|radeon\(tm\) graphics|vega \d+ graphics|gen-?\d+|xe-lp|xe-lpg|intel\(r\) graphics)\b/i;

// WebAssembly feature checks: two tiny modules validated (never run). SIMD: (func (result v128) i32.const 0 i8x16.splat
// i8x16.popcnt). Threads: a shared memory + atomic.notify. The bytes follow the WebAssembly core spec's binary format.
const WASM_SIMD = [0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11];
const WASM_THREADS = [0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11];

const LIMIT_KEYS = ['maxStorageBufferBindingSize', 'maxBufferSize', 'maxStorageBuffersPerShaderStage', 'maxComputeWorkgroupSizeX',
  'maxComputeInvocationsPerWorkgroup', 'maxComputeWorkgroupStorageSize', 'maxComputeWorkgroupsPerDimension', 'maxTextureDimension2D'];

const str = (v, max = 120) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '');
const num = (v) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null);

function wasmValid(W, bytes) {
  try { return !!(W && typeof W.validate === 'function' && W.validate(new Uint8Array(bytes))); } catch { return false; }
}

async function probeGpu(gpu, notes) {
  if (!gpu || typeof gpu.requestAdapter !== 'function') return null;
  let adapter = null;
  try { adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' }); } catch (e) { notes.push('gpu: ' + str(String(e?.message || e), 80)); }
  if (!adapter) return null;
  let info = adapter.info || null;
  if (!info && typeof adapter.requestAdapterInfo === 'function') { try { info = await adapter.requestAdapterInfo(); } catch { info = null; } }
  info = info || {};
  const limits = {};
  for (const k of LIMIT_KEYS) limits[k] = num(adapter.limits?.[k]);
  const has = (f) => { try { return !!adapter.features?.has?.(f); } catch { return false; } };
  return {
    vendor: str(info.vendor), architecture: str(info.architecture), device: str(info.device), description: str(info.description),
    fallback: !!(adapter.isFallbackAdapter || info.isFallbackAdapter),
    limits,
    features: { subgroups: has('subgroups'), shaderF16: has('shader-f16'), timestampQuery: has('timestamp-query'), float32Filterable: has('float32-filterable') },
  };
}

function probeWebgl(make, notes) {
  if (typeof make !== 'function') return null;
  let gl = null;
  try { gl = make(); } catch (e) { notes.push('webgl: ' + str(String(e?.message || e), 80)); }
  if (!gl || typeof gl.getParameter !== 'function') return null;
  let renderer = '';
  try {
    const ext = gl.getExtension?.('WEBGL_debug_renderer_info');
    renderer = str(ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER));
  } catch { renderer = ''; }
  try { gl.getExtension?.('WEBGL_lose_context')?.loseContext(); } catch { /* the context goes with the canvas anyway */ }
  return { renderer, software: SOFTWARE_RE.test(renderer) };
}

function defaultWebgl(env) {
  return () => {
    if (typeof env.OffscreenCanvas === 'function') return new env.OffscreenCanvas(1, 1).getContext('webgl2');
    const c = env.document?.createElement?.('canvas');
    return c ? c.getContext('webgl2') : null;
  };
}

/** Everything the probe can find out. Never throws: what it could not read is null, and why goes in notes. */
export async function probe(env = globalThis, opts = {}) {
  const notes = [];
  const nav = env.navigator || {};
  const gpu = opts.gpu === false ? null : await probeGpu(nav.gpu, notes);
  const webgl2 = opts.webgl === false ? null : probeWebgl(env.makeWebGL2 || defaultWebgl(env), notes);
  const cores = Math.max(1, Math.min(256, Math.floor(num(nav.hardwareConcurrency) || 1)));
  const memoryGB = num(nav.deviceMemory);
  const isolated = env.crossOriginIsolated === true;
  const sharedMemory = isolated && typeof env.SharedArrayBuffer === 'function';
  const W = env.WebAssembly;
  const wasm = { simd: wasmValid(W, WASM_SIMD), threads: sharedMemory && wasmValid(W, WASM_THREADS) };
  return { version: VERSION, gpu, webgl2, cores, isolated, sharedMemory, memoryGB, wasm, notes };
}

let cached = null;
/** One probe per page; later callers get the same promise. */
export function probeCached(env = globalThis, opts = {}) {
  if (!cached) cached = probe(env, opts);
  return cached;
}

/** '?tier=gpu-low' etc. — tests and "what does a slower machine get"; anything else → null. */
export function tierFromQuery(search) {
  const m = /[?&]tier=([a-z-]+)/.exec(String(search || ''));
  return m && TIERS.includes(m[1]) ? m[1] : null;
}

function gpuText(g) {
  return [g.vendor, g.architecture, g.device, g.description].filter(Boolean).join(' ');
}

/** The tier and the plain reasons for it (each a compute.why.* key). */
export function tierOf(facts, override = null) {
  const reasons = [];
  const g = facts?.gpu;
  const lowMem = facts?.memoryGB != null && facts.memoryGB <= 4;
  let tier = 'cpu';
  if (g && !g.fallback && !SOFTWARE_RE.test(gpuText(g))) {
    const bigBuffers = (g.limits?.maxStorageBufferBindingSize || 0) >= GiB;
    const wide = (g.limits?.maxComputeInvocationsPerWorkgroup || 0) >= 256;
    const integrated = LOW_RE.test(gpuText(g));
    if (bigBuffers && wide && !integrated && !lowMem) { tier = 'gpu-high'; reasons.push('compute.why.webgpu-high'); }
    else {
      tier = 'gpu-low';
      if (integrated) reasons.push('compute.why.integrated');
      else if (!bigBuffers || !wide) reasons.push('compute.why.small-limits');
      if (lowMem) reasons.push('compute.why.low-memory');
      if (!reasons.length) reasons.push('compute.why.webgpu-low');
    }
  } else if (facts?.webgl2 && !facts.webgl2.software) {
    tier = 'gpu-low';
    reasons.push(g ? 'compute.why.webgpu-software' : 'compute.why.webgl-only');
  } else {
    reasons.push(g || facts?.webgl2 ? 'compute.why.software' : 'compute.why.no-gpu');
  }
  if (override && TIERS.includes(override)) return { tier: override, reasons: ['compute.why.override'], override: true, measured: tier };
  return { tier, reasons, override: false, measured: tier };
}

/**
 * CPU workers to start. One core stays with the page (reserve). Shared memory: the scene is in memory once, each worker
 * needs only its own arena. Without it every worker holds its own copy of the scene, so memory caps the count: a quarter
 * of the reported memory (2 GB assumed when the browser does not say), never by habit.
 */
export function workerCount(facts, { sceneBytes = 0, perWorkerBytes = 64 * 1024 * 1024, reserve = 1, max = 64 } = {}) {
  const cores = Math.max(1, facts?.cores || 1);
  let n = Math.max(1, cores - reserve);
  const budget = (facts?.memoryGB ?? 8) * GiB / 4;
  const each = (facts?.sharedMemory ? 0 : Math.max(0, sceneBytes)) + Math.max(1, perWorkerBytes);
  const shared = facts?.sharedMemory ? Math.max(0, sceneBytes) : 0;
  const byMemory = Math.floor(Math.max(0, budget - shared) / each);
  n = Math.min(n, Math.max(1, byMemory), max);
  return n;
}

/** The "Your machine" card's rows, as language keys + fills (the app's t() turns them into words). */
export function machineRows(facts, info = tierOf(facts)) {
  const rows = [];
  const g = facts?.gpu;
  if (g && !g.fallback) rows.push({ key: 'compute.card.gpu', value: g.description || [g.vendor, g.architecture].filter(Boolean).join(' ') || '—', note: 'compute.card.gpu.webgpu' });
  else if (facts?.webgl2) rows.push({ key: 'compute.card.gpu', value: facts.webgl2.renderer || '—', note: facts.webgl2.software ? 'compute.card.gpu.software' : 'compute.card.gpu.webgl' });
  else rows.push({ key: 'compute.card.gpu', valueKey: 'compute.card.gpu.none' });
  rows.push({ key: 'compute.card.cores', valueKey: 'compute.card.cores.n', fills: { n: facts?.cores || 1 } });
  rows.push(facts?.memoryGB != null
    ? { key: 'compute.card.memory', valueKey: 'compute.card.memory.gb', fills: { n: facts.memoryGB } }
    : { key: 'compute.card.memory', valueKey: 'compute.card.memory.unknown' });
  rows.push({ key: 'compute.card.isolation', valueKey: facts?.sharedMemory ? 'compute.card.isolation.on' : 'compute.card.isolation.off' });
  rows.push({ key: 'compute.card.wasm', valueKey: facts?.wasm?.simd ? 'compute.card.wasm.simd' : 'compute.card.wasm.plain' });
  rows.push({ key: 'compute.card.tier', valueKey: 'compute.tier.' + info.tier, note: info.reasons[0] });
  return rows;
}
