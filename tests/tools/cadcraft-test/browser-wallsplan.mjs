#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-wallsplan.mjs — 0.9 walls-plan-09 in the real page (/lab/cadcraft): the stored join record (FX.59) and the wall tool's recipes
 * (WT.2 shapes, WT.4 split and rejoin, WT.3 locks) typed at the command line as a person would; picks go through the page's own
 * host.pickAt. Properties shows the new rows. No console errors.
 * walls-plan-10: the toolbar's Walls group and its icons (three tools clicked), WALLDISJOIN, an end grip dragged with the real mouse (the joined wall keeps
 * its direction; Alt breaks the join; the corner grip with both walls selected), the padlock mark (drawn, clicked), the ribbon's Walls tab, a layout.
 *   node tools/cadcraft-test/browser-wallsplan.mjs [--shots <dir>]      (run as root)
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2), si = args.indexOf('--shots'), SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== '' ? ' — ' + JSON.stringify(x) : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
page.setDefaultTimeout(10000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const ev = (fn, arg) => page.evaluate(fn, arg);
const shot = async (n) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, n + '.png') }); };
const type = async (s) => { await page.keyboard.type(s); await page.keyboard.press('Enter'); await page.waitForTimeout(60); };
const cmd = async (...parts) => { for (const s of parts) await type(s); };
const walls = () => ev(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'insert' && e.xd?.CADCRAFT_WALL).map((e) => ({ id: e.id, block: e.block, x: e.x, y: e.y, data: JSON.parse(e.xd.CADCRAFT_WALL.map((r) => r[1]).join('')) })));
const wallsNow = () => ev(() => [...window.cadcraft.doc.model.values()].filter((e) => e.type === 'insert' && e.xd?.CADCRAFT_WALL).map((e) => {
  const d = JSON.parse(e.xd.CADCRAFT_WALL.map((r) => r[1]).join(''));
  return { id: e.id, x: e.x, y: e.y, a: [e.x + d.a[0], e.y + d.a[1]], b: [e.x + d.b[0], e.y + d.b[1]], t: d.t, g: d.g || '', jn: d.jn || [], jo: d.jo || '', h: d.h || [], ops: d.ops };
}));
const clickAt = async (x, y) => { await ev(([px, py]) => window.cadcraft.engine.click({ x: px, y: py }, { x: px, y: py }), [x, y]); await page.waitForTimeout(60); };
const near = (a, b, e = 1e-3) => Math.abs(a - b) <= e;
try {
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);
  await page.mouse.click(700, 450);

  console.log('\n== FX.59 joins are stored');
  await cmd('WALLRECT', '0,0', '5000,4000');
  await type('ZOOM'); await type('E');
  let w = await wallsNow();
  ok(w.length === 4, 'WALLRECT: four walls', w.length);
  ok(w.every((x) => /^w[0-9a-z]{12}$/.test(x.g) && x.jn.length === 2 && x.jn.every((r) => r.k === 'L')), 'each has its own id and two stored L records', w.map((x) => [x.g, x.jn.length]));
  await shot('rect');
  const before = JSON.stringify(await wallsNow());
  const topId = w.find((x) => near(x.a[1], 4000) && near(x.b[1], 4000)).id;
  await ev((id) => window.cadcraft.host.setSelection(new Set([id])), topId);
  await cmd('MOVE', '0,0', '0,500');
  w = await wallsNow();
  const sides = w.filter((x) => near(x.a[0], x.b[0]));
  ok(sides.length === 2 && sides.every((x) => near(Math.abs(x.b[1] - x.a[1]), 4500)), 'MOVE the top wall 500 up: the side walls lengthen to 4500 and every corner stays joined', sides.map((x) => [x.a, x.b]));
  ok(w.every((x) => x.jn.length === 2), 'the stored records are all still there');
  await type('UNDO');
  ok(JSON.stringify(await wallsNow()) === before, 'one undo puts every wall and record back');

  console.log('\n== an older drawing: joins found once');
  await ev(() => {
    const d = window.cadcraft.doc;
    for (const e of [...d.model.values()]) if (e.xd?.CADCRAFT_WALL) {
      const j = JSON.parse(e.xd.CADCRAFT_WALL.map((r) => r[1]).join('')); delete j.g; delete j.jn;
      d.model.set(e.id, { ...e, xd: { ...e.xd, CADCRAFT_WALL: [[1000, JSON.stringify(j)]] } });
    }
  });
  w = await wallsNow();
  ok(w.every((x) => !x.g && x.jn.length === 0), 'setup: no ids and no records (as an older file opens)');
  await ev((id) => window.cadcraft.host.setSelection(new Set([id])), topId);
  await cmd('MOVE', '0,0', '0,500');
  w = await wallsNow();
  ok(w.every((x) => x.g && x.jn.length === 2), 'the first change gives every wall an id and stores its two joins', w.map((x) => x.jn.length));
  ok(w.filter((x) => near(x.a[0], x.b[0])).every((x) => near(Math.abs(x.b[1] - x.a[1]), 4500)), 'and the joined walls followed from the stored joins');
  await type('UNDO');

  console.log('\n== WT.2 shapes');
  await cmd('ERASE'); // no selection: ends at the prompt
  await page.keyboard.press('Escape');
  await ev(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of [...d.model.values()]) d.remove(e.id); }); });
  await cmd('WALLPOLY', '6', '0,0', 'I', '1000,0');
  w = await wallsNow();
  ok(w.length === 6 && w.every((x) => near(Math.hypot(x.b[0] - x.a[0], x.b[1] - x.a[1]), 1000, 0.01) && x.jn.length === 2), 'WALLPOLY: a hexagon of six joined walls, each 1000 long');
  await cmd('WALLARC', '5000,0', '#6000,0', '#5000,1000');   // # = absolute: since 0.9.1 a typed x,y at a next-point prompt counts from the last point
  w = await wallsNow();
  ok(w.length === 12, 'WALLARC: a quarter circle is six chords (12 walls now)', w.length);
  await type('ZOOM'); await type('E');
  await shot('shapes');

  console.log('\n== WT.4 split and rejoin');
  await ev(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of [...d.model.values()]) d.remove(e.id); }); });
  await cmd('WALL', '0,0', '6000,0', '');
  await cmd('DOOR', '1000,100', '');
  await type('ZOOM'); await type('E');
  await type('WALLSPLIT');
  await clickAt(3000, 50);
  await type('3000,0');
  w = await wallsNow();
  ok(w.length === 2 && w.some((x) => near(x.b[0], 3000)) && w.some((x) => near(x.a[0], 3000)), 'WALLSPLIT at 3000: two walls', w.map((x) => [x.a, x.b]));
  ok(w.every((x) => x.jn.length === 1 && x.jn[0].k === 'L'), 'the parts stay joined in line (one stored record each)');
  ok(w.reduce((n, x) => n + x.ops.length, 0) === 1, 'the door went with its part');
  await shot('split');
  await type('UNDO');
  ok((await wallsNow()).length === 1, 'undo makes it one wall again');
  await type('REDO');
  await type('WALLREJOIN');
  await clickAt(300, 50);
  await clickAt(4500, 50);
  w = await wallsNow();
  ok(w.length === 1 && near(w[0].a[0], 0) && near(w[0].b[0], 6000), 'WALLREJOIN: one wall again, 0 to 6000', w.map((x) => [x.a, x.b]));

  console.log('\n== WT.3 locks');
  await ev(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of [...d.model.values()]) d.remove(e.id); }); });
  await cmd('WALLRECT', '0,0', '4000,3000');
  await type('ZOOM'); await type('E');
  await type('WALLHOLD');
  await clickAt(2000, 3050);
  await clickAt(2000, 50);
  await type('K');
  w = await wallsNow();
  ok(w.some((x) => x.h.length === 1 && x.h[0].kind === 'line' && near(x.h[0].off, 3000)), 'WALLHOLD: the north wall is locked to the south wall, 3000 apart', w.map((x) => x.h));
  const south = w.find((x) => near(x.a[1], 0) && near(x.b[1], 0));
  await ev((id) => window.cadcraft.host.setSelection(new Set([id])), south.id);
  await cmd('MOVE', '0,0', '0,500');
  w = await wallsNow();
  const north = w.find((x) => x.h.length === 1);
  ok(near(north.a[1], 3500) && near(north.b[1], 3500), 'moving the south wall 500 north: the locked north wall follows to y = 3500', [north.a, north.b]);
  await shot('locks');

  console.log('\n== Properties');
  await ev((id) => window.cadcraft.host.setSelection(new Set([id])), south.id);
  await page.waitForTimeout(300);
  const propsText = await page.locator('.cc-right, [data-props]').first().innerText().catch(() => '');
  ok(/Location line/.test(propsText) && /Disallow join at start/.test(propsText) && /Length/.test(propsText), 'Properties shows Length, Location line and the two Disallow join switches', propsText.slice(0, 400));
  await shot('properties');
  await page.keyboard.press('Escape');

  // ------------------------------------------------------------------------------------------------ walls-plan-10
  const clear = () => ev(() => { const d = window.cadcraft.doc; d.change('clear', () => { for (const e of [...d.model.values()]) d.remove(e.id); }); window.cadcraft.host.setSelection(new Set()); });
  /** A world point as a point of the page (for real mouse clicks on the drawing). */
  const client = (x, y) => ev(([wx, wy]) => { const v = window.cadcraft.view, r = document.querySelector('[data-over]').getBoundingClientRect(), q = v.toScreen(wx, wy); return { x: r.left + v.x0 + q.x, y: r.top + v.y0 + q.y }; }, [x, y]);
  const mouseAt = async (x, y, opts = {}) => { const c = await client(x, y); await page.mouse.move(c.x, c.y); await page.waitForTimeout(40); if (opts.alt) await page.keyboard.down('Alt'); await page.mouse.click(c.x, c.y); if (opts.alt) await page.keyboard.up('Alt'); await page.waitForTimeout(120); return c; };
  const select = async (...ids) => { await ev((list) => window.cadcraft.host.setSelection(new Set(list)), ids); await page.waitForTimeout(150); };
  const running = () => ev(() => window.cadcraft.engine.running || '');
  const esc = async () => { await page.keyboard.press('Escape'); await page.keyboard.press('Escape'); await page.waitForTimeout(80); };
  const roomNow = async () => { const all = await wallsNow(); return { all, s: all.find((x) => near(x.a[1], 0, 1) && near(x.a[0], 0, 1) && Math.abs(x.b[0] - 4000) < 1500), e: all.find((x) => near(x.b[0], 4000, 1) && near(x.b[1], 3000, 1)) }; };
  // the drafting aids that would move a clicked point (object snap, polar, ortho) off, so a click lands where the mouse is
  await ev(() => { for (const k of ['osnap', 'polar', 'ortho', 'otrack', 'gsnap']) { const b = document.querySelector('[data-toggle="' + k + '"]'); if (b && b.getAttribute('aria-pressed') === 'true') b.click(); } });

  console.log('\n== WT.1 the Walls group on the toolbar (walls-plan-10)');
  await clear();
  const tb = await ev(() => {
    const g = document.querySelector('.cc-tools [data-tb-key="Walls"]');
    if (!g) return null;
    const items = [...g.querySelectorAll('[data-cmd]')].map((b) => ({ cmd: b.dataset.cmd, menu: b.getAttribute('role') === 'menuitem', svg: !!b.querySelector('svg.ccic'), key: b.querySelector('svg.ccic')?.dataset.ccic || '', bi: !!b.querySelector('i.bi'), w: b.querySelector('svg.ccic')?.getBoundingClientRect().width || 0, drawn: (b.querySelector('svg.ccic')?.childElementCount || 0) > 0 }));
    return { label: g.querySelector('.cc-tool-label')?.textContent.trim(), items };
  });
  ok(tb && tb.label === 'Walls', 'the toolbar has a Walls group', tb && tb.label);
  const WANT = ['WALL', 'WALLRECT', 'WALLROT', 'WALLPOLY', 'WALLARC', 'WALLTAN', 'WALLPICK', 'WALLTRACE', 'WALLSPLIT', 'WALLSPLITGAP', 'WALLDELSEG', 'WALLREJOIN', 'WALLDIM', 'WALLOFFSET', 'WALLSTRETCH', 'WALLHOLD', 'WALLHOLDDIM', 'WALLUNHOLD', 'WALLHOLDS', 'WALLGRID', 'WALLJOINS', 'WALLDISJOIN', 'WALLJOINSTYLE'];
  ok(tb && WANT.every((c) => tb.items.some((i) => i.cmd === c)) && tb.items.length === WANT.length, 'it holds every plan wall tool (23 with Split with gap and Join style): 4 buttons and 19 in its More menu', tb && [tb.items.filter((i) => !i.menu).length, tb.items.filter((i) => i.menu).length]);
  const noSvg = tb ? tb.items.filter((i) => !i.svg || !i.drawn || !(i.w > 8)).map((i) => i.cmd) : ['none'];
  ok(noSvg.length === 1 && noSvg[0] === 'WALLUNHOLD' && tb.items.find((i) => i.cmd === 'WALLUNHOLD').bi, 'each shows its drawing from the CadCraft icon set (WALLUNHOLD has none there: it keeps its Bootstrap icon); no blank', noSvg);
  ok(tb && tb.items.find((i) => i.cmd === 'WALLDISJOIN').key === 'walldisjoin' && tb.items.find((i) => i.cmd === 'WALLRECT').key === 'wallrect' && tb.items.find((i) => i.cmd === 'WALLSPLITGAP').key === 'wallsplitgap', 'the icons are the tools\' own (walldisjoin, wallrect, wallsplitgap)');
  await shot('toolbar-walls');
  // a click on three of them, as a person does
  await page.click('.cc-tools [data-tb-key="Walls"] button[data-cmd="WALLRECT"]');
  await page.waitForTimeout(150);
  ok((await running()) === 'WALLRECT', 'a click on Rectangle starts WALLRECT', await running());
  await cmd('0,0', '4000,3000');
  ok((await wallsNow()).length === 4, 'and its two corners make four walls');
  await type('ZOOM'); await type('E'); await type('ZOOM'); await type('0.5X');
  await page.click('.cc-tools [data-tb-key="Walls"] button[data-cmd="WALLSPLIT"]');
  await page.waitForTimeout(150);
  ok((await running()) === 'WALLSPLIT', 'a click on Split starts WALLSPLIT', await running());
  await esc();
  await page.click('.cc-tools [data-tb-key="Walls"] [data-group-menu] > summary');
  await page.waitForTimeout(150);
  await shot('toolbar-walls-menu');
  await page.click('.cc-tools [data-tb-key="Walls"] [role="menuitem"][data-cmd="WALLDISJOIN"]');
  await page.waitForTimeout(150);
  ok((await running()) === 'WALLDISJOIN', 'More › Disallow join starts WALLDISJOIN', await running());

  console.log('\n== FX.70 Disallow join as a command');
  await clickAt(3900, 50);   // the south wall, near its east end
  let R = await roomNow();
  ok(R.s.jo === 'b' && R.s.jn.length === 1 && R.e.jn.length === 1, 'picked near the south wall\'s east end: Disallow join is on at that end and the corner\'s record left both walls', [R.s.jo, R.s.jn.length, R.e.jn.length]);
  await type('WALLDISJOIN');
  await clickAt(3900, 50);
  R = await roomNow();
  ok(!R.s.jo && R.s.jn.length === 2 && R.e.jn.length === 2, 'the same pick again allows it: the corner is joined again', [R.s.jo, R.s.jn.length]);

  console.log('\n== WT.5 the join style of a corner');
  const blockLines = (id) => ev((wid) => { const d = window.cadcraft.doc, e = d.get(wid); return d.blocks.get(e.block).entities.filter((l) => l.type === 'line').map((l) => [l.x1, l.y1, l.x2, l.y2].map((v) => Math.round(v * 1e3) / 1e3 + 0).join(',')); }, id);
  await page.click('.cc-tools [data-tb-key="Walls"] [data-group-menu] > summary');
  await page.waitForTimeout(120);
  await page.click('.cc-tools [data-tb-key="Walls"] [role="menuitem"][data-cmd="WALLJOINSTYLE"]');
  await page.waitForTimeout(150);
  ok((await running()) === 'WALLJOINSTYLE', 'More › Join style starts WALLJOINSTYLE', await running());
  await mouseAt(4000, 0);                       // a real click on the corner of the south and east walls
  R = await roomNow();
  const sRec = R.s.jn.find((x) => x.me === 'end'), eRec = R.e.jn.find((x) => x.me === 'start');
  ok(sRec.st === 'butt' && eRec.st === 'butt' && (sRec.th ? 1 : 0) + (eRec.th ? 1 : 0) === 1, 'a click on the corner: Butt, on both walls\' records, one of them running through', [sRec, eRec]);
  // the wall that runs through reaches the other's outer face (50 past the corner) and ends there; the one that stops begins on the other's inner side
  const sL = await blockLines(R.s.id), eL = await blockLines(R.e.id);
  ok(sRec.th ? (sL.includes('50,50,4050,50') && sL.includes('4050,-50,4050,50') && eL.includes('50,50,50,3050')) : (sL.includes('-50,-50,3950,-50') && eL.includes('-50,-50,50,-50')), 'the corner is drawn butt: the through wall reaches the other wall\'s outer face and ends square, the other stops on its side', [sL, eL]);
  await shot('joinstyle-butt');
  await type('T');
  R = await roomNow();
  ok(!!R.s.jn.find((x) => x.me === 'end').th !== !!sRec.th, 'T: the other wall runs through now');
  await mouseAt(4000, 0);
  R = await roomNow();
  ok(R.s.jn.find((x) => x.me === 'end').st === 'square', 'a second click: Square off');
  await type('');
  await select(R.s.id);
  await page.waitForTimeout(300);
  const jsText = await page.locator('.cc-right, [data-props]').first().innerText().catch(() => '');
  ok(/Join style at end/.test(jsText) && /Runs through at end/.test(jsText), 'Properties shows Join style and Runs through for each end', jsText.slice(0, 300));
  await select();
  await type('UNDO');
  R = await roomNow();
  ok(R.all.every((x) => x.jn.every((r) => !r.st)), 'one undo takes the command\'s changes back: every corner is mitre again');

  console.log('\n== FX.63 an end dragged by its grip (real mouse)');
  await select(R.s.id);
  await mouseAt(4000, 0);                       // the grip on the south wall's east end
  const gripOn = await ev(() => !!window.cadcraft.view.state.hotGrip);
  ok(gripOn, 'a click on the end grip picks it up');
  const tgt = await mouseAt(4600, 460);         // towards (4600, 460): the wall's new line has slope 0.1
  void tgt;
  R = await roomNow();
  ok(R.s && R.e && near(R.s.b[0], 4000, 0.01) && R.s.b[1] > 350 && R.s.b[1] < 450, 'the dragged end lands on the east wall\'s line x = 4000, near y = 400 (slope 0.1), not under the cursor at x = 4600', R.s && R.s.b);
  ok(R.e && near(R.e.a[0], 4000, 0.01) && near(R.e.b[0], 4000, 0.01) && near(R.e.a[1], R.s.b[1], 0.01) && near(R.e.b[1], 3000, 0.01), 'the east wall stays vertical: its end slid along its own line to the dragged end, its far end held', R.e && [R.e.a, R.e.b]);
  ok(R.all.every((x) => x.jn.length === 2), 'all four corners keep their records');
  await shot('end-grip');
  await esc(); await type('UNDO');
  R = await roomNow();
  ok(near(R.s.b[1], 0) && near(R.e.a[1], 0), 'one undo puts both walls back');
  // Alt: the join is broken on purpose
  await select(R.s.id);
  await mouseAt(4000, 0);
  await mouseAt(4600, -460, { alt: true });
  R = await roomNow();
  const sAlt = R.all.find((x) => near(x.a[0], 0, 1) && near(x.a[1], 0, 1) && x.b[0] > 4300);
  ok(sAlt && sAlt.b[1] < -300 && near(R.e.a[0], 4000, 0.01) && near(R.e.a[1], 0, 0.01), 'Alt + the grip: the end goes where the mouse is (x about 4600) and the east wall stays where it was', sAlt && [sAlt.b, R.e.a]);
  ok(sAlt && sAlt.jn.length === 1 && R.e.jn.length === 1, 'the corner\'s record is gone from both walls');
  await esc(); await type('UNDO');
  // the corner grip with both walls selected: the corner moves, both walls stay on it
  R = await roomNow();
  await select(R.s.id, R.e.id);
  await mouseAt(4000, 0);
  await mouseAt(4400, -400);
  const all2 = await wallsNow();
  const s2 = all2.find((x) => near(x.a[0], 0, 1) && near(x.a[1], 0, 1) && x.b[0] > 4200), e2 = all2.find((x) => near(x.b[0], 4000, 1) && near(x.b[1], 3000, 1));
  ok(s2 && e2 && Math.abs(s2.b[0] - 4400) < 40 && Math.abs(s2.b[1] + 400) < 40 && near(e2.a[0], s2.b[0], 0.01) && near(e2.a[1], s2.b[1], 0.01), 'the corner grip with both walls selected: both stay on the moved corner (about 4400, -400)', s2 && [s2.b, e2 && e2.a]);
  await shot('corner-grip');
  await esc(); await type('UNDO');

  console.log('\n== the Hold block\'s padlock on the plan');
  await select();
  await type('WALLHOLD');
  await clickAt(2000, 3050);
  await clickAt(2000, 50);
  await type('K');
  await page.waitForTimeout(200);
  let marks = await ev(() => window.cadcraft.host.wallLocks.marks());
  ok(marks.length === 1 && marks[0].kind === 'align', 'a lock shows one padlock mark on the plan', marks);
  await shot('padlock');
  // it is drawn: the overlay has action-coloured pixels where the padlock is
  const painted = await ev((m) => { const c = document.querySelector('[data-over]'), v = window.cadcraft.view, d = v.dpr || 1, g = c.getContext('2d'); const px = g.getImageData(Math.round((v.x0 + m.sx - 7) * d), Math.round((v.y0 + m.sy - 9) * d), Math.round(14 * d), Math.round(16 * d)).data; let n = 0; for (let i = 3; i < px.length; i += 4) if (px[i] > 200) n++; return n; }, marks[0]);
  ok(painted > 40, 'the padlock is painted on the drawing\'s overlay', painted);
  const r0 = await ev(() => { const v = window.cadcraft.view, r = document.querySelector('[data-over]').getBoundingClientRect(); return { x: r.left + v.x0, y: r.top + v.y0 }; });
  await page.mouse.click(r0.x + marks[0].sx, r0.y + marks[0].sy);
  await page.waitForTimeout(200);
  w = await wallsNow();
  marks = await ev(() => window.cadcraft.host.wallLocks.marks());
  ok(w.every((x) => x.h.length === 0) && marks.length === 0, 'a click on the padlock takes the lock off; the mark goes', w.map((x) => x.h.length));
  await type('UNDO');
  ok((await wallsNow()).some((x) => x.h.length === 1), 'one undo puts the lock back');

  console.log('\n== WT.1 the Walls tab of the ribbon menu style');
  await esc();
  await ev(() => window.ccInput.setStyle('ribbon'));
  await page.waitForTimeout(500);
  const tabsText = await ev(() => [...document.querySelectorAll('.cc-in-tab')].map((b) => b.textContent.trim()));
  ok(tabsText.includes('Walls'), 'the ribbon has a Walls tab', tabsText);
  await ev(() => [...document.querySelectorAll('.cc-in-tab')].find((b) => b.textContent.trim() === 'Walls')?.click());
  await page.waitForTimeout(400);
  const rb = await ev(() => [...document.querySelectorAll('.cc-in-tool[data-cmd^="wall."]')].filter((b) => b.offsetParent).map((b) => ({ id: b.dataset.cmd, svg: !!b.querySelector('svg.ccic'), bi: !!b.querySelector('i.bi'), w: b.getBoundingClientRect().width })));
  ok(rb.length === 23 && rb.every((b) => b.w > 10), 'its panels show the 23 wall tools', rb.length);
  ok(rb.filter((b) => !b.svg).map((b) => b.id).join() === 'wall.unlock' && rb.every((b) => b.svg || b.bi), 'with the icon set\'s drawings (Unlock keeps its Bootstrap icon)', rb.filter((b) => !b.svg).map((b) => b.id));
  await shot('ribbon-walls');
  await page.click('.cc-in-tool[data-cmd="wall.offset"]');
  await page.waitForTimeout(200);
  ok((await running()) === 'WALLOFFSET', 'a click on Offset wall in the ribbon starts WALLOFFSET', await running());
  await esc();
  await page.click('.cc-in-tool[data-cmd="wall.disallow"]');
  await page.waitForTimeout(200);
  ok((await running()) === 'WALLDISJOIN', 'a click on Disallow join in the ribbon starts WALLDISJOIN', await running());
  await esc();
  await ev(() => window.ccInput.setStyle('cadcraft'));
  await page.waitForTimeout(400);

  console.log('\n== WT.1 a layout (Duncan) shows the Walls group');
  const dk = await ev(() => (window.ccWorkspaceEngine?.layouts() || []).find((l) => /duncan/i.test(l.key))?.key || '');
  if (dk) {
    await ev((k) => window.ccShellWorkspace.set(k), dk);
    await page.waitForTimeout(1200);
    const tr = await ev(() => { const g = [...document.querySelectorAll('[data-tr-group]')].find((x) => x.getAttribute('aria-label') === 'Walls'); return g ? [...g.querySelectorAll('[data-ws-command]')].map((b) => ({ id: b.dataset.wsCommand, svg: !!b.querySelector('svg.ccic'), any: !!b.querySelector('svg, i') })) : null; });
    ok(tr && tr.length === 23, 'the Duncan layout\'s tool rows have a Walls group with the 23 wall tools', tr && tr.length);
    ok(tr && tr.every((b) => b.any) && tr.filter((b) => !b.svg).map((b) => b.id).join() === 'wall.unlock', 'each with its icon from the set (Unlock: a Bootstrap icon); none blank', tr && tr.filter((b) => !b.svg).map((b) => b.id));
    await shot('duncan-walls');
    await ev(() => window.ccShellWorkspace.set('standard'));
    await page.waitForTimeout(800);
  } else ok(false, 'the Duncan layout is offered on this page');

  ok(!problems.length, 'no console errors', problems.slice(0, 6));
} finally { await browser.close(); }
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
