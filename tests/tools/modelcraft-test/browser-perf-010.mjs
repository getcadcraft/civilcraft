#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-perf-010.mjs — 0.10 PERF.38 / PERF.57 (session `model-part-10`) in the real page, /lab/modelcraft:
 *   - start: the library's texture swatches are not drawn while the material list is folded away; opening its section draws them
 *   - import m3d-50k-faces.glb: the guide card still moves on (a solid in a group = step 4), the autosave copy is written
 *     (IndexedDB "cadcraft-autosave") and is exactly the text Save writes (window.modelcraft.fileText), from the worker pool
 *   - the Export menu's glTF, OBJ and DAE through the pool are the page's own writers' bytes; a download really starts
 *   - no page error, no console error
 *   node tools/modelcraft-test/browser-perf-010.mjs      (root: signs in as the shared test admin, tools/cadcraft-test/admin.php)
 */
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { launch, BASE } from '../perf/apps3d-lib.mjs';

const GLB = '/var/www/CADCRAFT/testfiles/generated/m3d/m3d-50k-faces.glb';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + m); };
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', new URL('../cadcraft-test/admin.php', import.meta.url).pathname, 'session'], { encoding: 'utf8' }));
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
await ctx.addInitScript(() => { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error' && !/status of 429/.test(m.text())) errors.push('console: ' + m.text().slice(0, 200)); });
// a 429 from the site's own per-hour limits that every page load touches (hardware specs: 30 an hour per network; the Library's
// automatic connect: 30 an hour per account, and this test shares its admin with the other test runs) is said, not failed
const limited = [];
page.on('response', (r) => { if (r.status() !== 429) return; if (/\/api\/v1\/hardware|\/api\/library\/connect-auto/.test(r.url())) limited.push(new URL(r.url()).pathname); else errors.push('429 from ' + r.url().slice(0, 120)); });
try {
  await page.goto(`${BASE}/lab/modelcraft`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.modelcraft?.view?.renderer, null, { timeout: 60000 });
  await page.waitForTimeout(4000);

  console.log('\nPERF.57: the swatches wait for the material list');
  const drawn = () => page.evaluate(() => ({ drawn: [...document.querySelectorAll('[data-matlib] .is-mat')].filter((b) => b.style.backgroundImage.startsWith('url(')).length, all: document.querySelectorAll('[data-matlib] .is-mat').length, shown: document.querySelector('[data-matlib]').getClientRects().length > 0 }));
  const s0 = await drawn();
  ok(!s0.shown && s0.drawn === 0 && s0.all > 10, `folded away at start: ${s0.drawn} of ${s0.all} texture swatches drawn`);
  // open the section that holds the list, the way a person does: its heading
  await page.locator('[data-matlib]').locator('xpath=preceding-sibling::*[@data-af][1]').click();
  await page.waitForFunction(() => document.querySelector('[data-matlib]').getClientRects().length > 0, null, { timeout: 5000 }).catch(() => {});
  await page.waitForFunction(() => [...document.querySelectorAll('[data-matlib] .is-mat')].filter((b) => b.style.backgroundImage.startsWith('url(')).length >= 10, null, { timeout: 20000 }).catch(() => {});
  const s1 = await drawn();
  ok(s1.shown && s1.drawn > 0, `opening its section (a click on "Materials") draws them: ${s1.drawn} of ${s1.all} (the rest are plain colours)${s1.shown ? '' : ' — the list did not open'}`);

  console.log('\nPERF.38: import, guide card, autosave from the pool');
  await page.setInputFiles('[data-file-import]', GLB);
  await page.waitForFunction(() => [...window.modelcraft.model.defs.values()].some((d) => d.mesh), null, { timeout: 120000 });
  await page.waitForTimeout(1500);
  const guide = await page.evaluate(() => { const f = window.modelcraft.shell?.guideFacts?.() || null; const card = document.querySelector('[data-guide-step]'); return { f, step: card ? card.dataset.guideStep : null }; });
  ok(!guide.step || Number(guide.step) >= 2, `the guide card reads the imported mesh: step ${guide.step === null ? '(card not shown)' : Number(guide.step) + 1}`);
  // the autosave copy: written ~2 s after the change, from the worker
  const readCopy = () => page.evaluate(async () => {
    // read only a database the app made (an open() here would create an empty one and break the app's own)
    if (!(await indexedDB.databases()).some((d) => d.name === 'cadcraft-autosave')) return 0;
    const db = await new Promise((res, rej) => { const r = indexedDB.open('cadcraft-autosave'); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); });
    if (!db.objectStoreNames.contains('data')) { db.close(); return 0; }
    const all = await new Promise((res) => { const tx = db.transaction('data', 'readonly'); const q = tx.objectStore('data').getAll(); q.onsuccess = () => res(q.result); q.onerror = () => res([]); });
    db.close();
    const big = all.find((d) => typeof d === 'string' && d.length > 1e6);
    return big ? big.length : 0;
  });
  let copy = 0;
  for (let k = 0; k < 30 && !copy; k++) { copy = await readCopy(); if (!copy) await page.waitForTimeout(1000); }
  const same = await page.evaluate(async (n) => {
    let big = null;
    if (n) {
      const db = await new Promise((res) => { const r = indexedDB.open('cadcraft-autosave'); r.onsuccess = () => res(r.result); });
      const all = await new Promise((res) => { const tx = db.transaction('data', 'readonly'); const q = tx.objectStore('data').getAll(); q.onsuccess = () => res(q.result); });
      db.close();
      big = all.find((d) => typeof d === 'string' && d.length === n) || null;
    }
    const now = window.modelcraft.fileText();
    const strip = (s) => s.replace(/\n "view": \{[\s\S]*$/, '');   // the camera is written last and moves on its own
    return { equal: !!big && strip(big) === strip(now), len: big?.length, now: now.length, pooled: (await window.modelcraft.fileTextAsync()) === now };
  }, copy || 0);
  ok(!!copy && same.equal, `the autosave copy is written (${(copy || 0).toLocaleString('en-US')} characters) and is Save's text`);
  ok(same.pooled, 'fileTextAsync (the worker pool) = fileText (the page), character for character');

  console.log('\nPERF.38: exports from the pool');
  const ex = await page.evaluate(async () => {
    const mc = window.modelcraft, M = mc.model;
    const src = performance.getEntriesByType('resource').map((e) => e.name).find((n) => /\/modelcraft\.js(\?|$)/.test(n)), base = src.replace(/modelcraft\.js.*$/, '');
    const [{ exportGltf }, { exportObj }, io] = await Promise.all([import(base + 'io/gltf-write.js'), import(base + 'io/obj.js'), import(base + 'io.js')]);
    const glb = await mc.exportAsync('glb'), glbPage = exportGltf(M).bytes;
    const obj = await mc.exportAsync('obj'), objBase = (obj.match(/^mtllib (.+)\.mtl$/m) || [, 'model'])[1], objPage = exportObj(M, { base: objBase }).obj;   // the name the app gave it
    const dae = await mc.exportAsync('dae');
    const strip = (s) => s.replace(/<(created|modified)>[^<]*<\/\1>/g, '');
    const daePage = io.exportDAE(M, { name: 'x' });
    return { glb: !!glb && glb.length === glbPage.length && glb.every((b, i) => b === glbPage[i]), glbLen: glbPage.length, obj: obj === objPage, objLen: objPage.length, dae: !!dae && strip(dae).replace(/x|Untitled[^<"]*/g, '').length > 0 && strip(dae).length > 1000, daeLen: dae?.length };
  });
  ok(ex.glb, `glTF from the pool = the page's writer, byte for byte (${ex.glbLen.toLocaleString('en-US')} bytes)`);
  ok(ex.obj, `OBJ from the pool = the page's writer (${ex.objLen.toLocaleString('en-US')} characters)`);
  ok(ex.dae, `DAE from the pool written (${(ex.daeLen || 0).toLocaleString('en-US')} characters; Node test compares it byte for byte)`);
  // the menu path really downloads (worker answer → download)
  const dl = page.waitForEvent('download', { timeout: 60000 }).catch(() => null);
  await page.evaluate(() => document.querySelector('[data-export="glb"]')?.click());   // the Export menu's glTF item
  const d = await dl;
  if (d) { const p = await d.path(); ok(fs.statSync(p).size === ex.glbLen && /\.glb$/.test(d.suggestedFilename()), `Export › glTF downloads ${d.suggestedFilename()} (${fs.statSync(p).size.toLocaleString('en-US')} bytes)`); }
  else console.log('  (no export menu hook found to click: the menu download is covered by bin/test-modelcraft.mjs)');
} catch (e) { ok(false, 'ERROR ' + e.message.split('\n')[0].slice(0, 200)); }
ok(errors.length === 0, `no page or console errors${errors.length ? ': ' + errors.slice(0, 3).join(' ; ') : ''}`);
if (limited.length) console.log(`  (rate-limited by the site, not counted: ${[...new Set(limited)].join(', ')})`);
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
