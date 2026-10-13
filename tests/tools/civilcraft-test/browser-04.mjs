#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-04.mjs — CivilCraft's 0.4 items (session civil) in headless Chromium at https://getcadcraft.com/lab/civilcraft,
 * by real clicks, keys and file inputs. Grows one section per finished item:
 *   V1  Linework (DWG / DXF): the toolbar button, the layer dialog for the ODA DWG and the ezdxf DXF fixtures, contours
 *       straight into the surface, the boundary from a closed polyline (skipped, said, while civilcraft/dev has no reader
 *       copies — cad-files makes them)
 *   V13 sample lines and the section view: an alignment drawn by clicks, profile from the ground raised 3 ft, corridor on,
 *       Add sample lines, Next/→/End/Home and the station list, 1× exaggeration, CSV, spacing + undo, X toggles
 *   V14 feature lines: drawn by clicks (L), at the ground, a breakline; a typed grade; a stepped offset; a vertex dragged; a
 *       closed line (click the first vertex) graded into the design, raised, daylighted; Delete + undo
 *   V15 plan and profile sheets: alignment by clicks, the dialog from Properties, scale changes the count, a bad range, Download
 *       PDF read back by poppler (pages, sheet numbers, match lines)
 *   V16 description keys and line codes: a field-coded CSV (curb runs with B/E, a building with C), the dialog (add a key by
 *       typing, its live count), Apply = one step, groups and surface follow, a point's key in Properties, undo, a bad code
 *   V3  map layers draped in 3D: a georeferenced two-colour picture over the sample site, 3D › Map layers, top-view pixels west
 *       magenta / east green, back to bands, a hidden map is said
 *   V4  GIS layers in 3D: a line layer added through the app's own module, drawn draped, Show › GIS layers on/off
 *   V5  picking in 3D: an alignment by a click (selected, Properties, highlighted), a drawn breakline (named, highlighted),
 *       highlight cleared with the selection
 *   V6  KML in (a sketch over the sample site, placed through EPSG:2277) and KMZ out from GIS › Export
 *   V7  labels from attributes: Label with › name in the layer menu, the plan scene and the PDF plot (pdftotext)
 *   V8  map layers in the PDF (pdfimages: one JPEG) and the DWG (a zip: DWG + PNG + world file)
 *   V9  undoable surface replacement: LandXML out and in, Rebuild the surface from the points, Ctrl+Z / Ctrl+Y
 *   V17 cross-section sheets: the dialog from the sample lines, its page count, the PDF's pages (pdfinfo)
 *   V24 mass haul: totals match the sections, shrink −10 % / swell +5 %, the diagram, CSV
 *   V11 grid shift file: NAD27 system, NADCON5 added from a file (one step), lat/long move, saved, off + Ctrl+Z
 *   V10 drive (eye on the design profile, Space/→/Esc) and the sun (solstice noon in Boulder, evening shadows, night)
 *   V23 staking report: corridor edge offsets, counts, CSV, PDF (pdftotext), survey points near the alignment
 *   V22 traverse: angular 40" and linear 0.040 ft misclosure, 1 : 9,999, CSV, stations as survey points (one step, Ctrl+Z), a loop as a parcel
 *   V21 parcels: deed calls (misclosure, precision), legal description, a radius typed (one step), drawn by clicks, Delete / Ctrl+Z
 *   V19/V20 catchments drawn by clicks, C typed, flows summed, the pipes sized (one step), outlet water → full + flooding, Ctrl+Z
 *   V18 superelevation: switch on in Properties, the curve's rate and the diagram, Δ as one undo step, the tilt at mid curve
 *   V2  one point at a time: type number / easting / elevation / description in Properties (Enter), a refused value
 *       (aria-invalid, said), undo/redo, drag the selected point on the plan, Esc cancels a drag
 * Also: the toolbar still on one row at 1440 px, language strings on the page, no console errors.
 *
 *   node tools/civilcraft-test/browser-04.mjs [--out <dir>] [--stay-up]
 * Run as root: own test admin civilcrafttest-civ04+cadcraft@projectz.xyz via `sudo -u www-data php admin.php up|down civ04`.
 * Screenshots: tmp/shots/civilcraft-04/.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import zlib from 'node:zlib';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/civilcraft-04'));
const STATE = path.join(REPO, 'tmp/civilcraft-test/state-civ04.json');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(STATE), { recursive: true });

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const note = (s) => console.log('  note ' + s);

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd, 'civ04'], { encoding: 'utf8' }));

const browser = await chromium.launch({ executablePath: exe, args: ['--no-sandbox', '--host-resolver-rules=MAP getcadcraft.com 127.0.0.1'] });
const problems = [];
const watch = (page) => {
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
};
async function signedInContext(opts = {}) {
  if (fs.existsSync(STATE)) {
    const ctx = await browser.newContext({ storageState: STATE, acceptDownloads: true, ...opts });
    const p = await ctx.newPage();
    const r = await p.goto(BASE + '/lab/civilcraft', { waitUntil: 'domcontentloaded' });
    const okNow = r.status() === 200 && (await p.$('[data-civilcraft]'));
    await p.close();
    if (okNow) return ctx;
    await ctx.close();
  }
  const cred = admin('up');
  const ctx = await browser.newContext({ acceptDownloads: true, ...opts });
  const p = await ctx.newPage();
  await p.goto(BASE + '/admin/login', { waitUntil: 'domcontentloaded' });
  await p.fill('input[name="email"]', cred.email);
  await p.fill('input[name="password"]', cred.password);
  await Promise.all([p.waitForNavigation(), p.click('form button[type="submit"]')]);
  await ctx.storageState({ path: STATE });
  await p.close();
  return ctx;
}
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/** A PNG written by hand (RGBA, no filter), for the map-layer picture. */
function png(w, h, px) {
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; for (let x = 0; x < w; x++) { const c = px(x, y), o = y * (w * 4 + 1) + 1 + x * 4; raw[o] = c[0]; raw[o + 1] = c[1]; raw[o + 2] = c[2]; raw[o + 3] = 255; } }
  const chunk = (type, data) => { const t = Buffer.from(type), len = Buffer.alloc(4); len.writeUInt32BE(data.length); const crc = Buffer.alloc(4); crc.writeUInt32BE(zlib.crc32(Buffer.concat([t, data]))); return Buffer.concat([len, t, data, crc]); };
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

const shot = (page, name) => page.screenshot({ path: path.join(OUT, name + '.png') });
const E = (page, f, a) => page.evaluate(f, a);

let ctx;
try {
  ctx = await signedInContext({ viewport: { width: 1440, height: 900 } });
  // 0.4 1.2: a reload after unsaved work offers "Recover your work?" (app-autosave.js); this suite does not test that
  // (browser-part2.mjs a12 does), so the offer is discarded whenever it shows
  await ctx.addInitScript(() => {
    new MutationObserver(() => { const b = document.querySelector('[data-autosave-dialog][open] [data-autosave-discard]'); if (b) b.click(); })
      .observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['open'] });
  });
  const page = await ctx.newPage();
  watch(page);
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });

  console.log('\n== toolbar and language strings');
  const tb = await E(page, () => {
    const t = document.querySelector('main > [role="toolbar"]'), gs = [...t.querySelectorAll(':scope > [role="group"]')];
    return { tops: [...new Set(gs.map((g) => Math.round(g.getBoundingClientRect().top)))], right: Math.round(Math.max(...gs.map((g) => g.getBoundingClientRect().right))) };
  });
  ok(tb.tops.length === 1, `toolbar on one row at 1440 px (right edge ${tb.right} px)`);
  ok(await E(page, () => !!document.getElementById('cc-lang')), 'the language catalog is on the page (#cc-lang)');
  const menus = await E(page, () => [...document.querySelectorAll('details[data-group-menu]')].map((d) => d.dataset.groupMenu + ':' + [...d.querySelectorAll('[data-cmd]')].map((b) => b.dataset.cmd).join('+')));
  ok(menus.join() === 'Surface:cad-open+feature+sections', 'group More menus: ' + menus.join(' · '));
  await page.click('details[data-group-menu="Surface"] > summary');
  const cadBtn = page.locator('details[data-group-menu="Surface"] [data-cmd="cad-open"]');
  ok(await cadBtn.isVisible() && (await cadBtn.textContent()).trim() === 'Linework', 'Surface › More › Linework (from lang/en.json)');
  await page.keyboard.press('Escape');
  ok(!(await page.$eval('details[data-group-menu="Surface"]', (d) => d.open)), 'Esc closes the menu');
  await page.locator('.cv-tools').screenshot({ path: path.join(OUT, '00-toolbar-1440.png') });

  // ------------------------------------------------------------------ V1
  console.log('\n== V1: DWG / DXF as linework');
  const haveReader = fs.existsSync(path.join(APP, 'dwg/read.js')) && fs.existsSync(path.join(APP, 'dxf-model.js'));
  if (!haveReader) note('skipped: civilcraft/dev has no dwg/read.js or dxf-model.js yet (asked of cad-files)');
  else {
    for (const [file, n] of [['site-linework-2018.dwg', 'DWG 2018 (ODA)'], ['site-linework.dxf', 'DXF (ezdxf)']]) {
      await E(page, () => { window.civilcraft.gis?.setProject?.(new (window.civilcraft.project.constructor)()); });
      await page.setInputFiles('[data-file]', path.join(HERE, 'fixtures/cad', file));
      await page.waitForSelector('dialog[data-cad-dialog][open]', { timeout: 30000 });
      const rows = await page.$$eval('dialog[data-cad-dialog] [data-cad-layer]', (r) => r.map((x) => x.dataset.cadLayer));
      ok(rows.includes('C-TOPO-MAJR') && rows.includes('V-BNDY') && !rows.includes('ANNO'), n + ': layers listed (' + rows.length + '), text layer not');
      const auto = await page.$eval('dialog[data-cad-dialog] select[data-cad-use="C-TOPO-MINR|pg"]', (s) => s.selectedOptions[0].textContent);
      ok(/Breaklines/.test(auto), n + ': contour layer starts as breaklines (' + auto + ')');
      await page.selectOption('dialog[data-cad-dialog] select[data-cad-use="V-BNDY|pg"]', { label: 'The surface boundary (a polygon’s outer edge)' });
      if (file.endsWith('.dwg')) await shot(page, '01-cad-dialog');
      await page.click('dialog[data-cad-dialog] [data-cad-go]');
      await page.waitForFunction(() => window.civilcraft.project.eg().surface);
      const r = await E(page, () => { const p = window.civilcraft.project; const s = p.eg().surface; return { bl: p.state.surface.breaklines.length, bnd: p.state.surface.boundary?.length, z: s.elevationAt(2000500 + 100, 500500), layers: p.state.gis.layers.length }; });
      ok(r.bl === 21 && r.bnd === 4, n + ': 20 contour breaklines + the 3D breakline (C-TOPO-BRKL, used by default) and a 4-corner boundary (' + r.bl + ')');
      ok(Math.abs(r.z - (120 - 0.0004 * 100 * 100)) < 0.6, n + ': the surface gives the hill back at r = 100 (' + r.z?.toFixed(3) + ')');
      if (file.endsWith('.dwg')) await shot(page, '02-cad-surface');
    }
  }

  // ------------------------------------------------------------------ V2
  console.log('\n== V2: one point at a time');
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-sample]');
  await page.waitForSelector('[data-import][open]');
  await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  // pick a point that is on screen, by a real click
  const target = await E(page, () => { const c = window.civilcraft, p = c.project.points.find((q) => q.z !== null && /^\d+$/.test(q.n) && c.project.eg().surface.elevationAt(q.x, q.y) != null); const s = c.toScreen(p.x, p.y); return { n: p.n, x: p.x, y: p.y, z: p.z, sx: s.x, sy: s.y }; });
  await page.mouse.click(target.sx, target.sy);
  await page.waitForSelector('[data-point-edit]');
  ok(await E(page, (n) => window.civilcraft.picked.join() === n, target.n), 'clicked point ' + target.n + ' is selected; Properties shows the editor');
  const steps0 = await E(page, () => window.civilcraft.project.undoStack.length);
  await page.fill('#cv-pt-z', String(target.z + 5));
  await page.press('#cv-pt-z', 'Enter');
  await page.waitForFunction((a) => window.civilcraft.project.points.find((q) => q.n === a.n).z === a.z + 5, target);
  ok(await E(page, (a) => Math.abs(window.civilcraft.project.eg().surface.elevationAt(a.x, a.y) - (a.z + 5)) < 1e-9, target), 'typed elevation + Enter: the point and the surface change');
  ok(/changed/.test(await page.textContent('[data-status]')), 'the status line says so');
  await page.fill('#cv-pt-d', 'SPOT edited');
  await page.press('#cv-pt-d', 'Enter');
  await page.waitForFunction((n) => window.civilcraft.project.points.find((q) => q.n === n).d === 'SPOT edited', target.n);
  ok(await E(page, () => window.civilcraft.project.state.surface.groups.SPOT === 'points'), 'a new description: group SPOT appears');
  await page.fill('#cv-pt-x', 'not a number');
  await page.press('#cv-pt-x', 'Enter');
  ok(await page.getAttribute('#cv-pt-x', 'aria-invalid') === 'true', 'junk easting: the box is marked invalid');
  ok(/Type a number/.test(await page.textContent('[data-status]')), 'and the reason is said');
  ok(await E(page, (a) => window.civilcraft.project.points.find((q) => q.n === a.n).x === a.x, target), 'the point did not move');
  const other = await E(page, (n) => window.civilcraft.project.points.find((q) => q.n !== n).n, target.n);
  await page.fill('#cv-pt-n', other);
  await page.press('#cv-pt-n', 'Enter');
  ok(/already exists/.test(await page.textContent('[data-status]')) && await E(page, (n) => window.civilcraft.project.points.some((q) => q.n === n), target.n), 'number ' + other + ' (another point’s) is refused, said; nothing renumbered');
  await page.fill('#cv-pt-n', 'CTRL-A');
  await page.press('#cv-pt-n', 'Enter');
  await page.waitForFunction(() => window.civilcraft.project.points.some((q) => q.n === 'CTRL-A'));
  await page.locator('[data-over]').focus();
  await wait(100);
  ok(await E(page, () => window.civilcraft.picked.join() === 'CTRL-A'), 'renumbered to CTRL-A and still selected');
  await shot(page, '03-point-editor');
  ok(await E(page, () => window.civilcraft.project.undoStack.length) === steps0 + 3, 'three edits = three undo steps');
  // drag the selected point by its grip
  const g = await E(page, () => { const c = window.civilcraft, p = c.project.points.find((q) => q.n === 'CTRL-A'); return c.toScreen(p.x, p.y); });
  await page.mouse.move(g.x, g.y);
  await page.mouse.down();
  await page.mouse.move(g.x + 20, g.y + 10, { steps: 6 });
  await page.mouse.move(g.x + 40, g.y - 30, { steps: 6 });
  ok(/Release to move it/.test(await page.textContent('[data-status]')), 'dragging: the status shows where it goes');
  await shot(page, '04-point-drag');
  await page.mouse.up();
  const after = await E(page, (a) => { const p = window.civilcraft.project.points.find((q) => q.n === 'CTRL-A'); return { dx: p.x - a.x, dy: p.y - a.y, z: p.z, label: window.civilcraft.project.undoStack.at(-1).label }; }, target);
  ok(Math.abs(after.dx) > 0 && after.label === 'Move point CTRL-A' && after.z === target.z + 5, `dragged: moved (${after.dx.toFixed(2)}, ${after.dy.toFixed(2)}), elevation kept, one step "Move point CTRL-A"`);
  // Esc cancels a drag
  const g2 = await E(page, () => { const c = window.civilcraft, p = c.project.points.find((q) => q.n === 'CTRL-A'); return { ...c.toScreen(p.x, p.y), x: p.x, y: p.y, n: c.project.undoStack.length }; });
  await page.mouse.move(g2.x, g2.y);
  await page.mouse.down();
  await page.mouse.move(g2.x + 50, g2.y + 50, { steps: 6 });
  await page.keyboard.press('Escape');
  await page.mouse.up();
  ok(await E(page, (a) => { const p = window.civilcraft.project.points.find((q) => q.n === 'CTRL-A'); return p.x === a.x && p.y === a.y && window.civilcraft.project.undoStack.length === a.n; }, g2), 'Esc during a drag puts the point back, no undo step');
  // undo everything back
  for (let i = 0; i < 4; i++) await page.keyboard.press('Control+z');
  ok(await E(page, (a) => { const p = window.civilcraft.project.points.find((q) => q.n === a.n); return p && p.x === a.x && p.y === a.y && p.z === a.z; }, target), 'four Ctrl+Z: point ' + target.n + ' is back as it was');
  await page.keyboard.press('Control+y');
  ok(await E(page, (a) => window.civilcraft.project.points.find((q) => q.n === a.n)?.z === a.z + 5, target), 'Ctrl+Y redoes the elevation');
  await page.goto(BASE + '/lab/civilcraft?space=model', { waitUntil: 'networkidle' });
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const t2 = await E(page, () => { const c = window.civilcraft, p = c.project.points[20]; return c.toScreen(p.x, p.y); });
  await page.mouse.click(t2.x, t2.y);
  await page.waitForSelector('[data-point-edit]');
  await shot(page, '05-point-editor-model');
  ok(true, 'model theme: the point editor shows');

  // ------------------------------------------------------------------ V13
  console.log('\n== V13: sample lines and sections');
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  // an alignment across the site by clicks: A, two clicks, Enter
  const ends = await E(page, () => { const c = window.civilcraft, b = c.project.eg().surface.bounds, y = (b.minY + b.maxY) / 2; return [c.toScreen(b.minX + (b.maxX - b.minX) * 0.15, y), c.toScreen(b.maxX - (b.maxX - b.minX) * 0.15, y)]; });
  await page.locator('[data-over]').focus();
  await page.keyboard.press('a');
  await page.mouse.click(ends[0].x, ends[0].y);
  await page.mouse.click(ends[1].x, ends[1].y);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1);
  await page.keyboard.press('v');
  await E(page, () => { const c = window.civilcraft; c.select({ kind: 'alignment', id: c.project.state.alignments[0].id }); });
  await page.click('[data-start-profile]');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].pvis.length === 2);
  // raise the design 3 ft above the ground at both ends so there is fill
  await E(page, () => { const p = window.civilcraft.project; p.change('raise', (s) => { for (const v of s.alignments[0].pvis) v.z += 3; }); });
  await page.check('#cv-co-on');
  await page.waitForFunction(() => window.civilcraft.project.graded().surface);
  await page.click('[data-sec-add]');
  await page.waitForSelector('[data-sections-panel]:not([hidden])');
  ok(await page.$eval('[data-profile-panel]', (e) => e.hidden), 'the section view opens (the profile view stays closed: one bottom panel)');
  const info = await E(page, () => { const c = window.civilcraft, a = c.project.state.alignments[0], set = c.project.sections(a); return { n: set.sections.length, step: a.sampling.step, opts: document.querySelectorAll('[data-sec-sta] option').length, fill: set.totals.fill, read: document.querySelector('[data-sec-read]').textContent }; });
  ok(info.n > 3 && info.opts === info.n && info.step === 50, `Add sample lines: every 50 ft → ${info.n} sections, all in the station list`);
  ok(info.fill > 0 && /^Cut .*, fill .* \(end areas\)$/.test(info.read), 'the readout shows end-area volumes (' + info.read + ')');
  ok(await E(page, () => window.civilcraft.view && document.querySelector('[data-sec-facts]')?.textContent.includes('grid method')), 'Properties: sections, end-area volumes and the grid-method volumes side by side');
  await page.click('[data-sec-next]'); await page.click('[data-sec-next]');
  ok(await E(page, () => window.civilcraft.sections.current().index === 2), 'Next twice → the third section');
  await page.locator('[data-sec]').focus(); await page.keyboard.press('ArrowRight');
  ok(await E(page, () => window.civilcraft.sections.current().index === 3), '→ on the section view steps on');
  await page.keyboard.press('End');
  ok(await E(page, (n) => window.civilcraft.sections.current().index === n - 1, info.n), 'End → the last section');
  await page.keyboard.press('Home');
  await page.selectOption('[data-sec-sta]', String(Math.floor(info.n / 2)));
  const cur = await E(page, () => { const c = window.civilcraft.sections.current(); return { i: c.index, fill: c.section.fill, cut: c.section.cut, marks: c.section.marks.map((m) => m.code) }; });
  ok(cur.i === Math.floor(info.n / 2) && cur.marks.includes('CL') && cur.marks.includes('DL_L'), 'the station list jumps there; corridor points marked (' + cur.marks.join(' ') + ')');
  await page.selectOption('[data-sec-ve]', '1');
  ok(await E(page, () => Math.abs(window.civilcraft.sections.view.ve - 1) < 1e-9), 'exaggeration 1× drawn at 1×');
  await page.selectOption('[data-sec-ve]', '0');
  await shot(page, '06-sections-paper');
  const csvFile = await (async () => { const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-sec-csv]')]); const f = path.join(OUT, 'sections.csv'); await dl.saveAs(f); return f; })();
  const csv = fs.readFileSync(csvFile, 'utf8').replace(/^\ufeff/, '').split('\r\n');
  ok(csv[0].startsWith('Station,Cut area (sq ft)') && csv.length === info.n + 2, 'CSV: header + one row per section (' + (csv.length - 2) + ')');
  // 0.4 V17: cross-section sheets from the sample lines' Properties
  await page.click('[data-xs-open]');
  await page.waitForSelector('dialog[data-xs-dialog][open]');
  const xsInfo = await page.textContent('[data-xs-info]');
  const xsPages = Number((xsInfo.match(/(\d+) pages?\./) || [])[1] || (/: 1 page\./.test(xsInfo) ? 1 : 0));
  ok(new RegExp('^' + info.n + ' sections, \\d+ on a page').test(xsInfo) && xsPages >= 1, 'V17 section sheets dialog: ' + xsInfo);
  const [xsd] = await Promise.all([page.waitForEvent('download'), page.click('[data-xs-go]')]);
  const xsFile = path.join(OUT, xsd.suggestedFilename()); await xsd.saveAs(xsFile);
  ok(/sections\.pdf$/.test(xsFile) && new RegExp('Pages:\\s+' + xsPages + '\\b').test(execFileSync('pdfinfo', [xsFile], { encoding: 'utf8' })), 'V17: ' + path.basename(xsFile) + ', ' + xsPages + ' page(s) (pdfinfo)');
  execFileSync('pdftoppm', ['-r', '40', '-f', '1', '-l', '1', '-png', '-singlefile', xsFile, path.join(OUT, '20-section-sheet')]);
  // spacing change → more sections, one undo step
  const steps = await E(page, () => window.civilcraft.project.undoStack.length);
  await page.fill('#cv-sec-step', '25'); await page.press('#cv-sec-step', 'Enter');
  await page.waitForFunction((n) => window.civilcraft.project.sections(window.civilcraft.project.state.alignments[0]).sections.length > n, info.n);
  ok(await E(page, () => window.civilcraft.project.undoStack.length) === steps + 1, 'Every 25: more sections, one undo step');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Control+z');
  ok(await E(page, () => window.civilcraft.project.state.alignments[0].sampling.step === 50), 'Ctrl+Z puts the spacing back');
  ok(await page.getAttribute('details[data-group-menu="Surface"] [data-cmd="sections"]', 'aria-checked') === 'true', 'Surface › More › Sections is checked while the view is open');
  await page.keyboard.press('x');
  ok(await page.$eval('[data-sections-panel]', (e) => e.hidden), 'X hides the section view');
  await page.click('details[data-group-menu="Surface"] > summary');
  await page.click('details[data-group-menu="Surface"] [data-cmd="sections"]');
  ok(!(await page.$eval('[data-sections-panel]', (e) => e.hidden)), 'Surface › More › Sections shows it');
  await page.keyboard.press('x');
  await page.keyboard.press('x');
  ok(!(await page.$eval('[data-sections-panel]', (e) => e.hidden)), 'X shows it again');
  ok(await E(page, () => { const t = document.querySelector('main > [role="toolbar"]'); return new Set([...t.querySelectorAll(':scope > [role="group"]')].map((g) => Math.round(g.getBoundingClientRect().top))).size === 1; }), 'toolbar still on one row with Sections');
  await E(page, () => { document.documentElement.dataset.space = 'model'; window.civilcraft.sections.render(); });
  const bg = await E(page, () => { const c = document.querySelector('[data-sec]'), x = c.getContext('2d').getImageData(4, 4, 1, 1).data; return x[0] + x[1] + x[2]; });
  ok(bg < 200, 'model theme: the section view redraws dark (corner ' + bg + ')');
  await shot(page, '07-sections-model');

  // ------------------------------------------------------------------ V14
  console.log('\n== V14: feature lines');
  await E(page, () => { document.documentElement.dataset.space = 'paper'; });
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const spot = (fx, fy) => E(page, ([a, b]) => { const c = window.civilcraft, bb = c.project.eg().surface.bounds; const x = bb.minX + (bb.maxX - bb.minX) * a, y = bb.minY + (bb.maxY - bb.minY) * b; return { ...c.toScreen(x, y), wx: x, wy: y }; }, [fx, fy]);
  // an open line by clicks: L, three vertices off the survey points, Enter
  await page.locator('[data-over]').focus();
  await page.keyboard.press('l');
  ok(await page.$eval('[data-toolhint]', (e) => !e.hidden && /Feature line/.test(e.textContent)), 'L: the Feature line tool and its hint');
  const v1 = await spot(0.21, 0.33), v2 = await spot(0.43, 0.37), v3 = await spot(0.66, 0.31);
  for (const v of [v1, v2, v3]) await page.mouse.click(v.x, v.y);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => (window.civilcraft.project.state.features || []).length === 1);
  const f1 = await E(page, () => { const c = window.civilcraft, f = c.project.state.features[0], sf = c.project.eg().surface; return { id: f.id, n: f.pts.length, worst: Math.max(...f.pts.map((p) => Math.abs(p.z - (sf.elevationAt(p.x, p.y) ?? p.z)))), use: f.use, sel: c.sel?.kind }; });
  ok(f1.n === 3 && f1.worst < 1e-6 && f1.use === 'eg' && f1.sel === 'feature', 'three vertices at the ground’s elevations, a breakline of the existing ground, selected');
  ok(await E(page, (id) => window.civilcraft.project.egBreaklines().some((b) => b.feature === id), f1.id), 'it is one of the surface’s breaklines');
  await page.waitForSelector('[data-fl-table]');
  // grade on segment 1 → vertex 2 moves
  const z1 = await E(page, () => window.civilcraft.project.state.features[0].pts[0].z);
  const gIn = page.locator('[data-fl-table] tbody tr:first-child td:nth-child(4) input');
  await gIn.fill('-2'); await gIn.press('Enter');
  await page.waitForFunction((z) => { const f = window.civilcraft.project.state.features[0]; const L = Math.hypot(f.pts[1].x - f.pts[0].x, f.pts[1].y - f.pts[0].y); return Math.abs(f.pts[1].z - (z - 0.02 * L)) < 1e-9; }, z1);
  ok(true, 'typed −2 % on segment 1: vertex 2 drops 2 % of the segment length');
  await page.locator('[data-over]').focus();
  // stepped offset: 10 right, down 0.5
  await page.fill('#cv-fl-odist', '10'); await page.fill('#cv-fl-oamt', '-0.5');
  await page.click('[data-fl-offset-go]');
  await page.waitForFunction(() => window.civilcraft.project.state.features.length === 2);
  const off = await E(page, () => { const [a, b] = window.civilcraft.project.state.features; return { dz: b.pts.map((p, i) => p.z - a.pts[i].z), d0: Math.hypot(b.pts[0].x - a.pts[0].x, b.pts[0].y - a.pts[0].y), sel: window.civilcraft.sel.id === b.id }; });
  ok(off.dz.every((v) => Math.abs(v + 0.5) < 1e-9) && Math.abs(off.d0 - 10) < 1e-6 && off.sel, 'stepped offset: a new line 10 ft away, 0.5 ft lower, selected');
  await shot(page, '08-feature-lines');
  // drag a vertex of the selected (offset) line by its grip
  const gv = await E(page, () => { const c = window.civilcraft, f = c.project.state.features[1]; return { ...c.toScreen(f.pts[1].x, f.pts[1].y), wx: f.pts[1].x, z: f.pts[1].z }; });
  await page.mouse.move(gv.x, gv.y); await page.mouse.down(); await page.mouse.move(gv.x + 30, gv.y, { steps: 5 }); await page.mouse.up();
  const gd = await E(page, (g) => { const p = window.civilcraft.project.state.features[1].pts[1]; return { dx: p.x - g.wx, dz: p.z - g.z, label: window.civilcraft.project.undoStack.at(-1).label, sel: window.civilcraft.sel }; }, gv);
  ok(gd.dx > 0 && gd.dz === 0 && gd.label === 'Move feature line vertex', 'a vertex dragged by its grip: moved in plan, elevation kept, one step (' + JSON.stringify(gd) + ')');
  // a closed line graded into the design, with daylight
  await page.keyboard.press('Escape');
  await page.keyboard.press('l');
  const c1 = await spot(0.35, 0.6), c2 = await spot(0.55, 0.6), c3 = await spot(0.55, 0.75), c4 = await spot(0.35, 0.75);
  for (const v of [c1, c2, c3, c4, c1]) await page.mouse.click(v.x, v.y);
  await page.waitForFunction(() => window.civilcraft.project.state.features.length === 3 && window.civilcraft.project.state.features[2].closed);
  ok(true, 'clicking the first vertex again closes the line and finishes it');
  await page.selectOption('#cv-fl-use', 'design');
  await page.waitForFunction(() => window.civilcraft.project.graded().items.some((x) => x.kind === 'feature'));
  await page.locator('#cv-fl-raise').fill('3'); await page.locator('#cv-fl-raise').press('Enter');
  await page.check('#cv-fl-day');
  await page.waitForFunction(() => window.civilcraft.project.graded().items.find((x) => x.kind === 'feature')?.rays?.length > 0);
  const vol = await E(page, () => window.civilcraft.project.volumes());
  ok(vol && vol.fill > 0, 'graded into the design, raised 3 ft, daylighted: fill ' + Math.round(vol?.fill) + ' cu ft');
  await shot(page, '09-feature-design');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Delete');
  ok(await E(page, () => window.civilcraft.project.state.features.length === 2), 'Delete removes the selected feature line');
  await page.keyboard.press('Control+z');
  ok(await E(page, () => window.civilcraft.project.state.features.length === 3), 'Ctrl+Z brings it back');

  // ------------------------------------------------------------------ V15
  console.log('\n== V15: plan and profile sheets');
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const pe = await E(page, () => { const c = window.civilcraft, b = c.project.eg().surface.bounds, y = (b.minY + b.maxY) / 2; return [c.toScreen(b.minX + 15, y), c.toScreen((b.minX + b.maxX) / 2, y + 30), c.toScreen(b.maxX - 15, y)]; });
  await page.locator('[data-over]').focus(); await page.keyboard.press('a');
  for (const q of pe) await page.mouse.click(q.x, q.y);
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1);
  await page.keyboard.press('v');
  await E(page, () => { const c = window.civilcraft; c.select({ kind: 'alignment', id: c.project.state.alignments[0].id }); });
  await page.click('[data-start-profile]');
  await page.click('[data-pp-open]');
  await page.waitForSelector('dialog[data-pp-dialog][open]');
  ok(await page.$eval('[data-pp-scale]', (s) => s.value) === '1" = 40\'' && await page.$eval('[data-pp-paper]', (s) => s.value) === 'tabloid', 'the dialog starts at Tabloid, 1" = 40\'');
  await page.selectOption('[data-pp-scale]', '1" = 10\'');
  const infoTxt = await page.textContent('[data-pp-info]');
  const n10 = await E(page, () => { const c = window.civilcraft, a = c.project.state.alignments[0], al = c.project.alignment(a); return Math.ceil((al.end - al.start) / 140 - 1e-9); });
  ok(new RegExp('^' + n10 + ' sheets?, 140 ft').test(infoTxt), 'at 1" = 10\' the count follows (140 ft a sheet): ' + infoTxt);
  await page.fill('[data-pp-to]', '0+00');
  ok(await page.$eval('[data-pp-go]', (b) => b.disabled) && await page.getAttribute('[data-pp-to]', 'aria-invalid') === 'true', 'an end before the start: Download is off, the box marked');
  await page.fill('[data-pp-to]', await E(page, () => { const c = window.civilcraft, a = c.project.state.alignments[0]; return String(c.project.alignment(a).end.toFixed(2)); }));
  await shot(page, '10-pp-dialog');
  const [ppDl] = await Promise.all([page.waitForEvent('download'), page.click('[data-pp-go]')]);
  const ppFile = path.join(OUT, ppDl.suggestedFilename()); await ppDl.saveAs(ppFile);
  ok(/plan and profile\.pdf$/.test(ppFile), 'downloaded ' + path.basename(ppFile));
  const pinfo = execFileSync('pdfinfo', [ppFile], { encoding: 'utf8' });
  ok(new RegExp('Pages:\\s+' + n10 + '\\b').test(pinfo), 'poppler: ' + n10 + ' pages');
  const ptxt = execFileSync('pdftotext', [ppFile, '-'], { encoding: 'utf8' });
  ok(ptxt.includes('Sheet 1 of ' + n10) && /Match line sta/.test(ptxt), 'its text: sheet numbers and match lines');
  ok(await E(page, () => window.civilcraft.sheets.last?.sheets) === n10 && /Saved \d+ plan and profile sheets/.test(await page.textContent('[data-status]')), 'the status line says what was saved');
  execFileSync('pdftoppm', ['-r', '60', '-f', '1', '-l', '1', '-png', ppFile, path.join(OUT, '11-pp-sheet')]);

  // ------------------------------------------------------------------ V16
  console.log('\n== V16: description keys and line codes');
  const csvRows = ['Point,Northing,Easting,Elevation,Description'];
  let pn = 1;
  for (let x = -20; x <= 120; x += 20) for (let y = -40; y <= 40; y += 20) csvRows.push([pn++, 500000 + y, 2000000 + x, 100, 'GRD'].join(','));
  for (const [x, c] of [[0, 'TC B'], [10, 'TC'], [30, 'TC E'], [70, 'TC B'], [90, 'TC'], [100, 'TC E']]) csvRows.push([100 + x, 500000.5, 2000000 + x, 101, c].join(','));
  [[10, 20, 'BLDG B'], [40, 20, 'BLDG'], [40, 35, 'BLDG'], [10, 35, 'BLDG C']].forEach(([x, y, c], i) => csvRows.push([401 + i, 500000 + y, 2000000 + x, 100, c].join(',')));   // corners in point-number order
  const codedCsv = path.join(OUT, 'coded-points.csv'); fs.writeFileSync(codedCsv, csvRows.join('\n') + '\n');
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', codedCsv);
  await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 50);
  ok(await E(page, () => window.civilcraft.view && window.civilcraft.project.figures().some((f) => f.code === 'BLDG' && f.closed && f.pts.length === 4)), 'BLDG B … BLDG C: a closed building outline of 4 corners');
  await page.click('[data-codes-open]');
  await page.waitForSelector('dialog[data-codes-dialog][open]');
  ok(/0 keys, 3 lines from line codes/.test(await page.textContent('[data-codes-summary]')), 'the dialog: 0 keys, 3 lines from line codes (2 curb runs + the building)');
  await page.click('[data-codes-add]');
  const row1 = page.locator('[data-codes-rows] tr').first();
  await row1.locator('input').nth(0).fill('t*');
  await row1.locator('input').nth(1).fill('curb');
  await row1.locator('select').selectOption('breakline');
  await row1.locator('input').nth(2).fill('Top of curb');
  ok((await row1.locator('[data-codes-n]').textContent()) === '6', 'typing T* shows the 6 points it catches');
  await shot(page, '12-codes-dialog');
  const steps16 = await E(page, () => window.civilcraft.project.undoStack.length);
  await page.click('[data-codes-go]');
  await page.waitForFunction(() => window.civilcraft.project.state.surface.groups.CURB === 'breakline');
  const g16 = await E(page, () => { const p = window.civilcraft.project; return { groups: Object.keys(p.state.surface.groups).sort().join(), bl: p.egBreaklines().filter((b) => b.fromGroup).length, steps: p.undoStack.length, rows: [...document.querySelectorAll('[data-groups] tbody tr td:first-child')].map((td) => td.textContent).join() }; });
  ok(g16.groups === 'BLDG,CURB,GRD' && g16.rows === 'BLDG,CURB,GRD' && g16.bl === 2 && g16.steps === steps16 + 1, 'applied in one step: groups BLDG, CURB (breakline), GRD; two curb breaklines, not joined across the gap');
  ok(await E(page, () => Math.abs(window.civilcraft.project.eg().surface.elevationAt(2000020, 500000.5) - 101) < 1e-6), 'the surface follows the curb at 101');
  await page.locator('[data-over]').focus();
  const pt16 = await E(page, () => { const c = window.civilcraft, p = c.project.points.find((q) => q.d === 'TC B'); return c.toScreen(p.x, p.y); });
  await page.mouse.click(pt16.x, pt16.y);
  await page.waitForSelector('[data-point-edit]');
  ok(/Top of curb/.test(await page.textContent('[data-props]')) && /CURB/.test(await page.textContent('[data-props]')), 'a TC point’s Properties: group CURB, description key "Top of curb"');
  await shot(page, '13-codes-plan');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Control+z');
  ok(await E(page, () => !window.civilcraft.project.state.surface.descKeys.length && 'TC' in window.civilcraft.project.state.surface.groups), 'Ctrl+Z: the keys are gone, TC is a group again');
  // a bad code is left out and said
  await page.click('[data-codes-open]');
  await page.click('[data-codes-add]');
  await page.locator('[data-codes-rows] tr').first().locator('input').nth(0).fill('<bad>');
  await page.click('[data-codes-go]');
  ok(/cannot read was left out|Nothing changed/.test(await page.textContent('[data-status]')), 'a key with a code CivilCraft cannot read: left out, said');

  // ------------------------------------------------------------------ V3
  console.log('\n== V3: map layers draped on the surface in 3D');
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const sb = await E(page, () => window.civilcraft.project.eg().surface.bounds);
  // a picture over the whole surface: west half magenta, east half green; 1 px = 1/200 of the width
  const PW = 200, PH = Math.round(200 * (sb.maxY - sb.minY) / (sb.maxX - sb.minX)), px = (sb.maxX - sb.minX) / PW;
  fs.writeFileSync(path.join(OUT, 'drape.png'), png(PW, PH, (x) => (x < PW / 2 ? [230, 0, 230] : [0, 170, 0])));
  fs.writeFileSync(path.join(OUT, 'drape.pgw'), [px, 0, 0, -px, sb.minX + px / 2, sb.maxY - px / 2].join('\n') + '\n');
  await page.click('[data-cmd="basemap"]');
  await page.waitForSelector('[data-map-dialog]');
  await page.setInputFiles('[data-map-file]', [path.join(OUT, 'drape.png'), path.join(OUT, 'drape.pgw')]);
  await page.waitForSelector('.cv-ask'); await page.click('.cv-ask button[data-key="same"]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.maps.some((m) => m.kind === 'image'));
  await page.keyboard.press('Escape');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('d');
  await page.waitForFunction(() => window.civilcraft.view3d && !document.querySelector('[data-view3d]').hidden);
  ok(await page.$$eval('[data-3d-color] option', (o) => o.map((x) => x.value).join()) === 'bands,single,map', 'the 3D colour list has Map layers');
  await page.selectOption('[data-3d-color]', 'map');
  await page.waitForFunction(() => window.civilcraft.view3d.drape.texture && window.civilcraft.view3d.scene.meshes.some((m) => m.uvs), null, { timeout: 15000 });
  await page.selectOption('[data-3d-view]', 'top'); await wait(400);
  // the most saturated pixel of a 15 × 15 patch (contour lines cross the picture)
  const shotPx = async (fx, fy) => E(page, ([a, b]) => { const c = document.querySelector('[data-view3d] canvas'), t = document.createElement('canvas'); t.width = c.width; t.height = c.height; const x = t.getContext('2d'); x.drawImage(c, 0, 0); const d = x.getImageData(Math.round(c.width * a) - 7, Math.round(c.height * b) - 7, 15, 15).data; let best = [0, 0, 0], sat = -1; for (let i = 0; i < d.length; i += 4) { const s = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]); if (s > sat) { sat = s; best = [d[i], d[i + 1], d[i + 2]]; } } return best; }, [fx, fy]);
  const west = await shotPx(0.35, 0.5), east = await shotPx(0.65, 0.5);
  ok(west[0] > west[1] + 40 && west[2] > west[1] + 40, `top view: the west half shows the magenta picture (${west})`);
  ok(east[1] > east[0] + 30 && east[1] > east[2] + 30, `and the east half the green (${east})`);
  await shot(page, '14-drape-3d');
  await page.selectOption('[data-3d-view]', 'iso'); await wait(300);
  await shot(page, '15-drape-iso');
  await page.selectOption('[data-3d-color]', 'bands');
  await page.waitForFunction(() => !window.civilcraft.view3d.scene.meshes.some((m) => m.uvs));
  ok(true, 'back to elevation bands: no picture on the surfaces');
  // ------------------------------------------------------------------ V8 (the map is still on)
  console.log('\n== V8: map layers in the PDF and the DWG');
  await page.keyboard.press('d');
  await page.click('[data-cmd="pdf"]');
  await page.waitForSelector('[data-plot][open]');
  ok(await page.isVisible('[data-plot-map]') && await page.isChecked('[data-plot-map]'), 'the plot dialog offers the map layers (ticked)');
  const [mpd] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-plot-go]')]);
  const mapPdf = path.join(OUT, 'map-plot.pdf'); await mpd.saveAs(mapPdf);
  const imgs = execFileSync('pdfimages', ['-list', mapPdf], { encoding: 'utf8' }).split('\n').filter((l) => /\bimage\b.*jpeg/.test(l));
  ok(imgs.length === 1, 'the PDF holds one JPEG picture of the map: ' + (imgs[0] || '').trim().replace(/\s+/g, ' '));
  execFileSync('pdftoppm', ['-r', '40', '-png', '-singlefile', mapPdf, path.join(OUT, '19-map-plot')]);
  ok(/under the linework/.test(await page.textContent('[data-status]')), 'said: the map layers are under the linework');
  await page.click('[data-cmd="dwg"]');
  await page.waitForSelector('[data-dwg][open]');
  ok(await page.isVisible('[data-dwg-map]'), 'the DWG dialog offers the map as a picture beside the drawing');
  const [ddl] = await Promise.all([page.waitForEvent('download', { timeout: 30000 }), page.click('[data-dwg-go]')]);
  const dwgZip = path.join(OUT, ddl.suggestedFilename()); await ddl.saveAs(dwgZip);
  const zl = execFileSync('unzip', ['-l', dwgZip], { encoding: 'utf8' });
  ok(/-dwg\.zip$/.test(dwgZip) && /\.dwg\n/.test(zl) && /-map\.png\n/.test(zl) && /-map\.pgw\n/.test(zl), 'a .zip with the DWG, the PNG and its world file');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('d');
  await page.waitForFunction(() => !document.querySelector('[data-view3d]').hidden);

  await E(page, () => { const p = window.civilcraft.project; p.change('hide map', (s) => { s.gis.maps.forEach((m) => { m.visible = false; }); }); });
  await page.selectOption('[data-3d-color]', 'map'); await wait(300);
  ok(/No map layer to drape/.test(await page.textContent('[data-view3d]')), 'Map layers with every map hidden: said, bands shown');

  console.log('\n== V4: GIS layers in 3D');
  await E(page, async () => {
    const GL = await import('/assets/apps/civilcraft/dev/gis-layers.js');   // the app's own module (the import map maps it)
    const p = window.civilcraft.project, b = p.eg().surface.bounds, cy = (b.minY + b.maxY) / 2;
    GL.addLayers(p, [{ name: 'Road centre', geom: 'ln', hasZ: false, fields: [], features: [{ g: { t: 'ln', c: [[[b.minX + 10, cy], [b.maxX - 10, cy]]] }, p: {} }] }]);
  });
  await page.waitForFunction(() => window.civilcraft.view3d.scene.lines.some((l) => l.name === 'Road centre'));
  const g3 = await E(page, () => { const l = window.civilcraft.view3d.scene.lines.find((x) => x.name === 'Road centre'); return { n: l.positions.length / 6, key: l.key }; });
  ok(g3.n > 20 && /^gis-g\d+$/.test(g3.key), `a GIS line in 3D, draped on the ground in ${g3.n} pieces`);
  await page.click('[data-3d-show-menu] > summary');
  ok(await page.isVisible('[data-3d-show="gis"]') && /GIS layers/.test(await page.textContent('[data-3d-show-menu]')), 'Show › GIS layers');
  await page.uncheck('[data-3d-show="gis"]');
  await page.waitForFunction(() => !window.civilcraft.view3d.scene.lines.some((l) => l.key.startsWith('gis-')));
  ok(true, 'unticked: the GIS line goes');
  await page.check('[data-3d-show="gis"]');
  await page.keyboard.press('Escape');
  await shot(page, '16-gis-3d');

  console.log('\n== V5: picking in 3D, with a highlight');
  await E(page, () => { const c = window.civilcraft, p = c.project, b = p.eg().surface.bounds, w = b.maxX - b.minX, h = b.maxY - b.minY, cy = (b.minY + b.maxY) / 2, cx = (b.minX + b.maxX) / 2, z = p.eg().surface.elevationAt(cx, cy);
    p.change('a1', (s) => { s.alignments.push({ id: 'a91', name: 'Pick me', start: 0, pis: [{ x: b.minX + 0.15 * w, y: cy + 0.3 * h, r: 0 }, { x: b.maxX - 0.15 * w, y: cy + 0.3 * h, r: 0 }], pvis: [], corridor: null, sampling: null });
      s.surface.breaklines.push({ name: 'Breakline 1', pts: [{ x: cx - 0.3 * w, y: cy - 0.35 * h, z }, { x: cx + 0.3 * w, y: cy - 0.35 * h, z }] }); }); });
  await page.selectOption('[data-3d-view]', 'top'); await wait(300);
  const scr = (x, y) => E(page, ([x, y]) => { const v = window.civilcraft.view3d, sc = v.scene, sf = window.civilcraft.project.eg().surface, z = sf.elevationAt(x, y) ?? sc.origin.z, q = v.cam.project([x - sc.origin.x, y - sc.origin.y, (z - sc.origin.z) * sc.exag]), r = document.querySelector('[data-view3d] canvas').getBoundingClientRect(); return { x: r.left + q[0], y: r.top + q[1] }; }, [x, y]);
  const bb5 = await E(page, () => window.civilcraft.project.eg().surface.bounds), cx5 = (bb5.minX + bb5.maxX) / 2, cy5 = (bb5.minY + bb5.maxY) / 2, h5 = bb5.maxY - bb5.minY, w5 = bb5.maxX - bb5.minX;
  let q5 = await scr(cx5 + 0.1 * w5, cy5 + 0.3 * h5);
  await page.mouse.click(q5.x + 2, q5.y + 1);
  await page.waitForFunction(() => window.civilcraft.sel?.kind === 'alignment' && window.civilcraft.sel.id === 'a91');
  ok(/Alignment/.test(await page.textContent('[data-props-h]')), 'a click on the alignment in 3D selects it: Properties shows it');
  ok(await E(page, () => window.civilcraft.view3d.highlighted > 0), 'and it is highlighted in 3D (' + await E(page, () => window.civilcraft.view3d.highlighted) + ' pieces)');
  await shot(page, '17-pick-3d');
  q5 = await scr(cx5 + 0.1 * w5, cy5 - 0.35 * h5);
  await page.mouse.click(q5.x + 1, q5.y + 2);
  await wait(300);
  ok(/Breakline Breakline 1/.test(await page.textContent('[data-status]')) && await E(page, () => window.civilcraft.sel?.id === 'a91' && window.civilcraft.view3d.highlighted > 0), 'a click on a drawn breakline names it and highlights it (the plan selection stays)');
  await E(page, () => { window.civilcraft.select(null); });
  await wait(200);
  ok(await E(page, () => window.civilcraft.view3d.highlighted === 0), 'selecting nothing on the plan clears the highlight');
  await page.keyboard.press('d');

  // ------------------------------------------------------------------ V6
  console.log('\n== V6: KML and KMZ in and out');
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await E(page, async () => { await window.civilcraft.gisLoad(); const CRS = await import('/assets/apps/civilcraft/dev/crs.js'); const p = window.civilcraft.project; p.change('crs', (s) => { s.crs = CRS.crsFromEntry(CRS.byCode(2277)); }); });
  // a KML over the sample site: one line and one point in lon/lat (from the site's own corners)
  const ll = await E(page, async () => { const CRS = await import('/assets/apps/civilcraft/dev/crs.js'); const p = window.civilcraft.project, b = p.eg().surface.bounds, f = CRS.transformer(p.state.crs, null); return [f(b.minX + 20, b.minY + 20), f(b.maxX - 20, b.maxY - 20)]; });
  const kmlText = `<?xml version="1.0"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Site sketch</name><Folder><name>Sketch</name>
<Placemark><name>Fence</name><LineString><coordinates>${ll[0][0]},${ll[0][1]} ${ll[1][0]},${ll[1][1]}</coordinates></LineString></Placemark>
<Placemark><name>Gate</name><ExtendedData><Data name="Width"><value>12</value></Data></ExtendedData><Point><coordinates>${ll[0][0]},${ll[0][1]}</coordinates></Point></Placemark>
</Folder></Document></kml>`;
  fs.writeFileSync(path.join(OUT, 'sketch.kml'), kmlText);
  await page.setInputFiles('[data-file]', path.join(OUT, 'sketch.kml'));
  await page.waitForSelector('dialog[open] [data-gisv-go]');
  ok(/Sketch \(lines\)/.test(await page.textContent('dialog[open]')) && /Sketch \(points\)/.test(await page.textContent('dialog[open]')), 'the import dialog lists Sketch (lines) and Sketch (points) from the KML');
  await page.click('dialog[open] [data-gisv-go]');
  await page.waitForFunction(() => window.civilcraft.project.state.gis.layers.length === 2);
  const fence = await E(page, () => { const p = window.civilcraft.project, l = p.state.gis.layers.find((x) => /lines/.test(x.name)), f = p.gisFeatures.get(l.id)[0], b = p.eg().surface.bounds; return { x0: f.g.c[0][0][0] - (b.minX + 20), y0: f.g.c[0][0][1] - (b.minY + 20) }; });
  ok(Math.abs(fence.x0) < 0.01 && Math.abs(fence.y0) < 0.01, `the fence lands where it was drawn (${fence.x0.toFixed(4)}, ${fence.y0.toFixed(4)} ft off)`);
  await page.click('[data-cmd="gis-export"]');
  await page.waitForSelector('dialog[open] [data-gisv-kinds]');
  ok(await page.$$eval('dialog[open] [data-gisv-fmts] input', (i) => i.map((x) => x.value).join()) === 'shp,gpkg,geojson,kml,kmz', 'GIS › Export offers KML and KMZ');
  await page.check('dialog[open] [data-gisv-fmts] input[value="kmz"]');
  ok((await page.textContent('dialog[open] [data-gisv-xgo]')).trim() === 'Download KMZ', 'the button says Download KMZ');
  const [kdl] = await Promise.all([page.waitForEvent('download'), page.click('dialog[open] [data-gisv-xgo]')]);
  const kmzFile = path.join(OUT, kdl.suggestedFilename()); await kdl.saveAs(kmzFile);
  const listing = execFileSync('unzip', ['-l', kmzFile], { encoding: 'utf8' });
  ok(/\.kmz$/.test(kmzFile) && /doc\.kml/.test(listing), 'downloaded ' + path.basename(kmzFile) + ' with doc.kml inside');
  await page.keyboard.press('Escape');

  console.log('\n== V7: labels from attributes');
  const lineId = await E(page, () => window.civilcraft.project.state.gis.layers.find((x) => /lines/.test(x.name)).id);
  await page.click(`[data-gis-layer="${lineId}"] details.cv-gis-menu > summary`);
  ok(await page.isVisible(`[data-gis-label="${lineId}"]`), 'the layer menu has Label with');
  await page.selectOption(`[data-gis-label="${lineId}"]`, 'name');
  await page.waitForFunction((id) => window.civilcraft.project.state.gis.layers.find((x) => x.id === id).label?.field === 'name', lineId);
  ok(/labeled with name/.test(await page.textContent('[data-status]')), 'said: labeled with name');
  const labels = await E(page, async (id) => { const GL = await import('/assets/apps/civilcraft/dev/gis-layers.js'); return GL.gisScene(window.civilcraft.project, 1).items.filter((it) => it.kind === 'text' && it.layer === 'GIS-' + id).map((it) => it.text); }, lineId);
  ok(labels.join() === 'Fence', 'the plan labels the fence with its name');
  await page.keyboard.press('Escape');
  await shot(page, '18-labels');
  await page.click('[data-cmd="pdf"]');
  await page.waitForSelector('[data-plot][open]');
  const [pdl] = await Promise.all([page.waitForEvent('download'), page.click('[data-plot-go]')]);
  const pdfF = path.join(OUT, 'labels.pdf'); await pdl.saveAs(pdfF);
  ok(/Fence/.test(execFileSync('pdftotext', ['-raw', pdfF, '-'], { encoding: 'utf8' })), 'and the PDF plot has the label, turned along the fence (pdftotext -raw)');

  // ------------------------------------------------------------------ V9
  console.log('\n== V9: replacing the surface can be undone');
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const [lx] = await Promise.all([page.waitForEvent('download'), page.click('[data-cmd="landxml"]')]);
  const lxFile = path.join(OUT, 'site.xml'); await lx.saveAs(lxFile);
  await page.click('[data-cmd="new"]');
  const askNew = await page.$('dialog.cv-ask[open]'); if (askNew) await page.click('dialog.cv-ask[open] button[data-key="discard"], dialog.cv-ask[open] button:has-text("Don")').catch(() => {});
  await page.waitForFunction(() => window.civilcraft.project.points.length === 0);
  await page.setInputFiles('[data-file]', lxFile);
  await page.waitForFunction(() => window.civilcraft.project.state.surface.tin);
  const nTin = await E(page, () => window.civilcraft.project.eg().surface.nT);
  await page.click('button:has-text("Rebuild the surface from the points")');
  await page.waitForFunction(() => !window.civilcraft.project.state.surface.tin);
  ok(/Ctrl\+Z brings the file/.test(await page.textContent('[data-status]')), 'Rebuild the surface from the points: said it can be undone');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => !!window.civilcraft.project.state.surface.tin);
  ok(await E(page, () => window.civilcraft.project.eg().surface.nT) === nTin, 'Ctrl+Z: the LandXML surface is back (' + nTin + ' triangles)');
  await page.keyboard.press('Control+y');
  ok(await E(page, () => !window.civilcraft.project.state.surface.tin), 'Ctrl+Y: built from the points again');

  // ------------------------------------------------------------------ V18
  console.log('\n== V18: superelevation');
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await E(page, () => { const c = window.civilcraft, p = c.project, b = p.eg().surface.bounds, cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2, w = b.maxX - b.minX;
    p.change('road', (s) => s.alignments.push({ id: 'a7', name: 'Curvy', start: 0, pis: [{ x: b.minX + 10, y: cy - 30, r: 0 }, { x: cx, y: cy + 30, r: 300 }, { x: b.maxX - 10, y: cy - 30, r: 0 }], pvis: [], corridor: { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10 }, sampling: null }));
    const a = p.state.alignments[0], al = p.alignment(a), e0 = p.egProfile(a).filter((q) => q.z !== null);
    p.change('profile', (s) => { s.alignments[0].pvis = [{ sta: e0[0].sta, z: e0[0].z + 2, L: 0 }, { sta: e0.at(-1).sta, z: e0.at(-1).z + 2, L: 0 }]; });
    c.select({ kind: 'alignment', id: 'a7' }); });
  await page.waitForSelector('#cv-se-on');
  await page.check('#cv-se-on');
  await page.waitForSelector('[data-se-curves]');
  const se = await E(page, () => { const it = window.civilcraft.project.graded().items.find((x) => x.kind === 'corridor'); return { curves: it.super?.curves.length, e: it.super?.curves[0]?.e, rows: document.querySelectorAll('[data-se-curves] tbody tr').length, diag: !!document.querySelector('[data-se-diagram]') }; });
  ok(se.curves === 1 && se.rows === 1 && se.e === 0.06 && se.diag, 'Superelevate the curves: one curve at 6 % (radius 300), its row and the diagram');
  const diagInk = await E(page, () => { const c = document.querySelector('[data-se-diagram]'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 16) if (d[i] > 150 && d[i + 1] < 90) n++; return n; });
  ok(diagInk > 20, 'the diagram draws the lanes (' + diagInk + ' red pixels sampled)');
  const steps18 = await E(page, () => window.civilcraft.project.undoStack.length);
  await page.fill('#cv-se-delta', '0.8'); await page.press('#cv-se-delta', 'Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].corridor.super.delta === 0.008);
  ok(await E(page, () => window.civilcraft.project.undoStack.length) === steps18 + 1, 'Δ 0.8 %: one undo step, runoff shorter');
  await shot(page, '21-superelevation');
  const tilt = await E(page, () => { const p = window.civilcraft.project, it = p.graded().items.find((x) => x.kind === 'corridor'), c = it.super.curves[0], mid = (c.pc + c.pt) / 2, sec = it.sections.reduce((a, b) => (Math.abs(b.sta - mid) < Math.abs(a.sta - mid) ? b : a)); return { L: sec.L[1].z - sec.L[0].z, R: sec.R[1].z - sec.R[0].z, out: c.outside }; });
  ok((tilt.out === 'R' ? tilt.R > 0 && tilt.L < 0 : tilt.L > 0 && tilt.R < 0), `mid curve: the outside edge is up, the inside down (L ${tilt.L.toFixed(3)}, R ${tilt.R.toFixed(3)})`);
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Control+z');
  ok(await E(page, () => window.civilcraft.project.state.alignments[0].corridor.super.delta === 0.005), 'Ctrl+Z: Δ back to 0.5 %');

  // ------------------------------------------------------------------ V19 + V20
  console.log('\n== V19/V20: catchments, flows, pipe sizes, grade lines');
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const atF = (fx, fy) => E(page, ([a, b]) => { const c = window.civilcraft, bb = c.project.eg().surface.bounds; return c.toScreen(bb.minX + (bb.maxX - bb.minX) * a, bb.minY + (bb.maxY - bb.minY) * b); }, [fx, fy]);
  await page.locator('[data-over]').focus();
  await page.keyboard.press('p');
  for (const f of [[0.2, 0.5], [0.5, 0.5], [0.8, 0.5]]) { const q = await atF(...f); await page.mouse.click(q.x, q.y); }
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.network?.pipes.length === 2);
  const drawC = async (box) => {
    await page.click('[data-dr-draw]');
    for (const f of box) { const q = await atF(...f); await page.mouse.click(q.x, q.y); }
    await page.keyboard.press('Enter');
  };
  await drawC([[0.05, 0.3], [0.35, 0.3], [0.35, 0.7], [0.05, 0.7]]);
  await page.waitForFunction(() => (window.civilcraft.project.state.network.catchments || []).length === 1);
  const dc1 = await E(page, () => { const n = window.civilcraft.project.state.network; return { to: n.structures.find((s) => s.id === n.catchments[0].to)?.name, props: !!document.querySelector('[data-dr-catchment]') }; });
    ok(dc1.to === 'S1' && dc1.props, 'Draw a catchment by clicks: it drains to S1 (inside it), its Properties open');
  await page.fill('#cv-dr-c', '0.9'); await page.press('#cv-dr-c', 'Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.network.catchments[0].C === 0.9);
  ok(true, 'C 0.9 typed in Properties');
  await drawC([[0.36, 0.3], [0.65, 0.3], [0.65, 0.7], [0.36, 0.7]]);
  await page.waitForFunction(() => window.civilcraft.project.state.network.catchments.length === 2);
  await E(page, () => window.civilcraft.select(null));
  await page.waitForSelector('[data-dr-results]');
  const res = await E(page, () => ({ rows: document.querySelectorAll('[data-dr-results] tbody tr').length, q: [...document.querySelectorAll('[data-dr-results] tbody tr')].map((r) => Number(r.cells[1].textContent.replace(/,/g, ''))) }));
  ok(res.rows === 2 && res.q[1] > res.q[0] && res.q[0] > 0, `flows summed downstream: P1 ${res.q[0]} < P2 ${res.q[1]} cfs`);
  // a heavy storm, then size the pipes
  await page.fill('#cv-dr-idf-a', '2000'); await page.press('#cv-dr-idf-a', 'Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.network.hydro?.idf.a === 2000);
  const steps19 = await E(page, () => window.civilcraft.project.undoStack.length);
  await page.click('[data-dr-size]');
  const sized = await E(page, () => ({ n: window.civilcraft.project.undoStack.length, dia: window.civilcraft.project.state.network.pipes.map((p) => p.dia) }));
  ok(sized.n === steps19 + 1 && sized.dia.some((d) => d > 12), 'Size the pipes: one undo step, sizes ' + sized.dia.join('", ') + '"');
  // water at the outlet two feet over the last rim: the HGL reaches the surface upstream
  const rim = await E(page, () => { const c = window.civilcraft, n = c.project.state.network, s = n.structures[2]; return c.project.pipeSurface().elevationAt(s.x, s.y); });
  await page.fill('#cv-dr-tw', String((rim + 2).toFixed(2))); await page.press('#cv-dr-tw', 'Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.network.hydro.tailwater !== null);
  await page.locator('[data-over]').focus();   // Properties rebuild once the typing is over
  await E(page, () => window.civilcraft.select(null));
  await page.waitForFunction(() => /flows full/.test(document.querySelector('[data-dr-problems]')?.textContent || ''));
  const fl = await E(page, () => document.querySelector('[data-dr-problems]').textContent);
  ok(/flows full/.test(fl) && /above the rim/.test(fl), 'outlet water over the rim: pipes full and flooding said');
  await shot(page, '22-drainage');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.civilcraft.project.state.network.hydro.tailwater === null);
  ok(true, 'Ctrl+Z: no water at the outlet again');
  // pick a catchment on the plan and delete it
  const inside = await atF(0.2, 0.62);
  await page.keyboard.press('v');
  await page.mouse.click(inside.x, inside.y);
  await page.waitForSelector('[data-dr-catchment]');
  await page.keyboard.press('Delete');
  await page.waitForFunction(() => window.civilcraft.project.state.network.catchments.length === 1);
  ok(true, 'click inside a catchment selects it; Delete removes it');

  // ------------------------------------------------------------------ V21
  console.log('\n== V21: parcels');
  const atF2 = (fx, fy) => E(page, ([a, b]) => { const c = window.civilcraft, bb = c.project.eg().surface.bounds; return c.toScreen(bb.minX + (bb.maxX - bb.minX) * a, bb.minY + (bb.maxY - bb.minY) * b); }, [fx, fy]);
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const pob = await E(page, () => { const c = window.civilcraft, b = c.project.eg().surface.bounds, mx = (b.minX + b.maxX) / 2, my = (b.minY + b.maxY) / 2;
    return c.project.points.filter((q) => /^\d+$/.test(q.n)).reduce((a, q) => (Math.hypot(q.x - mx, q.y - my) < Math.hypot(a.x - mx, a.y - my) ? q : a)).n; });
  await page.click('[data-pc-calls]');
  await page.waitForSelector('[data-pc-dialog][open]');
  await page.fill('#cv-pc-dlg-pt', pob);
  await page.fill('#cv-pc-dlg-calls', 'N 0°00\'00" E 80.00\nthence N 90°00\'00" E, 60.00 feet;\nS 0 E 80\nS 90 W 59.95');
  await page.waitForFunction(() => /1 : 5,599/.test(document.querySelector('[data-pc-prec]')?.textContent || ''));
  const mis = await E(page, () => document.querySelector('[data-pc-mis]').textContent);
  ok(/0\.050 ft, N 90°00'00" E/.test(mis), 'deed calls read as typed: misclosure 0.050 ft east, precision 279.95 / 0.05 = 1 : 5,599 (' + mis + ')');
  await page.fill('#cv-pc-dlg-calls', 'N 0°00\'00" E 80.00\nN 90 E 60\nS 0 E 80\nS 90 W 60');
  await page.waitForFunction(() => /close/.test(document.querySelector('[data-pc-mis]')?.textContent || ''));
  await page.click('[data-pc-add]');
  await page.waitForSelector('[data-pc-legal]');
  const lg = await E(page, () => ({ n: window.civilcraft.project.state.parcels.length, legal: document.querySelector('[data-pc-legal]').value }));
  ok(lg.n === 1 && lg.legal.startsWith('Parcel 1\n\nBeginning at survey point ' + pob + ';') && /Containing 4,800 square feet \(0\.110 acres\), more or less\.$/.test(lg.legal), 'Add the parcel: its legal description from survey point ' + pob + ', 4,800 sq ft');
  // course 2 (east along the north side) becomes a curve of radius 40 to the left: its centre to the north, so it bows into the parcel
  const st21 = await E(page, () => window.civilcraft.project.undoStack.length);
  await page.selectOption('[data-pc-turn="1"]', '1');
  const rIn = page.locator('[data-pc-courses] tbody tr').nth(1).locator('input');
  await rIn.fill('40'); await rIn.press('Enter');
  await page.waitForFunction(() => window.civilcraft.project.state.parcels[0].pts[1].b > 0);
  await page.locator('[data-over]').focus();
  await E(page, () => window.civilcraft.select({ kind: 'parcel', id: window.civilcraft.project.state.parcels[0].id }));
  const pcur = await E(page, () => ({ n: window.civilcraft.project.undoStack.length, legal: document.querySelector('[data-pc-legal]').value }));
  ok(pcur.n === st21 + 1 && /along a curve to the left, having a radius of 40\.00 feet/.test(pcur.legal), 'radius 40 typed on course 2: one undo step, a curve in the legal description');
  await shot(page, '23-parcel');
  const [pdx] = await Promise.all([page.waitForEvent('download'), page.click('[data-cmd="dxf"]')]);
  const pdxF = path.join(OUT, 'parcels.dxf'); await pdx.saveAs(pdxF);
  const pdxT = fs.readFileSync(pdxF, 'utf8');
  ok(/\n\s*8\r?\nV-PROP\r?\n/.test(pdxT) && /N 0%%d00'00" E {2}80\.00'/.test(pdxT) && /R=40\.00' {2}L=67\.84' {2}Delta=97%%d10'51"/.test(pdxT) && /4,237 sq ft/.test(pdxT), 'the DXF has the parcel on V-PROP and its labels (degrees as %%d)');
  // draw a parcel by clicks, closing on the first corner
  await E(page, () => window.civilcraft.select(null));
  await page.click('[data-pc-draw]');
  const corners = [];
  for (const f of [[0.1, 0.1], [0.3, 0.1], [0.3, 0.3], [0.1, 0.3]]) corners.push(await atF2(...f));
  for (const q of corners) await page.mouse.click(q.x, q.y);
  await page.mouse.click(corners[0].x, corners[0].y);
  await page.waitForFunction(() => window.civilcraft.project.state.parcels.length === 2);
  ok(await E(page, () => window.civilcraft.project.state.parcels[1].pts.length === 4), 'Draw a parcel: four clicks, the first corner again closes it');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Delete');
  await page.waitForFunction(() => window.civilcraft.project.state.parcels.length === 1);
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.civilcraft.project.state.parcels.length === 2);
  ok(true, 'Delete removes it; Ctrl+Z brings it back');

  // ------------------------------------------------------------------ V22
  console.log('\n== V22: traverse');
  await E(page, () => window.civilcraft.select(null));
  await page.locator('[data-over]').focus();
  const np0 = await E(page, () => window.civilcraft.project.points.length);
  const openTv = async () => { await page.click('[data-tv-open]'); await page.waitForSelector('[data-tv-dialog][open]'); await page.fill('#cv-tv-pt', pob); await page.fill('#cv-tv-az', '90'); };
  await openTv();
  await page.fill('#cv-tv-legs', '270°00\'00" 100 T1\n270-00-10 100 T2\n270 00 10 100 T3\n270-00-10 99.96\nclose 270-00-10');
  await page.waitForSelector('[data-tv-prec]');
  const tv = await E(page, () => ({ ang: document.querySelector('[data-tv-ang]').textContent, lin: document.querySelector('[data-tv-lin]').textContent, prec: document.querySelector('[data-tv-prec]').textContent, rows: document.querySelectorAll('[data-tv-table] tbody tr').length }));
  ok(/^\+0°00'40" \(−0°00'10" an angle\)$/.test(tv.ang) && /^0\.040 ft, N 90°00'00" E$/.test(tv.lin) && tv.prec === '1 : 9,999' && tv.rows === 4, `read as typed: angular ${tv.ang}, linear ${tv.lin}, precision ${tv.prec}`);
  const [tvd] = await Promise.all([page.waitForEvent('download'), page.click('[data-tv-csv]')]);
  const tvF = path.join(OUT, 'traverse.csv'); await tvd.saveAs(tvF);
  const tvCsv = fs.readFileSync(tvF, 'utf8');
  ok(tvCsv.startsWith('\ufeffAngular misclosure,"0°00\'40"""') && /\r\nT1,/.test(tvCsv), 'Report (CSV): closure first, then the stations');
  const stTv = await E(page, () => window.civilcraft.project.undoStack.length);
  await page.click('[data-tv-points]');
  await page.waitForFunction((n) => window.civilcraft.project.points.length === n + 3, np0);
  const tvp = await E(page, () => { const c = window.civilcraft, t1 = c.project.points.find((q) => q.n === 'T1'); return { steps: c.project.undoStack.length, d: t1?.d, z: t1?.z }; });
  ok(tvp.steps === stTv + 1 && tvp.d === 'TRAV' && tvp.z === null, 'Add as survey points: T1, T2, T3 (the loop’s last station is its start), one undo step');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Control+z');
  await page.waitForFunction((n) => window.civilcraft.project.points.length === n, np0);
  ok(true, 'Ctrl+Z takes them out');
  await E(page, () => window.civilcraft.select(null));
  const npc = await E(page, () => window.civilcraft.project.state.parcels.length);
  await openTv();
  await page.fill('#cv-tv-legs', '270 100\n270 100\n270 100\n270 100\nclose 270');
  await page.waitForSelector('[data-tv-prec]');
  await page.click('[data-tv-parcel]');
  await page.waitForFunction((n) => window.civilcraft.project.state.parcels.length === n + 1, npc);
  const tpc = await E(page, () => { const p = window.civilcraft.project.state.parcels.at(-1); return { n: p.pts.length, pob: p.pob, legal: document.querySelector('[data-pc-legal]')?.value || '' }; });
  ok(tpc.n === 4 && tpc.pob === 'survey point ' + pob && /Containing 10,000 square feet/.test(tpc.legal), 'Add as a parcel: four corners from survey point ' + pob + ', 10,000 sq ft');
  await shot(page, '24-traverse-parcel');

  // ------------------------------------------------------------------ V23
  console.log('\n== V23: staking report');
  await E(page, () => { const c = window.civilcraft, p = c.project, b = p.eg().surface.bounds, cy = (b.minY + b.maxY) / 2;
    p.change('road', (s) => s.alignments.push({ id: 'a9', name: 'Stake Rd', start: 0, pis: [{ x: b.minX + 10, y: cy, r: 0 }, { x: b.maxX - 10, y: cy, r: 0 }], pvis: [], corridor: { on: true, lane: 12, laneSlope: 0.02, shoulder: 4, shoulderSlope: 0.04, cut: 2, fill: 3, step: 10 }, sampling: null }));
    const a = p.state.alignments.find((x) => x.id === 'a9'), e0 = p.egProfile(a).filter((q) => q.z !== null);
    p.change('profile', (s) => { s.alignments.find((x) => x.id === 'a9').pvis = [{ sta: e0[0].sta, z: e0[0].z + 1, L: 0 }, { sta: e0.at(-1).sta, z: e0.at(-1).z + 1, L: 0 }]; });
    c.select({ kind: 'alignment', id: 'a9' }); });
  await page.click('[data-sk-open]');
  await page.waitForSelector('[data-sk-dialog][open] [data-sk-count]');
  const sk = await E(page, () => ({ offs: document.querySelector('#cv-sk-offs').value, count: document.querySelector('[data-sk-count]').textContent, first: [...document.querySelector('[data-sk-table] tbody tr').cells].map((c) => c.textContent), len: window.civilcraft.project.alignment(window.civilcraft.project.state.alignments.find((x) => x.id === 'a9')).end }));
  const nSta = Math.floor(sk.len / 50 + 1e-9) + 1 + (Math.abs(sk.len / 50 - Math.round(sk.len / 50)) > 1e-6 ? 1 : 0);
  ok(sk.offs === '16.00 L, 12.00 L, 0.00, 12.00 R, 16.00 R' && sk.count === (nSta * 5) + ' stakes.', `offsets from the corridor's edges; ${sk.count} (${nSta} stations × 5)`);
  ok(sk.first[0] === '1' && sk.first[2] === '16.00 L' && /^[CF] \d+\.\d\d$|^0\.00$/.test(sk.first[5]), 'first stake: 1, 16.00 L, ' + sk.first.slice(3).join(' / '));
  await page.fill('#cv-sk-offs', '12 L, CL, 12 R'); await page.fill('#cv-sk-step', '100');
  await page.waitForFunction(() => /^\d+ stakes\.$/.test(document.querySelector('[data-sk-count]').textContent) && document.querySelectorAll('[data-sk-table] tbody tr')[1]?.cells[2].textContent === '0.00');
  const [skc] = await Promise.all([page.waitForEvent('download'), page.click('[data-sk-csv]')]);
  const skF = path.join(OUT, 'staking.csv'); await skc.saveAs(skF);
  const skCsv = fs.readFileSync(skF, 'utf8').split('\r\n');
  ok(skCsv[0] === '\ufeffStake Rd staking report' && skCsv[1].startsWith('Point,Station,Offset (ft)') && /^2,0\+\d\d\.\d\d,0\.00,/.test(skCsv[3]), 'CSV: title, header, stake 2 on the centerline');
  const [skp] = await Promise.all([page.waitForEvent('download'), page.click('[data-sk-pdf]')]);
  const skP = path.join(OUT, 'staking.pdf'); await skp.saveAs(skP);
  const pdfHead = fs.readFileSync(skP).subarray(0, 5).toString('latin1');
  let pdfTxt = '';
  try { pdfTxt = execFileSync('pdftotext', ['-layout', skP, '-'], { encoding: 'utf8' }); } catch {}
  ok(pdfHead === '%PDF-' && (!pdfTxt || /Stake Rd staking report/.test(pdfTxt) && /12\.00 L/.test(pdfTxt)), 'PDF: written' + (pdfTxt ? ', pdftotext reads its title and offsets' : ''));
  await page.selectOption('#cv-sk-src', 'pts');
  await page.fill('#cv-sk-near', '30');
  await page.waitForFunction(() => /^\d+ stakes\.$/.test(document.querySelector('[data-sk-count]')?.textContent || '') && !document.querySelector('[data-sk-grid]').checkVisibility());
  const skPts = await E(page, () => document.querySelector('[data-sk-count]').textContent);
  ok(Number(skPts.split(' ')[0]) > 0, 'survey points within 30 ft: ' + skPts);
  await shot(page, '25-staking');
  await page.keyboard.press('Escape');

  // ------------------------------------------------------------------ V10
  console.log('\n== V10: drive along an alignment, and the sun');
  await E(page, () => window.civilcraft.select(null));
  await page.locator('[data-over]').focus();
  await page.keyboard.press('d');
  await page.waitForFunction(() => window.civilcraft.view3d && !document.querySelector('[data-view3d]').hidden && window.civilcraft.view3d.scene);
  const before = await E(page, () => JSON.stringify(window.civilcraft.view3d.cam.toJSON().eye));
  await page.click('[data-3d-drive]');
  await page.waitForSelector('[data-dv-panel]:not([hidden])');
  await page.selectOption('[data-dv-al]', 'a9');
  const dv0 = await E(page, () => { const v = window.civilcraft.view3d, d = v.drive.drive, p = window.civilcraft.project, a = p.state.alignments.find((x) => x.id === 'a9'), z = p.designProfile(a).elevationAt(d.sta), sc = v.scene;
    return { sta: d.sta, eyeZ: v.cam.eye[2], want: (z + 3.5 - sc.origin.z) * sc.exag, out: document.querySelector('[data-dv-out]').textContent }; });
  near(dv0.eyeZ, dv0.want, 1e-6, `the eye 3.5 ft above the design profile at ${dv0.out}`);
  await page.locator('[data-3d-canvas]').focus();
  await page.keyboard.press(' ');
  await page.waitForTimeout(700);
  await page.keyboard.press(' ');
  const dv1 = await E(page, () => ({ sta: window.civilcraft.view3d.drive.drive.sta, playing: window.civilcraft.view3d.drive.drive.playing }));
  ok(dv1.sta > dv0.sta + 5 && !dv1.playing, `Space plays, Space pauses: moved ${(dv1.sta - dv0.sta).toFixed(1)} ft at 25 mph`);
  await page.keyboard.press('ArrowRight');
  near(await E(page, () => window.civilcraft.view3d.drive.drive.sta), dv1.sta + 10, 1e-6, '→ steps 10 ft on');
  await shot(page, '26-drive');
  await page.keyboard.press('Escape');
  ok(await E(page, (b) => !window.civilcraft.view3d.drive.driving && JSON.stringify(window.civilcraft.view3d.cam.toJSON().eye) === b, before), 'Esc stops: the camera is back where it was');
  // the sun at Boulder, June solstice, 12:00 MDT (UTC−6)
  await page.click('[data-sun-menu] summary');
  await page.fill('[data-sun-lat]', '40'); await page.fill('[data-sun-lon]', '-105.27');
  await page.fill('[data-sun-date]', '2026-06-21'); await page.fill('[data-sun-time]', '13:00');
  await page.selectOption('[data-sun-utc]', '-6');
  await page.check('[data-sun-on]');
  await page.waitForFunction(() => /Sun at azimuth/.test(document.querySelector('[data-sun-out]').textContent));
  const sun = await E(page, () => { const v = window.civilcraft.view3d.view; return { out: document.querySelector('[data-sun-out]').textContent, shadow: v.renderer.shadowMap.enabled && v.sun.castShadow, i: v.sun.intensity }; });
  const alt = Number(/, ([\d.]+)° above/.exec(sun.out)?.[1]);
  ok(alt > 73 && alt < 73.6 && sun.shadow && sun.i > 2, `solar noon in Boulder at the solstice: ${sun.out} (shadows on)`);
  await page.fill('[data-sun-time]', '19:30'); await page.locator('[data-sun-time]').dispatchEvent('change');
  await page.waitForFunction(() => /azimuth 29\d/.test(document.querySelector('[data-sun-out]').textContent));
  await page.waitForTimeout(300);
  await shot(page, '27-sun-evening');
  await page.fill('[data-sun-time]', '23:30'); await page.locator('[data-sun-time]').dispatchEvent('change');
  await page.waitForFunction(() => /below the horizon/.test(document.querySelector('[data-sun-out]').textContent));
  ok(await E(page, () => window.civilcraft.view3d.view.sun.intensity === 0), 'at night: below the horizon, no sunlight');
  await page.uncheck('[data-sun-on]');
  await page.keyboard.press('Escape');

  // ------------------------------------------------------------------ V11
  console.log('\n== V11: grid shift files');
  await E(page, async () => { await window.civilcraft.gisLoad(); const CRS = await import('/assets/apps/civilcraft/dev/crs.js'); const p = window.civilcraft.project; p.change('crs', (s) => { s.crs = CRS.crsFromEntry(CRS.byCode(32039)); }); });
  const llAt = () => E(page, async () => { const CRS = await import('/assets/apps/civilcraft/dev/crs.js'), c = window.civilcraft, b = c.project.eg().surface.bounds; return CRS.frame(c.project.state.crs).toLonLat((b.minX + b.maxX) / 2, (b.minY + b.maxY) / 2); });
  const ll0 = await llAt();
  await page.click('[data-cmd="crs"]');
  await page.waitForSelector('[data-crs-dialog="project"] [data-grid-sec]:not([hidden])');
  ok(/rough one \(for NAD27 about 20 m\)/.test(await page.textContent('[data-grid-status]')) && await page.$('[data-grid-cdn="us_noaa_nadcon5_nad27_nad83_1986_conus.tif"]'), 'NAD27 / Texas Central: the Grid shift file section, NADCON5 offered from cdn.proj.org');
  const stG = await E(page, () => window.civilcraft.project.undoStack.length);
  await page.setInputFiles('[data-grid-sec] input[type=file]', path.join(REPO, 'tools/civilcraft-test/fixtures/grids/us_noaa_nadcon5_nad27_nad83_1986_conus.tif'));
  await page.waitForFunction(() => /^Using us_noaa_nadcon5/.test(document.querySelector('[data-grid-status]')?.textContent || ''));
  const g1 = await E(page, () => ({ steps: window.civilcraft.project.undoStack.length, grid: window.civilcraft.project.state.crs.grid, inside: document.querySelector('[data-grid-inside]')?.dataset.gridInside, now: document.querySelector('.cv-crs-now')?.textContent || '' }));
  ok(g1.steps === stG + 1 && g1.grid === 'us_noaa_nadcon5_nad27_nad83_1986_conus.tif' && /From the grid shift file/.test(g1.now), `Add a grid file: one step, the system now says it shifts by the grid (middle inside the grid: ${g1.inside === '1' ? 'yes' : 'no'})`);
  const ll1 = await llAt();
  const dm = Math.hypot((ll1[0] - ll0[0]) * 111320 * Math.cos(ll1[1] * Math.PI / 180), (ll1[1] - ll0[1]) * 110540);
  ok(dm > 0.5 && dm < 40, `latitude and longitude move ${dm.toFixed(1)} m from the rough shift`);
  await shot(page, '28-grid-shift');
  const saved = await E(page, () => { const j = window.civilcraft.project.toJSON(); return { keys: Object.keys(j.crsGrids || {}), len: (j.crsGrids?.[j.crs.grid] || '').length }; });
  ok(saved.keys.join() === 'us_noaa_nadcon5_nad27_nad83_1986_conus.tif' && saved.len > 180000, 'saved in the project file (' + saved.len + ' base64 characters)');
  await page.click('[data-grid-off]');
  await page.waitForFunction(() => !window.civilcraft.project.state.crs.grid);
  await page.click('[data-crs-dialog] [data-close]');
  await page.locator('[data-over]').focus();
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.civilcraft.project.state.crs.grid === 'us_noaa_nadcon5_nad27_nad83_1986_conus.tif');
  ok(true, 'Stop using the grid, then Ctrl+Z brings it back');

  // ------------------------------------------------------------------ V24
  console.log('\n== V24: mass haul');
  await E(page, () => window.civilcraft.select({ kind: 'alignment', id: 'a9' }));
  if (await page.$('[data-sec-add]')) await page.click('[data-sec-add]');
  await page.waitForSelector('[data-mh-open]');
  await page.click('[data-mh-open]');
  await page.waitForSelector('[data-mh-dialog][open] [data-mh-totals]');
  const mh0 = await E(page, () => { const c = window.civilcraft, p = c.project, set = p.sections(p.state.alignments.find((x) => x.id === 'a9')), cv = document.querySelector('[data-mh-diagram]'), d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data;
    let ink = 0; for (let i = 0; i < d.length; i += 16) if (Math.abs(d[i] - d[i + 1]) > 40 || Math.abs(d[i + 1] - d[i + 2]) > 40) ink++;
    return { totals: document.querySelector('[data-mh-totals]').textContent, cut: set.totals.cut / 27, fill: set.totals.fill / 27, spans: document.querySelectorAll('[data-mh-spans] tbody tr').length, ink }; });
  const cutTxt = Number(/^Cut ([\d,.]+) cu yd/.exec(mh0.totals)?.[1].replace(/,/g, ''));
  ok(Math.abs(cutTxt - mh0.cut) < 0.06 && /\(([\d,.]+) cu yd after shrink or swell\)/.test(mh0.totals) && mh0.ink > 50 && mh0.spans >= 1, `the dialog: ${mh0.totals} ${mh0.spans} stretch(es), the diagram drawn`);
  const adj0 = Number(/\(([\d,.]+) cu yd after/.exec(mh0.totals)[1].replace(/,/g, ''));
  near(adj0, mh0.cut * 0.9, 0.06, 'shrink −10 % to start: cut × 0.90');
  await page.fill('[data-mh-factor]', '5');
  await page.waitForFunction((c) => { const m = /\(([\d,.]+) cu yd after/.exec(document.querySelector('[data-mh-totals]').textContent); return m && Math.abs(Number(m[1].replace(/,/g, '')) - c * 1.05) < 0.06; }, mh0.cut);
  ok(true, 'swell +5 %: cut × 1.05');
  await shot(page, '29-mass-haul');
  const [mhd] = await Promise.all([page.waitForEvent('download'), page.click('[data-mh-csv]')]);
  const mhF = path.join(OUT, 'masshaul.csv'); await mhd.saveAs(mhF);
  const mhCsv = fs.readFileSync(mhF, 'utf8');
  ok(mhCsv.startsWith('\ufeffStation,Mass ordinate (cu yd)') && /Cut to fill factor,1\.05/.test(mhCsv), 'CSV: the ordinates, the stretches, the factor');
  await page.keyboard.press('Escape');

  ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  if (problems.length) console.log('  console: ' + problems.slice(0, 8).join(' | '));
} finally {
  await ctx?.close();
  await browser.close();
  if (!process.argv.includes('--stay-up')) admin('down');
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${path.relative(REPO, OUT)}`);
process.exit(fail ? 1 : 0);
