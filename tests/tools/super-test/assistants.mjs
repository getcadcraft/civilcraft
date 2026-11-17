// SPDX-License-Identifier: Apache-2.0
// Super's assistant tools in the real page (BK.59): Settings › Assistants for SuperCad Studio, the tool list on host.control, the project / workspace /
// selection / command tools, the model-data filter, and the hand-off to a mounted app's own dispatcher (BimCraft).   node tools/super-test/assistants.mjs
// Nothing is posted: every request that is not a page asset is aborted and counted.
import { start, launch, OUT } from './serve.mjs';
const { url, close } = await start({ langs: [''] }); const browser = await launch({ width: 1440, height: 900 });
let pass = 0, fail = 0; const ok = (c, m, x) => { if (c) pass++; else { fail++; console.log('FAIL', m, x === undefined ? '' : JSON.stringify(x).slice(0, 400)); } };
for (const [name, query] of [['docked layout', '?workspace=docked'], ['standard layout', '']]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage(); const errors = [], posts = [];
  page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
  await page.route('**/*', r => { const q = r.request(); if (q.method() !== 'GET' && q.method() !== 'HEAD') { posts.push(q.url()); return r.abort(); } return r.continue(); });
  await page.goto(url + query); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  await page.waitForFunction(() => window.superWindow.assistants, null, { timeout: 30000 });
  const tools = await page.evaluate(() => window.superWindow.assistants.tools);
  ok(tools.length === 18 && tools.includes('project_describe') && tools.includes('app_tool_run'), `${name}: the 18 tools are registered`, tools);
  // Settings › Assistants for Super itself (off by default: the mounted panel shows its own switch)
  const sec = await page.evaluate(() => { const r = document.querySelector('[data-sc-assistants-settings]'); return r ? { has: !!r.querySelector('[data-assist-on]'), on: r.querySelector('[data-assist-on]')?.checked } : null; });
  ok(sec && sec.has && sec.on === false, `${name}: Settings has the Assistants section for Super, off by default`, sec);
  // off: the dispatcher refuses (the person has not allowed assistants)
  const rpc = (method, params) => page.evaluate(async ([m, p]) => { const c = window.superWindow.assistants.host.control; return await c.handle({ jsonrpc: '2.0', id: Math.floor(Math.random() * 1e6), method: m, params: p }, 'page-test', { name: 'page-test' }); }, [method, params]);
  const off = await rpc('tools/list', {}); ok(off && off.error && /turned off|does not take assistants/.test(off.error.message), `${name}: refused while the person has not allowed assistants`, off);
  await page.evaluate(() => window.superWindow.assistants.host.control.configure({ enabled: true, groups: ['read', 'edit'] }));
  const list = (await rpc('tools/list', {})).result.tools.map(t => t.name); ok(list.length === 18, `${name}: allowed read + edit, 18 tools listed`, list.length);
  await page.evaluate(() => window.superWindow.assistants.host.control.configure({ groups: ['read'] }));
  ok((await rpc('tools/list', {})).result.tools.every(t => !/^(selection_set|workspace_set|command_run|app_tool_run)$/.test(t.name)) && true, `${name}: read only hides the four edit tools`);
  await page.evaluate(() => window.superWindow.assistants.host.control.configure({ groups: ['read', 'edit'] }));
  const call = async (n, a = {}) => { const r = (await rpc('tools/call', { name: n, arguments: a })).result; return { err: r.isError ? r.content[0].text : null, sc: r.structuredContent }; };
  // a project with a name holding an email: the filter holds it back
  await page.evaluate(() => { const p = window.superWindow.project; p.name = 'Villa for jane@example.com'; });
  let x = await call('project_describe'); ok(!x.err && /email held back/.test(x.sc.name) && !/jane@/.test(JSON.stringify(x.sc)), `${name}: project_describe passes through the model-data filter`, x);
  x = await call('app_info'); ok(!x.err && x.sc.app === 'supercadcraft' && typeof x.sc.workspace === 'string', `${name}: app_info names the workspace ${x.sc && x.sc.workspace}`);
  const was = x.sc.workspace;
  x = await call('workspace_get'); ok(!x.err && x.sc.workspaces.length >= 2, `${name}: workspace_get lists ${x.sc && x.sc.workspaces.map(w => w.id).join(',')}`);
  const other = x.sc.workspaces.find(w => w.id !== x.sc.active).id;
  x = await call('workspace_set', { id: other }); ok(!x.err && x.sc.active === other && x.sc.was === was, `${name}: workspace_set switches to ${other}`, x);
  ok(await page.evaluate(o => window.superWindow.state.active === o, other), `${name}: the window really shows ${other}`);
  x = await call('workspace_set', { id: was }); ok(!x.err && x.sc.active === was, `${name}: and back (the undo)`);
  await page.evaluate(() => window.superWindow.ready);
  x = await call('commands_find', { query: 'wall', limit: 5 }); ok(!x.err && x.sc.total > 0 && x.sc.items.every(c => c.key.includes(':')), `${name}: commands_find "wall": ${x.sc && x.sc.total} commands`, x.err);
  x = await call('command_run', { key: 'cadcraft:file.save' }); ok(x.err && /person presses it|No command/.test(x.err), `${name}: a file command is the person's to press`);
  // selection across the panels
  x = await call('selection_set', { refs: [{ app: 'bimcraft', id: '0aAbCdEfGhIjKlMnOpQrSt' }] });
  ok(!x.err && x.sc.selected === 1, `${name}: selection_set picks`, x);
  ok(await page.evaluate(() => { const g = window.superWindow.hub.get(); return g.source === 'assistant' && g.refs.length === 1; }), `${name}: the window's one selection holds it, source assistant`);
  x = await call('selection_get'); ok(!x.err && x.sc.source === 'assistant' && x.sc.selected.length === 1, `${name}: selection_get reads it back`);
  x = await call('selection_set', { clear: true }); ok(!x.err, `${name}: selection cleared`);
  x = await call('members_list'); ok(!x.err && x.sc.total === 0, `${name}: members_list on a new project: 0`);
  x = await call('objects_list'); ok(x.err ? /no object registry/.test(x.err) : Array.isArray(x.sc.items), `${name}: objects_list answers (registry ${x.err ? 'not in this build' : 'present'})`, x);
  // the mounted BimCraft: open its panel, allow its own assistants, hand a read on
  await page.evaluate(() => { const w = window.superWindow, s = JSON.parse(JSON.stringify(w.state)); s.active = s.workspaces.build ? 'build' : s.active; w.state = s; });
  await page.click('[role="tab"]:has-text("Building")').catch(() => {});
  const ready = await page.waitForFunction(() => ['ready', 'failed'].includes((document.querySelector('[data-panel="bim"]') || {}).dataset?.mount), null, { timeout: 60000 }).then(() => page.evaluate(() => document.querySelector('[data-panel="bim"]').dataset.mount)).catch(() => 'timeout');
  ok(ready === 'ready', `${name}: BimCraft mounted (${ready})`);
  if (ready === 'ready') {
    await page.waitForTimeout(1500);
    let al = await call('apps_list'); const bim = al.sc.apps.find(a => a.app === 'bimcraft');
    ok(bim && bim.state === 'ready' && bim.assistants === false, `${name}: apps_list: BimCraft mounted but its person has not allowed assistants`, bim);
    x = await call('app_tool_query', { app: 'bimcraft', tool: 'walls_list' }); ok(x.err && /does not take assistants/.test(x.err), `${name}: the hand-off respects the app's own switch`, x.err);
    await page.evaluate(async () => { const m = await import(Object.values(document.querySelectorAll('script[type=module]')).length ? '/assets/apps/bimcraft/dev/host.js' : ''); m.getHost({ app: 'bimcraft' }).control.configure({ enabled: true, groups: ['read'] }); });
    al = await call('apps_list'); const b2 = al.sc.apps.find(a => a.app === 'bimcraft');
    ok(b2 && b2.assistants === true && b2.toolCount > 10, `${name}: once the person allows it, apps_list shows BimCraft's own tools (${b2 && b2.toolCount})`);
    x = await call('app_tool_query', { app: 'bimcraft', tool: 'app_info' }); ok(!x.err && x.sc.result && x.sc.result.app === 'bimcraft', `${name}: app_tool_query hands the call to BimCraft's own app_info`, x);
    x = await call('app_tool_run', { app: 'bimcraft', tool: 'walls_add', arguments: {} }); ok(x.err && /no tool walls_add|not allowed/.test(x.err), `${name}: a changing tool is refused when the app only allows read`, x.err);
  }
  await page.screenshot({ path: `${OUT}/assistants-${query ? 'docked' : 'standard'}.png` });
  const mine = posts.filter(u => !/\/api\/account\/super-connect/.test(u)); ok(mine.length === 0, `${name}: the assistant tools posted nothing (the page's own account check, super-connect, is aborted and ignored)`, mine); ok(errors.length === 0, `${name}: no page errors`, errors.slice(0, 2));
  await ctx.close();
}
await browser.close(); close();
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
