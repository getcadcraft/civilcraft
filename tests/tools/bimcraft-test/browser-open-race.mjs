#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-open-race.mjs — the real /lab/bimcraft page (0.11 fix, "No IFC model is open with id null"). After an IFC opens,
 * model-ui's opened() queues an idle-time warm (mui-keys.js warmPicks: the pick snapshot + the LOD list, PERF.37) that runs up
 * to 4 s later. Opening another file meanwhile (IfcModel.load closes the old model first: the same editor reads mid null until
 * the new model is adopted), or closing the model, left that warm to read a model that is not open. The test holds every idle
 * callback in a queue and lets them run exactly in that window:
 *   A  open the house, open the office over it, run the house's queued warm while the office is loading (mid null)
 *   B  the same, the old warm run after the office has opened (another editor): dropped, the office's own warm still runs
 *   C  open, close the model (IfcModel.close), run the queued warm
 * Pass = no console or page error and the newest open's own warm still builds its lists (GetModelSchema asked with its id).
 *   node tools/bimcraft-test/browser-open-race.mjs [--old <mui-keys.js>] [--rounds N]
 * --old serves that file as dev/mui-keys.js (page.route; nothing on disk changes): the code before the fix, to show the race.
 * Run as root, inside `flock tmp/pf11-browser.lock`.
 */
import fs from 'node:fs';
import { openLab } from '../shell-test/lab-page.mjs';

const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const OLD = arg('--old'), ROUNDS = Math.max(1, +(arg('--rounds') || 1));
const A_FILE = '/var/www/CADCRAFT/getcadcraft.com/fixtures/showcase/bimcraft-house.ifc';
const B_FILE = '/var/www/CADCRAFT/getcadcraft.com/fixtures/showcase/bimcraft-office-5-storey.ifc';
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + (typeof d === 'string' ? d : JSON.stringify(d)) + ')' : '')); } };
const lab = await openLab('openracebim');

const opened = (page, name) => page.waitForFunction((n) => /Opened .*element/.test([...document.querySelectorAll('[data-status], [role="status"]')].map((e) => e.textContent.trim()).join(' ')) && window.bimcraftLive?.name === n && window.bimcraftLive.editor?.mid != null, name, { timeout: 240000 });

async function fresh() {
  const { ctx, page } = await lab.page('bimcraft', { layout: 'standard', viewport: { width: 1400, height: 900 }, storage: { 'bimcraft.model.units': 'mm' }, prepare: false });
  if (OLD) await page.route(/\/assets\/apps\/bimcraft\/dev\/mui-keys\.js/, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: fs.readFileSync(OLD, 'utf8') }));
  const errs = [];
  page.on('pageerror', (e) => errs.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|status of 429/.test(m.text())) errs.push(m.text().slice(0, 300)); });
  await page.addInitScript(() => {
    // every idle callback waits in a queue until the test runs it (the warm is the one that matters)
    window.__idle = [];
    window.requestIdleCallback = (fn) => { window.__idle.push(fn); return window.__idle.length; };
    window.cancelIdleCallback = () => {};
    window.__runIdle = () => { const q = window.__idle.splice(0); for (const fn of q) { try { fn({ timeRemaining: () => 50, didTimeout: true }); } catch (e) { console.error(e); } } return q.length; };
  });
  await page.goto(page.url(), { waitUntil: 'load' }).catch(() => {});
  return { ctx, page, errs };
}
/** Count GetModelSchema calls per model id from now on (IfcPlacer asks it: the LOD list being built). */
const spy = (page) => page.evaluate(() => { const api = window.bimcraftLive.editor.api; if (!api.__spy) { const f = api.GetModelSchema.bind(api); api.__seen = []; api.GetModelSchema = (mid) => { api.__seen.push(mid); return f(mid); }; api.__spy = true; } api.__seen.length = 0; });

try {
  for (let round = 1; round <= ROUNDS; round++) {
    console.log('== round ' + round + (OLD ? ' (old mui-keys.js: ' + OLD + ')' : ''));
    // A + B: reopen over a model with its warm still queued
    {
      const { ctx, page, errs } = await fresh();
      await page.setInputFiles('[data-file]', A_FILE);
      await opened(page, 'bimcraft-house.ifc');
      const qA = await page.evaluate(() => window.__idle.length);
      ok(qA > 0, 'A: the house opened, its warm is queued (' + qA + ' idle callbacks)');
      await page.evaluate(() => { const ed = window.bimcraftLive.editor; window.__edA = ed; window.__heldA = window.__idle.splice(0); });
      await page.setInputFiles('[data-file]', B_FILE);
      // the window: the same editor, its model closed for the new load
      await page.waitForFunction(() => window.__edA.mid == null, null, { timeout: 60000, polling: 5 });
      const ran = await page.evaluate(() => { const q = window.__heldA.splice(0); window.__heldB = q.slice(); for (const fn of q) { try { fn({ timeRemaining: () => 50, didTimeout: true }); } catch (e) { console.error(e); } } return { n: q.length, mid: window.__edA.mid }; });
      ok(ran.n > 0 && ran.mid == null, 'A: the house\'s warm ran while the office was loading (mid ' + ran.mid + ')', ran);
      await opened(page, 'bimcraft-office-5-storey.ifc');
      await page.waitForTimeout(300);
      ok(!errs.length, 'A: no console or page error from a warm during the reopen', errs.splice(0));
      // B: the house's warm once more, now that the office is open (another editor) — and then the office's own warm
      await spy(page);
      const midB = await page.evaluate(() => window.bimcraftLive.editor.mid);
      // each run and its count in one synchronous step: nothing else of the page reads the model in between
      const staleSeen = await page.evaluate(() => { const api = window.bimcraftLive.editor.api; window.__ownB = window.__idle.splice(0); api.__seen.length = 0; for (const fn of window.__heldB) { try { fn({ timeRemaining: () => 50, didTimeout: true }); } catch (e) { console.error(e); } } return api.__seen.slice(); });
      const ownSeen = await page.evaluate(() => { const api = window.bimcraftLive.editor.api; api.__seen.length = 0; for (const fn of window.__ownB) { try { fn({ timeRemaining: () => 50, didTimeout: true }); } catch (e) { console.error(e); } } return api.__seen.slice(); });
      ok(!errs.length, 'B: the old warm after the office opened: no error', errs.splice(0));
      ok(ownSeen.includes(midB), 'B: the office\'s own warm still builds the LOD list (GetModelSchema(' + midB + ') asked)', { staleSeen, ownSeen });
      if (!OLD) ok(!staleSeen.length, 'B: the house\'s stale warm was dropped (read nothing of the office)', staleSeen);
      await ctx.close();
    }
    // C: close the model with its warm queued
    {
      const { ctx, page, errs } = await fresh();
      await page.setInputFiles('[data-file]', A_FILE);
      await opened(page, 'bimcraft-house.ifc');
      const r = await page.evaluate(() => { const ed = window.bimcraftLive.editor; ed.model.close(); const n = window.__runIdle(); return { n, mid: ed.mid }; });
      await page.waitForTimeout(200);
      ok(r.n > 0 && r.mid == null, 'C: the model closed, its queued warm ran (' + r.n + ' callbacks)', r);
      ok(!errs.length, 'C: no console or page error from a warm after a close', errs.splice(0));
      await ctx.close();
    }
  }
} finally { await lab.close(); }
console.log(`open-race page test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
