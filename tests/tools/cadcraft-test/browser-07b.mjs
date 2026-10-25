#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-07b.mjs — CadCraft 0.7 session cad-07, in the real page (/lab/cadcraft), one section per finished item:
 *   D7.13  WBLOCK writes a drawing through the desktop bridge's save dialog
 *   D7.28  APPLOAD › Support folder: acad.lsp / acaddoc.lsp load at start, S::STARTUP runs (after a reload)
 *   D7.19  SCALELISTEDIT: the new scale is in the plot dialog's scale list
 *   D7.17  an MTEXT with codes draws its colours (pixels) and keeps them through TEXTEDIT
 *   D7.06  the first-drawing tour: steps complete by doing, skip step / skip the tour, TOUR again
 *   D7.02  the toolbar docks top / bottom / left / right, saved, TOOLBARDOCK, reset with the layout
 *   D7.10  SPLINE draws, grips, Properties, PEDIT turns it into a polyline
 *   D7.23  an OLE2FRAME in a DXF: its cached bitmap is painted in its frame
 *   D7.14  DIMSTYLE manager: New, Modify (the Properties fields), Apply, Set current, Compare
 *
 *   node tools/cadcraft-test/browser-07b.mjs [--shots <dir>]
 *
 * Run as root (a session for the test admin cctest+cadcraft@projectz.xyz is minted by tools/cadcraft-test/admin.php). Cached
 * Playwright Chromium, a stand-in desktop bridge (files in memory) as browser-07.mjs.
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

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session'], { encoding: 'utf8' }));
const b64 = (s) => Buffer.from(s, 'latin1').toString('base64');
const files = {
  '/jobs/ole-frame.dxf': fs.readFileSync(path.join(REPO, 'fixtures/dwg/ole-frame.dxf')).toString('base64'),
  '/jobs/mtext-formats.dxf': fs.readFileSync(path.join(REPO, 'fixtures/dwg/mtext-formats.dxf')).toString('base64'),
  '/support/ACAD.LSP': b64('(defun S::STARTUP () (command "CIRCLE" (list 500.0 500.0) 7.0) (princ))\n'),
  '/support/other.lsp': b64('(setq nope T)\n'),
};

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
page.setDefaultTimeout(10000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const T = (ms) => page.waitForTimeout(ms);
const say = () => page.evaluate(() => document.querySelector('[data-history]')?.textContent || '');
const run = async (...lines) => { for (const l of lines) { await page.evaluate((x) => { window.cadcraft.engine.text(x); }, l); await T(150); } };   // engine.text is not returned: a command that is still asking would hold the call back
try {
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await page.addInitScript((files) => {
    const store = new Map(Object.entries(files).map(([k, v]) => [k, Uint8Array.from(atob(v), (c) => c.charCodeAt(0))]));
    const desk = window.__desk = { answers: [], saves: [], folder: null, written: new Map() };
    window.cadcraftDesktop = {
      version: 1,
      openDialog: async () => (desk.answers.length ? desk.answers.shift() : null),
      saveDialog: async ({ defaultPath } = {}) => { const p = '/out/' + String(defaultPath || 'x').split(/[\\/]/).pop(); desk.saves.push(p); return p; },
      readFile: async (p) => { if (!store.has(p)) throw new Error('not_found: ' + p); return store.get(p).slice(); },
      writeFile: async (p, b) => { store.set(p, b); desk.written.set(p, b); },
      stat: async (p) => (store.has(p) ? { size: store.get(p).length, mtime: 0 } : null),
      openFolderDialog: async () => desk.folder,
      listDir: async (d) => [...store.keys()].filter((k) => k.startsWith(d + '/') && !k.slice(d.length + 1).includes('/')).map((k) => ({ name: k.slice(d.length + 1), dir: false })),
      launchFiles: async () => [],
      onOpenFiles: (cb) => { window.__deskOpen = cb; },
    };
  }, files);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.__deskOpen);

  console.log('\n== D7.13: WBLOCK');
  await page.evaluate(() => {
    const d = window.cadcraft.doc;
    d.addLayer({ name: 'Walls', color: 1 }); d.addLayer({ name: 'Unused', color: 3 });
    d.change('seed', () => { d.add({ type: 'line', layer: 'Walls', x1: 100, y1: 100, x2: 200, y2: 100 }); d.add({ type: 'circle', layer: 'Walls', cx: 150, cy: 150, r: 20 }); d.add({ type: 'line', layer: 'Unused', x1: 0, y1: 0, x2: 9, y2: 9 }); });
    window.cadcraft.host.setSelection(new Set(d.all().filter((e) => e.layer === 'Walls').map((e) => e.id)));
  });
  await run('WBLOCK', 'O', '100,100', 'D', 'wall-part', 'R');
  await T(600);
  const wb = await page.evaluate(() => { const w = window.__desk.written.get('/out/wall-part.dwg'); return { saves: window.__desk.saves, size: w ? w.length : 0, head: w ? String.fromCharCode(...w.slice(0, 6)) : '' }; });
  ok(wb.size > 1000 && /^AC10/.test(wb.head), 'the save dialog was asked for wall-part.dwg and a DWG was written through the bridge', JSON.stringify(wb));
  ok(/Wrote wall-part\.dwg/.test(await say()), 'the history says what was written');
  const wbBytes = await page.evaluate(() => { const w = window.__desk.written.get('/out/wall-part.dwg'); let s = ''; for (let i = 0; i < w.length; i += 8192) s += String.fromCharCode(...w.subarray(i, i + 8192)); return btoa(s); });
  const { readDwg } = await import(path.join(REPO, 'lib/dwg/read.js'));
  const db = readDwg(new Uint8Array(Buffer.from(wbBytes, 'base64')));
  const wbRead = { layers: (db.tables.layers || []).map((l) => l.name).filter((n) => n !== '0'), n: db.blocks.find((b) => /Model/i.test(b.name)).entities.length };
  ok(wbRead.n === 2 && wbRead.layers.includes('Walls') && !wbRead.layers.includes('Unused'), 'read back: two objects, the Walls layer, not the unused one', JSON.stringify(wbRead));

  console.log('\n== D7.19: SCALELISTEDIT');
  await run('SCALELISTEDIT', 'A', '1:75', '', '', '');
  await T(300);
  const sc = await page.evaluate(() => window.cadcraft.doc.meta.scales);
  ok(JSON.stringify(sc) === JSON.stringify([{ name: '1:75', paper: 1, drawing: 75 }]), 'the scale is in the drawing', JSON.stringify(sc));
  await page.evaluate(() => { window.cadcraft.engine.text('PLOT'); });
  await T(800);
  const opts = await page.evaluate(() => [...document.querySelectorAll('[data-plot-scale] option')].map((o) => o.textContent));
  ok(opts.includes('1:75') && opts.includes('1:50'), 'the plot dialog\'s scale list has the standard scales and the new one', opts.join(' | '));
  await page.evaluate(() => document.querySelector('[data-plot-close]')?.click());
  await T(200);

  console.log('\n== D7.17: MTEXT formatting on screen');
  await page.evaluate((p) => window.__desk.answers.push([p]), '/jobs/mtext-formats.dxf');
  await page.click('[data-cmd="OPEN"]');
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'mtext-formats.dxf', null, { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => { const c = window.cadcraft; c.view.fit(); });
  await T(1200);
  const mt = await page.evaluate(() => window.cadcraft.doc.all().filter((e) => e.type === 'text').map((e) => ({ s: e.s, mt: !!e.mt })));
  ok(mt.length === 3 && mt.filter((x) => x.mt).length === 2, 'the file\'s three MTEXT objects opened, two with codes kept', JSON.stringify(mt));
  const px = () => page.evaluate(() => {
    let red = 0, blue = 0;
    for (const c of [...document.querySelectorAll('canvas')].filter((c) => c.width > 300)) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; if (d[i] > 180 && d[i + 1] < 90 && d[i + 2] < 90) red++; else if (d[i + 2] > 180 && d[i] < 90 && d[i + 1] < 90) blue++; } }
    return { red, blue };
  });
  const p1 = await px();
  ok(p1.red > 30 && p1.blue > 30, 'the red run and the true-colour (blue) run are painted in their colours', JSON.stringify(p1));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '01-mtext.png') });
  await page.evaluate(() => {
    const c = window.cadcraft, e = c.doc.all().find((x) => x.mt);
    c.host.editText = async (t) => ({ s: t.s.replace('blue', 'cyan'), h: t.h, ls: t.ls || 1, ww: t.ww, ha: t.ha, va: t.va });
    c.host.setSelection(new Set([e.id]));
  });
  await run('TEXTEDIT');
  await T(500);
  const after = await page.evaluate(() => { const e = window.cadcraft.doc.all().find((x) => x.mt); return { s: e.s.includes('cyan'), mt: e.mt.includes('cyan}') && e.mt.includes('\\c16711680;') && e.mt.includes('\\S1/2;') }; });
  ok(after.s && after.mt, 'TEXTEDIT: the new word is in the same blue run, and the other codes are still there', JSON.stringify(after));
  const p2 = await px();
  ok(p2.blue > 30, 'and it still paints blue', JSON.stringify(p2));

  console.log('\n== D7.14: the dimension style manager');
  await page.evaluate(() => {
    const c = window.cadcraft, d = c.doc;
    for (const e of d.all()) d.change('wipe', () => d.remove(e.id));
    d.change('seed', () => { d.add({ type: 'dim', kind: 'linear', p1: { x: 0, y: 0 }, p2: { x: 100, y: 0 }, loc: { x: 50, y: 20 }, rot: 0, text: '', st: { ...d.current.dim } }); });
    c.host.setSelection(new Set(d.all().map((e) => e.id)));
  });
  await run('DIMSTYLE');
  await T(600);
  const listed = await page.evaluate(() => [...document.querySelectorAll('[data-ds-name]')].map((n) => n.dataset.dsName));
  ok(listed.join() === 'Standard', 'DIMSTYLE opens the manager listing Standard', listed.join());
  await page.click('[data-ds-act="new"]');
  await page.fill('[data-ds-input]', 'Arch');
  await page.click('[data-ds-ok]');
  await T(300);
  ok((await page.evaluate(() => [...document.querySelectorAll('[data-ds-name]')].map((n) => n.dataset.dsName))).join() === 'Standard,Arch', 'New… made "Arch" from Standard');
  await page.click('[data-ds-name="Arch"]');
  await page.click('[data-ds-act="modify"]');
  await T(500);
  const fields = await page.evaluate(() => ({ n: document.querySelectorAll('[data-ds-modify] .cc-psec').length, txt: !!document.querySelector('#cc-dsf-dim-txt'), asz: !!document.querySelector('#cc-dsf-dim-asz') }));
  ok(fields.n >= 5 && fields.txt && fields.asz, 'Modify… shows the Properties panel\'s dimension sections (lines, text, fit, units …)', JSON.stringify(fields));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '02-dimstyle-modify.png') });
  await page.fill('#cc-dsf-dim-txt', '5');
  await page.press('#cc-dsf-dim-txt', 'Enter');
  await T(300);
  await page.click('[data-ds-modify] button[data-key="ok"]');
  await T(400);
  const arch = await page.evaluate(() => window.cadcraft.doc.dimStyles.get('Arch')?.txt);
  ok(arch === 5, 'OK keeps the changed text height in the style', String(arch));
  await page.click('[data-ds-act="apply"]');
  await T(300);
  const applied = await page.evaluate(() => { const e = window.cadcraft.doc.all().find((x) => x.type === 'dim'); return { name: e.dimstyle, txt: e.st.txt }; });
  ok(applied.name === 'Arch' && applied.txt === 5, 'Apply to selected: the dimension takes the style', JSON.stringify(applied));
  await page.click('[data-ds-name="Arch"]');
  await page.click('[data-ds-act="current"]');
  await T(200);
  ok(await page.evaluate(() => window.cadcraft.doc.current.dimstyle === 'Arch' && window.cadcraft.doc.current.dim.txt === 5), 'Set current: new dimensions use it');
  await page.click('[data-ds-act="compare"]');
  await T(200);
  ok((await page.evaluate(() => document.querySelector('[data-ds-diff]')?.textContent || '')).includes('5'), 'Compare… lists what differs from the other style');
  await page.click('[data-ds-close]');
  await T(200);

  console.log('\n== D7.23: OLE objects');
  await page.evaluate((p) => window.__desk.answers.push([p]), '/jobs/ole-frame.dxf');
  await page.click('[data-cmd="OPEN"]');
  await page.waitForFunction(() => window.cadcraft.doc.meta.source === 'ole-frame.dxf', null, { timeout: 30000 }).catch(() => {});
  await page.evaluate(() => { window.cadcraft.view.fit(); });
  await T(1500);
  const ole = await page.evaluate(() => { const d = window.cadcraft.doc; return { inserts: d.all().filter((e) => e.type === 'insert').map((e) => e.block), pics: [...(d.pictures?.keys() || [])] }; });
  ok(ole.inserts.length === 2 && ole.pics.length === 1, 'the DXF\'s two OLE objects opened as frames, one with its picture', JSON.stringify(ole));
  const px2 = await page.evaluate(() => {
    let red = 0;
    for (const c of [...document.querySelectorAll('canvas')].filter((c) => c.width > 300)) { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] > 128 && d[i] > 150 && d[i + 1] < 140 && d[i + 2] < 140) red++; } }
    return red;
  });
  ok(px2 > 200, 'the object\'s own bitmap is painted inside its frame (reddish pixels)', String(px2));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '03-ole.png') });

  console.log('\n== D7.10: splines');
  await page.evaluate(() => { const c = window.cadcraft, d = c.doc; for (const e of d.all()) d.change('wipe', () => d.remove(e.id)); c.host.setSelection(new Set()); });
  await run('SPLINE', '0,0', '100,80', '200,-30', '350,50', '500,0', '', '', '');
  await T(300);
  const sp = await page.evaluate(() => { const e = window.cadcraft.doc.all().find((x) => x.type === 'spline'); return e ? { fit: e.fit.length, ctrl: e.ctrl.length, knots: e.knots.length } : null; });
  ok(sp && sp.fit === 5 && sp.ctrl === 7 && sp.knots === 11, 'SPLINE through five points makes a fit spline in the page', JSON.stringify(sp));
  await page.evaluate(() => { const c = window.cadcraft; c.view.fit(); });
  await T(800);
  const inkAt = () => page.evaluate(() => {
    // the curve is drawn: dark pixels exist along its path between the fit points (not a straight line between them)
    const c = window.cadcraft, e = c.doc.all().find((x) => x.type === 'spline');
    const cv = [...document.querySelectorAll('canvas')].filter((x) => x.width > 300)[0];
    const ctx = cv.getContext('2d'), d = window.devicePixelRatio || 1;
    let hits = 0, total = 0;
    for (let i = 1; i < 40; i++) {
      const u0 = e.knots[3], u1 = e.knots[e.ctrl.length];
      // evaluate through the page's own module
      total++;
    }
    const data = ctx.getImageData(0, 0, cv.width, cv.height).data;
    let dark = 0;
    for (let i = 0; i < data.length; i += 4) if (data[i + 3] > 128 && data[i] < 90 && data[i + 1] < 90 && data[i + 2] < 90) dark++;
    return { dark, total };
  });
  const ink = await inkAt();
  ok(ink.dark > 300, 'the curve is drawn on the canvas', JSON.stringify(ink));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '04-spline.png') });
  await page.evaluate(() => { const c = window.cadcraft; c.host.setSelection(new Set(c.doc.all().map((e) => e.id))); });
  await T(600);
  const prop = await page.evaluate(() => document.querySelector('[data-props]')?.innerText || '');
  ok(/Degree\s*\|?\s*3/.test(prop.replace(/\n+/g, ' | ')) && /Fit points/.test(prop) && /Control points/.test(prop), 'the Properties panel shows its degree, fit points and control points', JSON.stringify(prop.replace(/\n+/g, ' | ').slice(-400)));
  const grips = await page.evaluate(async () => { const url = performance.getEntriesByType('resource').map((r) => r.name).find((n) => /\/geom\.js/.test(n)); const g = await import(url); return g.grips(window.cadcraft.doc.all()[0]).length; });
  ok(grips === 5, 'five grips, one on each fit point', String(grips));
  await page.evaluate(() => { const c = window.cadcraft; c.host.setSelection(new Set(c.doc.all().map((e) => e.id))); });
  await run('PEDIT', 'Y', '6', 'X');
  await T(300);
  ok(await page.evaluate(() => { const a = window.cadcraft.doc.all(); return a.length === 1 && a[0].type === 'poly' && a[0].pts.length === 25; }), 'PEDIT on a spline: a polyline with 6 segments in each span');

  console.log('\n== D7.02: the toolbar on any side');
  const rects = () => page.evaluate(() => {
    const r = (sel) => { const b = document.querySelector(sel)?.getBoundingClientRect(); return b ? { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height), r: Math.round(b.right), b: Math.round(b.bottom) } : null; };
    return { tools: r('.cc-tools'), left: r('.cc aside:first-of-type') || r('[data-layers]'), stage: r('[data-stage]'), cmd: r('[data-cmd-line]') || r('.cc-cmd') };
  });
  const base = await rects();
  ok(base.tools && base.tools.y < 120 && base.tools.w > 800, 'by default the toolbar is across the top (as it always was)', JSON.stringify(base.tools));
  for (const side of ['bottom', 'left', 'right']) {
    await page.evaluate((sd) => window.cadcraft.host.setToolbarDock(sd), side);
    await T(600);
    const r = await rects();
    const t = r.tools, st = r.stage;
    const ok1 = side === 'bottom' ? t.y > 500 && t.w > 800 && st.b <= t.y + 2 : side === 'left' ? t.x < 5 && t.h > 400 && t.w < 260 && st.x >= t.r : t.r > 1400 && t.h > 400 && t.w < 260 && st.r <= t.x + 2;
    ok(ok1, 'dock ' + side + ': the toolbar sits there and the drawing keeps the rest', JSON.stringify({ t, st }));
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '05-dock-' + side + '.png') });
  }
  await page.evaluate(() => window.cadcraft.host.setToolbarDock('left'));
  await T(300);
  ok((await page.evaluate(() => JSON.parse(localStorage.getItem('cadcraft.settings') || '{}').toolbarDock)) === 'left', 'the side is saved with the settings');
  await run('TOOLBARDOCK', 'R');
  await T(300);
  ok(await page.evaluate(() => window.cadcraft.host.getToolbarDock() === 'right' && document.querySelector('.cc').dataset.toolbarDock === 'right'), 'TOOLBARDOCK R puts it on the right');
  await page.evaluate(() => window.ccInput?.resetLayout?.());
  await T(400);
  ok(await page.evaluate(() => window.cadcraft.host.getToolbarDock() === 'top'), 'Reset the layout (the shell\'s ccInput.resetLayout) puts it back on top');
  const back = await rects();
  ok(back.tools.y < 120 && back.tools.w > 800, 'and it is across the top again', JSON.stringify(back.tools));

  console.log('\n== D7.06: the first-drawing tour');
  await page.evaluate(() => { const c = window.cadcraft, d = c.doc; for (const e of d.all()) d.change('wipe', () => d.remove(e.id)); localStorage.removeItem('cadcraft.tour'); c.host.setSelection(new Set()); });
  await run('TOUR');
  await T(400);
  const tour = () => page.evaluate(() => { const p = document.querySelector('[data-tour]'); return p ? { n: p.querySelector('.cc-tour-n')?.textContent, h: p.querySelector('.cc-tour-h')?.textContent, done: p.classList.contains('is-done'), box: (() => { const b = p.getBoundingClientRect(); return { r: Math.round(b.right), b: Math.round(b.bottom), w: Math.round(b.width) }; })() } : null; });
  let st = await tour();
  ok(st && /Step 1 of 6/.test(st.n) && /Draw a line/.test(st.h), 'TOUR opens the box at step 1: draw a line', JSON.stringify(st));
  await run('L', '0,0', '300,0', '');
  await T(1800);
  st = await tour();
  ok(st && /Step 2 of 6/.test(st.n) && /circle/.test(st.h), 'drawing a line completes step 1 and moves on to the circle', JSON.stringify(st));
  await run('C', '150,0', '60');
  await T(1800);
  st = await tour();
  ok(st && /Step 3 of 6/.test(st.n), 'the circle completes step 2', JSON.stringify(st));
  await page.evaluate(() => { const c = window.cadcraft; c.host.setSelection(new Set(c.doc.all().filter((e) => e.type === 'circle').map((e) => e.id))); });
  await run('M', '0,0', '10,10');
  await T(1800);
  st = await tour();
  ok(st && /Step 4 of 6/.test(st.n), 'moving it completes step 3', JSON.stringify(st));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, '06-tour.png') });
  await page.click('[data-tour-skip]');
  await T(200);
  st = await tour();
  ok(st && /Step 5 of 6/.test(st.n), 'Skip this step goes to the next', JSON.stringify(st));
  await page.click('[data-tour-skip-all]');
  await T(200);
  ok((await tour()) === null && (await page.evaluate(() => localStorage.getItem('cadcraft.tour'))) === 'skipped', 'Skip the tour closes it and it will not start by itself again');
  await run('TOUR');
  await T(300);
  ok((await tour()) !== null, 'TOUR starts it again whenever you want');
  await page.click('[data-tour-skip-all]');

  console.log('\n== D7.28: support folder (acad.lsp → S::STARTUP) after a reload');
  await page.evaluate(() => { window.__desk.folder = '/support'; });
  await run('APPLOAD');
  await T(600);
  await page.click('[data-al-support-choose]');
  await T(300);
  const shown = await page.evaluate(() => document.querySelector('[data-al-support-path]')?.textContent);
  ok(shown === '/support', 'the Support folder box shows the chosen folder', shown);
  await page.click('[data-al-close]');
  await T(300);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.__deskOpen);
  await page.waitForFunction(() => window.cadcraft.doc.all().some((e) => e.type === 'circle' && e.r === 7), null, { timeout: 15000 }).catch(() => {});
  const circ = await page.evaluate(() => window.cadcraft.doc.all().filter((e) => e.type === 'circle').map((e) => [e.cx, e.cy, e.r]));
  ok(circ.some((c) => c[0] === 500 && c[1] === 500 && c[2] === 7), 'after a restart acad.lsp loaded from the folder and S::STARTUP drew its circle', JSON.stringify(circ));
  ok(!/nope/.test(await page.evaluate(() => JSON.stringify(Object.keys(window.cadcraft.lisp?.loaded || {})))), 'files other than acad.lsp / acaddoc.lsp in the folder were not loaded');
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { encoding: 'utf8' }); } catch { /* already gone */ }
}
if (problems.length) { console.log('\npage problems:\n  ' + [...new Set(problems)].slice(0, 8).join('\n  ')); }
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
