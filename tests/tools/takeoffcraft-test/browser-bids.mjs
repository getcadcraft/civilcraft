#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-bids.mjs — TakeoffCraft 0.7 LC.13 B3 + B4 + B6 in headless Chromium at https://getcadcraft.com/lab/takeoffcraft (run as root: a
 * session minted for the test admin by admin.php, so the shared login throttle is untouched).
 *   node tools/takeoffcraft-test/browser-bids.mjs [--out dir]
 *
 * The site's /api/v1/bids/* is a STAND-IN here (Playwright answers the fetches; nothing is mailed or stored): the real endpoints, mail and
 * pages are bin/test-bidding.php's. This checks what only a browser can: the Send for bids dialog (fields, validation, the connect step, the
 * sheets PDF built from a real sheet and posted as the raw body, the Bearer header, the result words), Get prices (sealed → opened, a late
 * bid flagged, one undo step), choosing a bid as the package's price (the Quantities total moves, one undo step to switch), and that the
 * saved project keeps the request and the awards.
 */
import path from 'node:path';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(ROOT, 'tmp/shots/takeoffcraft-bids'));
fs.mkdirSync(OUT, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const { chromium } = await import('playwright-core');
const cache = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const exe = fs.readdirSync(cache).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))
  .map((d) => path.join(cache, d, 'chrome-linux64/chrome')).find((p) => fs.existsSync(p));
const admin = (...a) => execFileSync('sudo', ['-u', 'www-data', 'php', path.join(ROOT, 'tools/takeoffcraft-test/admin.php'), ...a], { encoding: 'utf8' });
const S = JSON.parse(admin('session', 'main'));
const TOKEN = 'ccu_' + 'T'.repeat(40);
const PUUID = '11111111-2222-4333-8444-555555555555';
const R1 = 'aaaaaaaa-0000-4000-8000-000000000001', R2 = 'aaaaaaaa-0000-4000-8000-000000000002';

// the stand-in server
const seen = [];
const server = { phase: 'sealed', revision: 1, invited: 0, sheets: null, can: true };
const reply = (route, status, data, extra = {}) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(status < 300 ? { status: 'success', message: '', data } : { status: 'error', error: extra.error || 'x', code: extra.code || 'error', errors: extra.errors || {} }) });
const handler = async (route) => {
  const req = route.request(), url = new URL(req.url()), p = url.pathname, m = req.method();
  const rec = { m, p, auth: req.headers()['authorization'], ct: req.headers()['content-type'], body: req.postDataBuffer() };
  seen.push(rec);
  if (rec.auth !== 'Bearer ' + TOKEN) return reply(route, 401, null, { code: 'invalid_token' });
  if (p === '/api/v1/bids/status') return reply(route, 200, { can_send: server.can, public: false, user: { name: 'Pat' } });
  if (p === '/api/v1/bids/subcontractors') return reply(route, 200, { subcontractors: [
    { uuid: '99999999-0000-4000-8000-000000000001', company: 'Sub One Drywall', trades: '09 finishes', flag: 'ok', contacts: [{ name: 'Sam', email: 'sam@one.example', role: '' }] },
    { uuid: '99999999-0000-4000-8000-000000000002', company: 'Old Insurance Co', trades: '26', flag: 'expired', contacts: [{ name: 'Olga', email: 'olga@old.example', role: '' }] }] });
  if (p === '/api/v1/bids/packages' && m === 'POST') {
    const b = JSON.parse(rec.body.toString());
    server.created = b;
    if (!server.can) return reply(route, 403, null, { code: 'bids_closed', error: 'closed' });
    return reply(route, 201, { package: { uuid: PUUID, title: b.title, project: b.project, pkg: b.pkg, due: b.due, opens: b.opens || null, lines: b.lines.length, status: 'open' } });
  }
  if (p === `/api/v1/bids/packages/${PUUID}/sheets`) { server.sheets = rec.body; return reply(route, 200, {}); }
  if (p === `/api/v1/bids/packages/${PUUID}/invite`) {
    const b = JSON.parse(rec.body.toString());
    server.invitees = b.invitees;
    server.invited += b.invitees.length;
    return reply(route, 200, { results: b.invitees.map((i, n) => ({ email: i.email, state: n === 1 ? 'already' : 'invited' })) });
  }
  if (p === `/api/v1/bids/packages/${PUUID}` && m === 'GET') {
    const invs = [{ answered: true }, { answered: true }, { answered: false }];
    if (server.phase === 'sealed') return reply(route, 200, { package: { uuid: PUUID, pkg: '09', status: 'open' }, sealed: true, sealed_until: '2026-12-01T20:00:00Z', invitations: invs, bids: [], has_sheets: true });
    return reply(route, 200, { package: { uuid: PUUID, pkg: '09', status: 'open' }, sealed: false, sealed_until: null, invitations: invs, has_sheets: true, bids: [
      { response: R1, bidder: 'Sub One Drywall', declined: false, amount_cents: 420000, excl: [], note: 'valid 30 days', late: false, revision: server.revision },
      { response: R2, bidder: 'Late Plasterers', declined: false, amount_cents: 380000, excl: [], note: '', late: true, revision: 1 }] });
  }
  return reply(route, 404, null, { code: 'not_found' });
};

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await ctx.addCookies([{ name: S.name, value: S.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await ctx.route('**/api/v1/bids/**', handler);
  await page.goto('https://getcadcraft.com/lab/takeoffcraft?space=paper');
  await page.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 20000 });
  if (await page.evaluate(() => window.takeoffcraft.recovery) === 'asking') { await page.click('[data-autosave-discard-all]'); await page.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  const T = (fn, a) => page.evaluate(fn, a);

  // a real sheet, scaled, two items with marks
  await page.setInputFiles('[data-file-pdf]', path.join(ROOT, 'fixtures/pdf/kitchen-plan-sheet.pdf'));
  await page.waitForFunction(() => window.takeoffcraft.sheets().length > 0, null, { timeout: 20000 });
  await T(() => {
    const m = window.takeoffcraft.model, key = window.takeoffcraft.sheets()[0].key;
    m.setScale(key, { method: 'preset', preset: 'a1/4', ftPerUnit: 4 / 72, label: '1/4"', cal: null });
    const base = m.addItem({ name: 'Base', type: 'linear', mat: 10000, csi: '09 65 13' });
    m.addItem({ name: 'Paint', type: 'fixed', unit: 'SF', qty: 1000, mat: 4000, lab: 6000, csi: '09 91 23' });
    m.addItem({ name: 'Mobilization', type: 'fixed', unit: 'LS', qty: 1, mat: 20000000 });
    m.addMark({ item: base, sheet: key, pts: [{ x: 10, y: 10 }, { x: 82, y: 10 }] });
  });
  const ownTotal = await T(() => window.takeoffcraft.estimate().total);       // base $4.00 + paint $1,000 + mobilization $2,000
  ok(ownTotal === 100000 + 400 + 200000, 'set-up: our own total is $2,004.00 + $1,000.00 = $3,004.00 (' + ownTotal + ')');

  // open the leveling dialog with no token: the Send dialog asks to connect
  await page.click('[data-export-menu] > summary');
  await page.click('[data-act="export-level"]');
  await page.waitForSelector('[data-lvl-pkg="09"]');
  ok(!!(await page.$('[data-lvl-send="09"]')) && !(await page.$('[data-lvl-get="09"]')), 'package 09 offers "Send for bids…" and, before anything was sent, no Get prices');
  await page.click('[data-lvl-send="09"]');
  await page.waitForSelector('[data-bid-conn]');
  ok(/needs your CadCraft account/.test(await page.textContent('[data-bid-conn]')) && !!(await page.$('[data-bid-connect]')), 'no sign-in yet: the dialog says so and offers Connect');
  await page.fill('[data-bid-people]', 'Sam <sam@one.example>');
  await page.click('[data-bid-send]');
  ok(/Connect to your CadCraft account first/.test(await page.textContent('[data-bid-msg]')), 'Send without a sign-in: "Connect to your CadCraft account first"');
  ok(!seen.length, 'nothing went to the site');
  // the connect tab posts the token back (same origin)
  const [pop] = await Promise.all([ctx.waitForEvent('page'), page.click('[data-bid-connect]')]);
  ok(/\/account\/bids-connect\?app=takeoffcraft/.test(pop.url()), 'Connect opens /account/bids-connect?app=takeoffcraft in a new tab');
  await pop.close();
  await T((tok) => window.postMessage({ type: 'cadcraft-bids-token', app: 'takeoffcraft', token: tok, expires_at: new Date(Date.now() + 86400000).toISOString() }, window.location.origin), TOKEN);
  await page.waitForFunction(() => /Connected to your CadCraft account/.test(document.querySelector('[data-bid-conn]').textContent));
  ok(true, 'the token posted by that tab is taken: "Connected to your CadCraft account for this tab"');
  await T(() => { window.postMessage({ type: 'something-else', app: 'takeoffcraft', token: 'ccu_' + 'X'.repeat(40) }, '*'); window.postMessage({ type: 'cadcraft-bids-token', app: 'takeoffcraft', token: 'not-a-token' }, '*'); window.postMessage({ type: 'cadcraft-bids-token', app: 'cadcraft', token: 'ccu_' + 'Y'.repeat(40) }, '*'); });
  await page.waitForTimeout(300);
  ok(await T(() => JSON.parse(sessionStorage.getItem('takeoffcraft.bids')).token.startsWith('ccu_TTTT')), 'messages of another type, another app or a malformed token are ignored');
  await page.waitForSelector('[data-bid-sub]');
  const subs = await page.textContent('[data-bid-subs]');
  ok(/Sub One Drywall/.test(subs) && /Old Insurance Co/.test(subs) && /insurance or license expired/.test(subs) && subs.indexOf('Sub One') < subs.indexOf('Old Insurance'), 'the subcontractor records are listed, this trade\'s first, an expired insurance flagged');

  // validation
  await page.fill('[data-bid-people]', '');
  await page.click('[data-bid-send]');
  ok(/at least one person/.test(await page.textContent('[data-bid-msg]')), 'no one to invite: refused');
  await page.fill('[data-bid-people]', 'someone@x.example, not-an-address');
  await page.click('[data-bid-send]');
  ok(/not email addresses: not-an-address/.test(await page.textContent('[data-bid-msg]')), 'a bad address is named');
  await page.fill('[data-bid-due]', '2020-01-01T10:00');
  await page.fill('[data-bid-people]', 'someone@x.example');
  await page.click('[data-bid-send]');
  ok(/due date and time in the future/.test(await page.textContent('[data-bid-msg]')), 'a due time in the past: refused');
  const due = new Date(Date.now() + 5 * 86400000); due.setHours(17, 0, 0, 0);
  const opens = new Date(due.getTime() + 3600000);
  const loc = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  await page.fill('[data-bid-due]', loc(due));
  await page.fill('[data-bid-opens]', loc(new Date(due.getTime() - 3600000)));
  await page.click('[data-bid-send]');
  ok(/opening time cannot be before the due time/.test(await page.textContent('[data-bid-msg]')), 'an opening before the due time: refused');
  ok(!seen.some((r) => r.m === 'POST'), 'still nothing created on the site');
  await page.fill('[data-bid-opens]', loc(opens));

  // send for real (against the stand-in)
  await page.fill('[data-bid-message]', 'Please price all lines.');
  await page.fill('[data-bid-people]', 'Pat Painter <pat@paint.example>\nsam@one.example');
  await page.check('[data-bid-pick="olga@old.example"]');
  await page.click('[data-bid-send]');
  await page.waitForFunction(() => /Invitations sent to|Invitation sent to/.test(document.querySelector('[data-bid-msg]').textContent), null, { timeout: 30000 });
  const msg = await page.textContent('[data-bid-msg]');
  ok(/Invitations sent to 2 people\./.test(msg) && /1 already invited/.test(msg), 'result: "Invitations sent to 2 people." and the one already invited is named (' + msg + ')');
  const created = server.created;
  ok(created.pkg === '09' && created.lines.length === 2 && created.lines.map((l) => l.name).join() === 'Base,Paint' && created.message === 'Please price all lines.' && created.tz && created.opens && new Date(created.opens) > new Date(created.due), 'POST packages: the 09 package with its two lines, message, zone, due and a later opening');
  ok(!/10000|4000|6000|price|mat/i.test(JSON.stringify(created.lines)), 'no price of ours is in the lines sent');
  const sh = seen.find((r) => r.p.endsWith('/sheets'));
  ok(sh && sh.ct === 'application/pdf' && sh.body.subarray(0, 5).toString() === '%PDF-', 'the sheets went up as the raw PDF body (Content-Type application/pdf)');
  ok(seen.every((r) => r.auth === 'Bearer ' + TOKEN), 'every call carried the Bearer token');
  ok(server.invitees.length === 3 && server.invitees.some((i) => i.subcontractor === '99999999-0000-4000-8000-000000000002' && i.email === 'olga@old.example') && server.invitees[0].name === 'Pat Painter', 'invitees: typed (with name), typed again, and the ticked record (with its uuid)');
  await page.keyboard.press('Escape');                                       // close the Send dialog
  await page.waitForSelector('[data-lvl-req]');
  ok(/Sent to 2 people\. Due .*sealed until/.test(await page.textContent('[data-lvl-req]')), 'the leveling dialog now shows the request: sent to 2 people, sealed until the opening');
  const reqs = await T(() => window.takeoffcraft.model.state.bidreqs);
  ok(reqs.length === 1 && reqs[0].uuid === PUUID && reqs[0].pkg === '09' && reqs[0].n === 2, 'the request is recorded in the takeoff');
  await page.screenshot({ path: path.join(OUT, '01-sent.png') });

  // get prices: sealed
  await page.click('[data-lvl-get="09"]');
  await page.waitForFunction(() => /Still sealed/.test(document.querySelector('.tc-lib-msg').textContent));
  ok(/Sealed until .*2 of 3 have answered/.test(await page.textContent('[data-lvl-req]')) && !(await T(() => (window.takeoffcraft.model.state.bids || []).length)), 'Get prices while sealed: "Still sealed", 2 of 3 answered, no bid comes in');
  // opened
  server.phase = 'opened';
  const u0 = await T(() => window.takeoffcraft.model.undoStack.length);
  await page.click('[data-lvl-get="09"]');
  await page.waitForFunction(() => (window.takeoffcraft.model.state.bids || []).length === 2);
  ok(/Prices in: 2 new, 0 changed\. 1 arrived after the due time\./.test(await page.textContent('.tc-lib-msg')), 'after the opening: "Prices in: 2 new, 0 changed. 1 arrived after the due time."');
  ok((await T(() => window.takeoffcraft.model.undoStack.length)) === u0 + 1, 'the whole pull is one undo step');
  const bids = await T(() => window.takeoffcraft.model.state.bids.map((b) => ({ id: b.id, who: b.bidder, amount: b.amount, late: b.src?.late })));
  ok(bids.map((b) => b.who + b.amount).join() === 'Sub One Drywall420000,Late Plasterers380000', 'two bids: Sub One at $4,200.00, Late Plasterers at $3,800.00');
  const lateRow = bids.find((b) => b.late);
  ok(/web, late/.test(await page.textContent(`[data-lvl-web="${lateRow.id}"]`)) && /web/.test(await page.textContent(`[data-lvl-web="${bids[0].id}"]`)), 'each bid is flagged "web", the late one "web, late"');
  ok((await page.textContent(`[data-lvl-row="${lateRow.id}"]`)).includes('Low'), 'the late bid is still the low one: lateness is a mark, not a ruling');
  // B3: choose a bid as the package's price
  ok((await page.$(`[data-lvl-award="${bids[0].id}"]`)) !== null, 'each bid has a Use button');
  await page.click(`[data-lvl-award="${bids[0].id}"]`);
  await page.waitForFunction((id) => document.querySelector(`[data-lvl-award="${id}"]`)?.getAttribute('aria-pressed') === 'true', bids[0].id);
  // own: base $4.00 + paint $1,000 + mobilization $2,000; package 09 = $1,004.00 → replaced by $4,200.00 → $6,200.00
  ok((await T(() => window.takeoffcraft.estimate().total)) === 200000 + 420000, 'chosen: the estimate\'s job total is mobilization $2,000.00 + the bid $4,200.00 = $6,200.00');
  ok((await T(() => window.takeoffcraft.estimate().rows.filter((r) => r.awarded).length)) === 2, 'the package\'s two items stay as rows (quantities kept), marked as priced by the bid');
  const u1 = await T(() => window.takeoffcraft.model.undoStack.length);
  await page.click(`[data-lvl-award="${bids[1].id}"]`);
  await page.waitForFunction(() => window.takeoffcraft.estimate().total === 200000 + 380000);
  ok((await T(() => window.takeoffcraft.model.undoStack.length)) === u1 + 1, 'switching to the other bid ($3,800.00) is one undo step');
  await page.screenshot({ path: path.join(OUT, '02-leveling.png') });
  await page.keyboard.press('Escape');
  await T(() => { document.activeElement?.blur(); });
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.takeoffcraft.estimate().total === 200000 + 420000);
  ok(true, 'Ctrl+Z puts the first bid back');
  // the quantities table
  await page.click('[data-act="export-level"]').catch(() => {});
  await page.keyboard.press('Escape');
  const tableText = await T(() => document.querySelector('[data-qty-table]')?.textContent || document.body.innerText);
  ok(/Chosen bid: Sub One Drywall, for 09/.test(tableText), 'the Quantities table has the row "Chosen bid: Sub One Drywall, for 09 …"');
  // saved file keeps it
  const saved = await T(() => JSON.parse(JSON.stringify(window.takeoffcraft.model.toJSON())));
  ok(saved.bidreqs?.length === 1 && saved.awards?.length === 1 && saved.bids.every((b) => b.src?.p === '11111111-2222-4333-8444-555555555555'), 'the saved project keeps the request, the choice and each bid\'s source');
  // a new version with a lower price changes the chosen bid in place
  server.revision = 2;
  await page.click('[data-export-menu] > summary');
  await page.click('[data-act="export-level"]');
  await page.waitForSelector('[data-lvl-pkg="09"]');
  // a connected tab asks quietly when the dialog opens
  await page.waitForFunction(() => /changed/.test(document.querySelector('.tc-lib-msg').textContent), null, { timeout: 10000 });
  ok(/Prices in: 0 new, 1 changed\./.test(await page.textContent('.tc-lib-msg')) && (await T(() => window.takeoffcraft.model.state.bids.find((b) => b.src.r === 'aaaaaaaa-0000-4000-8000-000000000001').src.v)) === 2 && (await T(() => window.takeoffcraft.model.state.bids.length)) === 2,
    'opening the dialog asks the site quietly: a bidder\'s new version (revision 2) shows as "0 new, 1 changed", not as a new bid');
  await page.keyboard.press('Escape');
  ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  if (problems.length) console.log('  console: ' + problems.slice(0, 8).join(' | '));
} finally {
  await browser.close();
  try { admin('down', 'main'); } catch { /* already down */ }
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${path.relative(ROOT, OUT)}`);
process.exit(fail ? 1 : 0);
