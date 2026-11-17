// SPDX-License-Identifier: Apache-2.0
// Super 0.1: each of the eight apps mounted in its panel on its own — ready, its global there, nothing thrown, nothing missing.
//   node tools/super-test/mounts.mjs [panel ...]
import { start, launch } from './serve.mjs';
const PANELS = { cad: 'cadcraft', bim: 'bimcraft', model: 'modelcraft', markup: 'markupcraft', takeoff: 'takeoffcraft', civil: 'civilcraft', detail: 'detailcraft', part: 'partcraft' };
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PANELS);
const { url, missing, close } = await start({ langs: [''] });
const browser = await launch();
let bad = 0;
for (const id of want) {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = [], gone = [];
  page.on('pageerror', e => errs.push('page: ' + String(e.message).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|bad HTTP response code/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  // this harness serves the page and /assets only: a call to the site's own API (/api/…: the library's lists, the account) cannot be answered here, so it is listed, not counted as a missing file
  const api = [];
  page.on('response', r => { if (r.status() >= 400 && !/sw\.js|favicon/.test(r.url())) { const u = r.url().replace(/^https?:\/\/[^/]+/, ''); (/^\/api\//.test(u) ? api : gone).push(r.status() + ' ' + u); } });
  const t0 = Date.now();
  await page.goto(url); await page.waitForSelector('[data-sc-ready]');
  // only this panel, in the main area of the open workspace
  await page.evaluate(i => { const w = window.superWindow, s = JSON.parse(JSON.stringify(w.state)); s.workspaces[s.active].docks = { left: [], center: [{ tabs: [i], active: i }], right: [], bottom: [] }; w.state = s; }, id);   // the workspace that is open (Build since the front door, BK.3)
  let state = 'timeout';
  try {
    await page.waitForFunction(i => { const d = document.querySelector(`[data-panel="${i}"]`)?.dataset.mount; return d === 'ready' || d === 'failed'; }, id, { timeout: 40000 });
    state = await page.evaluate(i => document.querySelector(`[data-panel="${i}"]`).dataset.mount, id);
  } catch { /* timeout */ }
  await page.waitForTimeout(1500);
  const info = await page.evaluate(([i, app]) => {
    const frame = document.querySelector(`iframe[data-sc-frame="${i}"]`);
    const doc = frame ? frame.contentDocument : document;
    const root = doc && doc.querySelector(`[data-${app}]`);
    const r = root && root.getBoundingClientRect();
    return { global: frame ? typeof frame.contentWindow[app] : typeof window[app], root: !!root, box: r ? [Math.round(r.width), Math.round(r.height)] : null, mains: document.querySelectorAll('main').length };
  }, [id, PANELS[id]]);
  const good = state === 'ready' && info.root && info.box && info.box[0] > 300 && info.box[1] > 200 && !errs.length && !gone.length;
  if (!good) bad++;
  console.log(`${good ? 'ok  ' : 'FAIL'} ${id.padEnd(8)} ${state} global=${info.global} root=${info.root} box=${info.box} ${Date.now() - t0}ms` + (errs.length ? '\n     ' + errs.slice(0, 4).join('\n     ') : '') + (gone.length ? '\n     404: ' + gone.slice(0, 5).join(' ') : '') + (api.length ? '\n     (site API not served by this harness: ' + api.slice(0, 5).join(' ') + ')' : ''));
  await page.context().close();
}
await browser.close(); close();
process.exit(bad ? 1 : 0);
