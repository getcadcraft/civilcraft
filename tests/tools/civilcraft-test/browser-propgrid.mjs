#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-propgrid.mjs — CivilCraft 0.8 PANEL-COMPACT (oltl2-c): Properties of a selected alignment, pad, structure, pipe and
 * survey point are the shared property grid (window.ccPropGrid). Run as root (own test admin, tag pgrid):
 *   node tools/civilcraft-test/browser-propgrid.mjs [--out dir]
 * Each edit still goes through project.change (one undo step); sums and units ("4+7/16", "10+00") still type; markup in a name is text.
 * A `findRoute` import error from route.js (another session's file) is not counted as a console error here, and is said.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = 'https://getcadcraft.com';
let pass = 0, fail = 0;
const ok = (c, m, x) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (x ? ' — ' + x : '')); } };
const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd, 'pgrid'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [], skipped = [];
try {
  const cred = admin('up');
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') { const x = m.text(); if (/findRoute/.test(x)) skipped.push(x); else problems.push('console: ' + x); } });
  page.on('pageerror', (e) => { if (/findRoute/.test(e.message)) skipped.push(e.message); else problems.push('pageerror: ' + e.message); });
  await page.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await page.fill('input[name="email"]', cred.email); await page.fill('input[name="password"]', cred.password);
  await Promise.all([page.waitForNavigation(), page.click('form button[type="submit"]')]);
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.civilcraft);
  const E = (f, a) => page.evaluate(f, a);
  const steps = () => E(() => window.civilcraft.project.undoStack.length);
  const setRow = async (id, v) => { const s = `[data-props] [data-pg-row="${id}"]`; await page.fill(s, v); await page.press(s, 'Enter'); await page.waitForTimeout(150); await E(() => document.activeElement?.blur()); await page.waitForTimeout(100); };
  const select = async (sel) => { await E((s) => window.civilcraft.select(s), sel); await page.waitForTimeout(150); };

  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);

  // a pad, a structure pair with a pipe and an alignment made through the project (the same change() the tools use)
  await E(async () => {
    const { defaultNetwork } = await import('/assets/apps/civilcraft/dev/pipes.js');
    const p = window.civilcraft.project;
    const c = p.points.find((q) => q.z !== null);
    p.change('test: objects', (st) => {
      if (!st.network) st.network = defaultNetwork(st.units);
      st.pads.push({ id: 'pgp1', name: 'Pad 1', pts: [{ x: c.x, y: c.y }, { x: c.x + 60, y: c.y }, { x: c.x + 60, y: c.y + 40 }, { x: c.x, y: c.y + 40 }], z: 250, cut: 2, fill: 3 });
      st.network.structures.push({ id: 'pgs1', name: 'S1', x: c.x + 5, y: c.y + 5, rim: null, sumpDepth: 0, dia: 48 }, { id: 'pgs2', name: 'S2', x: c.x + 50, y: c.y + 5, rim: null, sumpDepth: 0, dia: 48 });
      st.network.pipes.push({ id: 'pgq1', name: 'P1', from: 'pgs1', to: 'pgs2', dia: 18, invUp: null, invDn: null });
      st.alignments.push({ id: 'pga1', name: 'Alignment 1', start: 0, pis: [{ x: c.x, y: c.y, r: 0 }, { x: c.x + 100, y: c.y + 20, r: 0 }], pvis: [] });
    });
  });

  // the pad
  await select({ kind: 'pad', id: 'pgp1' });
  ok(!!(await page.$('[data-props] .pg-value')) && !!(await page.$('[data-props] [data-pg-row="name"]')), 'a selected pad draws the shared grid with a Name row');
  let n0 = await steps();
  await setRow('z', '251.5');
  ok((await E(() => window.civilcraft.project.state.pads[0].z)) === 251.5 && (await steps()) === n0 + 1, 'pad elevation 251.5 is one undo step');
  await setRow('z', '250+1.25');
  ok(Math.abs((await E(() => window.civilcraft.project.state.pads[0].z)) - 251.25) < 1e-6, 'a sum in the box still types: 250+1.25 = 251.25');
  await setRow('z', 'junk');
  ok((await E(() => window.civilcraft.project.state.pads[0].z)) === 251.25 && (await page.getAttribute('[data-props] [data-pg-row="z"]', 'aria-invalid')) === 'true', 'junk keeps the value and marks the box invalid');
  await setRow('name', '<img src=x onerror=window.__pwn=1>');
  ok(!(await E(() => window.__pwn)) && !(await page.$('[data-props] img')) && (await E(() => window.civilcraft.project.state.pads[0].name)).startsWith('<img'), 'markup in a pad name is kept as text, never HTML');
  ok(!!(await page.$('[data-props] #cv-pad-cut')), 'the pad slopes keep their own reader below the grid');
  await page.keyboard.press('Control+z'); await page.waitForTimeout(150);
  ok((await E(() => window.civilcraft.project.state.pads[0].name)) === 'Pad 1', 'Ctrl+Z puts the pad name back');

  // the structure and the pipe
  await select({ kind: 'structure', id: 'pgs1' });
  await setRow('rim', '262.5');
  ok((await E(() => window.civilcraft.project.state.network.structures[0].rim)) === 262.5, 'structure rim elevation typed in the grid');
  await setRow('rim', '');
  ok((await E(() => window.civilcraft.project.state.network.structures[0].rim)) === null, 'an empty rim goes back to the ground surface');
  await select({ kind: 'pipe', id: 'pgq1' });
  await setRow('invUp', '250');
  await setRow('invDn', '249');
  ok(await E(() => { const q = window.civilcraft.project.state.network.pipes[0]; return q.invUp === 250 && q.invDn === 249; }), 'pipe inverts typed in the grid');
  ok(!!(await page.$('[data-props] [data-pg-id="slope"] .pg-ro')), 'the pipe slope is a read-only row');

  // the alignment
  await select({ kind: 'alignment', id: 'pga1' });
  await setRow('start', '10+00');
  ok((await E(() => window.civilcraft.project.state.alignments[0].start)) === 1000, 'a station types as a station: 10+00 = 1000');

  // a survey point
  const num = await E(() => { const c = window.civilcraft; const p = c.project.points.find((q) => q.z !== null && /^\d+$/.test(q.n)); c.pick([p.n]); return p.n; });
  await page.waitForSelector('[data-point-edit] [data-pg-row="z"]');
  n0 = await steps();
  await setRow('z', '300');
  ok((await E((n) => window.civilcraft.project.points.find((q) => q.n === n).z, num)) === 300 && (await steps()) === n0 + 1, 'point elevation typed in the grid is one undo step');
  await setRow('x', 'not a number');
  ok((await page.getAttribute('[data-point-edit] [data-pg-row="x"]', 'aria-invalid')) === 'true', 'a junk easting marks the box invalid');
} catch (e) { fail++; console.log('  FAIL browser run — ' + String(e.message).split('\n')[0]); }
finally { await browser.close(); try { admin('down'); } catch {} }
if (skipped.length) console.log('  note ' + skipped.length + ' console message(s) about findRoute (route.js, another session) left out');
ok(problems.length === 0, 'no console errors', problems.join(' | ').slice(0, 300));
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
