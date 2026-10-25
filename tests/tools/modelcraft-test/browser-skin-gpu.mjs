#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-skin-gpu.mjs — skinning on the graphics card (0.7 AN.2, session `anim`) against the CPU path, in headless Chromium's
 * SwiftShader WebGPU (`--enable-unsafe-webgpu`: the CPU pretending to be a GPU; correctness only, tiny sizes, never a timing —
 * KICKOFF rules 14, 15). anim/skin-gpu.js and anim/rig.js skinPoints on the same bent tube, linear and dual quaternion: every
 * point within 1e-4 (float32 on the card, float64 in JS).
 *
 *   node tools/modelcraft-test/browser-skin-gpu.mjs
 * Run as root (ModelCraft's test admin; the signed-in state is browser-render's). No WebGPU adapter: says so and skips.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const STATE = path.join(REPO, 'tmp/render-browser-state.json');
const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--enable-unsafe-webgpu', '--use-webgpu-adapter=swiftshader', '--enable-unsafe-swiftshader'] });
let pass = 0, fail = 0;
const ok = (c, what, detail = '') => { if (c) { pass++; console.log('  ok    ' + what + (detail ? ' (' + detail + ')' : '')); } else { fail++; console.log('  FAIL  ' + what + (detail ? ' — ' + detail : '')); } };

async function signedIn() {
  if (fs.existsSync(STATE)) {
    const c = await browser.newContext({ storageState: STATE });
    const p = await c.newPage();
    const r = await p.goto(BASE + '/lab/modelcraft', { waitUntil: 'domcontentloaded' });
    const fine = r && r.status() === 200 && p.url().includes('/lab/modelcraft');
    await p.close();
    if (fine) return c;
    await c.close();
  }
  const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
  const c = await browser.newContext();
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

try {
  const ctx = await signedIn();
  const page = await ctx.newPage();
  await page.goto(BASE + '/lab/modelcraft', { waitUntil: 'networkidle' });
  console.log('\nAN.2 — skinning on the graphics card = the CPU path');
  const r = await page.evaluate(async () => {
    if (!navigator.gpu) return { skip: 'no navigator.gpu' };
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) return { skip: 'no adapter' };
    const device = await adapter.requestDevice();
    const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
    const find = (re) => import(new URL(Object.entries(map).find(([k]) => re.test(k))[1], location.href).href);
    const [MM, RG, W, SG, A] = await Promise.all([find(/\/modelcraft\/dev\/mesh\.js/), find(/\/modelcraft\/dev\/anim\/rig\.js/), find(/\/modelcraft\/dev\/anim\/weights\.js/), find(/\/modelcraft\/dev\/anim\/skin-gpu\.js/), find(/\/modelcraft\/dev\/render\/anim\.js/)]);
    const tube = new MM.Mesh(), ring = 12, rows = 17;
    for (let rr = 0; rr < rows; rr++) for (let k = 0; k < ring; k++) { const a = (k / ring) * Math.PI * 2; tube.addVertex(0.3 * Math.cos(a), 0.3 * Math.sin(a), rr * 0.25); }
    for (let rr = 0; rr < rows - 1; rr++) for (let k = 0; k < ring; k++) tube.addFace([rr * ring + k, rr * ring + (k + 1) % ring, (rr + 1) * ring + (k + 1) % ring, (rr + 1) * ring + k]);
    const rig = { id: 'r1', mode: 'lbs', bones: [
      { id: 'a', parent: '', head: [0, 0, 0], tail: [0, 0, 2], roll: 0, deform: true },
      { id: 'b', parent: 'a', head: [0, 0, 2], tail: [0, 0, 3], roll: 15, deform: true },
      { id: 'c', parent: 'b', head: [0, 0, 3], tail: [0, 0, 4], roll: 0, deform: true },
    ], pose: {} };
    W.writeWeights(tube, rig, W.autoWeights(tube, rig));
    const pk = RG.packWeights(tube, rig);
    const pose = { a: { rotation: [10, 0, 5] }, b: { rotation: [70, 20, 0], location: [0, 0.1, 0] }, c: { rotation: [-40, 0, 30], scale: [1, 1, 1] } };
    const M = RG.skinMatrixArray(rig, RG.poseMatrices(rig, (id) => pose[id]).skin);
    const gs = SG.createGpuSkinner(device);
    const rest = new Float32Array(tube.P.subarray(0, tube.nv * 3));
    const out = {};
    for (const mode of ['lbs', 'dqs']) {
      const cpu = RG.skinPoints(tube, pk, M, mode, Float64Array.from(rest));
      const gpu = await gs.skin({ rest, joints: pk.joints, weights: pk.weights, n: tube.nv, max: pk.max, M, mode });
      let worst = 0, moved = 0;
      for (let i = 0; i < cpu.length; i++) { worst = Math.max(worst, Math.abs(cpu[i] - gpu[i])); moved = Math.max(moved, Math.abs(cpu[i] - rest[i])); }
      out[mode] = { worst, moved };
    }
    gs.dispose();
    void A;
    return { n: tube.nv, adapter: (adapter.info && (adapter.info.description || adapter.info.vendor)) || 'webgpu', ...out };
  });
  if (r.skip) { console.log('  skip  ' + r.skip + ' (WebGPU is not offered here)'); }
  else {
    ok(r.lbs.moved > 0.5 && r.lbs.worst < 1e-4, `linear blend on the card = the CPU path for ${r.n} points (worst ${r.lbs.worst.toExponential(2)})`, r.adapter);
    ok(r.dqs.moved > 0.5 && r.dqs.worst < 1e-4, `dual quaternion on the card = the CPU path (worst ${r.dqs.worst.toExponential(2)})`);
  }
} catch (e) {
  fail++;
  console.log('  FAIL  ' + (e && e.stack || e));
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
