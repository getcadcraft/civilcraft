#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-gaps.mjs — the 0.7 AS.6 tools of session assistants-gaps, each in a real /lab window: ModelCraft and BimCraft
 * render_still (and render_queue's answer without WebGPU), PartCraft illustrate_export on the manual open in Illustrate,
 * TakeoffCraft cad_sheets / cad_count / cad_count_add / cad_measure on an open DWG.
 *
 *   node tools/mcp/test/browser-gaps.mjs [--shots <dir>] [--verbose]      (run as root)
 *
 * KICKOFF rule 14: every render is tiny — 64 × 48 px, quality draft (16 samples), one box (ModelCraft) or the public house
 * (BimCraft) — and runs once; no loop. Headless Chromium has no GPU: the path tracer runs on WebGL there, the queue (WebGPU only)
 * must refuse plainly. Studio's window channel stood in (studio-stand-in.mjs); assistants switched on in each app's stored
 * settings. One sign-in: the assistants test admin (tools/mcp/test/admin.php).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..', '..');
const { studioStandIn } = await import(pathToFileURL(path.join(REPO, 'tools/mcp/test/studio-stand-in.mjs')).href);
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
const VERBOSE = args.includes('--verbose');
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra !== '' ? ' — ' + (typeof extra === 'string' ? extra : JSON.stringify(extra)).slice(0, 500) : '')); } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const sc = (r) => (r && r.structuredContent) || {};
const text = (r) => (r && r.content && r.content[0] && r.content[0].text) || '';
const image = (r) => (r && r.content || []).find((c) => c.type === 'image') || null;
const pngSize = (b64) => { const b = Buffer.from(b64, 'base64'); return b.subarray(1, 4).toString() === 'PNG' ? { w: b.readUInt32BE(16), h: b.readUInt32BE(20) } : null; };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/mcp/test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'up'], { encoding: 'utf8' }));
const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block', acceptDownloads: true });
const problems = [];

async function appPage(app, settings) {
  const p = await ctx.newPage();
  p.on('console', (m) => { if (m.type() === 'error') problems.push(app + ' console: ' + m.text()); });
  p.on('pageerror', (e) => problems.push(app + ' pageerror: ' + e.message));
  const S = await studioStandIn(p, { app, desktop: false });
  await p.addInitScript(([k, v]) => { try { localStorage.setItem(k, v); } catch { /* fine */ } }, settings);
  await p.goto(BASE + '/lab/' + app + '?space=paper', { waitUntil: 'networkidle' });
  return { p, S };
}
const TINY = { width: 64, height: 48, quality: 'draft' };

try {
  const lp = await ctx.newPage();
  await lp.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await lp.fill('input[name="email"]', admin.email);
  await lp.fill('input[name="password"]', admin.password);
  await Promise.all([lp.waitForNavigation(), lp.click('form button[type="submit"]')]);
  await lp.close();

  console.log('\n== ModelCraft: render_still, render_queue');
  {
    const { p, S } = await appPage('modelcraft', ['cadcraft.assistants.modelcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit', 'export'] })]);
    await p.waitForFunction(() => !!window.modelcraft, null, { timeout: 30000 }).catch(() => {});
    const names = (await S.rpc('tools/list', {})).result.tools.map((t) => t.name);
    ok(names.includes('render_still') && names.includes('render_queue'), 'render_still and render_queue are listed (export allowed)', names);
    await S.call('box_add', { size: ['2m', '1m', '1m'] });
    const undo0 = await p.evaluate(() => window.modelcraft.model.undoStack.length);
    let r = await S.call('render_still', { ...TINY, mode: 'fast' });
    const im = image(r), dim = im ? pngSize(im.data) : null;
    ok(!r.isError && dim && dim.w === 64 && dim.h === 48 && sc(r).engine === 'webgl-fast' && sc(r).samples === 16, 'render_still fast: a 64 × 48 PNG back to the assistant, 16 passes', { s: sc(r), dim, t: text(r) });
    r = await S.call('render_still', { ...TINY, mode: 'hq', engine: 'webgl' });
    const dim2 = image(r) ? pngSize(image(r).data) : null;
    ok(!r.isError && dim2 && dim2.w === 64 && sc(r).engine === 'webgl' && sc(r).mode === 'hq', 'render_still hq on WebGL (no GPU here): a 64 × 48 path-traced PNG', { s: sc(r), t: text(r) });
    ok((await p.evaluate(() => window.modelcraft.model.undoStack.length)) === undo0, 'rendering added no undo step');
    r = await S.call('render_still', { ...TINY, mode: 'fast', scene: 'Nowhere' });
    ok(r.isError && /No scene "Nowhere"/.test(text(r)), 'an unknown scene is refused, listing the scenes', text(r));
    const dl = p.waitForEvent('download', { timeout: 60000 }).catch(() => null);
    r = await S.call('render_still', { ...TINY, mode: 'fast', download: true });
    const got = await dl;
    const head = got ? fs.readFileSync(await got.path()).subarray(1, 4).toString() : '';
    ok(!r.isError && /render\.png$/.test(sc(r).downloaded || '') && head === 'PNG', 'download: true saves the PNG as the dialog\'s Save does', sc(r));
    const gpu = await p.evaluate(async () => !!(navigator.gpu && await navigator.gpu.requestAdapter().catch(() => null)));
    r = await S.call('render_queue', { add: [{ name: 'tiny', ...TINY }] });
    if (!gpu) ok(r.isError && /needs WebGPU/.test(text(r)), 'render_queue without WebGPU: refused, saying render_still works on WebGL', text(r));
    else ok(!r.isError && sc(r).jobs.some((j) => j.added && j.status === 'done'), 'render_queue with WebGPU: the tiny job rendered', sc(r));
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'gaps-modelcraft.png') });
  }

  console.log('\n== BimCraft: render_still');
  {
    const { p, S } = await appPage('bimcraft', ['bimcraft.settings', JSON.stringify({ assistants: { enabled: true, groups: ['read', 'edit', 'export'] } })]);
    await p.setInputFiles('[data-file]', path.join(REPO, 'fixtures/showcase/bimcraft-house.ifc'));
    let info = null;
    for (let i = 0; i < 120 && !(info && info.open); i++) { await wait(500); info = sc(await S.call('app_info', {})); }
    ok(info && info.open, 'the house is open in BimCraft', info);
    const r = await S.call('render_still', { ...TINY, mode: 'fast' });
    const dim = image(r) ? pngSize(image(r).data) : null;
    ok(!r.isError && dim && dim.w === 64 && dim.h === 48, 'render_still in BimCraft: a 64 × 48 PNG through the Render dialog\'s scene (paints, lamps, sun)', { s: sc(r), t: text(r) });
    const r2 = await S.call('render_still', { ...TINY, scene: 1 });
    ok(r2.isError && /no saved scenes/.test(text(r2)), 'BimCraft has no saved scenes: a scene is refused', text(r2));
  }

  console.log('\n== PartCraft: illustrate_export');
  {
    const { p, S } = await appPage('partcraft', ['cadcraft.assistants.partcraft', JSON.stringify({ enabled: true, groups: ['read', 'export'] })]);
    await p.waitForFunction(() => !!window.partcraft, null, { timeout: 60000 });
    let r = await S.call('illustrate_export', {});
    ok(r.isError && /No manual is open/.test(text(r)), 'no manual open: refused, saying where to open one', text(r));
    await p.selectOption('[data-workspace]', 'illustrate');
    await p.waitForFunction(() => window.partcraft.workspace === 'illustrate');
    const [fc] = await Promise.all([p.waitForEvent('filechooser'), p.click('.pc-tools [data-cmd="illustrate-open"]')]);
    await fc.setFiles(path.join(REPO, 'fixtures/showcase/partcraft-four-bar.partcraft-manual.json'));
    await p.waitForFunction(() => window.partcraft.WS.getWorkspace('illustrate')._state.doc, null, { timeout: 30000 });
    let dl = p.waitForEvent('download', { timeout: 60000 }).catch(() => null);
    r = await S.call('illustrate_export', { as: 'pdf', view: 'Exploded' });
    let got = await dl;
    const head = got ? fs.readFileSync(await got.path()).subarray(0, 5).toString() : '';
    ok(!r.isError && sc(r).pages === 1 && head === '%PDF-' && /Exploded\.pdf$/.test(sc(r).downloaded?.[0] || ''), 'illustrate_export: the open manual\'s Exploded view as a one-page PDF download', sc(r));
    dl = p.waitForEvent('download', { timeout: 60000 }).catch(() => null);
    r = await S.call('illustrate_export', { as: 'html' });
    got = await dl;
    const html = got ? fs.readFileSync(await got.path(), 'utf8') : '';
    ok(!r.isError && /default-src 'none'/.test(html) && /@il\/three/.test(html), 'illustrate_export html: the interactive 3D file (modules fetched by the page)', sc(r));
  }

  console.log('\n== TakeoffCraft: counting and measuring on a DWG');
  {
    const { p, S } = await appPage('takeoffcraft', ['cadcraft.assistants.takeoffcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit', 'export'] })]);
    await p.waitForFunction(() => !!window.takeoffcraft, null, { timeout: 30000 });
    const TRUTH = JSON.parse(fs.readFileSync(path.join(REPO, 'fixtures/cad/kitchen-count.truth.json'), 'utf8'));
    for (const f of ['kitchen-count.dwg', 'geometry-measure.dwg']) {
      const b64 = fs.readFileSync(path.join(REPO, 'fixtures/cad', f)).toString('base64');
      await p.evaluate(async ([b, n]) => { const bin = Uint8Array.from(atob(b), (c) => c.charCodeAt(0)); await window.takeoffcraft.openFiles([new File([bin], n)]); }, [b64, f]);
    }
    await p.waitForFunction(() => window.takeoffcraft.sheets().length >= 4, null, { timeout: 60000 });
    let r = await S.call('cad_sheets', {});
    const kd = (sc(r).drawings || []).find((d) => d.file === 'kitchen-count.dwg');
    ok(!r.isError && kd && kd.sheets.some((s) => s.sheet === 'K-101' && s.scale === TRUTH.scale), 'cad_sheets: the drawings and K-101\'s scale from its viewport', sc(r));
    r = await S.call('cad_count', { sheet: 'K-101', block: 'SHELF-18X48' });
    ok(!r.isError && sc(r).total === TRUTH.shelves && sc(r).hiddenSkipped === TRUTH.shelvesFrozen, 'cad_count: 22 shelves on K-101 (3 on a frozen layer left out)', sc(r));
    r = await S.call('cad_count_add', { sheet: 'K-101', block: 'SHELF-18X48', name: 'Shelf' });
    const marks = await p.evaluate(() => window.takeoffcraft.model.state.marks.filter((m) => m.kind === 'count').length);
    ok(!r.isError && sc(r).added === 22 && marks === 22, 'cad_count_add: 22 count marks in the window', sc(r));
    await p.evaluate(() => window.takeoffcraft.model.undo());
    ok((await p.evaluate(() => window.takeoffcraft.model.state.items.length)) === 0, 'the person\'s undo takes the item and its 22 marks away in one step');
    await S.call('items_add', { items: [{ name: 'Wall', type: 'linear' }] });
    const gKey = (sc(await S.call('cad_sheets', {})).drawings || []).find((d) => d.file === 'geometry-measure.dwg')?.sheets[0].key;
    r = await S.call('cad_measure', { sheet: gKey, item: 'Wall' });
    ok(!r.isError && sc(r).added > 0 && sc(r).quantity > 0 && /^Assistant: measure/.test(sc(r).undo || ''), 'cad_measure: runs from the drawing\'s geometry (its Model sheet, by key), one undo step', { s: sc(r), t: text(r) });
    if (SHOTS) await p.screenshot({ path: path.join(SHOTS, 'gaps-takeoffcraft.png') });
  }
  ok(!problems.length, 'no console errors', problems.slice(0, 5));
} catch (e) {
  fail++; console.log('  FAIL ' + (e && e.stack || e));
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down']); } catch { /* fine */ }
}
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
