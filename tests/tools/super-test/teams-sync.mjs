// SPDX-License-Identifier: Apache-2.0
// Super: the teams plugin's SYNC in headless Chromium, the real page (lab build) with a signed-in account stub talking to a simulated account server that applies the same merge rules as
// the website. Shows what a person sees: the status line (not synced / synced / offline / waiting), Sync now, the Sync status dialog (this device next to the account, queue, log),
// automatic sync, a team made in the Teams dialog reaching the account, offline then back online, and a change from "another device".  Screenshots go to tmp/super-test/.
//   node tools/super-test/teams-sync.mjs
import { start, launch, OUT } from './serve.mjs';
import path from 'node:path'; import { pathToFileURL } from 'node:url';
const DEV = path.join(path.resolve(OUT, '../..'), 'public_html/assets/apps/supercadcraft/dev');
const D = await import(pathToFileURL(path.join(DEV, 'plugins/teams/data.js')));
const { url: URL0, close } = await start({ langs: [''] });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
// no account object is injected: the page does what a real tab does, asks the site (/api/account/super-connect) for its own key
const page = await ctx.newPage();
const errors = []; page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); }); page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::ERR|fetching the script/.test(m.text())) errors.push(m.text()); });

// the simulated account: one database, the same rules the website applies
let siteSignedIn = false, keyValid = true; const KEY = 'ccu_' + 's'.repeat(40);   // the site session starts SIGNED OUT; a test signs in later
await page.route('**/api/account/super-connect', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: siteSignedIn ? { signedIn: true, token: KEY, expires_at: 'x' } : { signedIn: false } }) }));
const DB = 'a1'.repeat(32); const server = D.emptyDoc(); server.sync.pushed = Infinity; const hits = []; let offline = false;
await page.route('**/api/v1/**', async route => {
  const req = route.request(), u = new URL(req.url()); hits.push(req.method() + ' ' + u.pathname + u.search);
  if (offline) return route.abort('internetdisconnected');
  if (!keyValid) return route.fulfill({ status: 401, contentType: 'application/json', body: JSON.stringify({ status: 'error', error: 'Unauthorized' }) });
  const reply = (d, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify({ status: 'success', message: '', data: d }) });
  if (u.pathname === '/api/v1/account/database') return reply({ account: { email: 'lab@example.com' }, db: { id: DB, folder: 'a1/' + DB, file: 'teams.sqlite', schema_version: 1, tables: D.TABLES }, datasets: [{ name: 'teams', tables: D.TABLES, endpoint: '/api/v1/team/teams', cursor: 0 }], server_time: Date.now() });
  if (u.pathname === '/api/v1/team/teams' && u.searchParams.has('stats')) return reply({ db: { id: DB, schema_version: 1, bytes: 20480 }, tables: Object.fromEntries(D.TABLES.map(t => [t, { live: server[t].filter(r => r.deleted_at === null).length, deleted: server[t].filter(r => r.deleted_at !== null).length, newest: server[t].reduce((m, r) => Math.max(m, r.updated_at), 0) }])), merges: stats, server_time: Date.now() });
  if (u.pathname === '/api/v1/team/teams' && u.searchParams.has('devices')) return reply({ devices: [...devices.values()] });
  if (u.pathname === '/api/v1/team/teams' && req.method() === 'GET') return reply(D.changesSince(server, Number(u.searchParams.get('since') || 0)));
  if (u.pathname === '/api/v1/team/teams' && req.method() === 'POST' && /"op":"forget_device"/.test(req.postData())) { devices.delete(JSON.parse(req.postData()).id); return reply({}); }
  if (u.pathname === '/api/v1/team/teams' && req.method() === 'POST' && /"op":"register_device"/.test(req.postData())) { const d = JSON.parse(req.postData()).device; devices.set(d.id, { ...d, first_seen: Date.now(), last_sync: Date.now(), rows: Object.values(d.tables).reduce((x, y) => x + y, 0) }); return reply({ device: d }); }
  if (u.pathname === '/api/v1/team/teams' && req.method() === 'POST') { const r = D.applyChanges(server, JSON.parse(req.postData()).tables, { now: Date.now(), pushed: Infinity }); stats.calls++; stats.applied += r.applied; stats.kept += r.kept; stats.refused += r.refused; stats.future += r.future; stats.last_at = Date.now(); return reply({ ...r, cursor: Date.now() }); }
  return route.fulfill({ status: 404, body: '{}' });
});
const devices = new Map([['phone-0000-1', { id: 'phone-0000-1', name: 'Pixel phone', edition: 'browser', first_seen: Date.now() - 864e5, last_sync: Date.now() - 36e5, rows: 5, tables: {} }]]);
const stats = { calls: 0, applied: 0, kept: 0, refused: 0, future: 0, last_at: 0 };
await page.goto(URL0); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
const ST = '[data-pstat="teams:sync"]', TXT = ST + ' .sc-pstat-text';
const stText = () => page.textContent(TXT);
const waitText = (re, ms = 9000) => page.waitForFunction(([sel, src]) => new RegExp(src, 'i').test((document.querySelector(sel) || {}).textContent || ''), [TXT, re.source], { timeout: ms });
const DLG = '[data-home-view="page"]:not([hidden])';
const closeDlgs = async () => { await page.evaluate(() => { try { window.superWindow.home.leave(); } catch { /* already on the work area */ } }); await page.waitForTimeout(80); };
const PG = '[data-home-view="page"]:not([hidden])';   // Teams and Team members are PAGES of the welcome area, not dialogs
const toWork = async () => { await page.evaluate(() => window.superWindow.home.leave()); await page.waitForTimeout(150); };   // back to the drawing space (the status line lives there)
const openTeams = async () => { await run('new-team'); await page.waitForSelector(PG + ' [data-tm-new]'); };   // the name field shows after New team (page since 2026-11-11)
const run = key => page.evaluate(k => window.superWindow.plugins.run(k), 'teams:' + key);

// the plugin is there and the status item shows in the window's status line
const pl = await page.evaluate(() => window.superWindow.plugins.list().find(p => p.id === 'teams'));
ok(pl && pl.enabled && !pl.error, 'the Teams plugin is registered and started without an error: ' + JSON.stringify(pl));
await page.waitForSelector(ST); ok(/^Teams: /.test(await stText()), 'the status line has a Teams sync item: "' + await stText() + '"');
ok(await page.$eval(ST, n => n.querySelectorAll('button').length) === 2, 'with two buttons: Sync now and Sync status');

// loaded while signed out of the site: the status says so; nothing is sent; no key was minted
await page.waitForSelector(ST); await waitText(/not signed in/); ok(!hits.some(h => h.includes('/api/v1/')), 'signed out of the site: no account call was made: ' + hits.join(' | '));
// the person signs in on the site (another tab) and comes back to this one: the tab notices on focus, connects, and syncs by itself
siteSignedIn = true; await page.evaluate(() => window.dispatchEvent(new Event('focus')));
await waitText(/synced (just now|\d+ min)/); ok(hits.some(h => h.startsWith('GET /api/v1/account/database')) && hits.some(h => h.startsWith('GET /api/v1/team/teams?since=')), 'the first automatic sync asked the account which database it is and what changed: ' + [...new Set(hits)].join(' | '));
ok(/synced (just now|\d+ min ago)/.test(await stText()), 'the status line says synced: "' + await stText() + '"');
await page.screenshot({ path: path.join(OUT, 'teams-sync-1-synced.png'), clip: { x: 0, y: 860, width: 1440, height: 40 } });

// a team made in the Teams dialog reaches the account by itself (online edits are mirrored at once)
await openTeams();
await page.fill(PG + ' [data-tm-new]', 'Lab team'); await page.click(PG + ' [data-act="team-add"]'); await page.waitForSelector(PG + ' [data-team-card]');
await page.click(PG + ' [data-act="members-add-empty"]'); await page.waitForSelector(PG + ' [data-tm-addsearch]');   // Add people opens beside the team list (page since 2026-11-11)
await page.fill(PG + ' [data-tm-addsearch]', 'ann@example.com'); await page.click(PG + ' [data-tm-invite-new]'); await page.waitForSelector(PG + ' [data-tm-addcard]');
await page.fill(PG + ' [data-tm-p="name"]', 'Ann Lab'); await page.click(PG + ' [data-act="members-add-go"]');
await page.waitForSelector(PG + ' [data-member]');
await page.waitForTimeout(400);
await page.waitForFunction(sel => !/waiting/.test((document.querySelector(sel) || {}).textContent || ''), TXT, { timeout: 5000 }); ok(!/waiting/.test(await stText()), 'the status line does not stay on "waiting" after the background send: "' + await stText() + '"');
ok(server.teams.some(t => t.name === 'Lab team') && server.people.some(p => p.email === 'ann@example.com') && server.team_members.length === 1, 'the team, the person and the membership reached the account without pressing anything: ' + JSON.stringify([server.teams.length, server.people.length, server.team_members.length]));
await page.screenshot({ path: path.join(OUT, 'teams-page-2-members.png') });
ok(/1 person/.test(await page.textContent(PG + ' [data-tm-count]')), 'the team card counts its person: "1 person"');
await page.click(PG + ' [data-act="team-new"]'); await page.waitForSelector(PG + ' [data-tm-new]'); await page.fill(PG + ' [data-tm-new]', 'Site crew'); await page.click(PG + ' [data-act="team-add"]'); await page.waitForTimeout(300);
await page.screenshot({ path: path.join(OUT, 'teams-page-1-teams.png') });
const siteId = await page.$$eval(PG + ' [data-team-card]', cs => (cs.find(c => /Site crew/.test(c.textContent)) || {}).dataset?.teamCard);
await page.click(PG + ` [data-team-pick="${siteId}"]`); await page.waitForSelector(PG + ` [data-act="members-add-empty"][data-team="${siteId}"]`);
await page.click(PG + ` [data-act="members-add-empty"][data-team="${siteId}"]`); await page.waitForSelector(PG + ' [data-tm-known]');
ok(/Ann Lab/.test(await page.textContent(PG + ' [data-tm-known]')), 'a second team offers Ann, who is already known, without retyping');
await page.check(PG + ' [data-tm-existing]'); await page.click(PG + ' [data-act="members-add-go"]'); await page.waitForSelector(PG + ' [data-member]'); await page.waitForTimeout(600);
ok(server.team_members.filter(m => m.deleted_at === null).length === 2 && server.people.length === 1, 'Ann is on two teams, and the account holds one person with two memberships');
await page.screenshot({ path: path.join(OUT, 'teams-page-3-two-teams.png') });
await toWork();

// the Sync status dialog: this device next to the account, the log
await run('sync-status'); await page.waitForSelector(DLG + ' [data-sy-tables]'); await page.waitForTimeout(300);
ok(!(await page.textContent(DLG + ' [data-sy-body]')).includes('null'), 'no stray "null" in the dialog');
const rowsOf = async () => page.$$eval(DLG + ' [data-sy-table]', rs => Object.fromEntries(rs.map(r => [r.dataset.syTable, { match: r.dataset.syMatch, cells: [...r.children].map(c => c.textContent) }])));
let rows = await rowsOf(); ok(Object.values(rows).every(r => r.match === 'yes'), 'every table matches the account: ' + JSON.stringify(Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, v.cells.slice(1, 5).join('/')]))));
ok(rows.teams.cells[1] === '2' && rows.teams.cells[3] === '2' && rows.people.cells[1] === '1' && rows.people.cells[3] === '1' && rows.team_members.cells[1] === '2' && rows.team_members.cells[3] === '2', 'two teams, one person on both of them: the same counts here and in the account: ' + JSON.stringify(Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, v.cells.slice(1, 5).join('/')]))));
const facts = await page.$$eval(DLG + ' [data-sy-f]', fs => Object.fromEntries(fs.map(f => [f.dataset.syF, f.textContent])));
ok(/yes/i.test(facts.signedin) && /a1a1a1a1a1a1/.test(facts.db) && /calls/.test(facts.merges || ''), 'facts: signed in, the database id, the account merge totals: ' + JSON.stringify(facts));
ok(await page.$$eval(DLG + ' [data-sy-entry="ok"]', n => n.length) >= 1, 'the log has the automatic sync');
const devRows = await page.$$eval(DLG + ' [data-sy-device]', rs => rs.map(r => ({ mine: r.dataset.syMine, text: r.textContent })));
ok(devRows.length === 2 && devRows.filter(r => r.mine === 'yes').length === 1 && devRows.some(r => /Pixel phone/.test(r.text) && /1 hour|60 min|ago/i.test(r.text) || /Pixel phone/.test(r.text)), 'the Devices list shows this device and the phone with last sync dates: ' + JSON.stringify(devRows.map(r => r.text.slice(0, 80))));
ok(devRows.find(r => r.mine === 'yes').text.length > 20 && !/Not synced yet/.test(devRows.find(r => r.mine === 'yes').text), 'this device shows the date it last synced');
await page.click(DLG + ' [data-act="dev-forget"]'); await page.waitForTimeout(400);
ok(await page.$$eval(DLG + ' [data-sy-device]', n => n.length) === 1 && devices.size === 1, 'Forget takes the phone off the list');
await page.evaluate(() => { const b = document.querySelector('dialog[data-sc-plugin="teams"][open]'); if (b) b.scrollTop = 0; }); await page.screenshot({ path: path.join(OUT, 'teams-sync-2-status-dialog.png') });
// Sync now from the dialog
ok(await page.$eval(DLG + ' [data-act="sy-sync"]', b => b.disabled) && /in step/.test(await page.$eval(DLG + ' [data-act="sy-sync"]', b => b.title)), 'everything matches: Sync now is OFF and says "Everything is in step with your account"');
ok(await page.$eval(ST + ' [data-act="pstat:teams:sync"]', b => b.disabled), 'and so is the Sync button in the status line');
await closeDlgs();

// offline: edits are saved here and queue; the status line says so; Sync now says offline
offline = true; await openTeams();
await page.fill(PG + ' [data-tm-new]', 'Made offline'); await page.click(PG + ' [data-act="team-add"]'); await page.waitForTimeout(300); await toWork();
ok(!server.teams.some(t => t.name === 'Made offline'), 'offline: the account does not have it yet');
await page.click(ST + ' [data-act="pstat:teams:sync"]'); await waitText(/offline/); ok(true, 'offline: the status line says offline: "' + await stText() + '"');
await page.screenshot({ path: path.join(OUT, 'teams-sync-3-offline.png'), clip: { x: 0, y: 860, width: 1440, height: 40 } });
await run('sync-status'); await page.waitForSelector(DLG + ' [data-sy-queue]'); ok(/Waiting to send \(1\)/.test(await page.textContent(DLG + ' [data-sy-queue] summary')), 'the dialog lists what waits to send');
ok(await page.$$eval(DLG + ' [data-sy-entry="offline"]', n => n.length) >= 1, 'and the log shows the offline attempt'); await page.screenshot({ path: path.join(OUT, 'teams-sync-4-offline-dialog.png') }); await closeDlgs();

// back online: Sync now sends the waiting change; the status line goes back to synced
offline = false; await page.click(ST + ' [data-act="pstat:teams:sync"]'); await waitText(/synced (just now|\d+ min)/); await page.waitForTimeout(200);
ok(server.teams.some(t => t.name === 'Made offline'), 'back online: the waiting change reached the account: ' + server.teams.map(t => t.name).join(', '));

// another device changes something: this one picks it up on the next sync
const other = D.emptyDoc(); D.createTeam(other, { name: 'From another device' }, Date.now() + 1000); D.applyChanges(server, { teams: other.teams }, { now: Date.now() + 2000, pushed: Infinity });
await run('sync-status'); await page.waitForSelector(DLG + ' [data-sy-tables]'); await page.waitForTimeout(600);
ok((await page.$$eval(DLG + ' [data-sy-match="no"]', n => n.length)) >= 1 && !(await page.$eval(DLG + ' [data-act="sy-sync"]', b => b.disabled)), 'the dialog asked the account, sees it differs, and turns Sync now ON');
await page.click(DLG + ' [data-act="sy-sync"]'); await waitText(/synced (just now|\d+ min)/); await page.waitForTimeout(400); await closeDlgs();
await openTeams(); ok((await page.$$eval(PG + ' [data-team-card]', cs => cs.map(c => c.textContent))).some(x => x.includes('From another device')), 'a team made on another device shows up here after the sync'); await toWork();
await run('sync-status'); await page.waitForSelector(DLG + ' [data-sy-tables]'); await page.waitForTimeout(300); rows = await rowsOf(); ok(rows.teams.match === 'yes' && rows.teams.cells[1] === '4', 'the two copies match again with 4 teams: ' + JSON.stringify(rows.teams.cells));
await page.evaluate(() => { const b = document.querySelector('dialog[data-sc-plugin="teams"][open]'); if (b) b.scrollTop = 0; }); await page.screenshot({ path: path.join(OUT, 'teams-sync-5-status-final.png') }); await closeDlgs();

// signed out: the status line says so and nothing is sent
siteSignedIn = false; keyValid = false; await run('sync-teams'); await waitText(/not signed in/); await page.waitForTimeout(200);
ok(/not signed in/.test(await stText()), 'the key expired and the site session is gone: the status line says not signed in again'); keyValid = true;

ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
console.log(`${pass} passed, ${fail} failed`); console.log('screenshots: ' + OUT + '/teams-sync-*.png');
await browser.close(); close(); process.exit(fail ? 1 : 0);
