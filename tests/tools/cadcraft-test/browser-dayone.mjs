#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-dayone.mjs — BK.74 "draw from day one" for CadCraft, in the real page (/lab/cadcraft, headless, a fresh browser
 * profile, real clicks), session `bk-instep-10`.   node tools/cadcraft-test/browser-dayone.mjs [--shots <dir>]   (run as root)
 *
 * The first minutes, counted, with nothing set up and nothing dismissed first:
 *   the app opens on an empty drawing that can be drawn in (no dialog to answer; the Start card and the tour float, unanswered)
 *   first line   click Line, click two points, Enter                      3 clicks + 1 key
 *   first wall   click Wall, click two points, Enter                      3 clicks + 1 key
 *   first sheet  click New sheet                                          1 click: a sheet with a title block showing the drawing
 * Asserted: the defaults a new drawing has (layer 0 current, a text style, a dimension style, Model space), that no prompt on
 * the way asks for a setting before the first point, the line and the wall as drawn, and that the sheet's viewport shows them.
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
const ok = (c, m, x = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== '' ? ' (' + (typeof x === 'string' ? x : JSON.stringify(x)) + ')' : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bkdayone'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
page.setDefaultTimeout(15000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const ev = (fn, arg) => page.evaluate(fn, arg);
const shot = async (n) => { if (SHOTS) await page.screenshot({ path: path.join(SHOTS, n + '.png') }); };
const ents = () => ev(() => [...window.cadcraft.doc.model.values()].map((e) => ({ id: e.id, type: e.type, layer: e.layer, space: e.space || e.layout || '', wall: !!e.xd?.CADCRAFT_WALL, ...(e.type === 'line' ? { a: [e.x1 ?? e.a?.[0], e.y1 ?? e.a?.[1]], b: [e.x2 ?? e.b?.[0], e.y2 ?? e.b?.[1]] } : {}), ...(e.xd?.CADCRAFT_WALL ? { data: JSON.parse(e.xd.CADCRAFT_WALL.map((r) => r[1]).join('')) } : {}) })));
const prompt = () => ev(() => (document.querySelector('[data-cmd-label], .cc-cmd-label, label[for="cc-cmd"], [data-cmdline] label')?.textContent || [...document.querySelectorAll('*')].find((n) => n.children.length === 0 && /^Command:|point|Specify/i.test(n.textContent || '') && n.getBoundingClientRect().top > 800)?.textContent || '').trim());
/** Two points of the drawing as it is shown with nothing floating over them (page pixels). */
const freePoints = () => ev(() => { const c = [...document.querySelectorAll('canvas')].filter((x) => x.getBoundingClientRect().width > 400).sort((a, b) => b.getBoundingClientRect().width - a.getBoundingClientRect().width)[0]; if (!c) return null; const r = c.getBoundingClientRect();
  const free = (x, y) => { const e = document.elementFromPoint(x, y); return e === c || (e && e.tagName === 'CANVAS'); };
  for (const fy of [0.88, 0.8, 0.7, 0.6, 0.5]) for (const [fa, fb] of [[0.25, 0.6], [0.2, 0.5], [0.3, 0.55], [0.1, 0.4]]) { const a = [r.left + r.width * fa, r.top + r.height * fy], b = [r.left + r.width * fb, r.top + r.height * fy]; if (free(...a) && free(...b)) return [a, b]; } return null; });
let clicks = 0, keys = 0;
const click = async (sel) => { await page.locator(sel).locator('visible=true').first().click(); clicks++; };
const clickXY = async (p) => { await page.mouse.move(p[0], p[1], { steps: 3 }); await page.mouse.click(p[0], p[1]); clicks++; await page.waitForTimeout(120); };
const key = async (k) => { await page.keyboard.press(k); keys++; await page.waitForTimeout(120); };
try {
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await page.goto(BASE + '/lab/cadcraft', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft);

  console.log('== BK.74 CadCraft opens on a drawing that is ready');
  const start = await ev(() => { const d = window.cadcraft.doc; const names = (m) => (m ? [...(m.keys?.() || Object.keys(m))] : []);
    return { n: d.model.size, space: d.space, dialogs: document.querySelectorAll('dialog[open]').length, layers: names(d.layers), current: d.current, textStyles: names(d.textStyles), dimStyles: names(d.dimStyles), layouts: d.layouts?.length || 0, busy: !!window.cadcraft.engine.active, modelTab: [...document.querySelectorAll('button, [role="tab"]')].some((b) => b.textContent.trim() === 'Model' && b.offsetParent && (b.getAttribute('aria-selected') === 'true' || b.getAttribute('aria-pressed') === 'true' || /active|current|is-on/.test(b.className))) };
  });
  if (process.env.BK_DEBUG) console.log(JSON.stringify(await ev(() => { const d = window.cadcraft.doc; const sh = (v) => (v instanceof Map ? 'Map:' + [...v.keys()].join(',') : Array.isArray(v) ? 'Array:' + JSON.stringify(v).slice(0, 200) : typeof v === 'object' && v ? 'Object:' + JSON.stringify(v).slice(0, 300) : String(v)); return { space: sh(d.space), layouts: sh(d.layouts), textStyles: sh(d.textStyles), dimStyles: sh(d.dimStyles), current: sh(d.current), cmds: [...document.querySelectorAll('[data-cmd]')].filter((b) => /SHEET|LAYOUT|VIEWPORT|MVIEW/i.test(b.dataset.cmd)).map((b) => b.dataset.cmd + (b.offsetParent ? '' : ' (hidden)')) }; })));
  ok(start.n === 0 && start.dialogs === 0, 'an empty drawing is open and no dialog asks anything', start);
  ok(start.layers.includes('0') && (start.current?.layer ?? '0') === '0', 'layer 0 is there and current', [start.layers, start.current]);
  ok(start.current?.textHeight > 0 && start.current?.dim?.txt > 0 && start.current?.dim?.asz > 0, 'text and dimensions have their sizes already (text ' + start.current?.textHeight + ', dimension text ' + start.current?.dim?.txt + ', arrows ' + start.current?.dim?.asz + '): no style to make first', start.current);
  ok(start.layouts === 0 && start.modelTab, 'the Model tab is shown; no sheet yet (a new drawing has none until New sheet)', [start.layouts, start.modelTab]);
  await shot('cad-dayone-1-open');

  console.log('== BK.74 the first line: Line, two points, Enter');
  await click('[data-cmd="LINE"]');
  const p1 = await prompt();
  let pts = await freePoints();
  ok(!!pts, 'the drawing has free room to click in (the Start card and the tour were not closed)');
  await clickXY(pts[0]); await clickXY(pts[1]); await key('Enter');
  let E = await ents();
  const line = E.find((e) => e.type === 'line');
  ok(E.length === 1 && !!line, 'one line is in the drawing', E);
  ok(clicks === 3 && keys === 1, 'from the open app to the first line: ' + clicks + ' clicks and ' + keys + ' key (Enter)');
  ok(line && line.layer === '0', 'it is on layer 0');
  ok(!/unit|scale|template|layer/i.test(p1), 'the Line tool asked for a point first, not for a setting: "' + p1 + '"');
  await shot('cad-dayone-2-line');

  console.log('== BK.74 the first wall: Wall, two points, Enter');
  const c0 = clicks, k0 = keys;
  await click('[data-cmd="WALL"]');
  const p2 = await prompt();
  pts = await freePoints();
  // a second row of free points, clear of the line
  const up = pts.map((p) => [p[0], p[1] - 60]);
  const useable = await ev((q) => q.every((p) => { const e = document.elementFromPoint(p[0], p[1]); return e && e.tagName === 'CANVAS'; }), up);
  const wp = useable ? up : pts;
  await clickXY(wp[0]); await clickXY(wp[1]); await key('Enter');
  if (await ev(() => !!window.cadcraft.engine.active)) await page.keyboard.press('Escape');
  E = await ents();
  const wall = E.find((e) => e.wall);
  ok(!!wall, 'one wall is in the drawing', E.map((e) => e.type));
  ok(clicks - c0 === 3 && keys - k0 === 1, 'the first wall: ' + (clicks - c0) + ' clicks and ' + (keys - k0) + ' key (Enter)');
  ok(wall && wall.data.t > 0 && Math.hypot(wall.data.b[0] - wall.data.a[0], wall.data.b[1] - wall.data.a[1]) > 0, 'it has a thickness without being asked (' + (wall ? wall.data.t : '') + ' drawing units)', wall && wall.data);
  ok(!/unit|scale|template/i.test(p2), 'the Wall tool asked for a point first: "' + p2 + '"');
  await shot('cad-dayone-3-wall');

  console.log('== BK.74 the first sheet: New sheet');
  const c1 = clicks;
  const before = await ev(() => { const d = window.cadcraft.doc; return { layouts: d.layouts ? (d.layouts.size ?? d.layouts.length ?? Object.keys(d.layouts).length) : 0, tabs: document.querySelectorAll('[data-tab], [role="tab"]').length }; });
  await click('[data-cmd="LAYOUT"]');
  await page.waitForTimeout(800);
  if (process.env.BK_DEBUG) console.log(JSON.stringify(await ev(() => ({ active: !!window.cadcraft.engine.active, dialogs: [...document.querySelectorAll('dialog[open]')].map((d) => d.textContent.slice(0, 200)), layouts: JSON.stringify(window.cadcraft.doc.layouts).slice(0, 600), types: [...window.cadcraft.doc.model.values()].map((e) => e.type + ':' + (e.space ?? '') + ':' + (e.layout ?? '')).slice(0, 30), spaceKeys: [...window.cadcraft.doc.space.keys()].slice(0, 5), tabs: [...document.querySelectorAll('button')].filter((b) => /Model|Sheet|Layout/.test(b.textContent) && b.getBoundingClientRect().top > 700).map((b) => b.textContent.trim() + '|' + b.className + '|' + b.getAttribute('aria-selected')) }))), await prompt());
  const sheet = await ev(() => { const d = window.cadcraft.doc; const L = d.layouts ? [...(d.layouts.values?.() || Object.values(d.layouts))] : []; const paper = [...d.space.values()];   // what is drawn on the sheet shown
    const vps = paper.filter((e) => e.type === 'viewport');
    return { layouts: L.map((l) => ({ name: l.name, paper: l.paper || l.size || null, keys: Object.keys(l) })), space: d.space, vps: vps.map((v) => JSON.parse(JSON.stringify(v))), modelTab: [...document.querySelectorAll('.cc-tab')].map((b) => b.textContent.trim() + ':' + b.getAttribute('aria-selected')), paperCount: paper.length, paperTypes: [...new Set(paper.map((e) => e.type))], dialogs: document.querySelectorAll('dialog[open]').length, prompt: !!window.cadcraft.engine.active };
  });
  ok(clicks - c1 === 1 && sheet.layouts.length === (before.layouts || 0) + 1 && sheet.dialogs === 0, 'one click: a sheet is made (' + (sheet.layouts[0]?.name || '') + '), nothing asked', sheet);
  ok(sheet.vps.length >= 1 && sheet.paperCount > 1, 'it has a viewport and a title block drawn on the paper (' + sheet.paperCount + ' objects: ' + sheet.paperTypes.join(', ') + ')', sheet);
  await shot('cad-dayone-4-sheet');
  // the viewport shows what was drawn: every end of the line and the wall lies inside its window on the model
  const vp = sheet.vps[0], raw = await ev(() => [...window.cadcraft.doc.model.values()].map((e) => JSON.parse(JSON.stringify(e))));
  const ends = raw.flatMap((e) => { if (e.type === 'line') return [[e.x1, e.y1], [e.x2, e.y2]]; if (e.xd?.CADCRAFT_WALL) { const d = JSON.parse(e.xd.CADCRAFT_WALL.map((r) => r[1]).join('')); return [[e.x + d.a[0], e.y + d.a[1]], [e.x + d.b[0], e.y + d.b[1]]]; } return []; });
  if (process.env.BK_DEBUG) console.log('    ends ' + JSON.stringify(ends) + ' line ' + JSON.stringify(raw.find((e) => e.type === 'line')));
  const inside = (k) => ends.length === 4 && ends.every((q) => Math.abs(q[0] - vp.cx) <= vp.w / 2 * k + 1e-6 && Math.abs(q[1] - vp.cy) <= vp.h / 2 * k + 1e-6);
  ok(vp && inside(1 / vp.s) , 'the sheet\'s viewport (scale ' + (vp ? vp.s : '') + ') shows the line and the wall whole', { vp, ends });

  const real = problems.filter((p) => !/429|favicon/.test(p));
  ok(real.length === 0, 'no console errors', real.slice(0, 4));
} catch (e) {
  fail++; console.log('  FAIL stopped: ' + (e.stack || e.message || e));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'cad-dayone-stopped.png') }).catch(() => {});
} finally { await browser.close(); try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bkdayone'], { encoding: 'utf8' }); } catch (e) { /* stays */ } }
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
