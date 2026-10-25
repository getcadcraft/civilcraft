/* SPDX-License-Identifier: Apache-2.0 */
/* i18n-ignore-file: bench results are data (test ids, units, notes) in English for docs/RENDER-BENCH.md */
/**
 * bench.js — the render bench runner (0.7 CU.8), the same in Node (tools/bench/render/bench.mjs) and on the bench page
 * (/lab/modelcraft?bench=render, bench-page.js). Every speed claim about rendering comes from its results, with the machine
 * named (KICKOFF rule 16; docs/RENDER-BENCH.md). DOM-free.
 *
 *   await runBench({ pool, facts, info, size, signal, onProgress, kernels }) → results
 *     pool      lib/compute/pool.js (runtime.js pagePool())          facts/info: probe.js facts and tierOf()
 *     size      'tiny' (this VPS and tests: 64 × 36 px, fewer workers steps) | 'full' (the owner's machines)
 *     kernels   [{ id, device: 'gpu'|'cpu'|'js', run(expandedScene, { w, h, spp, signal }) → { samples, ms },
 *                 makeDevice?(expandedScene, { w, h }) → Promise<{ renderRange(s0, spp, {signal}) → Float32Array w·h·4 }> }]
 *               renderers to time when they exist (render's WGSL kernel, CU.5's cc-trace-rs, the JS reference): one row per
 *               scene each; with two or more makeDevice kernels also a `kernel.hybrid` row (hybrid.js: all at once)
 *   results = { format: 'cadcraft-render-bench-results', version: 1, when, machine: {…}, size, rows: [{ test, scene, device,
 *               workers, value, unit, note }] }
 *   resultsMarkdown(results) → a table for docs/RENDER-BENCH.md (the machine line first)
 *
 * Tests: cpu.scaling (the pool's fixed float loop, 1 → N workers; efficiency = speed(N) / (N · speed(1)), target ≥ 0.7),
 * bvh.build (one thread here vs the pool, per scene, triangles in meshes), bvh.scene (the two-level build of the placed scene),
 * raycast (camera rays through the scene BVH on 1 and N workers: rays/s, traversal only), kernel.<id> (samples/s).
 */
import { makeScenes } from './bench-make.js';
import { readBenchScene, expandScene } from './bench-scenes.js';
import { buildTree, canonical, triBoxes } from './bvh-core.js';
import { buildTreeParallel } from './bvh-parallel.js';
import { buildScene, sceneBuffers } from './bvh-scene.js';
import { createScheduler } from './sched.js';
import { createHybrid } from './hybrid.js';

export const BENCH_VERSION = 1;
const SELFTEST = new URL('./selftest.js', import.meta.url).href;
const RAYCAST = new URL('./raycast-job.js', import.meta.url).href;
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

function machineOf(facts, info) {
  const g = facts?.gpu;
  return {
    cores: facts?.cores ?? null, memoryGB: facts?.memoryGB ?? null, isolated: !!facts?.isolated, sharedMemory: !!facts?.sharedMemory,
    simd: !!facts?.wasm?.simd, tier: info?.tier ?? null, tierMeasured: info?.measured ?? null,
    gpu: g ? (g.description || [g.vendor, g.architecture].filter(Boolean).join(' ')) + (g.fallback ? ' (software fallback)' : '') : null,
    webgl: facts?.webgl2?.renderer || null,
    ua: typeof navigator !== 'undefined' && navigator.userAgent ? String(navigator.userAgent).slice(0, 200) : (typeof process !== 'undefined' ? 'Node ' + process.version : ''),
  };
}

const steps = (n) => { const s = [1]; while (s[s.length - 1] * 2 < n) s.push(s[s.length - 1] * 2); if (s[s.length - 1] !== n) s.push(n); return s; };

export async function runBench({ pool, facts, info, size = 'tiny', signal = null, onProgress = null, kernels = [], scenes = null } = {}) {
  if (!pool) throw new Error('bench: a pool is needed');
  const tiny = size !== 'full';
  const rows = [];
  const say = (what, f) => { try { onProgress?.(what, f); } catch { /* advisory */ } };
  const check = () => { if (signal?.aborted) { const e = new Error('cancelled'); e.code = 'cancelled'; throw e; } };
  const N = pool.size;

  // 1. CPU scaling: w jobs at once of a fixed float loop (calibrated to ~150 ms on one worker, 40 ms when tiny)
  say('cpu.scaling', 0);
  let iters = 2e6;
  { const t0 = now(); await pool.run(SELFTEST, 'throughput', { iters }); const ms = now() - t0; iters = Math.max(1e5, Math.round(iters * (tiny ? 40 : 150) / Math.max(1, ms))); }
  let one = null;
  for (const w of steps(N)) {
    check();
    const t0 = now();
    await Promise.all(Array.from({ length: w }, () => pool.run(SELFTEST, 'throughput', { iters }, { signal })));
    const ms = now() - t0, speed = (w * iters) / (ms / 1000);
    if (w === 1) one = speed;
    rows.push({ test: 'cpu.scaling', scene: null, device: 'cpu', workers: w, value: Math.round(speed), unit: 'iterations/s', note: 'efficiency ' + (speed / (w * one)).toFixed(2) });
    say('cpu.scaling', w / N);
  }

  // 2–4. per scene: BVH builds, the placed scene, rays
  const made = scenes || makeScenes();
  const keys = tiny ? ['cornell', 'interior', 'exterior', 'product'] : ['cornell', 'interior', 'exterior', 'product', 'anim'];
  const W = tiny ? 64 : 640, H = tiny ? 36 : 360;
  let k = 0;
  for (const key of keys) {
    check();
    say('scene ' + key, k++ / keys.length);
    const sc = expandScene(readBenchScene(made[key]), { tier: info?.tier || 'cpu' });
    const meshTris = sc.meshes.reduce((a, m) => a + m.tris.length / 12, 0);
    // biggest mesh: one thread vs the pool (identical trees)
    const big = sc.meshes.reduce((a, m) => (m.tris.length > a.tris.length ? m : a));
    const boxes = triBoxes(big.tris);
    let t0 = now();
    canonical(buildTree(boxes));
    const tOne = now() - t0;
    t0 = now();
    canonical(await buildTreeParallel(pool, boxes, { minTask: tiny ? 512 : 8192, signal }));
    const tPool = now() - t0;
    rows.push({ test: 'bvh.build', scene: key, device: 'cpu', workers: 1, value: +tOne.toFixed(1), unit: 'ms', note: big.tris.length / 12 + ' triangles (largest mesh)' });
    rows.push({ test: 'bvh.build', scene: key, device: 'cpu', workers: N, value: +tPool.toFixed(1), unit: 'ms', note: 'the pool (same tree)' });
    t0 = now();
    const bs = buildScene({ meshes: sc.meshes.map((m) => ({ tris: m.tris })), instances: sc.instances.map((it) => ({ mesh: it.mesh, m: it.m })) });
    const tScene = now() - t0;
    rows.push({ test: 'bvh.scene', scene: key, device: 'cpu', workers: 1, value: +tScene.toFixed(1), unit: 'ms', note: sc.instances.length + ' instances, ' + meshTris + ' triangles in meshes, ' + sc.triangles + ' placed' });
    // rays: share the scene once, tiles of rows through the scheduler
    const buf = sceneBuffers(bs);
    await pool.share('bvh.nodes', buf.nodes); await pool.share('bvh.tris', buf.tris); await pool.share('bvh.inst', buf.inst); await pool.share('bvh.meta', buf.meta);
    const cam = sc.camera(W / H);
    // one untimed pass first: every worker compiles the traversal and receives the scene before anything is timed
    await createScheduler({ devices: [{ id: 'cpu', lanes: N, run: (c) => pool.run(RAYCAST, 'castTile', { x0: 0, y0: c.start, tw: W, th: c.count, W, H, world: cam.world, proj: cam.proj, spp: 1, seed: 1 }, { signal }) }], targetMs: 20 }).runRange(H, { signal });
    for (const lanes of [1, N]) {
      check();
      let rays = 0;
      const sched = createScheduler({ devices: [{ id: 'cpu', lanes, run: (c) => pool.run(RAYCAST, 'castTile', { x0: 0, y0: c.start, tw: W, th: c.count, W, H, world: cam.world, proj: cam.proj, spp: tiny ? 1 : 4, seed: 7 }, { signal }) }], targetMs: 40 });
      t0 = now();
      await sched.runRange(H, { signal, onChunk: (_, r) => { rays += r.rays; } });
      const ms = now() - t0;
      rows.push({ test: 'raycast', scene: key, device: 'cpu', workers: lanes, value: Math.round(rays / (ms / 1000)), unit: 'rays/s', note: W + '×' + H + ', closest hit, traversal only' });
    }
    for (const kern of kernels) {
      check();
      try {
        const r = await kern.run(sc, { w: W, h: H, spp: tiny ? 4 : 64, signal });
        rows.push({ test: 'kernel.' + kern.id, scene: key, device: kern.device, workers: null, value: Math.round(r.samples / (r.ms / 1000)), unit: 'samples/s', note: W + '×' + H });
      } catch (e) {
        if (e?.code === 'cancelled') throw e;
        rows.push({ test: 'kernel.' + kern.id, scene: key, device: kern.device, workers: null, value: null, unit: 'samples/s', note: 'failed: ' + String(e?.message || e).slice(0, 120) });
      }
    }
    const devs = kernels.filter((x) => typeof x.makeDevice === 'function' && x.device !== 'js');
    if (devs.length >= 2) {
      check();
      try {
        const made2 = await Promise.all(devs.map(async (x) => ({ id: x.id, kind: x.device, ...(await x.makeDevice(sc, { w: W, h: H })) })));
        const hy = createHybrid({ devices: made2, W, H });
        await hy.run({ passes: 1, spp: made2.length, signal });   // measures each device once
        const t1 = now();
        const r = await hy.run({ passes: tiny ? 1 : 4, spp: tiny ? 8 : 16, signal });
        const ms = now() - t1, n = W * H * (r.samples - made2.length);
        rows.push({ test: 'kernel.hybrid', scene: key, device: made2.map((d) => d.kind).join('+'), workers: null, value: Math.round(n / (ms / 1000)), unit: 'samples/s', note: Object.entries(r.byDevice).map(([id, b]) => id + ' ' + b.samples).join(', ') + ' samples (the split followed the measured speed)' });
      } catch (e) {
        if (e?.code === 'cancelled') throw e;
        rows.push({ test: 'kernel.hybrid', scene: key, device: 'mixed', workers: null, value: null, unit: 'samples/s', note: 'failed: ' + String(e?.message || e).slice(0, 120) });
      }
    }
  }
  for (const n of ['bvh.nodes', 'bvh.tris', 'bvh.inst', 'bvh.meta']) pool.unshare(n);
  say('done', 1);
  return { format: 'cadcraft-render-bench-results', version: BENCH_VERSION, when: new Date().toISOString(), machine: machineOf(facts, info), size: tiny ? 'tiny' : 'full', workers: N, rows };
}

export function resultsMarkdown(res) {
  const m = res.machine;
  const head = '**' + [m.gpu || 'no WebGPU adapter', m.cores + ' cores', m.memoryGB != null ? m.memoryGB + ' GB' : 'memory not reported', m.isolated ? 'isolated' : 'not isolated', 'tier ' + m.tier].join(', ') + '** — ' + m.ua + ' — ' + res.when + ' (' + res.size + ')';
  const lines = [head, '', '| Test | Scene | Device | Workers | Value | Unit | Note |', '|---|---|---|---|---|---|---|'];
  for (const r of res.rows) lines.push('| ' + [r.test, r.scene || '', r.device, r.workers ?? '', r.value ?? '—', r.unit, r.note || ''].join(' | ') + ' |');
  return lines.join('\n');
}
