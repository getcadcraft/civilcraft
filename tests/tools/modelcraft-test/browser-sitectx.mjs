#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sitectx.mjs (modelcraft) — CivilCraft's site file as suggestions in ModelCraft (0.8 EG.63, part-model_PART_4), in the lab with real clicks.
 *   node tools/modelcraft-test/browser-sitectx.mjs
 * Run as root. A made-up .ccsite.json is dropped on the page the way the host hands a file; the dialog lists the buildings and parcel with a checkbox each;
 * nothing changes until "Add the ticked ones"; then one component of masses and one site line appear, in ONE undo step.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'mcsitectx'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const sq = (lon, lat, d = 0.0002) => [[lon, lat], [lon + d, lat], [lon + d, lat + d], [lon, lat + d], [lon, lat]];
try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto(BASE + '/lab/modelcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.modelcraft?.model);
  const defs0 = await page.evaluate(() => window.modelcraft.model.defs.size);
  const file = await page.evaluate(async (rings) => {
    const base = [...document.scripts].map((s) => s.src).find((u) => /modelcraft\.js/.test(u)); const C = await import(new URL('site-context.js', base).href);
    return JSON.stringify(C.buildContext({ origin: { lat: 48, lon: 9 }, radius: 150, attribution: ['made up for the test'], items: [{ kind: 'building', rings: [rings.a], height: 12, name: 'A' }, { kind: 'building', rings: [rings.b], name: 'B' }, { kind: 'parcel', rings: [rings.p], name: 'APN 1' }, { kind: 'flood', rings: [rings.p], label: 'AE' }] }));
  }, { a: sq(9.0003, 48.0003), b: sq(9.0007, 48.0003), p: sq(9.0001, 48.0001, 0.001) });
  // hand it over the way a drop or handoff does: through the host's open-files path
  await page.evaluate(async (text) => { const dt = new DataTransfer(); dt.items.add(new File([text], 'x.ccsite.json', { type: 'application/json' })); const st = window.modelcraft.ui.stage; st.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true, cancelable: true })); }, file);
  await page.waitForSelector('[data-sitectx-dialog][open]', { timeout: 20000 }).catch(() => {});
  ok(await page.$('[data-sitectx-dialog][open]') !== null, 'dropping a .ccsite.json opens the site dialog (not opened as a model)');
  ok((await page.$$('[data-sitectx-item]')).length === 3, 'two buildings and the parcel, a checkbox each');
  ok(/AE/.test(await page.textContent('[data-sitectx-dialog]')), 'the flood zone is listed as information');
  ok(await page.evaluate(() => window.modelcraft.model.defs.size) === defs0, 'nothing is added before the button');
  await page.fill('[data-sitectx-height]', '9'); await page.dispatchEvent('[data-sitectx-height]', 'change');
  ok(/9 m/.test(await page.textContent('[data-sitectx-dialog]')), 'the typed height shows on the building with none given');
  const undo0 = await page.evaluate(() => window.modelcraft.model.undoStack.length);
  await page.click('[data-sitectx-add]');
  const r = await page.evaluate(() => { const m = window.modelcraft.model; const comps = [...m.defs.values()].filter((d) => d.starter && d.starter.startsWith('site:')); const b = comps.find((d) => d.starter === 'site:buildings'); return { n: comps.length, faces: b ? b.faces.size : 0, undo: m.undoStack.length }; });
  ok(r.n === 2, 'a masses component and a site line component were made');
  ok(r.faces >= 10, 'two extruded masses: ' + r.faces + ' faces');
  ok(r.undo === undo0 + 1, 'all of it is one undo step');
  // 0.8 EG.63: the accepted site rides in the saved file (an optional `site` key), with its point and outlines, no new fetch
  const kept = await page.evaluate(() => window.modelcraft.file().site);
  ok(kept && kept.v === 1 && Math.abs(kept.origin.lat - 48) < 1e-9 && kept.items.length >= 3 && kept.attribution.length === 1, 'the saved model file carries the site (outlines, point, attribution)', kept && Object.keys(kept));
  await page.keyboard.press('Control+z');
  ok(await page.evaluate(() => [...window.modelcraft.model.defs.values()].filter((d) => d.starter?.startsWith('site:')).length) === 0, 'undo takes it all back');
  // AL.6 / EG.77 seams: saving still works with the add-on record, the undo reporter answers a probe after a step
  const rep = await page.evaluate(() => { const f = window.modelcraft.file(); const r = window.ccUndoReporter; return { saved: !!f && !!f.defs || !!f, probe: r ? r.onMessage('undo.probe', {}) : null }; });
  ok(rep.saved, 'saving a model works with the add-on record seam');
  ok(rep.probe && typeof rep.probe.depth === 'number', 'the undo reporter answers Studio\'s probe');
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems[0] : ''));
} catch (e) { fail++; console.log('  FAIL ' + e.message); } finally { await browser.close(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
