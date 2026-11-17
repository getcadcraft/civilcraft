// SPDX-License-Identifier: Apache-2.0
// Super: the teams plugin's sync against the REAL getcadcraft.com account API, with a throwaway fixture account (bin/lab-sync-fixture.php: labsync+cadcraft-1@projectz.xyz and a real
// device token; removed at the end, even on a failure). The page is the lab build served by the test harness; its /api/v1 calls are forwarded to https://getcadcraft.com with the
// token, and the server's side is read back with the same token. Run as ROOT (the fixture runs as www-data through sudo).
//   node tools/super-test/teams-sync-live.mjs
import { start, launch, OUT } from './serve.mjs';
import { execFileSync } from 'node:child_process'; import path from 'node:path';
const ROOT = path.resolve(OUT, '../..'), SITE = 'https://getcadcraft.com';
const fx = args => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'bin/lab-sync-fixture.php'), ...args], { encoding: 'utf8' });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const F = JSON.parse(fx(['create']).trim().split('\n').pop());
let browser, close;
try {
  const api = async (p, body) => { const r = await fetch(SITE + p, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + F.token, Accept: 'application/json', ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined }); return { status: r.status, json: await r.json().catch(() => ({})) }; };
  const names = async () => ((await api('/api/v1/team/teams')).json.data.teams || []).map(t => t.name).sort();
  const rows = async () => (await api('/api/v1/team/teams?since=0')).json.data.tables;
  const info = await api('/api/v1/account/database'); ok(info.status === 200 && info.json.data.db.id === F.db, 'the real server names this account\'s hashed database: ' + (info.json.data && info.json.data.db.id.slice(0, 12)));

  const h = await start({ langs: [''] }); close = h.close;
  browser = await launch(); const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  // the page does what a real tab does: asks /api/account/super-connect for its key. This page is served locally (no site cookie), so that one answer hands over the fixture's real token; every other call is real.
  await ctx.route('**/api/account/super-connect', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: { signedIn: true, token: F.token, expires_at: 'x' } }) }));
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|fetching the script/.test(m.text())) errors.push(m.text()); });
  let offline = false; const hits = [];
  await page.route(/\/api\/v1\/(team|account)\//, async route => {
    const u = new URL(route.request().url()); hits.push(route.request().method() + ' ' + u.pathname + u.search);
    if (offline) return route.abort('internetdisconnected');
    const r = await route.fetch({ url: SITE + u.pathname + u.search }); await route.fulfill({ response: r });
  });
  await page.goto(h.url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  const ST = '[data-pstat="teams:sync"]', TXT = ST + ' .sc-pstat-text', DLG = '[data-home-view="page"]:not([hidden])';
  const stText = () => page.textContent(TXT);
  const waitText = (re, ms = 12000) => page.waitForFunction(([s, src]) => new RegExp(src, 'i').test((document.querySelector(s) || {}).textContent || ''), [TXT, re.source], { timeout: ms }).catch(async e => { throw new Error('status line stuck on "' + await stText() + '" waiting for ' + re); });
  const SYNCED = /synced (just now|\d+ min)/;
  const run = k => page.evaluate(x => window.superWindow.plugins.run(x), 'teams:' + k);
  const closeDlgs = async () => { await page.evaluate(() => { try { window.superWindow.home.leave(); } catch { /* already on the work area */ } }); await page.waitForTimeout(80); };
  const PG = '[data-home-view="page"]:not([hidden])';   // Teams and Team members are PAGES of the welcome area, not dialogs
  const toWork = async () => { await page.evaluate(() => window.superWindow.home.leave()); await page.waitForTimeout(150); };   // back to the drawing space (the status line lives there)
  const openTeams = async () => { await run('teams'); await page.waitForSelector(PG + ' [data-tm-new]'); };
  const top = () => page.evaluate(() => { const d = document.querySelector('dialog[data-sc-plugin="teams"][open]'); if (d) d.scrollTop = 0; });
  const syncNow = async (re = SYNCED) => { await page.click(ST + ' [data-act="pstat:teams:sync"]'); await waitText(re); await page.waitForTimeout(200); };
  const tableRows = async () => page.$$eval(DLG + ' [data-sy-table]', rs => Object.fromEntries(rs.map(r => [r.dataset.syTable, { match: r.dataset.syMatch, cells: [...r.children].map(c => c.textContent) }])));

  // 1. the first automatic sync talks to the real server
  await waitText(SYNCED); ok(hits.some(x => x === 'GET /api/v1/account/database') && hits.some(x => x.startsWith('GET /api/v1/team/teams?since=')), 'the automatic sync asked the real server: ' + [...new Set(hits)].join(' | '));
  ok(/^Teams: synced/.test(await stText()), 'status line: "' + await stText() + '"');
  // 2. a team and a person made in the dialog reach the real account database by themselves
  await openTeams(); await page.fill(PG + ' [data-tm-new]', 'Live lab team'); await page.click(PG + ' [data-act="team-add"]'); await page.waitForSelector(PG + ' [data-team-card]');
  await page.click(PG + ' [data-act="team-members"]'); await page.waitForSelector(PG + ' [data-tmm-team]');   // the people of a team have their own page
  await page.fill(PG + ' [data-tm-p="email"]', 'ann@example.com'); await page.fill(PG + ' [data-tm-p="name"]', 'Ann Live'); await page.fill(PG + ' [data-tm-p="title"]', 'Architect'); await page.click(PG + ' [data-act="member-add"]'); await page.waitForSelector(PG + ' [data-tm-members]');
  await page.waitForFunction(() => !/waiting/.test((document.querySelector('[data-pstat="teams:sync"] .sc-pstat-text') || {}).textContent || '')).catch(() => {});
  await page.waitForTimeout(800);
  const snap = (await api('/api/v1/team/teams')).json.data; const t = snap.teams.find(x => x.name === 'Live lab team');
  ok(!!t && t.members.length === 1 && t.members[0].person.email === 'ann@example.com' && t.members[0].person.title === 'Architect' && t.members[0].role === 'member', 'the real server has the team, the person (with the profile) and the membership: ' + JSON.stringify(t && t.members.map(m => [m.person.email, m.role])));
  await toWork();
  // 3. the Sync status dialog next to the real server's own numbers
  await run('sync-status'); await page.waitForSelector(DLG + ' [data-sy-tables]'); await page.waitForTimeout(700);
  let tr = await tableRows(); ok(Object.values(tr).every(r => r.match === 'yes'), 'every table matches the real server: ' + JSON.stringify(Object.fromEntries(Object.entries(tr).map(([k, v]) => [k, v.cells.slice(1, 5).join('/')]))));
  const facts = await page.$$eval(DLG + ' [data-sy-f]', fs => Object.fromEntries(fs.map(f => [f.dataset.syF, f.textContent])));
  ok(facts.db.includes(F.db.slice(0, 12)) && /\d+ calls/.test(facts.merges || '') && /Account database size/.test(facts.bytes || '') && Number((facts.bytes.match(/(\d+)\s*$/) || [])[1]) > 0, "the account's real database id, merge totals and size: " + JSON.stringify({ db: facts.db, merges: facts.merges, bytes: facts.bytes }));
  { const dv = await page.$$eval(DLG + ' [data-sy-device]', rs => rs.map(r => ({ mine: r.dataset.syMine, text: r.textContent })));
    ok(dv.length === 1 && dv[0].mine === 'yes' && !/Not synced yet/.test(dv[0].text), 'the REAL account lists this device with its last sync: ' + JSON.stringify(dv.map(d => d.text.slice(0, 90)))); }
  await top(); await page.screenshot({ path: path.join(OUT, 'teams-live-1-status.png') }); await closeDlgs();
  // 4. offline then back
  offline = true; await openTeams(); await page.fill(PG + ' [data-tm-new]', 'Made offline'); await page.click(PG + ' [data-act="team-add"]'); await page.waitForTimeout(300); await toWork();
  ok(!(await names()).includes('Made offline'), 'offline: the real server does not have it');
  await page.click(ST + ' [data-act="pstat:teams:sync"]'); await waitText(/offline/); await page.screenshot({ path: path.join(OUT, 'teams-live-2-offline.png'), clip: { x: 0, y: 860, width: 1440, height: 40 } });
  offline = false; await syncNow(); ok((await names()).includes('Made offline'), 'back online: it reached the real server: ' + (await names()).join(', '));
  // 5. another device writes straight to the real server; this one picks it up
  const other = { uuid: crypto.randomUUID(), name: 'From the other device', description: '', updated_at: Date.now(), deleted_at: null };
  const m1 = await api('/api/v1/team/teams', { op: 'merge', tables: { teams: [other] } }); ok(m1.json.data.applied === 1, 'the other device merged a team into the real server');
  await run('sync-status'); await page.waitForSelector(DLG + ' [data-sy-tables]'); await page.waitForTimeout(900);
  ok((await page.$$eval(DLG + ' [data-sy-match="no"]', n => n.length)) >= 1 && !(await page.$eval(DLG + ' [data-act="sy-sync"]', b => b.disabled)), 'the dialog asked the real account, sees it differs, and turns Sync now ON');
  await page.click(DLG + ' [data-act="sy-sync"]'); await waitText(SYNCED); await page.waitForTimeout(400); await closeDlgs();
  await openTeams(); ok((await page.$$eval(PG + ' [data-tm-rename]', ns => ns.map(n => n.value))).includes('From the other device'), 'it shows up here after the next sync'); await toWork();
  // 6. the real server refuses a clock far ahead, and a correct edit still wins afterwards
  const ahead = { ...other, name: 'Clock ahead', updated_at: Date.now() + 10 * 60_000 }; const m2 = await api('/api/v1/team/teams', { op: 'merge', tables: { teams: [ahead] } });
  ok(m2.json.data.refused === 1 && m2.json.data.future === 1 && m2.json.data.applied === 0, 'the real server refuses a row stamped 10 minutes ahead: ' + JSON.stringify(m2.json.data));
  ok(!(await names()).includes('Clock ahead'), 'and did not store it');
  // 7. a real conflict: this device renames offline, the other device renames later; the later one wins here, the lost edit can be restored
  offline = true; await openTeams();
  const card = await page.$(PG + ' [data-team-card] [data-tm-rename]'); const cardVals = await page.$$eval(PG + ' [data-tm-rename]', ns => ns.map(n => [n.value, n.getAttribute('data-tm-rename')]));
  const target = cardVals.find(v => v[0] === 'Made offline'); await page.fill(PG + ` [data-tm-rename="${target[1]}"]`, 'Browser name'); await page.click(PG + ` [data-team-card="${target[1]}"] [data-act="team-rename"]`); await page.waitForTimeout(300); await toWork();
  const cur = (await rows()).teams.find(x => x.uuid === target[1]); const theirs = { ...cur, name: 'Other device name', updated_at: Date.now() + 5000 };
  const m3 = await api('/api/v1/team/teams', { op: 'merge', tables: { teams: [theirs] } }); ok(m3.json.data.applied === 1, 'the other device renamed the same team, later');
  offline = false; await syncNow(/change replaced/);
  await openTeams(); const after = await page.$$eval(PG + ' [data-tm-rename]', ns => ns.map(n => n.value));
  ok(after.includes('Other device name') && !after.includes('Browser name'), 'the later edit wins on this device: ' + after.join(', '));
  ok((await page.$$(PG + ' [data-tm-lost] li[data-lost]')).length === 1 && (await page.textContent(PG + ' [data-tm-lost]')).includes('Browser name'), 'and the replaced edit is listed with Restore'); await top(); await page.screenshot({ path: path.join(OUT, 'teams-live-3-replaced.png') });
  await page.click(PG + ' [data-act="lost-restore"]'); await page.waitForTimeout(1200); await toWork();   // online: the restored edit is mirrored at once, so there is nothing left to sync
  ok((await names()).includes('Browser name') && !(await names()).includes('Other device name'), 'Restore made it a new edit that won on the real server: ' + (await names()).join(', '));
  // 7b. the field-level case against the real server: this device edits the DESCRIPTION offline, the other device renames later; the merge keeps both
  offline = true; await openTeams();
  const tid = (await page.$$eval(PG + ' [data-tm-rename]', ns => ns.map(n => [n.value, n.getAttribute('data-tm-rename')]))).find(v => v[0] === 'Other device name' || v[0] === 'Browser name')[1];
  await page.fill(PG + ` [data-tm-desc="${tid}"]`, 'Browser description'); await page.click(PG + ` [data-team-card="${tid}"] [data-act="team-desc"]`); await page.waitForTimeout(300); await toWork();
  const cur2 = (await rows()).teams.find(x => x.uuid === tid); const named = { ...cur2, name: 'Renamed on the other device', updated_at: Date.now() + 5000 };
  ok((await api('/api/v1/team/teams', { op: 'merge', tables: { teams: [named] } })).json.data.applied === 1, 'the other device renamed the same team (a different field), later');
  offline = false; await syncNow(/synced|replaced/); await page.waitForTimeout(400);
  let srv = (await rows()).teams.find(x => x.uuid === tid); ok(srv.name === 'Renamed on the other device' && srv.description === 'Browser description', 'the REAL server holds both edits after the merge: ' + JSON.stringify([srv.name, srv.description]));
  await openTeams(); const vals = await page.$$eval(PG + ` [data-tm-rename="${tid}"], [data-tm-desc="${tid}"]`, ns => ns.map(n => n.value)); ok(vals.includes('Renamed on the other device') && vals.includes('Browser description'), 'and so does this device: ' + vals.join(' / ')); await toWork();
  // 7c. the Lab page: sign in to the real site as the fixture and read /lab/sync (the server's side of the same numbers)
  { const c2 = await browser.newContext({ viewport: { width: 1280, height: 1000 } }); const p2 = await c2.newPage();
    await p2.goto(SITE + '/login'); await p2.fill('input[name="email"]', F.email); await p2.fill('input[name="password"]', F.password); await Promise.all([p2.waitForNavigation({ waitUntil: 'load' }).catch(() => {}), p2.click('#login button[type="submit"], form[action="/api/auth/login"] button[type="submit"]')]);
    await p2.goto(SITE + '/lab/sync'); const body = await p2.textContent('main'); const live = (await api('/api/v1/team/teams?stats=1')).json.data;
    ok(/Sync status/.test(body) && body.includes(F.db) && body.includes('Database id'), '/lab/sync opens for a lab tester and names the same database');
    const cells = await p2.$$eval('[data-ls-table]', rs => Object.fromEntries(rs.map(r => [r.dataset.lsTable, [...r.children].slice(1, 3).map(c => Number(c.textContent))])));
    ok(['people', 'teams', 'team_members', 'team_projects'].every(k => cells[k] && cells[k][0] === live.tables[k].live && cells[k][1] === live.tables[k].deleted), '/lab/sync rows match the API stats exactly: ' + JSON.stringify(cells));
    ok(/labsync fixture/.test(await p2.textContent('[data-ls="devices"]')) && (await p2.textContent('[data-ls="merges"]')).includes(String(live.merges.calls)), 'it lists the device that syncs and the merge totals');
    await p2.screenshot({ path: path.join(OUT, 'teams-live-5-lab-sync-page.png'), fullPage: true });
    // the REAL key mint: this context is signed in at the real site by a cookie, so the real endpoint hands a SuperCad tab its own sync-only key
    const minted = await p2.evaluate(async () => { const r = await fetch('/api/account/super-connect', { method: 'POST', credentials: 'same-origin', headers: { 'X-CC-Connect': '1', Accept: 'application/json' } }); return { status: r.status, data: (await r.json()).data }; });
    ok(minted.status === 200 && minted.data.signedIn === true && /^ccu_[A-Za-z0-9]{40}$/.test(minted.data.token), 'the real /api/account/super-connect gives a signed-in tab its own key');
    const withKey = await fetch(SITE + '/api/v1/team/teams?stats=1', { headers: { Authorization: 'Bearer ' + minted.data.token } }); const wk = await withKey.json();
    ok(withKey.status === 200 && wk.data.db.id === F.db, 'that key reaches the same account database: ' + (wk.data && wk.data.db.id.slice(0, 12)));
    const wide = await fetch(SITE + '/api/v1/account/tokens', { headers: { Authorization: 'Bearer ' + minted.data.token } }); ok(wide.status === 403 || wide.status === 404 || wide.status === 401, 'and nothing wider: a token-management call is refused (' + wide.status + ')');
    await c2.close(); }
  // 8. final comparison with the real server's own stats
  await run('sync-status'); await page.waitForSelector(DLG + ' [data-sy-tables]'); await page.waitForTimeout(700); tr = await tableRows();
  ok(Object.values(tr).every(r => r.match === 'yes'), 'at the end every table matches the real server again: ' + JSON.stringify(Object.fromEntries(Object.entries(tr).map(([k, v]) => [k, v.cells.slice(1, 5).join('/')]))));
  const st = (await api('/api/v1/team/teams?stats=1')).json.data; ok(st.merges.calls >= 5 && st.merges.future >= 1 && st.merges.refused >= 1, "the server's own merge totals saw all of it: " + JSON.stringify(st.merges)); await top(); await page.screenshot({ path: path.join(OUT, 'teams-live-4-final.png') });
  ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
} catch (e) { fail++; console.log('FAIL (exception)', e && e.stack || e); }
finally { try { if (browser) await browser.close(); } catch {} try { if (close) close(); } catch {} console.log(fx(['clean']).trim()); }
console.log(`${pass} passed, ${fail} failed`); console.log('screenshots: ' + OUT + '/teams-live-*.png'); process.exit(fail ? 1 : 0);
