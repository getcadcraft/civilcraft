#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-perf-010.mjs — 0.10 PERF.39 (session `model-part-10`) in the real page, /lab/partcraft (mesh kernel):
 *   - a big part (features-750) rebuilds in the worker: the page answers (a timer that should fire every 50 ms is never late by
 *     more than 250 ms) and the build chip says "Rebuilding…" while it runs, then "Rebuilt in …"
 *   - three edits sent 50 ms apart: the part on screen is the NEWEST one, the same solid Node's kernel builds from that history
 *   - an edit 2 s into a long rebuild (plate-40: 1,600 holes) stops the stale build and builds the newest
 *   - a small part (the sample bracket) still rebuilds at once on the page
 *   - no page or console errors (the site's own per-hour limits a shared test admin runs into are said, not failed)
 *   node tools/partcraft-test/browser-perf-010.mjs      (root: signs in as the shared test admin, tools/cadcraft-test/admin.php)
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { launch, BASE } from '../perf/apps3d-lib.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev');
const GEN = '/var/www/CADCRAFT/testfiles/generated/partcraft';
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else fail++; console.log((c ? '  ok   ' : '  FAIL ') + m); };

// Node's kernel, for the solid the newest history must give
const I18N = await import(pathToFileURL(path.join(DEV, 'i18n.js')));
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(DEV, 'lang/en.json'), 'utf8')) });
const P = await import(pathToFileURL(path.join(DEV, 'part.js')));
const K = await import(pathToFileURL(path.join(DEV, 'kernel.js')));
const { default: Module } = await import(pathToFileURL(path.join(REPO, 'public_html/assets/vendor/manifold-3d/current/manifold.js')));
const M = await Module(); M.setup();

const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
const browser = await launch();
const ctx = await browser.newContext({ viewport: { width: 1400, height: 900 } });
await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
const page = await ctx.newPage();
const errors = [], limited = [];
page.on('pageerror', (e) => errors.push(e.message.slice(0, 200)));
page.on('console', (m) => { if (m.type() === 'error' && !/status of 429/.test(m.text())) errors.push('console: ' + m.text().slice(0, 200)); });
page.on('response', (r) => { if (r.status() !== 429) return; if (/\/api\/v1\/hardware|\/api\/library\/connect-auto/.test(r.url())) limited.push(new URL(r.url()).pathname); else errors.push('429 from ' + r.url().slice(0, 120)); });
try {
  await page.goto(`${BASE}/lab/partcraft`, { waitUntil: 'load', timeout: 120000 });
  await page.waitForFunction(() => window.partcraft?.view?.renderer && window.partcraft.regen, null, { timeout: 90000 });
  await page.evaluate(() => window.partcraft.built());

  console.log('\nPERF.39: a big part rebuilds off the page thread');
  const f750 = fs.readFileSync(path.join(GEN, 'features-750.partcraft.json'), 'utf8');
  const open = await page.evaluate(async (t) => {
    const pc = window.partcraft, chips = new Set();
    let late = 0, last = performance.now();
    const tick = setInterval(() => { const now = performance.now(); late = Math.max(late, now - last - 50); last = now; const c = document.querySelector('[data-build-state]')?.textContent; if (c) chips.add(c.replace(/\d+/g, 'N')); }, 50);
    const t0 = performance.now();
    await pc.openText(t, 'f750.partcraft.json'); await pc.built();
    clearInterval(tick);
    return { ms: Math.round(performance.now() - t0), late: Math.round(late), chips: [...chips], tris: pc.regen.stats.tris, after: document.querySelector('[data-build-state]').textContent };
  }, f750);
  ok(open.late < 250, `while 750 features rebuild (${open.ms} ms) a 50 ms timer is late by at most ${open.late} ms`);
  ok(open.chips.some((c) => /^Rebuilding/.test(c)) && /^Rebuilt in/.test(open.after), `the build chip said ${open.chips.filter((c) => /^Rebuilding/.test(c)).slice(0, 2).map((c) => '"' + c + '"').join(', ')}, then "${open.after}"`);

  const burst = await page.evaluate(async () => {
    const pc = window.partcraft, ex = pc.part.features.filter((f) => f.type === 'extrude'), last = ex[ex.length - 1];
    for (let k = 0; k < 3; k++) { pc.commit('Deeper ' + k, () => { last.depth += 0.5; }); await new Promise((r) => setTimeout(r, 50)); }
    await pc.built();
    return { text: pc.P.toJSON(pc.part), tris: pc.regen.stats.tris, volume: pc.regen.stats.volume, depth: last.depth };
  });
  K.clearCheckpoints();
  const node = K.regenerate(P.readPart(burst.text), M, { checkpoints: false });
  ok(Math.abs(node.stats.volume - burst.volume) <= 1e-6 * Math.abs(node.stats.volume), `three quick edits: the part shown is the newest (depth ${burst.depth}), volume ${burst.volume.toPrecision(9)} = Node's ${node.stats.volume.toPrecision(9)}`);

  console.log('\nPERF.39: an edit during a long rebuild stops it');
  const plate = fs.readFileSync(path.join(GEN, 'plate-40.partcraft.json'), 'utf8');
  const stop = await page.evaluate(async (t) => {
    const pc = window.partcraft;
    const t0 = performance.now();
    const opened = pc.openText(t, 'plate40.partcraft.json');
    await new Promise((r) => setTimeout(r, 2000));   // the 1,600-hole build is running in the worker
    const plate = pc.part.features.find((f) => f.type === 'extrude');
    pc.commit('Thicker', () => { plate.depth += 2; });
    await opened; await pc.built();
    return { ms: Math.round(performance.now() - t0), depth: plate.depth, text: pc.P.toJSON(pc.part), volume: pc.regen.stats.volume };
  }, plate);
  K.clearCheckpoints();
  const node2 = K.regenerate(P.readPart(stop.text), M, { checkpoints: false });
  ok(Math.abs(node2.stats.volume - stop.volume) <= 1e-6 * Math.abs(node2.stats.volume), `edited 2 s into the plate-40 build: shown ${stop.ms} ms after the open with the new depth ${stop.depth} (volume = Node's)`);

  console.log('\nPERF.39: a small part stays on the page');
  const small = fs.readFileSync(path.join(DEV, 'samples/sample-bracket.partcraft.json'), 'utf8');
  const sm = await page.evaluate(async (t) => {
    const pc = window.partcraft;
    await pc.openText(t, 'bracket.partcraft.json'); await pc.built();
    const f = pc.part.features.find((x) => x.type === 'extrude');
    let busy = false;
    const t0 = performance.now();
    pc.commit('Deeper', () => { f.depth += 1; });
    busy = /Rebuilding/.test(document.querySelector('[data-build-state]').textContent);   // straight after the call: a page build is already done
    await pc.built();
    return { busy, ms: Math.round(performance.now() - t0) };
  }, small);
  ok(!sm.busy, `the sample bracket rebuilt within the edit itself (${sm.ms} ms; no "Rebuilding…" in between)`);
} catch (e) { ok(false, 'ERROR ' + e.message.split('\n')[0].slice(0, 200)); }
ok(errors.length === 0, `no page or console errors${errors.length ? ': ' + errors.slice(0, 3).join(' ; ') : ''}`);
if (limited.length) console.log(`  (rate-limited by the site, not counted: ${[...new Set(limited)].join(', ')})`);
await browser.close();
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
