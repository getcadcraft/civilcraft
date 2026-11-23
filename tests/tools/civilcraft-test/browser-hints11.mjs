#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-hints11.mjs — CivilCraft 0.11 PERF.21 (perf-finish-11, lane civil) in the real /lab page: the hinted undo steps of the hot edit callers.
 * Project.verifyHints is switched on in the page, so every hinted step is checked against the full look and a hint that misses a change throws
 * (a page error). Then, for a selected alignment, pad, feature line, structure and pipe, every number/text box of the Properties panel gets a new
 * value (change event), every checkbox is flipped, the grips (alignment PI, pad corner, feature vertex, structure) are dragged with the mouse,
 * and finally every step is undone: the project must come back to the state it started from.
 *   Run as root: nice -n 10 timeout 600 node tools/civilcraft-test/browser-hints11.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 400) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), cmd, 'cv11'], { encoding: 'utf8' }) || '{}');
admin('up'); const sess = admin('session');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 900 } });
  await ctx.addCookies([{ name: sess.name, value: sess.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await ctx.addInitScript(() => { try { localStorage.setItem('cc-autofocus', 'off'); localStorage.setItem('cc-hw-share', 'off'); } catch { /* */ } });
  const page = await ctx.newPage();
  const problems = [];
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text().slice(0, 300)); });
  await page.goto('https://getcadcraft.com/lab/civilcraft', { waitUntil: 'networkidle' });
  while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await page.waitForTimeout(150); }
  await page.waitForFunction(() => window.civilcraft?.project);
  // a project with one of each, and the hint check on
  const start = await page.evaluate(() => {
    const p = window.civilcraft.project; p.constructor.verifyHints = true;
    const pts = []; for (let i = 0; i < 400; i++) { const x = 1000 + (i % 20) * 10, y = 2000 + Math.floor(i / 20) * 10; pts.push({ n: String(i + 1), x, y, z: 50 + x / 100 + y / 200, d: 'GND' }); }
    p.setPoints(pts, 'hints');
    p.change('seed', (s) => {
      s.alignments.push({ id: 'a900', name: 'Road', start: 0, pis: [{ x: 1010, y: 2010, r: 0 }, { x: 1100, y: 2100, r: 40 }, { x: 1180, y: 2020, r: 0 }], pvis: [{ sta: 0, z: 55, L: 0 }, { sta: 80, z: 57, L: 30 }, { sta: 200, z: 56, L: 0 }] });
      s.pads.push({ id: 'd901', name: 'Pad', pts: [{ x: 1120, y: 2150 }, { x: 1160, y: 2150 }, { x: 1160, y: 2180 }, { x: 1120, y: 2180 }], z: 60, cut: 2, fill: 3 });
      s.features.push({ id: 'f902', name: 'Edge', pts: [{ x: 1020, y: 2150, z: 55 }, { x: 1060, y: 2170, z: 56 }, { x: 1090, y: 2160, z: 56 }], closed: false, use: 'off', daylight: false, cut: 2, fill: 3 });
      s.network = { name: 'Storm', type: 'storm', rules: { minSlope: 0.005, minCover: 3, maxSlope: 0.15, minDrop: 0.1 }, structures: [{ id: 's903', name: 'MH1', x: 1030, y: 2060, rim: null, dia: 4 }, { id: 's904', name: 'MH2', x: 1090, y: 2060, rim: null, dia: 4 }], pipes: [{ id: 'p905', name: 'P1', from: 's903', to: 's904', dia: 1.5 }] };
    });
    p.undoStack = []; p.redoStack = [];
    window.civilcraft.setTool('select'); window.civilcraft.command('fit');
    return JSON.stringify(p.toJSON().alignments) + JSON.stringify(p.toJSON().pads) + JSON.stringify(p.toJSON().features) + JSON.stringify(p.toJSON().network);
  });
  const fileNow = () => page.evaluate(() => { const j = window.civilcraft.project.toJSON(); return JSON.stringify(j.alignments) + JSON.stringify(j.pads) + JSON.stringify(j.features) + JSON.stringify(j.network); });
  const depth = () => page.evaluate(() => window.civilcraft.project.undoStack.length);
  const fillProps = async (kind, id, max = 40) => {
    await page.evaluate(([kind, id]) => window.civilcraft.select({ kind, id }), [kind, id]);
    await page.waitForTimeout(150);
    let edits = 0;
    for (let i = 0; i < max; i++) {
      const did = await page.evaluate(([i]) => {
        const box = [...document.querySelectorAll('[data-props] input:not([type=checkbox]):not([type=radio]):not([type=file])')].filter((x) => !x.disabled && !x.readOnly)[i];   // folded sections too
        if (!box) return null;
        const v = box.value.trim(), n = Number(v.replace(/[^0-9.+-]/g, ''));
        box.value = v !== '' && Number.isFinite(n) && /\d/.test(v) && !/\+/.test(v) ? String(+(n + 1.25).toFixed(3)) : /\+/.test(v) ? v : (v || 'Name') + ' x';
        box.dispatchEvent(new Event('change', { bubbles: true }));
        return box.getAttribute('aria-label') || box.id || '?';
      }, [i]);
      if (did === null) break;
      edits++;
      await page.waitForTimeout(30);
    }
    const checks = await page.evaluate(() => { let n = 0; for (const c of [...document.querySelectorAll('[data-props] input[type=checkbox]')].filter((x) => !x.disabled).slice(0, 6)) { c.click(); n++; } return n; });
    return edits + checks;
  };
  const d0 = await depth();
  const counts = {};
  for (const [kind, id] of [['alignment', 'a900'], ['pad', 'd901'], ['feature', 'f902'], ['structure', 's903'], ['pipe', 'p905']]) {
    const before = await depth();
    counts[kind] = { tried: await fillProps(kind, id) };
    counts[kind].steps = (await depth()) - before;
    if (!counts[kind].tried) counts[kind].why = await page.evaluate(() => ({ h: document.querySelector('[data-props-h]')?.textContent, sel: window.civilcraft.sel, n: [...document.querySelectorAll('[data-props] input')].map((x) => x.className + '|' + x.type + '|' + x.disabled + '|' + x.readOnly).join(' '), act: document.activeElement?.outerHTML?.slice(0, 80) }));
  }
  ok(Object.values(counts).every((c) => c.tried > 0 && c.steps > 0), 'Properties edits made undo steps for each kind', counts);
  // grips: alignment PI 2, pad corner 1, feature vertex 2, structure MH2
  const drag = async (kind, id, get) => {
    await page.evaluate(([kind, id]) => window.civilcraft.select({ kind, id }), [kind, id]);
    await page.waitForTimeout(150);
    const w = await page.evaluate(get);
    const s = await page.evaluate(([x, y]) => window.civilcraft.toScreen(x, y), [w.x, w.y]);
    const before = await depth();
    await page.mouse.move(s.x, s.y); await page.mouse.down(); await page.mouse.move(s.x + 12, s.y + 9, { steps: 4 }); await page.mouse.up();
    await page.waitForTimeout(150);
    const after = await page.evaluate(get);
    return { steps: (await depth()) - before, moved: Math.hypot(after.x - w.x, after.y - w.y) > 0.01 };
  };
  const g = {
    pi: await drag('alignment', 'a900', () => window.civilcraft.project.state.alignments.find((a) => a.id === 'a900').pis[1]),
    corner: await drag('pad', 'd901', () => window.civilcraft.project.state.pads.find((a) => a.id === 'd901').pts[2]),
    vertex: await drag('feature', 'f902', () => window.civilcraft.project.state.features.find((a) => a.id === 'f902').pts[1]),
    structure: await drag('structure', 's904', () => window.civilcraft.project.state.network.structures.find((a) => a.id === 's904')),
  };
  ok(Object.values(g).every((x) => x.steps === 1 && x.moved), 'each grip drag is one hinted undo step and moved its vertex', g);
  const hintErr = problems.filter((p) => /hint missed/.test(p));
  ok(hintErr.length === 0, 'no hint missed a change (Project.verifyHints on for every step above)', hintErr);
  const total = (await depth()) - d0;
  await page.evaluate(() => { const p = window.civilcraft.project; while (p.undoStack.length) p.undo(); });
  ok(await fileNow() === start, 'undoing all ' + total + ' steps puts the alignment, pad, feature and network back as they were');
  await page.evaluate(() => { const p = window.civilcraft.project; while (p.redoStack.length) p.redo(); });
  ok(await depth() === total, 'and every step redoes');
  ok(problems.length === 0, 'no page errors', problems);
} finally { await browser.close(); admin('down'); }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
