#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-gltf.mjs — glTF 2.0 in ModelCraft (0.7 XF.1, session `interchange`), headless Chromium at /lab/modelcraft.
 *   node tools/modelcraft-test/browser-gltf.mjs [--out <dir>]
 * Run as root (ModelCraft's test admin through tools/modelcraft-test/admin.php; session shared in tmp/skp-browser-state.json).
 * Drops a Draco .gltf with its .bin and texture (the Draco decoder must be fetched only then), a meshopt .gltf with its
 * .bin, picks a .glb with five lamps through Import, exports the model as .glb from the Export menu and runs the Khronos
 * validator on the download (/var/www/CADCRAFT/oracles/gltf; test-only). Sample models from
 * testfiles/gltf-corpus/sample-assets (outside git; skipped when missing). Screenshot tmp/shots/gltf/. Fails on any
 * console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/gltf')));
const DL = path.join(REPO, 'tmp/modelcraft-test');
const STATE = path.join(REPO, 'tmp/skp-browser-state.json');
const CORPUS = '/var/www/CADCRAFT/testfiles/gltf-corpus/sample-assets';
fs.mkdirSync(OUT, { recursive: true }); fs.mkdirSync(DL, { recursive: true });
if (!fs.existsSync(CORPUS)) { console.log('glTF sample corpus not found — nothing to do.'); process.exit(0); }

let pass = 0, fail = 0;
const ok = (c, m, d) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

const req = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'));
const { chromium } = req('playwright-core');
const validator = createRequire(import.meta.url)('/var/www/CADCRAFT/oracles/gltf/node_modules/gltf-validator');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function signedInContext(opts) {
  if (fs.existsSync(STATE)) {
    const c = await browser.newContext({ ...opts, storageState: STATE, acceptDownloads: true });
    const p = await c.newPage();
    const r = await p.goto(BASE + '/lab/modelcraft', { waitUntil: 'domcontentloaded' });
    const okLab = r && r.status() === 200 && p.url().includes('/lab/modelcraft');
    await p.close();
    if (okLab) return c;
    await c.close();
  }
  const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
  const c = await browser.newContext({ ...opts, acceptDownloads: true });
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

/** Drop files (paths) on the stage as one drop. */
const drop = (page, files) => page.evaluate(async (list) => {
  const dt = new DataTransfer();
  for (const { name, b64 } of list) dt.items.add(new File([Uint8Array.from(atob(b64), (c) => c.charCodeAt(0))], name));
  const stage = window.modelcraft.ui.stage;
  stage.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true }));
  stage.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true }));
}, files.map((f) => ({ name: path.basename(f), b64: fs.readFileSync(f).toString('base64') })));
const state = (page) => page.evaluate(() => {
  const m = window.modelcraft.model;
  const meshes = [...m.defs.values()].filter((d) => d.mesh);
  return { msg: window.modelcraft.ui.msg.textContent, meshes: meshes.length, faces: meshes.reduce((n, d) => n + d.mesh.faceCount, 0), images: m.images.size, lights: m.lights.size, scenes: m.scenes.length, top: m.root.insts.size };
});
const waitMsg = (page, re) => page.waitForFunction((src) => new RegExp(src).test(window.modelcraft.ui.msg.textContent), re.source, { timeout: 120000 });

const problems = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1400, height: 900 }, locale: 'en-US' });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('page: ' + e.message));
  const fetched = [];
  page.on('request', (r) => fetched.push(r.url()));
  await page.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.modelcraft && window.modelcraft.model);
  ok(!fetched.some((u) => /\/vendor\/(draco|meshoptimizer)\//.test(u)), 'the decoders are not fetched with the page');

  // 1. Draco .gltf + its .bin + its texture, dropped together
  const duck = path.join(CORPUS, 'Duck/glTF-Draco');
  await drop(page, ['Duck.gltf', 'Duck.bin', 'DuckCM.png'].map((f) => path.join(duck, f)).filter((f) => fs.existsSync(f)).concat(fs.readdirSync(duck).filter((f) => /\.(bin|png)$/.test(f) && !['Duck.bin', 'DuckCM.png'].includes(f)).map((f) => path.join(duck, f))));
  await waitMsg(page, /Duck\.gltf/);
  let s = await state(page);
  ok(s.meshes === 1 && s.faces === 4212 && s.images === 1 && s.scenes === 1, 'a Draco glTF dropped with its files: 4,212 faces, its texture, its camera as a scene', JSON.stringify(s));
  ok(fetched.some((u) => /\/vendor\/draco\/[^/]+\/draco_wasm_wrapper_gltf\.js/.test(u)) && fetched.some((u) => /draco_decoder_gltf\.wasm/.test(u)), 'the Draco decoder is fetched for it (pinned folder)');
  await page.screenshot({ path: path.join(OUT, '01-duck-draco.png') });

  // 2. meshopt .gltf + .bin
  const bs = path.join(CORPUS, 'BrainStem/glTF-Meshopt');
  if (fs.existsSync(bs)) {
    await drop(page, fs.readdirSync(bs).map((f) => path.join(bs, f)));
    await waitMsg(page, /BrainStem\.gltf/);
    s = await state(page);
    ok(s.meshes === 2 && s.faces === 4212 + 61666, 'a meshopt glTF (quantized, filters) dropped with its .bin: 61,666 more faces', JSON.stringify(s));
    ok(fetched.some((u) => /\/vendor\/meshoptimizer\/[^/]+\/meshopt_decoder\.mjs/.test(u)), 'the meshopt decoder is fetched for it');
  }
  // 3. a .gltf without its .bin says what it needs
  await drop(page, [path.join(CORPUS, 'Box/glTF/Box.gltf')]);
  await waitMsg(page, /Box0\.bin/);
  ok(/needs "Box0\.bin"/.test((await state(page)).msg), 'a .gltf dropped alone names the file it needs');

  // 4. a .glb with lamps through Import
  await page.setInputFiles('[data-file-import]', path.join(CORPUS, 'LightsPunctualLamp/glTF-Binary/LightsPunctualLamp.glb'));
  await waitMsg(page, /LightsPunctualLamp\.glb/);
  s = await state(page);
  ok(s.lights === 5 && /5 lamps added/.test(s.msg), 'a .glb with five punctual lights → five lamps, said in the message', s.msg);
  ok(/Materials come in as their base colour/.test(s.msg), 'the message says what of the materials is kept', s.msg);
  await page.screenshot({ path: path.join(OUT, '02-lamp.png') });

  // 5. Export › glTF, then the validator
  await page.click('[data-export-menu] > summary');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-export="glb"]')]);
  const file = path.join(DL, 'gltf-export.glb');
  await dl.saveAs(file);
  const v = await validator.validateBytes(new Uint8Array(fs.readFileSync(file)), { maxIssues: 10 });
  const j = JSON.parse(new TextDecoder().decode(fs.readFileSync(file).subarray(20, 20 + fs.readFileSync(file).readUInt32LE(12))));
  ok(!v.issues.numErrors, 'the exported .glb has no validator errors (' + v.issues.numWarnings + ' warnings)', JSON.stringify(v.issues.messages.slice(0, 3)));
  ok(j.extensions?.KHR_lights_punctual?.lights?.length === 5 && j.cameras?.length === 1 && j.images?.length >= 2, 'it carries the lamps, the camera and the textures', JSON.stringify({ l: j.extensions?.KHR_lights_punctual?.lights?.length, c: j.cameras?.length, i: j.images?.length }));
  // 6. undo takes the last import back in one step
  await page.keyboard.press('Control+z');
  s = await state(page);
  ok(s.lights === 0, 'one undo takes the lamp model and its lamps back', JSON.stringify(s));
  await page.close();
  await ctx.close();
} catch (err) {
  problems.push('run: ' + (err.stack || err.message));
} finally {
  await browser.close();
}
ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
