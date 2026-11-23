// SPDX-License-Identifier: Apache-2.0
// SuperCad Studio, SC.6 "Preferences saved everywhere", in a real browser: no account and offline (this browser only), two browsers signed in to one
// account (a fake /api/account/super-connect and a fake /api/v1/prefs that validates and merges per section like Prefs.php), every category of the
// row, the status line, export / import (untrusted, the 2026-10-28 file too), reset per workspace and reset everything reaching the account, and
// storage blocked. The real endpoint and table: bin/test-super-prefs.php. The rules: bin/test-super-core.mjs.   node tools/super-test/prefs.mjs
import { start, launch } from './serve.mjs';
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath, pathToFileURL } from 'node:url';
const PR = await import(pathToFileURL(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../public_html/assets/apps/supercadcraft/dev/super-prefs.js')));
const { url: URL0, close } = await start({ langs: [''] });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const errors = [];
const TOKEN = 'ccu_' + 'P'.repeat(40);
const acct = { stored: null, puts: [], gets: 0, down: false };   // the account's copy
async function device({ signedIn = true, init = null } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  if (init) await ctx.addInitScript(init);
  await ctx.route('**/api/account/super-connect', r => r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: signedIn ? { signedIn: true, token: TOKEN } : { signedIn: false } }) }));
  const seen = { prefs: 0 };
  await ctx.route('**/api/v1/prefs', async r => {
    seen.prefs++;
    if (acct.down) return r.abort('internetdisconnected');
    if (r.request().headers().authorization !== 'Bearer ' + TOKEN) return r.fulfill({ status: 401, body: '{}' });
    if (r.request().method() === 'GET') { acct.gets++; return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: { prefs: acct.stored } }) }); }
    const v = PR.validate(JSON.parse(r.request().postData()));   // like Prefs::put: validate, then merge per section (a = stored, b = sent)
    if (!v.ok) return r.fulfill({ status: 400, body: '{}' });
    acct.puts.push(v.prefs); acct.stored = PR.merge(v.prefs, acct.stored).prefs;
    return r.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: { prefs: acct.stored } }) });
  });
  const page = await ctx.newPage(); const d = { ctx, page, seen, accept: true, asked: [] };
  page.on('dialog', x => { d.asked.push(x.message()); (d.accept ? x.accept() : x.dismiss()).catch(() => {}); });
  page.on('pageerror', e => errors.push(String(e.message)));
  page.on('console', m => { if (m.type() === 'error' && !/favicon|Failed to load resource|bad HTTP response code|ERR_INTERNET_DISCONNECTED|net::ERR/.test(m.text())) errors.push(m.text()); });
  d.boot = async () => { await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready); };
  await d.boot();
  return d;
}
const ls = (page, k) => page.evaluate(key => localStorage.getItem(key), k);
const statusText = page => page.evaluate(() => document.querySelector('[data-sc-prefs-status]').textContent);
const saved = page => page.waitForFunction(() => /^Saved to your account at \d/.test(document.querySelector('[data-sc-prefs-status]').textContent), null, { timeout: 15000 }).then(() => true, () => false);
const until = async (fn, ms = 15000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (fn()) return true; await new Promise(r => setTimeout(r, 150)); } return false; };
const setTheme = (page, v) => page.evaluate(val => { const r = document.querySelector(`dialog[data-app-settings] input[name="theme"][value="${val}"]`); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); }, v);
const setUnits = (page, v) => page.evaluate(val => { const s = document.querySelector('[data-sc-units]'); s.value = val; s.dispatchEvent(new Event('change', { bubbles: true })); }, v);
const openSetup = async page => { await page.evaluate(() => { const s = document.querySelector('[data-settings-open]'); s && s.click(); }); await page.waitForSelector('dialog[data-app-settings][open]'); await page.click('.shell-sec-nav button:text-is("Your setup")'); };
const closeSettings = page => page.evaluate(() => { const d = document.querySelector('dialog[data-app-settings]'); if (d.open) d.close(); });
const mountCad = async page => {
  await page.evaluate(() => { const w = window.superWindow, s = JSON.parse(JSON.stringify(w.state)); const c = s.workspaces[s.active].docks.center; if (!c.length) c.push({ tabs: [], active: 'cad' }); if (!c[0].tabs.includes('cad')) c[0].tabs.unshift('cad'); c[0].active = 'cad'; w.state = s; });
  await page.waitForFunction(() => { const m = document.querySelector('[data-panel="cad"]')?.dataset.mount; return m === 'ready' || m === 'failed'; }, null, { timeout: 60000 });
  return page.evaluate(() => document.querySelector('[data-panel="cad"]').dataset.mount);
};

/* ---- 1. no account: this browser only, and offline ---- */
{
  const d = await device({ signedIn: false }), { page } = d;
  ok(await statusText(page) === 'Working from this browser only', 'no account: the status line says so: ' + await statusText(page));
  ok(await page.locator('[data-sc-prefs-token]').count() === 0, 'there is no pasted-token field any more');
  ok(await page.evaluate(() => !document.querySelector('[data-sc-prefs-signin]').hidden && document.querySelector('[data-sc-prefs-sync]').hidden), 'signed out: Sign in is offered, Sync now is not');
  await setUnits(page, 'ft'); await setTheme(page, 'model');
  await page.evaluate(() => window.ccShellWorkspace.set('duncan'));
  await page.waitForTimeout(5200);   // past the watch and the send delay
  ok(await ls(page, 'cc-super-units') === 'ft' && await ls(page, 'cc-space') === 'model' && await ls(page, 'cc-workspace') === 'duncan', 'units, theme and layout are kept in this browser');
  ok(d.seen.prefs === 0, 'and nothing is asked of an account: ' + d.seen.prefs);
  const st = JSON.parse(await ls(page, 'cc-super-prefs-at') || '{}');
  ok(st.shell > '2026' && st.window > '2026', 'each changed part is time-stamped, so a later sign-in knows which copy is newer');
  await d.ctx.setOffline(true);
  await openSetup(page);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-sc-prefs-export]')]);
  const off = JSON.parse(fs.readFileSync(await dl.path(), 'utf8'));
  ok(dl.suggestedFilename().endsWith('.ccprefs.json') && off.sections.shell.keys['cc-space'] === 'model' && off.sections.shell.keys['cc-workspace'] === 'duncan' && off.sections.window.keys['cc-super-units'] === 'ft', 'offline: the setup still saves to one file, with the theme, layout and units in it');
  await setUnits(page, 'in'); await page.waitForTimeout(600);
  ok(await ls(page, 'cc-super-units') === 'in' && await statusText(page) === 'Working from this browser only', 'offline: a change is still kept, and nothing breaks');
  await closeSettings(page); await d.ctx.setOffline(false);
  await d.boot();
  ok(await page.evaluate(() => document.documentElement.getAttribute('data-space')) === 'model' && await page.evaluate(() => window.ccShellWorkspace.get()) === 'duncan' && await page.evaluate(() => window.superWindow.project.units.length) === 'in', 'after a restart the theme, the layout and the units are as left');
  await d.ctx.close();
}

/* ---- 2. signed in: every category follows the account by itself ---- */
const A = await device();
let rowsSet = null;
{
  const { page } = A;
  ok(await saved(page), 'signed in: the status line says Saved to your account at a time: ' + await statusText(page));
  ok(await page.evaluate(() => document.querySelector('[data-sc-prefs-signin]').hidden && !document.querySelector('[data-sc-prefs-sync]').hidden), 'signed in: Sync now is offered, Sign in is not');
  ok(acct.stored && acct.stored.sections.window && JSON.parse(acct.stored.sections.window.keys['cc-super-window']).workspaces, 'the first start sends this browser\'s window to an account that had nothing');
  ok(!JSON.stringify(acct.puts).includes('ccu_') && !JSON.stringify(acct.puts).includes('cc-super-token'), 'the key itself is never part of the setup');
  const n0 = acct.puts.length;
  // workspaces: which are on the bar, the arrangement, a torn-off panel, a workspace's tool rows
  rowsSet = await page.evaluate(() => { const w = window.superWindow, s = JSON.parse(JSON.stringify(w.state)); if (!s.shown.includes('report')) s.shown.push('report'); s.workspaces.build.sizes.left = 333; w.M.setRows(s, { pin: { g1: ['t1', 't2'] }, off: ['t9'] }, 'build'); w.state = s; const got = w.state; return { shown: got.shown, rows: got.workspaces.build.rows, left: got.workspaces.build.sizes.left }; });
  await page.evaluate(() => window.ccShellWorkspace.set('duncan'));   // the layout choice (the shell's own call)
  await setTheme(page, 'model');   // the real Settings control
  await setUnits(page, 'ft');      // the real Settings control
  await page.evaluate(() => { localStorage.setItem('cc-units', '{"length":"imperial"}'); localStorage.setItem('cc-devices', '{"v":1,"pen":{}}'); });   // written by the shell's Units and Devices settings on any app page of this site
  await page.evaluate(() => { localStorage.setItem('cadcraft.input', '{"format":"cadcraft-input","version":1,"style":"cad"}'); localStorage.setItem('cadcraft.shortcuts', '{"format":"cadcraft-shortcuts","version":1,"keys":{"L":"LINE"}}'); });   // written by CadCraft's own Menus, keys and mouse on its own page
  ok(await mountCad(page) === 'ready', 'the real CadCraft panel is open');
  await page.waitForSelector('[data-panel="cad"] [data-qp]', { state: 'attached' });
  const qp0 = await page.evaluate(() => document.querySelector('[data-panel="cad"] [data-qp]').getAttribute('aria-pressed'));
  await page.evaluate(() => document.querySelector('[data-panel="cad"] [data-qp]').click());   // CadCraft's own Quick Properties switch, in its panel
  const qp1 = await page.evaluate(() => document.querySelector('[data-panel="cad"] [data-qp]').getAttribute('aria-pressed'));
  ok(qp0 !== qp1 && JSON.parse(await ls(page, 'cadcraft.props')).extra.qpOn === (qp1 === 'true'), 'a switch in the real CadCraft panel is kept by CadCraft itself: ' + qp0 + ' → ' + qp1);
  const want = () => { const s = acct.stored && acct.stored.sections; if (!s || !s.shell || !s['app:cadcraft'] || !s.window) return false; const w = JSON.parse(s.window.keys['cc-super-window'] || '{}');
    return s.shell.keys['cc-workspace'] === 'duncan' && s.shell.keys['cc-space'] === 'model' && s.shell.keys['cc-units'] && s.shell.keys['cc-devices'] && s.window.keys['cc-super-units'] === 'ft' && w.shown && w.shown.includes('report') && w.workspaces.build.rows && w.workspaces.build.sizes.left === 333
      && s['app:cadcraft'].keys['cadcraft.input'] && s['app:cadcraft'].keys['cadcraft.shortcuts'] && JSON.parse(s['app:cadcraft'].keys['cadcraft.props'] || '{}').extra?.qpOn === (qp1 === 'true'); };
  ok(await until(want), 'within seconds, with nothing pressed, the account holds: workspaces on the bar, arrangement, tool rows, layout, theme, both units, devices, CadCraft\'s keys, mouse and panel switch: ' + JSON.stringify(Object.keys(acct.stored?.sections || {})));
  ok(acct.puts.length > n0 && acct.puts.slice(n0).every(p => Object.keys(p.sections).every(s => ['window', 'shell', 'app:cadcraft'].includes(s))), 'only the parts that changed were sent: ' + JSON.stringify(acct.puts.slice(n0).map(p => Object.keys(p.sections))));
  ok(/^Saved to your account at \d/.test(await statusText(page)), 'and the status line still says saved, with the time');
}

/* ---- 3. a second browser signed in to the same account picks it up ---- */
const B = await device();
{
  const { page } = B; const before = JSON.stringify(acct.stored.sections.window.keys);
  ok(await saved(page), 'second browser: synced at the start');
  const got = await page.evaluate(() => { const s = window.superWindow.state; return { shown: s.shown, rows: s.workspaces.build.rows, left: s.workspaces.build.sizes.left }; });
  ok(JSON.stringify(got) === JSON.stringify(rowsSet), 'the window shows the first browser\'s workspaces, arrangement and tool rows at once, with no reload: ' + JSON.stringify(got));
  ok(await page.evaluate(() => document.documentElement.getAttribute('data-space')) === 'model', 'the theme changes at once');
  ok(await ls(page, 'cc-workspace') === 'duncan' && await ls(page, 'cc-super-units') === 'ft' && !!(await ls(page, 'cc-units')) && !!(await ls(page, 'cc-devices')) && !!(await ls(page, 'cadcraft.input')) && !!(await ls(page, 'cadcraft.shortcuts')), 'layout, units, devices and CadCraft\'s keys and mouse are in this browser');
  ok(JSON.stringify(acct.stored.sections.window.keys) === before, 'the second browser\'s starting window did not replace the account\'s');
  await openSetup(page);
  const note = await page.evaluate(() => { const p = document.querySelector('[data-sc-prefs-restart]'); return p.hidden ? '' : p.textContent; });
  ok(/Reload to use it in: .*the layout and menu style/.test(note) && !/2D drawing/.test(note), 'what must start again to read its part says so (the layout; CadCraft is not open yet, so it is not named): ' + note.trim());
  await Promise.all([page.waitForNavigation(), page.click('[data-sc-prefs-reload]')]);
  await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  ok(await page.evaluate(() => window.ccShellWorkspace.get()) === 'duncan' && await page.evaluate(() => window.superWindow.project.units.length) === 'ft', 'after Reload now the layout and the units are the first browser\'s');
  ok(await mountCad(page) === 'ready', 'CadCraft opens in the second browser');
  await page.waitForSelector('[data-panel="cad"] [data-qp]', { state: 'attached' });
  ok(await page.evaluate(() => document.querySelector('[data-panel="cad"] [data-qp]').getAttribute('aria-pressed')) === await A.page.evaluate(() => document.querySelector('[data-panel="cad"] [data-qp]').getAttribute('aria-pressed')), 'and its Quick Properties switch is as the first browser left it');
}

/* ---- 4. both change the same part: the newer wins, the older is kept once; an open app is named ---- */
{
  await B.page.waitForTimeout(1100);   // stamps are whole seconds
  await setUnits(B.page, 'mm');
  ok(await until(() => acct.stored.sections.window.keys['cc-super-units'] === 'mm'), 'a later change on the second browser reaches the account by itself');
  ok(acct.stored.sections.window.previous && acct.stored.sections.window.previous.keys['cc-super-units'] === 'ft', 'the copy it replaced is kept once on the account');
  await B.page.evaluate(() => document.querySelector('[data-panel="cad"] [data-qp]').click());
  const bq = await B.page.evaluate(() => document.querySelector('[data-panel="cad"] [data-qp]').getAttribute('aria-pressed'));
  ok(await until(() => JSON.parse(acct.stored.sections['app:cadcraft'].keys['cadcraft.props']).extra.qpOn === (bq === 'true')), 'a change in the real CadCraft panel on the second browser reaches the account');
  await openSetup(A.page); await A.page.click('[data-sc-prefs-sync]');
  ok(await until(() => true) && await A.page.waitForFunction(() => localStorage.getItem('cc-super-units') === 'mm', null, { timeout: 10000 }).then(() => true, () => false), 'Sync now on the first browser takes the newer units');
  const note = await A.page.evaluate(() => { const p = document.querySelector('[data-sc-prefs-restart]'); return p.hidden ? '' : p.textContent; });
  ok(/Reload to use it in: .*2D drawing/.test(note), 'CadCraft (named by its work, 2D drawing) is open there, so it is named as needing a reload: ' + note.trim());
  await closeSettings(A.page);
}

/* ---- 5. the account cannot be reached: said plainly, kept here, sent later ---- */
{
  acct.down = true; await A.page.waitForTimeout(1100);
  await setUnits(A.page, 'cm');
  ok(await A.page.waitForFunction(() => /your account cannot be reached/.test(document.querySelector('[data-sc-prefs-status]').textContent), null, { timeout: 15000 }).then(() => true, () => false), 'account unreachable: the status line says this browser only, and why: ' + await statusText(A.page));
  ok(await ls(A.page, 'cc-super-units') === 'cm' && acct.stored.sections.window.keys['cc-super-units'] === 'mm', 'the change is kept here and the account is as it was');
  acct.down = false; await A.page.evaluate(() => window.dispatchEvent(new Event('online')));
  ok(await until(() => acct.stored.sections.window.keys['cc-super-units'] === 'cm'), 'when the network is back the change is sent by itself');
  ok(await saved(A.page), 'and the status line says saved again');
}

/* ---- 6. export and import as one file ---- */
let exported = '';
{
  const { page } = A; await openSetup(page);
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-sc-prefs-export]')]);
  exported = fs.readFileSync(await dl.path(), 'utf8'); const doc = JSON.parse(exported);
  ok(doc.format === 'supercadcraft-prefs' && doc.sections.shell.keys['cc-space'] === 'model' && doc.sections.shell.keys['cc-units'] && doc.sections.shell.keys['cc-devices'] && doc.sections['app:cadcraft'].keys['cadcraft.props'] && JSON.parse(doc.sections.window.keys['cc-super-window']).workspaces.build.rows, 'the one file holds the newly carried categories too (theme, units, devices, an app\'s panel switches, tool rows)');
  ok(!exported.includes('ccu_') && !exported.includes('cc-super-prefs-seen'), 'and no key or bookkeeping');
  await closeSettings(page);
  const C = await device({ signedIn: false }); const cp = C.page;
  await cp.evaluate(() => { window.superWindow.prefs.reload = () => { window.__reloaded = (window.__reloaded || 0) + 1; }; localStorage.setItem('cc-keep', 'mine'); });
  C.accept = false; await openSetup(cp);
  await cp.setInputFiles('[data-sc-prefs-import]', { name: 'setup.ccprefs.json', mimeType: 'application/json', buffer: Buffer.from(exported) });
  await until(() => C.asked.length > 0);
  ok(C.asked.length === 1 && /Replace .*the window's workspaces.*the layout and menu style.*2D drawing/.test(C.asked[0]), 'loading a file asks first and names the parts it would replace: ' + C.asked[0]);
  ok(await ls(cp, 'cc-workspace') !== 'duncan' && !(await cp.evaluate(() => window.__reloaded)), 'answering no changes nothing');
  C.accept = true;
  await cp.setInputFiles('[data-sc-prefs-import]', { name: 'setup.ccprefs.json', mimeType: 'application/json', buffer: Buffer.from(exported) });
  ok(await cp.waitForFunction(() => window.__reloaded === 1, null, { timeout: 10000 }).then(() => true, () => false), 'answering yes loads it and the apps are started again');
  ok(await ls(cp, 'cc-workspace') === 'duncan' && await ls(cp, 'cc-space') === 'model' && !!(await ls(cp, 'cadcraft.shortcuts')) && await ls(cp, 'cc-keep') === 'mine' && await cp.evaluate(() => window.superWindow.state.workspaces.build.sizes.left) === 333, 'the layout, theme, CadCraft\'s keys and the window are the file\'s; nothing else is touched');
  // untrusted: unknown keys, unknown sections, a wrong type, too big
  const hostile = JSON.stringify({ format: 'supercadcraft-prefs', version: 1, sections: { shell: { at: '2026-11-11T10:00:00Z', keys: { 'cc-icons': 'outline', 'cc-super-token': 'ccu_' + 'X'.repeat(40), evil: 'y', 'cc-space': 7 } }, 'app:evil': { keys: { a: 'b' } }, window: { at: '2026-11-11T10:00:00Z', keys: { 'cc-super-window': '{"not":"a window"}' } } } });
  const hr = await cp.evaluate(t => window.superWindow.prefs.importText(t, { confirmFn: () => true }), hostile);
  ok(hr.ok && await ls(cp, 'cc-icons') === 'outline' && await ls(cp, 'cc-super-token') === null && await ls(cp, 'evil') === null && await cp.evaluate(() => !!window.superWindow.state.workspaces.build), 'a hostile file: the known key is taken; a key, an unknown key, a wrong type and a damaged window are not');
  const big = await cp.evaluate(() => window.superWindow.prefs.importText('{"format":"supercadcraft-prefs","version":1,"pad":"' + 'x'.repeat(2 * 1024 * 1024) + '"}', { confirmFn: () => true }));
  ok(!big.ok && (await cp.textContent('[data-sc-prefs-msg]')).includes('not a SuperCad Studio setup'), 'a file over the size limit is refused, in words');
  // a file saved on 2026-10-28 (the first format: fewer keys)
  const oct = JSON.stringify({ format: 'supercadcraft-prefs', version: 1, saved: '2026-10-28T10:00:00Z', name: 'SuperCad Studio setup', sections: { shell: { at: '2026-10-28T10:00:00Z', keys: { 'cc-workspace': 'docked', 'cc-input-family': 'cad' } }, 'app:bimcraft': { at: '2026-10-28T10:00:00Z', keys: { 'bimcraft.input': '{"format":"cadcraft-input","version":1}', 'cc-app-settings:bimcraft': '{"tb":"icons"}' } } } });
  const or = await cp.evaluate(t => window.superWindow.prefs.importText(t, { confirmFn: () => true }), oct);
  ok(or.ok && or.changed.sort().join() === 'app:bimcraft,shell' && await ls(cp, 'cc-workspace') === 'docked' && await ls(cp, 'cc-input-family') === 'cad' && await ls(cp, 'cc-app-settings:bimcraft') === '{"tb":"icons"}', 'a setup file from 2026-10-28 still loads');
  ok(await ls(cp, 'cc-space') === null && await ls(cp, 'cc-icons') === null, 'a part a file holds replaces that part whole (what the file leaves out of it is removed)');
  ok(C.seen.prefs === 0, 'none of that asked anything of an account (signed out)');
  await C.ctx.close();
}

/* ---- 7. reset this workspace, reset everything: asked first, and the account follows ---- */
{
  const { page } = A; await page.waitForTimeout(1100);
  await page.evaluate(() => { const w = window.superWindow, s = JSON.parse(JSON.stringify(w.state)); s.active = 'build'; s.workspaces.build.docks.center = []; w.state = s; });
  await openSetup(page); A.asked.length = 0; A.accept = false;
  await page.click('[data-sc-prefs-reset-ws]'); await until(() => A.asked.length > 0);
  ok(/Put the Build workspace back/.test(A.asked[0] || '') && await page.evaluate(() => window.superWindow.state.workspaces.build.docks.center.length) === 0, 'Reset this workspace asks first, by name; no = nothing changes: ' + A.asked[0]);
  A.accept = true; await page.click('[data-sc-prefs-reset-ws]');
  ok(await page.waitForFunction(() => window.superWindow.state.workspaces.build.docks.center.length > 0 && !window.superWindow.state.workspaces.build.rows, null, { timeout: 5000 }).then(() => true, () => false), 'yes: the workspace has its starting panels and tool rows again');
  ok(await until(() => { const w = JSON.parse(acct.stored.sections.window.keys['cc-super-window']); return w.workspaces.build.docks.center.length > 0 && !w.workspaces.build.rows && w.shown.includes('report'); }), 'and the account\'s copy is reset too (the other workspaces on the bar are left alone)');
  // everything
  await page.evaluate(() => { window.superWindow.prefs.reload = () => { window.__reloaded = (window.__reloaded || 0) + 1; }; });
  await page.waitForTimeout(1100); A.asked.length = 0; A.accept = false;
  await page.click('[data-sc-prefs-reset-all]'); await until(() => A.asked.length > 0);
  ok(/Put everything back/.test(A.asked[0] || '') && await ls(page, 'cc-workspace') === 'duncan', 'Reset everything asks first; no = nothing changes');
  A.accept = true; await page.click('[data-sc-prefs-reset-all]');
  ok(await page.waitForFunction(() => window.__reloaded === 1, null, { timeout: 10000 }).then(() => true, () => false), 'yes: it resets and starts again');
  ok(await ls(page, 'cc-workspace') === null && await ls(page, 'cc-space') === null && await ls(page, 'cadcraft.shortcuts') === null && await ls(page, 'cadcraft.input') === null && await page.evaluate(() => !window.superWindow.state.shown.includes('report')), 'layout, theme, CadCraft\'s keys and mouse and the workspaces on the bar are back to the start');
  const s = acct.stored.sections;
  ok(Object.keys(s.shell.keys).length === 0 && Object.keys(s['app:cadcraft'].keys).length === 0 && s.shell.previous && s.shell.previous.keys['cc-workspace'] === 'duncan' && !JSON.parse(s.window.keys['cc-super-window']).shown.includes('report'), 'the account\'s copy is reset too, and what it replaced is kept once');
  await closeSettings(page);
  await openSetup(B.page); await B.page.click('[data-sc-prefs-sync]');
  ok(await B.page.waitForFunction(() => localStorage.getItem('cc-workspace') === null && localStorage.getItem('cadcraft.shortcuts') === null, null, { timeout: 10000 }).then(() => true, () => false), 'the reset reaches the second browser at its next sync');
  await closeSettings(B.page);
}
await A.ctx.close(); await B.ctx.close();

/* ---- 8. storage blocked: nothing breaks ---- */
{
  let booted = true, d = null;
  try { d = await device({ signedIn: false, init: () => { const bad = () => { throw new DOMException('blocked', 'SecurityError'); }; try { Object.defineProperty(Storage.prototype, 'setItem', { value: bad }); } catch { /* none */ } } }); } catch (e) { booted = false; console.log('  (storage blocked: the page did not start: ' + String(e.message).split('\n')[0] + ')'); }
  ok(booted, 'storage that refuses every write: the page still starts');
  if (d) {
    ok(await statusText(d.page) === 'Working from this browser only', 'and the setup says this browser only');
    await setUnits(d.page, 'ft'); await d.page.waitForTimeout(3600);
    const doc = await d.page.evaluate(() => { try { return window.superWindow.prefs.capture().format; } catch (e) { return 'threw ' + e.message; } });
    ok(doc === 'supercadcraft-prefs', 'the setup can still be gathered (what there is of it): ' + doc);
    await d.ctx.close();
  }
}

const mine = errors.filter(e => /prefs|super-wire|super-home-layout|accountSync/i.test(e));

/* ---- SCF.9: the page tells SuperCad Desktop's shell its sync state (a stand-in cadcraftDesktop.sync.state records the calls) ---- */
{
  const stub = () => { window.__syncCalls = []; window.cadcraftDesktop = { sync: { state: x => { window.__syncCalls.push(x); return Promise.resolve(); } } }; };
  const d = await device({ signedIn: true, init: stub }), { page } = d;
  await setUnits(page, 'ft');
  ok(await saved(page), 'desktop shell: the account copy is saved');
  const calls = await page.evaluate(() => window.__syncCalls);
  ok(calls.length > 0 && calls.every(x => ['synced', 'offline', 'problem', 'off'].includes(x.state) && x.waiting === 0 && (x.state === 'problem' ? x.problems === 1 : x.problems === 0)), 'desktop shell: every report is { state, waiting: 0, problems } in the shell\'s words: ' + JSON.stringify(calls).slice(0, 200));
  ok(calls.some(x => x.state === 'synced'), 'desktop shell: a saved state is reported as synced');
  acct.down = true; await setUnits(page, 'in'); const offline = await until(() => true, 10);
  await page.waitForFunction(() => window.__syncCalls.some(x => x.state === 'offline' || x.state === 'problem'), null, { timeout: 15000 }).catch(() => {});
  ok((await page.evaluate(() => window.__syncCalls)).some(x => x.state === 'offline' || x.state === 'problem') || offline === false, 'desktop shell: offline or a refused save is reported');
  acct.down = false; await d.ctx.close();
  const plain = await device({ signedIn: true }); await setTheme(plain.page, 'paper'); await plain.page.waitForTimeout(800);
  ok(await plain.page.evaluate(() => typeof window.cadcraftDesktop === 'undefined'), 'in a plain browser there is no shell to tell, and nothing breaks'); await plain.ctx.close();
}

ok(mine.length === 0, 'no error from the setup code: ' + mine.slice(0, 3).join(' | '));
if (errors.length) console.log('  page errors seen (' + errors.length + '): ' + [...new Set(errors)].slice(0, 5).map(e => e.slice(0, 160)).join(' | '));
console.log(`prefs page: ${pass} passed, ${fail} failed`);
await browser.close(); close(); process.exit(fail ? 1 : 0);
