#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-solids.mjs — DC.115 in the real BimCraft page: Model checks › Editable geometry reports how the shapes are built and "Keep straight
 * prisms editable" writes tessellated prisms back as IfcExtrudedAreaSolid, as one undo step (0.8, session oltl2-c_PART_3).
 * Run as root: a session minted for its own test admin (tools/cadcraft-test/admin.php session bimsolids; disabled at the end).
 *   node tools/bimcraft-test/browser-solids.mjs
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x !== undefined ? ' — ' + JSON.stringify(x).slice(0, 300) : '')); } };
// a made fixture: a box and an L as triangle lists, plus a wedge that is not a prism (tmp/oltl2c/mkfix.mjs style, built here from the app's own writer)
const { solidsToIfc } = await import(path.join(REPO, 'public_html/assets/apps/bimcraft/dev/step-ifc.js'));
const prism = (outer, h, cap) => { const n = outer.length, P = [], I = []; for (const [x, y] of outer) P.push(x, y, 0); for (const [x, y] of outer) P.push(x, y, h);
  for (const [a, b, c] of cap) { I.push(a, c, b); I.push(n + a, n + b, n + c); } for (let i = 0; i < n; i++) { const j = (i + 1) % n; I.push(i, j, n + j, i, n + j, n + i); } return { positions: P, indices: I }; };
const box = prism([[0, 0], [2000, 0], [2000, 1000], [0, 1000]], 3000, [[0, 1, 2], [0, 2, 3]]);
const L = prism([[0, 0], [3000, 0], [3000, 1000], [1000, 1000], [1000, 2000], [0, 2000]], 2000, [[0, 1, 2], [0, 2, 3], [0, 3, 4], [0, 4, 5]]);
const wedge = { positions: [0, 0, 0, 1000, 0, 0, 0, 1000, 0, 0, 0, 1000], indices: [0, 2, 1, 0, 1, 3, 1, 2, 3, 0, 3, 2] };
const dir = fs.mkdtempSync(path.join(process.env.TMPDIR || '/tmp', 'solids-'));
const FILE = path.join(dir, 'tess-prisms.ifc');
fs.writeFileSync(FILE, solidsToIfc([{ name: 'Box', ...box }, { name: 'L', ...L }, { name: 'Wedge', ...wedge }], { title: 'tess', parametric: false }));

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session', 'bimsolids'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const problems = [];
const page = await ctx.newPage();
page.on('console', (m) => { if (m.type() === 'error' && !/favicon|net::ERR|Failed to load resource/.test(m.text())) problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const sum = () => page.evaluate(() => document.querySelector('[data-solids-sum]')?.textContent || '');
try {
  await ctx.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  await page.goto('https://getcadcraft.com/lab/bimcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('#bc-file', FILE);
  await page.waitForFunction(() => !!window.bimcraftChecks && !document.querySelector('[data-checks-sec]')?.hidden, null, { timeout: 60000 });
  await page.evaluate(() => { document.querySelector('[data-checks-details]').open = true; });
  await page.waitForSelector('[data-editable-geom] [data-solids-sum]', { timeout: 20000 });
  let s = await sum();
  ok(/3 elements: 0 keep their shape as parameters \(.*\), 3 are lists of triangles/.test(s), 'Model checks › Editable geometry reads the file: 3 triangle lists, none parametric', s);
  ok(await page.locator('[data-solids-keep]').count() === 1, 'and offers "Keep straight prisms editable"');
  await page.click('[data-solids-keep]');
  await page.waitForFunction(() => /now extrusions/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 60000 });
  ok(/2 shape\(s\) now extrusions; 1 triangle list\(s\) are not prisms/.test(await page.textContent('[data-status]')), 'the box and the L became extrusions; the wedge stayed as it was', await page.textContent('[data-status]'));
  await page.waitForFunction(() => /1 are lists of triangles/.test(document.querySelector('[data-solids-sum]')?.textContent || ''), null, { timeout: 30000 });
  s = await sum();
  ok(/2 keep their shape as parameters/.test(s) && /1 are lists of triangles/.test(s), 'the panel now counts 2 parametric and 1 triangle list', s);
  // one undo step puts the triangle lists back
  await page.click('[data-undo]');
  await page.waitForFunction(() => /3 are lists of triangles|3 elements: 0 keep/.test(document.querySelector('[data-solids-sum]')?.textContent || ''), null, { timeout: 60000 });
  ok(/0 keep their shape as parameters \(.*\), 3 are lists of triangles/.test(await sum()), 'one Undo brings the three triangle lists back', await sum());
  // and redo converts again
  await page.keyboard.press('Control+Shift+Z').catch(() => {});
  const redo = await page.$('[data-redo]'); if (redo) await redo.click();
  await page.waitForFunction(() => /2 keep their shape as parameters/.test(document.querySelector('[data-solids-sum]')?.textContent || ''), null, { timeout: 60000 }).catch(() => {});
  ok(/2 keep their shape as parameters/.test(await sum()), 'Redo writes the extrusions again', await sum());
  // a second click finds nothing new: no button left for the wedge (it is not a prism) → the sum has a button because 1 list remains; pressing it changes nothing
  await page.click('[data-solids-keep]');
  await page.waitForFunction(() => /nothing changed/.test(document.querySelector('[data-status]')?.textContent || ''), null, { timeout: 60000 });
  ok(true, 'a second press finds no more prisms and says nothing changed');
  ok(problems.length === 0, 'no console errors', problems);
} catch (e) { fail++; console.log('  FAIL ' + (e && e.stack || e)); }
finally {
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down', 'bimsolids']); } catch (e) { /* ignore */ }
  await browser.close();
  fs.rmSync(dir, { recursive: true, force: true });
}
console.log(pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
