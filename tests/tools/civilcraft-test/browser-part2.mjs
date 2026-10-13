#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-part2.mjs — CivilCraft's 0.4 part 2 items (session `bim-civil`) in headless Chromium at
 * https://getcadcraft.com/lab/civilcraft, by real touches, clicks and keys. Grows one section per finished item:
 *   s8  touch (CDP touch events in a touch context): the first touch marks the app .is-touch and tools grow; a tap selects
 *       a survey point, a long press adds a second (Shift+click); a pinch zooms about its middle; the Alignment tool by
 *       taps: the draft bar shows, Undo point takes one back, Finish draws the alignment, the bar goes; a long press
 *       finishes a pad; Cancel drops a draft
 *  w219 files through host.js with a stand-in desktop bridge (window.cadcraftDesktop, an in-memory disk): the project the
 *       app was started with opens; Save writes that same file in place (no dialog); a file double-clicked while running
 *       opens (points CSV → the import dialog); Open uses the native dialog; an export (LandXML) asks where
 *  w27 lasso (W2.7): Shift+drag round points, right first = window lasso (the points inside), left first = crossing; Space
 *       twice = fence (only points on its path); a straight Shift+drag still draws the box; Esc while dragging cancels
 *  x12 assistant tools (X.12): off by default; with civilcraft.settings assistants on: tools/list, site_describe of the
 *       sample, points_select TREE selects 4 on the plan, the banner, Disconnect, Settings › Assistants, turning it off
 *  a12 autosave (1.2): the sample site imported (unsaved), the tab closed without saving (a crash); a new tab offers
 *       "Recover your work?"; Recover brings back the 276 points as unsaved work; Save clears the copy
 *   node tools/civilcraft-test/browser-part2.mjs [--only s8] [--shots <dir>]
 * Run as root: own test admin civilcrafttest-bc2+cadcraft@projectz.xyz via `admin.php up|down bc2` (disabled at the end).
 * The admin-login throttle (10 / 10 min for 127.0.0.1) is shared: run it once per finished item.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : path.join(REPO, 'tmp/shots/civilcraft-part2');
fs.mkdirSync(SHOTS, { recursive: true });
const oi = process.argv.indexOf('--only');
const ONLY = oi > 0 ? new Set(process.argv[oi + 1].split(',')) : null;
const want = (k) => !ONLY || ONLY.has(k);

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd, 'bc2'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const problems = [];
const E = (page, fn, arg) => page.evaluate(fn, arg);

try {
  const cred = admin('up');
  const ctx = await browser.newContext({ viewport: { width: 1180, height: 820 }, hasTouch: true });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', cred.email);
  await page.fill('input[name="password"]', cred.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  if (/\/admin\/login/.test(page.url())) throw new Error('admin sign-in refused (the login throttle is 10 per 10 minutes for 127.0.0.1: wait, do not clear it)');

  if (want('s8')) {
    console.log('== S.8 touch');
    await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
    await page.click('[data-sample]');
    await page.waitForSelector('[data-import][open]');
    await page.click('[data-imp-ok]');
    await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
    const cdp = await ctx.newCDPSession(page);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1, radiusX: 2, radiusY: 2, force: 1 })) });
    const tap = async (x, y) => { await touch('touchStart', [[x, y]]); await touch('touchEnd', []); await page.waitForTimeout(60); };
    const hold = async (x, y) => { await touch('touchStart', [[x, y]]); await page.waitForTimeout(700); await touch('touchEnd', []); await page.waitForTimeout(80); };
    // two survey points on screen, apart
    const pts = await E(page, () => {
      const c = window.civilcraft, r = document.querySelector('[data-over]').getBoundingClientRect(), out = [];
      for (const p of c.project.points) {
        const s = c.toScreen(p.x, p.y);
        if (s.x < r.left + 40 || s.x > r.right - 40 || s.y < r.top + 40 || s.y > r.bottom - 120) continue;
        if (out.every((q) => Math.hypot(q.sx - s.x, q.sy - s.y) > 60)) out.push({ n: p.n, sx: s.x, sy: s.y });
        if (out.length === 2) break;
      }
      return out;
    });
    await tap(pts[0].sx + 3, pts[0].sy - 2);   // a finger lands a few pixels off
    ok(await E(page, () => document.querySelector('[data-civilcraft]').classList.contains('is-touch')), 'the first touch marks the app .is-touch');
    const th = await E(page, () => document.querySelector('[data-cmd="alignment"]').getBoundingClientRect().height);
    ok(th >= 43, 'toolbar buttons are finger-sized (' + th.toFixed(0) + ' px)');
    ok(await E(page, (n) => window.civilcraft.picked.join() === n, pts[0].n), 'a tap selects survey point ' + pts[0].n);
    await hold(pts[1].sx, pts[1].sy);
    const both = await E(page, () => window.civilcraft.picked);
    ok(both.length === 2 && both.includes(pts[0].n) && both.includes(pts[1].n), 'a long press adds point ' + pts[1].n + ' (' + both.join(', ') + ')');
    // pinch about the middle of the plan
    const R = await E(page, () => { const r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    const cx = R.x + R.w / 2, cy = R.y + R.h / 2;
    const st = () => E(page, ([x, y]) => { const v = window.civilcraft.view; return { z: v.zoom, w: v.toWorld(x, y) }; }, [R.w / 2, R.h / 2]);
    const z0 = await st();
    await touch('touchStart', [[cx - 50, cy], [cx + 50, cy]]);
    for (let i = 1; i <= 5; i++) await touch('touchMove', [[cx - 50 - i * 10, cy], [cx + 50 + i * 10, cy]]);
    await touch('touchEnd', []);
    const z1 = await st();
    ok(Math.abs(z1.z / z0.z - 2) < 0.03, 'a pinch 100 → 200 px zooms × ' + (z1.z / z0.z).toFixed(3));
    ok(Math.hypot(z1.w.x - z0.w.x, z1.w.y - z0.w.y) * z1.z < 2, 'and the point under its middle stays put');
    ok(await E(page, () => window.civilcraft.picked.length === 2), 'the pinch selected nothing new');
    // the Alignment tool by taps
    await tap(...await E(page, () => { const r = document.querySelector('[data-cmd="alignment"]').getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }));
    ok(await E(page, () => window.civilcraft.tool === 'alignment'), 'tapping Alignment starts the tool');
    const before = await E(page, () => window.civilcraft.project.state.alignments.length);
    await tap(cx - 200, cy + 60);
    ok(await E(page, () => !document.querySelector('[data-draftbar]').hidden), 'the first point shows the draft bar');
    await tap(cx - 40, cy - 40);
    await tap(cx + 120, cy + 10);
    await tap(cx + 220, cy + 90);
    await page.screenshot({ path: path.join(SHOTS, 's8-01-draftbar.png') });
    const center = (sel) => E(page, (s) => { const r = document.querySelector(s).getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; }, sel);
    await tap(...await center('[data-draft-act="back"]'));
    ok(/Took the last point back; 3 points left/.test(await page.textContent('[data-status]')), 'Undo point takes the last one back (3 left)');
    await tap(...await center('[data-draft-act="finish"]'));
    const al = await E(page, () => { const s = window.civilcraft.project.state; return { n: s.alignments.length, pis: s.alignments.at(-1)?.pis.length }; });
    ok(al.n === before + 1 && al.pis === 3, 'Finish draws the alignment with its 3 PIs');
    ok(await E(page, () => document.querySelector('[data-draftbar]').hidden), 'and the draft bar goes');
    // a pad finished by a long press
    await E(page, () => window.civilcraft.command('pad'));
    const pads0 = await E(page, () => window.civilcraft.project.state.pads.length);
    await tap(cx - 80, cy - 140); await tap(cx + 40, cy - 140); await tap(cx + 40, cy - 60);
    await hold(cx - 80, cy - 60);
    ok(await E(page, (n) => window.civilcraft.project.state.pads.length === n + 1, pads0), 'a long press finishes a pad (3 corners)');
    // Cancel drops a draft
    await E(page, () => window.civilcraft.command('pad'));
    await tap(cx - 150, cy - 150); await tap(cx - 100, cy - 150);
    await tap(...await center('[data-draft-act="cancel"]'));
    ok(await E(page, (n) => window.civilcraft.project.state.pads.length === n + 1 && document.querySelector('[data-draftbar]').hidden, pads0), 'Cancel drops the draft (no new pad) and hides the bar');
    await page.screenshot({ path: path.join(SHOTS, 's8-02-after.png') });
  }
  if (want('w219')) {
    console.log('== W2.19 files through host.js (stand-in desktop bridge)');
    const dctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await dctx.addCookies(await ctx.cookies());
    const sample = fs.readFileSync(path.join(REPO, 'public_html/assets/apps/civilcraft/dev/sample-site.csv'), 'utf8');
    await dctx.addInitScript(([csv]) => {
      const enc = (t) => new TextEncoder().encode(t);
      const files = new Map([['/home/u/Site/points.csv', enc(csv)]]);
      const calls = [];
      let listener = null;
      const launch = [];
      window.__desk = { files, calls, launch, fire: (p) => listener && listener(p), next: { open: null, save: null } };
      try { const pj = sessionStorage.getItem('__proj'); if (pj) { files.set('/home/u/Site/Site.civilcraft.json', enc(pj)); launch.push('/home/u/Site/Site.civilcraft.json'); } } catch { /* first load */ }
      window.cadcraftDesktop = {
        version: 1,
        async openDialog(o) { calls.push(['open', JSON.stringify(o)]); return window.__desk.next.open; },
        async saveDialog(o) { calls.push(['save', JSON.stringify(o)]); return window.__desk.next.save; },
        async readFile(p) { calls.push(['read', p]); if (!files.has(p)) throw new Error('not found'); return files.get(p); },
        async writeFile(p, b) { calls.push(['write', p, b.length]); files.set(p, b); },
        async stat(p) { return files.has(p) ? { size: files.get(p).length, mtime: 42 } : null; },
        async launchFiles() { return launch.splice(0); },
        onOpenFiles(cb) { listener = cb; },
      };
    }, [sample]);
    const dp = await dctx.newPage();
    dp.on('console', (m) => { if (m.type() === 'error') problems.push('desktop console: ' + m.text()); });
    dp.on('pageerror', (e) => problems.push('desktop pageerror: ' + e.message));
    const calls = () => dp.evaluate(() => window.__desk.calls);
    // a real project file first: the sample site saved by the app itself
    await dp.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
    await dp.click('[data-sample]');
    await dp.waitForSelector('[data-import][open]');
    await dp.click('[data-imp-ok]');
    await dp.waitForFunction(() => window.civilcraft.project.points.length === 276);
    await E(dp, () => sessionStorage.setItem('__proj', JSON.stringify(window.civilcraft.project.toJSON())));
    await E(dp, () => { window.civilcraft.project.saved = window.civilcraft.project.version; });   // no unsaved prompt on reload
    await dp.reload({ waitUntil: 'networkidle' });
    await dp.waitForFunction(() => window.civilcraft.project.points.length === 276, null, { timeout: 30000 });
    ok(/Opened Site\.civilcraft\.json/.test(await dp.textContent('[data-status]')), 'the project the app was started with opens (Site.civilcraft.json, 276 points)');
    await E(dp, () => window.civilcraft.project.change('Rename project', (s) => { s.name = 'Renamed site'; }));
    await E(dp, () => { window.__desk.calls.length = 0; });
    await E(dp, () => window.civilcraft.command('save'));
    await dp.waitForFunction(() => /^Saved Site\.civilcraft\.json\.$/.test(document.querySelector('[data-status]').textContent), null, { timeout: 15000 });
    const c1 = await calls();
    ok(!c1.some((c) => c[0] === 'save') && c1.some((c) => c[0] === 'write' && c[1] === '/home/u/Site/Site.civilcraft.json'), 'Save writes that same file in place, with no dialog');
    const back = await E(dp, () => JSON.parse(new TextDecoder().decode(window.__desk.files.get('/home/u/Site/Site.civilcraft.json'))).name || null);
    ok(back === 'Renamed site', 'the file on disk now holds the change (' + back + ')');
    ok(await E(dp, () => !window.civilcraft.project.dirty), 'and the project counts as saved');
    // a points file double-clicked while running
    await E(dp, () => window.__desk.fire(['/home/u/Site/points.csv']));
    await dp.waitForSelector('[data-import][open]');
    ok(true, 'a points file double-clicked while running opens the import dialog');
    await dp.click('[data-import] [data-close]');
    // Open → the native dialog
    await E(dp, () => { window.__desk.next.open = null; window.__desk.calls.length = 0; });
    await E(dp, () => window.civilcraft.command('open'));
    ok((await calls()).some((c) => c[0] === 'open' && /"landxml"/.test(c[1]) && /"multiple":true/.test(c[1])), 'Open uses the native dialog (several files, the CivilCraft types)');
    // an export asks where
    await E(dp, () => { window.__desk.next.save = '/home/u/Site/out.xml'; window.__desk.calls.length = 0; });
    await E(dp, () => window.civilcraft.command('landxml'));
    await dp.waitForTimeout(600);
    const c3 = await calls();
    ok(c3.some((c) => c[0] === 'save') && c3.some((c) => c[0] === 'write' && c[1] === '/home/u/Site/out.xml'), 'LandXML export goes through the save dialog');
    await dp.screenshot({ path: path.join(SHOTS, 'w219-01-desktop-bridge.png') });
    await dctx.close();
  }
  if (want('w27')) {
    console.log('== W2.7 lasso');
    const lctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await lctx.addCookies(await ctx.cookies());
    const lp = await lctx.newPage();
    lp.on('console', (m) => { if (m.type() === 'error') problems.push('lasso console: ' + m.text()); });
    lp.on('pageerror', (e) => problems.push('lasso pageerror: ' + e.message));
    await lp.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
    await lp.click('[data-sample]');
    await lp.waitForSelector('[data-import][open]');
    await lp.click('[data-imp-ok]');
    await lp.waitForFunction(() => window.civilcraft.project.points.length === 276);
    await lp.click('[data-cmd="select"]');
    const R = await E(lp, () => { const r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    const c = { x: R.x + R.w / 2, y: R.y + R.h / 2 }, rad = Math.min(R.w, R.h) / 5;
    // which points lie inside a circle of radius r about c (screen), and which near its rim (left out of the comparison)
    const ring = (r) => E(lp, ([c, r]) => {
      const C = window.civilcraft, inn = [], rim = [];
      for (const p of C.project.points) { const s = C.toScreen(p.x, p.y), d = Math.hypot(s.x - c.x, s.y - c.y); if (d < r - 6) inn.push(p.n); else if (d < r + 6) rim.push(p.n); }
      return { inn, rim };
    }, [c, r]);
    const status = () => E(lp, () => document.querySelector('[data-status]')?.textContent || '');
    const picked = () => E(lp, () => window.civilcraft.picked);
    const clear = async () => { await lp.mouse.move(c.x, c.y); await lp.keyboard.press('Escape'); await lp.click('[data-cmd="select"]'); };
    const circle = (dir, n = 40) => Array.from({ length: n + 1 }, (_, i) => { const a = Math.PI / 2 - dir * (i / n) * Math.PI * 2; return { x: c.x + rad * Math.cos(a), y: c.y + rad * Math.sin(a) }; });   // from the bottom, dir 1 = right first
    const drag = async (path, during) => {
      await lp.keyboard.down('Shift');
      await lp.mouse.move(path[0].x, path[0].y); await lp.mouse.down();
      for (const q of path.slice(1)) await lp.mouse.move(q.x, q.y, { steps: 2 });
      const said = await status();
      if (during) await during();
      await lp.mouse.up(); await lp.keyboard.up('Shift');
      await lp.waitForTimeout(100);
      return said;
    };
    const { inn, rim } = await ring(rad);
    ok(inn.length >= 3, 'the test circle holds ' + inn.length + ' survey points');
    let said = await drag(circle(1));
    let got = await picked();
    ok(/^Window lasso/.test(said), 'a Shift+drag that bends, moving right first, is a window lasso: "' + said + '"');
    ok(inn.every((n) => got.includes(n)) && got.every((n) => inn.includes(n) || rim.includes(n)), 'it selects the points inside the outline (' + got.length + ' of ' + inn.length + ' inside, ' + rim.length + ' on the rim)');
    ok(/added/.test(await status()), 'the status says how many were added: "' + await status() + '"');
    await lp.screenshot({ path: path.join(SHOTS, 'w27-01-window.png') });
    await clear();
    ok((await picked()).length === 0, 'Esc clears the selection');
    said = await drag(circle(-1));
    got = await picked();
    ok(/^Crossing lasso/.test(said) && inn.every((n) => got.includes(n)), 'moving left first: a crossing lasso (' + said.slice(0, 16) + '…), the same points inside');
    await clear();
    // Space twice while dragging: window → crossing → fence; a fence along a straight row picks what it passes over
    let shot = '';
    said = await drag(circle(1), async () => { await lp.keyboard.press(' '); await lp.keyboard.press(' '); shot = await status(); await lp.screenshot({ path: path.join(SHOTS, 'w27-02-fence.png') }); });
    ok(/^Fence/.test(shot), 'Space twice while dragging turns it into a fence: "' + shot + '"');
    got = await picked();
    ok(got.length < inn.length + rim.length && got.every((n) => inn.includes(n) || rim.includes(n)), 'the fence picks only points on its path (' + got.length + ')');
    await clear();
    // a straight diagonal Shift+drag still draws the box
    const a0 = { x: c.x - rad, y: c.y - rad }, b0 = { x: c.x + rad, y: c.y + rad };
    const boxIn = await E(lp, ([a, b]) => window.civilcraft.project.points.filter((p) => { const s = window.civilcraft.toScreen(p.x, p.y); return s.x > a.x + 2 && s.x < b.x - 2 && s.y > a.y + 2 && s.y < b.y - 2; }).length, [a0, b0]);
    await drag(Array.from({ length: 11 }, (_, i) => ({ x: a0.x + (b0.x - a0.x) * i / 10, y: a0.y + (b0.y - a0.y) * i / 10 })));
    got = await picked();
    ok(got.length >= boxIn && /added|No survey points/.test(await status()), 'a straight Shift+drag still draws a box (' + got.length + ' points, ' + boxIn + ' well inside)');
    await clear();
    await drag(circle(1), async () => { await lp.keyboard.press('Escape'); });
    ok((await picked()).length === 0, 'Esc while dragging cancels the lasso: nothing selected');
    await lctx.close();
  }
  if (want('x12')) {
    console.log('== X.12 assistant tools (host.control)');
    const xctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await xctx.addCookies(await ctx.cookies());
    const xp = await xctx.newPage();
    xp.on('console', (m) => { if (m.type() === 'error') problems.push('x12 console: ' + m.text()); });
    xp.on('pageerror', (e) => problems.push('x12 pageerror: ' + e.message));
    let id = 0, sid = 'test';
    const rpc = (method, params) => xp.evaluate(([m, p, i, s]) => window.civilcraftControl.handle({ jsonrpc: '2.0', id: i, method: m, params: p }, s), [method, params, ++id, sid]);
    const call = async (name, args) => (await rpc('tools/call', { name, arguments: args })).result;
    await xp.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
    let a = await rpc('tools/list', {});
    ok(a.error && a.error.code === -32001, 'assistants off (the default): refused (' + (a.error && a.error.code) + ')');
    await xp.evaluate(() => localStorage.setItem('civilcraft.settings', JSON.stringify({ assistants: { enabled: true, groups: ['read', 'edit'] } })));
    await xp.reload({ waitUntil: 'networkidle' });
    await xp.click('[data-sample]');
    await xp.waitForSelector('[data-import][open]');
    await xp.click('[data-imp-ok]');
    await xp.waitForFunction(() => window.civilcraft.project.points.length === 276);
    a = await rpc('initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'browser-part2', version: '1' } });
    ok(a.result?.serverInfo?.title === 'CivilCraft', 'turned on: initialize answers as CivilCraft');
    a = await rpc('tools/list', {});
    const listed = (a.result?.tools || []).map((x) => x.name);
    ok(['site_describe', 'points_list', 'surface_elevation', 'alignment_station', 'points_select'].every((n) => listed.includes(n)), 'tools/list: ' + listed.join(', '));
    let r = await call('site_describe', {});
    ok(r.structuredContent?.points?.count === 276 && r.structuredContent.surfaces.existingGround?.triangles > 0, 'site_describe: 276 points, the surface (' + r.structuredContent?.surfaces?.existingGround?.triangles + ' triangles)');
    r = await call('points_select', { group: 'TREE' });
    const sel = await xp.evaluate(() => window.civilcraft.picked.length);
    ok(r.structuredContent?.selected === 4 && sel === 4 && /4 /.test(await xp.evaluate(() => document.querySelector('[data-status]')?.textContent || '')), 'points_select TREE: the 4 trees are selected on the plan, the status says so');
    await xp.screenshot({ path: path.join(SHOTS, 'x12-01-selected.png') });
    const ban = await xp.evaluate(() => { const b = document.querySelector('[data-assist-banner]'); return b && !b.hidden ? b.textContent : null; });
    ok(ban && /browser-part2/.test(ban), 'the banner names the connected assistant: "' + (ban || '').trim().slice(0, 80) + '…"');
    await xp.click('[data-assist-disconnect]');
    a = await rpc('tools/list', {});
    ok(a.error?.code === -32002 && await xp.evaluate(() => document.querySelector('[data-assist-banner]').hidden), 'Disconnect: the banner goes and that session is refused');
    sid = 'test-2';
    await xp.click('[data-settings-open]');
    await xp.waitForSelector('dialog[data-app-settings][open]', { timeout: 10000 });
    await xp.click('[data-settings-tab="app"]');
    const form = await xp.evaluate(() => { const q = (n) => document.querySelector('[name="' + n + '"]'); return { on: q('cvAssist')?.checked, edit: q('cvAssistEdit')?.checked, rows: document.querySelectorAll('[data-cv-assist-log] li').length }; });
    ok(form.on && form.edit && form.rows >= 2, 'Settings › CivilCraft › Assistants: on, select allowed, the activity lists the 2 calls (' + form.rows + ' rows)');
    await xp.uncheck('[name="cvAssist"]');
    a = await rpc('tools/list', {});
    ok(a.error?.code === -32001, 'turning it off refuses everything at once');
    await xctx.close();
  }
  if (want('a12')) {
    console.log('== 1.2 autosave and recovery');
    const actx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
    await actx.addCookies(await ctx.cookies());
    const watch = (p) => { p.on('console', (m) => { if (m.type() === 'error') problems.push('autosave console: ' + m.text()); }); p.on('pageerror', (e) => problems.push('autosave pageerror: ' + e.message)); };
    let ap = await actx.newPage(); watch(ap);
    await ap.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
    await ap.evaluate(() => new Promise((r) => { const q = indexedDB.deleteDatabase('cadcraft-autosave'); q.onsuccess = q.onerror = q.onblocked = () => r(); }));
    await ap.reload({ waitUntil: 'networkidle' });
    await ap.click('[data-sample]');
    await ap.waitForSelector('[data-import][open]');
    await ap.click('[data-imp-ok]');
    await ap.waitForFunction(() => window.civilcraft.project.points.length === 276);
    await E(ap, () => window.civilcraft.project.change('Rename project', (s) => { s.name = 'Crash test'; }));
    await ap.waitForTimeout(3500);
    await ap.close({ runBeforeUnload: false });
    ap = await actx.newPage(); watch(ap);
    await ap.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
    await ap.waitForSelector('[data-autosave-dialog][open]', { timeout: 15000 });
    const rows = await ap.$$eval('[data-autosave-row]', (r) => r.map((x) => x.textContent));
    ok(rows.length === 1 && /Crash test\.civilcraft\.json/.test(rows[0]), 'a new tab offers "Recover your work?" with the project (' + rows.length + ' row)');
    await ap.screenshot({ path: path.join(SHOTS, 'a12-01-recover-dialog.png') });
    await ap.click('[data-autosave-recover]');
    await ap.waitForFunction(() => window.civilcraft.project.points.length === 276 && window.civilcraft.project.state.name === 'Crash test', null, { timeout: 30000 });
    ok(true, 'Recover brings back the 276 points and the name');
    ok(await E(ap, () => window.civilcraft.project.dirty), 'as unsaved work');
    const [dl] = await Promise.all([ap.waitForEvent('download', { timeout: 15000 }), E(ap, () => window.civilcraft.command('save'))]);
    ok(/Crash test\.civilcraft\.json$/.test(dl.suggestedFilename()), 'Save downloads "Crash test.civilcraft.json"');
    await ap.waitForTimeout(800);
    await ap.close({ runBeforeUnload: false });
    ap = await actx.newPage(); watch(ap);
    await ap.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
    await ap.waitForTimeout(1500);
    ok(!(await ap.$('[data-autosave-dialog][open]')), 'after saving, a new tab offers nothing');
    await actx.close();
  }
  await ctx.close();
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
} finally {
  ok(!problems.length, 'no console errors', problems.slice(0, 5).join(' | '));
  await browser.close();
  admin('down');
}
console.log(`\n${pass} passed, ${fail} failed (shots: ${SHOTS})`);
process.exit(fail ? 1 : 0);
