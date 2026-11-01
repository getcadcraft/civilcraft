#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-regs.mjs — the Building regulations add-on (0.8 REG.1) in the lab, headless, with real clicks.
 *   node tools/bimcraft-test/browser-regs.mjs [--shots <dir>]
 * Run as root: a session minted for the test admin (tools/cadcraft-test/admin.php session bimregs), so the admin-login throttle
 * is never touched. Fails on any console error. On the showcase house (fixtures/showcase/bimcraft-house.ifc):
 *   off      the add-on is off until switched on: no Settings section, no schedule, the stair tool as it always was
 *   on       Settings › Building regulations is a checkbox tree of packs in sets by country (paid packs tagged, details open per pack);
 *            a pack file can be uploaded (refused with reasons when bad; "Your pack", never reviewed) and removed; the schedule is worked
 *            out for each ticked pack (two ticked: a Pack column); a stair says which pack its limits come from and is judged by it
 *   off again the schedule goes, and the stair's limits go back to the built-in ones
 *   reload   the add-on and the ticks are still there
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' (' + d + ')' : '')); } };
const shot = async (page, name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session', 'bimregs'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
await ctx.addInitScript(() => { try { const k = 'bimcraft.settings', v = JSON.parse(localStorage.getItem(k) || '{}') || {}; if (!v.dwgStart) { v.dwgStart = '2d'; localStorage.setItem(k, JSON.stringify(v)); } } catch (e) { /* none */ } });
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const waitStatus = (re, timeout = 60000) => page.waitForFunction((src) => new RegExp(src).test(document.querySelector('[data-status]')?.textContent || ''), re.source, { timeout });
const settled = () => page.waitForFunction(() => { const s = window.bimcraftPlan?.state; return s && !s.busy && !s.reloading && !s.queue.length; }, null, { timeout: 90000 });
const at = async (x, y) => page.evaluate(([x, y]) => { const pv = window.bimcraftPlan.view, r = pv.canvas.getBoundingClientRect(), s = pv.toScreen([x, y]); return [r.left + s.x, r.top + s.y]; }, [x, y]);
const planClick = async (x, y) => { const [px, py] = await at(x, y); await page.mouse.move(px, py, { steps: 2 }); await page.mouse.click(px, py); };
const addon = () => page.evaluate(() => { const a = window.ccAddons?.list().find((x) => x.id === 'regs'); return a ? { state: a.state, reason: a.reason } : null; });
const setAddon = async (on) => { await page.evaluate((v) => window.ccAddons.loader.setEnabled('regs', v), on); await page.waitForFunction((v) => window.ccAddons.list().find((x) => x.id === 'regs')?.state === (v ? 'active' : 'off'), on, { timeout: 15000 }); };
const sectionTitles = async () => { await page.click('[data-settings-open]'); await page.waitForSelector('dialog[data-app-settings][open]'); const tab = await page.$('dialog[data-app-settings] [data-settings-tab="app"]'); if (tab) await tab.click(); const t = await page.$$eval('dialog[data-app-settings] .shell-sec-nav button', (bs) => bs.map((b) => b.textContent.trim())); await page.keyboard.press('Escape'); return t; };
// The dialog lists its sections on the left and shows one at a time: "Building regulations" is the section this test needs.
const openSettings = async () => {
  await page.click('[data-settings-open]'); await page.waitForSelector('dialog[data-app-settings][open]');
  const tab = await page.$('dialog[data-app-settings] [data-settings-tab="app"]'); if (tab) await tab.click();
  await page.click('dialog[data-app-settings] .shell-sec-nav button:text-is("Building regulations")');
  await page.waitForSelector('[data-addon-settings="regs.regs"]:not(.shell-sec-off), [data-addon-settings]:has([data-regs-tree]):not(.shell-sec-off)', { timeout: 5000 });
};
const closeSettings = async () => { await page.keyboard.press('Escape'); await page.waitForSelector('dialog[data-app-settings][open]', { state: 'detached', timeout: 5000 }).catch(() => {}); };
const scheduleRows = () => page.$$eval('[data-msched] tbody tr', (trs) => trs.map((tr) => [...tr.querySelectorAll('td')].map((td) => td.textContent.trim())));
// Tick exactly these packs in Settings › Building regulations (owner 2026-10-26: a checkbox tree in sets by place, not a dropdown).
const pickPack = async (...ids) => {
  await openSettings();
  for (const b of await page.$$('[data-regs-set] > .rg-row > .rg-twisty[aria-expanded="false"]')) await b.click();
  for (const id of await page.$$eval('[data-regs-on]', (bs) => bs.map((b) => b.dataset.regsOn))) {
    const box = page.locator(`[data-regs-on="${id}"]`);
    if ((await box.isChecked()) !== ids.includes(id)) await box.click();
  }
  await closeSettings();
};

try {
  await page.goto(BASE + '/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.setItem('bimcraft.model.units', 'mm'); localStorage.removeItem('cc-addons:bimcraft'); ['pack', 'on', 'mode', 'own'].forEach((k) => localStorage.removeItem('cc-addon:bimcraft:regs:' + k)); localStorage.removeItem('cc-regs:library'); } catch (e) { /* none */ } });
  await page.reload({ waitUntil: 'networkidle' });

  console.log('== off until it is switched on');
  const first = await addon();
  ok(first && first.state === 'off', 'the add-on is listed and off: ' + JSON.stringify(first));
  ok(!(await sectionTitles()).includes('Building regulations'), 'no Building regulations section in Settings');
  await page.setInputFiles('[data-file]', { name: 'bimcraft-house.ifc', mimeType: 'application/x-step', buffer: fs.readFileSync(path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc')) });
  await waitStatus(/^Opened bimcraft-house/, 120000);
  await page.click('[data-model-toggle]');
  await page.waitForSelector('[data-plan-wrap]:not([hidden])');
  await settled();
  ok(!(await page.$('[data-msched-kind] option[value="regs"]')), 'no Building regulations in the schedule list');
  await page.click('[data-res-tools] > summary');
  await page.click('[data-mtool="stair"]');
  await page.waitForSelector('[data-mopts="stair"]:not([hidden])');
  ok((await page.textContent('[data-res-rules-tag]')).trim() === '', 'the stair options row says nothing about regulations');
  await page.keyboard.press('Escape');

  console.log('== switched on: Settings › Building regulations');
  await setAddon(true);
  await page.waitForSelector('[data-regs-on]', { state: 'attached', timeout: 10000 });
  ok((await sectionTitles()).includes('Building regulations'), 'the section is in Settings once the add-on is on');
  await openSettings();
  ok(!(await page.$('dialog[data-app-settings] [data-addon-settings] select[data-regs-pick]')), 'no dropdown: the packs are a checkbox tree');
  const sets = await page.$$eval('[data-regs-set]', (ls) => ls.map((l) => [l.dataset.regsSet, [...l.querySelectorAll('[data-regs-pack]')].map((p) => p.dataset.regsPack + (p.querySelector('[data-regs-on]').checked ? '+' : '-'))]));
  ok(sets.length === 2 && sets.some(([c, ps]) => c === 'US' && ps.join() === 'us-irc-2021+,us-sample-maker-stairs-') && sets.some(([c, ps]) => c === 'ZA' && ps.join() === 'za-sans10400-'), 'sets by country, each pack a checkbox: the United States IRC ticked by default', JSON.stringify(sets));
  ok(await page.$eval('[data-regs-set="US"] > .rg-row [data-regs-tag="paid-set"]', (e) => e.textContent.trim()) === '1 paid', 'the United States set says one of its packs is paid');
  ok(/Paid: \$5\.00/.test(await page.textContent('[data-regs-pack="us-sample-maker-stairs"] [data-regs-tag="paid"]')) && !(await page.$('[data-regs-pack="us-irc-2021"] [data-regs-tag="paid"]')), 'the paid pack is tagged with its price; the IRC is not');
  ok(/draft/.test(await page.textContent('[data-regs-pack="us-irc-2021"] .rg-tags')), 'each pack says how far its numbers can be trusted');
  if (await page.getAttribute('[data-regs-set="ZA"] > .rg-row > .rg-twisty', 'aria-expanded') !== 'true') await page.click('[data-regs-set="ZA"] > .rg-row > .rg-twisty');
  ok(await page.isVisible('[data-regs-on="za-sans10400"]'), 'a set opens to show its packs');
  await page.click('[data-regs-pack="us-irc-2021"] > .rg-row > .rg-twisty');
  ok(await page.$eval('[data-regs-detail="us-irc-2021"] [data-regs-state]', (e) => e.dataset.regsState) === 'draft', 'the United States pack opens to its details: a draft');
  const usRules = await page.$$eval('[data-regs-detail="us-irc-2021"] [data-regs-rule]', (rs) => rs.map((r) => r.dataset.regsRule + ' | ' + [...r.querySelectorAll('td')].map((td) => td.textContent.trim()).join(' | ')));
  const nUs = JSON.parse(fs.readFileSync(new URL('../../public_html/assets/apps/bimcraft/dev/addons/regs/packs/us-irc-2021.json', import.meta.url), 'utf8')).rules.length;
  ok(usRules.length === nUs && usRules.some((r) => /stair\.riser\.max .*R311\.7\.5\.1.*at most 19[67]/.test(r)) && usRules.some((r) => /escape\.area\.min .*R310\.2\.1.*0\.53 m²/.test(r)), 'every rule of the pack (' + nUs + ') is listed with its clause number, in the person\'s units (mm here; areas in m²)', usRules.slice(0, 2).join(' / '));
  const nowrap = await page.$$eval('[data-regs-detail="us-irc-2021"] [data-regs-rule] td:nth-child(2), [data-regs-detail="us-irc-2021"] [data-regs-rule] td:nth-child(3)', (tds) => tds.map((td) => getComputedStyle(td).whiteSpace === 'nowrap' && td.scrollWidth <= td.clientWidth + 1));
  ok(nowrap.length === nUs * 2 && nowrap.every(Boolean), 'the clause and the limit never wrap onto a second line, and fit their column');
  const sizes = await page.$$eval('[data-regs-detail="us-irc-2021"] [data-regs-rule] td:first-child, [data-regs-detail="us-irc-2021"] .rg-note', (es) => es.map((e) => parseFloat(getComputedStyle(e).fontSize)));
  ok(Math.max(...sizes) <= 15, 'the rule text and its notes are small and consistent (largest ' + Math.max(...sizes) + ' px)');
  await page.click('[data-regs-pack="us-sample-maker-stairs"] > .rg-row > .rg-twisty');
  ok(await page.getAttribute('[data-regs-buy="us-sample-maker-stairs"]', 'href') === 'https://example.com/' && /International Residential Code/.test(await page.textContent('[data-regs-detail="us-sample-maker-stairs"]')), 'the paid pack links to the maker and names the pack it builds on');
  ok(await page.$eval('[data-regs-mode-pick="each"]', (r) => r.checked), 'ticked packs that disagree: each is checked on its own by default');
  await shot(page, 'settings-tree');
  await page.click('[data-regs-on="za-sans10400"]');
  await page.click('[data-regs-on="us-irc-2021"]');
  await page.waitForFunction(() => document.querySelector('[data-regs-on="za-sans10400"]')?.checked && !document.querySelector('[data-regs-on="us-irc-2021"]')?.checked);
  await page.click('[data-regs-pack="za-sans10400"] > .rg-row > .rg-twisty');
  const zaRules = await page.$$eval('[data-regs-detail="za-sans10400"] [data-regs-rule]', (rs) => rs.map((r) => r.dataset.regsRule));
  ok(zaRules.length === 5 && /Not checked/.test(await page.textContent('[data-regs-detail="za-sans10400"] [data-regs-state]')), 'South Africa: five rules, and the box says the numbers are not checked');
  ok(await page.evaluate(() => localStorage.getItem('cc-addon:bimcraft:regs:on')) === '["za-sans10400"]', 'the ticks are kept by the add-on');

  console.log('== upload a regulations file');
  const own = { ...JSON.parse(fs.readFileSync(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/addons/regs/packs/za-sans10400.json'), 'utf8')), id: 'za-test-upload', name: 'Test upload: my office stairs', review: { state: 'reviewed', note: '' } };
  await page.setInputFiles('[data-regs-upload]', { name: 'bad.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ format: 'cadcraft-regulation-pack', version: 1, id: 'x' })) });
  await page.waitForSelector('[data-regs-upload-msg] .rg-msg-bad');
  ok(/not added/.test(await page.textContent('[data-regs-upload-msg]')) && await page.$$eval('[data-regs-upload-msg] li', (l) => l.length) > 0, 'a file that is not a valid pack is refused with the reasons');
  await page.setInputFiles('[data-regs-upload]', { name: 'mine.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(own)) });
  await page.waitForSelector('[data-regs-pack="za-test-upload"]');
  ok(/Added and ticked/.test(await page.textContent('[data-regs-upload-msg]')) && await page.isChecked('[data-regs-on="za-test-upload"]'), 'a valid pack is added and ticked');
  ok(await page.$eval('[data-regs-set="ZA"]', (s) => !!s.querySelector('[data-regs-pack="za-test-upload"] [data-regs-tag="own"]')) && !/reviewed/.test(await page.textContent('[data-regs-pack="za-test-upload"] .rg-tags')), 'listed under its country as Your pack, never as reviewed');
  await shot(page, 'settings-upload');
  await page.click('[data-regs-pack="za-test-upload"] > .rg-row > .rg-twisty');
  await page.click('[data-regs-remove="za-test-upload"]');
  await page.waitForSelector('[data-regs-pack="za-test-upload"]', { state: 'detached' });
  ok(await page.evaluate(() => localStorage.getItem('cc-addon:bimcraft:regs:own')) === '[]' && await page.isChecked('[data-regs-on="za-sans10400"]'), 'Remove takes it off this computer; the other ticks stay');
  await closeSettings();

  console.log('== the Building regulations schedule on the showcase house');
  await page.selectOption('[data-msched-kind]', 'regs');
  await page.waitForSelector('[data-msched] table', { timeout: 10000 });
  const za = await scheduleRows();
  console.log('     South Africa rows: ' + za.length + (za[0] ? '  e.g. ' + za[0].join(' | ') : ''));
  ok(za.length > 0 && za.every((r) => ['Part C', 'Part O', 'Part M'].includes(r[2])), 'South Africa: every row cites a Part of SANS 10400 (C, O or M)');
  ok(/Not checked/.test(await page.textContent('[data-schedule-note]')), 'the schedule\'s note names the pack and says its numbers are not checked');
  await page.evaluate(() => { const sec = document.querySelector('[data-msched-sec]'); const pane = sec && sec.closest('[data-rpane]'); if (pane) document.querySelector('[data-rtab="' + pane.dataset.rpane + '"]')?.click(); });
  await page.locator('[data-msched]').scrollIntoViewIfNeeded().catch(() => {});
  await shot(page, 'schedule-za');
  await page.click('[data-schedule-expand]');
  await page.waitForSelector('dialog[data-schedule-expanded][open] table');
  ok(await page.$$eval('dialog[data-schedule-expanded] tbody tr', (trs) => trs.length) === za.length && await page.$$eval('dialog[data-schedule-expanded] thead th', (h) => h.length) === 6, 'Open full schedule: the six columns and all ' + za.length + ' rows in a wide dialog');
  await shot(page, 'schedule-za-full');
  await page.click('[data-schedule-close]');
  await pickPack('us-irc-2021');
  await page.waitForFunction(() => /R30[35]/.test(document.querySelector('[data-msched]')?.textContent || ''), null, { timeout: 10000 });
  const us = await scheduleRows();
  ok(us.length > 0 && us.every((r) => /^(R[3-6]\d\d|Table R[4-8]\d\d|N\d{4}|E\d{4})/.test(r[2])) && us.some((r) => /^R303\.1/.test(r[2])) && us.some((r) => /^R305\.1/.test(r[2])), 'back to the United States: the same rooms against IRC R303.1 and R305.1 (tier 2 and 3 rules too, all IRC sections)');
  const light = (rows) => rows.filter((r) => /Glazing|Window area/.test(r[1]));
  ok(light(us).length > 0 && light(za).length === light(us).length && light(us)[0][4] === light(za)[0][4] && light(us)[0][3] !== light(za)[0][3], 'the glazing found is the same under both packs, the number asked for is not (' + light(us)[0]?.[3] + ' vs ' + light(za)[0]?.[3] + ')');

  await pickPack('us-irc-2021', 'za-sans10400');
  await page.waitForFunction(() => document.querySelectorAll('[data-msched] thead th').length === 7, null, { timeout: 10000 });
  const both = await scheduleRows();
  ok(both.length === us.length + za.length && both.some((r) => /International/.test(r[1])) && both.some((r) => /South Africa/.test(r[1])), 'both ticked: each pack checked on its own, a Pack column says which (' + both.length + ' rows)');

  console.log('== a stair says which pack its limits come from');
  await pickPack('za-sans10400');
  await page.click('[data-res-tools] > summary');
  await page.click('[data-mtool="stair"]');
  await page.waitForSelector('[data-mopts="stair"]:not([hidden])');
  const tag = await page.textContent('[data-res-rules-tag]');
  ok(/South Africa/.test(tag) && /not checked/.test(tag), 'the stair options row names the pack: ' + tag);
  await page.selectOption('[data-res-stkind]', 'straight');
  await planClick(1500, -2500);
  const [ex, ey] = await at(6500, -2500);
  await page.mouse.move(ex, ey, { steps: 4 });
  await page.mouse.click(ex, ey);
  await settled();
  await page.click('[data-mtool="select"]');
  await page.click('[data-rtab="props"]').catch(() => {});
  await planClick(3000, -2500);
  await page.waitForSelector('[data-mp-stchecks]', { timeout: 10000 });
  const risersZa = await page.textContent('[data-mp-strisers]');
  const lineZa = await page.textContent('[data-mp-stchecks]');
  ok(/South Africa/.test(lineZa) && /not checked/.test(lineZa) && /Meets/.test(lineZa), 'Properties: the stair is checked against the South African pack and says so: ' + lineZa.slice(0, 140));
  ok(/14 × 200/.test(risersZa), 'the stair was made with the pack\'s riser: ' + risersZa);
  await shot(page, 'stair-properties-za');
  await pickPack('us-irc-2021');
  await page.keyboard.press('Escape');
  await planClick(3000, -2500);
  await page.waitForSelector('[data-mp-stchecks]', { timeout: 10000 });
  const lineUs = await page.textContent('[data-mp-stchecks]');
  ok(/International Residential Code/.test(lineUs) && /Outside/.test(lineUs), 'switched to the United States pack, the same stair is judged by IRC: ' + lineUs.slice(0, 150));

  console.log('== Settings › Global › Building regulations: install regions from the Library (one store for every app)');
  const openGlobal = async () => {
    await page.click('[data-settings-open]'); await page.waitForSelector('dialog[data-app-settings][open]');
    await page.click('dialog[data-app-settings] [data-settings-tab="general"]');
    await page.click('dialog[data-app-settings] .shell-sec-nav button:text-is("Building regulations")');
    await page.waitForSelector('[data-regs-regions] [data-regs-region]', { timeout: 15000 });
  };
  await openGlobal();
  const regionRows = await page.$$eval('[data-regs-region-row]', (rs) => rs.map((r) => r.dataset.regsRegionRow));
  ok(regionRows.includes('ZA') && regionRows.includes('US'), 'the Global tree lists the Library\'s countries: ' + regionRows.join(', '));
  await page.click('[data-regs-region-row="ZA"] > .rg-row > .rg-twisty');
  await page.waitForSelector('[data-regs-region-row="ZA"] [data-regs-region-pack="za-sans10400"]', { timeout: 10000 });
  ok(/5 rules/.test(await page.textContent('[data-regs-region-row="ZA"] [data-regs-region-pack="za-sans10400"]')), 'a country opens to its packs (South Africa: SANS 10400, 5 rules)');
  await page.click('[data-regs-region="ZA"]');
  await page.waitForFunction(() => /Installed South Africa/.test(document.querySelector('[data-regs-regions-msg]')?.textContent || ''), null, { timeout: 15000 });
  ok(await page.isChecked('[data-regs-region="ZA"]') && await page.evaluate(() => JSON.parse(localStorage.getItem('cc-regs:library')).regions.ZA.packs.length) === 2, 'ticking South Africa installs its packs (SANS 10400 and the Cape Town by-law on it) on this computer');
  await shot(page, 'global-regions');
  await page.click('dialog[data-app-settings] [data-settings-tab="app"]');
  await page.click('dialog[data-app-settings] .shell-sec-nav button:text-is("Building regulations")');
  const appSets = await page.$$eval('[data-regs-set]', (ls) => ls.map((l) => l.dataset.regsSet));
  ok(appSets.join() === 'ZA' && await page.$('[data-regs-pack="za-sans10400"] [data-regs-tag="library"]'), 'the app\'s tree now shows only the installed region, the pack tagged as the Library\'s', appSets.join());
  await page.click('dialog[data-app-settings] [data-settings-tab="general"]');
  await page.click('[data-regs-region="US"]');
  await page.waitForFunction(() => /Installed United States/.test(document.querySelector('[data-regs-regions-msg]')?.textContent || ''), null, { timeout: 15000 });
  await page.click('dialog[data-app-settings] [data-settings-tab="app"]');
  const appSets2 = await page.$$eval('[data-regs-set]', (ls) => ls.map((l) => l.dataset.regsSet).sort());
  ok(appSets2.join() === 'US,ZA' && await page.isChecked('[data-regs-on="us-irc-2021"]'), 'the United States installed too: both sets, and the new region\'s packs are listed', appSets2.join());
  const usPacks = await page.$$eval('[data-regs-set="US"] [data-regs-pack]', (ps) => ps.map((p) => p.dataset.regsPack));
  ok(usPacks.length >= 40 && usPacks.includes('us-ca') && usPacks.includes('us-irc-2024'), 'the United States brings the Library\'s packs: the IRC editions and the state packs (' + usPacks.length + ')');
  const ma = await page.$eval('[data-regs-pack="us-ma"]', (e) => e.textContent);
  ok(/Adopted law/.test(ma), 'a state pack is tagged as adopted law');
  console.log('== filter the tree (owner 2026-10-27: "filter down the tree to get to … the packs")');
  ok(await page.$('[data-regs-pack="us-ma"] > [data-regs-kids] > [data-regs-pack="us-ma-boston"]') && await page.$('[data-regs-set="US"] > ul > [data-regs-pack="us-co-denver"]'), 'a city pack sits under its state (Boston under Massachusetts); a city whose state has no pack stays at the top (Denver)');
  const visible = () => page.$$eval('[data-regs-tree] [data-regs-pack]', (ps) => ps.filter((p) => p.offsetParent !== null).map((p) => p.dataset.regsPack));
  const shownRules = () => page.$$eval('[data-regs-tree] [data-regs-detail]:not([hidden]) [data-regs-rule]', (rs) => [...new Set(rs.map((r) => r.dataset.regsRule))]);
  await page.fill('dialog[data-app-settings] [data-regs-filter]', 'header');
  await page.waitForFunction(() => /Showing \d+ of \d+ packs/.test(document.querySelector('dialog[data-app-settings] [data-regs-filter-count]')?.textContent || ''));
  const vh = await visible(), rh = await shownRules();
  ok(vh.includes('us-irc-2021') && !vh.includes('us-irc-2015') && !vh.includes('za-sans10400') && rh.join() === 'frame.header.span.max', 'typing "header": the packs that have a header rule, opened at that rule only (' + vh.length + ' packs)', rh.join());
  await shot(page, 'filter-header');
  await page.fill('dialog[data-app-settings] [data-regs-filter]', 'boston');
  await page.waitForFunction(() => !document.querySelector('[data-regs-pack="us-ca"]'));
  const vd = await visible();
  ok(vd.join() === 'us-ma,us-ma-boston', 'typing "boston": Boston and the state it sits under', vd.join());
  await page.fill('dialog[data-app-settings] [data-regs-filter]', 'zzqx');
  ok(await page.isVisible('[data-regs-filter-none]'), 'nothing matches: the tree says so');
  await page.fill('dialog[data-app-settings] [data-regs-filter]', '');
  await page.click('dialog[data-app-settings] [data-regs-trade="found"]');
  await page.waitForFunction(() => !document.querySelector('[data-regs-set="ZA"]'));
  const rf = await page.$$eval('[data-regs-detail="us-irc-2021"] [data-regs-rule]', (rs) => rs.map((r) => r.dataset.regsRule));
  ok(rf.length === 4 && rf.every((id) => id.startsWith('found.')) && !(await page.$('[data-regs-pack="us-irc-2015"]')), 'Foundations: only packs with foundation rules, each open at them (South Africa and the older IRC editions drop out)', rf.join());
  await shot(page, 'filter-foundations');
  await page.click('dialog[data-app-settings] [data-regs-trade=""]');
  await page.waitForSelector('[data-regs-set="ZA"]');
  ok(await page.$$eval('[data-regs-detail="us-irc-2021"] tbody[data-regs-group]', (g) => g.map((x) => x.dataset.regsGroup).join()) === 'stair,room,egress,elec,found,frame,energy', 'a pack\'s rules are grouped by trade');
  console.log('== an install from an older Library brings itself up to date');
  const upd = await page.evaluate(async () => {
    const st = JSON.parse(localStorage.getItem('cc-regs:library'));
    st.regions.US.packs = st.regions.US.packs.filter((p) => p.pack.id === 'us-irc-2021').map((p) => ({ ...p, version: 1, sha256: 'old' }));
    localStorage.setItem('cc-regs:library', JSON.stringify(st));
    const L = await import('/assets/apps/bimcraft/dev/addons/regs/lib/library.js?stale-test');
    const r = await L.refreshInstalled({ maxAgeMs: 0 });
    return { r, n: JSON.parse(localStorage.getItem('cc-regs:library')).regions.US.packs.length };
  });
  ok(upd.r.updated.includes('United States') && upd.n >= 40, 'one pack left at an old version: the next check fetches the region again (' + upd.n + ' packs)', JSON.stringify(upd.r));
  await closeSettings();
  await pickPack('us-irc-2021', 'za-sans10400');   // list just these two for the panel checks below

  console.log('== the Regulations panel: ticks for THIS drawing, saved in the IFC');
  await page.click('[data-rtab="addon-regs-regs"]');
  await page.waitForSelector('[data-regs-panel] [data-regs-p-on]', { timeout: 10000 });
  ok(await page.getAttribute('[data-regs-p-state]', 'data-regs-p-state') === 'defaults', 'the house has no ticks of its own: the defaults apply');
  ok(await page.isChecked('[data-regs-p-on="us-irc-2021"]') && await page.isChecked('[data-regs-p-on="za-sans10400"]'), 'both listed packs are ticked for the drawing');
  await page.click('[data-regs-p-on="us-irc-2021"]');
  await page.waitForFunction(() => document.querySelector('[data-regs-p-state]')?.dataset.regsPState === 'drawing', null, { timeout: 10000 });
  ok(!(await page.isChecked('[data-regs-p-on="us-irc-2021"]')), 'unticking the IRC saves the drawing\'s own ticks');
  await page.click('[data-regs-p-pack="za-sans10400"] > .rg-row > .rg-twisty');
  const ruleBoxes = await page.$$eval('[data-regs-p-rules="za-sans10400"] [data-regs-p-rule]', (bs) => bs.map((b) => b.dataset.regsPRule));
  ok(ruleBoxes.length === 5, 'the pack opens to its five rules, each a checkbox');
  await page.click('[data-regs-p-rule="za-sans10400:room.vent.min"]');
  await page.waitForFunction(() => !document.querySelector('[data-regs-p-rule="za-sans10400:room.vent.min"]')?.checked);
  await shot(page, 'panel');
  const P = '[data-rpane="addon-regs-regs"] ';
  const pVisible = () => page.$$eval('[data-regs-panel] [data-regs-p-pack]', (ps) => ps.map((p) => p.dataset.regsPPack));
  await page.fill(P + '[data-regs-filter]', 'riser');
  await page.waitForFunction(() => /Showing/.test(document.querySelector('[data-rpane="addon-regs-regs"] [data-regs-filter-count]')?.textContent || ''));
  const pr = await page.$$eval('[data-regs-p-rules="us-irc-2021"]:not([hidden]) [data-regs-p-rule]', (bs) => bs.map((b) => b.dataset.regsPRule));
  ok((await pVisible()).sort().join() === 'us-irc-2021,za-sans10400' && pr.join() === 'us-irc-2021:stair.riser.max', 'the panel filters too: "riser" opens each pack at its riser rule', pr.join());
  await page.fill(P + '[data-regs-filter]', '');
  await page.click(P + '[data-regs-trade="frame"]');
  await page.waitForFunction(() => !document.querySelector('[data-regs-p-pack="za-sans10400"]'));
  ok((await pVisible()).join() === 'us-irc-2021' && /3 of 34|of \d+ rules/.test(await page.textContent('[data-regs-p-pack="us-irc-2021"] [data-regs-tag="shown"]')), 'Framing in the panel: only the IRC (South Africa has no framing rules), tagged with how many of its rules show');
  await shot(page, 'panel-filter');
  await page.click(P + '[data-regs-trade=""]');
  await page.waitForSelector('[data-regs-p-pack="za-sans10400"]');
  await page.evaluate(() => { const sec = document.querySelector('[data-msched-sec]'); const pane = sec && sec.closest('[data-rpane]'); if (pane) document.querySelector('[data-rtab="' + pane.dataset.rpane + '"]')?.click(); });
  await page.selectOption('[data-msched-kind]', 'regs');
  await page.waitForFunction(() => document.querySelectorAll('[data-msched] thead th').length === 6, null, { timeout: 10000 });
  const rowsD = await scheduleRows();
  ok(rowsD.length > 0 && rowsD.every((r) => ['Part C', 'Part O', 'Part M'].includes(r[2])) && !rowsD.some((r) => /Openable/.test(r[1])), 'the schedule follows the drawing: South Africa only, without the openable-area rule (' + rowsD.length + ' rows)');
  await page.click('[data-rtab="addon-regs-regs"]');
  await page.waitForSelector('[data-regs-p-defaults]');
  await page.click('[data-regs-p-defaults]');
  await page.waitForFunction(() => document.querySelector('[data-regs-p-state]')?.dataset.regsPState === 'defaults', null, { timeout: 10000 });
  ok(await page.isChecked('[data-regs-p-on="us-irc-2021"]'), 'Use my defaults: the drawing drops its own ticks');
  await openGlobal();
  await page.click('[data-regs-region="US"]');
  await page.waitForFunction(() => /Removed/.test(document.querySelector('[data-regs-regions-msg]')?.textContent || ''), null, { timeout: 10000 });
  ok(!(await page.isChecked('[data-regs-region="US"]')) && await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem('cc-regs:library')).regions).join()) === 'ZA', 'unticking a country removes it from this computer');
  await closeSettings();
  await page.evaluate(() => { try { localStorage.removeItem('cc-regs:library'); } catch (e) { /* none */ } });   // back to "no region picked" for the rest

  console.log('== switched off again');
  await setAddon(false);
  await page.keyboard.press('Escape');
  await planClick(3000, -2500);
  await page.waitForSelector('[data-mp-stchecks]', { timeout: 10000 });
  const lineOff = await page.textContent('[data-mp-stchecks]');
  ok(/labelled defaults/.test(lineOff) && !/International|South Africa/.test(lineOff), 'the stair is judged by the built-in limits again: ' + lineOff.slice(0, 120));
  ok(!(await page.$('[data-msched-kind] option[value="regs"]')), 'the schedule entry is gone');
  ok(!(await sectionTitles()).includes('Building regulations'), 'the Settings section is gone');

  console.log('== the add-on and the pack chosen survive a reload');
  await setAddon(true);
  await pickPack('za-sans10400');
  await page.reload({ waitUntil: 'networkidle' });
  const recover = await page.waitForSelector('dialog.bc-dialog[open] button[value="discard"], dialog[data-autosave-dialog][open] [data-autosave-discard-all]', { timeout: 5000 }).catch(() => null);   // the autosave asks about the house (BimCraft's dialog or the shell's "Recover your work?")
  if (recover) await recover.click();
  await page.waitForFunction(() => window.ccAddons?.list().find((x) => x.id === 'regs')?.state === 'active', null, { timeout: 15000 });
  await openSettings();
  await page.waitForSelector('[data-regs-on]', { state: 'attached' });
  ok(await page.isChecked('[data-regs-on="za-sans10400"]') && !(await page.isChecked('[data-regs-on="us-irc-2021"]')), 'still on, and South Africa still ticked (alone)');
  await closeSettings();
  await page.evaluate(() => { try { localStorage.removeItem('cc-addons:bimcraft'); ['pack', 'on', 'mode', 'own'].forEach((k) => localStorage.removeItem('cc-addon:bimcraft:regs:' + k)); localStorage.removeItem('cc-regs:library'); } catch (e) { /* none */ } });   // put the viewer back as it was
} catch (e) {
  fail++; console.log('  FAIL ' + (e && e.stack ? e.stack.split('\n').slice(0, 4).join(' / ') : e));
  await shot(page, 'failure').catch(() => {});
}
ok(problems.length === 0, 'no console errors', problems.slice(0, 3).join(' | '));
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
