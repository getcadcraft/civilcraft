#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-scene.mjs — XE.13 on the real page (apps-mount_PART_5): ModelCraft is the 3D host of the soft PLC. A placement named "Lift" is made, the Engines
 * panel's plc engine is given a program bound to it ("scene": true), a first run leaves the model alone, a run with "keep" writes the final position into
 * the model as ONE undo step, a missing placement is a problem in words.
 *   node tools/modelcraft-test/browser-scene.mjs     (root; as browser-mount3.mjs)
 */
/**
 * browser-trim.mjs — trimmed surfaces in ModelCraft's Surfaces panel (0.8 DC.54 S2, session apps-mount_PART_5; rule 49: tested in the real
 * page): two curves, Loft, then "Trim with a circle" (a hole), "Trim to a rectangle" (keep only that part), the panel's Undo, STEP out with
 * the bounds, and the patch set kept in the file data. No console errors.
 *   node tools/modelcraft-test/browser-trim.mjs [--out <dir>]      (root; as browser-mount3.mjs)
 */
/**
 * browser-trim.mjs — ModelCraft's round-3 mounts (0.8, session model_PART_3; KICKOFF rule 40: each mount tested in the real page),
 * headless Chromium at /lab/modelcraft:
 *   P.6     the 3D-print check is a Problems source: an open box → ⚠ count, the panel row, a marker over the view, "Repair" fixes it
 *           (one undo step) and the check runs again; a model change clears it
 *   RE.2/6  Export › Render a picture… hands its scene on: Engine "glTF file" saves a real .glb (no "cannot hand its scene" note)
 *   SU.747b the Surfaces panel (cc-nurbs-ui over cc-nurbs): two curves from typed points, Loft (a mesh in the scene), the continuity
 *           table, a gap between two lofts → a G0 problem in Problems, its Match fix closes it, the panel's undo, zebra and
 *           curvature views, picking a curve by clicking it in the view, points picked with the snapping tool, STEP export, the
 *           patch set kept in the file (save → reopen) and gone on New
 *   kit     (when --kit) the shell's seven modules: calc, reasons, totals, lessons, Suggest, activity, the Ask box answering a question
 * No console errors.
 *   node tools/modelcraft-test/browser-trim.mjs [--out <dir>]
 * Run as root (ModelCraft's test admin, as browser-model08.mjs). Shots in tmp/shots/mount3.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/scene')));
fs.mkdirSync(OUT, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, d = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (d ? ' — ' + d : '')); } };

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function signedInContext(opts) {
  // a minted staff session (as tools/problems-test/*): sign-in by password races other sessions' test runs on the shared test admin
  const minted = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(REPO, 'tools/cadcraft-test/admin.php'), 'session'], { encoding: 'utf8' }));
  const c = await browser.newContext(opts);
  await c.addCookies([{ name: minted.name, value: minted.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true, sameSite: 'Lax' }]);
  return c;
}

const modUrl = (page, re) => page.evaluate((src) => { const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports; return Object.entries(map).find(([k]) => new RegExp(src).test(k))?.[1] || null; }, re.source);
/** An open box (a 2 × 2 × 2 m solid with its top face erased) as a group: the print check says "open". */
const openBox = async (page) => page.evaluate(async (u) => {
  const M = await import(u), mc = window.modelcraft;
  const iid = mc.model.change('box', (m) => {
    M.addPolygon(m.root, [[0, 0, 0], [2, 0, 0], [2, 2, 0], [0, 2, 0]], [0, 0, 1]); M.pushPull(m.root, [...m.root.faces.keys()].at(-1), 2);
    const top = [...m.root.faces.entries()].find(([, f]) => f.loops[0].every((v) => Math.abs(m.root.verts.get(v)[2] - 2) < 1e-9));
    if (top) M.eraseSel(m.root, [{ t: 'f', id: top[0] }]);
    return m.makeGroup(m.root, [...m.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'group', 'Open box');
  });
  document.querySelector('[data-hint]').hidden = true;
  document.querySelector('.mc-tools [data-act="extents"]')?.click();
  return iid;
}, await modUrl(page, /\/modelcraft\/dev\/model\.js/));
const newFile = async (page) => {
  await page.evaluate(() => document.querySelector('[data-act="new"]').click());
  const b = await page.waitForSelector('dialog[open] button[data-key="discard"]', { timeout: 1500 }).catch(() => null);
  if (b) await b.click();   // an unsaved model asks first
  await page.waitForTimeout(200);
};
const counts = (page) => page.evaluate(() => window.ccProblems.store.counts());
const bySource = (page, id) => page.evaluate((s) => window.ccProblems.store.list().filter((p) => p.source?.name === s || p.id.startsWith(s)), id);

const problems = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1600, height: 1000 }, locale: 'en-US', ignoreHTTPSErrors: true, serviceWorkers: 'block' });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_|status of 429/i.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  await page.goto(BASE + '/lab/modelcraft?space=model', { waitUntil: 'load' });
  await page.waitForFunction(() => window.modelcraft?.model && window.ccEngines && window.ccSceneHost, null, { timeout: 60000 });
  ok(await page.evaluate(() => window.ccSceneHost.app === 'modelcraft'), 'ModelCraft offers its scene to the engines (window.ccSceneHost)');
  const M = await page.evaluate(async (u) => u, await modUrl(page, /\/modelcraft\/dev\/model\.js/));
  await page.evaluate(async (u) => {
    const Mo = await import(u), mc = window.modelcraft;
    mc.model.change('lift', (m) => { Mo.addPolygon(m.root, [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], [0, 0, 1]); Mo.pushPull(m.root, [...m.root.faces.keys()].at(-1), 1); m.makeGroup(m.root, [...m.root.faces.keys()].map((f) => ({ t: 'f', id: f })), 'group', 'Lift'); });
  }, M);
  const zOf = () => page.evaluate(() => { const h = window.ccSceneHost, s = h.open(); const z = s.read('Lift', 'z'); s.close(false); return z; });
  ok(await zOf() === 0, 'the group "Lift" is a placement at z = 0');
  await page.click('[data-tool-open="engines"]');
  await page.waitForSelector('#cct-engines [data-k="engine"]');
  await page.selectOption('#cct-engines [data-k="engine"]', 'plc');
  const run = async (obj) => {
    await page.evaluate((o) => { const t = document.querySelector('#cct-engines [data-k="input"]'); t.value = JSON.stringify(o); t.dispatchEvent(new Event('input', { bubbles: true })); }, obj);
    await page.click('#cct-engines [data-k="run"]');
    await page.waitForFunction(() => !!document.querySelector('#cct-engines [data-k="result"] table, #cct-engines .cct-err'), null, { timeout: 15000 });
    await page.waitForTimeout(300);
    return page.evaluate(() => document.querySelector('#cct-engines [data-k="result"]').textContent + ' || ' + [...document.querySelectorAll('#cct-engines .cct-err')].map((e) => e.textContent).join(' | '));
  };
  const prog = { scene: true, cycleMs: 100, scans: 30, sensors: { up: 'Lift.z' }, numeric: ['up'], scale: { up: 1000 }, commands: { raise: 'Lift.z' }, values: { raise: [0, 2] }, st: 'PROGRAM Main\n{{declarations}}\nIF up < 1500 THEN raise := TRUE; END_IF;\nEND_PROGRAM' };
  const undo0 = await page.evaluate(() => window.modelcraft.model.undoStack.length);
  const t1 = await run(prog);
  ok(/Lift\.z/.test(t1) && /not changed/.test(t1), 'a run shows the placement\'s final position and says the model is not changed');
  ok(await zOf() === 0 && await page.evaluate((n) => window.modelcraft.model.undoStack.length === n, undo0), 'the model is untouched (z = 0, no undo step)');
  const t2 = await run({ ...prog, keep: true });
  ok(/written into the model/.test(t2), 'a run with keep says it wrote into the model');
  ok(await zOf() === 2 && await page.evaluate((n) => window.modelcraft.model.undoStack.length === n + 1, undo0), 'the lift is at z = 2 m, one undo step');
  await page.evaluate(() => window.modelcraft.model.undo());
  ok(await zOf() === 0, 'Undo puts it back');
  const t3 = await run({ ...prog, sensors: { up: 'Nothing.z' }, commands: { raise: 'Nothing.z' } });
  ok(/not a placement of the open model/.test(t3), 'a placement that is not there is a problem in words', t3.slice(0, 200));
  await page.screenshot({ path: path.join(OUT, '1-scene.png') });
} catch (e) {
  fail++; console.log('  FAIL threw: ' + (e && e.stack || e));
} finally {
  for (const p of problems) { fail++; console.log('  FAIL ' + p); }
  await browser.close();
  console.log((fail ? 'FAILED' : 'ok') + ' — ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
