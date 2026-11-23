#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-team-templates.mjs: D8.12-D team templates on the REAL /lab/bimcraft page, headless (session bim-core-11, 2026-11-21).
 * The page, its modules and its dialogs are the live dev build the lab serves; the test clicks the page's own buttons. One thing is not live:
 * .env TEAM_SHARED_ITEMS is off (the owner's switch, rule 62), so the page's calls to /api/v1/team/shared are routed to PHP's built-in server
 * running the same endpoint file with the switch on in that child's environment only (tools/bimcraft-test/team-templates-router.php).
 *   1  owner (signed in, on a team): New building (4 levels) → Save as template, "Share it with my team" + download → the row is on the server
 *   2  member (another account, same team): New building › Start from lists "<name> — Olive Owner, Studio North"; Create → the levels come
 *      back, the status names the template, and the bytes the member gets are the owner's template file byte for byte
 *   3  no team (the staff session's own sign-in, then a fixture account on no team): no team box, no team group, Save as template still keeps it in this browser
 *   4  the live page as it is (switch off, so no window.ccTeamShared): a signed-in tab never calls the team endpoint, and works as before
 *   node tools/bimcraft-test/browser-team-templates.mjs      run as root (a staff session, one browser, fixtures ttpl+cadcraft-<n>)
 */
import { spawn, execFileSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { openLab, REPO, PUB } from '../shell-test/lab-page.mjs';

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d !== '' ? ' (' + (typeof d === 'string' ? d : JSON.stringify(d)) + ')' : '')); } };
const FIX = path.join(REPO, 'tools/bimcraft-test/team-templates-fixture.php');
const fixture = (m) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', FIX, m], { encoding: 'utf8' }));
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');
const TPL = 'Studio North standard';

const F = fixture('up');
const port = 20000 + Math.floor(Math.random() * 20000);
const srv = spawn('sudo', ['-u', 'www-data', 'env', 'TEAM_SHARED_ITEMS=1', 'php', '-d', 'variables_order=EGPCS', '-d', 'display_errors=0', '-S', '127.0.0.1:' + port, '-t', PUB, path.join(REPO, 'tools/bimcraft-test/team-templates-router.php')], { detached: true, stdio: 'ignore' });
for (let i = 0; i < 60; i++) { if (await new Promise((r) => { const s = net.connect(port, '127.0.0.1', () => { s.end(); r(true); }).on('error', () => r(false)); })) break; await new Promise((r) => setTimeout(r, 100)); }
const lab = await openLab('ttpl');
const calls = [];
async function open(who, { teamOpen = true } = {}) {
  const storage = { 'cc-autofocus': 'off' };   // keep every Properties section open (memory page-tests-folded-panels)
  const made = await lab.page('bimcraft', { layout: 'standard', viewport: { width: 1600, height: 1000 }, storage, prepare: false });
  const { ctx, page } = made;
  // what office-shared.inc prints when TEAM_SHARED_ITEMS is on and the person has cloud sync open (the live switch is off: see the header)
  if (teamOpen) { await ctx.addInitScript(() => { window.ccTeamShared = { open: true }; }); await page.evaluate(() => { window.ccTeamShared = { open: true }; }); }   // the page is already up: set it now too
  await ctx.route('**/api/v1/team/shared**', async (route) => {
    const u = new URL(route.request().url());
    calls.push(route.request().method() + ' ' + u.search);
    const res = await route.fetch({ url: 'http://127.0.0.1:' + port + u.pathname + u.search });
    await route.fulfill({ response: res });
  });
  if (who) await page.evaluate((tok) => { sessionStorage.setItem('cc-addons-account:bimcraft:token', tok); if (window.ccAddonsAccount) window.ccAddonsAccount.setToken(tok); }, who.token);
  await page.waitForFunction(() => !!window.ccAddonsAccount || document.readyState === 'complete', null, { timeout: 30000 });
  if (who) await page.evaluate((tok) => window.ccAddonsAccount?.setToken(tok), who.token);
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  return { ctx, page, problems };
}
const settled = (page) => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 }).then(() => page.waitForTimeout(200));
const statusText = (page) => page.evaluate(() => [...document.querySelectorAll('[data-status], .bc-status, [role="status"]')].map((x) => x.textContent.trim()).filter(Boolean).join(' | '));
async function newBuilding(page, { levels = null, pick = null, name = null } = {}) {
  const btn = (await page.isVisible('[data-empty] [data-new]')) ? '[data-empty] [data-new]' : '[data-new]';
  await page.click(btn);
  await page.waitForSelector('dialog.bc-new');
  const opts = await page.$$eval('[data-new-from] option', (o) => o.map((x) => ({ v: x.value, t: x.textContent, team: x.hasAttribute('data-new-teamtpl'), group: x.parentElement.tagName === 'OPTGROUP' ? x.parentElement.label : '' })));
  if (name) await page.fill('[data-new-name]', name);
  if (pick) await page.selectOption('[data-new-from]', pick);
  else if (levels) await page.fill('[data-new-levels]', String(levels));
  await page.click('[data-new-ok]');
  await page.waitForSelector('dialog.bc-new', { state: 'detached', timeout: 60000 });
  await page.waitForFunction(() => window.bimcraftPlan?.state?.data && window.bimcraftPlan.view, null, { timeout: 90000 });
  await settled(page);
  return opts;
}
/** Settings the template must carry, read in the page from its own editor: levels, view templates, print style, sheets. */
const settingsOf = (page) => page.evaluate(async () => {
  const e = window.bimcraftRes.api.ed();
  const { ModelWriter } = await import('/assets/apps/bimcraft/dev/model-write.js');
  const V = await import('/assets/apps/bimcraft/dev/views-model.js'), PS = await import('/assets/apps/bimcraft/dev/print-style.js');
  const w = new ModelWriter(e.W, e.api, e.mid);
  const ps = PS.readPrintStyle(w);
  return JSON.stringify({ levels: window.bimcraftPlan.state.data.levels.map((l) => [l.name, Math.round(l.elevation), Math.round(l.height || 0)]), templates: V.readTemplates(w), print: ps.mode + ':' + ps.name, sheets: V.readSheets(w).map((x) => [x.number, x.title]) });
});
/** Settings changed through the page's own commit (as its dialogs do): a view template and the print style. */
const changeSettings = (page) => page.evaluate(async () => {
  const V = await import('/assets/apps/bimcraft/dev/views-model.js'), PS = await import('/assets/apps/bimcraft/dev/print-style.js');
  const A = window.bimcraftRes.api;
  A.commit(V.saveTemplate({ name: 'North working plan', cut: 1100, top: 0, bottom: 0, depth: 300, hidden: ['IfcFurniture'], scale: 50, detail: 'medium' }));
  A.commit(PS.setPrintStyle({ mode: 'table', table: 'grayscale' }));
});
const levelsOf = (page) => page.evaluate(() => (window.bimcraftPlan.state.data?.levels || window.bimcraftPlan.state.levels || []).map((l) => [l.name, Math.round(l.elevation), Math.round(l.height || 0)]));
async function saveTemplate(page, { team = false, download = false } = {}) {
  await page.evaluate(() => { const b = document.querySelector('[data-tpl-save]'); b?.closest('details')?.setAttribute('open', ''); });
  await page.click('[data-tpl-save]');
  await page.waitForSelector('[data-tpl-dialog]');
  await page.fill('[data-tpl-name]', TPL);
  await page.waitForTimeout(2500);   // the team list comes from the account
  const box = await page.evaluate(() => { const b = document.querySelector('[data-tpl-teambox]'); return { has: !!b, shown: !!b && !b.hidden, teams: [...document.querySelectorAll('[data-tpl-teampick] option')].map((o) => o.textContent) }; });
  if (team && box.shown) await page.check('[data-tpl-team]');
  if (download) await page.check('[data-tpl-download]');
  const dl = download ? page.waitForEvent('download', { timeout: 60000 }) : null;
  await page.click('[data-tpl-ok]');
  const file = dl ? await dl.then(async (d) => fs.readFileSync(await d.path())) : null;
  await page.waitForFunction((n) => [...document.querySelectorAll('[data-status], .bc-status, [role="status"]')].some((x) => x.textContent.includes(n) && /saved|shared/i.test(x.textContent)), TPL, { timeout: 60000 }).catch(() => {});
  return { box, file, status: await statusText(page) };
}

try {
  console.log('== 1  owner, on a team: Save as template › Share it with my team');
  const A = await open(F.owner);
  ok(await A.page.evaluate(() => !!window.ccAddonsAccount?.token), 'the page\'s account holds the owner\'s device token (as Studio\'s device sign-in does)');
  await newBuilding(A.page, { levels: 4 });
  const lvA = await levelsOf(A.page);
  ok(lvA.length === 4, 'a new building with four levels on /lab/bimcraft', lvA);
  await changeSettings(A.page); await settled(A.page);
  const setA = await settingsOf(A.page);
  ok(setA.includes('North working plan') && setA.includes('"print":"table:'), 'a view template and a pen-table print style set in the model', setA.slice(0, 200));
  const s1 = await saveTemplate(A.page, { team: true, download: true });
  ok(s1.box.shown && s1.box.teams.length === 1, 'the dialog offers "Share it with my team" once the account names the team', s1.box);
  ok(s1.status.includes('shared with Studio North'), 'the page says the template was shared with Studio North', s1.status);
  const rows = fixture('rows');
  ok(rows.length === 1 && rows[0].kind === 'template' && rows[0].name === TPL && rows[0].owner === 'ttpl+cadcraft-1@projectz.xyz' && rows[0].team_uuid === F.team.uuid, 'the server holds one team template row, by the owner, on the team', rows);
  ok(!!s1.file && s1.file.subarray(0, 12).toString() === 'ISO-10303-21', 'the template file was downloaded too (to compare bytes)', s1.file ? s1.file.length : 0);
  ok(A.problems.length === 0, 'no page errors (owner)', A.problems);
  await A.ctx.close();

  console.log('== 2  member, same team: New building › Start from › the team template');
  const B = await open(F.member);
  await B.page.click('[data-empty] [data-new]');   // the empty page's New building (a fresh browser: no templates of its own)
  await B.page.waitForSelector('dialog.bc-new');
  const list = await B.page.$$eval('[data-new-from] option', (o) => o.map((x) => ({ v: x.value, t: x.textContent, team: x.hasAttribute('data-new-teamtpl'), group: x.parentElement.tagName === 'OPTGROUP' ? x.parentElement.label : '' })));
  const mine = list.find((x) => x.team);
  ok(!!mine && mine.t === TPL + ' — Olive Owner, Studio North' && mine.group === 'Team templates', 'Start from lists the team template with who shared it and the team, under Team templates', list);
  await B.page.fill('[data-new-name]', 'Clinic 12');
  await B.page.selectOption('[data-new-from]', mine.v);
  ok(await B.page.evaluate(() => document.querySelector('[data-new-tplremove]').hidden), 'a team template has no Remove button here (it is not this browser\'s)');
  await B.page.click('[data-new-ok]');
  await B.page.waitForSelector('dialog.bc-new', { state: 'detached', timeout: 60000 });
  await B.page.waitForFunction(() => [...document.querySelectorAll('[data-status], .bc-status, [role="status"]')].some((x) => /from the template/.test(x.textContent)), null, { timeout: 90000 }).catch(() => {});
  await settled(B.page);
  const st2 = await statusText(B.page);
  ok(st2.includes('New building Clinic 12 from the template ' + TPL), 'the page opened the new building from the team template', st2);
  const lvB = await levelsOf(B.page);
  ok(JSON.stringify(lvB) === JSON.stringify(lvA), 'the levels come back exactly (names, elevations, heights)', { lvA, lvB });
  const setB = await settingsOf(B.page);
  ok(setB === setA, 'every setting read back is the same: levels, the view template, the print style, sheets', { setA, setB });
  ok(await B.page.evaluate(() => (window.bimcraftPlan.state.data.walls || []).length === 0), 'and no model elements: ready to draw');
  const got = await B.page.evaluate(async (v) => {
    const m = await import('/assets/apps/bimcraft/dev/team-templates.js');
    const b = await m.teamTemplates().bytes(m.parseTeamValue(v));
    const PT = await import('/assets/apps/bimcraft/dev/project-template.js');
    return { hex: [...new Uint8Array(await crypto.subtle.digest('SHA-256', b))].map((x) => x.toString(16).padStart(2, '0')).join(''), n: b.length, names: Object.keys(PT) };
  }, mine.v);
  ok(got.hex === sha(s1.file), 'the member gets the owner\'s template file byte for byte (' + got.n + ' bytes)', { got: got.hex, want: sha(s1.file) });
  ok(B.problems.length === 0, 'no page errors (member)', B.problems);
  await B.ctx.close();

  console.log('== 3  no team: the page works as before');
  for (const who of [null, F.loner]) {
    const C = await open(who);
    const label = who ? 'signed in on no team' : "the tab's own staff sign-in, on no team";
    await newBuilding(C.page, { levels: 2 });
    await changeSettings(C.page); await settled(C.page);
    const s3 = await saveTemplate(C.page, { team: true });
    ok(s3.box.has && !s3.box.shown, label + ': no team box in Save as template', s3.box);
    ok(/Template .* saved/.test(s3.status), label + ': Save as template keeps it in this browser', s3.status);
    await C.page.reload({ waitUntil: 'networkidle' });   // a fresh page in the same browser: its templates stay (IndexedDB)
    await C.page.click('[data-empty] [data-new]');
    await C.page.waitForSelector('dialog.bc-new');
    const l3 = await C.page.$$eval('[data-new-from] option', (o) => o.map((x) => ({ t: x.textContent, team: x.hasAttribute('data-new-teamtpl'), group: x.parentElement.tagName })));
    ok(!l3.some((x) => x.team) && !l3.some((x) => x.group === 'OPTGROUP') && l3.some((x) => x.t === TPL), label + ': Start from is the flat list of this browser\'s templates, as before', l3);
    ok(C.problems.length === 0, label + ': no page errors', C.problems);
    await C.ctx.close();
  }
  console.log('== 4  the live page as served (TEAM_SHARED_ITEMS off): no team calls at all');
  const before = calls.length;
  const D = await open(F.member, { teamOpen: false });
  ok(await D.page.evaluate(() => window.ccTeamShared === undefined && !!window.ccAddonsAccount?.token), 'the live page prints no ccTeamShared (switch off); the tab is signed in');
  await newBuilding(D.page, { levels: 2 });
  await changeSettings(D.page); await settled(D.page);
  const s4 = await saveTemplate(D.page, { team: true });
  ok(!s4.box.shown && /Template .* saved/.test(s4.status), 'no team box; Save as template keeps it in this browser', s4);
  ok(calls.length === before, 'not one call to /api/v1/team/shared (nothing in the console)', calls.slice(before));
  ok(D.problems.length === 0, 'no page errors', D.problems);
  await D.ctx.close();
  ok(calls.some((c) => c.startsWith('POST')) && calls.filter((c) => c.includes('mine=1')).length >= 3, 'the page called the team endpoint (list + share + read)', calls);
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e));
} finally {
  await lab.close();
  try { process.kill(-srv.pid, 'SIGTERM'); } catch { /* gone */ }
  fixture('down');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
