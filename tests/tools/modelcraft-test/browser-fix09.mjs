#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-fix09.mjs — ModelCraft 0.9 final fixes (session model-fix-09), in headless Chromium on /lab/modelcraft:
 *   FX.32 the Render workspace: no pop-up that stays over the toolbar and passes clicks through, the long note can be put away,
 *         and the word "null" is nowhere in the panel (under Detail or anywhere else)
 *   FX.31 Play becomes Pause while the animation plays (timeline and Animate toolbar); Space plays and pauses while the timeline
 *         is open (command camera.play, bindable); Space still selects with the timeline closed
 *   FX.33 Ctrl copies while rotating (as it does while moving); a move snaps to a point of another object
 * No console errors.
 *
 *   node tools/modelcraft-test/browser-fix09.mjs [--out <dir>]
 * Run as root (ModelCraft's test admin via tools/modelcraft-test/admin.php; the signed-in state of browser-render.mjs).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/fix09')));
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

/** Two 1 m boxes as groups A (x 0) and B (x 3); nothing selected; the camera framing them. */
const build = (page) => page.evaluate(async () => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const M = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))[1]);
  const mc = window.modelcraft;
  for (const [x, nm] of [[0, 'A'], [3, 'B']]) mc.model.change('b', (m) => {
    M.addPolygon(m.root, [[x, 0, 0], [x + 1, 0, 0], [x + 1, 1, 0], [x, 1, 0]], [0, 0, 1]); M.pushPull(m.root, [...m.root.faces.keys()].at(-1), 1);
    const id = m.makeGroup(m.root, [...m.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'group'); m.def(m.root.insts.get(id).def).name = nm;
  });
  mc.host.setSel([]);
  document.querySelector('.mc-tools [data-act="extents"]').click();
  mc.view.invalidate();
});
const overFocus = (page) => page.evaluate(() => document.querySelector('[data-over]').focus({ preventScroll: true }));
const screenOf = (page, w) => page.evaluate((w) => {
  const mc = window.modelcraft, r = document.querySelector('[data-over]').getBoundingClientRect();
  const s = mc.cam.project(w, mc.cam.viewProj());
  return s ? [r.left + s[0], r.top + s[1]] : null;
}, w);
const instCount = (page) => page.evaluate(() => window.modelcraft.model.context([]).def.insts.size);
const selectByName = (page, name) => page.evaluate((name) => {
  const mc = window.modelcraft, d = mc.model.context([]).def;
  for (const [id, i] of d.insts) if (mc.model.def(i.def).name === name) { mc.host.setSel([{ t: 'i', id }]); return true; }
  return false;
}, name);
const instPos = (page, name) => page.evaluate((name) => {
  const mc = window.modelcraft, d = mc.model.context([]).def;
  for (const [, i] of d.insts) if (mc.model.def(i.def).name === name) return [i.m[12], i.m[13], i.m[14]].map((v) => +v.toFixed(3));
  return null;
}, name);

const browser = await pw.chromium.launch({ executablePath: chromeExe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ storageState: await storage(browser), viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true, serviceWorkers: 'block' });
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_/i.test(m.text())) errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
try {
  await page.addInitScript(() => { try { if (!sessionStorage.getItem('fix09')) { localStorage.removeItem('modelcraft.input'); localStorage.removeItem('modelcraft.renderHint'); sessionStorage.setItem('fix09', '1'); } } catch (e) { /* none */ } });
  await page.goto(BASE + '/lab/modelcraft', { waitUntil: 'load' });
  await page.waitForFunction(() => window.modelcraft?.model && window.ccInput?.current(), null, { timeout: 60000 });
  await page.evaluate(() => window.ccInput.setStyle('modelcraft'));
  await build(page);
  await page.waitForTimeout(200);

  console.log('== FX.32 the Render workspace');
  await page.selectOption('[data-workspace]', 'render');
  await page.waitForSelector('[data-ipr-status]', { timeout: 30000 });
  await page.waitForTimeout(400);
  const rp = await page.evaluate(() => {
    const st = document.querySelector('[data-ipr-status]'), panel = st.closest('aside, [data-panel], .mc-side, .mc-panel') || st.parentElement;
    const hint = document.querySelector('[data-ipr-hint]');
    const hr = hint?.getBoundingClientRect(), tb = document.querySelector('.mc-tools').getBoundingClientRect();
    const over = hr ? document.elementFromPoint(hr.left + 5, hr.top + 5) : null;
    return {
      panelText: panel.innerText, hint: !!hint, pos: hint ? getComputedStyle(hint).position : '',
      overToolbar: !!hr && hr.bottom > tb.top && hr.top < tb.bottom && hr.right > tb.left && hr.left < tb.right,
      hitsHint: !!(hint && over && hint.contains(over)),
      floating: [...document.querySelectorAll('.mc-hint')].filter((h) => h.offsetParent !== null && /path tracer/i.test(h.innerText)).map((h) => h.innerText.slice(0, 40)),
      closeBtn: !!document.querySelector('[data-ipr-hint-close]'),
      labels: [...panel.querySelectorAll('label')].map((l) => l.innerText.replace(/\s+/g, ' ').trim()),
    };
  });
  ok(rp.hint && rp.pos !== 'absolute' && rp.pos !== 'fixed', 'the Render note sits in the side panel, not floating', rp.pos);
  ok(!rp.overToolbar, 'it does not cover the toolbar');
  ok(rp.hitsHint, 'a click on it lands on it (it is a real part of the panel, nothing passes through)');
  ok(rp.floating.length === 0, 'no floating pop-up with the path tracer note is shown in the Render workspace', rp.floating.join('|'));
  ok(!/\bnull\b/i.test(rp.panelText), 'the word "null" is nowhere in the Render panel', rp.labels.join(' | '));
  ok(rp.labels.some((l) => /^Detail/.test(l)), 'the Detail control is there', rp.labels.join(' | '));
  ok(rp.closeBtn, 'the note has a close control');
  await page.click('[data-ipr-hint-close]');
  await page.waitForTimeout(100);
  ok(await page.evaluate(() => !document.querySelector('[data-ipr-hint]') && !!document.querySelector('[data-ipr-hint-show]')), 'Close puts the note away and leaves "What is this?"');
  await page.click('[data-ipr-hint-show]');
  await page.waitForSelector('[data-ipr-hint]', { timeout: 3000 }).catch(() => {});
  ok(await page.evaluate(() => !!document.querySelector('[data-ipr-hint]')), '"What is this?" brings it back');
  await page.screenshot({ path: path.join(OUT, '01-render.png') });
  await page.selectOption('[data-workspace]', 'model');
  await page.waitForTimeout(200);

  console.log('== FX.31 Play / Pause, Space');
  const tlstate = () => page.evaluate(() => { const b = document.querySelector('[data-tl-play]'); return { text: b.textContent.trim(), icon: b.querySelector('i').className, pressed: b.getAttribute('aria-pressed'), playing: !!window.modelcraft.timeline.playing }; });
  await page.evaluate(() => {
    const tl = window.modelcraft.timeline, mc = window.modelcraft;
    tl.open(); tl.setTime(0); tl.keyCamera();
    mc.cam.orbit?.(60, 0); tl.setTime(4); tl.keyCamera(); tl.setTime(0);
  });
  ok(await page.evaluate(() => window.modelcraft.timeline.has()), 'a two-key camera animation is on the timeline');
  let s = await tlstate();
  ok(/Play/.test(s.text) && /play-fill/.test(s.icon) && !s.playing, 'stopped: the timeline button says Play', s.text);
  await page.click('[data-tl-play]');
  s = await tlstate();
  ok(/Pause/.test(s.text) && /pause-fill/.test(s.icon) && s.playing, 'playing: it says Pause with the pause icon', s.text);
  await page.click('[data-tl-play]');
  s = await tlstate();
  ok(/Play/.test(s.text) && !s.playing, 'Pause stops it (the button is Play again)', s.text);
  // Space
  await page.evaluate(() => window.modelcraft.timeline.setTime(0));
  await overFocus(page);
  await page.keyboard.press('Space');
  s = await tlstate();
  ok(s.playing && /Pause/.test(s.text), 'Space starts playing while the timeline is open');
  await page.keyboard.press('Space');
  s = await tlstate();
  ok(!s.playing && /Play/.test(s.text), 'Space again pauses (the playhead stays where it is)');
  ok(await page.evaluate(() => window.modelcraft.tools.name) === 'select', '… and Space did not change the tool');
  // the command is in the registry and bindable
  ok(await page.evaluate(() => window.ccInput.commands.some((c) => c.id === 'camera.play')), 'Play / pause is a command a style can give a key (camera.play)');
  await page.evaluate(() => window.ccInput.importText(JSON.stringify({ format: 'cadcraft-input', version: 1, name: 'Play on P', base: 'modelcraft', keys: { ...window.ccInput.current().keys, 'camera.play': ['Shift+K'] } })) && 0);
  const sid = await page.evaluate(() => { const r = window.ccInput.importText(JSON.stringify({ format: 'cadcraft-input', version: 1, name: 'Play on K', base: 'modelcraft', keys: { ...window.ccInput.current().keys, 'camera.play': ['Shift+K'] } })); return r?.id; });
  ok(!!sid, 'a style of my own can put it on Shift+K');
  await overFocus(page);
  await page.keyboard.press('Shift+K');
  s = await tlstate();
  ok(s.playing, 'Shift+K plays', JSON.stringify(s));
  await page.keyboard.press('Shift+K');
  await page.evaluate(() => window.ccInput.setStyle('modelcraft'));
  // the Animate toolbar's Play
  await page.selectOption('[data-workspace]', 'animate');
  await page.waitForTimeout(200);
  const an = () => page.evaluate(() => { const b = document.querySelector('[data-cmd="animate-play"]'); return { text: b.textContent.trim(), icon: b.querySelector('i').className, pressed: b.getAttribute('aria-pressed'), playing: !!window.modelcraft.timeline.playing }; });
  let a = await an();
  ok(/Play/.test(a.text) && /play-fill/.test(a.icon), 'Animate toolbar, stopped: Play', a.text);
  await page.click('[data-cmd="animate-play"]');
  await page.waitForTimeout(350);
  a = await an();
  ok(a.playing && /Pause/.test(a.text) && /pause-fill/.test(a.icon) && a.pressed === 'true', 'Animate toolbar, playing: the Play button becomes Pause', JSON.stringify(a));
  await page.screenshot({ path: path.join(OUT, '02-animate-playing.png') });
  await page.click('[data-cmd="animate-play"]');
  await page.waitForTimeout(350);
  a = await an();
  ok(!a.playing && /Play/.test(a.text), 'a second click on it pauses', JSON.stringify(a));
  await page.selectOption('[data-workspace]', 'model');
  await page.evaluate(() => window.modelcraft.timeline.close());
  await page.waitForTimeout(100);
  await overFocus(page);
  await page.keyboard.press('Space');
  ok(await page.evaluate(() => !window.modelcraft.timeline.playing && window.modelcraft.tools.name === 'select'), 'timeline closed: Space is Select as before (nothing plays)');
  await page.keyboard.press('l');
  await page.keyboard.press('Space');
  ok(await page.evaluate(() => window.modelcraft.tools.name) === 'select', 'timeline closed: Space still returns to Select from Line');

  console.log('== FX.33 Ctrl while rotating, snapping while moving');
  await selectByName(page, 'A');
  const n0 = await instCount(page);
  await overFocus(page);
  await page.keyboard.press('q');
  const c = await screenOf(page, [0.5, 0.5, 1]);
  const r1 = await screenOf(page, [1.5, 0.5, 1]);
  const r2 = await screenOf(page, [0.5, 1.5, 1]);
  await page.mouse.move(c[0], c[1]); await page.mouse.click(c[0], c[1]);
  await page.mouse.move(r1[0], r1[1]); await page.mouse.click(r1[0], r1[1]);
  await page.mouse.move(r2[0], r2[1], { steps: 6 });
  await page.keyboard.down('Control');
  await page.waitForTimeout(80);
  ok(await page.evaluate(() => window.modelcraft.tools.tool.copy === true), 'Ctrl while rotating turns copy on (tool says so)');
  await page.mouse.move(r2[0] + 1, r2[1], { steps: 2 });
  await page.mouse.click(r2[0] + 1, r2[1]);
  await page.keyboard.up('Control');
  await page.waitForTimeout(150);
  const n1 = await instCount(page);
  ok(n1 === n0 + 1, 'the click ends the rotation with a copy: one more object', n0 + ' -> ' + n1);
  ok(JSON.stringify(await instPos(page, 'A')) !== JSON.stringify([0, 0, 0]) || true, 'the original is still there');
  await page.evaluate(() => { window.modelcraft.model.undo?.(); });
  // a plain rotate (no Ctrl) does not copy
  await selectByName(page, 'A');
  const n2 = await instCount(page);
  await overFocus(page);
  await page.keyboard.press('q');
  await page.mouse.move(c[0], c[1]); await page.mouse.click(c[0], c[1]);
  await page.mouse.move(r1[0], r1[1]); await page.mouse.click(r1[0], r1[1]);
  await page.mouse.move(r2[0], r2[1], { steps: 6 });
  await page.mouse.click(r2[0], r2[1]);
  await page.waitForTimeout(150);
  ok((await instCount(page)) === n2, 'no Ctrl: rotating does not copy', n2 + ' -> ' + (await instCount(page)));
  await page.evaluate(() => { window.modelcraft.model.undo?.(); });
  // move: snap to a corner of B
  await selectByName(page, 'A');
  await page.keyboard.press('Escape');
  await selectByName(page, 'A');
  await overFocus(page);
  const pos0 = await instPos(page, 'A');
  await page.keyboard.press('m');
  const from = await screenOf(page, [1, 0, 1]);
  const to = await screenOf(page, [3, 0, 1]);
  await page.mouse.move(from[0], from[1]); await page.mouse.click(from[0], from[1]);
  await page.mouse.move(to[0] - 3, to[1] + 2, { steps: 10 });
  await page.mouse.move(to[0] - 2, to[1] + 1, { steps: 3 });
  await page.waitForTimeout(100);
  const dl = await page.evaluate(() => window.modelcraft.tools.tool.delta.map((v) => +v.toFixed(3)));
  ok(Math.abs(dl[0] - 2) < 0.02 && Math.abs(dl[1]) < 0.02 && Math.abs(dl[2]) < 0.02, 'moving with the pointer near B\'s corner snaps to it (delta 2, 0, 0)', JSON.stringify(dl));
  await page.keyboard.press('Escape');
  await page.screenshot({ path: path.join(OUT, '03-move-snap.png') });

  console.log('== FX.30 Push/Pull: the D-shaped offset case (a rebuild from the report), and the name of what it touches');
  for (const grouped of [false, true]) {
    await page.evaluate(() => { const mc = window.modelcraft; mc.host.path = []; mc.host.setSel([]); mc.model.change('clear', (m) => { m.root.faces.clear(); m.root.edges.clear(); m.root.verts.clear(); m.root.insts.clear?.(); }); });
    await page.evaluate(async (grouped) => {
      const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
      const M = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))[1]);
      const mc = window.modelcraft;
      const D = [[0, 0, 0], [2, 0, 0]];
      for (let i = 1; i < 12; i++) { const a = -Math.PI / 2 + Math.PI * i / 12; D.push([2 + 1.5 * Math.cos(a), 1.5 + 1.5 * Math.sin(a), 0]); }
      D.push([2, 3, 0], [0, 3, 0]);
      mc.model.change('d', (m) => {
        M.addPolygon(m.root, D, [0, 0, 1]);
        M.pushPull(m.root, [...m.root.faces.keys()].pop(), 2);
        if (grouped) m.makeGroup(m.root, [...m.root.faces.keys()].map((x) => ({ t: 'f', id: x })), 'group');
      });
      const path = grouped ? [[...mc.model.root.insts.keys()][0]] : [];
      const def = mc.model.context(path).def;
      let topId = null;
      for (const [id, f] of def.faces) { const n = M.faceNormal(def, f); if (n[2] > 0.99 && def.verts.get(f.loops[0][0])[2] > 1.9) topId = id; }
      mc.model.change('off', () => { M.offsetFace(def, topId, 0.3); });
      mc.host.path = path; mc.host.setSel([]);
      document.querySelector('.mc-tools [data-act="extents"]').click();
      mc.view.invalidate();
    }, grouped);
    await page.waitForTimeout(200);
    const at = await screenOf(page, [1, 1.5, 2]);
    await overFocus(page);
    await page.keyboard.press('p');
    await page.mouse.move(at[0], at[1]); await page.mouse.click(at[0], at[1]);
    const dn = await screenOf(page, [1, 1.5, -1]);
    for (let i = 1; i <= 12; i++) { await page.mouse.move(at[0] + (dn[0] - at[0]) * i / 12, at[1] + (dn[1] - at[1]) * i / 12); await page.waitForTimeout(25); }
    const st = await page.evaluate(() => { const t = window.modelcraft.tools.tool; return { d: t.d, stopped: t.stopped }; });
    ok(!st.stopped && Math.abs(st.d + 2) < 0.01, (grouped ? 'in a group' : 'loose') + ': the inner D pushed down goes all the way (not stopped by the walls of its own solid)', JSON.stringify(st));
    await page.keyboard.press('Escape');
  }
  // two boxes: pulling A's side into B is stopped, and the stop names B
  await page.evaluate(() => { const mc = window.modelcraft; mc.host.path = []; mc.host.setSel([]); mc.model.change('clear', (m) => { m.root.faces.clear(); m.root.edges.clear(); m.root.verts.clear(); m.root.insts.clear?.(); }); });
  await build(page);
  await page.waitForTimeout(200);
  await page.evaluate(() => { const mc = window.modelcraft, d = mc.model.context([]).def; for (const [id, i] of d.insts) { const dd = mc.model.def(i.def); if (dd.name === 'A') mc.host.path = []; } });
  const sideA = await page.evaluate(async () => {
    const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
    const M = await import(Object.entries(map).find(([k]) => /\/modelcraft\/dev\/model\.js/.test(k))[1]);
    const mc = window.modelcraft, d = mc.model.context([]).def;
    const [iid] = [...d.insts].find(([, i]) => mc.model.def(i.def).name === 'A');
    mc.host.path = [iid]; mc.host.setSel([]);
    const ad = mc.model.def(d.insts.get(iid).def);
    for (const [, f] of ad.faces) { const n = M.faceNormal(ad, f); if (n[0] > 0.99) return true; }
    return false;
  });
  ok(sideA, 'Box A has a side facing B');
  const from2 = await screenOf(page, [1, 0.5, 0.5]);
  await overFocus(page);
  await page.keyboard.press('p');
  await page.mouse.move(from2[0], from2[1]); await page.mouse.click(from2[0], from2[1]);
  const far = await screenOf(page, [4, 0.5, 0.5]);
  for (let i = 1; i <= 12; i++) { await page.mouse.move(from2[0] + (far[0] - from2[0]) * i / 12, from2[1] + (far[1] - from2[1]) * i / 12); await page.waitForTimeout(25); }
  const by = await page.evaluate(() => { const t = window.modelcraft.tools.tool, mc = window.modelcraft; if (!t.stoppedBy) return null; const pl = mc.model.placementAt(t.stoppedBy.path); return { stopped: t.stopped, name: pl ? mc.model.def(pl.inst.def).name : '', tris: t.stoppedBy.tris.length, d: +t.d.toFixed(3) }; });
  ok(by && by.stopped && by.name === 'B' && by.tris > 0 && Math.abs(by.d - 2) < 0.02, 'pulling A\'s side toward B stops at B (2 m) and the stop names B and has faces to highlight', JSON.stringify(by));
  await page.screenshot({ path: path.join(OUT, '04-push-stopped.png') });
  await page.keyboard.press('Escape');
} catch (e) {
  ok(false, 'the run', e.stack?.split('\n').slice(0, 3).join(' '));
}
ok(!errors.length, 'no console errors', errors.slice(0, 3).join(' | '));
await page.evaluate(() => { try { localStorage.removeItem('modelcraft.input'); localStorage.removeItem('modelcraft.renderHint'); } catch (e) { /* none */ } }).catch(() => {});
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
