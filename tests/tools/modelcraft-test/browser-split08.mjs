#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-split08.mjs — Split for printing in ModelCraft (0.8 SU.929, session sx-split), headless Chromium at /lab/modelcraft:
 * a 300 mm cube, Check for 3D printing › Print tools › Split for printing: the grid for a 220 mm bed, Preview (8 pieces, the
 * cuts and connectors marked), Download (one zip: pieces, assembly.svg/.png/.txt), Split the model (8 placements, one
 * undo), and cutting at places given along an axis.
 *   node tools/modelcraft-test/browser-split08.mjs [--out <dir>] [--keep-admin]
 * Run as root (ModelCraft's test admin, as browser-print07.mjs). Screenshots in tmp/shots/split08, both themes. Fails on
 * any console error.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/split08')));
const STATE = path.join(REPO, 'tmp/skp-browser-state.json');
const KEEP_ADMIN = process.argv.includes('--keep-admin');
fs.mkdirSync(OUT, { recursive: true });
const DL = fs.mkdtempSync(path.join(os.tmpdir(), 'split08-'));

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };

const { chromium } = createRequire(path.join(REPO, 'tools/modelcraft-test/package.json'))('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/modelcraft-test/admin.php');
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function signedInContext(opts) {
  if (fs.existsSync(STATE)) {
    const c = await browser.newContext({ ...opts, storageState: STATE, acceptDownloads: true });
    const p = await c.newPage();
    const r = await p.goto(BASE + '/lab/modelcraft', { waitUntil: 'domcontentloaded' });
    const okLab = r && r.status() === 200 && p.url().includes('/lab/modelcraft');
    await p.close();
    if (okLab) return c;
    await c.close();
  }
  const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
  const c = await browser.newContext({ ...opts, acceptDownloads: true });
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

/** A 300 mm cube as one group placement (the Beginner box, 20 mm, scaled 15 ×), selected. */
const buildCube = (page) => page.evaluate(async () => {
  const map = JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports;
  const url = Object.entries(map).find(([k]) => /\/modelcraft\/dev\/beginner\.js/.test(k))?.[1];
  const B = await import(url);
  const mc = window.modelcraft, m = mc.model;
  const id = m.change('test cube', (mm) => { const d = B.buildShape(mm, 'box', 'Cube'); return mm.place(mm.root, d.id, [15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 1]); });
  mc.host.changed?.();
  mc.host.setSel([{ t: 'i', id }]);
  document.querySelector('[data-hint]').hidden = true;
  return id;
}).then(async (id) => { await page.click('[data-act="extents"]'); return id; });

async function openSplit(page) {
  await page.click('[data-export-menu] > summary');
  await page.click('[data-export="print3d"]');
  await page.waitForSelector('dialog.mc-dialog [data-print-ok]', { timeout: 120000 });
  await page.click('dialog.mc-dialog [data-prep-tools] button[data-key="tool:split"]');
  await page.waitForSelector('[data-ptool="split"]:not([hidden]) [data-ptool-result]', { timeout: 120000 });
  return page.textContent('[data-ptool="split"]');
}
const card = (page) => page.textContent('[data-ptool="split"]');
const layers = (page) => page.evaluate(() => {
  const g = window.modelcraft.view?.scene?.getObjectByName?.('print-tools');
  return g ? g.children.map((o) => o.type + ':' + (o.geometry.attributes.position?.count || 0)) : [];
});
/** Zip entry names (stored zip: walk the central directory). */
function zipNames(file) {
  const b = fs.readFileSync(file), names = [];
  const end = b.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  let o = b.readUInt32LE(end + 16);
  for (let i = 0; i < b.readUInt16LE(end + 10); i++) { const n = b.readUInt16LE(o + 28), x = b.readUInt16LE(o + 30), c = b.readUInt16LE(o + 32); names.push(b.toString('utf8', o + 46, o + 46 + n)); o += 46 + n + x + c; }
  return names;
}

const problems = [];
try {
  const ctx = await signedInContext({ viewport: { width: 1400, height: 900 }, locale: 'en-US' });
  for (const space of ['paper', 'model']) {
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error') problems.push(space + ' console: ' + m.text()); });
    page.on('pageerror', (e) => problems.push(space + ' pageerror: ' + e.message));
    await page.goto(BASE + '/lab/modelcraft?space=' + space, { waitUntil: 'networkidle' });
    ok(await page.evaluate(() => !!window.modelcraft), space + ': the app starts');
    const cube = await buildCube(page);
    let text = await openSplit(page);
    ok(/What prints is 300 × 300 × 300 mm/.test(text) && /It fits in 8 pieces: 2 × 2 × 2, each about 150 × 150 × 150 mm/.test(text), space + ': the card: 300 mm cube, 8 pieces on the 220 mm bed');
    ok((await layers(page)).some((l) => l === 'LineSegments:24'), space + ': the three cut planes drawn round the model: ' + await layers(page));
    await page.click('[data-ptool="split"] [data-ptool-act="split-preview"]');
    await page.waitForSelector('[data-ptool="split"] [data-ptool-result="ok"]', { timeout: 120000 });
    text = await card(page);
    ok(/8 pieces, 12 joints, 24 connectors\./.test(text) && /Every piece is closed and passes the 3D-print check\./.test(text) && /Every piece fits the bed/.test(text), space + ': Preview: 8 pieces, 12 joints, 24 pegs, all pass and fit');
    ok((await page.$$('[data-ptool="split"] [data-ptool-pieces] li')).length === 8, space + ': the 8 pieces listed with their sizes');
    ok((await layers(page)).some((l) => l === 'LineSegments:' + (24 + 12) * 40), space + ': a ring at each of the 24 pegs and 12 numbers: ' + await layers(page));
    await page.screenshot({ path: path.join(OUT, `01-split-preview-${space}.png`) });
    // the zip
    const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 120000 }), page.click('[data-ptool="split"] [data-ptool-act="split-download"]')]);
    const file = path.join(DL, space + '-' + dl.suggestedFilename());
    await dl.saveAs(file);
    const names = zipNames(file);
    ok(dl.suggestedFilename() === 'Cube-pieces.zip' && names.filter((n) => /^Cube-0[1-8]\.stl$/.test(n)).length === 8 && ['assembly.svg', 'assembly.txt', 'assembly.png'].every((n) => names.includes(n)), space + ': Download: Cube-pieces.zip with 8 STLs and the assembly sheet (SVG, PNG, text): ' + names.join(' '));
    // into the model
    await page.click('[data-ptool="split"] [data-ptool-act="split-apply"]');
    await page.waitForFunction(() => window.modelcraft.model.root.insts.size === 8, null, { timeout: 120000 }).catch(() => {});
    ok(await page.evaluate((id) => { const m = window.modelcraft.model; return m.root.insts.size === 8 && !m.root.insts.has(id) && window.modelcraft.host.sel.length === 8; }, cube), space + ': Split the model: 8 placements in place of the cube, selected');
    const named = await page.evaluate(() => { const m = window.modelcraft.model; return [...m.root.insts.values()].map((i) => m.def(i.def).name + (i.color ? '+paint' : '')).sort().join(','); });
    ok(named === [1, 2, 3, 4, 5, 6, 7, 8].map((n) => 'Cube ' + n + '+paint').join(','), space + ': named Cube 1 … Cube 8 as on the assembly sheet, keeping the cube\'s paint: ' + named);
    await page.click('[data-ptool] [data-ptool-close]');
    await page.click('[data-act="extents"]');
    await page.screenshot({ path: path.join(OUT, `02-split-model-${space}.png`) });
    await page.evaluate(() => window.modelcraft.model.undo());
    ok(await page.evaluate((id) => window.modelcraft.model.root.insts.size === 1 && window.modelcraft.model.root.insts.has(id), cube), space + ': one undo: the cube is back');
    // cut at places given
    await page.evaluate((id) => window.modelcraft.host.setSel([{ t: 'i', id }]), cube);
    await openSplit(page);
    await page.check('[data-ptool="split"] input[name="mcPtool-split-mode"][value="planes"]');
    await page.waitForSelector('[data-ptool="split"] input[name="mcPtool-split-at"]');
    await page.check('[data-ptool="split"] input[name="mcPtool-split-axis"][value="2"]');
    await page.waitForTimeout(150);
    await page.fill('[data-ptool="split"] input[name="mcPtool-split-at"]', '100, 200');
    await page.dispatchEvent('[data-ptool="split"] input[name="mcPtool-split-at"]', 'change');
    await page.waitForTimeout(300);
    await page.check('[data-ptool="split"] input[name="mcPtool-split-conn"][value="dowel"]');
    await page.waitForTimeout(150);
    await page.click('[data-ptool="split"] [data-ptool-act="split-preview"]');
    await page.waitForSelector('[data-ptool="split"] [data-ptool-result="ok"]', { timeout: 120000 });
    text = await card(page);
    ok(/3 pieces, 2 joints, 4 connectors\./.test(text) && !/fits the bed/.test(text), space + ': cut across Z at 100 and 200 mm with dowels: 3 pieces, 2 joints, 4 dowels');
    await page.fill('[data-ptool="split"] input[name="mcPtool-split-at"]', '400');
    await page.dispatchEvent('[data-ptool="split"] input[name="mcPtool-split-at"]', 'change');
    await page.waitForSelector('[data-ptool="split"] [data-ptool-result="badat"]', { timeout: 5000 }).catch(() => {});
    ok(/between 0 and 300 mm/.test(await card(page)) && /preview again/.test(await card(page)), space + ': a place outside the model is refused, and the old preview is marked stale');
    await page.screenshot({ path: path.join(OUT, `03-split-planes-${space}.png`) });
    await page.click('[data-ptool] [data-ptool-close]');
    await page.close();
  }
  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.join(' | ') : ''));
} finally {
  await browser.close();
  fs.rmSync(DL, { recursive: true, force: true });
  if (!KEEP_ADMIN) { try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch {} if (fs.existsSync(STATE)) fs.unlinkSync(STATE); }
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${OUT}`);
process.exit(fail ? 1 : 0);
