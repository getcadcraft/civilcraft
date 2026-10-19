#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-discord.mjs — 0.6 track DF (the Discord reports, session discord-fixes) in CadCraft, headless. One section per
 * finished item.
 *
 *   node tools/cadcraft-test/browser-discord.mjs [--shots <dir>] [--only df1,df3,…]
 *
 * Run as root (a session minted by `sudo -u www-data php tools/cadcraft-test/admin.php session` for the test admin
 * cctest+cadcraft@projectz.xyz). Uses the cached Playwright Chromium. Fails on any console error.
 *   df1  fixtures/dwg/df1-ocs-blocks.dwg (made by ezdxf + the ODA File Converter) in /lab: the eight chairs where ezdxf puts
 *        them (two are flipped references, extrusion (0,0,-1)), every case's extents as ezdxf's, the snap marker 12 px
 *        right after the file opens (before any zoom) and after zooming far in and out; the same file in /use (the current
 *        release) for the record (the release still turns flipped references upside down).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
const oi = args.indexOf('--only');
const ONLY = oi >= 0 ? new Set(args[oi + 1].split(',')) : null;
const run = (k) => !ONLY || ONLY.has(k);
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const note = (m) => console.log('  note ' + m);

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };
export const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const open = async (file) => {
  await page.setInputFiles('[data-file]', file);
  await page.waitForFunction((n) => window.cadcraft?.doc?.meta?.source === n && window.cadcraft.doc.model.size > 0, path.basename(file), { timeout: 60000 });
  await page.waitForTimeout(300);
};
const goto = async (url) => { await page.goto(BASE + url, { waitUntil: 'networkidle' }); await page.waitForFunction(() => !!window.cadcraft); };

try {
  if (run('df1')) {
    console.log('\n== DF.1 blocks, objects in their own coordinate system, snap markers');
    const truth = JSON.parse(fs.readFileSync(path.join(REPO, 'fixtures/dwg/df1-ocs-blocks.truth.json'), 'utf8'));
    const file = path.join(REPO, 'fixtures/dwg/df1-ocs-blocks.dwg');
    // in the page: each case layer's extents (text left out, as in the truth) and each chair's back point
    const measure = (area) => page.evaluate(async ({ area }) => {
      const mods = await import(`/assets/apps/cadcraft/${area}/geom.js`);   // the build's own module (dev, or the release via current)
      const { doc } = window.cadcraft, out = { cases: {}, backs: [] };
      for (const e of doc.model.values()) {
        if (!/^CASE_/.test(e.layer)) continue;
        const k = e.layer.slice(5), b = out.cases[k] || (out.cases[k] = mods.emptyBounds());
        if (e.type !== 'text') for (const p of mods.prims(e, doc.blocks)) if (!p.box || p.k === 'A') mods.primBounds(p, b);
        if (k === 'CHAIRS') out.backs.push(mods.mApply(mods.insertMatrix(e, doc.blocks.get(e.block)), { x: 0, y: 16 }));
      }
      return out;
    }, { area });
    const compare = (got) => Object.entries(truth.cases).filter(([k, w]) => { const b = got.cases[k]; return !b || Math.abs(b.minX - w.min[0]) > 0.005 || Math.abs(b.minY - w.min[1]) > 0.005 || Math.abs(b.maxX - w.max[0]) > 0.005 || Math.abs(b.maxY - w.max[1]) > 0.005; }).map(([k]) => k);
    const chairsOff = (got) => truth.chairs.filter((w) => !got.backs.some((p) => Math.hypot(p.x - w[0], p.y - w[1]) < 1e-6)).length;

    await goto('/lab/cadcraft?space=paper');
    await open(file);
    // right after opening, before any zoom: the snap marker on a chair's leg (a circle centre) is 12 px across
    const snapSize = () => page.evaluate(() => {
      const v = window.cadcraft.view, sn = v.state.snap; if (!sn) return null;
      const xs = [], ys = []; const add = (x, y) => { xs.push(x); ys.push(y); };
      const ctx = { beginPath() {}, closePath() {}, stroke() {}, fill() {}, fillRect() {}, fillText() {}, measureText: () => ({ width: 1 }), moveTo: add, lineTo: add, rect: (x, y, w, h) => { add(x, y); add(x + w, y + h); }, arc: (x, y, r) => { add(x - r, y - r); add(x + r, y + r); } };
      v.drawSnap(ctx, { ...sn, label: '' });
      return Math.max(Math.max(...xs) - Math.min(...xs), Math.max(...ys) - Math.min(...ys));
    });
    const hoverOn = async (wx, wy) => {
      const s = await page.evaluate(({ wx, wy }) => { const v = window.cadcraft.view, p = v.toScreen(wx, wy), r = v.canvas?.getBoundingClientRect?.() || document.querySelector('[data-stage] canvas, canvas').getBoundingClientRect(); return { x: r.left + v.x0 + p.x, y: r.top + v.y0 + p.y }; }, { wx, wy });
      await page.mouse.move(s.x + 1, s.y + 1); await page.mouse.move(s.x, s.y); await page.waitForTimeout(120);
    };
    await typeCmd('LINE');
    await hoverOn(800, 0);   // DIMROT's first point: an end point
    const s0 = await snapSize();
    ok(s0 !== null && s0 <= 12.0001, 'right after opening (no zoom yet): the snap marker is at most 12 px across', String(s0));
    await shot('df1-01-after-open');
    for (const f of [1e-3, 1e4]) {
      await page.evaluate((f) => { const v = window.cadcraft.view; v.zoomAt(v.w / 2, v.h / 2, f); v.invalidate(true); }, f);
      await page.evaluate(() => { const v = window.cadcraft.view; const p = { x: 800, y: 0 }; v.cx = p.x; v.cy = p.y; v.invalidate(true); });
      await hoverOn(800, 0);
      const s = await snapSize();
      ok(s === null || s <= 12.0001, `zoomed ×${f}: the snap marker stays at most 12 px`, String(s));
    }
    await page.keyboard.press('Escape');
    await typeCmd('ZOOM'); await typeCmd('E');
    const lab = await measure('dev');
    const bad = compare(lab);
    ok(!bad.length, `/lab: all ${Object.keys(truth.cases).length} cases drawn where ezdxf draws them`, bad.join(', '));
    ok(chairsOff(lab) === 0, '/lab: all 8 chairs face the way they were placed (2 are flipped references)', String(chairsOff(lab)));
    // a close look at the furniture plan
    await page.evaluate(() => { const v = window.cadcraft.view; v.cx = 1045; v.cy = 20; v.zoom = Math.min(v.w / 140, v.h / 110); v.invalidate(true); });
    await page.waitForTimeout(300);
    await shot('df1-02-chairs-lab');

    // the current release in /use (for the record: what people have now)
    await goto('/use/cadcraft?space=paper');
    await open(file);
    const rel = await measure('current');
    const relBad = compare(rel);
    note(`/use (the current release): ${relBad.length} cases off (${relBad.join(', ') || 'none'}), ${chairsOff(rel)} of 8 chairs not where they were placed`);
    await page.evaluate(() => { const v = window.cadcraft.view; v.cx = 1045; v.cy = 20; v.zoom = Math.min(v.w / 140, v.h / 110); v.invalidate(true); });
    await page.waitForTimeout(300);
    await shot('df1-03-chairs-use');
  }

  if (run('df3')) {
    console.log('\n== DF.3 arithmetic wherever a length or number is typed');
    await goto('/lab/cadcraft?space=paper');
    const last = () => page.evaluate(() => { const es = [...window.cadcraft.doc.model.values()]; return es[es.length - 1] || null; });
    const history = () => page.evaluate(() => document.querySelector('[data-history]')?.innerText || '');
    await typeCmd('UNITS'); await typeCmd('A'); await typeCmd('16');
    await typeCmd('LINE'); await typeCmd('0,0'); await typeCmd('@4+7/16,0'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    let e = await last();
    ok(e?.type === 'line' && Math.abs(e.x2 - 4.4375) < 1e-9, 'LINE @4+7/16,0 on the command line', JSON.stringify(e));
    // a bracketed calculation keeps its spaces (a space is not Enter inside brackets), and is not taken for LISP
    await typeCmd('CIRCLE'); await typeCmd('0,0');
    await page.click('[data-cmd-input]'); await page.keyboard.type('(24\' - 6")/2'); await page.keyboard.press('Enter'); await page.waitForTimeout(250);
    e = await last();
    ok(e?.type === 'circle' && Math.abs(e.r - 141) < 1e-9, 'CIRCLE radius (24\' - 6")/2 = 11\'-9", typed with spaces', JSON.stringify(e));
    await typeCmd('CIRCLE'); await typeCmd('0,0'); await typeCmd('4*/2');
    ok((await history()).includes("Can't read \"/\" there (character 3)."), 'a broken calculation is refused with where, in the history');
    await page.keyboard.press('Escape');
    // Properties: a length box takes it too
    await page.evaluate(() => { const c = window.cadcraft, l = [...c.doc.model.values()].find((x) => x.type === 'line'); c.host.setSelection(new Set([l.id])); });
    await page.waitForTimeout(250);
    const box = await page.$('#cc-p-len');
    if (box) {
      await box.click(); await box.fill('2*12\'+6"'); await box.press('Enter'); await page.waitForTimeout(250);
      const len = await page.evaluate(() => { const l = [...window.cadcraft.doc.model.values()].find((x) => x.type === 'line'); return Math.hypot(l.x2 - l.x1, l.y2 - l.y1); });
      ok(Math.abs(len - 294) < 1e-9, 'Properties › Length 2*12\'+6" = 24\'-6"', String(len));
    } else note('no Length box found in Properties (selector) — checked in Node (propexpr)');
    await typeCmd('CAL'); await typeCmd('(24\'-0")/3');
    ok((await history()).includes('= 8\'-0"'), 'CAL (24\'-0")/3 prints 8\'-0"');
    await shot('df3-01-history');
  }

  if (run('df2')) {
    console.log('\n== DF.2 ALIGN and the Align and distribute panel');
    await goto('/lab/cadcraft?space=paper');
    const ents = () => page.evaluate(() => [...window.cadcraft.doc.model.values()].map((e) => ({ id: e.id, type: e.type, cx: e.cx, cy: e.cy, r: e.r, pts: e.pts })));
    await typeCmd('C'); await typeCmd('0,0'); await typeCmd('1');
    await typeCmd('C'); await typeCmd('10,3'); await typeCmd('2');
    await typeCmd('C'); await typeCmd('25,-5'); await typeCmd('1.5');
    // the menu entry opens the panel
    await page.click('[data-tb-key="Modify"] details summary').catch(() => {});
    const entry = await page.$('[data-cmd="ALIGNPANEL"]');
    ok(!!entry, 'Modify › More has "Align and distribute"');
    if (entry) await entry.click(); else await typeCmd('ALIGNPANEL');
    await page.waitForSelector('[data-align-panel]:not([hidden])', { timeout: 5000 });
    ok(await page.isVisible('[data-align-panel]'), 'the panel opens over the drawing');
    await shot('df2-01-panel');
    await page.evaluate(() => { const c = window.cadcraft; c.host.setSelection(new Set([...c.doc.model.keys()])); });
    const undo0 = await page.evaluate(() => window.cadcraft.doc.undoStack.length);
    await page.click('[data-align="T"]'); await page.waitForTimeout(300);
    let es = await ents();
    ok(es.every((e) => Math.abs(e.cy + e.r - 5) < 1e-9), 'Top: every circle\'s top on the selection\'s top', JSON.stringify(es.map((e) => e.cy + e.r)));
    await page.selectOption('[data-align-opt="space"]', 'C');
    await page.click('[data-align="DH"]'); await page.waitForTimeout(300);
    es = await ents();
    ok(Math.abs(es[1].cx - 12.5) < 1e-9 && Math.abs(es[0].cx) < 1e-9 && Math.abs(es[2].cx - 25) < 1e-9, 'Equal centres across: the middle one at 12.5, the outer two stay');
    const undo1 = await page.evaluate(() => window.cadcraft.doc.undoStack.length);
    ok(undo1 === undo0 + 2, 'one undo step per click', `${undo0} → ${undo1}`);
    ok(await page.evaluate(() => window.cadcraft.host.selection.size === 3), 'the selection stays for the next click');
    await page.click('.cc-align-close');
    ok(!(await page.isVisible('[data-align-panel]')), 'the panel closes');
    // ALIGN by points, two pairs with scale
    await typeCmd('ALIGN');   // takes the selection (noun-verb)
    for (const s of ['0,0', '100,100', '25,0', '100,150', '', 'Y']) await typeCmd(s);
    es = await ents();
    // the first circle sat at (0, 4) after Top: (0, 4) × 2 turned 90° = (−8, 0) from (100, 100)
    ok(Math.abs(es[0].cx - 92) < 1e-6 && Math.abs(es[0].cy - 100) < 1e-6 && Math.abs(es[0].r - 2) < 1e-6, 'ALIGN two pairs + scale by typed points: moved, turned 90°, twice the size', JSON.stringify(es[0]));
    await shot('df2-02-aligned');
  }

  if (run('df4')) {
    console.log('\n== DF.4 totals for a selection');
    await goto('/lab/cadcraft?space=paper');
    await page.evaluate(() => { try { const s = JSON.parse(localStorage.getItem('cadcraft.settings') || '{}'); delete s.selTotals; localStorage.setItem('cadcraft.settings', JSON.stringify(s)); } catch {} });
    await goto('/lab/cadcraft?space=paper');
    await typeCmd('LINE'); await typeCmd('0,0'); await typeCmd('30,40'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
    await typeCmd('REC'); await typeCmd('0,0'); await typeCmd('10,5');
    await typeCmd('C'); await typeCmd('0,0'); await typeCmd('1');
    await page.evaluate(() => { const c = window.cadcraft; c.host.setSelection(new Set([...c.doc.model.keys()])); });
    await page.waitForTimeout(300);
    const sb = await page.textContent('[data-seltotals]');
    ok(await page.isVisible('[data-seltotals]') && /Length 80/.test(sb) && /Area 53\.14/.test(sb), 'status bar: Length 80 (line 50 + rectangle 30), Area 53.14 (rectangle 50 + circle π)', sb);
    const tl = await page.textContent('#cc-p-tlength'), ta = await page.textContent('#cc-p-tarea'), to = await page.textContent('#cc-p-tobjects');
    ok(/^80 \(2 objects\)$/.test(tl.trim()) && /^53\.14\d* \(2 objects\)$/.test(ta.trim()) && /1 line/.test(to) && /1 circle/.test(to), 'Properties › Totals: objects by type, total length, total area', `${to} | ${tl} | ${ta}`);
    await shot('df4-01-totals');
    // Settings › CadCraft › Length and area of the selection: Hidden
    await page.evaluate(() => { const c = window.cadcraft; c.host.setSelection(new Set()); });
    await page.click('[data-settings-btn], button[aria-label="Settings"], .app-bar [data-app-settings-open]').catch(() => page.keyboard.press('Control+,'));
    await page.waitForSelector('input[name="ccSelTotals"][value="off"]', { state: 'attached', timeout: 5000 });
    await page.evaluate(() => { const r = document.querySelector('input[name="ccSelTotals"][value="off"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
    await page.keyboard.press('Escape');
    await page.evaluate(() => { const c = window.cadcraft; c.host.setSelection(new Set([...c.doc.model.keys()])); });
    await page.waitForTimeout(250);
    ok(!(await page.isVisible('[data-seltotals]')) && await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.settings')).selTotals === 'off'), 'switched off in Settings: no readout, remembered');
    await page.evaluate(() => { const r = document.querySelector('input[name="ccSelTotals"][value="on"]'); r.checked = true; r.dispatchEvent(new Event('change', { bubbles: true })); });
  }

  if (run('df13')) {
    console.log('\n== DF.13 TRIMEXTENDMODE and trimming by a dragged window');
    await goto('/lab/cadcraft?space=paper');
    await page.evaluate(() => { try { const s = JSON.parse(localStorage.getItem('cadcraft.settings') || '{}'); s.trimDrag = 'window'; localStorage.setItem('cadcraft.settings', JSON.stringify(s)); } catch {} });
    await goto('/lab/cadcraft?space=paper');
    ok(await page.evaluate(() => document.querySelector('input[name="ccTrimDrag"][value="window"]')?.checked === true), 'Settings › CadCraft › Dragging to trim and extend shows "A window"');
    await typeCmd('LINE'); await typeCmd('-5,0'); await typeCmd('100,0'); await page.keyboard.press('Enter');
    for (let i = 0; i < 6; i++) { await typeCmd('LINE'); await typeCmd(`${i * 5},-10`); await typeCmd(`${i * 5},10`); await page.keyboard.press('Enter'); }
    await typeCmd('ZOOM'); await typeCmd('E');
    await typeCmd('TRIM');
    const scr = (x, y) => page.evaluate(({ x, y }) => { const v = window.cadcraft.view, p = v.toScreen(x, y), r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left + v.x0 + p.x, y: r.top + v.y0 + p.y }; }, { x, y });
    const a = await scr(3, 8), b = await scr(17, 2);
    await page.mouse.move(a.x, a.y); await page.mouse.down();
    await page.mouse.move((a.x + b.x) / 2, (a.y + b.y) / 2, { steps: 4 }); await page.mouse.move(b.x, b.y, { steps: 4 });
    const lasso = await page.evaluate(() => window.cadcraft.view.state.lasso);
    ok(lasso?.mode === 'crossing' && lasso.pts.length === 4, 'the drag draws a box (a crossing window), not a path', JSON.stringify(lasso));
    await shot('df13-01-window');
    await page.mouse.up(); await page.waitForTimeout(250);
    const tops = await page.evaluate(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'line' && e.x1 === e.x2).map((e) => Math.max(e.y1, e.y2)));
    ok(tops.filter((y) => Math.abs(y) < 1e-9).length === 3 && tops.filter((y) => Math.abs(y - 10) < 1e-9).length === 3, 'the window trims the three top pieces it touches (x = 5, 10, 15)', JSON.stringify(tops));
    await page.keyboard.press('Escape');
    await typeCmd('TRIMEXTENDMODE'); await typeCmd('0');
    ok(await page.evaluate(() => window.cadcraft.engine.trimMode === 'standard'), 'TRIMEXTENDMODE 0 on the command line');
    await page.evaluate(() => { const s = JSON.parse(localStorage.getItem('cadcraft.settings') || '{}'); s.trimDrag = 'path'; localStorage.setItem('cadcraft.settings', JSON.stringify(s)); });
  }

  if (run('df5')) {
    console.log('\n== DF.5 title blocks: EATTEDIT by double-click, BATTMAN, REFEDIT');
    await goto('/lab/cadcraft?space=paper');
    for (const s of ['REC', '0,0', '100,40']) await typeCmd(s);
    for (const s of ['ATTDEF', '', 'title', 'Drawing title', 'PLAN', '5,30', '4', '0']) await typeCmd(s);
    for (const s of ['ATTDEF', '', 'sheet', 'Sheet number', 'A-101', '5,20', '3', '0']) await typeCmd(s);
    for (const s of ['BLOCK', 'TB', '0,0', 'ALL', '']) await typeCmd(s);
    await typeCmd('ZOOM'); await typeCmd('E');
    const scr = (x, y) => page.evaluate(({ x, y }) => { const v = window.cadcraft.view, p = v.toScreen(x, y), r = document.querySelector('canvas').getBoundingClientRect(); return { x: r.left + v.x0 + p.x, y: r.top + v.y0 + p.y }; }, { x, y });
    const at = await scr(100, 20);
    await page.mouse.dblclick(at.x, at.y);
    await page.waitForSelector('dialog[data-att-editor]', { timeout: 5000 });
    ok(true, 'double-click on the title block opens the attribute editor');
    await page.fill('input[data-att-value="TITLE"]', 'GROUND FLOOR PLAN');
    await page.click('tr[data-att-row="SHEET"]');
    await page.fill('#cc-eatt-h', '5'); await page.press('#cc-eatt-h', 'Tab');
    await shot('df5-01-eattedit');
    await page.click('dialog[data-att-editor] button[data-key="ok"]');
    await page.waitForTimeout(250);
    const ins = await page.evaluate(() => { const e = [...window.cadcraft.doc.model.values()].find((x) => x.type === 'insert'); return { attrs: e.attrs, attloc: e.attloc, steps: window.cadcraft.doc.undoStack.length }; });
    ok(ins.attrs.TITLE === 'GROUND FLOOR PLAN' && Math.abs(ins.attloc?.SHEET?.h - 5) < 1e-9, 'OK applies the value and the height of SHEET', JSON.stringify(ins));
    // BATTMAN: move SHEET up, rename TITLE → NAME, keep values
    await typeCmd('BATTMAN');
    await page.waitForSelector('dialog[data-att-manager]', { timeout: 5000 });
    await page.click('tr[data-bm-row="1"] button[aria-label="Move up"]');
    await page.fill('tr[data-bm-row="1"] input[data-bm="tag"]', 'NAME');
    await shot('df5-02-battman');
    await page.click('dialog[data-att-manager] button[data-key="apply"]');
    await page.waitForTimeout(250);
    await page.click('dialog[data-att-manager] button[data-key="close"]');
    const bm = await page.evaluate(() => { const c = window.cadcraft, e = [...c.doc.model.values()].find((x) => x.type === 'insert'); return { tags: c.doc.blocks.get('TB').attdefs.map((d) => d.tag), attrs: e.attrs }; });
    ok(bm.tags.join() === 'SHEET,NAME' && bm.attrs.NAME === 'GROUND FLOOR PLAN' && bm.attrs.SHEET === 'A-101', 'BATTMAN: SHEET first, TITLE renamed NAME, the value kept', JSON.stringify(bm));
    // REFEDIT with the banner
    await page.evaluate(() => { const c = window.cadcraft; c.host.setSelection(new Set([[...c.doc.model.values()].find((x) => x.type === 'insert').id])); });
    await typeCmd('REFEDIT');
    ok(await page.isVisible('[data-refedit]'), 'REFEDIT shows its banner');
    for (const s of ['LINE', '0,40', '100,0', '']) await typeCmd(s);
    await shot('df5-03-refedit');
    await page.click('[data-refedit] button[data-refedit-save="1"]');
    await page.waitForTimeout(250);
    const tb = await page.evaluate(() => ({ n: window.cadcraft.doc.blocks.get('TB').entities.length, open: !!window.cadcraft.doc.refEdit, model: window.cadcraft.doc.model.size }));
    ok(tb.n === 2 && !tb.open && tb.model === 1 && !(await page.isVisible('[data-refedit]')), 'Save the block: the line is in it, the banner gone', JSON.stringify(tb));
  }

  if (run('df6')) {
    console.log('\n== DF.6 a picture pasted from the clipboard');
    await goto('/lab/cadcraft?space=paper');
    const pngB64 = fs.readFileSync(path.join(REPO, 'fixtures/dwg/example-logo.png')).toString('base64');
    for (const s of ['REC', '0,0', '100,50']) await typeCmd(s);
    await typeCmd('ZOOM'); await typeCmd('E');
    await page.mouse.move(700, 450);
    // Ctrl+V with a picture on the clipboard: the paste event carries the file
    await page.focus('[data-cmd-input]');
    await page.keyboard.down('Control'); await page.keyboard.press('KeyV'); await page.keyboard.up('Control');
    await page.evaluate((b64) => {
      const bytes = Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0));
      const dt = new DataTransfer(); dt.items.add(new File([bytes], 'image.png', { type: 'image/png' }));
      document.querySelector('[data-cmd-input]').dispatchEvent(new ClipboardEvent('paste', { clipboardData: dt, bubbles: true, cancelable: true }));
    }, pngB64);
    await page.waitForTimeout(400);
    const st = await page.evaluate(() => { const c = window.cadcraft, refs = [...c.doc.model.values()].filter((e) => e.type === 'insert'); return { n: refs.length, pics: [...(c.doc.pictures || new Map()).values()].map((p) => p.name), input: document.querySelector('[data-cmd-input]').value }; });
    ok(st.n === 1 && st.pics[0] === 'Drawing1-picture-1.png' && st.input === '', 'Ctrl+V with a picture on the clipboard places it (named after the drawing); nothing lands in the command line', JSON.stringify(st));
    ok((await page.textContent('[data-history]')).includes('Pasted a picture, Drawing1-picture-1.png'), 'the history says what was pasted');
    await shot('df6-01-pasted');
    // Ctrl+V with no picture (and no paste event): CadCraft's own clipboard, as before
    await page.evaluate(() => window.cadcraft.host.setSelection(new Set([[...window.cadcraft.doc.model.values()][0].id])));
    await page.keyboard.down('Control'); await page.keyboard.press('KeyC'); await page.keyboard.up('Control');
    await page.keyboard.down('Control'); await page.keyboard.press('KeyV'); await page.keyboard.up('Control');
    await page.waitForTimeout(300);
    ok(await page.evaluate(() => window.cadcraft.engine.running === 'PASTECLIP'), 'Ctrl+V without a picture: CadCraft\'s own paste follows the pointer');
    await page.keyboard.press('Escape');
    // Save: the DWG and, beside it, the PNG it names
    const downloads = [];
    page.on('download', (d) => downloads.push(d.suggestedFilename()));
    await page.keyboard.down('Control'); await page.keyboard.press('KeyS'); await page.keyboard.up('Control');
    await page.waitForTimeout(1500);
    ok(downloads.includes('Drawing1.dwg') && downloads.includes('Drawing1-picture-1.png'), 'Save writes the drawing and the picture beside it', JSON.stringify(downloads));
    ok((await page.textContent('[data-history]')).includes('Also saved Drawing1-picture-1.png'), 'and says so');
  }

  if (run('df7')) {
    console.log('\n== DF.7 EXPORTPOINTS');
    await goto('/lab/cadcraft?space=paper');
    await typeCmd('POINT'); await typeCmd('10,20'); await page.keyboard.press('Escape');
    await typeCmd('POINT'); await typeCmd('30,40'); await page.keyboard.press('Escape');
    await page.click('[data-tb-key="Blocks"] details summary').catch(() => {});
    const entry = await page.$('[data-cmd="EXPORTPOINTS"]');
    ok(!!entry, 'Blocks › More has "Export points"');
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 15000 }), (async () => {
      if (entry) await entry.click(); else await typeCmd('EXPORTPOINTS');
      for (const s of ['', 'PNEZD', 'D', 'C', '1']) await typeCmd(s);
    })()]);
    const file = path.join(SHOTS || REPO + '/tmp', 'df7-points.csv');
    await dl.saveAs(file);
    const text = fs.readFileSync(file, 'utf8');
    ok(dl.suggestedFilename() === 'Drawing1-points.csv' && text === '1,20.000,10.000,0.000,\r\n2,40.000,30.000,0.000,\r\n', 'the CSV downloads with both points, PNEZD', JSON.stringify(text));
    if (!SHOTS) fs.unlinkSync(file);
  }

  if (run('df9')) {
    console.log('\n== DF.9 File › Open a sample');
    await goto('/lab/cadcraft?space=paper');
    const rows = await page.evaluate(() => new Set([...document.querySelectorAll('.cc-tools > .cc-tool-group')].filter((g) => g.offsetParent).map((g) => g.offsetTop)).size);
    ok(rows <= 2, 'the toolbar stays two rows at 1440 px', String(rows));
    await page.click('.cc-sec-head [data-cmd="SAMPLES"]');   // the left panel's Drawing section: "Open a sample"
    await page.waitForSelector('dialog[data-samples] [data-sample="sample-house.dwg"] button', { timeout: 10000 });
    const titles = await page.$$eval('dialog[data-samples] .cc-sample h3', (hs) => hs.map((h) => h.textContent));
    ok(titles.length === 2 && /Sample house/.test(titles[0]) && /as-built/.test(titles[1]), 'the dialog lists both samples', titles.join(' | '));
    await shot('df9-01-dialog');
    await page.click('dialog[data-samples] [data-sample="sample-house.dwg"] .btn-plot');
    await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'sample-house.dwg' && window.cadcraft.doc.layouts.length === 4, null, { timeout: 30000 });
    const st = await page.evaluate(() => { const d = window.cadcraft.doc; const tb = [...d.layouts[0].entities.values()].find((e) => e.type === 'insert'); return { sheets: d.layouts.map((l) => l.name), lunits: d.meta.lunits, sheet: tb?.attrs?.SHEET }; });
    ok(st.sheets[0] === 'A-101 FLOOR PLAN' && st.lunits === 4 && st.sheet === 'A-101', 'Sample house opens: four sheets, feet and inches, the title block\'s attributes', JSON.stringify(st));
    await typeCmd('SAMPLES');
    await page.waitForSelector('dialog[data-samples] [data-sample="sample-asbuilt.dwg"] .btn-line', { timeout: 10000 });
    await page.click('dialog[data-samples] [data-sample="sample-asbuilt.dwg"] .btn-line');   // its DXF
    await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'sample-asbuilt.dxf', null, { timeout: 30000 });
    const ab = await page.evaluate(() => ({ points: [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'point').length, tabs: document.querySelectorAll('.cc-doctabs [role="tab"], .cc-doctab').length }));
    ok(ab.points > 500, 'the as-built DXF opens in a new tab with its scan slice', JSON.stringify(ab));
  }

  if (run('df11')) {
    console.log('\n== DF.11 an R12 DWG gets a plain refusal');
    await goto('/lab/cadcraft?space=paper');
    const before = await page.evaluate(() => window.cadcraft.doc.model.size);
    await page.setInputFiles('[data-file]', { name: 'old-r12.dwg', mimeType: 'application/octet-stream', buffer: Buffer.concat([Buffer.from('AC1009'), Buffer.alloc(2042)]) });
    await page.waitForTimeout(800);
    const hist = await page.textContent('[data-history]');
    ok(hist.includes('This drawing is from AutoCAD R11 / R12 (DWG AC1009)') && await page.evaluate((n) => window.cadcraft.doc.model.size === n && window.cadcraft.doc.meta.source !== 'old-r12.dwg', before), 'the history says it is R11 / R12 and how to get a DXF; no empty drawing is opened', hist.slice(-300));
  }

  ok(!problems.length, 'no console errors', problems.join(' | '));
} catch (err) {
  fail++; console.log('  FAIL ' + (err.stack || err));
} finally {
  await browser.close();
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
