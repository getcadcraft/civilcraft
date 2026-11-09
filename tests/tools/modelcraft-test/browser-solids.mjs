#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-solids.mjs — 0.9 DC.54 (session nurbs-09) in ModelCraft's real page, headless Chromium at /lab/modelcraft (rule 49): the Surfaces
 * panel's Solids group — Box solid and Cylinder solid from typed sizes (mm), Subtract picked by one of the box's faces (what a click in the
 * view hands the session: display.pick → { id }) and from the Solids list (ModelCraft's own manifold-3d, loaded on the first Boolean), the measured result line, the panel's Undo; "Add to the model"
 * makes the solid one closed group of the model (ModelCraft's own solid check agrees, one model undo step); STEP and IGES out carry the
 * result's trimmed faces; the patch set keeps the solid in the file data. No console errors.
 *   node tools/modelcraft-test/browser-solids.mjs [--out <dir>]      (root; as browser-trim.mjs)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/solids')));
fs.mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function signedInContext(opts) {
  // a minted staff session (as tools/problems-test/*): sign-in by password races other sessions' test runs on the shared test admin
  const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
  const c = await browser.newContext(opts);
  await c.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  return c;
}

const modUrl = (page, re) => page.evaluate((src) => { const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports; return Object.entries(map).find(([k]) => new RegExp(src).test(k))?.[1] || null; }, re.source);
const problems = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1600, height: 1000 }, locale: 'en-US', ignoreHTTPSErrors: true, serviceWorkers: 'block', acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_|status of 429/i.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.addInitScript(() => { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; });
  await page.goto(BASE + '/lab/modelcraft?space=model', { waitUntil: 'load' });
  await page.waitForFunction(() => window.modelcraft?.model, null, { timeout: 60000 });
  if (await page.evaluate(() => document.querySelector('[data-nurbs]').classList.contains('af-collapsed'))) await page.click('#mc-nurbs-h');   // the right panel folds its sections (0.9; nurbs-s3-09)
  await page.evaluate(() => document.querySelector('[data-nurbs-open]').scrollIntoView());
  await page.click('[data-nurbs-open]');
  await page.waitForSelector('[data-nurbs-panel]');
  const S = () => page.evaluate(() => { const s = window.modelcraft.surfaces.session; return { solids: (s.doc.solids || []).map((b) => ({ id: b.id, n: b.faces.length })), trims: s.doc.items.filter((i) => i.trim).length }; });
  const opt = async (name, v) => { await page.fill(`[data-nurbs-opt="${name}"]`, v); await page.dispatchEvent(`[data-nurbs-opt="${name}"]`, 'change'); };
  const note = () => page.evaluate(() => [...document.querySelectorAll('[data-nurbs-panel] .nui-note[aria-live]')].map((e) => e.textContent).join(' '));

  console.log('== the Solids group');
  const names = await page.$$eval('[data-nurbs-start^="solid."]', (b) => b.map((x) => x.dataset.nurbsStart));
  ok(names.length === 10, 'the panel has the Solids group: ' + names.join(', '));   // 10 since 0.9 SU.747c (nurbs-s3-09): + Fillet between faces, Fillet several edges, Thicken into a solid
  await page.click('[data-nurbs-start="solid.box"]');
  await opt('size', '1000, 600, 400');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid="b1"]');
  ok(/Volume 240000000 mm³/.test(await note()), 'Box solid (1 m × 0.6 m × 0.4 m): made, volume measured — ' + (await note()).slice(0, 110));
  await page.click('[data-nurbs-start="solid.cylinder"]');
  await opt('base', '500, 300, -100'); await opt('radius', '150'); await opt('height', '600');
  await page.click('[data-nurbs-run]');
  await page.waitForSelector('[data-nurbs-solid="b2"]');
  const meshes = await page.evaluate(() => [...window.modelcraft.surfaces.display.cache.values()].filter((c) => c.obj.isMesh).length);
  ok(meshes === 9, 'the nine faces are drawn (box 6, cylinder 3): ' + meshes);

  console.log('== Subtract: the box picked by one of its faces, the cylinder from the list');
  await page.click('[data-nurbs-start="solid.subtract"]');
  ok((await page.getAttribute('[data-nurbs-need]', 'data-nurbs-need')) === 'solid', 'Subtract asks for a solid');
  const picked = await page.evaluate(() => window.modelcraft.surfaces.session.pick({ id: 's2' }));   // what a click on face s2 hands the session (display.pick → { id })
  ok(picked && (await page.evaluate(() => window.modelcraft.surfaces.session.picks[0]?.id)) === 'b1', 'a face of the box picks the box');
  await page.evaluate(() => window.modelcraft.surfaces.refresh());
  await page.click('[data-nurbs-pick="b2"]');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => /Subtract: done/.test([...document.querySelectorAll('[data-nurbs-panel] .nui-note')].map((e) => e.textContent).join(' ')), null, { timeout: 30000 });
  const line = await note();
  const vol = Number((line.match(/volume ([\d.]+) mm³/) || [])[1]), want = 1000 * 600 * 400 - Math.PI * 150 * 150 * 400;
  ok(/7 faces/.test(line) && Math.abs(vol - want) / want < 5e-4 && /close again/.test(line), 'Subtract: 7 faces, volume ' + vol + ' vs ' + want.toFixed(0) + ', the faces close again — ' + line.slice(0, 240));
  const st = await S();
  ok(st.solids.length === 1 && st.solids[0].n === 7 && st.trims === 3, 'one solid of 7 faces, three of them with new trims');
  await page.screenshot({ path: path.join(OUT, '1-subtract.png') });
  await page.click('[data-nurbs-undo]');
  ok((await S()).solids.length === 2, 'the panel Undo brings the box and the cylinder back');
  await page.click('[data-nurbs-redo]');
  const sid = (await S()).solids[0].id;

  console.log('== Add to the model');
  const solidsUrl = await modUrl(page, /\/modelcraft\/dev\/solids\.js/), modelUrl = await modUrl(page, /\/modelcraft\/dev\/model\.js/);
  const count = () => page.evaluate(() => window.modelcraft.model.root.insts.size);
  const n0 = await count();
  await page.click(`[data-nurbs-bake="${sid}"]`);
  await page.waitForFunction((n) => window.modelcraft.model.root.insts.size === n + 1, n0, { timeout: 15000 });
  const g = await page.evaluate(async ([su, mu]) => {
    const L = await import(su), Mo = await import(mu), m = window.modelcraft.model;
    const iid = [...m.root.insts.keys()].at(-1), def = m.def(m.root.insts.get(iid).def), info = Mo.solidInfo(def);
    return { solid: L.isSolid(m, m.root, iid), closed: info.closed, volume: Math.abs(info.volume), name: def.name };
  }, [solidsUrl, modelUrl]);
  ok(g.solid && g.closed && Math.abs(g.volume * 1e9 - vol) / vol < 1e-3, 'Add to the model: one closed group (ModelCraft\'s own solid check), volume ' + (g.volume * 1e9).toFixed(0) + ' mm³ — ' + JSON.stringify(g));
  ok(/is in the model as a closed group/.test(await page.evaluate(() => document.body.textContent)), 'the status line says what was added');
  await page.evaluate(() => window.modelcraft.model.undo());
  ok((await count()) === n0, 'one model Undo takes the group back');

  console.log('== STEP and IGES out, the file data');
  const [stp] = await Promise.all([page.waitForEvent('download'), page.click('[data-nurbs-export="step"]')]);
  const stText = fs.readFileSync(await stp.path(), 'utf8');
  const nf = (stText.match(/ADVANCED_FACE\(/g) || []).length, nh = (stText.match(/=FACE_BOUND\(/g) || []).length;
  ok(nf === 7 && nh === 2, 'STEP: the 7 faces; the two round holes as inner bounds (the wall\'s trim is its outer bound): ' + nf + ' faces, ' + nh + ' holes');
  const [ig] = await Promise.all([page.waitForEvent('download'), page.click('[data-nurbs-export="iges"]')]);
  const igText = fs.readFileSync(await ig.path(), 'utf8');
  // a solid is ONE manifold solid B-rep in IGES since nurbs-s3-09 (186 over a closed shell of 7 faces, the 2 holes inside their loops), no loose trimmed faces
  ok((igText.match(/^ {5}186 /mg) || []).length === 2 && (igText.match(/^ {5}510 /mg) || []).length === 14 && !/^ {5}144 /m.test(igText), 'IGES: the solid as one entity 186 over 7 faces (510), no loose trimmed faces');
  const kept = await page.evaluate(() => { const j = JSON.parse(window.modelcraft.surfaces.session.N.doc.toJSON(window.modelcraft.surfaces.session.doc)); return (j.solids || []).length; });
  ok(kept === 1, 'the patch set saved with the file carries the solid');
} catch (e) {
  fail++; console.log('  FAIL threw: ' + (e && e.stack || e));
} finally {
  for (const p of problems) { fail++; console.log('  FAIL ' + p); }
  await browser.close();
  console.log((fail ? 'FAILED' : 'ok') + ' — ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
