#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-mount.mjs — 0.8 round 3 (markup_PART_3): what MarkupCraft mounted, in headless Chromium at https://getcadcraft.com/lab/markupcraft.
 *   - the shell's seven modules (calc sheets, reasons, lessons, Suggest, activity, Ask box) and that the sheets travel in the PDF (/MarkupCraftShell)
 *   - Problems markers on the page (an overdue task shows a ⚠ on its markup; a page that could not be drawn at the page's corner)
 *   - the live adapter's where(ops) (EG.41) and SU.910's overlay + reviewers strip, with a stand-in for the session client
 *   node tools/markupcraft-test/browser-mount.mjs [--out <dir>]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const OUT = (() => { const i = process.argv.indexOf('--out'); return i > 0 ? process.argv[i + 1] : path.join(REPO, 'tmp/shots/markupcraft-mount'); })();
fs.mkdirSync(OUT, { recursive: true });
const PLAN = path.join(REPO, 'fixtures/pdf/kitchen-plan-sheet.pdf');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
const { chromium } = await import('playwright-core');
const PDFLib = await import(path.join(REPO, 'public_html/assets/vendor/pdf-lib/current/pdf-lib.esm.js'));
const { cookie } = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), 'session'], { encoding: 'utf8' }).trim().split('\n').pop());
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
try {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
  await ctx.addCookies([{ name: cookie.split('=')[0], value: cookie.split('=')[1], domain: 'getcadcraft.com', path: '/', httpOnly: true, secure: true, sameSite: 'Lax' }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('markupcraft.author', JSON.stringify('Mount Tester')); localStorage.setItem('cadcraft.assistants.markupcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit'] })); } catch { /* */ } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  const orphans = await page.waitForFunction(() => window.markupcraft?.orphans !== undefined && { n: window.markupcraft.orphans }, null, { timeout: 15000 }).then(async (h) => (await h.jsonValue()).n, () => 0);
  if (orphans) await page.click('[data-autosave-discard-all]').catch(() => {});
  await page.setInputFiles('[data-file]', PLAN);
  await page.waitForFunction(() => window.markupcraft?.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });

  console.log('\n== The shell kit');
  const st = await page.evaluate(() => ({ calc: !!window.ccCalc, reasons: !!window.ccReasons, lessons: !!window.ccLessons, suggest: !!window.ccSuggest, activity: !!window.ccActivity, ask: window.ccAsk?.state?.() }));
  ok(st.calc && st.reasons && st.lessons && st.suggest && st.activity, 'calc, reasons, lessons, Suggest and activity are loaded', st);
  ok(st.ask?.attached === true, 'the Ask box is attached', st.ask);
  const tools = await page.evaluate(() => window.markupcraft.control.list().map((x) => x.name));
  for (const n of ['calcs_list', 'reasons_list', 'lessons_status', 'ask_list', 'suggestions_list', 'problems_list']) ok(tools.includes(n), 'assistant tool ' + n, tools.length);
  ok(await page.locator('.app-bar-lessons').isVisible() || await page.locator('[data-tool-more="lessons"]').count() > 0, 'the Lessons button is offered');

  console.log('\n== The Ask box');
  const asked = await page.evaluate(async () => {
    const C = window.markupcraft.control;
    await C.handle({ jsonrpc: '2.0', id: 1, method: 'initialize', params: { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'Test AI', version: '1' } } }, 'ask-test');
    const q = await window.ccAsk.ask('How many markups are on this sheet?', { route: 'queue' }).catch((e) => ({ error: String(e) }));
    const list = await C.call('ask_list', {}); const id = list.structuredContent?.questions?.[0]?.id ?? list.structuredContent?.items?.[0]?.id ?? q?.id;
    const r = await C.call('ask_reply', { id, text: 'There are ' + window.markupcraft.store.all().length + ' markups.', done: true });
    return { id, isError: !!r.structuredContent?.isError, state: window.ccAsk.state() };
  });
  ok(!asked.isError && !!asked.id, 'a question waits in the queue and an assistant answers it (ask_list, ask_reply)', asked);

  console.log('\n== Calc sheets and reasons travel in the PDF');
  const id = await page.evaluate(() => { const m = window.markupcraft; let made; m.store.change('t', (tx) => { made = tx.add({ sheet: m.sheets[0].page.key, type: 'cloudrect', rect: [300, 300, 560, 440], text: 'Redraw the hood wall', author: 'Ana' }); }); return made.id; });
  const set = await page.evaluate(async (mid) => {
    const C = window.markupcraft.control;
    const a = await C.call('calcs_set', { sheet: 'hood', name: 'width', expr: '2 ft + 3 ft' }).catch((e) => ({ error: String(e) }));
    window.markupcraft.sel.clear(); window.markupcraft.sel.add(mid);
    return { a: a.structuredContent?.isError ?? false };
  }, id);
  ok(set.a === false, 'a calc sheet is written through the assistants tool', set);
  await page.waitForTimeout(400);
  ok(await page.evaluate(() => window.markupcraft.files.some((f) => [...window.markupcraft.store.dirtySheets].some((k) => k.startsWith(f.id + ':')))), 'the calc change marks the file as unsaved');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.keyboard.press('Control+s')]);
  const saved = path.join(OUT, 'saved.pdf'); await dl.saveAs(saved);
  const doc = await PDFLib.PDFDocument.load(fs.readFileSync(saved));
  const info = doc.getInfoDict();
  const raw = info.get(PDFLib.PDFName.of('MarkupCraftShell'));
  const shell = raw ? JSON.parse(raw.decodeText()) : null;
  ok(!!shell?.calcs && JSON.stringify(shell.calcs).includes('width'), 'the saved PDF carries /MarkupCraftShell with the sheet', shell && Object.keys(shell));
  const page2 = await ctx.newPage();
  page2.on('pageerror', (e) => problems.push('pageerror2: ' + e.message));
  await page2.goto(BASE + '/lab/markupcraft?space=paper', { waitUntil: 'networkidle' });
  const o2 = await page2.waitForFunction(() => window.markupcraft?.orphans !== undefined && { n: window.markupcraft.orphans }, null, { timeout: 15000 }).then(async (h) => (await h.jsonValue()).n, () => 0);
  if (o2) await page2.click('[data-autosave-discard-all]').catch(() => {});
  await page2.setInputFiles('[data-file]', saved);
  await page2.waitForFunction(() => window.markupcraft?.sheets.length === 1 && window.markupcraft.view.page, null, { timeout: 30000 });
  await page2.waitForTimeout(800);
  const back = await page2.evaluate(() => JSON.stringify(window.ccCalc.save?.() ?? null));
  ok(back.includes('width'), 'reopened, the calc sheet is back', back.slice(0, 120));
  await page2.close();

  console.log('\n== Clean up pen strokes (EG.55)');
  const pen = await page.evaluate(() => { const m = window.markupcraft; const pts = [...Array(40)].map((_, i) => [700 + 80 * Math.cos(i / 40 * 6.4), 700 + 80 * Math.sin(i / 40 * 6.4)]); let made; m.store.change('pen', (tx) => { made = tx.add({ sheet: m.sheets[0].page.key, type: 'pen', pts, author: 'Ana' }); }); m.sel.clear(); m.sel.add(made.id); return made.id; });
  await page.evaluate(() => document.querySelector('[data-edit-menu] [data-act="clean-pen"]').click());
  await page.waitForTimeout(300);
  const cleaned = await page.evaluate((id) => ({ gone: !window.markupcraft.store.get(id), ell: window.markupcraft.store.all().filter((m) => m.type === 'ellipse').length, pens: window.markupcraft.store.all().filter((m) => m.type === 'pen').length }), pen);
  ok(cleaned.gone && cleaned.ell === 1 && cleaned.pens === 0, 'the freehand circle became an ellipse', cleaned);
  await page.evaluate(() => window.markupcraft.store.undo());
  ok(await page.evaluate((id) => !!window.markupcraft.store.get(id), pen), 'one undo step puts the freehand back');
  await page.evaluate((id) => { window.markupcraft.store.change('rm', (tx) => tx.remove(id)); }, pen);

  console.log('\n== Permit review comments as notes (EG.44)');
  const csv = path.join(OUT, 'review-comments.csv');
  fs.writeFileSync(csv, 'kind,where,rule,clause,required,found,source,comment,what to do\r\nfail,Stair 1,Riser height,R311.7.5.1,<= 7.75 in,8 in,IRC 2021,"Riser is too high, over the limit",Reduce it\r\nheads-up,Hall,Hall width,R311.6,>= 36 in,36.5 in,IRC,Close to the limit,\r\n');
  await page.locator('[data-tab="tasks"]').click();
  await page.locator('summary', { hasText: 'Permit review comments' }).click();
  const before = await page.evaluate(() => window.markupcraft.store.all().filter((m) => m.type === 'note').length);
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-act="permit-import"]')]);
  await chooser.setFiles(csv);
  await page.waitForFunction((b) => window.markupcraft.store.all().filter((m) => m.type === 'note').length === b + 2, before, { timeout: 8000 }).catch(() => {});
  const notes = await page.evaluate(() => window.markupcraft.store.all().filter((m) => m.subject === 'Permit review').map((m) => ({ text: m.text, status: m.status, comment: m.comment })));
  ok(notes.length === 2 && /Fails: Riser height/.test(notes[0].text) && notes[0].comment === 'Reduce it' && notes[0].status === 'Open', 'two comments became two Open notes with the rule, clause and what to do', notes);
  const pst = await page.locator('[data-permit-status]').innerText(); ok(/Brought in 2 comments/.test(pst), 'the panel says so', pst);
  await page.evaluate(() => window.markupcraft.store.undo());
  ok(await page.evaluate(() => window.markupcraft.store.all().filter((m) => m.subject === 'Permit review').length) === 0, 'one undo step takes them all back');

  console.log('\n== Site progress as notes (EG.39)');
  const pj = path.join(OUT, 'progress.json');
  fs.writeFileSync(pj, JSON.stringify({ progress: [{ date: '2026-10-20', label: 'Drone flight 2', pct: 42.4, remainingCut: 1200, overCut: 300, stockpile: 80 }, { date: '2026-10-01', label: 'Flight 1', pct: 20, remainingCut: 4000 }] }));
  await page.locator('summary', { hasText: 'Site progress' }).click();
  const [ch2] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-act="progress-import"]')]);
  await ch2.setFiles(pj);
  await page.waitForFunction(() => window.markupcraft.store.all().some((m) => m.subject === 'Site progress'), null, { timeout: 8000 }).catch(() => {});
  const pn = await page.evaluate(() => window.markupcraft.store.all().filter((m) => m.subject === 'Site progress').map((m) => ({ text: m.text, status: m.status })));
  ok(pn.length === 2 && /42 % done/.test(pn[0].text) && pn[0].status === 'Open' && pn[1].status === 'Accepted', 'two surveys became two notes', pn);
  await page.evaluate(() => window.markupcraft.store.undo());

  console.log('\n== D7.56: a trackpad swipe pans, a wheel step zooms');
  const wheel = (d) => page.evaluate((d) => { const v = window.markupcraft.view; const el = document.querySelector('[data-over]'); const b = { ox: v.ox, oy: v.oy, z: v.z }; const r = el.getBoundingClientRect(); el.dispatchEvent(new WheelEvent('wheel', { ...d, bubbles: true, cancelable: true, clientX: r.left + 300, clientY: r.top + 300 })); return { b, a: { ox: v.ox, oy: v.oy, z: v.z } }; }, d);
  const sw = await wheel({ deltaX: 12.5, deltaY: 4.25, deltaMode: 0 });
  ok(Math.abs(sw.a.z - sw.b.z) < 1e-9 && (sw.a.ox !== sw.b.ox || sw.a.oy !== sw.b.oy), 'a two-finger swipe pans and does not zoom', sw);
  const wh = await wheel({ deltaX: 0, deltaY: 100, deltaMode: 0 });
  ok(wh.a.z !== wh.b.z, 'a mouse wheel step still zooms', wh);

  console.log('\n== Problems markers on the page');
  await page.evaluate((mid) => { window.markupcraft.store.change('task', (tx) => { const m = tx.get(mid); tx.update(mid, { task: { title: 'Redraw the hood wall', state: 'Open', due: '2020-01-01', assignee: { kind: 'person', name: 'Ana' }, link: null, created: new Date().toISOString() } }); }); }, id);
  await page.waitForFunction(() => window.ccProblems?.store.list().length > 0, null, { timeout: 8000 }).catch(() => {});
  await page.waitForSelector('[data-problem-mark]', { timeout: 8000 }).catch(() => {});
  const marks = await page.evaluate(() => [...document.querySelectorAll('[data-problem-mark]')].map((b) => { const r = b.getBoundingClientRect(); return { x: Math.round(r.left), y: Math.round(r.top), t: b.title }; }));
  ok(marks.length >= 1, 'an overdue task shows a marker on the sheet', marks);
  const box = await page.evaluate((mid) => { const mc = window.markupcraft; const b = mc.boundsOfId(mid); const a = mc.view.toScreen([(b[0] + b[2]) / 2, (b[1] + b[3]) / 2]); const r = mc.view.canvas?.getBoundingClientRect?.() || document.querySelector('[data-base]').getBoundingClientRect(); return { x: a[0] + r.left, y: a[1] + r.top }; }, id);
  ok(marks.some((m) => Math.abs(m.x - box.x) < 30 && Math.abs(m.y - box.y) < 30), 'and it sits on the markup the task is about', { marks, box });
  await page.screenshot({ path: path.join(OUT, 'problem-marker.png') });

  console.log('\n== The live adapter (EG.41)');
  const w = await page.evaluate(async (mid) => {
    const src = [...document.querySelectorAll('script[type=module]')].map((s) => s.src).find((s) => /markupcraft/.test(s)) || '';
    const base = src.replace(/[^/]*$/, '');
    const ML = await import(base + 'live.js');
    const mc = window.markupcraft;
    const a = ML.createLive(mc.store, { files: () => mc.files, sheets: () => mc.sheets, bounds: (m) => mc.boundsOfMarkup(m) });
    const key = mc.sheets[0].page.key;
    const m = mc.store.get(mid);
    return { base, set: a.where([{ o: 'set', id: mid, f: 'text', v: 'x' }]), add: a.where([{ o: 'add', id: 'zz', m: { ...JSON.parse(JSON.stringify(m)), id: 'zz' } }]), del: a.where([{ o: 'del', id: mid, ly: '' }]), none: a.where([]), mixed: a.where([{ o: 'cal', sheet: key }, { o: 'cal', sheet: 'other:1' }]), keys: a.presenceKeys, label: a.sheetLabel(key), key };
  }, id);
  ok(w.set && w.set.sheet === w.key && Array.isArray(w.set.box) && w.set.box[2] > w.set.box[0], 'a change to a markup is on its sheet with the box of the markup', w.set);
  ok(w.add && w.add.sheet === w.key && Array.isArray(w.add.box), 'an added markup is located from the op itself', w.add);
  ok(w.del && w.del.sheet === undefined && w.del.box === undefined || (w.del === null), 'a removal that names no sheet says it cannot tell (null)', w.del);
  ok(w.none === null, 'no ops: null', w.none);
  ok(w.mixed && w.mixed.sheet === '\u0000mixed' && w.mixed.box === null, 'steps over two sheets are never inside one sheet', w.mixed);
  ok(w.keys.sheet === 'sh' && !!w.label, 'presence keys and the sheet label', { keys: w.keys, label: w.label });

  console.log('\n== SU.910: the overlay and the reviewers strip (stand-in client)');
  const live = await page.evaluate(async () => {
    const mc = window.markupcraft;
    const src = [...document.querySelectorAll('script[type=module]')].map((s) => s.src).find((s) => /markupcraft/.test(s)) || '';
    const UI = await import(src.replace(/[^/]*$/, '') + 'live-ui.js');
    const key = mc.sheets[0].page.key;
    const listeners = {};
    const client = { c: 1, o: { name: 'Mount Tester' }, peers: new Map([[1, { c: 1, name: 'Mount Tester', state: 'live' }], [2, { c: 2, name: 'Rita Reviewer', state: 'live' }], [3, { c: 3, name: 'Ola Other', state: 'live' }]]), setPresence() {}, on(k, f) { listeners[k] = f; return () => {}; } };
    const adapter = {};
    const off = UI.attachUi(mc, adapter, client);
    const id = [...mc.store.all()].find((m) => m.type === 'cloudrect').id;
    const b = mc.boundsOfId(id);
    adapter.drawPresence([[2, { sh: key, cur: [(b[0] + b[2]) / 2, b[3] + 40], sel: [id] }], [3, { sh: 'nofile:9', cur: null, sel: [] }]]);
    await new Promise((r) => setTimeout(r, 300));
    const strip = document.querySelector('.mc-live-people');
    const people = strip ? [...strip.querySelectorAll('.mc-live-person')].map((x) => ({ name: x.querySelector('.mc-live-name')?.textContent, where: x.querySelector('.mc-live-where')?.textContent, disabled: x.disabled })) : null;
    // pixel check: the dashed box and pointer are painted in Rita's colour on the overlay canvas
    const over = document.querySelector('[data-over]');
    const ctx = over.getContext('2d');
    const col = UI.personColour(2);
    const rgb = [1, 3, 5].map((i) => parseInt(col.slice(i, i + 2), 16));
    const d = ctx.getImageData(0, 0, over.width, over.height).data;
    let n = 0; for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - rgb[0]) < 6 && Math.abs(d[i + 1] - rgb[1]) < 6 && Math.abs(d[i + 2] - rgb[2]) < 6 && d[i + 3] > 200) n++;
    const dot = !!document.querySelector('.mc-live-dot');
    listeners.peer?.();
    return { people, hidden: strip?.hidden, painted: n, dot, ratio: over.width / over.getBoundingClientRect().width };
  });
  ok(live.people && live.people.length === 2 && live.hidden === false, 'the strip lists the two other reviewers', live.people);
  ok(live.people?.find((p) => p.name === 'Rita Reviewer')?.where === 'on this sheet', 'one is on this sheet', live.people);
  ok(live.painted > 40, 'their pointer and the dashed box round their pick are drawn in their colour on the overlay', live.painted);
  ok(live.dot, 'the reviewer colour shows in the markup list');
  await page.screenshot({ path: path.join(OUT, 'live-overlay.png') });
  await page.evaluate(() => window.markupcraft.view.invalidate());

  ok(problems.length === 0, 'no console errors, page errors or failed requests', problems.slice(0, 5));
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed. Screenshots in ${OUT}`);
process.exit(fail ? 1 : 0);
