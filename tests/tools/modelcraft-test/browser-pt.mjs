#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-pt.mjs — the WGSL wavefront path tracer (0.7 RN.1, session `render`) against the JS reference, in headless Chromium
 * with SwiftShader WebGPU (`--enable-unsafe-webgpu`; slow, fine for correctness at tiny sizes — KICKOFF rules 14, 15). Every
 * scene of pt-scenes.mjs at 32 × 32 × 8 spp is packed in the page, rendered by both kernels with the same sample sequence, and
 * compared: the image mean and every 8 × 8 block's mean per channel (statistical parity, never pixel-exact); the furnace
 * scenes must come out at 1; Stop then Resume continues the sequence (the same picture as one run); no GPU validation errors.
 * Shots (both kernels side by side, scaled up) in tmp/shots/pt.
 *
 *   node tools/modelcraft-test/browser-pt.mjs [--out <dir>] [--size 32] [--spp 8] [--only room,daylight]
 * Run as root (Playwright's Chromium). Needs no sign-in: it loads the modules from /assets on a page of the site.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { SCENES } from './pt-scenes.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/pt')));
const SIZE = Math.min(128, Number(arg('--size', 32)));
const SPP = Math.min(16, Number(arg('--spp', 8)));
const ONLY = arg('--only', '') ? arg('--only', '').split(',') : Object.keys(SCENES);
fs.mkdirSync(OUT, { recursive: true });

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-unsafe-swiftshader'] });

let pass = 0, fail = 0;
const ok = (c, what, detail = '') => { if (c) { pass++; console.log('  ok    ' + what + (detail ? ' (' + detail + ')' : '')); } else { fail++; console.log('  FAIL  ' + what + (detail ? ' — ' + detail : '')); } };

// a fresh page for each scene and each later part: SwiftShader keeps memory per page, and a long run of GPU devices on one page
// ran out of it (2026-10-22: the page crashed at the 8th scene)
let page = null;
const errors = [];
async function freshPage() {
  if (page) await page.close().catch(() => {});
  page = await browser.newPage();
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(BASE + '/robots.txt');
}
await freshPage();

const scenesSrc = fs.readFileSync(path.join(REPO, 'tools/modelcraft-test/pt-scenes.mjs'), 'utf8');
const hasGpu = await page.evaluate(async () => !!(navigator.gpu && (await navigator.gpu.requestAdapter())));
ok(hasGpu, 'WebGPU adapter in headless Chromium (SwiftShader)');

// the WGSL BSDF against pt-bsdf.js, case by case (RN.2): every lobe of the OpenPBR model, random directions and numbers
{
  console.log('\nBSDF, WGSL vs JS (case by case)');
  const r = await page.evaluate(async () => {
    const base = '/assets/apps/modelcraft/dev/render/';
    const [W, B, PK, T] = await Promise.all(['pt-wgsl.js', 'pt-bsdf.js', 'pt-pack.js', 'pt-tables.js'].map((f) => import(base + f)));
    const W1 = [1, 1, 1], g = [0.18, 0.5, 0.3];
    const mats = [
      { base_color: g, specular_roughness: 0.78 }, { base_color: g, specular_roughness: 0.2, base_diffuse_roughness: 0.6 },
      { base_color: [0.9, 0.6, 0.3], base_metalness: 1, specular_roughness: 0.4, specular_color: [0.8, 0.9, 1] },
      { base_color: W1, base_metalness: 1, specular_roughness: 0 },
      { transmission_weight: 1, specular_roughness: 0.3 }, { transmission_weight: 1, specular_roughness: 0, geometry_thin_walled: true, transmission_color: [0.8, 0.9, 1] },
      { base_color: g, coat_weight: 1, coat_roughness: 0.15, coat_color: [0.9, 0.8, 0.7] }, { base_color: g, fuzz_weight: 1, fuzz_color: [1, 0.5, 0.5] },
      { base_color: W1, base_metalness: 1, specular_roughness: 0.3, thin_film_weight: 1, thin_film_thickness: 0.4 },
      { subsurface_weight: 1, subsurface_color: [0.9, 0.5, 0.4], geometry_thin_walled: true, subsurface_scatter_anisotropy: 0.3 },
      { transmission_weight: 1, specular_roughness: 0.25, transmission_dispersion_scale: 1, transmission_dispersion_abbe_number: 25 },
      { base_color: g, specular_roughness: 0.5, specular_roughness_anisotropy: 0.7, specular_weight: 0.6, specular_ior: 1.8 },
    ];
    const recs = mats.map((m) => PK.recordFrom(m)), RF = recs[0].length, matBuf = new Float32Array(recs.length * RF);   // RF = MAT_FLOATS (80 since RENDER-SPEC v8)
    recs.forEach((r, i) => matBuf.set(r, i * RF));
    let seed = 11; const rnd = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
    const dir = (up) => { const z = up ? 0.05 + 0.95 * rnd() : -(0.05 + 0.95 * rnd()), r = Math.sqrt(1 - z * z), ph = 2 * Math.PI * rnd(); return [r * Math.cos(ph), r * Math.sin(ph), z]; };
    const N = 1200, cases = new Float32Array(N * 12);
    for (let i = 0; i < N; i++) {
      const m = i % mats.length, front = (i >> 4) % 4 !== 3, chan = mats[m].transmission_dispersion_scale ? (i % 4) : 0;
      const wo = dir(true), wi = dir(rnd() < 0.7);
      cases.set([...wo, front ? 1 : 0, ...wi, chan, rnd(), rnd(), rnd(), m], i * 12);
    }
    const adapter = await navigator.gpu.requestAdapter(), device = await adapter.requestDevice();
    const mk = (data, usage) => { const b = device.createBuffer({ size: Math.ceil(data.byteLength / 16) * 16, usage, mappedAtCreation: true }); new Float32Array(b.getMappedRange()).set(data); b.unmap(); return b; };
    const tab = new Float32Array(Math.ceil(T.TABLE_FLOATS / 4) * 4); tab.set(T.tables().words);
    const U = GPUBufferUsage, bMat = mk(matBuf, U.STORAGE), bTab = mk(tab, U.UNIFORM), bIn = mk(cases, U.STORAGE);
    const bOut = device.createBuffer({ size: N * 48, usage: U.STORAGE | U.COPY_SRC }), bRead = device.createBuffer({ size: N * 48, usage: U.MAP_READ | U.COPY_DST });
    const module = device.createShaderModule({ code: W.bsdfTestSource() });
    const info = await module.getCompilationInfo();
    const errs = info.messages.filter((m) => m.type === 'error').map((m) => m.lineNum + ': ' + m.message);
    if (errs.length) return { error: errs.slice(0, 3).join(' ; ') };
    const pipe = device.createComputePipeline({ layout: 'auto', compute: { module, entryPoint: 'main' } });
    const bg = device.createBindGroup({ layout: pipe.getBindGroupLayout(0), entries: [bMat, bTab, bIn, bOut].map((b, i) => ({ binding: i, resource: { buffer: b } })) });
    const enc = device.createCommandEncoder(), pass = enc.beginComputePass();
    pass.setPipeline(pipe); pass.setBindGroup(0, bg); pass.dispatchWorkgroups(Math.ceil(N / 64)); pass.end();
    enc.copyBufferToBuffer(bOut, 0, bRead, 0, N * 48); device.queue.submit([enc.finish()]);
    await bRead.mapAsync(GPUMapMode.READ);
    const out = new Float32Array(bRead.getMappedRange().slice(0)); bRead.unmap(); device.destroy();
    const P = recs.map((r) => B.params(r)), ev = new Float64Array(8), sm = new Float64Array(8);
    const rel = (a, b) => Math.abs(a - b) / Math.max(1e-3, Math.abs(a) + Math.abs(b));
    const bad = { eval: [], pdf: [], dir: [], weight: [] };
    for (let i = 0; i < N; i++) {
      const c = cases.subarray(i * 12, i * 12 + 12), p = P[c[11]], front = c[3] > 0.5, chan = c[7], wo = [c[0], c[1], c[2]], wi = [c[4], c[5], c[6]];
      B.evalBsdf(p, front, chan, wo, wi, ev);
      const o = out.subarray(i * 12, i * 12 + 12);
      for (let k = 0; k < 3; k++) if (rel(ev[3 + k], o[k]) > 2e-3) { bad.eval.push([i, c[11], k, ev[3 + k], o[k]]); break; }
      if (rel(ev[6], o[3]) > 2e-3) bad.pdf.push([i, c[11], ev[6], o[3]]);
      const okJ = B.sampleBsdf(p, front, chan, wo, c[8], c[9], c[10], sm), okG = o[7] >= 2;
      if (okJ !== okG) { bad.dir.push([i, c[11], 'ok', okJ, okG]); continue; }
      if (!okJ) continue;
      // f32 rounding in visible-normal sampling moves a grazing direction by up to ~10⁻³: beyond 5·10⁻³ is a real difference
      if (Math.abs(sm[0] - o[4]) + Math.abs(sm[1] - o[5]) + Math.abs(sm[2] - o[6]) > 5e-3) bad.dir.push([i, c[11], [sm[0], sm[1], sm[2]].map((x) => +x.toFixed(4)), [o[4], o[5], o[6]].map((x) => +x.toFixed(4))]);
      else for (let k = 0; k < 3; k++) if (rel(sm[3 + k], o[8 + k]) > 2e-2) { bad.weight.push([i, c[11], k, sm[3 + k], o[8 + k]]); break; }
    }
    return { n: N, bad: Object.fromEntries(Object.entries(bad).map(([k, v]) => [k, { count: v.length, first: v.slice(0, 3) }])) };
  });
  if (r.error) ok(false, 'the BSDF test kernel compiles', r.error);
  else for (const [k, v] of Object.entries(r.bad)) ok(v.count <= Math.ceil(r.n * 0.005), 'WGSL ' + k + ' = JS on ' + r.n + ' cases (12 OpenPBR materials, both sides, dispersion channels)', v.count + ' differ' + (v.count ? ': ' + JSON.stringify(v.first) : ''));
}

for (const name of ONLY) {
  await freshPage();
  console.log('\n' + name);
  const data = SCENES[name]();
  const r = await page.evaluate(async ({ data, size, spp, scenesSrc }) => {
    const base = '/assets/apps/modelcraft/dev/render/';
    const [PK, { makeTracer, toBytes }, { blueNoise }, { createGpuTracer }] = await Promise.all(['pt-pack.js', 'pt-ref.js', 'pt-sampler.js', 'pt-gpu.js'].map((f) => import(base + f)));
    const S = await import(URL.createObjectURL(new Blob([scenesSrc], { type: 'text/javascript' })));
    const pk = S.packFor(PK, data, { w: size, h: size });
    const mask = blueNoise();
    const t0 = performance.now();
    const Tref = makeTracer(pk, { mask }), ref = Tref.render({ spp });
    if (Tref.caustics) for (let k = 0; k < spp; k++) Tref.lightTrace({ s: k, accum: ref });   // RN.7: the light paths of every sample, as the GPU's lightPass does
    const refAux = ref.aux ? Array.from(ref.aux) : null;
    const tRef = performance.now() - t0;
    const gpu = await createGpuTracer(pk, { mask });
    const t1 = performance.now();
    const half = Math.max(1, spp >> 1);
    const a = await gpu.run({ spp: half });
    const b = await gpu.run({ spp: spp - half });   // a resume: continues the sequence
    const tGpu = performance.now() - t1;
    const acc = await gpu.accum();
    const gpuAux = pk.auxStride ? Array.from(await gpu.aux()) : null;
    const img = await gpu.image(0);
    gpu.dispose();
    const refImg = toBytes(ref, size, size, 0);
    return { refAux, gpuAux, stride: pk.auxStride || 0, nGroups: pk.groups ? pk.groups.length : 0, ref: Array.from(ref), gpu: Array.from(acc), refImg: Array.from(refImg), gpuImg: Array.from(img), tRef, tGpu, samples: b.samples, first: a.samples, counts: pk.counts };
  }, { data, size: SIZE, spp: SPP, scenesSrc }).catch((e) => ({ error: String(e) }));
  if (r.error) { ok(false, name + ' renders', r.error); continue; }
  ok(r.samples === SPP && r.first === Math.max(1, SPP >> 1), 'Stop then Resume continues to ' + SPP + ' samples', r.first + ' + ' + (r.samples - r.first));
  const N = SIZE * SIZE;
  const mean = (acc) => { const m = [0, 0, 0]; for (let i = 0; i < N; i++) for (let k = 0; k < 3; k++) m[k] += acc[i * 4 + k] / Math.max(1, acc[i * 4 + 3]) / N; return m; };
  const mr = mean(r.ref), mg = mean(r.gpu);
  const rel = (a, b) => Math.abs(a - b) / Math.max(0.02, Math.abs(b));
  const relMean = Math.max(...[0, 1, 2].map((k) => rel(mg[k], mr[k])));
  ok(r.gpu.every(Number.isFinite), 'no NaN or infinity in the GPU accumulation');
  ok(r.gpu.filter((_, i) => i % 4 === 3).every((x) => x === SPP), 'every pixel has ' + SPP + ' samples');
  ok(relMean < 0.03, 'image mean: WGSL ≈ JS reference (< 3%)', 'ref ' + mr.map((x) => x.toFixed(4)).join(' ') + ' / gpu ' + mg.map((x) => x.toFixed(4)).join(' ') + ', ' + (relMean * 100).toFixed(2) + '%');
  // 8 × 8 blocks
  let worst = 0, worstAt = '';
  for (let by = 0; by < SIZE; by += 8) for (let bx = 0; bx < SIZE; bx += 8) {
    const s = [[0, 0, 0], [0, 0, 0]];
    for (let y = by; y < by + 8; y++) for (let x = bx; x < bx + 8; x++) { const i = (y * SIZE + x) * 4; for (let k = 0; k < 3; k++) { s[0][k] += r.ref[i + k] / Math.max(1, r.ref[i + 3]); s[1][k] += r.gpu[i + k] / Math.max(1, r.gpu[i + 3]); } }
    for (let k = 0; k < 3; k++) { const d = Math.abs(s[1][k] - s[0][k]) / Math.max(0.05 * 64, Math.abs(s[0][k])); if (d > worst) { worst = d; worstAt = bx + ',' + by + ' ch' + k; } }
  }
  // the same samples: paths agree until f32 and f64 round a choice differently, then drift apart (most in a closed room with a
  // mirror); a sanity bound here — the statistical test is the bench section's parity.js
  ok(worst < 0.3, 'every 8 × 8 block within 30% of the reference (same samples; f32 drift)', 'worst ' + (worst * 100).toFixed(1) + '% at ' + worstAt);
  if (r.stride) {
    // RN.6: every element and light group, image-wide (green), WGSL vs the reference with the same samples
    const E = 10, slotMean = (a, k) => { let m = 0; for (let i = 0; i < N; i++) m += a[(i * r.stride + k) * 4 + 1] / N; return m; };
    const names = ['albedo', 'normal·depth', 'diffuse direct', 'diffuse indirect', 'specular direct', 'specular indirect', 'transmission direct', 'transmission indirect', 'emission', 'ids'];
    const bad = [];
    for (let k = 0; k < r.stride; k++) {
      if (k === 1 || k === 9) continue;   // normals average signs out; ids are labels
      const a = slotMean(r.refAux, k), b = slotMean(r.gpuAux, k);
      if (Math.abs(a - b) > 0.06 * Math.abs(a) + 0.002 * SPP) bad.push((k < E ? names[k] : 'group ' + (k - E)) + ' ' + a.toFixed(3) + '/' + b.toFixed(3));
    }
    ok(!bad.length, 'render elements and ' + r.nGroups + ' light groups: WGSL ≈ the reference, slot by slot', bad.join('; ') || r.stride + ' slots');
    let sg = 0, sb = 0;
    for (let i = 0; i < N; i++) { for (let g = 0; g < r.nGroups; g++) sg += r.gpuAux[(i * r.stride + E + g) * 4 + 1]; sb += r.gpu[i * 4 + 1]; }
    ok(Math.abs(sg - sb) < 1e-3 * sb, 'WGSL: the light groups add up to the picture', (sg / sb).toFixed(6));
  }
  if (SCENES[name]().uniformEnv >= 1) {
    // pixels on the sphere and off it both see radiance 1
    ok(Math.abs(mg[1] - 1) < 0.03 && Math.abs(mr[1] - 1) < 0.03, 'furnace: the picture converges to 1', 'gpu ' + mg[1].toFixed(4) + ', ref ' + mr[1].toFixed(4));
  }
  if (r.counts.bounded || r.counts.triLights) console.log('        (lights: ' + r.counts.bounded + ' in the tree, ' + r.counts.triLights + ' emissive triangles, ' + r.counts.portals + ' portals)');
  console.log('        (' + r.counts.tris + ' triangles; reference ' + Math.round(r.tRef) + ' ms, WGSL on SwiftShader ' + Math.round(r.tGpu) + ' ms — VPS, capped; not a timing)');
  // shot: reference | WGSL, ×4
  const shot = await page.evaluate(({ a, b, n }) => {
    const c = document.createElement('canvas'); c.width = n * 8 + 4; c.height = n * 4;
    const g = c.getContext('2d'); g.imageSmoothingEnabled = false;
    const put = (px, x) => { const t = document.createElement('canvas'); t.width = n; t.height = n; t.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(px), n, n), 0, 0); g.drawImage(t, x, 0, n * 4, n * 4); };
    put(a, 0); put(b, n * 4 + 4);
    return c.toDataURL('image/png');
  }, { a: r.refImg, b: r.gpuImg, n: SIZE });
  fs.writeFileSync(path.join(OUT, name + '.png'), Buffer.from(shot.split(',')[1], 'base64'));
}

// RN.8: the GPU's resolve (previews) = pt-post.js's per-pixel post, view transform by view transform
if (ONLY.includes('room')) {
  await freshPage();
  console.log('\npost and colour (GPU resolve vs pt-post.js)');
  const data = SCENES.room();
  const r = await page.evaluate(async ({ data, scenesSrc }) => {
    const base = '/assets/apps/modelcraft/dev/render/';
    const [PK, { blueNoise }, { createGpuTracer }, PO] = await Promise.all(['pt-pack.js', 'pt-sampler.js', 'pt-gpu.js', 'pt-post.js'].map((f) => import(base + f)));
    const S = await import(URL.createObjectURL(new Blob([scenesSrc], { type: 'text/javascript' })));
    const pk = S.packFor(PK, data, { w: 32, h: 32 });
    const gpu = await createGpuTracer(pk, { mask: blueNoise() });
    await gpu.run({ spp: 4 });
    const acc = await gpu.accum(), lin = new Float32Array(32 * 32 * 3);
    for (let i = 0; i < 1024; i++) for (let k = 0; k < 3; k++) lin[i * 3 + k] = acc[i * 4 + k] / Math.max(1, acc[i * 4 + 3]);
    const out = [];
    for (const view of PO.VIEWS) {
      const p = PO.cleanPost({ view, contrast: 0.2, highlights: 0.5, vignette: 0.4 });
      const g = await gpu.image(0.3, [1.05, 1, 0.95], p), j = PO.post(lin, 32, 32, p, { exposure: 0.3, wb: [1.05, 1, 0.95] });
      let d = 0; for (let i = 0; i < g.length; i++) if (i % 4 !== 3) d = Math.max(d, Math.abs(g[i] - j[i]));
      out.push({ view, d });
    }
    gpu.dispose();
    return out;
  }, { data, scenesSrc }).catch((e) => [{ view: 'error', d: 999, e: String(e) }]);
  for (const x of r) ok(x.d <= 2, 'GPU resolve = pt-post.js: ' + x.view + ' with contrast, highlights, vignette, exposure, white balance', 'max ' + x.d + ' levels' + (x.e ? ' ' + x.e : ''));
}

// RN.5: the denoiser — the network on the GPU (pt-denoise-gpu.js) = on the CPU (pt-denoise.js)
if (ONLY.includes('room')) {
  await freshPage();
  console.log('\ndenoiser (GPU vs CPU)');
  const r = await page.evaluate(async () => {
    const base = '/assets/apps/modelcraft/dev/render/';
    const [D, G] = await Promise.all([import(base + 'pt-denoise.js'), import(base + 'pt-denoise-gpu.js')]);
    const net = await D.loadNet();
    const w = 80, h = 48; let s = 9; const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
    const rgb = new Float32Array(w * h * 3), alb = new Float32Array(w * h * 3), nrm = new Float32Array(w * h * 3);
    for (let i = 0; i < w * h; i++) { const x = i % w, y = Math.floor(i / w); for (let k = 0; k < 3; k++) { rgb[i * 3 + k] = (0.3 + 0.2 * Math.sin(x / 6) + 0.1 * k) * (rnd() < 0.08 ? 10 : 1) * rnd() * 2; alb[i * 3 + k] = 0.5 + 0.3 * Math.sin(y / 5 + k); nrm[i * 3 + k] = k === 2 ? 1 : 0; } }
    const t0 = performance.now(), cpu = await D.denoiseCpu(net, rgb, alb, nrm, w, h), tCpu = performance.now() - t0;
    const dn = await G.createGpuDenoiser(net);
    const t1 = performance.now(), gpu = await dn.run(rgb, alb, nrm, w, h), tGpu = performance.now() - t1;
    dn.dispose();
    let md = 0, mx = 0; for (let i = 0; i < cpu.length; i++) { md = Math.max(md, Math.abs(cpu[i] - gpu[i]) / (Math.abs(cpu[i]) + 0.05)); mx = Math.max(mx, cpu[i]); }
    let nIn = 0, nOut = 0; for (let i = 1; i < w * h; i++) { nIn += Math.abs(rgb[i * 3] - rgb[i * 3 - 3]); nOut += Math.abs(cpu[i * 3] - cpu[i * 3 - 3]); }
    return { md, mx, tCpu: Math.round(tCpu), tGpu: Math.round(tGpu), smoother: nOut / nIn };
  }).catch((e) => ({ error: String(e) }));
  ok(!r.error && r.md < 1e-3, 'denoiser: the network on the GPU = on the CPU (80 × 48, relative)', r.error || r.md.toExponential(2) + ' (CPU ' + r.tCpu + ' ms, SwiftShader ' + r.tGpu + ' ms — not a timing)');
  ok(!r.error && r.smoother < 0.5, 'denoiser: the output is smoother than the noisy input', r.smoother && r.smoother.toFixed(3));
}

// RN.11: the interactive render in a view (render/ipr.js) on a stand-in stage
if (ONLY.includes('room')) {
  await freshPage();
  console.log('\ninteractive render (ipr.js)');
  const data = SCENES.room();
  const r = await page.evaluate(async ({ data, scenesSrc }) => {
    const base = '/assets/apps/modelcraft/dev/render/';
    const [{ createIpr }] = await Promise.all(['ipr.js'].map((f) => import(base + f)));
    const S = await import(URL.createObjectURL(new Blob([scenesSrc], { type: 'text/javascript' })));
    const stage = document.createElement('div');
    stage.style.cssText = 'position:relative;width:96px;height:64px';
    document.body.append(stage);
    let cam = data.camera.world.slice(), ver = 1, settings = { ...data.settings, quality: 'draft' }, saved = null;
    const ipr = createIpr({
      stage, scene: () => S.shimScene({ ...data, camera: { ...data.camera, world: cam } }),
      camera: (aspect) => ({ world: cam, proj: data.camera.proj.map((x, i) => (i === 0 ? data.camera.proj[5] / aspect : x)) }),
      version: () => ver, cameraKey: () => cam.join(','), settings: () => settings, save: (s) => { saved = s; settings = s; }, t: (k) => k,
    });
    ipr.scale = 1;
    const until = async (f, ms = 60000) => { const t0 = performance.now(); while (!f()) { if (performance.now() - t0 > ms) return false; await new Promise((res) => setTimeout(res, 20)); } return true; };
    const out = {};
    out.started = await ipr.start();
    out.reached = await until(() => ipr.state.samples >= 3);
    out.denoised = await until(() => ipr.state.denoised >= 1, 120000);
    const c = stage.querySelector('canvas[data-ipr]');
    out.size = [c.width, c.height];
    // move the camera: the picture starts again without packing the scene
    cam = cam.slice(); cam[12] += 0.3;
    const rb0 = ipr.state.rebuilds;
    out.restarted = await until(() => ipr.state.restarts >= 1, 20000) && ipr.state.rebuilds === rb0;
    await until(() => ipr.state.samples >= 2);
    // region: only that part has pixels
    ipr.mode = 'region';
    const rect = c.getBoundingClientRect();
    const fire = (type, x, y) => c.dispatchEvent(new PointerEvent(type, { clientX: rect.left + x, clientY: rect.top + y, pointerId: 1, bubbles: true }));
    fire('pointerdown', 10, 10); fire('pointerup', 50, 40);
    out.region = ipr.state.region;
    await until(() => ipr.state.samples >= 2);
    const px = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
    out.outsideClear = px[(2 * c.width + 2) * 4 + 3] === 0 && px[(25 * c.width + 30) * 4 + 3] === 255;
    ipr.clearRegion();
    // focus: a click on the back wall sets the focus distance
    ipr.mode = 'focus';
    fire('pointerdown', 48, 20);
    out.focus = saved && saved.dof && saved.focus;
    // an edit packs the scene again
    ver++;
    const rb1 = ipr.state.rebuilds;
    out.rebuilt = await until(() => ipr.state.rebuilds > rb1 && ipr.state.samples >= 1);
    await ipr.dispose();
    out.removed = !stage.querySelector('canvas[data-ipr]');
    return out;
  }, { data, scenesSrc }).catch((e) => ({ error: String(e) }));
  ok(!r.error && r.started && r.reached, 'IPR: starts on the graphics card and adds samples', r.error || JSON.stringify(r.size));
  ok(r.denoised, 'IPR: the view\'s render is denoised once it has its first samples');
  ok(r.restarted, 'IPR: moving the camera starts the picture again, without packing the scene');
  ok(Array.isArray(r.region) && r.region[2] - r.region[0] >= 30 && r.outsideClear, 'IPR: a dragged region renders alone (the rest stays the view\'s)', JSON.stringify(r.region));
  ok(r.focus > 2 && r.focus < 5, 'IPR: a click picks the focus distance (the back wall of the room)', String(r.focus));
  ok(r.rebuilt && r.removed, 'IPR: an edit packs the scene again; leaving removes the overlay');
}

// CU.8's comparison for the WGSL kernel (compute's parity.js; independent batches, so the two kernels use DIFFERENT samples
// here: this is the statistical test, block means within the pictures' own variance) on compute's bench scenes
if (!process.argv.includes('--no-bench')) {
  await freshPage();
  console.log('\nbench scenes (compute/parity.js, independent samples)');
  const benchJson = Object.fromEntries(['cornell', 'interior', 'product', 'furnace-diffuse', 'furnace-glass'].map((k) => [k, JSON.parse(fs.readFileSync(path.join(REPO, 'fixtures/render-bench', k + '.json'), 'utf8'))]));
  const res = await page.evaluate(async ({ benchJson, size }) => {
    const base = '/assets/apps/modelcraft/dev/';
    const [{ kernels }, B, PA] = await Promise.all(['render/bench-kernels.js', 'compute/bench-scenes.js', 'compute/parity.js'].map((f) => import(base + f)));
    const ref = kernels.find((k) => k.reference), gpu = kernels.find((k) => k.device === 'gpu');
    if (!gpu) return { error: 'no WGSL kernel in bench-kernels.js (navigator.gpu missing)' };
    const out = [];
    for (const [key, j] of Object.entries(benchJson)) {
      const sc = B.expandScene(B.readBenchScene(j), { tier: 'cpu' });
      const w = size, h = size, spp = 4, k = 4;
      const R = PA.fromBatches(await ref.batches(sc, { w, h, spp, k, seed: 1 }), w, h);
      const T = PA.fromBatches(await gpu.batches(sc, { w, h, spp, k, seed: 100 }), w, h);
      const c = PA.compareImages(R, T);
      const f = key.startsWith('furnace') ? PA.furnace(T, 1) : null;
      // makeDevice / renderRange (CU.6 hybrid): a range = the sum of exactly those samples
      let range = null;
      if (key === 'cornell') {
        const dev = gpu.makeDevice(sc, { w, h }), a = await dev.renderRange(0, 2), b = await dev.renderRange(2, 2), ab = await dev.renderRange(0, 4);
        dev.release();
        let worst = 0; for (let i = 0; i < ab.length; i++) worst = Math.max(worst, Math.abs(a[i] + b[i] - ab[i]) / Math.max(1, Math.abs(ab[i])));
        range = { worst, n: ab[3] };
      }
      out.push({ key, failed: c.failed, blocks: c.blocks, ok: c.ok, z: c.image.z, furnace: f && { ok: f.ok, mean: f.mean }, range });
    }
    return { out };
  }, { benchJson, size: SIZE }).catch((e) => ({ error: String(e) }));
  if (res.error) ok(false, 'bench parity runs', res.error);
  else for (const r of res.out) {
    ok(r.ok, r.key + ': WGSL vs the JS reference (independent samples), ' + r.failed + '/' + r.blocks + ' blocks over 4.5σ', 'image z ' + r.z.toFixed(2));
    if (r.furnace) ok(r.furnace.ok, r.key + ': the WGSL picture is 1 everywhere', r.furnace.mean.map((x) => x.toFixed(4)).join(' '));
    if (r.range) ok(r.range.worst < 1e-5 && r.range.n === 4, 'renderRange(0, 2) + renderRange(2, 2) = renderRange(0, 4) (hybrid splits add up)', 'worst ' + r.range.worst.toExponential(1));
  }
}

// RN.7: adaptive sampling on the GPU = the reference's (pt-adapt.js), sample counts per pixel and the picture
if (ONLY.includes('daylight') || ONLY.includes('room')) {
  await freshPage();
  const name = ONLY.includes('daylight') ? 'daylight' : 'room';
  console.log('\nadaptive sampling (' + name + ')');
  const data = SCENES[name]();
  const r = await page.evaluate(async ({ data, scenesSrc, size, name }) => {
    const base = '/assets/apps/modelcraft/dev/render/';
    const [PK, { makeTracer }, { blueNoise }, { createGpuTracer }, AD] = await Promise.all(['pt-pack.js', 'pt-ref.js', 'pt-sampler.js', 'pt-gpu.js', 'pt-adapt.js'].map((f) => import(base + f)));
    const S = await import(URL.createObjectURL(new Blob([scenesSrc], { type: 'text/javascript' })));
    const mask = blueNoise(), N = size * size, SPP = 32;
    const pk = S.packFor(PK, data, { w: size, h: size });
    const ad = AD.makeAdaptive(size, size, { noise: 0.05, min: 16 });
    const ref = AD.runAdaptive(makeTracer(pk, { mask }), ad, { spp: SPP });
    const gpu = await createGpuTracer(pk, { mask });
    gpu.setAdaptive({ noise: 0.05, min: 16 });
    const run = await gpu.run({ spp: SPP });
    const acc = await gpu.accum();
    const counts = (a) => { const c = []; for (let i = 0; i < N; i++) c.push(a[i * 4 + 3]); return c; };
    const cg = counts(acc), cr = counts(ref);
    const mean = (a) => { const m = [0, 0, 0]; for (let i = 0; i < N; i++) for (let k = 0; k < 3; k++) m[k] += a[i * 4 + k] / Math.max(1, a[i * 4 + 3]) / N; return m; };
    // a range render is never adaptive; restart forgets the judgement
    const range = await gpu.renderRange(0, 4);
    gpu.restart();
    const again = await gpu.run({ spp: 4 });
    const acc2 = await gpu.accum();
    gpu.dispose();
    // a flat scene converges at once
    const fd = S.SCENES ? null : null;
    return { cg, cr, mg: mean(acc), mr: mean(ref), run, rangeN: counts(range), n2: counts(acc2), again, refActive: ad.count };
  }, { data, scenesSrc, size: 24, name }).catch((e) => ({ error: String(e) }));
  if (r.error) ok(false, 'adaptive sampling runs', r.error);
  else {
    const tot = (c) => c.reduce((a, b) => a + b, 0), N = r.cg.length;
    ok(r.cg.every((n) => n % 4 === 0 && n >= 16 && n <= 32), 'GPU: every pixel has a whole number of passes, between the minimum (16) and 32 samples', 'min ' + Math.min(...r.cg) + ' max ' + Math.max(...r.cg));
    ok(tot(r.cg) < N * 32 && tot(r.cg) > N * 16 && r.cg.some((n) => n === 32), 'GPU: converged pixels stopped early, the others ran to the end', tot(r.cg) + ' of ' + N * 32);
    ok(Math.abs(tot(r.cg) - tot(r.cr)) < 0.12 * tot(r.cr), 'the total sample count: GPU ≈ reference (same samples; f32 differs near the threshold)', tot(r.cg) + ' / ' + tot(r.cr));
    const rel = Math.max(...[0, 1, 2].map((k) => Math.abs(r.mg[k] - r.mr[k]) / Math.max(0.02, r.mr[k])));
    ok(rel < 0.04, 'the picture: GPU ≈ reference (image mean < 4%)', r.mg.map((x) => x.toFixed(4)).join(' ') + ' / ' + r.mr.map((x) => x.toFixed(4)).join(' '));
    ok(r.rangeN.every((n) => n === 4) && r.n2.every((n) => n === 4) && r.again.samples === 4, 'renderRange ignores adaptive sampling; restart() forgets what had converged');
  }
}

ok(!errors.filter((e) => !/WebGPU is experimental|powerPreference/i.test(e)).length, 'no console errors or GPU warnings', errors.slice(0, 3).join(' | '));
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
