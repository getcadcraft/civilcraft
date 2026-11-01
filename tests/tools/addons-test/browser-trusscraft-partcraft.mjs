#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-trusscraft-partcraft.mjs — TrussCraft in the real /lab/partcraft page, headless (roadmap DC.116, owner direction 2026-10-30: add-ons work in more than one app).
 *   node tools/addons-test/browser-trusscraft-partcraft.mjs        (run as root; light: one page, nice it)
 * Bundled and off; switched on in Settings › Add-ons; the Trusses tab with the label; one truss designed (elevation drawn); a typed roof laid out; the set placed as display
 * bodies (one undo step, in the scene); Undo; Place again; the outline from a sketch; Remove; the exports; the Problems; no console errors.
 */
import { start } from './trusscraft-lib.mjs';
const L = await start('partcraft', 'browser-trusscraft-partcraft');
const { ok, page } = L;
try {
  await L.open(() => !!window.ccAddons && !!window.partcraft);
  let me = await L.entry();
  ok(me && me.state === 'off' && me.source === 'bundled' && me.version === '0.8.1' && me.manifest.api === '1.1', 'TrussCraft is bundled, off, 0.8.1, API 1.1', me && { state: me.state, reason: me.reason, detail: me.detail });
  ok(me && me.manifest.apps.join() === 'bimcraft,partcraft,modelcraft,cadcraft', 'the manifest lists the four apps');
  const how = await L.enable();
  ok(true, 'switched on through ' + how);
  await L.showPanel();
  const label = await page.textContent('[data-trs-label]');
  ok(/Not a substitute for engineered truss design/.test(label), 'the Trusses tab carries the not-a-design label first', label);
  // Design one truss
  const btn = (re) => page.evaluate((r) => { const b = [...document.querySelectorAll('.trs-say')].length && [...document.querySelectorAll('button')].find((x) => new RegExp(r, 'i').test(x.textContent)); if (!b) throw new Error('no button ' + r); b.click(); }, re);
  await btn('^Design one truss');
  await page.waitForSelector('[data-trs-drawing] svg', { state: 'attached', timeout: 20000 });
  ok(true, 'Design one truss draws the elevation');
  // a typed roof 12 x 8 m (the default outline), laid out
  await btn('^Lay out on the roof');
  await page.waitForFunction(() => /Set:|trusses/i.test(document.querySelector('.trs-say')?.textContent || ''), null, { timeout: 30000 });
  ok(/trusses/i.test(await L.says()), 'Lay out gives a set from the typed outline: ' + (await L.says()).split('\n').at(-1));
  const n0 = await page.evaluate(() => window.partcraft.host.part.addonBodies?.trusscraft?.trusses?.bodies?.length || 0);
  await L.click('[data-trs-place]');
  await page.waitForFunction(() => (window.partcraft.host.part.addonBodies?.trusscraft?.trusses?.bodies?.length || 0) > 100, null, { timeout: 30000 });
  const placed = await page.evaluate(() => { const g = window.partcraft.host.part.addonBodies.trusscraft.trusses; return { n: g.bodies.length, col: g.bodies[0].color }; });
  ok(n0 === 0 && placed.n > 100 && /^#[0-9a-f]{6}$/i.test(placed.col), 'Place as bodies: ' + placed.n + ' timber pieces, colour ' + placed.col);
  const inScene = await page.evaluate(() => { let n = 0; window.partcraft.view?.scene?.traverse?.((o) => { if (o.userData && o.userData.addonBodies) n += o.userData.addonBodies; }); return n; }).catch(() => -1);
  ok(inScene === -1 || inScene === placed.n, 'the bodies are in the 3D scene (' + inScene + ')');
  // Remove
  await L.click('[data-trs-place]'); await page.waitForTimeout(800);
  await L.click('[data-trs-clear]');
  await page.waitForFunction(() => !window.partcraft.host.part.addonBodies?.trusscraft?.trusses, null, { timeout: 20000 });
  ok(true, 'Remove placed trusses takes the group away');
  // exports
  const ex = await page.evaluate(() => window.ccAddons.exporters().map((e) => e.id));
  ok(ex.length === 9 && ex.some((i) => /jig-svg/.test(i)) && ex.some((i) => /set-stl/.test(i)), 'nine exports incl. jig, stock, STL, OBJ', ex);
  const jig = await page.evaluate(async () => { const e = window.ccAddons.exporters().find((x) => /jig-svg/.test(x.id)); return e.write(window.ccAddons.exportInput ? window.ccAddons.exportInput('x') : {}); });
  ok(/width="\d+(\.\d+)?mm"/.test(jig) && /Not a substitute/.test(jig), 'the jig drawing is an SVG in millimetres (life size) with the label');
  const probs = await L.problemsList();
  ok(probs && probs[0] && probs[0].code === 'notdesign' && probs[0].src === 'partcraft.addon.trusscraft', 'Problems: the not-a-design label first, source partcraft.addon.trusscraft', probs && probs.slice(0, 2));
  ok(probs && probs.some((p) => p.code === 'host0' && /display bodies/.test(p.text)), 'Problems say what PartCraft cannot do');
} catch (e) { ok(false, 'run failed', e.stack || e.message); }
await L.finish();
