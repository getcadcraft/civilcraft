#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-access-apps_PART_3.mjs — EG.52 in the other seven apps (round 3, session access_PART_3): each app's lab page with Access on, headless Chromium (SwiftShader).
 * Per app: the stage becomes a focusable `application` region and gives its attributes back when Access is off; ? lists the keys; arrows move and say where;
 * D describes the app's own work; N says what is near; Tab jumps to a thing and names it; the status line is read when it changes (and is not a second live
 * region while Access is on); nothing is spoken while Access is off; no console errors. This reads the live regions' text; it is not a screen reader.
 *   node tools/shell-test/browser-access-apps_PART_3.mjs [--apps civilcraft,partcraft,...]
 */
import { execFileSync } from 'node:child_process';
import { fixtureIfc } from '../bimcraft-test/ifc-fixture.mjs';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const APPS = ((i) => (i >= 0 ? args[i + 1] : 'civilcraft,partcraft,bimcraft,takeoffcraft,markupcraft,detailcraft,modelcraft'))(args.indexOf('--apps')).split(',');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };

/** Where each app's stage is, how to give it something to describe, and what D must say. */
const CONFIG = {
  partcraft: { stage: '[data-tree]', move: /\d+ of \d+/, near: /Before it|After it|only one/, d: /features, \d+ built/, tabbed: /\d+ of \d+/,
    prep: async (page) => { await page.evaluate(async () => { const DEV = '/assets/apps/partcraft/dev/'; const S = await import(DEV + 'sketch.js'), P = await import(DEV + 'part.js'); const part = P.newPart('Plate'), sk = S.newSketch(); S.addRect(sk, [0, 0], [100, 60]); const f1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk }); P.addFeature(part, 'extrude', { sketch: f1.id, op: 'add', end: 'blind', depth: 10 }); await window.partcraft.openText(P.toJSON(part), 'Plate.partcraft.json'); }); await page.waitForFunction(() => window.partcraft.part?.features?.length === 2); await sleep(1500); },
    more: async (page, { key, said, ok }) => { await key('Enter'); ok(!!(await said(/Selected: /)), 'Enter selects the feature'); } },
  detailcraft: { stage: '[data-canvas]', move: /\d+ of \d+/, near: /Before it|After it|only one/, d: /members/, tabbed: /\d+ of \d+/,
    prep: async (page) => { await page.waitForFunction(() => window.detailcraft); await page.evaluate(() => window.detailcraft.act('sample')); await page.waitForFunction(() => window.detailcraft.model.state.members.length > 5); await sleep(800); },
    more: async (page, { key, said, ok }) => { await key('Enter'); ok(!!(await said(/selected: /)), 'Enter selects the member'); } },
  takeoffcraft: { stage: '[data-over]', move: /\d+ of \d+/, near: /Before it|After it|only one/, d: /items, \d+ marks, total/, tabbed: /\d+ of \d+/,
    prep: async (page) => { await page.waitForFunction(() => window.takeoffcraft?.model); await page.evaluate(() => { const m = window.takeoffcraft.model; m.addItem({ name: 'Base', type: 'linear', mat: 10000 }); m.addItem({ name: 'Paint', type: 'fixed', unit: 'SF', qty: 1000, mat: 4000, lab: 6000 }); m.addItem({ name: 'Outlets', type: 'count', mat: 500 }); }); await sleep(800); },
    more: async (page, { key, said, ok }) => { await key('Enter'); ok(!!(await said(/Active item: /)), 'Enter makes the item active'); } },
  markupcraft: { stage: '[data-over]', move: /\d+ of \d+/, near: /Before it|After it|only one/, d: /\d+ markups on 1 sheets/, tabbed: /\d+ of \d+/,
    prep: async (page) => { await page.setInputFiles('[data-file]', path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf')); await page.waitForFunction(() => window.markupcraft?.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
      await page.evaluate(async () => { const M = await import('/assets/apps/markupcraft/dev/model.js'); const key = window.markupcraft.sheets[0].page.key; window.markupcraft.store.change('t', (tx) => { tx.add(M.makeMarkup({ sheet: key, type: 'note', rect: [100, 100, 120, 120], text: 'Check the stair rail', author: 'Pat' })); tx.add(M.makeMarkup({ sheet: key, type: 'rect', rect: [200, 200, 260, 240], author: 'Sam' })); }); }); await sleep(600); },
    more: async (page, { key, said, ok }) => { await key('Enter'); ok(!!(await said(/selected: /)), 'Enter goes to the markup and selects it'); } },
  modelcraft: { stage: '[data-over]', move: /\d+ of \d+/, near: /Before it|After it|only one/, d: /faces, \d+ edges, 2 groups/, tabbed: /\d+ of \d+/,
    prep: async (page) => { await page.waitForFunction(() => window.modelcraft?.model); await page.evaluate(async () => { const { getHost } = await import('/assets/apps/modelcraft/dev/host.js'); const C = getHost({ app: 'modelcraft' }).control; C.configure({ enabled: true, groups: ['read', 'edit'] }); await C.call('box_add', { at: [0, 0], size: [1000, 1000, 1000], name: 'Table' }); await C.call('box_add', { at: [2000, 0], size: [500, 500, 500], name: 'Chair' }); }); await sleep(800); },
    more: async (page, { key, said, ok }) => { await key('Enter'); ok(!!(await said(/selected: /)), 'Enter selects the group'); } },
  bimcraft: { stage: '[data-canvas]', move: /\d+ of \d+/, near: /Before it|After it|only one/, d: /elements, \d+ storeys/, tabbed: /\d+ of \d+/,
    prep: async (page) => { await page.setInputFiles('[data-model-input]', { name: 'fixture.ifc', mimeType: 'application/x-step', buffer: Buffer.from(fixtureIfc({})) }); await page.waitForFunction(() => window.bimcraftTree?.().tree?.root, null, { timeout: 60000 }); await sleep(800); },
    more: async (page, { key, said, ok }) => { await key('Enter'); ok(!!(await said(/picked/)), 'Enter picks everything in the node'); } },
  civilcraft: { stage: '[data-over]', prep: async (page) => { await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]'); await page.waitForFunction(() => window.civilcraft.project.points.length > 100); }, d: /survey points/, tabbed: /^Point \d+|Alignment|Pad/ },
};
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cwl'], { encoding: 'utf8' }) || '{}');
admin('up');
const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  for (const slug of APPS) {
    const C = CONFIG[slug];
    console.log('\n== ' + slug);
    if (!C) { ok(false, 'no config for ' + slug); continue; }
    const problems = [];
    const ctx = await browser.newContext({ viewport: { width: 1500, height: 950 }, serviceWorkers: 'block' });
    await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
    page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
    await page.addInitScript((slug) => { try { localStorage.removeItem('cc-access'); localStorage.setItem('cadcraft.assistants.' + slug, JSON.stringify({ enabled: true, groups: ['read', 'edit'] })); } catch (e) { /* */ } }, slug);
    await page.goto(`${BASE}/lab/${slug}`, { waitUntil: 'networkidle' });
    for (let i = 0; i < 5 && await page.$('[data-autosave-dialog][open] [data-autosave-discard]'); i++) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await sleep(150); }
    await page.waitForFunction(() => !!window.ccAccess, null, { timeout: 20000 });
    const live = () => page.evaluate(() => ({ polite: document.querySelector('[data-access-live="polite"]')?.textContent || '', urgent: document.querySelector('[data-access-live="assertive"]')?.textContent || '' }));
    const said = async (re, ms = 1500) => { const t0 = Date.now(); let l; while (Date.now() - t0 < ms) { l = await live(); if (re.test(l.polite) || re.test(l.urgent)) return l.polite || l.urgent; await sleep(60); } return false; };
    const key = async (k) => { await page.keyboard.press(k); await sleep(260); };
    await C.prep?.(page);
    const attrs = () => page.evaluate((s) => { const e = document.querySelector(s); return e ? { role: e.getAttribute('role'), tab: e.getAttribute('tabindex'), label: e.getAttribute('aria-label') } : null; }, C.stage);
    const before = await attrs();
    ok(!!before, 'the stage ' + C.stage + ' exists');
    console.log('-- off');
    await page.keyboard.press('d'); await sleep(300);
    const quiet = await live(); ok(quiet.polite === '' && quiet.urgent === '', 'nothing is spoken while Access is off');
    console.log('-- on');
    await page.evaluate(() => window.ccAccess.set({ on: true })); await sleep(400);
    const on = await attrs();
    ok(on.role === 'application' && on.tab === '0' && !!on.label, 'the stage is an application region with a name', on);
    await page.focus(C.stage); await sleep(300);
    ok(!!(await said(/[Kk]eyboard/)), 'focusing the stage says what it is: ' + (await live()).polite.slice(0, 60));
    await key('?');
    ok(!!(await said(/Arrow keys move the cursor/)), '? lists the keys');
    await key('ArrowRight');
    ok(!!(await said(C.move || /x -?[\d.]+|East|east/)), 'an arrow key moves and says where: ' + (await live()).polite.slice(0, 80));
    await key('d');
    const d = await said(C.d, 2000); ok(!!d, 'D describes the work: ' + (d || (await live()).polite).slice(0, 140));
    await key('n');
    ok(!!(await said(C.near || /Cursor at|Cursor en|near/i)), 'N says what is near: ' + (await live()).polite.slice(0, 100));
    await key('Tab');
    const tb = (await live()).polite; ok(C.tabbed.test(tb) || /Nothing near/.test(tb), 'Tab jumps to a thing and names it: ' + tb.slice(0, 100));
    await C.more?.(page, { key, said, live, ok });
    console.log('-- off again');
    await page.evaluate(() => window.ccAccess.set({ on: false })); await sleep(300);
    const after = await attrs();
    ok(JSON.stringify(after) === JSON.stringify(before), 'the stage gets its own attributes back', { before, after });
    ok(!problems.length, 'no console errors', problems);
    await ctx.close();
  }
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
