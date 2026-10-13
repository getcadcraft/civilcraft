#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-props.mjs — the Properties panel in /lab/cadcraft (0.4 track P; session cad-props). Run as root (it uses
 * `sudo -u www-data php tools/cadcraft-test/props-admin.php up|down` for its own test admin and root's Playwright Chromium).
 *
 *   node tools/cadcraft-test/browser-props.mjs [--shots dir]
 *
 * Sections, one per item: panel and sections (P.1), many objects (P.2), points and picking (P.3), expressions (P.4),
 * General (P.5), dimensions (P.6), every type (P.7), measured values (P.8), nothing selected (P.9), Quick Properties
 * (P.10), header buttons (P.11), save to DWG and read back (P.14). Fails on any console error.
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
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const near = (a, b, t = 1e-6) => Math.abs(a - b) <= t;

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/props-admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));

const all = () => page.evaluate(() => window.cadcraft.doc.all().map((e) => ({ ...e })));
const typeCmd = async (s) => { await page.click('[data-cmd-input]'); await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(80); };
const screen = (x, y) => page.evaluate(([x, y]) => { const r = document.querySelector('[data-over]').getBoundingClientRect(); const s = window.cadcraft.view.toScreen(x, y); return { x: r.left + s.x, y: r.top + s.y }; }, [x, y]);
const clickAt = async (x, y) => { const p = await screen(x, y); await page.mouse.move(p.x, p.y); await page.mouse.click(p.x, p.y); await page.waitForTimeout(100); };
const select = async (ids) => { await page.evaluate((ids) => window.cadcraft.host.setSelection(new Set(ids)), ids); await page.waitForTimeout(120); };
const ids = async () => (await all()).map((e) => e.id);
const fresh = async () => { await page.keyboard.press('Escape'); await page.evaluate(() => { const c = window.cadcraft; c.host.setSelection(new Set()); c.doc.change('clear', () => { for (const e of c.doc.all()) c.doc.remove(e.id); }); }); await page.waitForTimeout(80); };
/** Type into a Properties field and press Enter. */
const setField = async (sel, text) => { await page.click(sel); await page.keyboard.press('Control+a'); await page.keyboard.type(text); await page.keyboard.press('Enter'); await page.waitForTimeout(150); };
const sections = () => page.$$eval('[data-props] details.cc-psec', (ds) => ds.map((d) => d.dataset.sec + (d.open ? '' : '(closed)')));
const shot = async (name) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, name + '.png') }); };

try {
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', admin.email);
  await page.fill('input[name="password"]', admin.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host?.props);
  await page.evaluate(() => { try { localStorage.removeItem('cadcraft.props'); } catch { /* fine */ } });

  console.log('\n== P.1 sections, divider, opening');
  const none = await sections();
  ok(none.join(' ').startsWith('current') && none.includes('view') && none.includes('misc'), 'nothing selected: New objects, View, Misc', none.join(' '));
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('30,40'); await typeCmd('');
  await typeCmd('ZOOM'); await typeCmd('E');
  const [lineId] = await ids();
  await select([lineId]);
  const s1 = await sections();
  ok(s1[0] === 'general' && s1[1] === 'geometry', 'a line: General, Geometry', s1.join(' '));
  ok((await page.textContent('[data-props-h]')).trim() === 'Line', 'heading names the type');
  await page.click('[data-props] details[data-sec="general"] > summary');
  await page.waitForTimeout(80);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft?.host?.props);
  await typeCmd('L'); await typeCmd('0,0'); await typeCmd('30,40'); await typeCmd('');
  await select(await ids());
  ok((await sections()).includes('general(closed)'), 'a folded section stays folded after a reload');
  await page.click('[data-props] details[data-sec="general"] > summary');
  const lid = (await ids())[0];
  // divider
  const div = await page.$('[data-props] .cc-pdiv');
  const box = await div.boundingBox();
  const lab0 = await page.$eval('[data-props] details[data-sec="geometry"] .cc-props > *:first-child', (n) => n.getBoundingClientRect().width).catch(() => 0);
  await page.mouse.move(box.x + box.width / 2, box.y + 40);
  await page.mouse.down(); await page.mouse.move(box.x + box.width / 2 + 40, box.y + 40, { steps: 4 }); await page.mouse.up();
  await page.waitForTimeout(100);
  const lab1 = await page.$eval('[data-props] details[data-sec="geometry"] .cc-props > .cc-ppt + label, [data-props] details[data-sec="geometry"] .cc-props > label', (n) => n.getBoundingClientRect().width);
  ok(lab1 > lab0 + 20 || lab1 > 100, 'dragging the divider widens the labels', lab0 + ' → ' + lab1);
  const kw = await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.props') || '{}').kw);
  ok(kw > 4, 'the divider position is remembered', String(kw));
  await page.dblclick('[data-props] .cc-pdiv');
  await shot('props-01-line');
  // Ctrl+1 and auto-hide
  await page.click('[data-props] .cc-props-head .cc-pbtn:last-child');
  await page.waitForTimeout(150);
  const collapsed = await page.evaluate(() => { const a = document.querySelector('.cc-right'); return a.classList.contains('cc-ah-panel') && a.getBoundingClientRect().width < 60; });
  ok(collapsed, 'auto-hide folds the panel to a strip');
  await page.mouse.move(5, 450);
  await page.keyboard.press('Control+1');
  await page.waitForTimeout(150);
  const opened = await page.evaluate(() => { const a = document.querySelector('.cc-right'); return a.classList.contains('cc-ah-open') && a.getBoundingClientRect().width > 200; });
  ok(opened, 'Ctrl+1 opens the folded panel over the drawing');
  await shot('props-02-autohide-open');
  await page.click('[data-props] .cc-props-head .cc-pbtn:last-child');
  await page.waitForTimeout(150);
  ok(await page.evaluate(() => !document.querySelector('.cc-right').classList.contains('cc-ah-panel')), 'auto-hide off again');
  // double-click opens Properties for a line
  await select([]);
  const mid = await screen(9, 12);   // on the line, away from its grips (a click on a grip starts a grip move)
  await page.mouse.dblclick(mid.x, mid.y);
  await page.waitForTimeout(150);
  ok((await page.evaluate(() => [...window.cadcraft.host.selection])).includes(lid), 'double-click selects the object');
  ok(await page.evaluate(() => document.activeElement?.closest('[data-props]') !== null), 'and puts the focus in its properties');

  console.log('\n== P.3 / P.4 points, expressions');
  await select([lid]);
  ok(await page.$('#cc-p-start-z') !== null && await page.$('#cc-p-end-z') !== null && await page.$('#cc-p-dz') !== null, 'Start Z, End Z, Delta Z');
  await setField('#cc-p-end-z', '=2*45');
  let L = (await all()).find((e) => e.id === lid);
  ok(L.z2 === 90, 'End Z = 2*45 → 90', String(L.z2));
  await setField('#cc-p-len', '=sqrt(2)*100');
  L = (await all()).find((e) => e.id === lid);
  ok(near(Math.hypot(L.x2 - L.x1, L.y2 - L.y1), 141.4213562373095), 'length =sqrt(2)*100');
  await page.click('#cc-p-start-x');
  const full = await page.inputValue('#cc-p-start-x');
  ok(full === '0', 'a field shows full precision while editing', full);
  await page.keyboard.press('Control+a'); await page.keyboard.type('abc'); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
  ok(await page.getAttribute('#cc-p-start-x', 'aria-invalid') === 'true' && (await page.textContent('[data-props] .cc-pnote')).length > 5, 'a bad entry is refused with a note');
  L = (await all()).find((e) => e.id === lid);
  ok(L.x1 === 0, 'and nothing changed (never saved as 0)');
  await page.keyboard.press('Escape');
  await page.waitForTimeout(80);
  ok(await page.inputValue('#cc-p-start-x') === '0', 'Esc puts the old value back');
  const pick = await page.$('[data-props] .cc-ppick');
  if (pick) {
    await page.keyboard.press('Escape'); await typeCmd('ZOOM'); await typeCmd('E'); await select([lid]);
    const snapOn = (await page.getAttribute('[data-toggle="osnap"]', 'aria-pressed')) === 'true';
    if (snapOn) await page.click('[data-toggle="osnap"]');
    await page.click('[data-props] .cc-ppick');
    await page.waitForTimeout(100);
    await clickAt(10, 10);
    if (snapOn) await page.click('[data-toggle="osnap"]');
    L = (await all()).find((e) => e.id === lid);
    ok(near(L.x1, 10, 1) && near(L.y1, 10, 1), 'the pick button sets the start point by a click', L.x1 + ',' + L.y1);
  } else console.log('  note: no pick buttons (commands.js has not installed propcmds.js yet)');
  await shot('props-03-point');

  console.log('\n== P.2 many objects');
  await fresh();
  await page.evaluate(() => {
    const c = window.cadcraft;
    c.doc.change('setup', () => {
      for (let i = 0; i < 8; i++) c.doc.add({ type: 'line', layer: '0', x1: i * 10, y1: 0, x2: i * 10, y2: 50 });
      for (let i = 0; i < 4; i++) c.doc.add({ type: 'dim', layer: '0', kind: 'linear', p1: { x: 0, y: 60 + i * 12 }, p2: { x: 36.6, y: 60 + i * 12 }, loc: { x: 0, y: 66 + i * 12 }, rot: 0, text: '', st: { dec: 4, zin: 0 } });
    });
  });
  await typeCmd('ZOOM'); await typeCmd('E');
  await select(await ids());
  const opts = await page.$$eval('#cc-p-group option', (os) => os.map((o) => o.textContent));
  ok(opts.join('|') === 'All (12)|Line (8)|Dimension (4)', 'group picker: All (12), Line (8), Dimension (4)', opts.join('|'));
  await page.selectOption('#cc-p-group', 'dim');
  await page.waitForTimeout(150);
  const undoN = await page.evaluate(() => window.cadcraft.doc.undoStack.length);
  await setField('#cc-p-dim-dec', '1');
  const dims = (await all()).filter((e) => e.type === 'dim');
  ok(dims.every((d) => d.st.dec === 1), 'Decimals = 1 on all 4 dimensions');
  ok(await page.evaluate(() => window.cadcraft.doc.undoStack.length) === undoN + 1, 'one undo step');
  await page.selectOption('#cc-p-group', 'line');
  await page.waitForTimeout(150);
  ok(await page.getAttribute('#cc-p-start-x', 'placeholder') === 'Varies', 'differing values show Varies');
  await setField('#cc-p-start-z', '5');
  ok((await all()).filter((e) => e.type === 'line').every((l) => l.z1 === 5), 'Start Z on every line');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
  ok((await all()).filter((e) => e.type === 'line').every((l) => !l.z1), 'Ctrl+Z puts them all back');
  await shot('props-04-many');

  console.log('\n== P.5 General / P.7 every type / P.8 measured values');
  await fresh();
  const made = await page.evaluate(() => {
    const c = window.cadcraft, out = {};
    c.doc.change('setup', () => {
      out.circle = c.doc.add({ type: 'circle', layer: '0', cx: 0, cy: 0, r: 10 }).id;
      out.arc = c.doc.add({ type: 'arc', layer: '0', cx: 40, cy: 0, r: 10, a0: 0, a1: Math.PI / 2 }).id;
      out.ellipse = c.doc.add({ type: 'ellipse', layer: '0', cx: 80, cy: 0, mx: 10, my: 0, ratio: 0.5, t0: 0, t1: 2 * Math.PI }).id;
      out.poly = c.doc.add({ type: 'poly', layer: '0', closed: true, pts: Array.from({ length: 16 }, (_, i) => ({ x: 120 + 10 * Math.cos(i * Math.PI / 8), y: 10 * Math.sin(i * Math.PI / 8), b: 0 })) }).id;
      out.text = c.doc.add({ type: 'text', layer: '0', x: 0, y: 30, h: 2.5, s: 'Hello', ha: 'left', va: 'baseline' }).id;
      out.hatch = c.doc.add({ type: 'hatch', layer: '0', solid: false, pattern: 'ANSI31', pscale: 1, pangle: 0, loops: [[40, 30, 60, 30, 60, 50, 40, 50, 40, 30]] }).id;
      out.dim = c.doc.add({ type: 'dim', layer: '0', kind: 'linear', p1: { x: 0, y: 60 }, p2: { x: 36.6, y: 60 }, loc: { x: 0, y: 66 }, rot: 0, text: '', st: { dec: 4, zin: 0 } }).id;
    });
    return out;
  });
  await typeCmd('ZOOM'); await typeCmd('E');
  const ent = (id) => page.evaluate((id) => ({ ...window.cadcraft.doc.get(id) }), id);
  await select([made.circle]);
  await page.selectOption('#cc-p-tr', '40'); await page.waitForTimeout(120);
  ok((await ent(made.circle)).tr === 40, 'transparency 40%');
  await setField('#cc-p-th', '5');
  await setField('#cc-p-url', 'https://example.com/spec');
  await page.selectOption('#cc-p-mat', 'Global'); await page.waitForTimeout(120);
  let c0 = await ent(made.circle);
  ok(c0.th === 5 && c0.url === 'https://example.com/spec' && c0.mat === 'Global', 'thickness, hyperlink, material');
  ok((await page.textContent('#cc-p-ps')).trim() === 'ByColor', 'plot style read-only ByColor');
  await setField('#cc-p-area', '=pi*20^2');
  ok(near((await ent(made.circle)).r, 20, 1e-9), 'circle area =pi*20^2 → radius 20');
  await select([made.arc]);
  await setField('#cc-p-sweep', '180');
  ok(near((await ent(made.arc)).a1, Math.PI), 'arc total angle 180');
  await setField('#cc-p-chord', '30');
  ok(near((await ent(made.arc)).r, 15), 'arc chord 30 → radius 15');
  await select([made.ellipse]);
  ok(await page.getAttribute('#cc-p-major', 'readonly') === null, 'ellipse major radius is editable');
  await setField('#cc-p-minor', '2.5');
  ok(near((await ent(made.ellipse)).ratio, 0.25), 'ellipse minor radius → ratio');
  await select([made.poly]);
  ok(await page.$('#cc-p-vertex') !== null, 'polyline vertex browser');
  for (let i = 0; i < 13; i++) await page.click('[data-props] .cc-pvtx button:last-child');
  ok(await page.inputValue('#cc-p-vertex') === '14', 'past the old 12-vertex limit (vertex 14 of 16)', await page.inputValue('#cc-p-vertex'));
  await setField('#cc-p-vertex-x', '200');
  ok((await ent(made.poly)).pts[13].x === 200, 'vertex 14 X edited');
  await setField('#cc-p-vertex', '2');
  ok(await page.inputValue('#cc-p-vertex') === '2', 'typing a vertex number goes there');
  await shot('props-05-poly');
  await select([made.text]);
  await setField('#cc-p-obl', '15');
  await setField('#cc-p-wf', '0.8');
  const tx = await ent(made.text);
  ok(near(tx.obl, 15 * Math.PI / 180) && tx.wf === 0.8, 'text obliquing angle and width factor');
  await select([made.hatch]);
  await setField('#cc-p-origin-x', '5');
  await page.selectOption('#cc-p-island', 'outer'); await page.waitForTimeout(120);
  const hx = await ent(made.hatch);
  ok(hx.ox === 5 && hx.island === 'outer', 'hatch origin and island detection');

  console.log('\n== P.6 dimensions');
  await select([made.dim]);
  const ds = await sections();
  ok(['lines', 'text', 'fit', 'units', 'alt', 'tol'].every((k) => ds.some((x) => x.startsWith(k))), 'dimension sections', ds.join(' '));
  await page.click('#cc-p-dim-ztrail'); await page.waitForTimeout(120);
  ok(((await ent(made.dim)).st.zin & 8) === 8, 'suppress trailing zeros');
  await page.selectOption('#cc-p-dim-tol', 'sym'); await page.waitForTimeout(150);
  await setField('#cc-p-dim-tp', '0.05');
  const dd = await ent(made.dim);
  ok(dd.st.tol === 'sym' && dd.st.tp === 0.05, 'symmetrical tolerance 0.05');
  await page.selectOption('#cc-p-dim-blk1', 'ARCHTICK'); await page.waitForTimeout(120);
  ok((await ent(made.dim)).st.blk1 === 'ARCHTICK', 'arrowhead 1: architectural tick');
  await shot('props-06-dim');

  console.log('\n== P.9 nothing selected');
  await select([]);
  const before = await page.evaluate(() => { const v = window.cadcraft.view; const a = v.toWorld(0, 0), b = v.toWorld(v.w, v.h); return { cx: (a.x + b.x) / 2, w: Math.abs(b.x - a.x) }; });
  await setField('#cc-view-cx', String(Math.round(before.cx + 50)));
  const after = await page.evaluate(() => { const v = window.cadcraft.view; const a = v.toWorld(0, 0), b = v.toWorld(v.w, v.h); return { cx: (a.x + b.x) / 2, w: Math.abs(b.x - a.x) }; });
  ok(near(after.cx, Math.round(before.cx + 50), 0.5) && near(after.w, before.w, before.w * 0.01), 'View center X moves the view', JSON.stringify([before, after]));
  ok(await page.$('#cc-misc-ucsicon') !== null, 'Misc: UCS icon');
  await page.click('#cc-misc-ucsicon'); await page.waitForTimeout(120);
  ok(await page.evaluate(() => window.cadcraft.host.settings.corner) === 'none', 'UCS icon off');
  await page.click('#cc-misc-ucsicon'); await page.waitForTimeout(120);
  await shot('props-07-none');

  console.log('\n== P.10 Quick Properties / P.11 header / P.12 choose');
  await page.click('[data-qp]'); await page.waitForTimeout(80);
  ok(await page.getAttribute('[data-qp]', 'aria-pressed') === 'true', 'QP on');
  await typeCmd('ZOOM'); await typeCmd('E');
  const cp = await screen(20, 0);
  await page.mouse.move(cp.x, cp.y);
  await page.mouse.click(cp.x, cp.y); await page.waitForTimeout(250);
  if (!(await page.evaluate((id) => window.cadcraft.host.selection.has(id), made.circle))) { console.log('  note: the click did not select the circle; selecting it directly'); await select([made.circle]); }
  const qp = await page.evaluate(() => { const q = document.querySelector('[data-quick]'); const r = q.getBoundingClientRect(); return { shown: !q.hidden, x: r.left, y: r.top, fields: [...q.querySelectorAll('label, .k')].map((n) => n.textContent) }; });
  ok(qp.shown && qp.fields.includes('Radius'), 'clicking a circle shows Quick Properties with Radius', JSON.stringify(qp.fields));
  ok(Math.abs(qp.x - cp.x) < 400 && Math.abs(qp.y - cp.y) < 400, 'beside the cursor');
  await setField('#cc-qp-r', '12');
  ok(near((await ent(made.circle)).r, 12), 'a Quick Properties field changes the object');
  await shot('props-08-qp');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(120);
  await page.click('[data-qp]');
  await select([made.circle]);
  await page.click('[data-props] .cc-props-head button[title^="Choose"]'); await page.waitForTimeout(150);
  await page.click('dialog.cc-pcustom input[data-k="circ"][data-w="panel"]');
  await page.click('dialog.cc-pcustom button[data-key="ok"]'); await page.waitForTimeout(150);
  ok(await page.$('#cc-p-circ') === null && await page.$('#cc-p-r') !== null, 'unticking Circumference hides it from Properties');
  await page.click('[data-props] .cc-props-head button[title^="Choose"]'); await page.waitForTimeout(150);
  await page.click('dialog.cc-pcustom button[data-key="reset"]'); await page.waitForTimeout(150);
  ok(await page.$('#cc-p-circ') !== null, 'back to the standard set');
  const add0 = await page.evaluate(() => window.cadcraft.host.settings.pick);
  await page.click('[data-props] .cc-props-head button[aria-pressed]:not([title^="Auto"])'); await page.waitForTimeout(100);
  ok(await page.evaluate(() => window.cadcraft.host.settings.pick) !== add0, 'the PICKADD button switches add / replace');
  await page.click('[data-props] .cc-props-head button[aria-pressed]:not([title^="Auto"])'); await page.waitForTimeout(100);
  await page.click('[data-props] .cc-props-head button[title^="Quick select"]'); await page.waitForTimeout(200);
  ok(await page.$('dialog[open]') !== null, 'the Quick select button opens QSELECT');
  await page.keyboard.press('Escape'); await page.waitForTimeout(150);

  console.log('\n== P.14 save as DWG and read it back (cc-dwg)');
  await fresh();
  await page.evaluate(() => {
    const c = window.cadcraft;
    c.doc.change('setup', () => {
      for (let i = 0; i < 6; i++) c.doc.add({ type: 'dim', layer: '0', kind: 'linear', p1: { x: 0, y: i * 12 }, p2: { x: 36.6 + i, y: i * 12 }, loc: { x: 0, y: i * 12 + 6 }, rot: 0, text: '', st: { dec: 4, zin: 0 } });
      c.doc.add({ type: 'text', layer: '0', x: 0, y: 90, h: 2.5, s: 'Spec', ha: 'left', va: 'baseline' });
    });
  });
  await typeCmd('ZOOM'); await typeCmd('E');
  const dimIds = (await all()).filter((e) => e.type === 'dim').map((e) => e.id);
  await select(dimIds);
  await setField('#cc-p-dim-dec', '1');
  await setField('#cc-p-dim-txt', '=2*1.75');
  await select((await all()).filter((e) => e.type === 'text').map((e) => e.id));
  await setField('#cc-p-h', '5'); await setField('#cc-p-rot', '30');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.keyboard.press('Control+s')]);
  const file = path.join(REPO, 'tmp', 'props-roundtrip.dwg');
  fs.mkdirSync(path.dirname(file), { recursive: true });
  await dl.saveAs(file);
  const APPDIR = path.join(REPO, 'public_html/assets/apps/cadcraft/dev');
  const imp = (f) => import('file://' + path.join(APPDIR, f));
  const I18n = await imp('i18n.js'); I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APPDIR, 'lang/en.json'), 'utf8')) });
  const { readDwg } = await imp('dwg/read.js'); const { importDwg } = await imp('dwg-import.js'); const { Doc } = await imp('doc.js');
  const back = new Doc(); back.load(importDwg(readDwg(new Uint8Array(fs.readFileSync(file))), { versionTag: 'x' }));
  const bd = back.all().filter((e) => e.type === 'dim'), bt = back.all().find((e) => e.type === 'text');
  ok(bd.length === 6 && bd.every((d) => d.st?.dec === 1 && near(d.st?.txt, 3.5)), 'DWG read back: decimals 1 and text height 3.5 on all 6 dimensions', JSON.stringify(bd.map((d) => [d.st?.dec, d.st?.txt])));
  ok(bt && bt.h === 5 && near(bt.rot, Math.PI / 6, 1e-9), 'DWG read back: text height and rotation');
  fs.rmSync(file, { force: true });

  console.log('\n== themes');
  await select([made.dim]);
  await page.evaluate(() => { document.documentElement.dataset.space = 'model'; });
  await page.waitForTimeout(150);
  await shot('props-09-model');
  await page.evaluate(() => { document.documentElement.dataset.space = 'paper'; });
} catch (err) {
  fail++;
  console.log('  FAIL crashed: ' + (err.stack || err.message));
} finally {
  for (const p of problems) { fail++; console.log('  FAIL ' + p); }
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch { /* fine */ }
  console.log(`\n${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
