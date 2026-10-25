#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-outliner.mjs — dragging rows in ModelCraft's Outliner (0.6.1 FIX-061-OUTLINER, tangentsoft on Discord 2026-10-19:
 * in Studio 0.6 on macOS a drag showed the green + and the drop did nothing). The Outliner drags with pointer events now, so a
 * desktop web view's own file-drop handling can't swallow it. In Chromium and WebKit (Playwright's builds), with the real
 * mouse: a row dropped on another row's top edge goes before it, on its bottom edge after it (the order); on a group's middle
 * goes inside it; on a row's edge inside a group goes into that group at that place; on the Outliner heading goes to the top
 * level, last; each drop is one undo step (Ctrl+Z takes back exactly that) and nothing moves in the world; Esc during a drag
 * drops nothing; the click that ends a drag selects nothing else; rows are not HTML-draggable; no console errors.
 * Chromium also: a finger held on a row then moved drags it; a finger moved at once only scrolls (nothing moves).
 *
 *   node tools/modelcraft-test/browser-outliner.mjs [--browsers chromium,webkit] [--out <dir>] [--keep-admin]
 * Run as root (ModelCraft's test admin via tools/modelcraft-test/admin.php). Shots in tmp/shots/outliner. Real macOS WebKit
 * (Safari, Studio's WKWebView) is not on this box: Playwright's WebKit is the Linux port of the same engine.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/outliner')));
const STATE = path.join(REPO, 'tmp/render-browser-state.json');   // the same signed-in state as browser-render.mjs / browser-anim.mjs
const KEEP_ADMIN = process.argv.includes('--keep-admin');
const BROWSERS = arg('--browsers', 'chromium,webkit').split(',').filter(Boolean);
fs.mkdirSync(OUT, { recursive: true });

const pw = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const newest = (re) => fs.readdirSync(cacheDir).filter((d) => re.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const chromeExe = (() => { const b = newest(/^chromium-\d+$/); return b && ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, b, s)).find((p) => fs.existsSync(p)); })();
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');

let pass = 0, fail = 0;
const ok = (c, what, detail = '') => { if (c) { pass++; console.log('  ok    ' + what + (detail ? ' (' + detail + ')' : '')); } else { fail++; console.log('  FAIL  ' + what + (detail ? ' — ' + detail : '')); } };

/** Signed-in cookies, from the shared state file when it still opens the lab, else a fresh sign-in (in Chromium). */
async function storage() {
  const chromium = await pw.chromium.launch({ executablePath: chromeExe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
  try {
    if (fs.existsSync(STATE)) {
      const c = await chromium.newContext({ storageState: STATE });
      const p = await c.newPage();
      const r = await p.goto(BASE + '/lab/modelcraft', { waitUntil: 'domcontentloaded' });
      const good = r && r.status() === 200 && p.url().includes('/lab/modelcraft');
      await c.close();
      if (good) return JSON.parse(fs.readFileSync(STATE, 'utf8'));
    }
    const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
    const c = await chromium.newContext();
    const p = await c.newPage();
    await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
    await p.fill('input[name="email"]', admin.email);
    await p.fill('input[name="password"]', admin.password);
    await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
    await c.storageState({ path: STATE });
    fs.chmodSync(STATE, 0o600);
    return JSON.parse(fs.readFileSync(STATE, 'utf8'));
  } finally { await chromium.close(); }
}

/** Four groups A, B, C, Box side by side; the Outliner drawn. */
const build = (page) => page.evaluate(async () => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const M = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))[1]);
  const mc = window.modelcraft;
  for (const [x, nm] of [[0, 'A'], [3, 'B'], [6, 'C'], [9, 'Box']]) mc.model.change('b', (m) => {
    M.addPolygon(m.root, [[x, 0, 0], [x + 1, 0, 0], [x + 1, 1, 0], [x, 1, 0]], [0, 0, 1]); M.pushPull(m.root, [...m.root.faces.keys()].at(-1), 1);
    const id = m.makeGroup(m.root, [...m.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'group'); m.def(m.root.insts.get(id).def).name = nm;
  });
  mc.host.setSel([]);
  mc.view.invalidate();
});
/** The tree as text: "A,B,[C,D],E" (a group's rows in brackets after it); steps on the undo stack; world x of each group. */
const state = (page) => page.evaluate(() => {
  const mc = window.modelcraft, m = mc.model;
  const txt = (def) => [...def.insts.values()].map((i) => { const d = m.def(i.def); return d.name + (d.insts.size ? '[' + txt(d) + ']' : ''); }).join(',');
  const xs = {};
  const walk = (def, wm) => { for (const i of def.insts.values()) { const d = m.def(i.def); const w = mul(wm, i.m); const bb = m.bbox(d, w); xs[d.name] = Math.round(bb.min[0] * 1000) / 1000; walk(d, w); } };
  const mul = (a, b) => { const r = new Array(16).fill(0); for (let c = 0; c < 4; c++) for (let rr = 0; rr < 4; rr++) for (let k = 0; k < 4; k++) r[c * 4 + rr] += a[k * 4 + rr] * b[c * 4 + k]; return r; };
  walk(m.root, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  const sel = mc.host.sel.filter((s) => s.t === 'i').map((s) => { const c = m.context(mc.host.path); const i = c?.def.insts.get(s.id); return i ? m.def(i.def).name : '?'; });
  return { tree: txt(m.root), steps: m.undoStack.length, xs, sel: sel.join(), dom: [...document.querySelectorAll('[data-tree] .mc-node .nm')].map((x) => x.textContent).join(',') };
});
/** The box of the row named `name` (the n-th one with that name). */
const rowBox = async (page, name) => page.evaluate((nm) => {
  const b = [...document.querySelectorAll('[data-tree] .mc-node')].find((x) => x.querySelector('.nm')?.textContent === nm);
  if (!b) return null;
  b.scrollIntoView({ block: 'nearest' });
  const r = b.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top, h: r.height };
}, name);
/** Press on row `from`, move in steps, release at `at` of row `to` (0 = its top edge … 1 = bottom), or on the heading. */
async function drag(page, from, to, at = 0.5, { esc = false } = {}) {
  const a = await rowBox(page, from);
  const b = to === 'heading'
    ? await page.evaluate(() => { const r = document.querySelector('[data-tree-top]').getBoundingClientRect(); return { x: r.left + r.width / 3, y: r.top, h: r.height }; })
    : await rowBox(page, to);
  if (!a || !b) return false;
  await page.mouse.move(a.x, a.y + a.h / 2);
  await page.mouse.down();
  const ty = b.y + b.h * at;
  for (let i = 1; i <= 8; i++) await page.mouse.move(a.x + (b.x - a.x) * i / 8, a.y + a.h / 2 + (ty - a.y - a.h / 2) * i / 8);
  if (esc) await page.keyboard.press('Escape');
  await page.mouse.up();
  await page.waitForTimeout(150);
  return true;
}
const undo = async (page) => { await page.keyboard.press('Control+z'); await page.waitForTimeout(150); };

for (const name of BROWSERS) {
  console.log(`\n== ${name}`);
  const engine = pw[name];
  let browser;
  try {
    browser = await engine.launch(name === 'chromium'
      ? { executablePath: chromeExe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }
      : {});
  } catch (e) { ok(false, `${name} starts`, e.message.split('\n')[0]); continue; }
  const ctx = await browser.newContext({ storageState: await storage(), viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  try {
    await page.goto(BASE + '/lab/modelcraft', { waitUntil: 'load' });
    await page.waitForFunction(() => window.modelcraft && window.modelcraft.model, null, { timeout: 60000 });
    await build(page);
    await page.waitForTimeout(200);
    let s = await state(page);
    ok(s.tree === 'A,B,C,Box' && s.dom === 'A,B,C,Box', 'four groups in the Outliner', s.dom);
    ok(await page.evaluate(() => [...document.querySelectorAll('[data-tree] .mc-node')].every((b) => !b.draggable)), 'rows are not HTML-draggable (no native drag a web view could swallow)');
    const x0 = s.xs;

    // the order: C onto A's top edge → first
    let st0 = s.steps;
    await drag(page, 'C', 'A', 0.12);
    s = await state(page);
    ok(s.tree === 'C,A,B,Box' && s.dom === 'C,A,B,Box' && s.steps === st0 + 1, "C dropped on A's top edge goes first: one undo step", `${s.tree}, ${s.steps - st0} step(s)`);
    ok(Object.keys(x0).every((k) => s.xs[k] === x0[k]), 'changing the order moves nothing in the world', JSON.stringify(s.xs));
    ok(s.sel === 'C', `the moved row is selected (${s.sel})`);
    // C onto B's bottom edge → after B
    await drag(page, 'C', 'B', 0.88);
    s = await state(page);
    ok(s.tree === 'A,B,C,Box', `C dropped on B's bottom edge goes after B (${s.tree})`);
    await page.screenshot({ path: path.join(OUT, `${name}-01-order.png`) });

    // into a group: A onto the middle of Box's row
    st0 = s.steps;
    await drag(page, 'A', 'Box', 0.5);
    s = await state(page);
    ok(s.tree === 'B,C,Box[A]' && s.steps === st0 + 1, `A dropped on the middle of Box's row goes inside Box: one step (${s.tree})`);
    ok(s.xs.A === x0.A, 'and stays where it was in the world', `${s.xs.A} vs ${x0.A}`);
    // into a group at a place: B onto the top edge of A's row (inside Box)
    await drag(page, 'B', 'A', 0.12);
    s = await state(page);
    ok(s.tree === 'C,Box[B,A]', `B dropped on the top edge of A inside Box goes into Box, before A (${s.tree})`);
    await page.screenshot({ path: path.join(OUT, `${name}-02-into.png`) });
    // out to the top level: B onto the Outliner heading → last
    st0 = s.steps;
    await drag(page, 'B', 'heading');
    s = await state(page);
    ok(s.tree === 'C,Box[A],B' && s.steps === st0 + 1 && s.xs.B === x0.B, `B dropped on the Outliner heading goes to the top level, last, in its place (${s.tree})`);
    // one undo takes back exactly that
    await undo(page);
    s = await state(page);
    ok(s.tree === 'C,Box[B,A]' && s.dom === 'C,Box,B,A', `Ctrl+Z takes back the last drop only (${s.tree})`);
    await undo(page);
    s = await state(page);
    ok(s.tree === 'B,C,Box[A]', `Ctrl+Z again takes back the drop before it (${s.tree})`);

    // refusals: a group onto a row inside itself; Esc during a drag
    st0 = s.steps;
    await drag(page, 'Box', 'A', 0.5);
    s = await state(page);
    ok(s.tree === 'B,C,Box[A]' && s.steps === st0, `Box onto a row inside itself: nothing changes (${s.tree})`);
    await drag(page, 'C', 'B', 0.88, { esc: true });
    s = await state(page);
    ok(s.tree === 'B,C,Box[A]' && s.steps === st0, `Esc during a drag: nothing dropped (${s.tree})`);
    // a plain click still selects
    await page.evaluate(() => window.modelcraft.host.setSel([]));
    const bB = await rowBox(page, 'B');
    await page.mouse.click(bB.x, bB.y + bB.h / 2);
    await page.waitForTimeout(100);
    s = await state(page);
    ok(s.sel === 'B' && s.steps === st0, `a click (no drag) still selects (${s.sel})`);

    if (name === 'chromium') {
      // a finger: hold, then move = a drag; move at once = a scroll (nothing moves)
      const cdp = await ctx.newCDPSession(page);
      const touch = async (type, x, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y, id: 1 }] });
      const a = await rowBox(page, 'C'), b = await rowBox(page, 'B');
      st0 = (await state(page)).steps;
      await touch('touchStart', a.x, a.y + a.h / 2);
      for (let i = 1; i <= 6; i++) { await touch('touchMove', a.x, a.y + a.h / 2 + (b.y + b.h * 0.12 - a.y - a.h / 2) * i / 6); }
      await touch('touchEnd');
      await page.waitForTimeout(150);
      s = await state(page);
      ok(s.tree === 'B,C,Box[A]' && s.steps === st0, `a finger moved at once only scrolls: nothing moves (${s.tree})`);
      const a2 = await rowBox(page, 'C'), b2 = await rowBox(page, 'B');
      await touch('touchStart', a2.x, a2.y + a2.h / 2);
      await page.waitForTimeout(600);
      for (let i = 1; i <= 6; i++) { await touch('touchMove', a2.x, a2.y + a2.h / 2 + (b2.y + b2.h * 0.12 - a2.y - a2.h / 2) * i / 6); }
      await touch('touchEnd');
      await page.waitForTimeout(150);
      s = await state(page);
      ok(s.tree === 'C,B,Box[A]' && s.steps === st0 + 1, `a finger held on C, then moved onto B's top edge: C goes before B (${s.tree})`);
    }
    await page.screenshot({ path: path.join(OUT, `${name}-03-end.png`) });
    ok(!errors.length, 'no console errors', errors.slice(0, 3).join(' | '));
  } catch (e) {
    fail++;
    console.log('  FAIL  ' + (e && e.stack || e));
    await page.screenshot({ path: path.join(OUT, `${name}-error.png`) }).catch(() => {});
  } finally {
    await browser.close();
  }
}
if (!KEEP_ADMIN) try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { stdio: 'ignore' }); } catch { /* best effort */ }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
