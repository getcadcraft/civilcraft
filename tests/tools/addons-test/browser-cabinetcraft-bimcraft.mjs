#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-cabinetcraft-bimcraft.mjs — CabinetCraft in the real /lab/bimcraft page (0.8 DC.117, session cabinetcraft_hosts). Run as root, alone, nice, with a timeout:
 *   nice timeout 600 node tools/addons-test/browser-cabinetcraft-bimcraft.mjs [--shots dir]
 * A drawn house (fixtures/showcase/bimcraft-house.ifc) is opened; CabinetCraft is switched on in Settings › Add-ons; its tab in the right panel; Room › Find rooms lists the rooms the walls
 * enclose, Use this room; the example cabinets are laid along the room's first wall; Place in the model makes IfcFurniture on the level (the 3D view and the model's own counts follow), one
 * undo step through BimCraft's own Edit › Undo / Redo; Replace; the schedule is read back from the model; the plan is drawn on the level as drafting lines; Remove. No console errors.
 */
import path from 'node:path';
import { start, ROOT } from './cabinetcraft-lib.mjs';
const L = await start('bimcraft', 'browser-cabinetcraft-bimcraft');
const { ok, page } = L;
try {
  const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
  const _at = (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
  const planClick = async (x, y) => { await page.evaluate(([x, y]) => { window.bimcraftPlan.move([x, y]); window.bimcraftPlan.click([x, y]); }, [x, y]); await settled(); };   // the page's own click handler (plan mm), as the Draw tools hear it
  await L.open(() => !!document.querySelector('[data-empty] [data-new]'), 'https://getcadcraft.com/lab/bimcraft?space=paper');
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => window.ccAddons && window.ccAddons.list().some((a) => a.id === 'cabinetcraft' && a.state !== 'loading'), null, { timeout: 30000 });
  // a new building with a room drawn by the Wall tool (5000 x 4000) and a door in its south wall
  await page.click('[data-empty] [data-new]');
  await page.waitForSelector('dialog.bc-new');
  await page.fill('[data-new-name]', 'Cabinet house'); await page.fill('[data-new-levels]', '2'); await page.fill('[data-new-height]', '3000 mm');
  await page.click('[data-new-ok]');
  await page.waitForFunction(() => /^New building Cabinet house/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 60000 });
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
  await page.click('[data-mtool="wall"]');
  for (const [x, y] of [[0, 0], [5000, 0], [5000, 4000], [0, 4000], [0, 0]]) await planClick(x, y);
  await page.keyboard.press('Escape'); await settled();
  await page.click('[data-mtool="door"]'); await planClick(1200, 0); await settled();
  await page.keyboard.press('Escape');
  const me0 = await L.entry();
  ok(me0 && me0.state === 'off' && me0.source === 'bundled' && me0.manifest.apps.includes('bimcraft'), 'CabinetCraft is bundled in BimCraft and starts off', me0 && { state: me0.state, source: me0.source });
  const how = await L.enable();
  ok((await L.entry()).state === 'active', 'switched on (' + how + ')');
  await L.showPanel();
  ok(await page.isVisible('[data-cabinetcraft]'), 'its tab is in BimCraft\'s right panel');
  await L.shot('bim-01-panel');
  // the room from the model
  await L.tab('room');
  ok(await page.isVisible('[data-cc-hostroom-find]'), 'Room has "Use a room from the model"');
  await L.click('[data-cc-hostroom-find]');
  await page.waitForSelector('[data-cc-hostroom-list], [data-cc-hostroom-none]', { timeout: 20000 });
  const n = Number(await page.getAttribute('[data-cc-hostroom-list]', 'data-cc-hostroom-list').catch(() => 0));
  ok(n >= 1, 'the walls of the house enclose ' + n + ' room(s), listed');
  await L.shot('bim-02-rooms');
  await L.click('[data-cc-hostroom-use]');
  await L.waitSay(/taken from the model/);
  const job = await L.job();
  ok(job.site && job.site.host === 'bim' && job.site.storey && job.room.pts || job.room.shape === 'rect', 'the job\'s room is the model\'s room, on its level (' + (job.site && job.site.name) + ')');
  // cabinets along the first wall
  await L.tab('layout');
  await L.click('[data-cc-addrun]');
  await page.waitForSelector('[data-cc-add], [data-cc-tpl]', { timeout: 10000 });
  for (let i = 0; i < 3; i++) { await L.click('[data-cc-add]'); }
  const nCab = await page.evaluate(() => { const j = JSON.parse(localStorage.getItem('cc-addon:bimcraft:cabinetcraft:job')); return j.runs.reduce((s, r) => s + r.base.length + r.upper.length, 0); });
  ok(nCab >= 3, 'cabinets added to the run (' + nCab + ')');
  // what this app cannot do is said in Problems too: no G-code here, and the cabinets are made when asked
  const probs = await page.evaluate(() => (window.ccProblems ? window.ccProblems.store.list({}).filter((p) => /cabinetcraft/.test(p.source && p.source.name)).map((p) => p.text) : null));
  ok(probs === null || (probs.some((x) => /no G-code here/.test(x)) && probs.some((x) => /made from the job when you press the button/.test(x))), 'Problems says there is no G-code here and that the cabinets are made when asked' + (probs === null ? ' (this page has no Problems panel)' : ''), probs && probs.map((x) => x.slice(0, 40)));
  // place in the model
  await L.tab('drawings');
  ok(!(await page.$('[data-cc-3d]')) && await page.isVisible('[data-cc-host="bim-place"]'), 'Drawings shows "Cabinets in the model" and no PartCraft viewport box');
  await L.click('[data-cc-host-action="bim-place"]');
  await L.waitSay(/elements placed/, 60000);
  const placed = Number(/(\d+) elements placed/.exec(await L.say())[1]);
  ok(placed >= 3, 'Place in the model: ' + placed + ' elements (' + (await L.say()).slice(0, 80) + ')');
  await settled();
  ok(/in the model/.test(await L.hostStatus('bim-place')) && new RegExp('\\b' + placed + '\\b').test(await L.hostStatus('bim-place')), 'the section counts them from the model: ' + await L.hostStatus('bim-place'));
  await L.shot('bim-03-placed');
  // Edit › Undo through BimCraft: one step removes them all
  await page.keyboard.press('Control+z');
  await settled();
  await L.tab('drawings'); await L.tab('export');
  await L.click('[data-cc-host-action="bim-schedule"]');
  await L.waitSay(/None of this job/, 30000).catch(() => {});
  ok(/None of this job/.test(await L.say()), 'after BimCraft\'s own Undo the whole placement is gone (schedule says: ' + (await L.say()).slice(0, 60) + ')');
  await page.keyboard.press('Control+Shift+z');
  await settled();
  await L.tab('export');
  const dl = page.waitForEvent('download', { timeout: 20000 });
  await L.click('[data-cc-host-action="bim-schedule"]');
  const d = await dl;
  const text = await (await import('node:fs')).promises.readFile(await d.path(), 'utf8');
  ok(/Number/.test(text) && text.trim().split('\n').length === placed + 1, 'the schedule read back from the model: ' + (text.trim().split('\n').length - 1) + ' rows, same as placed (' + d.suggestedFilename() + ')');
  await L.click('[data-cc-host-action="bim-check"]');
  await L.waitSay(/all \d+ elements|differ/);
  ok(/all \d+ elements/.test(await L.say()), 'Check the model against the job: ' + (await L.say()).slice(0, 70));
  // the plan on the level
  await L.tab('drawings');
  await L.click('[data-cc-host-action="bim-draft"]');
  await L.waitSay(/drafting lines/, 60000);
  ok(/drafting lines/.test(await L.say()), 'the plan drawn on the level: ' + (await L.say()).slice(0, 60));
  await settled();
  await L.shot('bim-04-plan');
  // remove
  await L.click('[data-cc-host-action="bim-remove"]');
  await L.waitSay(/taken out|None/, 60000);
  ok(/taken out/.test(await L.say()), 'Remove from the model: ' + (await L.say()).slice(0, 50));
  // G-code is not offered here
  await L.tab('export');
  ok(!!(await page.$('[data-cc-nogcode]')) && !(await page.$('[data-cc-gcode]')), 'Export says there is no G-code in this app and offers none');
} catch (e) { ok(false, 'the run broke: ' + (e && e.message || e)); await L.shot('bim-error').catch(() => {}); }
await L.finish();
