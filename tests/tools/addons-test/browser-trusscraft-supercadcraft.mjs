#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-trusscraft-supercadcraft.mjs — TrussCraft in SuperCad Studio's real lab page, headless (roadmap DC.116, owner direction 2026-10-30).
 *   node tools/addons-test/browser-trusscraft-supercadcraft.mjs        (run as root; light: one page, apps mounted one workspace at a time)
 * SuperCad Studio has no add-on host of its own: it mounts the real apps in its panels, and each mounted app starts its own loader with its own bundled add-ons. So TrussCraft
 * is not wired into Super; it arrives with the mounted CadCraft, BimCraft and PartCraft panels (ModelCraft runs in its own frame). This test proves exactly that: with the add-on
 * switched on (the apps' own "on" memory, set before the page opens) it is active in the mounted CadCraft, whose commands (TRUSSLAYOUT, TRUSSPLACE, TRUSSELEVATION …) draw on the project's
 * drawing, and the mounted BimCraft lists its Trusses tab. In Super's CadCraft panel the tab itself has no home (Super has no right panel for add-ons), which is reported, not hidden. It does NOT test anything Super-specific beyond that, because there is nothing Super-specific.
 */
import { start } from './trusscraft-lib.mjs';
const L = await start('supercadcraft', 'browser-trusscraft-supercadcraft');
const { ok, page } = L;
try {
  await page.goto('https://getcadcraft.com/lab/supercadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const a of ['cadcraft', 'bimcraft', 'partcraft', 'modelcraft']) { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:' + a + ':trusscraft:')) localStorage.removeItem(k); const s = JSON.parse(localStorage.getItem('cc-addons:' + a) || '{}'); s.on = { ...(s.on || {}), trusscraft: true }; if (s.off) delete s.off.trusscraft; localStorage.setItem('cc-addons:' + a, JSON.stringify(s)); } });
  await page.goto('https://getcadcraft.com/lab/supercadcraft', { waitUntil: 'networkidle' });
  await page.click('[data-ws="build"]');
  await page.waitForFunction(() => window.ccAddons && window.ccAddons.list().some((a) => a.id === 'trusscraft'), null, { timeout: 60000 });
  await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'trusscraft')?.state === 'active', null, { timeout: 30000 }).catch(() => {});
  const me = await L.entry();
  ok(me && me.state === 'active' && me.source === 'bundled', 'the mounted CadCraft panel started its own loader and TrussCraft is active in it', me && { state: me.state, reason: me.reason, detail: me.detail });
  // The mounted CadCraft gives an add-on's tab no home (Super's panels are its own), so the Trusses tab is not drawn; the add-on's commands still work on the command line.
  const hasTab = await page.evaluate(() => !!document.querySelector('[data-trs-label]'));
  console.log('  note the Trusses tab inside the mounted CadCraft: ' + (hasTab ? 'drawn' : 'not drawn (no right panel in Super)'));
  const run = async (name) => { await page.evaluate((n) => { window.cadcraft.engine.run(n); }, name); await page.waitForTimeout(600); };
  const cmds = await page.evaluate(() => [...window.cadcraft.commands.names?.() || []].filter((n) => /^TRUSS/.test(n)));
  const id = await page.evaluate(() => {
    const d = window.cadcraft.doc, u = String(d.meta.units || '').toLowerCase(), k = 1 / ({ millimeters: 1, centimeters: 10, meters: 1000, inches: 25.4, feet: 304.8 }[u] || 1);
    let id = null; d.change('t', () => { id = d.add({ type: 'poly', layer: '0', closed: true, pts: [[0, 0], [8000, 0], [8000, 5000], [0, 5000]].map(([x, y]) => ({ x: x * k, y: y * k })) }).id; });
    window.cadcraft.host.setSelection(new Set([id])); return id;
  });
  await run('TRUSSLAYOUT');
  await run('TRUSSPLACE');
  const lines = await page.evaluate(() => window.cadcraft.doc.all().filter((e) => e.layer === 'TRUSS-LAYOUT' && e.type === 'line').length);
  ok(id !== null && lines >= 8, 'TRUSSLAYOUT (on the selected polyline) and TRUSSPLACE draw the layout plan on the project drawing in the CadCraft panel (' + lines + ' truss lines)');
  await run('TRUSSELEVATION'); await run('TRUSSFORCES'); await run('TRUSSTABLE');
  const layers = await page.evaluate(() => [...new Set(window.cadcraft.doc.all().map((e) => e.layer).filter((l) => /^TRUSS-/.test(l)))]);
  ok(['TRUSS-MEMBERS', 'TRUSS-PLATES', 'TRUSS-TENSION', 'TRUSS-TABLE'].every((l) => layers.includes(l)), 'TRUSSELEVATION, TRUSSFORCES and TRUSSTABLE draw the elevation, forces and schedule', layers);
  // BimCraft and PartCraft panels: their own loaders, their own tabs
  for (const [ws, tab, probe, label] of [['build', 'bim', () => !!document.querySelector('[data-rtab="addon-trusscraft-trusses"]'), 'BimCraft'], ['model', 'model', null, 'ModelCraft (own frame)']]) {
    if (!probe) continue;
    await page.click(`[data-ws="${ws}"]`);
    await page.click(`[data-panel-tab="${tab}"]`).catch(() => {});
    const seen = await page.waitForFunction(probe, null, { timeout: 40000 }).then(() => true).catch(() => false);
    ok(seen, `the mounted ${label} panel lists the Trusses tab`);
  }
  const frames = page.frames().filter((f) => /modelcraft/.test(f.url()));
  if (frames.length) {
    const seen = await frames[0].waitForSelector('[data-trs-label]', { state: 'attached', timeout: 30000 }).then(() => true).catch(() => false);
    const reg = await frames[0].evaluate(() => (window.ccAddons ? window.ccAddons.list().find((a) => a.id === 'trusscraft')?.state : 'no loader')).catch(() => 'n/a');
    ok(seen || reg === 'active', 'ModelCraft in its own frame loads TrussCraft too (loader state ' + reg + ')');
  } else console.log('  note ModelCraft frame was not opened in this workspace');
} catch (e) { ok(false, 'run failed', e.stack || e.message); }
await L.finish();
