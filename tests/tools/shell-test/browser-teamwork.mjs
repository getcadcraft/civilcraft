#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-teamwork.mjs — the Team panel in an app's dev build (0.8 LC.2, teamwork_PART_4): opens with ?cloud=<uuid> and a stand-in for Studio's
 * cadcraftDesktop.cloud.request (an in-page fake of the site), then: the release gate, the button, post a comment, Pin as issue (needs an adapter anchor),
 * Export BCF (a real download of the zip the stand-in returns), Import BCF (a file chosen in the page), and window.ccVaultCloud handed to the Documents panel.
 *   node tools/shell-test/browser-teamwork.mjs [--apps cadcraft,bimcraft]
 * Run as root (a session minted for the shell's test admin).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const APPS = ((i) => (i >= 0 ? args[i + 1] : 'cadcraft,bimcraft'))(args.indexOf('--apps')).split(',');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const D = '0b9d7e4e-5f0a-4f0e-9a52-0123456789ab';
const curl = (url, cookie) => execFileSync('curl', ['-sk', '--resolve', 'getcadcraft.com:443:127.0.0.1', ...(cookie ? ['-b', cookie] : []), url], { encoding: 'utf8', maxBuffer: 64 << 20 });
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/shell-test/admin.php'), 'session'], { encoding: 'utf8' }));

console.log('== the release gate');
for (const slug of APPS) {
  ok(curl(`${BASE}/lab/${slug}`, minted.cookie).includes('id="cc-teamwork"'), `${slug}: /lab (dev) has the Team module`);
  ok(!curl(`${BASE}/use/${slug}`).includes('id="cc-teamwork"'), `${slug}: /use (release) does not`);
}
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const pw = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, pw, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, serviceWorkers: 'block', acceptDownloads: true });
const [cn, cv] = minted.cookie.split('=');
await ctx.addCookies([{ name: cn, value: cv, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
await ctx.addInitScript((D) => {
  // a stand-in for Studio's bridge: cadcraftDesktop.cloud.request answered by a tiny fake of /api/v1/team/*
  const rows = []; const seen = []; let seq = 0; window.__models = [];
  window.__seen = seen;
  const json = (status, data, extra = {}) => ({ status, json: () => (status < 300 ? { status: 'success', data } : { status: 'error', ...extra }) });
  window.cadcraftDesktop = { cloud: { request: async (o) => {
    let anchorRef = null; try { if (o.contentType === 'application/json') anchorRef = JSON.parse(new TextDecoder().decode(o.body)).anchor?.ref || null; } catch (e) { /* not json */ }
    seen.push({ method: o.method, path: o.path, ctype: o.contentType, n: o.body ? o.body.length : 0, anchorRef });
    const u = new URL(o.path, 'https://x.test');
    if (u.pathname === '/api/v1/team/comments' && o.method === 'GET') return json(200, { comments: rows.map((r) => ({ ...r, replies: [] })), open: rows.length, resolved: 0 });
    if (u.pathname === '/api/v1/team/comments') { const b = JSON.parse(new TextDecoder().decode(o.body)); rows.push({ uuid: 'c' + (++seq), kind: b.kind || 'comment', body: b.body, state: 'open', anchor: b.anchor || null, author: { name: 'Ana' }, at: '2026-10-30T10:00:00' }); return json(201, { comment: rows.at(-1), notified: 0 }); }
    if (u.pathname === '/api/v1/vault/folders') return { status: 200, body: new TextEncoder().encode(JSON.stringify({ status: 'success', data: { folders: [{ uuid: '11111111-1111-4111-8111-111111111111', name: 'Plans', workspace: 'Riverside Studio', workspace_uuid: '22222222-2222-4222-8222-222222222222' }] } })) };
    if (u.pathname === '/api/v1/sync/versions') return json(200, { drawing: { project: 'aaaaaaaa-5f0a-4f0e-9a52-0123456789ab', project_name: 'Tower', can_edit: true } });
    if (u.pathname === '/api/v1/team/model' && o.method === 'GET') return json(200, { models: window.__models, hidden: 1, project: {} });
    if (u.pathname === '/api/v1/team/model') { const b = JSON.parse(new TextDecoder().decode(o.body)); if (b.action === 'remove') window.__models = []; else window.__models = [{ drawing: { uuid: b.drawing, name: 'This drawing' }, discipline: b.discipline || '' }]; return json(200, {}); }
    if (u.pathname === '/api/v1/team/notifications') return json(200, { unread: 0, items: [] });
    if (u.pathname === '/api/v1/team/bcf' && o.method === 'GET') return { status: 200, body: new Uint8Array([0x50, 0x4b, 3, 4, 1, 2, 3]), json: () => null };
    if (u.pathname === '/api/v1/team/bcf') return json(200, { imported: 2, skipped: 1, comments: 0, problems: [] });
    return json(404, null, { code: 'not_found' });
  } } };
}, D);
const page = await ctx.newPage();
let problems = [];
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const wait = async (fn, ms = 6000) => { const t = Date.now(); while (Date.now() - t < ms) { if (await page.evaluate(fn).catch(() => false)) return true; await sleep(60); } return false; };

for (const slug of APPS) {
  console.log('== ' + slug);
  problems = [];
  await page.goto(`${BASE}/lab/${slug}?cloud=${D}`, { waitUntil: 'domcontentloaded' });
  ok(await wait(() => !!window.ccTeamwork, 25000), 'window.ccTeamwork is there');
  ok(await page.evaluate(() => typeof window.ccVaultCloud?.request === 'function' && window.ccVaultCloud.available()), 'window.ccVaultCloud was handed over from Studio\'s cloud');
  ok(await page.evaluate(async () => { const r = await window.ccVaultCloud.request('GET', '/api/v1/vault/folders'); return r.status === 200 && JSON.parse(new TextDecoder().decode(await r.bytes())).data.folders.length === 1; }), 'a Documents call goes through the same transport');
  if (slug === 'cadcraft') {
    // the real Documents panel, over the handed-over transport: "Open a cloud folder" lists the account's folders
    await page.evaluate(() => window.cadcraft.engine.text('DOCUMENTS'));
    ok(await page.locator('[data-vault-panel] [data-vault-cloud]').waitFor({ timeout: 8000 }).then(() => true).catch(() => false), 'Documents offers "Open a cloud folder" with the hand-over alone');
    await page.locator('[data-vault-panel] [data-vault-cloud]').click();
    ok(await page.locator('[data-vault-panel] [data-vault-cloud-folder]').waitFor({ timeout: 8000 }).then(() => true).catch(() => false), 'and lists the folders the site answered (through cloud.request)');
    await page.evaluate(() => document.querySelector('[data-vault-panel]')?.closest('.cc-panel,[role=dialog]')?.remove());
  }
  ok(await wait(() => { const b = document.querySelector('.app-bar-teamwork'); return !!b && !b.hidden; }), 'the Team button shows for a cloud file inside Studio');
  await page.click('.app-bar-teamwork');
  const panel = page.locator('.cct-tw-form').first();
  ok(await panel.isVisible(), 'the panel opens with its form');
  ok(await page.locator('.cct-tw-form [data-kind="issue"]').isDisabled(), 'Pin as issue is off until the app says where');
  await page.fill('.cct-tw-form textarea', 'The beam is too low');
  await page.click('.cct-tw-form [data-kind="comment"]');
  ok(await wait(() => /too low/.test(document.querySelector('.cct-tw-list')?.innerText || '')), 'a posted comment shows in the list');
  // no mount of its own: the element the app has selected for Design reasons is the default place (ccReasons.selected / selectElement)
  await page.evaluate(() => window.ccReasons.attach({ selection: () => ({ kind: 'wall', id: 7, label: 'Wall 7' }), onSelection: () => () => {}, select: (e) => { window.__picked = e; }, persist: () => {} }));
  await page.click('.app-bar-teamwork'); await page.click('.app-bar-teamwork');
  ok(await wait(() => document.querySelector('.cct-tw-form [data-kind="issue"]') && !document.querySelector('.cct-tw-form [data-kind="issue"]').disabled), 'the selected element is the default place: Pin as issue is on with no mount in the app');
  await page.fill('.cct-tw-form textarea', 'Wall 7 is wrong');
  await page.click('.cct-tw-form [data-kind="issue"]');
  ok(await wait(() => /Wall 7 is wrong/.test(document.querySelector('.cct-tw-list')?.innerText || '')), 'the pinned issue is posted');
  ok(await page.evaluate(() => window.__seen.some((s) => { try { return s.method === 'POST' && s.path === '/api/v1/team/comments' && s.anchorRef === 'wall:7'; } catch (e) { return false; } })), 'the issue carries ref wall:7');
  await page.click('.cct-tw-thread:last-child [data-k], .cct-tw-thread:last-child .cct-tw-actions button');
  ok(await wait(() => window.__picked && window.__picked.kind === 'wall' && window.__picked.id === 7), 'Show asks the app to select that element again');
  await page.evaluate(() => window.ccTeamwork.attach({ anchor: () => ({ kind: 'point', xyz: [1, 2, 3] }), goto: () => {} }));
  await page.click('.app-bar-teamwork'); await page.click('.app-bar-teamwork');   // reopen so the form is re-rendered with the anchor
  ok(await wait(() => document.querySelector('.cct-tw-form [data-kind="issue"]') && !document.querySelector('.cct-tw-form [data-kind="issue"]').disabled), 'an app that gives an anchor enables Pin as issue');
  await page.fill('.cct-tw-form textarea', 'Clash here');
  await page.click('.cct-tw-form [data-kind="issue"]');
  ok(await wait(() => /Clash here/.test(document.querySelector('.cct-tw-list')?.innerText || '')), 'a pinned issue is posted');
  ok(await page.evaluate(() => window.__seen.some((s) => s.method === 'POST' && s.path === '/api/v1/team/comments')), 'it went through cloud.request');
  await page.click('[data-team-model] summary');
  ok(await wait(() => !!document.querySelector('[data-team-model-set]')), 'the Team model section opens and offers Add this file (this account can edit)');
  ok(/Files you cannot open: 1/.test(await page.locator('[data-team-model]').innerText()), 'files this account cannot open are counted, not named');
  await page.selectOption('[data-team-model] select', 'structure');
  await page.click('[data-team-model-set]');
  ok(await wait(() => /Structure/.test(document.querySelector('[data-team-model-list]')?.innerText || '') && !!document.querySelector('[data-team-model-remove]')), 'adding puts this file in the model with its discipline');
  await page.click('[data-team-model-remove]');
  ok(await wait(() => !document.querySelector('[data-team-model-remove]')), 'taking it out empties the list');
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-bcf-export]')]);
  const dest = path.join('/tmp', 'bcf-dl-' + process.pid + '.bcfzip'); await dl.saveAs(dest);
  ok(fs.statSync(dest).size === 7 && /\.bcfzip$/.test(dl.suggestedFilename()), 'Export BCF downloads the zip (' + dl.suggestedFilename() + ')');
  const zipFile = dest;
  await page.setInputFiles('[data-bcf-import]', zipFile);
  ok(await wait(() => /2 issues added, 1 already here/.test(document.querySelector('.cct-tw-msg')?.innerText || '')), 'Import BCF sends the file and says what it did');
  ok(await page.evaluate(() => window.__seen.some((s) => s.method === 'POST' && s.path.startsWith('/api/v1/team/bcf') && s.ctype === 'application/zip' && s.n === 7)), 'the zip went up as application/zip bytes');
  fs.unlinkSync(dest);
  ok(problems.length === 0, 'no page errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
}
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
