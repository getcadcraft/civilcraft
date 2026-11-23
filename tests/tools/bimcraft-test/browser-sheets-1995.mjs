#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-sheets-1995.mjs — suggestion #1995 on the real /lab/bimcraft page (perf-finish-11, lane bim). The models: make-sheets-1995.mjs.
 *   1 walls-3500.ifc (3,421 walls, 5 levels): open Sheets (the toolbar's Sheets button) and time it: main-thread blocking and the longest task
 *     until the list is filled; the page stays answering (a frame every so often) and says how far it is; the sheets' digest (every sheet's SVG)
 *   2 structural-rebar-2500.ifc (881 walls, 144 columns, 1,152 rebar bars): a section line, then Sheets: no "Maximum call stack size exceeded",
 *     the section sheet is there, and "Nothing to draw yet" is never shown for a model that is not empty
 *   3 the Section tool's hint is words, not the key res.hint.section
 *   node tools/bimcraft-test/browser-sheets-1995.mjs [--digest-only]     run as root (its own test admin)
 */
import fs from 'node:fs';
import { openLab } from '../shell-test/lab-page.mjs';

const DIR = '/var/www/CADCRAFT/getcadcraft.com/testfiles/generated/sheets1995/';
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + (typeof d === 'string' ? d : JSON.stringify(d)).slice(0, 400) + ')' : '')); } };
const lab = await openLab('sheets1995');
const out = { };

async function openModel(file) {
  const { ctx, page } = await lab.page('bimcraft', { layout: 'standard', viewport: { width: 1500, height: 950 }, storage: { 'bimcraft.model.units': 'mm', 'bimcraft.sheets.paper': 'a3' }, prepare: false });
  const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|status of 429/.test(m.text())) errs.push(m.text().slice(0, 200)); });
  await page.evaluate(() => { window.__lt = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__lt.push([e.startTime, e.duration]); }).observe({ type: 'longtask' }); } catch (e) { /* none */ } });
  await page.setInputFiles('[data-file]', DIR + file);
  await page.waitForFunction(() => /Opened .*element/.test([...document.querySelectorAll('[data-status], [role="status"]')].map((e) => e.textContent).join(' ')), null, { timeout: 300000 });
  await page.waitForTimeout(3000);
  return { ctx, page, errs };
}
/** Draw on (the plan, where the Sheets button is), as a person does before Sheets. */
async function drawOn(page) {
  await page.evaluate(() => { const b = document.querySelector('[data-model-toggle]'); if (b.getAttribute('aria-pressed') !== 'true') b.click(); });
  await page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && s.data && !s.busy && !s.reloading; }, null, { timeout: 240000 });
  await page.waitForTimeout(1500);
}
/** Open the Sheets dialog the way a person does; → { ms, block, longest, tasks, frames (longest gap between frames), progress seen, list, digest } */
async function sheets(page) {
  return page.evaluate(async () => {
    const dlg = document.querySelector('[data-res-sheets-dlg]'), list = dlg.querySelector('[data-res-shlist]');
    const n0 = window.__lt.length, t0 = performance.now();
    let last = t0, gap = 0, progress = new Set(), on = true;
    const tick = () => { const n = performance.now(); gap = Math.max(gap, n - last); last = n; const s = list.textContent.trim(); if (s && !list.querySelector('button')) progress.add(s.slice(0, 80)); if (on) requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
    document.querySelector('[data-res-sheetsopen]').click();
    for (;;) {
      await new Promise((r) => setTimeout(r, 50));
      if (list.querySelector('button') || /Nothing to draw/.test(list.textContent) || performance.now() - t0 > 240000) break;
    }
    on = false;
    const ms = performance.now() - t0, lt = window.__lt.slice(n0);
    const status = [...document.querySelectorAll('[data-status], [role="status"]')].map((e) => e.textContent).join(' | ');
    const R = window.bimcraftRes.state;
    const h = async (s) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)))].slice(0, 10).map((x) => x.toString(16).padStart(2, '0')).join('');
    const { sheetSvg } = await import(new URL('res-sheets.js', document.querySelector('script[type="module"][src*="bimcraft"]')?.src || location.href).href).catch(() => ({}));
    const svgs = [];
    for (const b of list.querySelectorAll('button')) { b.click(); svgs.push(dlg.querySelector('[data-res-shview]').innerHTML.replace(/\d{4}-\d\d-\d\d/g, 'DATE')); }
    return { ms: Math.round(ms), tasks: lt.length, block: Math.round(lt.reduce((a, x) => a + x[1], 0)), longest: Math.round(lt.reduce((a, x) => Math.max(a, x[1]), 0)), gap: Math.round(gap),
      progress: [...progress], list: [...list.querySelectorAll('button')].map((b) => b.textContent.trim()), none: /Nothing to draw/.test(list.textContent), status: status.slice(-200),
      sheets: R.sheets?.length || 0, digest: await h(svgs.join('\n')), stack: /call stack/i.test(status) };
  });
}
try {
  const digestOnly = process.argv.includes('--digest-only');
  console.log('== 1: walls-3500.ifc, Sheets');
  let M = await openModel('walls-3500.ifc');
  const off = await sheets(M.page);   // Draw still off: the set is made from the model all the same
  await M.page.evaluate(() => document.querySelector('[data-res-sheets-dlg]').close());
  ok(!off.none && off.sheets > 0, 'walls-3500, Draw off: Sheets still makes the set, no "Nothing to draw yet" (' + off.sheets + ' sheets)', { none: off.none, sheets: off.sheets, status: off.status });
  await drawOn(M.page);
  const a = await sheets(M.page);
  out.walls = a;
  console.log(`   Sheets: ${a.ms} ms to the list, blocking ${a.block} ms in ${a.tasks} long tasks, longest ${a.longest} ms, longest gap between frames ${a.gap} ms; ${a.sheets} sheets; digest ${a.digest}; shown while making: ${JSON.stringify(a.progress)}`);
  ok(a.sheets > 0 && !a.none, 'walls-3500: the sheets are made (' + a.sheets + ')', a);
  const BEFORE = (() => { try { return JSON.parse(fs.readFileSync(new URL('./fixtures-1995/sheets-before.json', import.meta.url), 'utf8')); } catch (e) { return null; } })();   // the code before #1995, Draw on
  if (BEFORE && !digestOnly) ok(a.digest === BEFORE.walls.digest && a.sheets === BEFORE.walls.sheets, 'walls-3500: the same sheets as before the change (every sheet\'s SVG: ' + a.digest + ', ' + a.sheets + ' sheets)', { now: a.digest, before: BEFORE.walls.digest });
  if (!digestOnly) {
    ok(a.longest < 2000, 'walls-3500: the work is split: no task of 2 s or more while the sheets are made (longest ' + a.longest + ' ms; one 28 s task before, VPS)', a);
    ok(a.progress.some((s) => /\d/.test(s)), 'walls-3500: the dialog says how far it is (' + JSON.stringify(a.progress.slice(-2)) + ')', a.progress);
  }
  ok(!M.errs.length, 'walls-3500: no page error', M.errs);
  await M.ctx.close();

  console.log('== 2: structural-rebar-2500.ifc, a section line, then Sheets');
  M = await openModel('structural-rebar-2500.ifc');
  await drawOn(M.page);
  const hint = await M.page.evaluate(async () => {
    const b = document.querySelector('[data-mtool="section"]');
    b?.closest('details')?.setAttribute('open', ''); b?.click();
    await new Promise((r) => setTimeout(r, 400));
    return { text: document.querySelector('[data-model-hint]')?.textContent || '', tool: window.bimcraftPlan?.state?.tool };
  });
  out.hint = hint;
  ok(hint.tool === 'section' && hint.text && !/res\.hint\./.test(hint.text), 'the Section tool says what to do, in words: "' + hint.text + '"', hint);
  const placed = null;
  // the section line as a person draws it: the Section tool, two clicks on the plan across the building
  const at = (x, y) => M.page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
  await M.page.evaluate(() => window.bimcraftPlan.view.fit?.());
  for (const p of [[-2000, 20200], [42000, 20200]]) { const [px, py] = await at(p[0], p[1]); await M.page.mouse.move(px, py, { steps: 2 }); await M.page.mouse.click(px, py); await M.page.waitForTimeout(300); }
  await M.page.waitForTimeout(2500);
  const secs = await M.page.evaluate(() => window.bimcraftRes.state.secs?.length || 0);
  ok(secs === 1, 'a section line drawn across the building (' + secs + ')', placed);
  await M.page.keyboard.press('Escape');
  const b = await sheets(M.page);
  out.rebar = b;
  console.log(`   Sheets: ${b.ms} ms, blocking ${b.block} ms (longest ${b.longest}); ${b.sheets} sheets: ${JSON.stringify(b.list.slice(0, 12))}; status "${b.status}"`);
  ok(!b.stack, 'no "Maximum call stack size exceeded"', b.status);
  ok(!b.none && b.sheets > 0, 'the model is not empty: no "Nothing to draw yet", the sheets are made (' + b.sheets + ')', b);
  ok(b.list.some((s) => /section/i.test(s)), 'the section sheet is in the set', b.list);
  const B2 = (() => { try { return JSON.parse(fs.readFileSync(new URL('./fixtures-1995/sheets-before.json', import.meta.url), 'utf8')); } catch (e) { return null; } })();
  if (B2?.rebar && !digestOnly) ok(b.digest === B2.rebar.digest && b.sheets === B2.rebar.sheets, 'rebar model: the same sheets as before the change (' + b.digest + ')', { now: b.digest, before: B2.rebar.digest });
  ok(!M.errs.length, 'rebar model: no page error', M.errs);
  await M.ctx.close();
} finally { await lab.close(); }
fs.mkdirSync('/var/www/CADCRAFT/getcadcraft.com/tmp/perf-finish-bim', { recursive: true });
fs.writeFileSync('/var/www/CADCRAFT/getcadcraft.com/tmp/perf-finish-bim/sheets-1995-' + (process.argv.includes('--digest-only') ? 'before' : 'after') + '.json', JSON.stringify(out, null, 1));
console.log(`#1995 page test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
