#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser.mjs — lib/compute in headless Chromium (0.7 Track CU; session `compute`): the probe on a real page (SwiftShader
 * WebGPU with --enable-unsafe-webgpu, so the GPU is a software fallback and the tier is "cpu" here), the "Your machine" card
 * in Settings › Rendering of ModelCraft and BimCraft, the ?tier= override, and whether the page is cross-origin isolated
 * (CU.3). Grows a section per finished item (the pool, the bench page). Fails on any console error.
 *
 *   node tools/compute-test/browser.mjs [--out <dir>] [--only <section word>]
 * Run as root (ModelCraft's test admin via tools/modelcraft-test/admin.php). Once per finished item, never in a loop
 * (KICKOFF rule 6). Shots in tmp/shots/compute.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import { showSetting } from '../shell-test/show-setting.mjs';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/compute')));
const ONLY = arg('--only', null);
const want = (s) => !ONLY || s.includes(ONLY);
const STATE = path.join(REPO, 'tmp/render-browser-state.json');   // shared with ModelCraft's browser tests (same admin)
fs.mkdirSync(OUT, { recursive: true });

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--enable-unsafe-webgpu'] });

let pass = 0, fail = 0;
const ok = (c, what, detail = '') => { if (c) { pass++; console.log('  ok    ' + what + (detail ? ' (' + detail + ')' : '')); } else { fail++; console.log('  FAIL  ' + what + (detail ? ' — ' + detail : '')); } };

async function signedInContext(opts = {}) {
  if (fs.existsSync(STATE)) {
    const c = await browser.newContext({ ...opts, storageState: STATE });
    const p = await c.newPage();
    const r = await p.goto(BASE + '/lab/modelcraft', { waitUntil: 'domcontentloaded' });
    const okLab = r && r.status() === 200 && p.url().includes('/lab/modelcraft');
    await p.close();
    if (okLab) return c;
    await c.close();
  }
  const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
  const c = await browser.newContext(opts);
  const p = await c.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', admin.email);
  await p.fill('input[name="password"]', admin.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await c.storageState({ path: STATE });
  fs.chmodSync(STATE, 0o600);
  await p.close();
  return c;
}

const ctx = await signedInContext({ viewport: { width: 1366, height: 768 }, acceptDownloads: true });
const errors = [];
async function open(url) {
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push(url + ': ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push(url + ': ' + m.text()); });
  await page.goto(BASE + url, { waitUntil: 'load' });
  return page;
}
async function cardOf(page) {
  await page.click('[data-settings-open]');
  await page.click('[data-settings-tab="app"]').catch(() => {});
  // Since 0.7 (data-shell-07) the dialog shows one section at a time: pick the one with "Your machine", as a person would.
  await page.waitForSelector('[data-compute-card]', { state: 'attached', timeout: 20000 });
  await showSetting(page, '[data-compute-card]');
  await page.waitForSelector('[data-compute-card] table', { timeout: 20000 });
  const set = page.locator('[data-compute-set]');
  await set.scrollIntoViewIfNeeded();
  return page.evaluate(() => {
    const box = document.querySelector('[data-compute-card]');
    return { tier: box.querySelector('table').dataset.computeTier, text: box.innerText, isolated: window.crossOriginIsolated, gpu: !!navigator.gpu };
  });
}

if (want('probe')) {
  console.log('\nProbe and the "Your machine" card (CU.1)');
  for (const app of ['modelcraft', 'bimcraft']) {
    const page = await open('/lab/' + app);
    const c = await cardOf(page);
    ok(c.tier === 'cpu', app + ': SwiftShader here → tier cpu', c.tier);
    ok(/Processor only/.test(c.text) && /\d+ cores?/.test(c.text) && /Shared memory/.test(c.text), app + ': card in plain words', c.text.replace(/\s+/g, ' ').slice(0, 160));
    ok(!/compute\.[a-z]/.test(c.text), app + ': no raw language keys');
    await page.locator('[data-compute-set]').screenshot({ path: path.join(OUT, '01-card-' + app + '.png') });
    const facts = await page.evaluate(async () => {
      const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
      const url = Object.entries(map).find(([k]) => /\/dev\/compute\/probe\.js/.test(k))?.[1];
      const P = await import(url);
      const f = await P.probeCached();
      return { f, t: P.tierOf(f) };
    });
    ok(facts.f.wasm.simd === true && facts.f.cores >= 1, app + ': probe in the page (SIMD ' + facts.f.wasm.simd + ', ' + facts.f.cores + ' cores, WebGPU adapter ' + (facts.f.gpu ? (facts.f.gpu.fallback ? 'fallback' : 'hardware') : 'none') + ')');
    ok(facts.f.isolated === c.isolated, app + ': isolation read = window.crossOriginIsolated (' + c.isolated + ')');
    await page.close();
  }
  const page = await open('/lab/modelcraft?tier=gpu-high');
  const c = await cardOf(page);
  ok(c.tier === 'gpu-high' && /Set by the address for testing/.test(c.text) && /Processor only/.test(c.text), '?tier=gpu-high: card says so and names the measured tier');
  await page.locator('[data-compute-set]').screenshot({ path: path.join(OUT, '02-card-override.png') });
  await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
  await page.locator('[data-compute-set]').screenshot({ path: path.join(OUT, '03-card-model.png') });
  await page.close();
}

if (want('pool')) {
  console.log('\nThe page pool in a real browser (CU.2)');
  for (const app of ['modelcraft', 'bimcraft']) {
    const page = await open('/lab/' + app);
    const r = await page.evaluate(async () => {
      const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
      const url = (re) => Object.entries(map).find(([k]) => re.test(k))?.[1];
      const R = await import(url(/\/dev\/compute\/runtime\.js/));
      const pool = await R.pagePool();
      const job = R.jobUrl('./selftest.js');
      await pool.share('selftest', new Float32Array(16));
      const echoes = await Promise.all(Array.from({ length: pool.size * 2 }, (_, i) => pool.run(job, 'echo', { x: i })));
      const ac = new AbortController();
      const t0 = performance.now();
      const p = pool.run(job, 'waitCancel', { ms: 5000 }, { signal: ac.signal });
      setTimeout(() => ac.abort(), 50);
      const cancelled = await p.then(() => 'resolved', (e) => e.code);
      const stopMs = performance.now() - t0;
      const tp = await pool.run(job, 'throughput', { iters: 2e6 }, { units: 2e6 });
      const st = pool.stats();
      R.closePagePool();
      return { size: pool.size, workers: [...new Set(echoes.map((e) => e.worker))].length, xs: echoes.map((e) => e.x).join(','), shared: echoes.every((e) => e.shared === window.crossOriginIsolated), cancelled, stopMs, tp: tp.iters, st, iso: window.crossOriginIsolated };
    });
    ok(r.size >= 1 && r.workers >= Math.min(2, r.size), app + ': pool of ' + r.size + ' workers, ' + r.workers + ' used');
    ok(r.xs === Array.from({ length: r.size * 2 }, (_, i) => i).join(','), app + ': results in the order asked');
    ok(r.shared, app + ': shared data reached every worker' + (r.iso ? ' (SharedArrayBuffer)' : ' (a copy each: page not isolated)'));
    ok(r.cancelled === 'cancelled' && r.stopMs < 1500, app + ': cancel stops a running job (' + Math.round(r.stopMs) + ' ms)');
    ok(r.tp === 2e6 && r.st.speed.cpu > 0, app + ': measured speed recorded');
    await page.close();
  }
}

if (want('bvh')) {
  console.log('\nBVH in the page, built in the pool (CU.4)');
  const page = await open('/lab/modelcraft');
  const r = await page.evaluate(async () => {
    const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
    const url = (re) => Object.entries(map).find(([k]) => re.test(k))?.[1];
    const R = await import(url(/\/dev\/compute\/runtime\.js/));
    const C = await import(url(/\/dev\/compute\/bvh-core\.js/));
    const P = await import(url(/\/dev\/compute\/bvh-parallel\.js/));
    const S = await import(url(/\/dev\/compute\/bvh-scene\.js/));
    let seed = 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const n = 30000, tris = new Float32Array(n * 12);
    for (let i = 0; i < n; i++) tris.set([rnd() * 50, rnd() * 50, rnd() * 50, 0, rnd(), rnd(), rnd(), 0, rnd(), rnd(), rnd(), 0], i * 12);
    const boxes = C.triBoxes(tris);
    const pool = await R.pagePool();
    const t0 = performance.now();
    const par = C.canonical(await P.buildTreeParallel(pool, boxes, { minTask: 1000 }));
    const tPar = performance.now() - t0;
    const t1 = performance.now();
    const ser = C.canonical(C.buildTree(boxes));
    const tSer = performance.now() - t1;
    const a = new Uint8Array(C.packV1(par).nodes), b = new Uint8Array(C.packV1(ser).nodes);
    let same = a.length === b.length; for (let i = 0; same && i < a.length; i++) if (a[i] !== b[i]) same = false;
    const sc = S.buildScene({ meshes: [{ tris }] }, { trees: [par] });
    let agree = 0, hits = 0;
    for (let k = 0; k < 300; k++) {
      const o = [rnd() * 50, rnd() * 50, -5], d = [rnd() - 0.5, rnd() - 0.5, 1], l = Math.hypot(...d); d.forEach((v, i) => { d[i] = v / l; });
      const h = S.sceneHit(sc, o, d), g = C.closestHit(ser, tris, o, d);
      if ((!h && !g) || (h && g && Math.abs(h.t - g.t) < 1e-9)) agree++;
      if (g) hits++;
    }
    R.closePagePool();
    return { same, agree, hits, tPar, tSer, size: pool.size };
  });
  ok(r.same, 'parallel build in the page (' + r.size + ' workers) = one-thread build, byte for byte');
  ok(r.agree === 300, 'wide scene from it = binary tree on 300 rays (' + r.hits + ' hit)');
  console.log('  (timing, not a result: 30 000 triangles in Chromium, pool ' + r.tPar.toFixed(0) + ' ms incl. sending, one thread ' + r.tSer.toFixed(0) + ' ms; VPS)');
  await page.close();
}

if (want('bench')) {
  console.log('\nThe render bench page (CU.8)');
  const page = await open('/lab/modelcraft?bench=render');
  await page.waitForSelector('dialog[data-bench-render][open] .cc-machine', { timeout: 20000 });
  await page.click('[data-bench-run="tiny"]');
  await page.waitForFunction(() => !document.querySelector('[data-bench-copy="json"]').disabled || /stopped/.test(document.querySelector('.cc-bench-status').textContent), null, { timeout: 240000 });
  const r = await page.evaluate(() => {
    const rows = [...document.querySelectorAll('.cc-bench-table tbody tr')].map((tr) => [...tr.children].map((td) => td.textContent));
    return { rows, status: document.querySelector('.cc-bench-status').textContent, text: document.querySelector('dialog[data-bench-render]').innerText };
  });
  ok(r.rows.length >= 20 && /Finished: \d+ results/.test(r.status), 'quick run finished with ' + r.rows.length + ' rows (' + r.status + ')');
  ok(['cpu.scaling', 'bvh.build', 'bvh.scene', 'raycast'].every((t) => r.rows.some((x) => x[0] === t)), 'rows for cpu.scaling, bvh.build, bvh.scene, raycast');
  ok(r.rows.filter((x) => x[0] === 'raycast').every((x) => /rays\/s/.test(x[4]) && !/—/.test(x[4])), 'every ray row has a number');
  ok(!/compute\.[a-z]/.test(r.text), 'no raw language keys on the page');
  const kern = ['kernel.wgsl-wavefront', 'kernel.js-reference', 'kernel.cpu-pool', 'kernel.hybrid'].map((t) => [t, r.rows.filter((x) => x[0] === t)]);
  ok(kern.every(([, rs]) => rs.length > 0 && rs.every((x) => !/—/.test(x[4]))), 'renderer rows with numbers: ' + kern.map(([t, rs]) => t.slice(7) + ' ×' + rs.length).join(', ') + ' (SwiftShader here: not GPU numbers)');
  await page.locator('dialog[data-bench-render]').screenshot({ path: path.join(OUT, '04-bench.png') });
  // save results (a download; nothing uploaded)
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 10000 }), page.click('[data-bench-save]')]);
  const saved = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(saved.format === 'cadcraft-render-bench-results' && saved.rows.length === r.rows.length && saved.machine.cores >= 1, 'Save results downloads the JSON (' + dl.suggestedFilename() + ')');
  // Stop mid-run keeps nothing
  await page.click('[data-bench-run="full"]');
  await page.waitForTimeout(300);
  await page.click('[data-bench-stop]');
  await page.waitForFunction(() => /Stopped/.test(document.querySelector('.cc-bench-status').textContent), null, { timeout: 30000 });
  ok(true, 'Stop ends a full run');
  await page.close();
}

if (want('lan')) {
  console.log('\nOther computers in Settings › Rendering, with a stand-in Studio bridge (CU.7)');
  // without Studio's bridge the section stays hidden
  {
    const page = await open('/lab/modelcraft');
    await page.click('[data-settings-open]');
    await page.waitForSelector('[data-compute-card] table');
    ok(await page.evaluate(() => document.querySelector('[data-compute-lan]').hidden), 'in a browser tab (no Studio bridge) the section is hidden: it claims nothing');
    await page.close();
  }
  const page = await ctx.newPage();
  page.on('pageerror', (e) => errors.push('lan: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('lan: ' + m.text()); });
  // a stand-in for desktop-shell's bridge: this page finds itself on the "network" and connects to itself
  await page.addInitScript(() => {
    let onConn = null, tag = null, nodesCb = null;
    const pair = () => {
      const mk = () => ({ onmessage: null, onclose: null, closed: false, peer: null,
        send(b) { if (this.closed) return; const c = Uint8Array.from(b), p = this.peer; setTimeout(() => { if (!p.closed) p.onmessage?.(c); }, 0); },
        close() { if (this.closed) return; this.closed = true; const p = this.peer; setTimeout(() => { this.onclose?.(); if (!p.closed) { p.closed = true; p.onclose?.(); } }, 0); } });
      const a = mk(), b = mk(); a.peer = b; b.peer = a; return [a, b];
    };
    window.cadcraftDesktop = Object.assign(window.cadcraftDesktop || {}, { renderNodes: {
      advertise: async (t) => { tag = t; nodesCb?.([{ tag, name: 'Test node', host: '192.168.1.20', port: 47111 }]); },
      stopAdvertising: () => { tag = null; },
      onConnection: (cb) => { onConn = cb; },
      browse: async () => (tag ? [{ tag, name: 'Test node', host: '192.168.1.20', port: 47111 }] : []),
      onNodes: (cb) => { nodesCb = cb; },
      connect: async () => { const [a, b] = pair(); onConn?.(b); return a; },
    } });
  });
  await page.goto(BASE + '/lab/modelcraft', { waitUntil: 'load' });
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-compute-lan] input[name="ccLanServe"]', { timeout: 20000 });
  ok(await page.evaluate(() => !document.querySelector('[data-compute-lan]').hidden && !document.querySelector('input[name="ccLanServe"]').checked), 'with the bridge the section shows; "Let others render on this computer" starts off');
  await page.check('input[name="ccLanServe"]');
  await page.waitForSelector('.cc-lan-code:not([hidden]) strong');
  const code = await page.textContent('.cc-lan-code strong');
  ok(/^[0-9A-Z]{2}-[0-9A-Z]{5}$/.test(code), 'turned on: this computer shows its render code (' + code.replace(/-.*/, '-•••••') + ')');
  await page.waitForSelector('.cc-lan-list li button');
  // a wrong code first
  await page.click('.cc-lan-list li button');
  const wrong = code.slice(0, 3) + (code.slice(3) === 'AAAAA' ? 'BBBBB' : 'AAAAA');
  await page.fill('.cc-lan-ask input', wrong);
  await page.click('.cc-lan-ask button');
  await page.waitForFunction(() => /not the one/.test(document.querySelector('[data-compute-lan] [role=status]').textContent), null, { timeout: 15000 });
  ok(true, 'a wrong code: "That code is not the one … shows"');
  await page.click('.cc-lan-list li button');
  await page.fill('.cc-lan-ask input', code);
  await page.click('.cc-lan-ask button');
  await page.waitForFunction(() => /Connected to/.test(document.querySelector('[data-compute-lan] [role=status]').textContent), null, { timeout: 15000 });
  ok(true, 'the right code: connected (' + (await page.textContent('[data-compute-lan] [role=status]')) + ')');
  await page.locator('[data-compute-set]').screenshot({ path: path.join(OUT, '05-lan.png') });
  // the connected node renders a sample range of a scene; = the same samples rendered in this page
  const r = await page.evaluate(async () => {
    const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
    const abs = (re) => new URL(Object.entries(map).find(([k]) => re.test(k))[1], location.href).href;
    const MC = await import(abs(/\/dev\/compute-mc\.js/));
    const BM = await import(abs(/\/dev\/compute\/bench-make\.js/)), BS = await import(abs(/\/dev\/compute\/bench-scenes\.js/)), S = await import(abs(/\/dev\/compute\/bvh-scene\.js/));
    const R = await import(abs(/\/dev\/compute\/runtime\.js/)), CR = await import(abs(/\/dev\/compute\/cpu-render\.js/));
    const sc = BS.expandScene(BS.readBenchScene(BM.makeScenes().cornell));
    const bs = S.buildScene({ meshes: sc.meshes, instances: sc.instances.map((it) => ({ mesh: it.mesh, m: it.m })) });
    const b = S.sceneBuffers(bs), cam = sc.camera(1);
    const scene = { kernel: 'preview', buffers: { 'bvh.nodes': b.nodes, 'bvh.tris': b.tris, 'bvh.inst': b.inst, 'bvh.meta': b.meta }, params: { world: cam.world, proj: cam.proj } };
    const none = await MC.lanDevices({ W: 24, H: 24 });
    const devs = await MC.lanDevices({ W: 24, H: 24, scene });
    const remote = await devs[0].renderRange(0, 2);
    const pool = await R.pagePool();
    const local = CR.createCpuRender({ pool, kernel: { url: abs(/\/dev\/compute\/preview-kernel\.js/) }, W: 24, H: 24, tile: 32, params: scene.params });
    await local.share(scene.buffers);
    const here = await local.renderRange(0, 2);
    let same = remote.length === here.length;
    for (let i = 0; same && i < here.length; i++) if (remote[i] !== here[i]) same = false;
    return { none: none.length, devs: devs.length, id: devs[0]?.id, same };
  });
  ok(r.none === 0 && r.devs === 1 && /^lan:/.test(r.id), 'lanDevices(): no scene → none; with a scene → the connected node as a device (' + r.id + ')');
  ok(r.same, 'the node\'s samples 0–1 = the same samples rendered in this page, byte for byte (through the real handshake and frames)');
  await page.close();
}

ok(!errors.length, 'no console errors', errors.slice(0, 5).join(' | '));
await browser.close();
console.log('\n' + pass + ' passed, ' + fail + ' failed — shots in ' + path.relative(REPO, OUT));
process.exit(fail ? 1 : 0);
