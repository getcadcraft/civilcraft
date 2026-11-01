#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-08.mjs — CadCraft 0.8 session cad-08, in the real page (/lab/cadcraft), one section per finished item:
 *   SU.932  a bearing typed at a prompt, AUNITS, the Properties angle box and the status bar
 *   D8.2    LIMITS: the grid fills the limits only, a click outside is refused, ZOOM All shows them
 *   SU.883  DIAGRAM: the paste box, a Mermaid flowchart drawn as blocks and connectors, selected, one undo
 *   SU.752  GDSIN: a GDSII file through the file picker, drawn on its layers
 *   D8.7    SHXFONTS Folder (the desktop bridge): a text style naming cc-block.shx is drawn in strokes; Reverse, Remove, a notice for fonts not loaded
 *
 *   node tools/cadcraft-test/browser-08.mjs [--shots <dir>]
 *
 * Run as root (a session for the test admin cctest+cadcraft@projectz.xyz is minted by tools/cadcraft-test/admin.php).
 * Cached Playwright Chromium; a stand-in desktop bridge (files in memory) as browser-07b.mjs.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = 'https://getcadcraft.com';
const args = process.argv.slice(2);
const si = args.indexOf('--shots');
const SHOTS = si >= 0 ? args[si + 1] : null;
if (SHOTS) fs.mkdirSync(SHOTS, { recursive: true });
let pass = 0, fail = 0;
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(REPO, 'tools/cadcraft-test/admin.php');
const admin = JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'session'], { encoding: 'utf8' }));
const b64 = (s) => Buffer.from(s, 'latin1').toString('base64');
const files = {
  '/fonts/cc-block.shx': fs.readFileSync(path.join(REPO, 'fixtures/shx/cc-block.shx')).toString('base64'),
  '/fonts/Notes.txt': b64('not a font'),
  '/fonts/BAD.SHX': b64('junk'),
};

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, serviceWorkers: 'block' });
const page = await ctx.newPage();
page.setDefaultTimeout(10000);
const problems = [];
page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
const T = (ms) => page.waitForTimeout(ms);
const say = () => page.evaluate(() => document.querySelector('[data-history]')?.textContent || '');
const run = async (...lines) => { for (const l of lines) { await page.evaluate((x) => { window.cadcraft.engine.text(x); }, l); await T(150); } };   // engine.text is not returned: a command that is still asking would hold the call back
try {
  await ctx.addCookies([{ name: admin.name, value: admin.value, domain: 'getcadcraft.com', path: '/', secure: true, httpOnly: true }]);
  await page.addInitScript((files) => {
    const store = new Map(Object.entries(files).map(([k, v]) => [k, Uint8Array.from(atob(v), (c) => c.charCodeAt(0))]));
    const desk = window.__desk = { answers: [], saves: [], folder: null, written: new Map() };
    window.cadcraftDesktop = {
      version: 1,
      openDialog: async () => (desk.answers.length ? desk.answers.shift() : null),
      saveDialog: async ({ defaultPath } = {}) => { const p = '/out/' + String(defaultPath || 'x').split(/[\\/]/).pop(); desk.saves.push(p); return p; },
      readFile: async (p) => { if (!store.has(p)) throw new Error('not_found: ' + p); return store.get(p).slice(); },
      writeFile: async (p, b) => { store.set(p, b); desk.written.set(p, b); },
      stat: async (p) => (store.has(p) ? { size: store.get(p).length, mtime: 0 } : null),
      openFolderDialog: async () => desk.folder,
      listDir: async (d) => [...store.keys()].filter((k) => k.startsWith(d + '/') && !k.slice(d.length + 1).includes('/')).map((k) => ({ name: k.slice(d.length + 1), dir: false })),
      launchFiles: async () => [],
      onOpenFiles: (cb) => { window.__deskOpen = cb; },
    };
  }, files);
  await page.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.__deskOpen);

  console.log('\n== SU.932: bearings');
  await run('LINE', '0,0', '@20<N45d23\'30"E', '');
  const ln = await page.evaluate(() => window.cadcraft.doc.all().filter((e) => e.type === 'line').map((e) => [e.x1, e.y1, e.x2, e.y2]));
  const a1 = ln.length ? Math.atan2(ln[0][3] - ln[0][1], ln[0][2] - ln[0][0]) * 180 / Math.PI : NaN;
  ok(ln.length === 1 && Math.abs(a1 - (90 - 45 - 23 / 60 - 30 / 3600)) < 1e-6 && Math.abs(Math.hypot(ln[0][2], ln[0][3]) - 20) < 1e-6, 'LINE: @20<N45d23\'30"E drew a 20-long line at that bearing', JSON.stringify(ln));
  await run('AUNITS', 'S', '4');
  const au = await page.evaluate(() => [window.cadcraft.doc.meta.aunits, window.cadcraft.doc.meta.auprec]);
  ok(au[0] === 4 && au[1] === 4, 'AUNITS set the surveyor format', JSON.stringify(au));
  await run('DIST', '0,0', '10,10');
  ok(/Angle = N45°00'00"E,/.test(await say()), 'DIST reports the bearing, not N45°00\'00"E°', (await say()).slice(-120));
  await page.evaluate(() => { const c = window.cadcraft; c.host.setSelection(new Set(c.doc.all().map((e) => e.id))); });
  await T(500);
  const pang = await page.evaluate(() => [...document.querySelectorAll('aside input.cc-pnum')].map((i) => i.value).filter((v) => /^[NS]/.test(v)));
  ok(pang.length >= 1 && /^N45°23'30"E$/.test(pang[0]), 'the Properties angle box shows the bearing', JSON.stringify(pang));
  const sel = await page.evaluate(() => { window.cadcraft.host.setSelection(new Set()); return !!document.querySelector('#cc-cur-aunits'); });
  await T(300);
  ok(sel || await page.evaluate(() => !!document.querySelector('#cc-cur-aunits')), 'Current settings has an Angle format box');
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'su932.png') });

  console.log('\n== D8.2: LIMITS');
  await page.evaluate(() => { const c = window.cadcraft; c.doc.change('clear', () => { for (const e of c.doc.all()) c.doc.remove(e.id); }); c.view.grid = true; c.view.invalidate(true); });
  await run('LIMITS', '0,0', '100,50', 'LIMITS', 'ON', 'ZOOM', 'A');
  await T(600);
  const lim = await page.evaluate(() => ({ m: window.cadcraft.doc.meta.limits, z: window.cadcraft.view.zoom, vis: (() => { const v = window.cadcraft.view, a = v.toWorld(0, 0), b = v.toWorld(v.w, v.h); return [Math.min(a.x, b.x), Math.max(a.x, b.x), Math.min(a.y, b.y), Math.max(a.y, b.y)]; })() }));
  ok(lim.m && lim.m.on && lim.m.x1 === 100 && lim.vis[0] <= 0 && lim.vis[1] >= 100 && lim.vis[2] <= 0 && lim.vis[3] >= 50 && (lim.vis[1] - lim.vis[0]) < 300, 'ZOOM All shows the limits (0,0 to 100,50) and not much more', JSON.stringify(lim.vis));
  // pixels: the grid lies inside the limits and nowhere else
  const px = await page.evaluate(() => {
    const v = window.cadcraft.view, cvs = [...document.querySelectorAll('main canvas')].filter((c) => c.width > 300);
    const count = (x0, y0, x1, y1) => {
      const a = v.toScreen(x0, y0), b = v.toScreen(x1, y1), d = v.dpr || 1;
      const sx = Math.round(Math.min(a.x, b.x) * d), sy = Math.round(Math.min(a.y, b.y) * d), w = Math.max(1, Math.round(Math.abs(b.x - a.x) * d)), h = Math.max(1, Math.round(Math.abs(b.y - a.y) * d));
      let n = 0;
      for (const c of cvs) { const g = c.getContext('2d'); if (!g) continue; try { const im = g.getImageData(sx + (v.x0 || 0) * d, sy + (v.y0 || 0) * d, Math.min(w, c.width - sx), Math.min(h, c.height - sy)).data; for (let i = 3; i < im.length; i += 4) if (im[i] > 0) n++; } catch { /* tainted */ } }
      return n;
    };
    return { inside: count(10, 5, 90, 45), outsideRight: count(110, 5, 140, 45), outsideAbove: count(10, 60, 90, 90), canvases: cvs.length };
  });
  ok(px.inside > 50 && px.outsideRight === 0 && px.outsideAbove === 0, 'the grid is drawn inside the limits only (pixels inside / outside right / outside above)', JSON.stringify(px));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'limits.png') });
  const n0 = await page.evaluate(() => window.cadcraft.doc.count());
  await run('CIRCLE', '150,20');
  ok(/Outside limits/.test(await say()) && await page.evaluate(() => window.cadcraft.engine.expects === 'point'), 'a typed centre outside is refused with **Outside limits and CIRCLE keeps asking');
  await run('20,20', '5');
  ok(await page.evaluate((n) => window.cadcraft.doc.count() === n + 1, n0), 'then a centre inside the limits draws the circle');
  await run('LIMITS', 'OFF');
  await run('CIRCLE', '150,20', '5');
  ok(await page.evaluate((n) => window.cadcraft.doc.count() === n + 2, n0), 'with the limits OFF the same point is accepted');
  await page.evaluate(() => window.cadcraft.doc.undo());

  console.log('\n== D8.7: SHX fonts');
  await page.evaluate(() => { const c = window.cadcraft; c.doc.change('clear', () => { for (const e of c.doc.all()) c.doc.remove(e.id); c.doc.setStyle('textStyles', 'Standard', { font: 'cc-block.shx', h: 0, wf: 1, obl: 0 }); c.doc.add({ type: 'text', x: 10, y: 10, h: 16, s: 'LLBO', rot: 0, layer: '0' }); }); c.view.fit(); });
  await T(300);
  const before = await page.evaluate(() => { const c = window.cadcraft.view.ensureCache(); return { texts: c.texts.length, paths: c.paths.length }; });
  ok(before.texts === 1, 'before the font is loaded the text is plain text (built-in face)', JSON.stringify(before));
  await run('SHXFONTS', 'L');
  ok(/No SHX fonts are loaded/.test(await say()) && /Named by this drawing but not loaded: cc-block\.shx \(Standard\)/.test(await say()), 'the list says none are loaded and names the missing font and its style', (await say()).slice(-200));
  await page.evaluate(() => { window.__desk.folder = '/fonts'; });
  await run('SHXFONTS', 'F');
  await T(800);
  const msg = await say();
  ok(/Added 1 font\(s\): cc-block\.shx/.test(msg) && /Not added: BAD\.SHX/.test(msg), 'Folder reads the .shx files, adds the good one, says which one it could not read; Notes.txt is ignored', msg.slice(-260));
  const after = await page.evaluate(() => { const c = window.cadcraft.view.ensureCache(); return { texts: c.texts.length, paths: c.paths.length, prims: c.paths.reduce((n, p) => n + (p.prims?.length || 0), 0) }; });
  ok(after.texts === 0 && after.paths >= 1, 'the text is now drawn as strokes (no text item left, a path layer holds it)', JSON.stringify(after));
  const box = await page.evaluate(() => { const e = window.cadcraft.doc.all()[0]; const lay = window.cadcraft.doc; return [e.s]; });
  const ink = await page.evaluate(() => {
    const v = window.cadcraft.view, cvs = [...document.querySelectorAll('main canvas')].filter((c) => c.width > 300);
    const a = v.toScreen(10, 10), b = v.toScreen(10 + 70, 10 + 16), d = v.dpr || 1;
    let n = 0;
    for (const c of cvs) { const g = c.getContext('2d'); try { const x = Math.round(Math.min(a.x, b.x) * d + v.x0 * d), y = Math.round(Math.min(a.y, b.y) * d + v.y0 * d), w = Math.round(Math.abs(b.x - a.x) * d), h = Math.round(Math.abs(b.y - a.y) * d); const im = g.getImageData(x, y, Math.max(1, w), Math.max(1, h)).data; for (let i = 3; i < im.length; i += 4) if (im[i] > 0) n++; } catch { /* tainted */ } }
    return n;
  });
  ok(ink > 100, 'the strokes show on the canvas (pixels in the text\'s box)', String(ink));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'shx.png') });
  await run('SHXFONTS', 'L');
  ok(/cc-block\.shx: shapes, 9 shapes/.test(await say()), 'List shows the loaded font, its kind and shapes');
  await run('SHXFONTS', 'V', 'cc-block');
  ok(/letters are now drawn in reverse order/.test(await say()) && await page.evaluate(() => window.cadcraft.view.ensureCache().paths.length >= 1), 'Reverse flips the font and redraws');
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForFunction(() => !!window.cadcraft && !!window.__deskOpen);
  await T(1200);
  await run('SHXFONTS', 'L');
  ok(/cc-block\.shx: shapes, 9 shapes, letters reversed/.test(await say()), 'after a restart the folder is read again and the reverse switch is remembered (this browser)', (await say()).slice(-200));
  await run('SHXFONTS', 'R', 'cc-block');
  ok(/Removed cc-block\.shx/.test(await say()), 'Remove forgets the font');
  await run('SHXFONTS', 'C');

  console.log('\n== SU.883: text to diagram');
  await page.evaluate(() => { const c = window.cadcraft; c.doc.change('clear', () => { for (const e of c.doc.all()) c.doc.remove(e.id); }); });
  await page.evaluate(() => { window.cadcraft.engine.text('DIAGRAM'); });
  await page.waitForSelector('dialog.cc-diagram-dlg textarea', { state: 'visible' });
  ok(true, 'DIAGRAM opens a box to paste the text into');
  // rule 41: both are on the toolbar (Blocks › More) and in the ribbon's Insert tab, not only at the command line
  const mount = await page.evaluate(() => ({ diagram: !!document.querySelector('[data-cmd="DIAGRAM"]'), gds: !!document.querySelector('[data-cmd="GDSIN"]'), reg: !!(window.ccInput && (window.ccInput.commands || window.ccInput.registry)) }));
  ok(mount.diagram && mount.gds, 'the toolbar has "Diagram from text…" and "View an IC layout (GDSII)…" in the Blocks menu', JSON.stringify(mount));
  await page.evaluate(() => { document.querySelector('dialog.cc-diagram-dlg [data-cancel]')?.click(); });
  await T(200);
  await page.evaluate(() => { document.querySelector('[data-cmd="DIAGRAM"]').click(); });
  await page.waitForSelector('dialog.cc-diagram-dlg textarea', { state: 'visible' });
  ok(true, 'the toolbar entry opens the same paste box');
  await page.fill('dialog.cc-diagram-dlg textarea', 'flowchart TD\n  A[Pump] -->|water| B{Valve open?}\n  B -->|yes| C([Tank])\n  B -->|no| D[Drain]\n  D --> A\n  C --> E[Meter]\n  D --> E');
  await page.click('dialog.cc-diagram-dlg [data-ok]');
  await T(300);
  await run('0,0', '5');
  await T(400);
  const dg = await page.evaluate(() => { const d = window.cadcraft.doc, all = d.all(); return { n: all.length, polys: all.filter((e) => e.type === 'poly').length, texts: all.filter((e) => e.type === 'text').map((e) => e.s), layer: d.layers.has('Diagram'), sel: window.cadcraft.host.selection.size }; });
  ok(dg.layer && dg.polys === 5 + 6 && dg.texts.includes('Pump') && dg.texts.includes('Valve open?') && dg.texts.includes('water') && dg.sel === dg.n, '5 blocks and 6 connectors drawn on layer Diagram, all selected', JSON.stringify(dg));
  ok(/Read Mermaid: 5 blocks and 6 connectors/.test(await say()) && /Drew 5 blocks and 6 connectors/.test(await say()), 'the history says what was read and drawn');
  await page.evaluate(() => { window.cadcraft.view.fit(); });
  await T(500);
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'diagram.png') });
  await page.evaluate(() => window.cadcraft.doc.undo());
  ok(await page.evaluate(() => window.cadcraft.doc.count() === 0), 'one undo removes the whole diagram');

  console.log('\n== SU.752: GDSII viewer');
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.evaluate(() => { window.cadcraft.engine.text('GDSIN'); })]);
  await chooser.setFiles(path.join(REPO, 'fixtures/gds/cc-test.gds'));
  await T(800);
  const gd = await page.evaluate(() => { const d = window.cadcraft.doc; return { n: d.count(), layers: [...d.layers.keys()].filter((k) => k.startsWith('GDS')).sort() }; });
  ok(gd.n === 21 && gd.layers.join() === 'GDS 1,GDS 2/5,GDS 63', 'the layout is drawn: 21 shapes on GDS 1, GDS 2/5 and GDS 63', JSON.stringify(gd));
  ok(/Drew 21 shapes on 3 layers from cc-test\.gds, cell TOP, in micrometres/.test(await say()), 'the history says what was drawn');
  await run('DIST', '11,0.5', '15,8.5');
  ok(/Distance = 8\.9443/.test(await say()), 'DIST measures the layout in its own units (a 4 × 8 shape\'s diagonal 8.9443 µm)', (await say()).slice(-120));
  if (SHOTS) await page.screenshot({ path: path.join(SHOTS, 'gds.png') });
} finally {
  await browser.close();
  try { execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, 'down'], { encoding: 'utf8' }); } catch { /* already gone */ }
}
if (problems.length) { console.log('\npage problems:\n  ' + [...new Set(problems)].slice(0, 8).join('\n  ')); }
console.log('\n' + pass + ' passed, ' + fail + ' failed');
process.exit(fail ? 1 : 0);
