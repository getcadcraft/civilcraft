// SPDX-License-Identifier: Apache-2.0
// Super 0.1 hosts the node editor (0.8 round 3, nodes_PART_3; DC.54) through the apps it mounts: PartCraft inline (its Nodes workspace) and ModelCraft in its
// frame (the Nodes section). Each opens the shared window (assets/js/app-nodes.js), builds a circle from two wired nodes and draws it.
//   node tools/super-test/nodes.mjs
import { start, launch } from './serve.mjs';
const { url, close } = await start({ langs: [''] });
const browser = await launch();
let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
for (const [id, app] of [['part', 'partcraft'], ['model', 'modelcraft']]) {
  const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('page: ' + String(e.message).slice(0, 200)));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|bad HTTP response code|WebGL|GPU stall/.test(m.text())) errs.push('console: ' + m.text().slice(0, 200)); });
  await page.goto(url); await page.waitForSelector('[data-sc-ready]');
  await page.evaluate(i => { const w = window.superWindow, s = JSON.parse(JSON.stringify(w.state)); s.workspaces.layout.docks = { left: [], center: [{ tabs: [i], active: i }], right: [], bottom: [] }; w.state = s; }, id);
  await page.waitForFunction(i => document.querySelector(`[data-panel="${i}"]`)?.dataset.mount === 'ready', id, { timeout: 40000 });
  await page.waitForTimeout(1500);
  const scope = id === 'model' ? 'iframe[data-sc-frame="model"]' : null;
  const frame = scope ? await (await page.$(scope)).contentFrame() : page.mainFrame();
  if (id === 'part') {
    await frame.evaluate(() => { const s = document.querySelector('[data-workspace]'); s.value = 'nodes'; s.dispatchEvent(new Event('change', { bubbles: true })); });
  } else await frame.click('[data-nodes-open]');
  await frame.waitForSelector('[data-nodes-window]:not([hidden])', { timeout: 30000 }).then(() => ok(true, app + ': the node editor window opens inside Super'), () => ok(false, app + ': the node editor window opens inside Super'));
  const made = await frame.evaluate(async (app) => {
    const n = app === 'partcraft' ? window.partcraft.nodes.win : window.modelcraft.nodes.window;
    const g = n.panel.graph;
    const a = g.add('length', { params: { value: 12 } }), c = g.add('circle', { show: true });
    g.connect({ node: a, port: 'out' }, { node: c, port: 'radius' });
    n.panel.set(g.toJSON());
    await new Promise((r) => setTimeout(r, 400));
    return { shown: n.display.group.children.length, area: n.panel.result.values[c] && n.panel.result.values[c].out.cvs.length };
  }, app).catch((e) => ({ err: String(e) }));
  ok(made.shown === 1 && made.area === 9, app + ': two wired nodes make a circle (9 control points) and it is drawn ' + JSON.stringify(made));
  ok(errs.length === 0, app + ': no errors' + (errs.length ? ' ' + errs.join(' | ') : ''));
}
await browser.close(); await close();
console.log(bad ? bad + ' failed' : 'all ok');
process.exit(bad ? 1 : 0);
