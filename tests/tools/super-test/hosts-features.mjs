// SPDX-License-Identifier: Apache-2.0
// 0.11 W3.4 (super-hosts-11): the feature host in the real page: the sections under Properties, the add-on list, model takeoff on a real IFC
// (fixtures/bimcraft/small-house.ifc), the layout list; then the same at a phone and a tablet width (Compact view).   nice node tools/super-test/hosts-features.mjs
import path from 'node:path';
import { start, launch, ROOT } from './serve.mjs';
const HOUSE = path.join(ROOT, 'fixtures/bimcraft/small-house.ifc');
const { url, close } = await start({ langs: [''] });
const browser = await launch();
let pass = 0, fail = 0; const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 300)); } };
const page = await (await browser.newContext({ viewport: { width: 1500, height: 1000 } })).newPage();
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
try {
  await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  await page.waitForTimeout(3000);
  const ids = await page.evaluate(() => [...document.querySelectorAll('[data-sc-feature]')].map((s) => s.dataset.scFeature));
  ok(['addons', 'takeoff', 'quantscope', 'layouts'].every((i) => ids.includes(i)), 'four feature sections under Properties (QuantScope since CE.12): ' + ids.join(','), ids);
  ok(await page.evaluate(() => !!document.querySelector('[data-sc-feature="addons"]').closest('[data-sc-addons]')), 'they sit in the add-on aside');
  ok((await page.evaluate(() => window.superWindow.features.list().every((f) => !f.built))), 'nothing built until opened');
  // add-ons
  await page.evaluate(() => window.superWindow.features.open('addons'));
  await page.waitForSelector('[data-sc-addon-toggle]', { timeout: 20000 });
  const n = await page.locator('[data-sc-addon-toggle]').count();
  ok(n >= 20, 'the add-on list has rows: ' + n, n);
  const first = await page.evaluate(() => { const b = document.querySelector('[data-sc-addon-toggle]'); return { id: b.dataset.scAddonToggle, on: b.checked }; });
  await page.locator('[data-sc-addon-toggle]').first().evaluate((b) => b.click());
  await page.waitForFunction(([id, on]) => window.superWindow.addons.find(id).on !== on, [first.id, first.on], { timeout: 20000 });
  ok(true, 'a switch in the list reaches the loader: ' + first.id);
  await page.evaluate((id) => window.superWindow.addons.setEnabled(id, false), first.id).catch(() => {});
  // model takeoff
  await page.evaluate(() => window.superWindow.features.open('takeoff'));
  await page.waitForSelector('[data-sc-model-file]');
  await page.setInputFiles('[data-sc-model-file]', HOUSE);
  await page.waitForSelector('[data-sc-model-stage] .mt-panel', { timeout: 120000 });
  const rows = await page.evaluate(() => document.querySelectorAll('[data-sc-model-stage] .mt-panel tbody tr').length);
  ok(rows > 3, 'the takeoff panel shows the house\'s rows: ' + rows, rows);
  ok(await page.evaluate(() => !!window.superWindow.features.body('takeoff').querySelector('canvas')), 'the 3D picture is drawn');
  const dl = page.waitForEvent('download', { timeout: 15000 }).catch(() => null);
  const csvBtn = page.locator('[data-sc-model-stage] button', { hasText: /csv/i }).first();
  if (await csvBtn.count()) { await csvBtn.click(); const d = await dl; ok(!!d && /\.csv$/i.test(d.suggestedFilename()), 'the CSV is a real download', d && d.suggestedFilename()); } else ok(false, 'a CSV button');
  // layouts
  await page.evaluate(() => window.superWindow.features.open('layouts'));
  const lay = await page.evaluate(() => [...document.querySelectorAll('[data-sc-layout]')].map((l) => l.dataset.scLayout));
  ok(lay.length >= 1, 'the layout list: ' + lay.join(','), lay);
  ok(lay.length === 12, 'the manifest lists every layout (12): ' + lay.length, lay);
  const held = [];
  for (const key of lay.filter((k) => k !== 'docked')) {
    await page.evaluate((k) => window.ccShellWorkspace.set(k), key);
    await page.waitForFunction((k) => window.ccWorkspaceEngine.inspect().layout === k, key, { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(500);
    const r = await page.evaluate(() => ({ cur: window.ccWorkspaceEngine.inspect().layout, conn: window.superWindow.features.section('layouts').isConnected }));
    ok(r.cur === key, 'layout ' + key + ' switches in place (in use: ' + r.cur + ')');
    if (r.conn) held.push(key);
  }
  console.log('layouts whose Properties palette holds the add-on and feature sections: ' + held.join(', '));
  ok(held.length >= 3, 'the sections follow Properties into the layouts that have that palette', held);
  await page.evaluate(() => window.ccShellWorkspace.set('docked')); await page.waitForTimeout(1200);
  ok(await page.evaluate(() => window.superWindow.features.section('layouts').isConnected), 'back in the first layout the sections are there');
  // phone and tablet: no horizontal page scroll, the sections still there
  for (const [name, w, h] of [['phone', 390, 800], ['tablet', 820, 1100]]) {
    await page.setViewportSize({ width: w, height: h }); await page.waitForTimeout(1200);
    const r = await page.evaluate(() => ({ sx: document.documentElement.scrollWidth - document.documentElement.clientWidth, secs: document.querySelectorAll('[data-sc-feature]').length, compact: document.body.className.match(/compact[a-z-]*/g) }));
    ok(r.sx <= 2 && r.secs === 4, name + ': no sideways scroll, sections kept', r);
  }
  ok(!errs.length, 'no page error', errs.slice(0, 3));
} catch (e) { fail++; console.log('FAIL', String(e.message).slice(0, 400)); }
await browser.close(); close();
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
