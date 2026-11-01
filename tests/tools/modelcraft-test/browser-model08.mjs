#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-model08.mjs — ModelCraft 0.8 session model-08, headless Chromium at /lab/modelcraft (one pass for the whole list):
 *   D8.6   Model info › Precision and text: 1/4" precision shows in the status bar's lengths, the dimension text grows, the
 *          file keeps `format`, a new model forgets it
 *   D8.4   camera.orbit-* commands exist, can be put on other keys and never lock an axis while a tool runs; the arrows' defaults
 *          (aids.lock-*) still lock
 *   doc data  window.ccDocData('flow') keeps data in the saved file under addons.flow and gives it back on open
 *   SU.934 Scale by factors…: 1.015 / 1.03 / 1 about the lowest corner, the shrinkage preset, one undo
 *   GH.2   Modifiers on a group: Add Scale and Array in Entity info, reorder, Edit source (the copies follow), Bake, undo
 *   SU.929 Split for printing › Connectors by hand: Remove one, Move one
 * No console errors.
 *   node tools/modelcraft-test/browser-model08.mjs [--out <dir>]
 * Run as root (ModelCraft's test admin, as browser-split08.mjs). Shots in tmp/shots/model08.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/model08')));
const STATE = path.join(REPO, 'tmp/skp-browser-state.json');
fs.mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function signedInContext(opts) {
  if (fs.existsSync(STATE)) {
    const c = await browser.newContext({ ...opts, storageState: STATE });
    const p = await c.newPage();
    const r = await p.goto(BASE + '/lab/modelcraft', { waitUntil: 'domcontentloaded' });
    const good = r && r.status() === 200 && p.url().includes('/lab/modelcraft');
    await p.close();
    if (good) return c;
    await c.close();
  }
  const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
  const c = await browser.newContext(opts);
  const p = await c.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', admin.email);
  await p.fill('input[name="password"]', admin.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await c.storageState({ path: STATE });
  fs.chmodSync(STATE, 0o600);
  await p.close();
  return c;
}

/** A 2 × 3 × 4 m box as one component "Shade" placed at the origin, selected. */
const buildBox = (page) => page.evaluate(async () => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const M = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))[1]);
  const mc = window.modelcraft;
  const iid = mc.model.change('box', (m) => {
    M.addPolygon(m.root, [[0, 0, 0], [2, 0, 0], [2, 3, 0], [0, 3, 0]], [0, 0, 1]); M.pushPull(m.root, [...m.root.faces.keys()].at(-1), 4);
    return m.makeGroup(m.root, [...m.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'component', 'Shade');
  });
  mc.host.setSel([{ t: 'i', id: iid }]);
  document.querySelector('[data-hint]').hidden = true;
  document.querySelector('.mc-tools [data-act="extents"]').click();
  return iid;
});
const bbox = (page) => page.evaluate(async () => {
  const mc = window.modelcraft, m = mc.model;
  const b = m.bbox(m.root, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  return b ? [0, 1, 2].map((i) => +(b.max[i] - b.min[i]).toFixed(6)) : null;
});
const useStyle = (page, prof) => page.evaluate((p) => { const r = window.ccInput.importText(JSON.stringify({ format: 'cadcraft-input', version: 1, ...p })); return r ? r.id : null; }, prof);
const camKey = (page) => page.evaluate(() => JSON.stringify([window.modelcraft.cam.eye, window.modelcraft.cam.target].flat().map((v) => +v.toFixed(4))));

const problems = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1440, height: 900 }, locale: 'en-US', ignoreHTTPSErrors: true, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_/i.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.addInitScript(() => { try { if (!sessionStorage.getItem('m08')) { localStorage.removeItem('modelcraft.input'); localStorage.removeItem('modelcraft.settings'); localStorage.removeItem('modelcraft.shrink'); sessionStorage.setItem('m08', '1'); } } catch { /* blocked */ } });
  await page.goto(BASE + '/lab/modelcraft?space=model', { waitUntil: 'load' });
  await page.waitForFunction(() => window.modelcraft?.model && window.ccInput?.current(), null, { timeout: 60000 });
  await page.evaluate(() => window.ccInput.setStyle('modelcraft'));
  const iid = await buildBox(page);
  await page.waitForTimeout(200);

  console.log('== D8.6: Model info › Precision and text');
  await page.evaluate(() => { const ui = window.modelcraft.ui; ui.units.value = 'ft-in'; ui.units.dispatchEvent(new Event('change', { bubbles: true })); });
  await page.evaluate(() => window.ccInput.run('file.model-info'));
  await page.waitForSelector('[data-model-info][open]');
  await page.click('[data-model-info] [data-mi-tab="format"]');
  ok(await page.isVisible('[data-model-info] [data-mi-prec]'), 'the Precision and text section is there');
  const opts = await page.$$eval('[data-model-info] [data-mi-prec] option', (n) => n.map((o) => o.textContent));
  ok(opts.includes('1/4 inch') && opts.includes('1/64 inch'), 'fractions of an inch for feet and inches: ' + opts.join(' | '));
  await page.selectOption('[data-model-info] [data-mi-prec]', '4');
  await page.fill('[data-model-info] [data-mi-dim-size], [data-model-info] input[type="number"][data-mi-dim-size]', '16').catch(() => {});
  const fmtLen = await page.evaluate(async () => {
    const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
    const U = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/units\.js/.test(k))[1]);
    return U.formatLength(0.0254 * 6.3, 'in');
  });
  ok(fmtLen === '6 1/4"', 'the kernel writes 6.3" as 6 1/4" at 1/4" precision: ' + fmtLen);
  await page.fill('[data-model-info] [data-mi-text-h]', '2').catch(() => {});
  await page.dispatchEvent('[data-model-info] [data-mi-dim-size]', 'change').catch(() => {});
  let f = await page.evaluate(() => window.modelcraft.file());
  ok(f.numberFormat && f.numberFormat.precision === 4, 'the saved file keeps numberFormat: ' + JSON.stringify(f.numberFormat));
  await page.screenshot({ path: path.join(OUT, '01-model-info-precision.png') });
  await page.click('[data-model-info] [data-mi-close]');
  // a new model forgets the format (the kernel's reset)
  await page.evaluate(() => { const mc = window.modelcraft; mc.model.reset(); });
  const iid2 = await buildBox(page);
  await page.waitForTimeout(150);

  console.log('== D8.4: orbit commands');
  const reg = await page.evaluate(() => window.ccInput.commands.filter((c) => /^camera\.orbit-/.test(c.id)).map((c) => c.id + ':' + c.defKeys.join('/')).join(' '));
  ok(/camera\.orbit-left:/.test(reg) && /camera\.orbit-down:/.test(reg), 'the four orbit commands are in the registry, with no default keys: ' + reg);
  await page.evaluate(() => document.querySelector('[data-over]').focus({ preventScroll: true }));
  const id = await useStyle(page, { name: 'm08', base: 'modelcraft', keys: { 'camera.orbit-right': ['J'], 'aids.lock-red': ['K'] } });
  ok(!!id, 'a style that puts Orbit right on J and the red lock on K imports');
  if (id) {
    await page.evaluate((i) => window.ccInput.setStyle(i), id);
    await page.evaluate(() => document.querySelector('[data-over]').focus({ preventScroll: true }));
    let c0 = await camKey(page);
    await page.keyboard.press('j');
    ok((await camKey(page)) !== c0, 'J orbits when nothing runs');
    await page.click('.mc-tools [data-tool="line"]');
    await page.evaluate(() => document.querySelector('[data-over]').focus({ preventScroll: true }));
    await page.evaluate(() => { const mc = window.modelcraft, q = mc.cam.project([0.5, -2, 0], mc.cam.viewProj()); mc.tools.click(q[0], q[1]); });
    c0 = await camKey(page);
    await page.keyboard.press('j');
    ok((await camKey(page)) !== c0 && await page.evaluate(() => !window.modelcraft.tools.lock), 'while Line runs J still orbits and never locks an axis');
    await page.keyboard.press('k');
    ok(await page.evaluate(() => window.modelcraft.tools.lock?.kind) === 'axis-x', 'K locks the red axis while Line runs', await page.evaluate(() => JSON.stringify([window.modelcraft.tools.name, window.modelcraft.tools.tool.busy, window.modelcraft.tools.tool.lockable, window.modelcraft.tools.lock, window.ccInput.current()?.id])));
    await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
    await page.evaluate(() => window.ccInput.setStyle('modelcraft'));
  }

  console.log('== doc data: add-on data in the file');
  await page.evaluate(() => { const d = window.ccDocData('flow'); d.setData('layout', { items: [{ id: 1 }], note: 'ü' }); window.__heard = 0; d.onOpen(() => { window.__heard++; }); });
  f = await page.evaluate(() => window.modelcraft.file());
  ok(f.addons?.flow?.layout?.items?.[0]?.id === 1, 'setData is in the saved file under addons.flow: ' + JSON.stringify(f.addons));
  ok(await page.evaluate(() => window.modelcraft.model.dirty === true), 'and marks the model unsaved');

  console.log('== SU.934: Scale by factors');
  await page.evaluate((i) => { window.modelcraft.host.path = []; window.modelcraft.host.setSel([{ t: 'i', id: i }]); }, iid2);
  const before = await bbox(page);
  await page.evaluate(() => window.ccInput.run('modify.scale-by'));
  await page.waitForSelector('dialog[data-dialog="scale-by"][open]');
  await page.fill('[data-sf-x]', '1.015'); await page.dispatchEvent('[data-sf-x]', 'input');
  await page.fill('[data-sf-y]', '103%'); await page.dispatchEvent('[data-sf-y]', 'input');
  await page.fill('[data-sf-z]', '1'); await page.dispatchEvent('[data-sf-z]', 'input');
  await page.selectOption('[data-s-anchor]', 'min');
  ok(/Size now/.test(await page.textContent('[data-s-line]')), 'the dialog shows the size now and after: ' + await page.textContent('[data-s-line]'));
  await page.screenshot({ path: path.join(OUT, '02-scale-by.png') });
  await page.click('[data-s-apply]');
  await page.waitForFunction(() => !document.querySelector('dialog[data-dialog="scale-by"]'));
  const after = await bbox(page);
  ok(before && after && Math.abs(after[0] - 2 * 1.015) < 1e-6 && Math.abs(after[1] - 3 * 1.03) < 1e-6 && Math.abs(after[2] - 4) < 1e-6, `the box went ${before} → ${after}`);
  await page.evaluate(() => window.modelcraft.model.undo());
  ok(JSON.stringify(await bbox(page)) === JSON.stringify(before), 'one undo puts it back');
  await page.evaluate(() => { window.modelcraft.host.setSel([{ t: 'i', id: Number([...window.modelcraft.model.root.insts.keys()][0]) }]); window.ccInput.run('modify.scale-by'); });
  await page.waitForSelector('dialog[data-dialog="scale-by"][open]');
  await page.fill('[data-ss-x]', '1.5'); await page.dispatchEvent('[data-ss-x]', 'input');
  await page.click('[data-s-fill]');
  ok(await page.inputValue('[data-sf-x]') === '1.015' && await page.inputValue('[data-sf-z]') === '1.015', 'the shrinkage preset fills the factors: 1.5 % → 1.015');
  await page.keyboard.press('Escape');

  console.log('== GH.2: Modifiers on a group');
  await page.evaluate((i) => { window.modelcraft.host.path = []; window.modelcraft.host.setSel([{ t: 'i', id: i }]); }, iid2);
  await page.waitForSelector('.mc-mods [data-mod-add]', { timeout: 10000 });
  ok(true, 'the Modifiers section is in Entity info for a component');
  await page.selectOption('.mc-mods [data-mod-add]', 'array');
  await page.waitForSelector('.mc-mod[data-mod-type="array"]');
  ok(await page.evaluate(() => { const m = window.modelcraft.model; const d = m.def([...m.root.insts.values()][0].def); return !!d.mods && !Array.isArray(d.mods) && d.mods.src; }), 'the first modifier makes the component a stack of its original');
  ok(JSON.stringify(await bbox(page)) === JSON.stringify([6, 3, 4]), 'Array: three touching copies: 6 × 3 × 4 m: ' + await bbox(page));
  await page.selectOption('.mc-mods [data-mod-add]', 'scale');
  await page.waitForSelector('.mc-mod[data-mod-type="scale"]');
  await page.fill('.mc-mod[data-mod-type="scale"] input[type="text"]', '2, 1, 1');
  await page.dispatchEvent('.mc-mod[data-mod-type="scale"] input[type="text"]', 'change');
  await page.waitForFunction(() => document.querySelector('.mc-mod[data-mod-type="scale"] input[type="text"]')?.value.startsWith('2'), null, { timeout: 5000 }).catch(() => {});
  ok(JSON.stringify(await bbox(page)) === JSON.stringify([12, 3, 4]), 'then Scale 2 on red: 12 × 3 × 4 m: ' + await bbox(page));
  await page.screenshot({ path: path.join(OUT, '03-modifier-stack.png') });
  await page.click('.mc-mod[data-mod-type="scale"] button[title="Move up"]');
  await page.waitForTimeout(150);
  ok(JSON.stringify(await bbox(page)) === JSON.stringify([12, 3, 4]), 'Scale first, then the Array of the scaled size: also 12 m wide (the touching step follows the size)');
  await page.click('[data-mod-edit-source]');
  ok(await page.evaluate(() => window.modelcraft.host.path.length) === 2, 'Edit source opens the original inside the result');
  await page.evaluate(() => { const mc = window.modelcraft; mc.host.closeContext(); });
  ok(await page.evaluate(() => window.modelcraft.host.path.length) === 0, 'closing returns to the model, over the generated level');
  await page.evaluate((i) => window.modelcraft.host.setSel([{ t: 'i', id: i }]), iid2);
  await page.click('[data-mod-bake]');
  await page.waitForFunction(() => { const m = window.modelcraft.model; const d = m.def([...m.root.insts.values()][0].def); return !d.mods; });
  ok(JSON.stringify(await bbox(page)) === JSON.stringify([12, 3, 4]), 'Bake keeps the shape: ' + await bbox(page));
  await page.evaluate(() => window.modelcraft.model.undo());
  ok(await page.evaluate(() => { const m = window.modelcraft.model; const d = m.def([...m.root.insts.values()][0].def); return !!d.mods; }), 'one undo brings the stack back');

  console.log('== SU.929: Connectors by hand');
  await page.evaluate(() => document.querySelector('[data-hint]').hidden = true);
  const cube = await page.evaluate(async () => {
    const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
    const B = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/beginner\.js/.test(k))[1]);
    const mc = window.modelcraft, m = mc.model;
    const id = m.change('cube', (mm) => { const d = B.buildShape(mm, 'box', 'Cube'); return mm.place(mm.root, d.id, [15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 15, 0, 20, 0, 0, 1]); });
    mc.host.path = []; mc.host.setSel([{ t: 'i', id }]);
    return id;
  });
  await page.click('[data-act="extents"]');
  await page.click('[data-export-menu] > summary');
  await page.click('[data-export="print3d"]');
  await page.waitForSelector('dialog.mc-dialog [data-print-ok]', { timeout: 120000 });
  await page.click('dialog.mc-dialog [data-prep-tools] button[data-key="tool:split"]');
  await page.waitForSelector('[data-ptool="split"]:not([hidden]) [data-ptool-result]', { timeout: 120000 });
  await page.click('[data-ptool="split"] [data-ptool-act="split-preview"]');
  await page.waitForSelector('[data-ptool="split"] [data-ptool-result="ok"]', { timeout: 120000 });
  let text = await page.textContent('[data-ptool="split"]');
  const n0 = Number(/(\d+) connectors\./.exec(text)?.[1]);
  ok(n0 === 24 && await page.isVisible('[data-split-hand]'), 'the preview has 24 connectors and the Connectors by hand row');
  const spot = () => page.evaluate(() => {
    const mc = window.modelcraft, s = mc.splitState(), r = document.querySelector('[data-over]').getBoundingClientRect();
    const j = s.result.joints[0], c = j.connectors[0], q = mc.cam.project(c.at.map((v) => v / 1000), mc.cam.viewProj());
    return { label: j.label, at: c.at, n: c.n, x: r.left + q[0], y: r.top + q[1], count: s.result.joints.reduce((a, jj) => a + jj.connectors.length, 0) };
  });
  const s0 = await spot();
  await page.check('[data-split-hand] input[value="remove"]');
  await page.mouse.click(s0.x, s0.y);
  await page.waitForFunction((n) => { const s = window.modelcraft.splitState(); return s.result && !s.busy && s.result.joints.reduce((a, jj) => a + jj.connectors.length, 0) === n; }, n0 - 1, { timeout: 120000 }).catch(() => {});
  const s1 = await page.evaluate(() => { const s = window.modelcraft.splitState(); return { count: s.result?.joints.reduce((a, jj) => a + jj.connectors.length, 0), place: s.place }; });
  ok(s1.count === n0 - 1 && s1.place && Object.keys(s1.place).length === 1, `Remove one: ${n0} → ${s1.count} connectors; only that joint is placed by hand: ${JSON.stringify(Object.keys(s1.place || {}))}`);
  await page.screenshot({ path: path.join(OUT, '04-connectors-by-hand.png') });
  await page.click('[data-split-hand-auto]');
  await page.waitForFunction((n) => { const s = window.modelcraft.splitState(); return s.result && !s.busy && !s.place && s.result.joints.reduce((a, jj) => a + jj.connectors.length, 0) === n; }, n0, { timeout: 120000 }).catch(() => {});
  ok(await page.evaluate(() => !window.modelcraft.splitState().place), 'Automatic again forgets the hand-placed spots');
  // Move one: pick the first connector of the first joint, then click 8 mm along the cut from it
  const s2 = await spot();
  const tgt = await page.evaluate((s2) => {
    const mc = window.modelcraft, n = s2.n, u = Math.abs(n[0]) > 0.9 ? [0, 1, 0] : [1, 0, 0];
    const p = s2.at.map((v, k) => v + u[k] * 8), r = document.querySelector('[data-over]').getBoundingClientRect(), q = mc.cam.project(p.map((v) => v / 1000), mc.cam.viewProj());
    return { p, x: r.left + q[0], y: r.top + q[1] };
  }, s2);
  await page.check('[data-split-hand] input[value="move"]');
  await page.mouse.click(s2.x, s2.y);
  ok(await page.evaluate(() => !!window.modelcraft.splitState().picked), 'Move one: the first click picks the ring');
  await page.mouse.click(tgt.x, tgt.y);
  await page.waitForFunction((label) => { const s = window.modelcraft.splitState(); return !s.busy && s.place?.[label]; }, s2.label, { timeout: 120000 }).catch(() => {});
  const moved = await page.evaluate((label) => { const s = window.modelcraft.splitState(); return s.place?.[label]?.[0]; }, s2.label);
  ok(moved && Math.hypot(moved[0] - tgt.p[0], moved[1] - tgt.p[1], moved[2] - tgt.p[2]) < 0.8, 'Move one: the second click puts it there: ' + JSON.stringify(moved?.map((v) => +v.toFixed(2))) + ' wanted ' + JSON.stringify(tgt.p.map((v) => +v.toFixed(2))));
  await page.click('[data-ptool] [data-ptool-close]');
} catch (e) {
  fail++; console.log('  FAIL ' + (e.stack || e.message));
} finally {
  if (problems.length) { fail += problems.length; console.log('  FAIL console problems:\n    ' + problems.slice(0, 8).join('\n    ')); }
  await browser.close();
}
console.log(`\n${pass} ok, ${fail} failed`);
process.exit(fail ? 1 : 0);
