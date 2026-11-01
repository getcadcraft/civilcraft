#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-keys071.mjs — ModelCraft 0.7.1 rows 71.14–71.16 (ZugZugBoy: macro keypads, 60% keyboards; docs/0.7.1.md), in the lab:
 *   71.14 MC-KEYS-META      Esc and the arrow keys are commands a style can give other keys: moved to Q / J they run there (J locks the
 *                           red axis while the Line tool runs, orbits when nothing runs), Esc and → then say where they went; a style
 *                           saved before 0.7.1 keeps the app's own Esc and arrows; Customize warns when nothing cancels, its Default
 *                           puts Esc back, and an arrow key can be recorded; comma and semicolon are keys a style can use.
 *   71.15 MC-KEYS-COMMANDS  Delete guides, X-ray, Hide rest of model, Hidden objects, Unhide all, section planes / cuts: commands
 *                           with a key, each doing its thing.
 *   71.16 MC-RIGHTCLICK-MENU a right click opens the menu for what is under the pointer (it is selected) in the ModelCraft, Push-pull
 *                           and Modeler styles; a right drag does not move the camera there; Esc closes it; its items work; the menu
 *                           key opens it; a style whose Mouse tab gives the right button Pan pans again; Beginner still orbits.
 * No console errors.
 *
 *   node tools/modelcraft-test/browser-keys071.mjs [--out <dir>]
 * Run as root (ModelCraft's test admin via tools/modelcraft-test/admin.php; the signed-in state of browser-render.mjs). Shots in
 * tmp/shots/keys071.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/keys071')));
const STATE = path.join(REPO, 'tmp/render-browser-state.json');
fs.mkdirSync(OUT, { recursive: true });

const pw = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const newest = (re) => fs.readdirSync(cacheDir).filter((d) => re.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const chromeExe = (() => { const b = newest(/^chromium-\d+$/); return b && ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, b, s)).find((p) => fs.existsSync(p)); })();
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');

let pass = 0, fail = 0;
const ok = (c, what, detail = '') => { if (c) { pass++; console.log('  ok    ' + what + (detail ? ' (' + detail + ')' : '')); } else { fail++; console.log('  FAIL  ' + what + (detail ? ' — ' + detail : '')); } };

async function storage(chromium) {
  if (fs.existsSync(STATE)) {
    const c = await chromium.newContext({ storageState: STATE, ignoreHTTPSErrors: true });
    const p = await c.newPage();
    const r = await p.goto(BASE + '/lab/modelcraft', { waitUntil: 'domcontentloaded' });
    const good = r && r.status() === 200 && p.url().includes('/lab/modelcraft');
    await c.close();
    if (good) return JSON.parse(fs.readFileSync(STATE, 'utf8'));
  }
  const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
  const c = await chromium.newContext({ ignoreHTTPSErrors: true });
  const p = await c.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', admin.email);
  await p.fill('input[name="password"]', admin.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await c.storageState({ path: STATE });
  fs.chmodSync(STATE, 0o600);
  return JSON.parse(fs.readFileSync(STATE, 'utf8'));
}

/** Two 1 m boxes as groups A (x 0) and B (x 3); nothing selected; a guide line; the camera framing them. */
const build = (page) => page.evaluate(async () => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const M = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))[1]);
  const mc = window.modelcraft;
  for (const [x, nm] of [[0, 'A'], [3, 'B']]) mc.model.change('b', (m) => {
    M.addPolygon(m.root, [[x, 0, 0], [x + 1, 0, 0], [x + 1, 1, 0], [x, 1, 0]], [0, 0, 1]); M.pushPull(m.root, [...m.root.faces.keys()].at(-1), 1);
    const id = m.makeGroup(m.root, [...m.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'group'); m.def(m.root.insts.get(id).def).name = nm;
  });
  mc.model.change('g', (m) => { m.addGuideLine([0, -1, 0], [1, 0, 0]); });
  mc.host.setSel([]);
  document.querySelector('.mc-tools [data-act="extents"]').click();
  mc.view.invalidate();
});
const cam = (page) => page.evaluate(() => JSON.stringify([window.modelcraft.cam.eye, window.modelcraft.cam.target].flat().map((v) => +v.toFixed(4))));
const toolName = (page) => page.evaluate(() => window.modelcraft.tools.name);
const overFocus = (page) => page.evaluate(() => document.querySelector('[data-over]').focus({ preventScroll: true }));
const msg = (page) => page.textContent('[data-msg]');
/** The screen point (page px) of a world point. */
const screenOf = (page, w) => page.evaluate((w) => {
  const mc = window.modelcraft, r = document.querySelector('[data-over]').getBoundingClientRect();
  const s = mc.cam.project(w, mc.cam.viewProj());
  return s ? [r.left + s[0], r.top + s[1]] : null;
}, w);
const instName = (page, s) => page.evaluate((s) => { const mc = window.modelcraft, d = mc.model.context(mc.host.path).def, i = d.insts.get(s.id); return i ? mc.model.def(i.def).name : ''; }, s);
const sel = (page) => page.evaluate(() => window.modelcraft.host.sel.map((s) => ({ t: s.t, id: s.id })));
/** Meshes drawn (and how many of them are faded). */
const meshes = (page) => page.evaluate(() => {
  let n = 0, faded = 0;
  window.modelcraft.view.draw?.();
  window.modelcraft.view.root.traverse((o) => { if (o.isMesh && o.visible) { n++; if (o.material?.opacity < 1) faded++; } });
  return { n, faded };
});
/** A style of the person's own from a profile (via the shell's Import), made the one in use. */
const useStyle = (page, prof) => page.evaluate((p) => { const r = window.ccInput.importText(JSON.stringify({ format: 'cadcraft-input', version: 1, ...p })); return r ? r.id : null; }, prof);
async function rightClick(page, at) {
  await page.mouse.move(at[0], at[1]);
  await page.mouse.down({ button: 'right' });
  await page.mouse.up({ button: 'right' });
  await page.waitForTimeout(80);
}
async function rightDrag(page, at) {
  await page.mouse.move(at[0], at[1]);
  await page.mouse.down({ button: 'right' });
  await page.mouse.move(at[0] + 80, at[1] + 40, { steps: 8 });
  await page.mouse.up({ button: 'right' });
  await page.waitForTimeout(80);
}
const menuOpen = (page) => page.evaluate(() => { const m = document.querySelector('[data-mc-ctx]'); return m && !m.hidden ? [...m.querySelectorAll('[role="menuitem"]')].map((b) => b.dataset.ctx) : null; });

const browser = await pw.chromium.launch({ executablePath: chromeExe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ storageState: await storage(browser), viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true, serviceWorkers: 'block' });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_/i.test(m.text())) errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
try {
  await page.addInitScript(() => { try { if (!sessionStorage.getItem('k071')) { localStorage.removeItem('modelcraft.input'); localStorage.removeItem('modelcraft.settings'); localStorage.setItem('modelcraft.keys.carried', '1'); sessionStorage.setItem('k071', '1'); } } catch (e) { /* none */ } });
  await page.goto(BASE + '/lab/modelcraft', { waitUntil: 'load' });
  await page.waitForFunction(() => window.modelcraft?.model && window.ccInput?.current(), null, { timeout: 60000 });
  await page.evaluate(() => window.ccInput.setStyle('modelcraft'));
  await build(page);
  await page.waitForTimeout(200);

  console.log('== 71.14 MC-KEYS-META: Esc and the arrows as commands');
  const reg = await page.evaluate(() => window.ccInput.commands.filter((c) => c.keep || c.essential).map((c) => c.id + ':' + c.defKeys.join('/')).join(' '));
  ok(/edit\.cancel:Escape/.test(reg) && /aids\.lock-red:ArrowRight/.test(reg) && /camera\.nudge-left:Shift\+ArrowLeft/.test(reg), 'the registry has Cancel (Esc), the four axis locks and the four pans', reg);
  // the app's own style: unchanged behaviour
  await overFocus(page);
  let c0 = await cam(page);
  await page.keyboard.press('ArrowRight');
  ok((await cam(page)) !== c0, 'ModelCraft style: → with nothing running orbits, as before');
  await page.click('.mc-tools [data-tool="line"]');
  await overFocus(page);
  let a = await screenOf(page, [0.5, -2, 0]);
  await page.mouse.click(a[0], a[1]);
  await page.keyboard.press('ArrowRight');
  ok(await page.evaluate(() => window.modelcraft.tools.lock?.kind) === 'axis-x', 'ModelCraft style: → while the Line tool runs locks the red axis');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  ok((await toolName(page)) === 'select', 'ModelCraft style: Esc cancels the line, then goes back to Select');

  // a style that moves cancel to Q and the red lock to J (a 60% keyboard)
  const keys = await page.evaluate(() => window.ccInput.current().keys);
  await useStyle(page, { name: 'Keypad', base: 'modelcraft', keys: { ...keys, 'edit.cancel': ['Q'], 'aids.lock-red': ['J'], 'modify.rotate': [] } });
  ok(await page.evaluate(() => window.ccInput.current().name) === 'Keypad', 'a style of my own: Cancel on Q, lock red on J');
  await page.click('.mc-tools [data-tool="line"]');
  await overFocus(page);
  await page.mouse.click(a[0], a[1]);
  ok(await page.evaluate(() => !!window.modelcraft.tools.tool.busy), 'the Line tool runs (its first point placed)');
  await page.keyboard.press('j');
  ok(await page.evaluate(() => window.modelcraft.tools.lock?.kind) === 'axis-x', 'J (the lock moved there) locks the red axis while the tool runs (whileBusy)');
  await page.keyboard.press('ArrowRight');
  ok(await page.evaluate(() => window.modelcraft.tools.lock?.kind) === 'axis-x' && /J/.test(await msg(page)), '→ no longer toggles the lock: it says where the command went', await msg(page));
  await page.keyboard.press('Escape');
  ok(await page.evaluate(() => !!window.modelcraft.tools.tool.busy), 'Esc no longer cancels (moved to Q)');
  await page.keyboard.press('q');
  ok(await page.evaluate(() => !window.modelcraft.tools.tool.busy), 'Q cancels the line');
  await page.keyboard.press('q');
  ok((await toolName(page)) === 'select', 'Q again: back to Select');
  await overFocus(page);
  c0 = await cam(page);
  await page.keyboard.press('j');
  ok((await cam(page)) !== c0, 'J with nothing running orbits (what → did)');
  c0 = await cam(page);
  await page.keyboard.press('Shift+ArrowLeft');
  ok((await cam(page)) !== c0, 'Shift+← still pans (its command kept its key)');

  // a style saved before 0.7.1: no keys for the new commands → the app's own Esc and arrows
  await useStyle(page, { name: 'Older', base: 'modelcraft', keys: { 'draw.line': ['L'], 'draw.rect': ['R'] } });
  await overFocus(page);
  c0 = await cam(page);
  await page.keyboard.press('ArrowUp');
  ok((await cam(page)) !== c0, 'an older style of mine (no key for the new commands): ↑ still orbits');
  await page.keyboard.press('l');
  await page.keyboard.press('Escape');
  ok((await toolName(page)) === 'select', '… and Esc still cancels');

  // Customize: the warning, Default, recording an arrow key
  await page.evaluate(() => document.querySelector('[data-input-settings] .cc-in-setbtns button').click());
  await page.waitForSelector('dialog.cc-in-dlg[open]');
  ok(await page.locator('dialog.cc-in-dlg [data-input-essential="edit.cancel"]').count() === 1, 'Customize warns: nothing is set to cancel', await page.locator('dialog.cc-in-dlg [data-input-essential]').first().textContent().catch(() => ''));
  await page.fill('dialog.cc-in-dlg input[type="search"]', 'Cancel:');
  await page.click('dialog.cc-in-dlg [data-input-default="edit.cancel"]');
  ok(await page.locator('dialog.cc-in-dlg [data-input-essential]').count() === 0, 'Default puts Esc back: the warning goes');
  await page.fill('dialog.cc-in-dlg input[type="search"]', 'Pan left');
  const row = page.locator('dialog.cc-in-dlg tbody tr', { hasText: 'Pan left' }).first();
  await row.locator('.cc-in-link', { hasText: 'Add a key' }).click();
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(1100);
  ok(/←|ArrowLeft/.test(await row.locator('.cc-in-keys').textContent()), 'an arrow key can be recorded for a command', await row.locator('.cc-in-keys').textContent());
  await page.fill('dialog.cc-in-dlg input[type="search"]', 'Select none');
  const r2 = page.locator('dialog.cc-in-dlg tbody tr', { hasText: 'Select none' }).first();
  await r2.locator('.cc-in-link', { hasText: 'Add a key' }).click();
  await page.keyboard.press(';');
  await page.waitForTimeout(1100);
  ok(/;/.test(await r2.locator('.cc-in-keys').textContent()), 'semicolon can be recorded (71.14: comma and semicolon were bindable already)');
  await page.screenshot({ path: path.join(OUT, '01-customize.png') });
  await page.click('dialog.cc-in-dlg .cc-in-dfoot .btn-plot');
  await page.waitForTimeout(100);
  await overFocus(page);
  await page.evaluate(() => window.modelcraft.host.setSel([{ t: 'i', id: [...window.modelcraft.model.root.insts.keys()][0] }]));
  await page.waitForTimeout(200);   // the toolbar's Select none is enabled once something is selected
  await page.keyboard.press(';');
  ok((await sel(page)).length === 0, '; (recorded for Select none) selects nothing');
  c0 = await cam(page);
  await page.keyboard.press('ArrowLeft');
  ok((await cam(page)) !== c0, '← (recorded for Pan left) pans');

  console.log('== 71.15 MC-KEYS-COMMANDS: the view commands, each with a key');
  const ids = ['edit.delete-guides', 'camera.xray', 'camera.hide-rest', 'camera.hidden-objects', 'edit.unhide-all', 'camera.sec-planes', 'camera.sec-cuts'];
  await useStyle(page, { name: 'Views', base: 'pushpull', keys: { ...(await page.evaluate(() => window.ccInput.styles.pushpull.keys)), 'edit.delete-guides': ['Ctrl+Alt+G'], 'camera.xray': ['Alt+X'], 'camera.hide-rest': ['Alt+R'], 'camera.hidden-objects': ['Alt+O'], 'edit.unhide-all': ['Alt+U'], 'camera.sec-planes': ['Alt+P'], 'camera.sec-cuts': ['Alt+C'], 'edit.hide': ['Alt+H'] } });
  ok(await page.evaluate((ids) => ids.every((id) => window.ccInput.commands.some((c) => c.id === id)), ids), 'every one is a command (' + ids.length + ')');
  ok(await page.evaluate(() => ['camera.xray', 'camera.hide-rest', 'camera.hidden-objects', 'edit.delete-guides'].every((id) => window.ccInput.paletteItems().some((p) => p.id === 'input:' + id))), 'the new ones are in the command palette too');
  await overFocus(page);
  await page.keyboard.press('Control+Alt+g');
  ok(await page.evaluate(() => window.modelcraft.model.guides.size) === 0 && /guide/i.test(await msg(page)), 'Delete guides (its key): the guide is gone', await msg(page));
  await page.keyboard.press('Control+z');
  ok(await page.evaluate(() => window.modelcraft.model.guides.size) === 1, '… one undo step');
  await overFocus(page);
  await page.keyboard.press('Alt+x');
  ok(await page.evaluate(() => window.modelcraft.view.style.mode === 'xray' && document.querySelector('[data-xray]').getAttribute('aria-checked') === 'true'), 'X-ray on (the Faces style, the menu checked)', await page.evaluate(() => window.modelcraft.view.style.mode + ' ' + document.querySelector('[data-xray]').getAttribute('aria-checked')) + ' ' + await msg(page));
  await page.keyboard.press('Alt+x');
  ok(await page.evaluate(() => window.modelcraft.view.style.mode === 'shaded' && document.querySelector('[data-style-mode]').value === 'shaded'), 'X-ray again: back to Shaded (the style you had)');
  // hide rest of model: open A, only A drawn
  const all = await meshes(page);
  await page.evaluate(() => window.modelcraft.host.openContext([[...window.modelcraft.model.root.insts.keys()][0]]));
  const open = await meshes(page);
  await overFocus(page);
  await page.keyboard.press('Alt+r');
  const rest = await meshes(page);
  ok(open.faded > 0 && rest.n < open.n && rest.faded === 0 && await page.evaluate(() => window.modelcraft.view.ui().hideRest), 'Hide rest of model: with A open only A is drawn (no faded rest)', `${open.n}/${open.faded} → ${rest.n}/${rest.faded}`);
  await page.keyboard.press('Alt+r');
  ok((await meshes(page)).n === open.n, '… again: the rest shows faded');
  await page.evaluate(() => window.modelcraft.host.closeContext());
  // hidden objects: hide B, then show hidden objects faded
  await page.evaluate(() => window.modelcraft.host.setSel([{ t: 'i', id: [...window.modelcraft.model.root.insts.keys()][1] }]));
  await page.waitForTimeout(200);   // Hide is enabled once something is selected
  await overFocus(page);
  await page.keyboard.press('Alt+h');
  const hid = await meshes(page);
  ok(hid.n < all.n, 'B hidden (Hide)', `${all.n} → ${hid.n}`);
  await page.keyboard.press('Alt+o');
  const ghost = await meshes(page);
  ok(ghost.n === all.n && ghost.faded > 0, 'Hidden objects: B drawn again, faded', `${ghost.n}/${ghost.faded}`);
  ok(await page.evaluate(() => window.modelcraft.model.root.insts.get([...window.modelcraft.model.root.insts.keys()][1]).hidden === true), '… and it stays hidden in the model');
  await page.keyboard.press('Alt+o');
  await page.keyboard.press('Alt+u');
  ok((await meshes(page)).n === all.n && /Showing everything/.test(await msg(page)), 'Unhide all (its key)');
  const sv0 = await page.evaluate(() => JSON.stringify(window.modelcraft.model.sectionView));
  await page.keyboard.press('Alt+p'); await page.keyboard.press('Alt+c');
  const sv1 = await page.evaluate(() => JSON.stringify(window.modelcraft.model.sectionView));
  ok(sv0 !== sv1 && /false/.test(sv1), 'section planes and section cuts toggle by their keys', `${sv0} → ${sv1}`);
  await page.keyboard.press('Alt+p'); await page.keyboard.press('Alt+c');
  await page.screenshot({ path: path.join(OUT, '02-views.png') });

  console.log('== 71.16 MC-RIGHTCLICK-MENU: the right button opens the menu');
  for (const style of ['modelcraft', 'pushpull', 'modeler']) {
    await page.evaluate((s) => window.ccInput.setStyle(s), style);
    await page.waitForTimeout(60);
    await page.evaluate(() => window.modelcraft.host.setSel([]));
    const at = await screenOf(page, [0.5, 0, 0.5]);
    await rightClick(page, at);
    const items = await menuOpen(page);
    const s = await sel(page);
    ok(items && items.includes('edit') && items.includes('hide') && s.length === 1 && s[0].t === 'i' && (await instName(page, s[0])) === 'A', `${style}: a right click on A selects it and opens its menu`, items ? items.join(',') : 'no menu');
    if (style === 'modelcraft') await page.screenshot({ path: path.join(OUT, '03-menu.png') });
    await page.keyboard.press('Escape');
    ok((await menuOpen(page)) === null && (await sel(page)).length === 1, `${style}: Esc closes the menu (the selection stays)`);
    c0 = await cam(page);
    await rightDrag(page, at);
    ok((await cam(page)) === c0 && (await menuOpen(page)) === null, `${style}: a right drag neither moves the camera nor opens the menu`);
  }
  await page.evaluate(() => window.ccInput.setStyle('modelcraft'));
  // an item: Hide, from the menu
  let at = await screenOf(page, [3.5, 0, 0.5]);
  await rightClick(page, at);
  ok((await instName(page, (await sel(page))[0])) === 'B', 'a right click on B selects B (not A)');
  await page.click('[data-mc-ctx] [data-ctx="hide"]');
  ok(await page.evaluate(() => window.modelcraft.model.root.insts.get([...window.modelcraft.model.root.insts.keys()][1]).hidden === true), 'its Hide item hides B');
  // on nothing: select all, zoom extents, unhide all
  at = await screenOf(page, [1.8, 6, 0]);
  await page.evaluate(() => window.modelcraft.host.setSel([]));
  await rightClick(page, at);
  let items = await menuOpen(page);
  ok(items && items.includes('all') && items.includes('unhide') && !items.includes('edit'), 'a right click on nothing: Select all, Unhide all, Zoom extents', items ? items.join(',') : 'no menu');
  await page.click('[data-mc-ctx] [data-ctx="unhide"]');
  ok(await page.evaluate(() => !window.modelcraft.model.root.insts.get([...window.modelcraft.model.root.insts.keys()][1]).hidden), 'its Unhide all item');
  // the menu key
  await overFocus(page);
  await page.keyboard.press('Shift+F10');
  ok((await menuOpen(page)) !== null && await page.evaluate(() => document.activeElement?.getAttribute('role') === 'menuitem'), 'Shift+F10 opens the menu, the focus in it');
  await page.keyboard.press('ArrowDown');
  ok((await menuOpen(page)) !== null, 'the arrow keys move in the menu (the view does not take them)');
  await page.keyboard.press('Escape');
  // while drawing: Cancel first
  await page.click('.mc-tools [data-tool="line"]');
  a = await screenOf(page, [0.5, -2, 0]);
  await page.mouse.click(a[0], a[1]);
  await rightClick(page, a);
  items = await menuOpen(page);
  ok(items && items[0] === 'cancel', 'a right click while the Line tool runs: Cancel first', items ? items.join(',') : 'no menu');
  await page.click('[data-mc-ctx] [data-ctx="cancel"]');
  ok(await page.evaluate(() => !window.modelcraft.tools.tool.busy), '… which cancels the line');
  await page.evaluate(() => document.querySelector('.mc-tools [data-tool="select"]').click());
  // the Mouse tab's choice stays: right = Pan in a style of my own
  await useStyle(page, { name: 'Right pans', base: 'pushpull', mouse: { wheel: 1, zoomSpeed: 1, pan2d: ['middle', 'right'], orbit3d: { left: 'none', middle: 'orbit', right: 'pan' } } });
  at = await screenOf(page, [0.5, 0, 0.5]);
  c0 = await cam(page);
  await rightDrag(page, at);
  ok((await cam(page)) !== c0 && (await menuOpen(page)) === null, 'a style whose Mouse tab gives the right button Pan: a right drag pans, no menu');
  // Beginner keeps its right-drag orbit
  await page.evaluate(() => window.ccInput.setStyle('beginner'));
  await page.waitForTimeout(60);
  c0 = await cam(page);
  await rightDrag(page, at);
  ok((await cam(page)) !== c0 && (await menuOpen(page)) === null, 'Beginner: the right button still orbits');
  // the Mouse tab offers the context menu for the right button (not the left)
  await page.evaluate(() => window.ccInput.setStyle('pushpull'));
  await page.evaluate(() => document.querySelector('[data-input-settings] .cc-in-setbtns button').click());
  await page.waitForSelector('dialog.cc-in-dlg[open]');
  const opts = await page.evaluate(() => [...document.querySelectorAll('dialog.cc-in-dlg .cc-in-m3 select')].map((s) => [...s.options].map((o) => o.value).join('/')));
  ok(opts.length === 3 && !opts[0].includes('menu') && opts[2].includes('menu') && await page.evaluate(() => document.querySelectorAll('dialog.cc-in-dlg .cc-in-m3 select')[2].value) === 'menu', 'the Mouse tab: Context menu is a choice for the middle and right buttons (right picked), not the left', opts.join(' | '));
  await page.click('dialog.cc-in-dlg .cc-in-dfoot .btn-line');
} catch (e) {
  ok(false, 'the run', e.stack?.split('\n').slice(0, 3).join(' '));
}
ok(!errors.length, 'no console errors', errors.slice(0, 3).join(' | '));
await page.evaluate(() => { try { localStorage.removeItem('modelcraft.input'); } catch (e) { /* none */ } }).catch(() => {});
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
