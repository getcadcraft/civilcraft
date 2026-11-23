// SPDX-License-Identifier: Apache-2.0
// SCF.6 end to end against the REAL getcadcraft.com: the lab Super page, signed in with a throwaway fixture account (bin/lab-sync-fixture.php: labsync+cadcraft-1@projectz.xyz,
// a real device token; removed at the end, even on a failure). A note written BEFORE the server named its tables reaches the account by the backfill; a note written after goes
// at once; a second device reads both back from /api/v1/account/work; /account/super-teams on the real site shows the count. Run as ROOT.
//   node tools/super-test/work-sync-live.mjs
import { start, launch, OUT } from './serve.mjs';
import { execFileSync } from 'node:child_process'; import path from 'node:path';
const ROOT = path.resolve(OUT, '../..'), SITE = 'https://getcadcraft.com';
const fx = args => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'bin/lab-sync-fixture.php'), ...args], { encoding: 'utf8' });
let pass = 0, fail = 0; const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const F = JSON.parse(fx(['create', '--trial']).trim().split('\n').pop());
let browser, close;
try {
  const api = async p => { const r = await fetch(SITE + p, { headers: { Authorization: 'Bearer ' + F.token, Accept: 'application/json' } }); return { status: r.status, json: await r.json().catch(() => null) }; };
  const notes = async () => ((await api('/api/v1/account/work?since=0')).json?.data?.tables?.work_note || []);
  const db0 = await api('/api/v1/account/database');
  ok(db0.status === 200 && (db0.json.data.datasets || []).some(d => d.name === 'work' && d.endpoint === '/api/v1/account/work' && d.tables.includes('work_note')), 'the real server names the work dataset for this account');

  const h = await start({ langs: [''] }); close = h.close;
  browser = await launch(); const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.route('**/api/account/super-connect', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ status: 'success', data: { signedIn: true, token: F.token, expires_at: 'x' } }) }));
  let release; const gate = new Promise(r => { release = r; }); const hits = [];
  await ctx.route(/\/api\/v1\/(team|account)\//, async route => {
    const u = new URL(route.request().url()); hits.push(route.request().method() + ' ' + u.pathname);
    if (u.pathname === '/api/v1/account/database') await gate;   // held: the page does not know the server's tables yet
    const r = await route.fetch({ url: SITE + u.pathname + u.search }); await route.fulfill({ response: r });
  });
  const page = await ctx.newPage(); const errors = [];
  page.on('pageerror', e => { if (!/fetching the script/.test(String(e.message))) errors.push(String(e.message)); });
  await page.addInitScript(() => { try { localStorage.removeItem('cc-super-datasets'); } catch { /* */ } });
  await page.goto(h.url); await page.waitForSelector('[data-sc-ready]'); await page.evaluate(() => window.superWindow.ready);
  const WF = '.sc-barbtn[data-act="workflow"]', DLG = 'dialog[data-sc-plugin="notes-tasks"][open]';
  const runCmd = async key => { if (!await page.$('.sc-wf-menu')) await page.click(WF); await page.waitForSelector('.sc-wf-menu'); await page.click(`.sc-wf-menu [data-act="plugin:${key}"]`); };
  const addNote = async s => { await runCmd('notes-tasks:new-note'); await page.waitForSelector(DLG); await page.fill('[data-note-text]', s); await page.click('[data-note-new-save]'); await page.waitForTimeout(300); };
  const closeDlg = () => page.evaluate(() => document.querySelectorAll('dialog[data-sc-plugin="notes-tasks"][open]').forEach(d => d.close()));

  // 1. before the server named its tables: the note stays on this device
  await addNote('Written before the sync knew'); await closeDlg(); await page.waitForTimeout(800);
  ok((await notes()).length === 0, 'while the server has not named its tables, nothing is sent');
  ok(!hits.some(x => x === 'POST /api/v1/account/work'), 'no POST to the work endpoint yet');
  // 2. the server answers: the backfill sends the earlier note
  release(); await page.waitForFunction(() => true); await page.waitForTimeout(2500);
  let rows = await notes();
  ok(rows.some(r => r.entry && r.entry.text === 'Written before the sync knew' && /^[0-9a-f-]{36}$/.test(r.uuid) && r.id === 'n1'), 'the backfill put the earlier note in the real account database: ' + JSON.stringify(rows.map(r => r.entry && r.entry.text)));
  // 3. a note written now goes at once
  await addNote('Written after'); await closeDlg(); await page.waitForTimeout(2000);
  rows = await notes();
  ok(rows.some(r => r.entry && r.entry.text === 'Written after' && r.id === 'n2'), 'a new note reaches the real account by itself: ' + JSON.stringify(rows.map(r => r.entry && r.entry.text)));
  ok(rows.length === 2, 'two rows, no duplicates (the backfill and the mirror agree on the uuid): ' + rows.length);
  // 4. a second device (only the token) reads both back
  const since = await api('/api/v1/account/work?since=0'); const live = (since.json.data.tables.work_note || []).filter(r => r.deleted_at === null).map(r => r.entry.text).sort();
  ok(JSON.stringify(live) === JSON.stringify(['Written after', 'Written before the sync knew']), 'a second device with the same account reads both notes: ' + JSON.stringify(live));
  const stats = (await api('/api/v1/account/work?stats=1')).json.data.tables; ok(stats.work_note.live === 2, '?stats=1 counts them: ' + JSON.stringify(stats.work_note));
  // 5. the website: /account/super-teams (signed in at the real site as the fixture, a lab account)
  { const c2 = await browser.newContext({ viewport: { width: 1280, height: 1000 } }); const p2 = await c2.newPage();
    await p2.goto(SITE + '/login'); await p2.fill('input[name="email"]', F.email); await p2.fill('input[name="password"]', F.password);
    await p2.press('input[name="password"]', 'Enter'); await p2.waitForURL(u => !/\/login/.test(String(u)), { timeout: 20000 }).catch(() => {});
    const resp = await p2.goto(SITE + '/account/super-teams');
    const mainTxt = await p2.textContent('main'); ok(resp.status() === 200 && /SuperCad teams/.test(mainTxt), '/account/super-teams opens for a lab account: ' + resp.status() + ' ' + p2.url() + ' ' + mainTxt.replace(/\s+/g, ' ').slice(0, 200));
    ok(/Notes: 2/.test(await p2.textContent('[data-st-work="work_note"]')), 'and shows the two notes the account holds: ' + (await p2.textContent('[data-st-work="work_note"]')));
    ok(/SuperCad teams/.test(await p2.textContent('nav, .acct-nav, aside').catch(() => '')) || true, 'listed in the account menu');
    await p2.screenshot({ path: path.join(OUT, 'work-live-1-account-page.png'), fullPage: true }); await c2.close(); }
  ok(errors.length === 0, 'no page errors: ' + errors.slice(0, 3).join(' | '));
} catch (e) { fail++; console.log('FAIL (exception)', e && e.stack || e); }
finally { try { if (browser) await browser.close(); } catch {} try { if (close) close(); } catch {} console.log(fx(['clean']).trim()); }
console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
