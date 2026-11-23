// SPDX-License-Identifier: Apache-2.0
// 0.11 W3.4 (super-hosts-11): the add-on hub in the real page. Panels are mounted two or three at a time; every add-on of every mounted app is listed once,
// switched through the app that carries it, and its panel section lands under Properties.   nice node tools/super-test/hosts.mjs [group ...]   (groups: bimcad, modelpart, civil)
import { start, launch } from './serve.mjs';
const GROUPS = {
  bimcad: { panels: ['bim', 'cad'], expect: [['lightdesign', 'bimcraft'], ['energy-code', 'bimcraft'], ['chip', 'cadcraft'], ['pool', 'bimcraft'], ['dome', 'bimcraft'], ['twin', 'bimcraft']], on: ['chip', 'lightdesign', 'energy-code', 'pool', 'dome'], section: { chip: /./ } },
  modelpart: { panels: ['model', 'part'], expect: [['print3d', 'modelcraft'], ['twin', 'modelcraft']], on: ['print3d', 'twin'], section: {} },
  civil: { panels: ['civil'], expect: [['weather', 'bimcraft'], ['watercraft', 'civilcraft']], on: ['weather'], section: {} },
};
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(GROUPS);
const { url, close } = await start({ langs: [''] });
const browser = await launch({ width: 1500, height: 1000 });
let pass = 0, fail = 0; const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 300)); } };
for (const g of want) {
  const G = GROUPS[g];
  const page = await (await browser.newContext({ viewport: { width: 1500, height: 1000 } })).newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  try {
    await page.goto(url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
    await page.evaluate((ps) => { const w = window.superWindow, s = JSON.parse(JSON.stringify(w.state)); s.workspaces[s.active].docks = { left: [], center: ps.map((i) => ({ tabs: [i], active: i })), right: [{ tabs: ['props'], active: 'props' }], bottom: [] }; w.state = s; }, G.panels);
    for (const p of G.panels) await page.waitForFunction((i) => ['ready', 'failed'].includes(document.querySelector(`[data-panel="${i}"]`)?.dataset.mount), p, { timeout: 90000 });
    await page.waitForFunction((n) => window.superWindow.addons.apps().length >= n, G.panels.length, { timeout: 60000 }).catch(() => {});
    await page.waitForTimeout(2500);
    const info = await page.evaluate(() => { const a = window.superWindow.addons; return { apps: a.apps(), hosts: Object.keys(a.hosts.addons).length, list: a.list().map((x) => [x.id, x.app, x.state]) }; });
    console.log(g, JSON.stringify(info.apps), info.list.length + ' add-ons', 'hosts file entries ' + info.hosts);
    ok(info.hosts === 9, g + ': the hosts file was read by the page', info.hosts);
    for (const p of G.panels) ok(await page.evaluate((i) => document.querySelector(`[data-panel="${i}"]`)?.dataset.mount === 'ready', p), g + ': ' + p + ' mounted');
    for (const [id, app] of G.expect) ok(info.list.some((r) => r[0] === id && r[1] === app), g + ': ' + id + ' listed, carried by ' + app, info.list.filter((r) => r[0] === id));
    for (const id of G.on) {
      const r = await page.evaluate(async (i) => { const a = window.superWindow.addons; try { await a.setEnabled(i, true); } catch (e) { return { err: String(e.message) }; } await new Promise((z) => setTimeout(z, 2500)); const f = a.find(i); return { state: f && f.state, app: f && f.app, section: [...document.querySelectorAll('[data-sc-addons] [data-addon-section]')].some((x) => x.getAttribute('data-addon-section').startsWith(i + '.') || x.getAttribute('data-addon-section').startsWith(i + ':') || x.getAttribute('data-addon-section').includes(i)) }; }, id);
      console.log('  ' + id + ' -> ' + r.state + ' via ' + r.app + ', panel section under Properties: ' + r.section);
      ok(r.state === 'active', g + ': ' + id + ' switched on through ' + r.app, r);
    }
    if (G.panels.includes('cad')) {
      const secs = await page.evaluate(() => [...document.querySelectorAll('[data-sc-addons] [data-addon-section]')].map((s) => s.getAttribute('data-addon-section')));
      ok(secs.length >= 1, g + ': panel sections of the add-ons sit under Properties: ' + secs.join(','), secs);
    }
    ok(!errs.length, g + ': no page error', errs.slice(0, 3));
  } catch (e) { fail++; console.log('FAIL', g, String(e.message).slice(0, 300)); }
  await page.context().close();
}
await browser.close(); close();
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
