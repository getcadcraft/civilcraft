/* SPDX-License-Identifier: Apache-2.0 */
/**
 * ps-engines.js — the slicer is swappable (roadmap PS.12): one job in, G-code out, whichever engine the person picked. No DOM.
 * CadCraft basic is here, so printing works with nothing else added. Every other slicer is an add-on of its own (slicer-kiri, slicer-prusaslicer, slicer-orcaslicer)
 * that adds itself to window.ccPrintSlicers and fires `cc-print-slicers`, whichever of them loads first.
 *
 *   a slicer: { id, name, license, where: 'page' | 'studio', url, label, slice?(tris, job, ctx) → Promise<[lines]> }
 *     where 'page' runs slice() here (ctx: { stl, startLines, endLines, onProgress, signal }); 'studio' is the person's own program, run by Studio's engines.rs.
 *   BASIC · slicers(reg = window.ccPrintSlicers) → [the add-ons' slicers in the order they came, then BASIC]
 *   availability(id, host) → Promise<{ ok, why?: 'needs_studio' | 'not_found' | 'too_old' | 'unsupported' }>
 *   runEngine(id, host, tris, job, { onProgress, signal }) → Promise<{ ok, lines, stats, warnings, error? }>  the shape ps-slice.js answers
 *     host: { manifold(), studio: window.cadcraftStudio.engines | null, slicers?: () => [slicer] }
 *   stlBinary(tris) → Uint8Array
 *   readGcode(lines, job) → { layers, seconds, filament, grams, min: [x, y, z], max: [x, y, z], heats }
 *   checkGcode(lines, job) → null | 'nomoves' | 'bed'      every engine's output passes here before anyone can send it
 *     host.worker (optional): { url, manifoldUrl } puts CadCraft basic on a module worker (ps-worker.js); a worker that cannot start falls back to the page
 *   studioRun(id, host, tris, job, extra, opts) → { bytes } | { detail }   a run of the person's own program through Studio
 *   studioSettings(job) → the typed fields Studio's engines.rs turns into a command line (the page never builds one)
 */
import { slice } from './ps-slice.js';
import { startLines, endLines } from './ps-profiles.js';

export const BASIC = { id: 'cadcraft', name: 'CadCraft basic', license: 'Apache-2.0', where: 'page', url: '' };
const good = (d) => d && typeof d === 'object' && /^[a-z][a-z0-9-]{1,40}$/.test(d.id) && d.id !== BASIC.id && typeof d.name === 'string' && (d.where === 'studio' || (d.where === 'page' && typeof d.slice === 'function'));
export function slicers(reg = globalThis.ccPrintSlicers) {
  const seen = new Set(), out = [];
  for (const d of Array.isArray(reg) ? reg : []) if (good(d) && !seen.has(d.id)) { seen.add(d.id); out.push(d); }
  return [...out, BASIC];
}
const defOf = (id, host) => (host.slicers ? host.slicers() : slicers()).find((e) => e.id === id);

export function stlBinary(tris) {
  const buf = new ArrayBuffer(84 + tris.length * 50), v = new DataView(buf);
  v.setUint32(80, tris.length, true);
  let o = 84;
  for (const t of tris) {
    o += 12;   // a zero normal: readers work it out from the corners
    for (const p of t) { v.setFloat32(o, p[0], true); v.setFloat32(o + 4, p[1], true); v.setFloat32(o + 8, p[2], true); o += 12; }
    o += 2;
  }
  return new Uint8Array(buf);
}

/** Reads what any of the engines wrote: absolute or relative E, comments ignored. Extruding moves give the part's box; every move gives the machine's. */
export function readGcode(lines, job) {
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  const moved = { min: [Infinity, Infinity, Infinity], max: [-Infinity, -Infinity, -Infinity] };
  let x = 0, y = 0, z = 0, e = 0, f = 3000, relE = false, absXY = true, seconds = 0, filament = 0, moves = 0;
  const zs = new Set();
  let heats = false;
  for (const raw of lines) {
    const l = String(raw).split(';')[0].trim().toUpperCase();
    if (!l) continue;
    if (l === 'M83') relE = true; else if (l === 'M82') relE = false;
    else if (l === 'G90') absXY = true; else if (l === 'G91') absXY = false;
    else if (/^(M104|M109|M140|M190)\b/.test(l)) heats = true;
    else if (/^G92\b/.test(l)) { const m = /E(-?[\d.]+)/.exec(l); if (m) e = Number(m[1]); }
    if (!/^G[01]\b/.test(l)) continue;
    const g = (k) => { const m = new RegExp(k + '(-?[\\d.]+)').exec(l); return m ? Number(m[1]) : null; };
    const X = g('X'), Y = g('Y'), Z = g('Z'), E = g('E'), F = g('F');
    if (F) f = F;
    if (!absXY) continue;   // the end G-code's small relative lift: not a position on the bed
    const nx = X ?? x, ny = Y ?? y, nz = Z ?? z, d = Math.hypot(nx - x, ny - y, nz - z);
    if (X != null || Y != null || Z != null) { moves++; for (const [k, v] of [[0, nx], [1, ny], [2, nz]]) { moved.min[k] = Math.min(moved.min[k], v); moved.max[k] = Math.max(moved.max[k], v); } }
    let de = 0;
    if (E != null) { de = relE ? E : E - e; e = relE ? e + E : E; }
    if (de > 0 && d > 0) { filament += de; zs.add(nz); for (const [k, v] of [[0, nx], [1, ny], [2, nz]]) { min[k] = Math.min(min[k], v); max[k] = Math.max(max[k], v); } }
    seconds += d / (f / 60);
    x = nx; y = ny; z = nz;
  }
  const area = Math.PI * (job.filament / 2) ** 2;
  return { layers: zs.size, seconds: Math.round(seconds), filament: Math.round(filament), grams: Math.round(filament * area / 1000 * job.density * 10) / 10, min, max, moved, moves, heats };
}

export function checkGcode(lines, job) {
  const r = readGcode(lines, job);
  if (!r.moves || !r.filament) return 'nomoves';
  const E = 0.5;   // a rounded coordinate at the very edge
  for (let k = 0; k < 2; k++) if (r.moved.min[k] < -E - 10 || r.moved.max[k] > job.bed[k] + 10 + E || r.min[k] < -E || r.max[k] > job.bed[k] + E) return 'bed';
  if (r.max[2] > job.bed[2] + E) return 'bed';
  return null;
}

const finish = (lines, job, warnings = []) => {
  const bad = checkGcode(lines, job);
  if (bad) return { ok: false, error: bad === 'bed' ? 'bed' : 'failed', lines: [], stats: null, warnings };
  const r = readGcode(lines, job);
  return { ok: true, lines, warnings, stats: { layers: r.layers, seconds: r.seconds, filament: r.filament, grams: r.grams, size: [0, 1, 2].map((k) => r.max[k] - r.min[k]) } };
};

export function studioSettings(job) {
  return { bed: job.bed, nozzle: job.nozzle, filament: job.filament, nozzle_temp: job.nozzle_temp, bed_temp: job.bed_temp, fan: job.fan, retract: job.retract, layer: job.layer, walls: job.walls, top: job.top, bottom: job.bottom, infill: job.infill, speed: job.speed, supports: job.supports, skirt: job.skirt, material: job.material, start: startLines(job).join('\n'), end: endLines(job).join('\n') };
}

export async function availability(id, host) {
  const e = defOf(id, host);
  if (!e) return { ok: false, why: 'unsupported' };
  if (e.where === 'page') return { ok: true };
  if (!host.studio) return { ok: false, why: 'needs_studio' };
  try { const f = await host.studio.find(id); return f.found ? { ok: true, version: f.version, path: f.path } : { ok: false, why: f.why === 'too_old' ? 'too_old' : 'not_found' }; }
  catch { return { ok: false, why: 'not_found' }; }
}

/** Runs a Studio engine to its end. → { bytes } | { detail } */
export async function studioRun(id, host, tris, job, extra = {}, { onProgress, signal } = {}) {
  const engines = host.studio;
  const run = await engines.start(id, stlBinary(tris), { ...studioSettings(job), ...extra });
  for (;;) {
    if (signal?.aborted) { await engines.cancel(run).catch(() => {}); throw new DOMException('aborted', 'AbortError'); }
    const s = await engines.status(run);
    if (s.state === 'done') return { bytes: await engines.result(run) };
    if (s.state === 'failed' || s.state === 'cancelled') return { detail: [s.error, (s.log || []).slice(-2).join(' ')].filter(Boolean).join(': ').slice(0, 240) };
    onProgress?.({ stage: 'external', layer: Math.round((s.progress || 0) * 100), layers: 100 });
    await new Promise((r) => setTimeout(r, 400));
  }
}

async function sliceInStudio(id, host, tris, job, opts) {
  const r = await studioRun(id, host, tris, job, {}, opts);
  if (!r.bytes) return { ok: false, error: 'failed', detail: r.detail, lines: [], stats: null, warnings: [] };
  return finish(new TextDecoder().decode(r.bytes).split(/\r?\n/), job);
}

/** CadCraft basic on a worker. → the slice result | null when no worker could start (the caller slices in the page). Cancel ends the worker. */
function sliceInWorker(host, tris, job, { onProgress, signal } = {}) {
  const w = host.worker;
  if (!w?.url || !w.manifoldUrl || typeof Worker === 'undefined') return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    let worker, started = false;
    try { worker = new Worker(w.url, { type: 'module' }); } catch { resolve(null); return; }
    const end = () => { signal?.removeEventListener('abort', onAbort); worker.terminate(); };
    const onAbort = () => { end(); reject(new DOMException('aborted', 'AbortError')); };
    if (signal?.aborted) { onAbort(); return; }
    signal?.addEventListener('abort', onAbort);
    worker.onmessage = (e) => {
      started = true;
      const m = e.data;
      if (m.type === 'progress') onProgress?.(m.p);
      else if (m.type === 'done') { end(); resolve(m.result); }
      else { end(); resolve(null); }   // the worker could not do it (no manifold there, a bad message): the page slices, and says what is wrong if it is wrong
    };
    worker.onerror = () => { end(); if (started) resolve({ ok: false, error: 'failed', lines: [], stats: null, warnings: [] }); else resolve(null); };
    const f = new Float64Array(tris.length * 9);
    tris.forEach((t, i) => { for (let k = 0; k < 3; k++) { f[i * 9 + k * 3] = t[k][0]; f[i * 9 + k * 3 + 1] = t[k][1]; f[i * 9 + k * 3 + 2] = t[k][2]; } });
    worker.postMessage({ cmd: 'slice', manifoldUrl: w.manifoldUrl, tris: f, job }, [f.buffer]);
  });
}

export async function runEngine(id, host, tris, job, opts = {}) {
  if (!tris.length) return { ok: false, error: 'empty', lines: [], stats: null, warnings: [] };
  if (id === BASIC.id) {
    const viaWorker = await sliceInWorker(host, tris, job, opts);
    return viaWorker || slice(await host.manifold(), tris, job, opts);
  }
  const def = defOf(id, host);
  if (!def) return { ok: false, error: 'failed', detail: 'unknown slicer', lines: [], stats: null, warnings: [] };
  // the same refusal as ours, before an outside engine is asked: nothing off the bed
  for (const t of tris) for (const p of t) if (p[0] < 0 || p[1] < 0 || p[0] > job.bed[0] || p[1] > job.bed[1]) return { ok: false, error: 'bed', lines: [], stats: null, warnings: [] };
  if (def.where === 'studio') return sliceInStudio(id, host, tris, job, opts);
  const lines = await def.slice(tris, job, { stl: stlBinary(tris), startLines: startLines(job), endLines: endLines(job), onProgress: opts.onProgress || null, signal: opts.signal || null });
  return finish(lines, job);
}
