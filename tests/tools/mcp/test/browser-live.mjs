#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-live.mjs — the live control channel in a real CadCraft window (docs/AGENTS-SPEC.md §6–7; X.5, X.6, X.9).
 *
 *   node tools/mcp/test/browser-live.mjs [--shots <dir>] [--verbose]      (run as root; also from bin/test-agents.mjs --browser)
 *
 * The chain Studio runs, with Studio's window channel stood in for: the official MCP SDK client → Streamable HTTP →
 * tools/mcp/live-server.mjs (token, Host, Origin, sessions) → createControlRelay (host.js) → a stand-in for
 * window.cadcraftStudio bridged into the page → CadCraft's host.control → agents.js tools on the real Doc and Engine.
 * Checks Settings › Assistants (off by default, the switches, the activity log, reset), the app bar indicator and
 * Disconnect, the "[Assistant]" history lines and undo labels (the person's Ctrl+Z takes the assistant's step back), a
 * screenshot, a plot download, refusals while the person is mid-command, and no console errors.
 * Own test admin agentstest+cadcraft@projectz.xyz (tools/mcp/test/admin.php up|down; disabled again at the end).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..', '..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
const VERBOSE = args.includes('--verbose');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + (typeof extra === 'string' ? extra : JSON.stringify(extra)).slice(0, 400) : '')); } };

const H = await import(pathToFileURL(path.join(REPO, 'public_html/assets/js/host.js')).href);
const { createLiveServer } = await import(pathToFileURL(path.join(REPO, 'tools/mcp/live-server.mjs')).href);
const SDK = path.join(REPO, 'tools/mcp/test/node_modules/@modelcontextprotocol/sdk/dist/esm');
const { Client } = await import(pathToFileURL(path.join(SDK, 'client/index.js')).href);
const { StreamableHTTPClientTransport } = await import(pathToFileURL(path.join(SDK, 'client/streamableHttp.js')).href);
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/mcp/test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- Studio's window channel, stood in: each page gets window.cadcraftStudio, Node holds the hub's end
const WIN = 'cadcraft-live1';
const hubHandlers = new Map();
const pages = new Map();   // window id → page
async function bridge(p, win, app) {
  pages.set(win, p);
  await p.exposeBinding('__ccStudioPost', (_src, json) => {
    const { type, data, to } = JSON.parse(json);
    for (const fn of hubHandlers.get(type) || []) { try { fn(data, { from: win, app, to: to || null, type }); } catch (e) { problems.push('hub: ' + e.message); } }
  });
  await p.addInitScript(([win, app]) => {
    const handlers = new Map();
    window.__ccStudioDeliver = (type, data, env) => { for (const fn of handlers.get(type) || []) { try { fn(data, env); } catch { /* a handler */ } } };
    window.cadcraftStudio = Object.freeze({ id: win, app, hub() {},
      post: (type, data, to) => { window.__ccStudioPost(JSON.stringify({ type, data, to })); return 'm'; },
      on: (type, fn) => { if (!handlers.has(type)) handlers.set(type, new Set()); handlers.get(type).add(fn); return () => handlers.get(type).delete(fn); } });
  }, [win, app]);
}
const hubCh = {
  id: 'studio-hub',
  on(type, fn) { if (!hubHandlers.has(type)) hubHandlers.set(type, new Set()); hubHandlers.get(type).add(fn); return () => hubHandlers.get(type).delete(fn); },
  post(type, data, to) {
    for (const [id, p] of pages) if (!to || to === id) p.evaluate(([type, data]) => window.__ccStudioDeliver && window.__ccStudioDeliver(type, data, { from: 'studio-hub', app: 'studio', type }), [type, data]).catch(() => {});
    return 'm';
  },
};
await bridge(page, WIN, 'cadcraft');

let srv, relay, client;
const connect = async (name = 'browser-live-test') => {
  const c = new Client({ name, version: '1.0.0' });
  await c.connect(new StreamableHTTPClientTransport(new URL(srv.url), { requestInit: { headers: { Authorization: 'Bearer ' + srv.token } } }));
  return c;
};
const names = async (c = client) => (await c.listTools()).tools.map((t) => t.name);
const count = () => page.evaluate(() => window.cadcraft.doc.count());

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'domcontentloaded' });
  await page.evaluate(() => { try { localStorage.removeItem('cadcraft.assistants.cadcraft'); } catch { /* fine */ } });
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);

  relay = H.createControlRelay({ channel: hubCh, onDisconnect: (sid) => srv.dropSession(sid) });
  srv = createLiveServer({ port: 0, forward: (m, s) => relay.handle(m, s) });
  await srv.start();
  await wait(300);

  console.log('\n== off by default');
  const set0 = await page.evaluate(() => { const r = document.querySelector('[data-assistants-settings]'); return r ? { on: r.querySelector('[data-assist-on]').checked, read: r.querySelector('[data-assist-group="read"]').checked, edit: r.querySelector('[data-assist-group="edit"]').checked, editDisabled: r.querySelector('[data-assist-group="edit"]').disabled, legend: r.querySelector('legend').textContent } : null; });
  ok(set0 && set0.on === false && set0.read && !set0.edit && set0.editDisabled && set0.legend === 'Assistants', 'Settings › CadCraft has Assistants, off; read the only group ticked', set0);
  ok(await page.evaluate(() => document.querySelector('[data-assist-indicator]')?.hidden === true), 'no app bar indicator while nobody is connected');
  client = await connect();
  ok((await names()).join() === 'windows_list', 'off: an assistant sees only Studio\'s windows_list');
  let r = await client.callTool({ name: 'drawing_describe', arguments: {} });
  ok(r.isError && /No app window takes assistants/.test(r.content[0].text), 'off: a CadCraft tool is unreachable');

  console.log('\n== turned on in Settings');
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  const tab = await page.$('[data-app-settings] [role="tab"]');
  if (tab) await tab.click();
  await page.click('[data-assist-on]');
  await wait(400);
  await shot('01-settings-on');
  ok(await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.assistants.cadcraft')).enabled === true), 'the switch is kept (cadcraft.assistants.cadcraft)');
  ok((await names()).join() === 'windows_list,app_info,drawing_describe,objects_list,object_get,drawing_check,selection_get,view_describe,view_screenshot', 'read: only the read tools are listed', await names());
  const wl = await client.callTool({ name: 'windows_list', arguments: {} });
  ok(wl.structuredContent.windows.length === 1 && wl.structuredContent.windows[0].assistants && wl.structuredContent.windows[0].allowed.join() === 'read', 'windows_list shows the CadCraft window and what it allows');
  r = await client.callTool({ name: 'app_info', arguments: {} });
  ok(r.structuredContent.app === 'cadcraft' && r.structuredContent.allowed.join() === 'read', 'app_info');
  r = await client.callTool({ name: 'command_run', arguments: { input: ['LINE', '0,0', '100,0', ''] } });
  ok(r.isError && /needs the edit permission/.test(r.content[0].text), 'command_run refused without edit');
  ok(await page.evaluate(() => !document.querySelector('[data-assist-indicator]').hidden && /browser-live-test/.test(document.querySelector('[data-assist-indicator]').textContent)), 'the app bar shows who is connected');
  await page.click('[data-assist-group="edit"]');
  await page.click('[data-assist-group="export"]');
  await wait(300);
  ok((await names()).includes('command_run') && (await names()).includes('drawing_plot') && !(await names()).includes('drawing_save'), 'edit + export ticked: command_run and drawing_plot listed, drawing_save not');
  await page.keyboard.press('Escape');
  await wait(200);

  console.log('\n== working in the drawing');
  const n0 = await count();
  r = await client.callTool({ name: 'command_run', arguments: { input: ['LINE', '0,0', '100,0', '100,50', ''] } });
  ok(!r.isError && r.structuredContent.counts.added === 2 && r.structuredContent.undo === 'Assistant: LINE' && (await count()) === n0 + 2, 'command_run LINE: two lines, one undo step "Assistant: LINE"', r.structuredContent || r.content);
  ok(/\[Assistant\] LINE · 0,0 · 100,0 · 100,50/.test(await page.textContent('[data-history]')), 'the person sees "[Assistant] LINE …" in the command history');
  r = await client.callTool({ name: 'command_run', arguments: { input: ['CIRCLE', '50,25', '10'] } });
  const cid = r.structuredContent.added[0];
  r = await client.callTool({ name: 'selection_set', arguments: { ids: [cid] } });
  r = await client.callTool({ name: 'selection_get', arguments: {} });
  ok(r.structuredContent.count === 1 && r.structuredContent.objects[0].id === cid && /radius 10/.test(r.structuredContent.objects[0].description), 'selection_set / selection_get');
  ok(await page.evaluate((id) => window.cadcraft.host.selection.has(id), cid), 'the selection shows in the window');
  r = await client.callTool({ name: 'objects_list', arguments: { type: 'circle' } });
  ok(r.structuredContent.objects.some((o) => o.id === cid && o.area > 314 && o.area < 315), 'objects_list with area');
  r = await client.callTool({ name: 'view_screenshot', arguments: { maxSize: 800 } });
  const img = r.content.find((c) => c.type === 'image');
  ok(img && img.mimeType === 'image/png' && Buffer.from(img.data, 'base64').subarray(1, 4).toString() === 'PNG' && r.structuredContent.width <= 800, 'view_screenshot: a PNG ≤ 800 px');
  r = await client.callTool({ name: 'view_describe', arguments: {} });
  ok(r.structuredContent.space === 'model' && r.structuredContent.visible && Array.isArray(r.structuredContent.layersShown), 'view_describe');
  const dl = page.waitForEvent('download', { timeout: 15000 });
  r = await client.callTool({ name: 'drawing_plot', arguments: { paper: 'iso-a4', name: 'assistant-plot' } });
  const d = await dl.catch(() => null);
  ok(!r.isError && d && d.suggestedFilename() === 'assistant-plot.pdf', 'drawing_plot downloads a PDF', r.content[0].text);
  if (d) { const p = await d.path(); ok(p && fs.readFileSync(p).subarray(0, 5).toString() === '%PDF-', 'the download is a PDF'); }
  await shot('02-connected');

  console.log('\n== the person stays in charge');
  const before = await count();
  await page.click('[data-cmd-input]');
  await page.keyboard.press('Control+z');
  await wait(200);
  ok((await count()) === before - 1 && (await page.evaluate(() => window.cadcraft.doc.redoStack[window.cadcraft.doc.redoStack.length - 1]?.label)) === 'Assistant: CIRCLE', 'the person\'s Ctrl+Z takes back the assistant\'s CIRCLE as one step');
  await page.keyboard.type('LINE');
  await page.keyboard.press('Enter');
  await wait(150);
  r = await client.callTool({ name: 'command_run', arguments: { input: ['C', '0,0', '5'] } });
  ok(r.isError && /in the middle of LINE/.test(r.content[0].text), 'an edit while the person is mid-command is refused');
  r = await client.callTool({ name: 'app_info', arguments: {} });
  ok(!r.isError && r.structuredContent.busy === 'LINE', 'reading still works, and says the window is busy');
  await page.keyboard.press('Escape');
  await wait(100);
  r = await client.callTool({ name: 'undo', arguments: {} });
  ok(r.structuredContent.undone.length === 1 && r.structuredContent.undone[0] === 'Assistant: LINE', 'undo takes the assistant\'s own step');

  console.log('\n== activity and Disconnect');
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  await page.evaluate(() => { document.querySelector('[data-assist-activity]').open = true; });
  const act = await page.evaluate(() => [...document.querySelectorAll('[data-assist-log] li')].map((li) => li.textContent));
  ok(act.length >= 8 && act.some((s) => /command_run.*refused/.test(s)) && act.some((s) => /Assistant: LINE/.test(s)), 'Settings › Assistants › Activity lists the calls, refusals marked', act.slice(0, 4));
  const logDl = page.waitForEvent('download', { timeout: 10000 });
  await page.click('[data-assist-save]');
  const ld = await logDl.catch(() => null);
  ok(ld && /assistant-activity\.jsonl$/.test(ld.suggestedFilename()), 'Save the log → a JSONL download');
  await shot('03-activity');
  await page.keyboard.press('Escape');
  await page.click('[data-assist-indicator]');
  await page.waitForSelector('.shell-assist-menu');
  await shot('04-indicator-menu');
  ok(/browser-live-test is connected to CadCraft/.test(await page.textContent('.shell-assist-menu')), 'the indicator menu says who is connected');
  await page.click('[data-assist-menu-disconnect]');
  await wait(300);
  ok(await client.callTool({ name: 'app_info', arguments: {} }).then(() => false, (e) => /404|ended/.test(e.message)), 'Disconnect: the assistant\'s session is ended');
  ok(await page.evaluate(() => document.querySelector('[data-assist-indicator]').hidden), 'the indicator goes away');
  await client.close().catch(() => {});

  console.log('\n== turned off, and Reset');
  client = await connect('second');
  ok((await names()).includes('command_run'), 'a new connection works while the switch is on');
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  await page.click('[data-assist-on]');
  await wait(300);
  r = await client.callTool({ name: 'app_info', arguments: {} }).catch((e) => ({ isError: true, content: [{ text: e.message }] }));
  ok(r.isError, 'turned off: the window refuses at once', r.content && r.content[0].text);
  await page.click('[data-assist-on]');
  await page.evaluate(() => document.querySelector('[data-app-settings]').dispatchEvent(new CustomEvent('cc-settings-reset')));
  await wait(200);
  ok(await page.evaluate(() => !document.querySelector('[data-assist-on]').checked && JSON.parse(localStorage.getItem('cadcraft.assistants.cadcraft')).enabled === false), 'Reset turns assistants off');
  await page.keyboard.press('Escape');
  await page.goto(BASE + '/lab/cadcraft?space=model', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  ok(await page.evaluate(() => document.querySelector('[data-assistants-settings]') && !document.querySelector('[data-assist-on]').checked), 'after a reload it stays off');
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  await shot('05-settings-model');
  await page.keyboard.press('Escape');
  await client.close().catch(() => {});

  console.log('\n== X.7: TakeoffCraft, MarkupCraft and ModelCraft windows');
  const allow = (app) => ctx.addInitScript((app) => { try { localStorage.setItem('cadcraft.assistants.' + app, JSON.stringify({ enabled: true, groups: ['read', 'edit', 'export'] })); } catch { /* fine */ } }, app);
  const appPage = async (app, win) => {
    const p = await ctx.newPage();
    p.on('console', (m) => { if (m.type() === 'error') problems.push(app + ' console: ' + m.text()); });
    p.on('pageerror', (e) => problems.push(app + ' pageerror: ' + e.message));
    await bridge(p, win, app);
    await p.goto(BASE + '/lab/' + app + '?space=paper', { waitUntil: 'networkidle' });
    await p.waitForFunction((a) => !!window[a], app);
    await wait(400);
    return p;
  };
  await allow('takeoffcraft'); await allow('markupcraft'); await allow('modelcraft');
  const tp = await appPage('takeoffcraft', 'takeoffcraft-live1');
  const mp = await appPage('markupcraft', 'markupcraft-live1');
  const op = await appPage('modelcraft', 'modelcraft-live1');
  relay.refresh();
  await wait(400);
  client = await connect('x7-test');
  const wins = (await client.callTool({ name: 'windows_list', arguments: {} })).structuredContent.windows;
  ok(['takeoffcraft-live1', 'markupcraft-live1', 'modelcraft-live1'].every((w) => wins.find((x) => x.window === w && x.assistants)), 'three more windows take assistants', wins);
  // TakeoffCraft: the fixture takeoff, quantities and estimate as the app computes them
  const job = JSON.parse(fs.readFileSync(path.join(REPO, 'tools/mcp/test/fixtures/job.takeoff.json'), 'utf8'));
  await tp.evaluate((j) => window.takeoffcraft.model.load(j), job);
  r = await client.callTool({ name: 'takeoff_quantities', arguments: { window: 'takeoffcraft-live1' } });
  ok(!r.isError && r.structuredContent.items.map((i) => i.quantity).join() === '40,120,3' && r.structuredContent.items[0].unscaledMarks === 1, 'TakeoffCraft takeoff_quantities: 40 LF, 120 SF, 3 EA (+1 unscaled)', r.structuredContent || r.content);
  r = await client.callTool({ name: 'takeoff_estimate', arguments: { window: 'takeoffcraft-live1' } });
  ok(r.structuredContent.total === '$2,102.50' && r.structuredContent.incomplete, 'TakeoffCraft takeoff_estimate: $2,102.50, incomplete');
  r = await client.callTool({ name: 'items_list', arguments: { window: 'takeoffcraft-live1' } });
  ok(r.structuredContent.items.length === 3 && r.structuredContent.items[0].components[0].formula === 'ceil(A*2/32)', 'TakeoffCraft items_list with assembly formulas');
  const xdl = tp.waitForEvent('download', { timeout: 15000 });
  r = await client.callTool({ name: 'takeoff_export', arguments: { window: 'takeoffcraft-live1', format: 'csv' } });
  const xd = await xdl.catch(() => null);
  ok(!r.isError && xd && /\.csv$/.test(xd.suggestedFilename()), 'TakeoffCraft takeoff_export → the app\'s own CSV download');
  // MarkupCraft: open the public plan sheet, add a cloud, list it, undo it
  const pdfB64 = fs.readFileSync(path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf')).toString('base64');
  await mp.evaluate(async (b) => { const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0)); await window.markupcraft.openFiles([new File([bin], 'kitchen-plan-sheet.pdf', { type: 'application/pdf' })]); }, pdfB64);
  await mp.waitForFunction(() => window.markupcraft.sheets.length === 1, null, { timeout: 20000 });
  r = await client.callTool({ name: 'markup_add', arguments: { window: 'markupcraft-live1', type: 'cloudrect', rect: [0.1, 0.1, 0.4, 0.3], comment: 'Check this wall' } });
  ok(!r.isError && r.structuredContent.undo === 'Assistant: add cloudrect' && (await mp.evaluate(() => window.markupcraft.store.all().length)) === 1, 'MarkupCraft markup_add: a cloud on the sheet, one undo step', r.structuredContent || r.content);
  r = await client.callTool({ name: 'markup_add', arguments: { window: 'markupcraft-live1', type: 'text', rect: [0.5, 0.5, 0.8, 0.55] } });
  ok(r.isError && /needs text/.test(r.content[0].text), 'a text box without text is refused');
  r = await client.callTool({ name: 'markups_list', arguments: { window: 'markupcraft-live1' } });
  ok(r.structuredContent.total === 1 && r.structuredContent.markups[0].comment === 'Check this wall' && /assistant/.test(r.structuredContent.markups[0].author), 'MarkupCraft markups_list; the author says it was the assistant');
  ok((await mp.evaluate(() => window.markupcraft.store.undoStack.at(-1).label)) === 'Assistant: add cloudrect', 'MarkupCraft undo list: "Assistant: add cloudrect"');
  if (SHOTS) await mp.screenshot({ path: path.join(SHOTS, '06-markupcraft.png') });
  // ModelCraft: a box and a cylinder, described, pictured, moved, undone
  r = await client.callTool({ name: 'box_add', arguments: { window: 'modelcraft-live1', size: ['2m', '3m', '4m'], at: ['1m', '1m'] } });
  ok(!r.isError && r.structuredContent.closed && Math.abs(r.structuredContent.volume - 24) < 1e-6, 'ModelCraft box_add: a closed 24 m³ box', r.structuredContent || r.content);
  const boxId = r.structuredContent.instance;
  r = await client.callTool({ name: 'cylinder_add', arguments: { window: 'modelcraft-live1', radius: '0.5m', height: '2m', center: ['6m', '0m'] } });
  ok(!r.isError && r.structuredContent.closed, 'ModelCraft cylinder_add');
  r = await client.callTool({ name: 'instance_move', arguments: { window: 'modelcraft-live1', id: boxId, by: ['0m', '0m', '1m'] } });
  r = await client.callTool({ name: 'model_describe', arguments: { window: 'modelcraft-live1' } });
  const bx = r.structuredContent.instances.find((i) => i.id === boxId);
  ok(r.structuredContent.instances.length >= 2 && bx && bx.at[2] === 1 && bx.solid, 'ModelCraft model_describe after a move', r.structuredContent);
  r = await client.callTool({ name: 'view_screenshot', arguments: { window: 'modelcraft-live1', maxSize: 600 } });
  ok(r.content && r.content[0].type === 'image' && Buffer.from(r.content[0].data, 'base64').subarray(1, 4).toString() === 'PNG', 'ModelCraft view_screenshot');
  if (SHOTS) await op.screenshot({ path: path.join(SHOTS, '07-modelcraft.png') });
  r = await client.callTool({ name: 'undo', arguments: { window: 'modelcraft-live1', steps: 3 } });
  ok(r.structuredContent.undone.join() === 'Assistant: move,Assistant: cylinder,Assistant: box' && (await op.evaluate(() => window.modelcraft.model.root.insts.size)) === 0, 'ModelCraft undo takes the three assistant steps back');
  ok(await op.evaluate(() => !!document.querySelector('[data-assistants-settings] [data-assist-on]')?.checked), 'ModelCraft Settings shows assistants on (Settings › Assistants mounted)');
  await client.close().catch(() => {});
  for (const p of [tp, mp, op]) await p.close();
  ok(!problems.length, 'no console errors', problems.join(' | '));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e && e.stack || e));
} finally {
  try { relay && relay.close(); } catch { /* closed */ }
  try { srv && await srv.close(); } catch { /* closed */ }
  await browser.close();
  execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']);
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
