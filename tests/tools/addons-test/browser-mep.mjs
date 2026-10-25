#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-mep.mjs — the HVAC and Piping add-ons in /lab/cadcraft, and their schedules opened in /lab/takeoffcraft (0.5 MQ.1,
 * MQ.2, MQ.5; session cad-mep). Run as root: a signed-in session is minted in-process by tools/addons-test/admin.php (the
 * shared admin-login throttle is never touched) and root's Playwright Chromium is used.
 *
 *   node tools/addons-test/browser-mep.mjs [--only hvac|piping] [--shots dir]     (shots default: tmp/shots/mep)
 *
 * Each add-on: bundled and off, switched on; its panel and settings; runs drawn by typing (a branch); the schedule table; the
 * 3D tab shows the solids; Ctrl+S → DWG → reopened with the add-on off (plain block references that draw) → on (runs back);
 * EXPORT → "… for TakeoffCraft" downloads a PDF that TakeoffCraft opens with its takeoff (items, lengths, counts); no
 * console errors.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const ONLY = opt('--only', null);
const SHOTS = opt('--shots', path.join(ROOT, 'tmp/shots/mep'));
fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', 'tools/addons-test/admin.php', cmd], { cwd: ROOT }).toString());

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const SESSION = admin('session');
const [cname, cvalue] = SESSION.cookie.split('=');
await ctx.addCookies([{ name: cname, value: cvalue, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const typeCmd = async (s, wait = 120) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(wait); };
const typeAll = async (...lines) => { for (const l of lines) await typeCmd(l); };
const shot = async (name) => { await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
const history = () => page.$$eval('.cc-history li', (ls) => ls.map((l) => l.textContent));
const kindsOf = (kind) => page.evaluate((k) => window.cadcraft.doc.all().filter((e) => window.ccAddons.kinds.info(e)?.kind === k).map((e) => ({ id: e.id, data: window.ccAddons.kinds.info(e).data })), kind);

async function openLab(id) {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host && !!window.ccAddons);
  await page.waitForFunction((x) => window.ccAddons.list().some((a) => a.id === x && a.state !== 'loading'), id, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(300);
}
async function fresh(id) {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'domcontentloaded' });
  await page.evaluate((x) => { for (const k of Object.keys(localStorage)) if (k.startsWith('cc-addon:cadcraft:' + x + ':')) localStorage.removeItem(k); const k = 'cc-addons:cadcraft'; const s = JSON.parse(localStorage.getItem(k) || '{}'); if (s.on) delete s.on[x]; if (s.off) delete s.off[x]; localStorage.setItem(k, JSON.stringify(s)); }, id);
  await openLab(id);
}
async function switchOn(id, name) {
  let me = await page.evaluate((x) => window.ccAddons.list().find((a) => a.id === x), id);
  ok(me && me.state === 'off' && me.source === 'bundled', name + ' is bundled and starts off', JSON.stringify(me && { state: me.state, source: me.source, reason: me.reason, detail: me.detail }));
  await page.evaluate((x) => window.ccAddons.loader.setEnabled(x, true), id);
  await page.waitForTimeout(400);
  me = await page.evaluate((x) => window.ccAddons.list().find((a) => a.id === x), id);
  ok(me?.state === 'active', name + ' switched on: active', JSON.stringify(me && [me.state, me.detail]));
}
/** Save (Ctrl+S → DWG), switch the add-on off, open the file again, check, switch on, check. */
async function reopen(id, kind, cmd, n) {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.keyboard.press('Control+s')]);
  const saved = path.join(SHOTS, id + '-' + dl.suggestedFilename());
  await dl.saveAs(saved);
  ok(/\.dwg$/.test(saved) && fs.statSync(saved).size > 1000, 'Ctrl+S saves a DWG', path.basename(saved));
  await page.evaluate((x) => window.ccAddons.loader.setEnabled(x, false), id);
  await page.waitForTimeout(300);
  await typeCmd(cmd); await page.waitForTimeout(150);
  ok((await history()).some((l) => /Unknown command/i.test(l)), 'off: ' + cmd + ' is not a command');
  await page.keyboard.press('Escape');
  await page.setInputFiles('[data-file]', saved);
  await page.waitForFunction((f) => window.cadcraft.doc.meta.source === f && window.cadcraft.doc.model.size > 0, path.basename(saved), { timeout: 60000 });
  const app = 'CC_' + id.toUpperCase();
  const plain = await page.evaluate((a) => { const d = window.cadcraft.doc; const ins = d.all().filter((e) => e.type === 'insert' && e.xd && e.xd[a]); return { n: ins.length, drawn: ins.every((e) => (d.blocks.get(e.block)?.entities.length || 0) > 0), known: ins.some((e) => !!window.ccAddons.kinds.info(e)), solids: [...d.model3d.root.insts.values()].length }; }, app);
  ok(plain.n >= n && plain.drawn && !plain.known && plain.solids >= n, 'opened without the add-on: plain block references that draw, data kept; the solids are on the 3D tab', JSON.stringify(plain));
  await page.evaluate(() => window.cadcraft.host.zoomExtents());
  await page.waitForTimeout(300);
  await shot(id + '-05-reopened-without');
  await page.evaluate((x) => window.ccAddons.loader.setEnabled(x, true), id);
  await page.waitForTimeout(500);
  const back = await kindsOf(kind);
  ok(back.length >= n, 'switched on: they are ' + kind + ' runs again', String(back.length));
}
/** EXPORT → the "for TakeoffCraft" PDF → /lab/takeoffcraft opens it with its takeoff. want = { [item name]: qty }. */
async function toTakeoff(id, label, want) {
  const ex = await page.evaluate((x) => window.ccAddons.exporters().filter((e) => e.addon === x).map((e) => e.label), id);
  const i = ex.findIndex((l) => l === label);
  ok(i >= 0, 'EXPORT lists "' + label + '"', ex.join(' | '));
  const all = await page.evaluate(() => window.ccAddons.exporters().map((e) => e.label));
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), typeAll('EXPORT', String(all.indexOf(label) + 1))]);
  const pdf = path.join(SHOTS, id + '-takeoff.pdf');
  await dl.saveAs(pdf);
  ok(fs.statSync(pdf).size > 1000 && /\.pdf$/.test(dl.suggestedFilename()), 'downloaded ' + dl.suggestedFilename());
  const tp = await ctx.newPage();
  tp.on('console', (m) => { if (m.type() === 'error') problems.push('takeoffcraft console: ' + m.text()); });
  tp.on('pageerror', (e) => problems.push('takeoffcraft pageerror: ' + e.message));
  await tp.goto(BASE + '/lab/takeoffcraft?space=paper');
  await tp.waitForFunction(() => window.takeoffcraft?.ready === true && !!window.takeoffcraft.recovery, null, { timeout: 30000 });
  if ((await tp.evaluate(() => window.takeoffcraft.recovery)) === 'asking') { await tp.click('[data-autosave-discard-all]'); await tp.waitForFunction(() => !document.querySelector('[data-autosave-dialog]')); }
  await tp.setInputFiles('[data-file-pdf]', pdf);
  await tp.waitForSelector('dialog[open] [data-key="ok"]', { timeout: 30000 });
  ok(/takeoff/i.test(await tp.textContent('dialog[open]')), 'TakeoffCraft: "this PDF carries a takeoff"', (await tp.textContent('dialog[open]')).slice(0, 160));
  await tp.click('dialog[open] [data-key="ok"]');
  await tp.waitForTimeout(500);
  const q = await tp.evaluate(() => window.takeoffcraft.quantities());
  for (const [name, qty] of Object.entries(want)) {
    const r = q.find((x) => x.name === name);
    ok(r && Math.abs(r.qty - qty) <= 1e-6 * Math.max(1, qty), 'TakeoffCraft: ' + name + ' = ' + (r ? r.qty.toFixed(4) : '—') + ' (the schedule: ' + qty.toFixed(4) + ')');
  }
  const sc = await tp.evaluate(() => window.takeoffcraft.model.scaleOf(window.takeoffcraft.sheets()[0].key));
  ok(sc && sc.ftPerUnit > 0, 'the sheet has its scale: ' + (sc?.label || ''));
  await tp.screenshot({ path: path.join(SHOTS, id + '-06-takeoffcraft.png') });
  await tp.evaluate(() => window.takeoffcraft.model.markSaved?.());
  await tp.close();
}

try {
  // ============================================================================================ HVAC
  if (!ONLY || ONLY === 'hvac') {
    console.log('\n== HVAC');
    await fresh('hvac');
    await switchOn('hvac', 'HVAC');
    const ui = await page.evaluate(() => ({ panel: document.querySelectorAll('[data-addon-section="hvac:hvac"] [data-hv-cmd]').length }));
    ok(ui.panel === 5, 'the HVAC section of the right panel has its five actions', JSON.stringify(ui));
    await page.evaluate(() => { window.cadcraft.doc.meta.units = 'inches'; });
    await typeAll('DUCT', 'Z', '24x12', 'T', 'S-1', '0,0', '240,0', '240,240', '');
    await typeAll('DUCT', 'S', 'O', 'Z', '8', '120,5', '120,120', '');
    let runs = await kindsOf('duct');
    ok(runs.length === 2 && runs.some((r) => r.data.links.taps.length === 1) && runs.some((r) => r.data.links.s?.kind === 'takeoff'), 'a main and a round branch off it, connected', JSON.stringify(runs.map((r) => r.data.links)));
    await typeAll('DUCTSCHED', '0,-60');
    const tables = await kindsOf('table');
    ok(tables.length === 1 && tables[0].data.rows.length >= 5, 'DUCTSCHED places the schedule table', JSON.stringify(tables[0]?.data.rows));
    await page.evaluate(() => window.cadcraft.host.zoomExtents());
    await page.waitForTimeout(400);
    await shot('hvac-01-plan');
    // the 3D tab
    await page.click('[data-tabs] [role="tab"]:has-text("3D")');
    await page.waitForFunction(() => window.cadcraft.host.ws3d?.active === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    const s3 = await page.evaluate(() => [...window.cadcraft.doc.model3d.root.insts.values()].filter((i) => / \[hvac:/.test(i.name || '')).length);
    ok(s3 === 2, 'the 3D tab: two duct solids', String(s3));
    await shot('hvac-02-3d');
    await page.click('[data-tabs] [role="tab"]:has-text("Model")');
    await page.waitForTimeout(400);
    // the schedule the takeoff must match
    const sched = await page.evaluate(async () => {
      const m = await import('/assets/apps/cadcraft/dev/addons/hvac/lib/duct.js');
      const runs = window.cadcraft.doc.all().filter((e) => window.ccAddons.kinds.info(e)?.kind === 'duct').map((e) => m.cleanDuct(window.ccAddons.kinds.info(e).data));
      const S = m.schedule(runs);
      return Object.fromEntries([...S.ducts.map((r) => [r.name, r.len]), ...S.fittings.map((f) => [f.name, f.n])]);
    });
    await toTakeoff('hvac', 'Ducts for TakeoffCraft (PDF with the takeoff inside)', sched);
    await reopen('hvac', 'duct', 'DUCT', 2);
  }

  // ============================================================================================ Piping
  if (!ONLY || ONLY === 'piping') {
    console.log('\n== Piping');
    await fresh('piping');
    await switchOn('piping', 'Piping');
    const left = await page.evaluate(() => window.cadcraft.doc.model.size);
    ok(left === 0, 'a fresh drawing', String(left));
    const ui = await page.evaluate(() => ({ panel: document.querySelectorAll('[data-addon-section="piping:piping"] [data-pp-cmd]').length }));
    ok(ui.panel === 5, 'the Piping section of the right panel has its five actions', JSON.stringify(ui));
    await page.evaluate(() => { window.cadcraft.doc.meta.units = 'inches'; });
    await typeAll('PIPE', 'M', '1', 'C', '1', 'Z', '2', 'D', '2', 'T', 'CW-1', '0,0', '120,0', '120,120', '');
    await typeAll('PIPE', 'Z', '1', '60,0.5', '60,60', '');
    await typeAll('VALVE', '30,0.2', 'K', '2', '90,-0.3', '');
    await typeAll('PIPE', 'M', '3', 'Y', '4', 'Z', '4', 'D', '1', '0,-100', '480,-100', '');
    await typeAll('PIDSYM', 'S', '16', '200,200', 'PI 101', '');
    const runs = await kindsOf('pipe');
    ok(runs.length === 3 && runs.some((r) => r.data.links.s?.kind === 'tee') && runs.some((r) => r.data.valves.length === 2) && runs.some((r) => Math.abs(r.data.slope - 0.125 / 12) < 1e-12), 'a double-line main with two valves, a 1" branch on a tee, a drain at 1/8 in/ft', JSON.stringify(runs.map((r) => [r.data.lines, r.data.links.s?.kind, r.data.valves.length, r.data.slope])));
    ok((await kindsOf('symbol')).length === 1, 'an instrument balloon placed');
    await typeAll('PIPESCHED', '0,-200');
    ok((await kindsOf('table')).some((x) => x.data.rows.some((r) => /^Reducing tee 2" × 1"/.test(r[0]))), 'PIPESCHED places the schedule (the reducing tee in it)');
    await page.evaluate(() => window.cadcraft.host.zoomExtents());
    await page.waitForTimeout(400);
    await shot('piping-01-plan');
    await page.click('[data-tabs] [role="tab"]:has-text("3D")');
    await page.waitForFunction(() => window.cadcraft.host.ws3d?.active === true, null, { timeout: 20000 });
    await page.waitForTimeout(800);
    const s3 = await page.evaluate(() => [...window.cadcraft.doc.model3d.root.insts.values()].filter((i) => / \[piping:/.test(i.name || '')).length);
    ok(s3 === 3, 'the 3D tab: three pipe solids', String(s3));
    await shot('piping-02-3d');
    await page.click('[data-tabs] [role="tab"]:has-text("Model")');
    await page.waitForTimeout(400);
    const sched = await page.evaluate(async () => {
      const m = await import('/assets/apps/cadcraft/dev/addons/piping/lib/pipe.js');
      const runs = window.cadcraft.doc.all().filter((e) => window.ccAddons.kinds.info(e)?.kind === 'pipe').map((e) => m.cleanPipe(window.ccAddons.kinds.info(e).data));
      const S = m.schedule(runs);
      return Object.fromEntries([...S.pipes.map((r) => [r.name, r.len]), ...S.fittings.map((f) => [f.name, f.n])]);
    });
    await toTakeoff('piping', 'Pipes for TakeoffCraft (PDF with the takeoff inside)', sched);
    await reopen('piping', 'pipe', 'PIPE', 3);
  }
  ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
} catch (err) {
  fail++;
  console.log('  FAIL stopped: ' + (err?.stack || err));
  await shot('99-error').catch(() => {});
} finally {
  await browser.close();
  try { admin('down'); } catch { /* reported by the run */ }
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
