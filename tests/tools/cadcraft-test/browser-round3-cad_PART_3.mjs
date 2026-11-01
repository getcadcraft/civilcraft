#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-round3-cad_PART_3.mjs — CadCraft round 3 on the real page, headless, in the lab: the shell's seven modules mounted (calc sheets, reasons,
 * lessons, Suggest, activity, Ask), calc sheets and reasons kept in the DWG and back, REDLINE (EG.19), TAGS (SU.915) and the History "List in words"
 * button's engine (EG.65) on the page's own doc.
 *   node tools/cadcraft-test/browser-round3-cad_PART_3.mjs
 * Run as root (test admin via tools/cadcraft-test/admin.php).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const adminCmd = (c) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, c, 'cwl'], { encoding: 'utf8' }) || '{}');
adminCmd('up');
const sess = adminCmd('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const problems = [];
await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
await page.addInitScript(() => { try { localStorage.setItem('cadcraft.assistants.cadcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit'] })); } catch (e) { /* none */ } });
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(100); };
const history = () => page.textContent('[data-history]');
try {
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => !!window.cadcraft, null, { timeout: 15000 }).catch((e) => { console.log('PROBLEMS', problems); throw e; });
  await page.evaluate(() => { window.cadcraft.doc.meta.units = 'millimeters'; });

  console.log('\n== the shell modules are mounted');
  const st = await page.evaluate(() => ({ calc: window.ccCalc?.state?.(), reasons: window.ccReasons?.state?.(), lessons: window.ccLessons?.state?.(), ask: window.ccAsk?.state?.(), suggest: !!window.ccSuggest, activity: !!window.ccActivity, totals: !!window.ccTotals }));
  ok(!!st.calc && st.calc.attached !== false, 'calc sheets attached', st.calc);
  ok(!!st.reasons && st.reasons.attached !== false, 'design reasons attached', st.reasons);
  ok(!!st.ask && st.ask.attached === true, 'the Ask box is attached', st.ask);
  ok(st.suggest && st.activity && st.totals, 'Suggest, activity and totals modules are loaded', st);
  const tools = await page.evaluate(() => window.cadcraft.control.list().map((x) => x.name));
  for (const n of ['calcs_list', 'calcs_set', 'reasons_list', 'lessons_status', 'ask_list', 'suggestions_list', 'redline_read', 'redline_apply']) ok(tools.includes(n), 'assistant tool ' + n + ' registered', tools.length);

  console.log('\n== a calc sheet is kept in the drawing, in the DWG, and comes back');
  const r1 = await page.evaluate(async () => {
    const c = window.cadcraft.control;
    const set = await c.call('calcs_set', { sheet: 'room', name: 'span', formula: '12 ft + 3 ft' }).catch((e) => ({ error: String(e) }));
    const set2 = set?.structuredContent?.isError ? await c.call('calcs_set', { sheet: 'room', name: 'span', expr: '12 ft + 3 ft' }).catch((e) => ({ error: String(e) })) : set;
    await new Promise((r) => setTimeout(r, 400));
    return { set: JSON.stringify(set2).slice(0, 200), has: !!window.cadcraft.doc.meta.calcs };
  });
  ok(r1.has, 'doc.meta.calcs holds the sheet', r1);
  const back = await page.evaluate(async () => {
    const d = window.cadcraft.doc;
    const { saveDwg } = await import('/assets/apps/cadcraft/dev/dwg-save.js');
    const { readDwg } = await import('/assets/apps/cadcraft/dev/dwg/read.js');
    const { importDwg } = await import('/assets/apps/cadcraft/dev/dwg-import.js');
    const bytes = saveDwg(d, { version: '2018' }).bytes;
    const imp = importDwg(readDwg(bytes), { versionTag: 'x' });
    const Doc = d.constructor; const n = new Doc(); n.load(imp);
    return { n: !!n.meta.calcs, same: JSON.stringify(n.meta.calcs) === JSON.stringify(d.meta.calcs) };
  });
  ok(back.n && back.same, 'the sheet is in the saved DWG and reads back the same', back);

  console.log('\n== TAGS on block references');
  const t1 = await page.evaluate(() => {
    const d = window.cadcraft.doc;
    d.change('b', () => {
      d.defineBlock({ name: 'DOOR_800', base: { x: 0, y: 0 }, entities: [{ type: 'line', layer: '0', x1: 0, y1: 0, x2: 800, y2: 0 }], attdefs: [{ tag: 'MARK', prompt: '', def: 'D', x: 0, y: 0, h: 50, rot: 0, ha: 'left', va: 'baseline', wf: 1 }] });
      d.add({ type: 'insert', block: 'DOOR_800', x: 0, y: 0, sx: 1, sy: 1, rot: 0, layer: '0', attrs: { MARK: 'D1' } });
      d.add({ type: 'insert', block: 'DOOR_800', x: 2000, y: 0, sx: 1, sy: 1, rot: 0, layer: '0', attrs: { MARK: 'D2' } });
    });
    return d.all().filter((e) => e.type === 'insert').map((e) => e.id);
  });
  await page.evaluate((ids) => window.cadcraft.host.setSelection(new Set(ids)), t1);
  const u0 = await page.evaluate(() => window.cadcraft.doc.undoStack.length);
  await typeCmd('TAGS'); await typeCmd('D'); await typeCmd('FireRating'); await typeCmd('text'); await typeCmd('30 min;60 min'); await typeCmd('DOOR*');
  await typeCmd('S'); await typeCmd('FireRating=60 min'); await typeCmd('');
  const t2 = await page.evaluate(() => ({ defs: window.cadcraft.doc.meta.tagDefs?.length, a: window.cadcraft.doc.all().filter((e) => e.type === 'insert').map((e) => e.attrs?.FIRERATING), steps: window.cadcraft.doc.undoStack.length }));
  ok(t2.defs === 1 && t2.a.every((v) => v === '60 min'), 'TAGS: defined, and set on both selected doors', t2);
  ok(t2.steps === u0 + 2, 'TAGS: the definition and the values are one undo step each', [u0, t2.steps]);
  ok(/2 block references tagged/.test(await history()), 'TAGS prints what it did');

  console.log('\n== REDLINE: the commands run on a package set by the page');
  const rl = await page.evaluate(async () => {
    const { readRedline, Review, applyRevision, frameOf } = await import('/assets/apps/cadcraft/dev/redline.js');
    const r = readRedline({ format: 'cc-redline', v: 1, project: 'P', revision: 'B', by: 'Ana', sheets: [], items: [{ id: 'a1', sheet: 'A', kind: 'revise', frac: { box: [0.1, 0.1, 0.3, 0.3] }, comment: 'Move it' }] });
    const rv = new Review(r.pkg); rv.accept('a1', 'done');
    const d = window.cadcraft.doc, before = d.count();
    const u = d.undoStack.length;
    const out = applyRevision(d, rv, { frame: frameOf(d) });
    return { clouds: out.clouds, added: d.count() - before, steps: d.undoStack.length - u };
  });
  ok(rl.clouds === 1 && rl.added > 5 && rl.steps === 1, 'a cloud and the revision log in one undo step on the real doc', rl);
  await page.evaluate(() => window.cadcraft.doc.undo());

  console.log('\n== the History panel\'s "List in words" has its engine');
  const ch = await page.evaluate(async () => {
    const { compareDrawings } = await import('/assets/apps/cadcraft/dev/drawing-compare.js');
    const { describeChanges } = await import('/assets/apps/cadcraft/dev/changes.js');
    const Doc = window.cadcraft.doc.constructor;
    const a = new Doc(), b = new Doc();
    b.change('x', () => b.add({ type: 'line', layer: 'A', x1: 0, y1: 0, x2: 1000, y2: 0 }));
    return describeChanges(compareDrawings(a, b), { mPerUnit: 0.001 }).lines;
  });
  ok(ch.length >= 2 && /1 added/.test(ch[0]), 'a one-line change is said in words', ch);

  console.log('\n== the Ask box: a question waits, the connected assistant answers it, the box shows the answer');
  const asked = await page.evaluate(async () => {
    const c = window.cadcraft.control;
    await c.configure({ enabled: true, groups: ['read', 'edit'] });
    await c.handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'Test AI', version: '1' } } }, 'ask-test');
    const q = await window.ccAsk.ask('How many objects are in this drawing?', { route: 'queue' }).catch((e) => ({ error: String(e) }));
    const list = await c.call('ask_list', {});
    const id = list.structuredContent?.questions?.[0]?.id ?? list.structuredContent?.items?.[0]?.id ?? q?.id;
    const r = await c.call('ask_reply', { id, text: 'There are ' + window.cadcraft.doc.count() + ' objects.', done: true });
    return { q: JSON.stringify(q).slice(0, 120), id, isError: !!r.structuredContent?.isError };
  });
  ok(!asked.isError && !!asked.id, 'the Ask box takes a question and an assistant answers it (ask_list → ask_reply)', asked);

  console.log('\n== LESSONS: the first lesson is registered');
  const les = await page.evaluate(() => JSON.stringify(window.ccLessons.state()));
  ok(/first-drawing/.test(les), 'the first lesson is listed', les.slice(0, 200));
  ok(problems.length === 0, 'no console errors', problems);
} finally { await browser.close(); }
console.log('\n' + pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
