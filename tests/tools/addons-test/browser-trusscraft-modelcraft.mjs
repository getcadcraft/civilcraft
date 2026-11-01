#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-trusscraft-modelcraft.mjs — TrussCraft in the real /lab/modelcraft page, headless (roadmap DC.116, owner direction 2026-10-30).
 *   node tools/addons-test/browser-trusscraft-modelcraft.mjs        (run as root; light: one page)
 * Bundled and off; switched on in Settings › Add-ons; the Trusses section with the label; a typed roof laid out; the set placed as one mesh object per truss in a group
 * "TrussCraft" painted in the species colour (real model, real viewport); Remove; the exports; Problems; no console errors.
 */
import { start } from './trusscraft-lib.mjs';
const L = await start('modelcraft', 'browser-trusscraft-modelcraft');
const { ok, page } = L;
const groupOf = () => page.evaluate(() => { const m = window.modelcraft.model; const e = [...m.root.insts].find(([, i]) => m.defs.get(i.def)?.name === 'TrussCraft'); return e ? { n: m.defs.get(e[1].def).insts.size, color: [...m.defs.get(e[1].def).insts.values()][0].color } : null; });
try {
  await L.open(() => !!window.ccAddons && !!window.modelcraft && !!window.modelcraft.model);
  let me = await L.entry();
  ok(me && me.state === 'off' && me.source === 'bundled' && me.version === '0.8.1', 'TrussCraft is bundled, off, 0.8.1', me && { state: me.state, reason: me.reason, detail: me.detail });
  ok(me && me.manifest.apps.includes('modelcraft') && me.manifest.api === '1.0', 'manifest: modelcraft listed, API 1.0');
  const how = await L.enable();
  ok(true, 'switched on through ' + how);
  await L.showPanel();
  ok(/Not a substitute for engineered truss design/.test(await page.textContent('[data-trs-label]')), 'the Trusses section carries the not-a-design label');
  const btn = (re) => page.evaluate((r) => { const b = [...document.querySelectorAll('button')].find((x) => new RegExp(r, 'i').test(x.textContent)); if (!b) throw new Error('no button ' + r); b.click(); }, re);
  await btn('^Design one truss');
  await page.waitForSelector('[data-trs-drawing] svg', { state: 'attached', timeout: 20000 });
  ok(true, 'Design one truss draws the elevation');
  await btn('^Lay out on the roof');
  await page.waitForFunction(() => /trusses/i.test(document.querySelector('.trs-say')?.textContent || ''), null, { timeout: 30000 });
  ok(true, 'Lay out from the typed outline: ' + (await L.says()).split('\n').at(-1));
  ok((await groupOf()) === null, 'nothing placed yet');
  await L.click('[data-trs-place]');
  await page.waitForFunction(() => { const m = window.modelcraft.model; return [...m.root.insts].some(([, i]) => m.defs.get(i.def)?.name === 'TrussCraft'); }, null, { timeout: 30000 });
  const g = await groupOf();
  ok(g && g.n >= 15 && /^#[0-9a-f]{6}$/i.test(g.color), 'Place: a group "TrussCraft" with ' + (g && g.n) + ' mesh objects, colour ' + (g && g.color));
  const bb = await page.evaluate(() => window.modelcraft.model.bbox());
  ok(bb && bb.max[0] > 11 && bb.max[0] < 14 && bb.max[2] > 1, 'in metres, z up (span 12 m): ' + JSON.stringify(bb && bb.max.map((v) => Math.round(v * 100) / 100)));
  await page.evaluate(() => window.modelcraft.view.invalidate?.());
  await L.click('[data-trs-clear]');
  await page.waitForFunction(() => { const m = window.modelcraft.model; return ![...m.root.insts].some(([, i]) => m.defs.get(i.def)?.name === 'TrussCraft'); }, null, { timeout: 20000 });
  ok(true, 'Remove placed trusses takes the group away');
  const ex = await page.evaluate(() => window.ccAddons.exporters().map((e) => e.id));
  ok(ex.length === 9, 'nine exports', ex);
  const stl = await page.evaluate(async () => window.ccAddons.exporters().find((x) => /set-stl/.test(x.id)).write({}));
  ok(/^solid /.test(stl) && stl.includes('facet normal'), 'STL of the set from the add-on');
  const probs = await L.problemsList();
  ok(probs && probs[0] && probs[0].code === 'notdesign' && probs[0].src === 'modelcraft.addon.trusscraft', 'Problems: the label first, source modelcraft.addon.trusscraft', probs && probs.slice(0, 2));
  ok(probs && probs.some((p) => p.code === 'host0' && /mesh object/.test(p.text)), 'Problems say what ModelCraft cannot do');
} catch (e) { ok(false, 'run failed', e.stack || e.message); }
await L.finish();
