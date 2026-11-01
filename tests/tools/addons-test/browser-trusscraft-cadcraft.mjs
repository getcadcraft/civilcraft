#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-trusscraft-cadcraft.mjs — TrussCraft in the real /lab/cadcraft page, headless (roadmap DC.116, owner direction 2026-10-30).
 *   node tools/addons-test/browser-trusscraft-cadcraft.mjs        (run as root; light: one page)
 * Bundled and off; switched on in Settings › Add-ons; the Trusses section with the label; a closed polyline drawn and selected and its outline taken; the layout plan drawn;
 * the elevation, force diagram and schedule drawn as real entities on TRUSS-* layers (lines, polylines, text, hatches, dimensions); one undo step each; DXF out holds the
 * layers; Remove; Problems; no console errors.
 */
import { start } from './trusscraft-lib.mjs';
const L = await start('cadcraft', 'browser-trusscraft-cadcraft');
const { ok, page } = L;
const ents = () => page.evaluate(() => window.cadcraft.doc.all().filter((e) => String(e.layer).startsWith('TRUSS-')).map((e) => ({ t: e.type, l: e.layer })));
try {
  await L.open(() => !!window.ccAddons && !!window.cadcraft && !!window.cadcraft.doc);
  let me = await L.entry();
  ok(me && me.state === 'off' && me.source === 'bundled' && me.version === '0.8.1', 'TrussCraft is bundled, off, 0.8.1', me && { state: me.state, reason: me.reason, detail: me.detail });
  ok(me && me.manifest.apps.includes('cadcraft') && me.manifest.api === '1.3', 'manifest: cadcraft listed, API 1.3');
  const how = await L.enable();
  ok(true, 'switched on through ' + how);
  await L.showPanel();
  ok(/Not a substitute for engineered truss design/.test(await page.textContent('[data-trs-label]')), 'the Trusses section carries the not-a-design label');
  // draw a closed polyline (9 x 5 drawing units; the new drawing is in millimetres or the template's units) and select it
  const info = await page.evaluate(() => {
    const d = window.cadcraft.doc, u = String(d.meta.units || '').toLowerCase();
    const mm = { millimeters: 1, centimeters: 10, meters: 1000, inches: 25.4, feet: 304.8 }[u] || 1, k = 1 / mm;
    let id = null;
    d.change('test poly', () => { id = d.add({ type: 'poly', layer: '0', closed: true, pts: [[0, 0], [9000, 0], [9000, 5000], [0, 5000]].map(([x, y]) => ({ x: x * k, y: y * k })) }).id; });
    window.cadcraft.host.setSelection ? window.cadcraft.host.setSelection(new Set([id])) : window.ccAddons.select?.([id]);
    return { units: u, id };
  });
  ok(info.id !== null, 'a closed polyline is drawn (units ' + (info.units || 'default') + ')');
  // selection is the host's: the panel's pick button reads api.selection()
  const sel = await page.evaluate(() => [...(window.cadcraft.host?.selection || [])]);
  const btn = (re) => page.evaluate((r) => { const b = [...document.querySelectorAll('button')].find((x) => new RegExp(r, 'i').test(x.textContent)); if (!b) throw new Error('no button ' + r); b.click(); }, re);
  if (sel.length) {
    await L.click('[data-trs-pick]');
    await page.waitForFunction(() => /Outline taken/.test(document.querySelector('.trs-say')?.textContent || ''), null, { timeout: 10000 });
    ok(true, 'the outline is taken from the selected polyline: ' + (await L.says()).split('\n')[0]);
  } else ok(false, 'the polyline is selected for the panel', sel);
  await btn('^Design one truss');
  await page.waitForSelector('[data-trs-drawing] svg', { state: 'attached', timeout: 20000 });
  await btn('^Lay out on the roof');
  await page.waitForFunction(() => /trusses/i.test(document.querySelector('.trs-say')?.textContent || ''), null, { timeout: 15000 }).catch(async () => { console.log('says: ' + (await L.says()) + ' | buttons: ' + (await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => b.textContent.trim()).filter((s) => /Lay|Design|Draw/.test(s)).join(' ; '))) + ' | log: ' + (await page.evaluate(() => document.querySelector('[data-cmdlog], .cc-cmdlog')?.textContent?.slice(-200) || ''))); throw new Error('no layout: ' + (await L.says())); });
  ok(true, 'Lay out on the picked outline: ' + (await L.says()).split('\n').at(-1));
  const undo0 = await page.evaluate(() => window.cadcraft.doc.undoStack.length);
  await L.click('[data-trs-place]');
  await page.waitForFunction(() => window.cadcraft.doc.all().some((e) => e.layer === 'TRUSS-LAYOUT'), null, { timeout: 20000 });
  let e1 = await ents();
  ok(e1.filter((e) => e.l === 'TRUSS-LAYOUT' && e.t === 'line').length >= 10 && e1.some((e) => e.t === 'dim') && e1.some((e) => e.t === 'poly'), 'the layout plan: a line per truss, the outline, text and a dimension (' + e1.length + ' objects)');
  ok((await page.evaluate(() => window.cadcraft.doc.undoStack.length)) === undo0 + 1, 'one undo step');
  await L.click('[data-trs-host="elevation"]');
  await page.waitForFunction(() => window.cadcraft.doc.all().some((e) => e.layer === 'TRUSS-PLATES'), null, { timeout: 20000 });
  await L.click('[data-trs-host="forces"]');
  await page.waitForFunction(() => window.cadcraft.doc.all().some((e) => e.layer === 'TRUSS-TENSION'), null, { timeout: 20000 });
  await L.click('[data-trs-host="table"]');
  await page.waitForFunction(() => window.cadcraft.doc.all().some((e) => e.layer === 'TRUSS-TABLE'), null, { timeout: 20000 });
  e1 = await ents();
  const layers = new Set(e1.map((e) => e.l)), types = new Set(e1.map((e) => e.t));
  ok(['TRUSS-MEMBERS', 'TRUSS-PLATES', 'TRUSS-DIMS', 'TRUSS-TEXT', 'TRUSS-TENSION', 'TRUSS-COMPRESSION', 'TRUSS-TABLE'].every((l) => layers.has(l)), 'elevation, force diagram and schedule are on their layers', [...layers]);
  ok(['line', 'poly', 'text', 'hatch', 'dim'].every((t) => types.has(t)), 'real entities: lines, polylines, text, hatches, dimensions', [...types]);
  const dxf = await page.evaluate(async () => { const m = await import('/assets/apps/cadcraft/dev/dxf.js'); return m.writeDxf(window.cadcraft.doc).text; });
  ok(/TRUSS-LAYOUT/.test(dxf) && /TRUSS-PLATES/.test(dxf) && /TRUSS-TENSION/.test(dxf), 'DXF out carries the TRUSS-* layers (' + dxf.length + ' bytes)');
  const sx = await page.evaluate(() => window.cadcraft.doc.all().filter((e) => e.layer === 'TRUSS-MEMBERS').length);
  ok(sx >= 5, 'the elevation has its member outlines (' + sx + ')');
  await L.click('[data-trs-clear]');
  await page.waitForFunction(() => !window.cadcraft.doc.all().some((e) => String(e.layer).startsWith('TRUSS-')), null, { timeout: 20000 });
  ok(true, 'Remove the drawings takes every TRUSS-* object away');
  const probs = await L.problemsList();
  ok(probs && probs[0] && probs[0].code === 'notdesign' && probs[0].src === 'cadcraft.addon.trusscraft', 'Problems: the label first, source cadcraft.addon.trusscraft', probs && probs.slice(0, 2));
  ok(probs && probs.some((p) => p.code === 'host0' && /plain lines/.test(p.text)), 'Problems say what CadCraft cannot do');
} catch (e) { ok(false, 'run failed', e.stack || e.message); }
await L.finish();
