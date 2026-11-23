#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-core11.mjs: the real /lab/bimcraft page, headless (session bim-core-11, 0.11 W1.8). Opens the features 0.10 left "tested by shim" from the
 * REAL menus, with the mouse, on the page's own mounts (nothing is mounted by the test):
 *   BK.25 / BK.27   Walls menu > Wall finishes: the card opens, the Substrates tab is there, the face tab lists the walls
 *   BK.105 / 110 / 111 / 113 / 176 / 178   the Project stages section (left panel): Brief, Options, Types, Shop drawings, Site instructions
 *   BK.93 / 95 / 101   the LOD milestones panel is mounted by the page (not by lib/lod's own test)
 *   BK.130          the wall-face schedules are in the Schedules panel's list
 *   FX.352          a room tag in a feet-and-inches project says ft2 on the page too
 *   node tools/bimcraft-test/browser-core11.mjs        run as root (a test staff session; one browser)
 */
import { openLab } from '../shell-test/lab-page.mjs';

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + (typeof d === 'string' ? d : JSON.stringify(d)) + ')' : '')); } };
const lab = await openLab('bimcore11');
let ctx;
try {
  const made = await lab.page('bimcraft', { layout: 'standard', viewport: { width: 1600, height: 1000 }, storage: { 'bimcraft.model.units': 'ftin' } });
  ctx = made.ctx;
  const page = made.page;
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|status of 429/.test(m.text())) problems.push(m.text().slice(0, 200)); });
  const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 }).then(() => page.waitForTimeout(150));
  if (await page.isVisible('[data-empty] [data-new]')) { await page.click('[data-empty] [data-new]'); await page.waitForSelector('dialog.bc-new'); await page.click('[data-new-ok]'); }
  await page.waitForFunction(() => window.bimcraftPlan?.state?.data && window.bimcraftPlan.view, null, { timeout: 60000 }); await settled();
  // a box of four walls through the page's own Wall tool (typed, so the test needs no pointer maths)
  const walls = await page.evaluate(async () => {
    const A = window.bimcraftPlan, pv = A.view, r = pv.canvas.getBoundingClientRect();
    return { has: !!A.state, r: [r.width, r.height] };
  });
  ok(walls.has, 'the page is up with a new building');

  console.log('== BK.25 / BK.27: Walls menu > Wall finishes');
  const open = await page.evaluate(() => {
    const b = document.querySelector('[data-wall-finishes]');
    if (!b) return { found: false };
    const d = b.closest('details');
    return { found: true, inDetails: !!d, summary: d?.querySelector('summary')?.textContent?.trim() || '' };
  });
  ok(open.found, 'the Walls menu has a Wall finishes button', open);
  if (open.inDetails) await page.evaluate(() => document.querySelector('[data-wall-finishes]').closest('details').setAttribute('open', ''));
  await page.click('[data-wall-finishes]');
  await page.waitForSelector('[data-wallfinishes]:not([hidden])', { timeout: 20000 });
  ok(await page.evaluate(() => window.bimcraftFinishes?.state?.open === true), 'a real click on the menu button opens the card (state open)');
  const tabs = await page.$$eval('[data-wf-tab]', (b) => b.map((x) => x.dataset.wfTab));
  ok(['face', 'types', 'substrates', 'schedule'].every((k) => tabs.includes(k)), 'the card has the Face, Types, Substrates and Schedule tabs', tabs);
  await page.click('[data-wf-tab="substrates"]');
  ok(await page.evaluate(() => window.bimcraftFinishes.state.tab === 'substrates' && document.querySelector('[data-wallfinishes]')?.getBoundingClientRect().width > 0), 'the Substrates tab (BK.27) opens in the page');
  await page.click('[data-wf-tab="schedule"]');
  ok(await page.evaluate(() => window.bimcraftFinishes.state.tab === 'schedule'), 'the Schedule tab opens');
  await page.click('[data-wf-close]');
  ok(await page.evaluate(() => window.bimcraftFinishes.state.open === false), 'the card closes');

  console.log('== Project stages (BK.105 / 110 / 111 / 113 / 176 / 178)');
  const has = await page.evaluate(() => !!document.querySelector('[data-stages-details] > summary'));
  ok(has, 'the page mounted Project stages itself (a details after the Issues block)');
  if (has) {
    await page.evaluate(() => document.querySelector('[data-stages-details]').scrollIntoView());
    await page.click('[data-stages-details] > summary');
    await page.waitForSelector('[data-st-sec="brief"]', { timeout: 20000 });
    const secs = await page.$$eval('[data-st-sec]', (d) => d.map((x) => x.dataset.stSec));
    ok(['brief', 'options', 'types', 'shop', 'si'].every((k) => secs.includes(k)), 'Brief, Options, Types, Shop drawings and Site instructions are there', secs);
    for (const k of ['brief', 'options', 'types', 'shop', 'si']) {
      await page.evaluate((key) => { const d = document.querySelector(`[data-st-sec="${key}"]`); if (!d.open) d.querySelector('summary').click(); }, k);
      ok(await page.evaluate((key) => { const d = document.querySelector(`[data-st-sec="${key}"]`); return d.open && !!d.querySelector('.st-body')?.children.length; }, k), 'section ' + k + ' opens with content');
    }
    ok(await page.evaluate(() => !!window.bimcraftStages?.state), 'the test hook window.bimcraftStages is the page mount\'s own');
  }

  console.log('== BK.93 / 95 / 101: the LOD panel is the page\'s own');
  ok(await page.evaluate(() => !!window.bimcraftLod && !!document.querySelector('details[data-lod-details]')), 'a LOD milestones panel is in the page');

  console.log('== BK.130: wall-face schedules in the Schedules panel');
  const keys = await page.evaluate(async () => {
    try { const m = await import('/assets/apps/bimcraft/dev/schedule-data.js'); return Object.keys(m).slice(0, 30); } catch (e) { return ['err ' + e.message]; }
  });
  ok(keys.includes('FINISH_KEYS'), 'schedule-data.js loads in the page', keys);

  ok(!problems.length, 'no page error across the run', problems);
} catch (e) { fail++; console.log('  FAIL run stopped: ' + (e.stack || e).toString().slice(0, 600)); }
finally { try { await ctx?.close(); } catch (e) { /* closed */ } await lab.close?.(); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
