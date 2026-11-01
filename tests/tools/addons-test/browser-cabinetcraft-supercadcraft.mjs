#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cabinetcraft-supercadcraft.mjs — CabinetCraft in SuperCad Studio's real lab page, headless (0.8 DC.117, session cabinetcraft_hosts).
 *   nice timeout 600 node tools/addons-test/browser-cabinetcraft-supercadcraft.mjs [--shots dir]        (run as root, alone: one page, apps mounted one workspace at a time)
 * SuperCad Studio has no add-on host of its own: it mounts the real apps in its panels, and each mounted app starts its own loader with its own bundled add-ons. So CabinetCraft is not wired
 * into Super; it arrives with the mounted CadCraft, BimCraft and PartCraft panels (ModelCraft runs in its own frame), each with ITS adapter. This test proves exactly that: with the add-on switched
 * on (the apps' own "on" memory, set before the page opens), the CabinetCraft panel shows up inside the mounted CadCraft panel and draws the shop drawings on the project's drawing, and the
 * mounted BimCraft, PartCraft and ModelCraft panels start it with their own host. Nothing here is Super-specific because there is nothing Super-specific.
 */
import { start, BASE } from './cabinetcraft-lib.mjs';
const L = await start('supercadcraft', 'browser-cabinetcraft-supercadcraft');
const { ok, page } = L;
try {
  await page.goto(BASE + '/lab/supercadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { for (const a of ['cadcraft', 'bimcraft', 'partcraft', 'modelcraft']) { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:' + a + ':cabinetcraft:')) localStorage.removeItem(k); const s = JSON.parse(localStorage.getItem('cc-addons:' + a) || '{}'); s.on = { ...(s.on || {}), cabinetcraft: true }; if (s.off) delete s.off.cabinetcraft; localStorage.setItem('cc-addons:' + a, JSON.stringify(s)); } });
  await page.goto(BASE + '/lab/supercadcraft', { waitUntil: 'networkidle' });
  await page.click('[data-ws="build"]');
  await page.waitForFunction(() => window.ccAddons && window.ccAddons.list().some((a) => a.id === 'cabinetcraft'), null, { timeout: 60000 });
  await page.waitForFunction(() => window.ccAddons.list().find((a) => a.id === 'cabinetcraft')?.state === 'active', null, { timeout: 30000 }).catch(() => {});
  const me = await L.entry();
  ok(me && me.state === 'active' && me.source === 'bundled', 'the mounted CadCraft panel started its own loader and CabinetCraft is active in it', me && { state: me.state, reason: me.reason });
  // A CadCraft mounted in Super has no right panel for an add-on's tab (findPanel finds none; the same for TrussCraft, reported not hidden), so CabinetCraft is used there by its commands:
  // the closed polyline is the room (CCROOM), the example kitchen is loaded (CCSAMPLE), the shop drawings are drawn on the project's drawing (CCDRAW).
  ok(!(await page.$('[data-cabinetcraft]')), 'the mounted CadCraft has no panel to show the tab in (so the commands are the way in)');
  const k = await page.evaluate(() => { const d = window.cadcraft.doc, m = { '': 1, millimeters: 1, centimeters: 10, meters: 1000, inches: 25.4, feet: 304.8 }[String(d.meta.units || '')] ?? 1; return 1 / m; });
  const id = await page.evaluate((k) => { const d = window.cadcraft.doc; let id; d.change('room', () => { id = d.add({ type: 'poly', layer: '0', closed: true, pts: [[0, 0], [6000, 0], [6000, 4500], [0, 4500]].map(([x, y]) => ({ x: x * k, y: y * k })) }).id; }); window.cadcraft.host.setSelection(new Set([id])); return id; }, k);
  const cmd = async (c, ms = 200) => { await page.evaluate((x) => window.cadcraft.engine.text(x), c); await new Promise((r) => setTimeout(r, ms)); };
  await cmd('CCSAMPLE'); await cmd('CCROOM', 600);
  const job = await page.evaluate(() => JSON.parse(localStorage.getItem('cc-addon:cadcraft:cabinetcraft:job')));
  ok(job && job.room.w === 6000 && job.room.d === 4500 && job.site && job.site.host === 'cad', 'CCSAMPLE then CCROOM: the example job in the polyline\'s 6000 x 4500 room');
  const n0 = await page.evaluate(() => window.cadcraft.doc.model.size);
  await cmd('CCDRAW', 1500);
  await page.waitForFunction(() => [...window.cadcraft.doc.model.values()].filter((e) => /^CC-/.test(e.layer)).length > 100, null, { timeout: 30000 });
  const n1 = await page.evaluate(() => ({ n: window.cadcraft.doc.model.size, cc: [...window.cadcraft.doc.model.values()].filter((e) => /^CC-/.test(e.layer)).length }));
  ok(id > 0 && n1.cc > 100 && n1.n > n0, 'CCDRAW draws the shop drawings on the project\'s drawing in the CadCraft panel (' + n1.cc + ' entities on CC- layers)');
  await L.shot('super-01-cad');
  // BimCraft panel: its own loader, its own tab, its own adapter
  await page.click('[data-panel-tab="bim"]').catch(() => {});
  const bimTab = await page.waitForFunction(() => !!document.querySelector('[data-rtab="addon-cabinetcraft-cabinetcraft"]'), null, { timeout: 40000 }).then(() => true).catch(() => false);
  ok(bimTab, 'the mounted BimCraft panel lists the CabinetCraft tab');
  // ModelCraft (in its own frame) and PartCraft are in the Model workspace: the frame first, because it is unloaded when the PartCraft tab is shown
  await page.click('[data-ws="model"]');
  const frame = async () => { for (let i = 0; i < 30; i++) { const f = page.frames().find((x) => /lab\/modelcraft/.test(x.url())); if (f) return f; await new Promise((r) => setTimeout(r, 1000)); } return null; };
  const mf = await frame();
  if (mf) {
    const reg = await mf.waitForFunction(() => window.ccAddons && window.ccAddons.list().find((a) => a.id === 'cabinetcraft')?.state === 'active', null, { timeout: 60000 }).then(() => 'active').catch(() => 'not active');
    ok(reg === 'active', 'ModelCraft in its own frame starts CabinetCraft too (loader state ' + reg + ')');
    ok(await mf.evaluate(() => typeof window.ccAddonModel?.addBodies === 'function').catch(() => false), 'and its model host takes bodies');
  } else ok(false, 'ModelCraft\'s frame was not opened in the Model workspace');
  await page.click('[data-panel-tab="part"]').catch(() => {});
  const partTab = await page.waitForFunction(() => !!document.querySelector('.pc-tabs [data-addon="cabinetcraft"]'), null, { timeout: 90000 }).then(() => true).catch(() => false);
  ok(partTab, 'the mounted PartCraft panel lists the CabinetCraft tab');
} catch (e) { ok(false, 'the run broke: ' + (e && e.message || e)); await L.shot('super-error').catch(() => {}); }
await L.finish();
