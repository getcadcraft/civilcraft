#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-06.mjs — CivilCraft's 0.6 items (session `civil`) in headless Chromium at https://getcadcraft.com/lab/civilcraft,
 * by real clicks, keys and file inputs. Grows one section per finished item. Run as root (admin tag civ06).
 *   node tools/civilcraft-test/browser-06.mjs [--out dir] [--only wl24,…] [--stay-up]
 *
 *   WL.24 3D arcs: the sample site, a feature line drawn with L by clicks with C (arcs on) — a point on the curve, then its
 *         end — and a straight segment after it; the arc's bulge = the three clicks'; Properties' Arc box of the straight
 *         segment typed "<r> R" → an arc of that radius turning right, one Ctrl+Z → straight again; the 3D length row;
 *         LandXML export holds a PlanFeature with a Curve; the DXF export opened again as linework offers Feature lines →
 *         Add brings the line back with its arc (one undo step, one Ctrl+Z); the 3D view draws the arc in pieces
 *   WL.25 corridor targets: an alignment by clicks, its profile and corridor; Add a target is off (nothing to target); a
 *         feature line drawn 25 ft right of the road; Add a target → right edge of pavement, elevation, to that line; Sets →
 *         Width: between the line's ends the right edge sits on the line, the left edge stays at the lane width, Result
 *         "Reached at n of m sections"; Ctrl+Z → elevation again; remove
 *   WL.27 structure builder: two structures by the Pipes tool; Structure types (none); New → a rectangular type 30" × 42"
 *         with a frame, named, drawn in the dialog as you type; added; a structure takes it (size from the type, Diameter
 *         off); editing the type to 36" moves the structure, Ctrl+Z back; Save as library item downloads the .json; Open a
 *         library item brings the same type back; the plan shot
 *   WL.28 swept paths: a feature line with an arc (L, C); Swept path… → the semitrailer → Drive it; Properties facts; the
 *         slider; Driving → reversing (the trailer axle ends at the line's end); the DXF's C-ROAD-SWPT; Delete + Ctrl+Z;
 *         a click inside selects it
 *   DF.3  typed sums: a feature line's Raise box takes 4+7/16 and 12'6" + 3/4"; "4+" is refused with the character; the
 *         alignment's start station box reads 10+00 as a station
 *   TK.5+ (round 2, takeoff-civil-extra_PART_2): a pad on the sample site; Earthwork › Send to TakeoffCraft downloads
 *         <site>.quantities.json with the project's cut and fill ÷ 27 in CY, the Earthwork block's numbers; the file is kept
 *         in tmp/civilcraft-test/tk5.quantities.json for tools/takeoffcraft-test/browser-typed.mjs
 *   LC.16 S1 (round 2): a storm network shows storm drainage; Type › Sanitary shows the sanitary block instead; 1,000 people
 *         and 50 ac typed at MH-1; the downstream pipe carries 271 gpm (Harmon 3.80, by hand); a 50 % limit lists the 8"
 *         pipes; Size the pipes → 10", within limits; one Ctrl+Z back
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
const OUT = arg('--out', path.join(REPO, 'tmp/shots/civilcraft-06'));
const STATE = path.join(REPO, 'tmp/civilcraft-test/state-civ06.json');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(STATE), { recursive: true });
fs.rmSync(STATE, { force: true });   // the test admin is disabled after every run: always sign in afresh (one login a run)

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const near = (a, b, tol, m) => ok(Number.isFinite(a) && Math.abs(a - b) <= tol, `${m} (${a} vs ${b}, ±${tol})`);
const note = (s) => console.log('  note ' + s);

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd, 'civ06'], { encoding: 'utf8' }));

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
const ONLY = (() => { const i = process.argv.indexOf('--only'); return i > 0 ? new Set(process.argv[i + 1].split(',')) : null; })();
const want = (k) => !ONLY || ONLY.has(k);
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
/** The lab page with the sample site open; a "Recover your work?" offer left by an earlier run is discarded first. */
async function openSample(page) {
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  if (await page.waitForSelector('[data-autosave-dialog][open]', { timeout: 3000 }).catch(() => null)) {
    while (await page.$('[data-autosave-dialog][open] [data-autosave-discard]')) { await page.click('[data-autosave-dialog][open] [data-autosave-discard]').catch(() => {}); await wait(150); }
  }
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]'); await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
}

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

  if (want('wl24')) {
    console.log('\n== WL.24 3D arcs');
    await openSample(page);
    const spot = (fx, fy) => E(page, ([a, b]) => { const c = window.civilcraft, bb = c.project.eg().surface.bounds; const x = bb.minX + (bb.maxX - bb.minX) * a, y = bb.minY + (bb.maxY - bb.minY) * b; return { ...c.toScreen(x, y), wx: x, wy: y }; }, [fx, fy]);
    const p0 = await spot(0.3, 0.3), pm = await spot(0.45, 0.42), p1 = await spot(0.55, 0.3), p2 = await spot(0.75, 0.5);
    await page.locator('[data-over]').focus();
    await page.keyboard.press('l');
    await page.mouse.click(p0.x, p0.y);
    await page.keyboard.press('c');
    ok(/Arcs on/.test(await page.textContent('[data-status]')), 'C in the Feature line tool: arcs on');
    await page.mouse.click(pm.x, pm.y);
    ok(/Point on the curve set/.test(await page.textContent('[data-status]')), 'the next click is a point on the curve');
    await page.mouse.move(p1.x, p1.y);
    await shot(page, 'wl24-01-drawing-arc');
    await page.mouse.click(p1.x, p1.y);
    await page.keyboard.press('c');
    await page.mouse.click(p2.x, p2.y);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => (window.civilcraft.project.state.features || []).length === 1);
    const f = await E(page, () => window.civilcraft.project.state.features[0]);
    // the bulge through the three clicked places (their world points are where the screen points land)
    const ax = pm.wx - p0.wx, ay = pm.wy - p0.wy, bx = p1.wx - pm.wx, by = p1.wy - pm.wy, cr = ax * by - ay * bx;
    const ang = Math.acos(-(ax * bx + ay * by) / (Math.hypot(ax, ay) * Math.hypot(bx, by))), bulge = Math.sign(cr) * Math.tan((2 * (Math.PI - ang)) / 4);
    ok(f.pts.length === 3 && Math.abs(f.pts[0].b - bulge) < 0.02 && !f.pts[1].b, 'three vertices, the first segment an arc through the clicked curve point (bulge ' + f.pts[0].b?.toFixed(4) + ' vs ' + bulge.toFixed(4) + '), the second straight');
    await page.keyboard.press('v');
    await E(page, (id) => window.civilcraft.select({ kind: 'feature', id }), f.id);
    await page.waitForSelector('[data-fl-arc="0"] input');
    ok(/^\d+\.\d\d [LR]$/.test(await page.inputValue('[data-fl-arc="0"] input')), 'Properties: the arc\'s radius and turn in its Arc box (' + await page.inputValue('[data-fl-arc="0"] input') + ')');
    ok(await page.evaluate(() => [...document.querySelectorAll('.cv-props .k')].some((k) => k.textContent === '3D length')), 'Properties: a 3D length row');
    const chord = Math.hypot(f.pts[2].x - f.pts[1].x, f.pts[2].y - f.pts[1].y), R = Math.ceil(chord);   // the vertices as clicked (whole pixels)
    await page.fill('[data-fl-arc="1"] input', R + ' R'); await page.press('[data-fl-arc="1"] input', 'Enter');
    await page.waitForFunction(() => window.civilcraft.project.state.features[0].pts[1].b < 0);
    const b1 = await E(page, () => window.civilcraft.project.state.features[0].pts[1].b);
    near(b1, -Math.tan(2 * Math.asin(chord / (2 * R)) / 4), 1e-9, 'typed ' + R + ' R: segment 2 is an arc of that radius turning right');
    await shot(page, 'wl24-02-properties');
    await page.locator('[data-over]').focus();
    await page.keyboard.press('Control+z');
    await page.waitForFunction(() => !window.civilcraft.project.state.features[0].pts[1].b);
    ok(true, 'one Ctrl+Z: straight again');
    // LandXML out
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-cmd="landxml"]')]);
    const xml = fs.readFileSync(await dl.path(), 'utf8');
    ok(/<PlanFeature name="[^"]+">/.test(xml) && /<Curve rot="(cw|ccw)" crvType="arc"/.test(xml.slice(xml.indexOf('<PlanFeatures'))), 'LandXML: the feature line as a PlanFeature with its Curve');
    // DXF out, then opened as linework: the feature line comes back with its arc
    const [dd] = await Promise.all([page.waitForEvent('download'), page.click('[data-cmd="dxf"]')]);
    const dxfFile = path.join(OUT, 'wl24.dxf');
    fs.copyFileSync(await dd.path(), dxfFile);
    await page.setInputFiles('[data-file]', dxfFile);
    await page.waitForSelector('dialog[data-cad-dialog][open] [data-cad-fl-sec]:not([hidden])', { timeout: 30000 });
    ok(/1 CivilCraft feature line.*1 arc/.test(await page.textContent('[data-cad-fl-label]')), 'the DXF offers its feature line with the arc: ' + await page.textContent('[data-cad-fl-label]'));
    for (const box of await page.$$('dialog[data-cad-dialog] [data-cad-layer] input[type="checkbox"]')) await box.uncheck();
    await shot(page, 'wl24-03-dxf-dialog');
    await page.click('dialog[data-cad-dialog] [data-cad-go]');
    await page.waitForFunction(() => window.civilcraft.project.state.features.length === 2);
    const g = await E(page, () => window.civilcraft.project.state.features);
    ok(g[1].pts.length === 3 && Math.abs(g[1].pts[0].b - g[0].pts[0].b) < 1e-9 && g[1].pts.every((q, i) => Math.abs(q.x - g[0].pts[i].x) < 1e-6 && Math.abs(q.z - g[0].pts[i].z) < 1e-6) && g[1].name === g[0].name, 'Add: the same feature line back from the DXF, arc and elevations');
    await page.locator('[data-over]').focus();
    await page.keyboard.press('Control+z');
    await page.waitForFunction(() => window.civilcraft.project.state.features.length === 1);
    ok(true, 'one Ctrl+Z takes it away again');
    await page.keyboard.press('d');
    await page.waitForFunction(() => window.civilcraft.view3d?.scene?.lines?.some((l) => l.key === 'features'), null, { timeout: 30000 }).catch(() => {});
    const segs = await E(page, () => (window.civilcraft.view3d?.scene?.lines || []).find((l) => l.key === 'features')?.positions.length / 6 || 0);
    ok(segs > 10, 'the 3D view draws the arc in pieces (' + segs + ' segments)');
    await shot(page, 'wl24-04-3d');
    await page.keyboard.press('d');
  }

  if (want('wl25')) {
    console.log('\n== WL.25 corridor targets');
    await openSample(page);
    const spot = (fx, fy) => E(page, ([a, b]) => { const c = window.civilcraft, bb = c.project.eg().surface.bounds; const x = bb.minX + (bb.maxX - bb.minX) * a, y = bb.minY + (bb.maxY - bb.minY) * b; return { ...c.toScreen(x, y), wx: x, wy: y }; }, [fx, fy]);
    const a0 = await spot(0.15, 0.5), a1 = await spot(0.85, 0.5);
    await page.locator('[data-over]').focus();
    await page.keyboard.press('a');
    await page.mouse.click(a0.x, a0.y); await page.mouse.click(a1.x, a1.y);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1);
    await page.keyboard.press('v');
    await E(page, () => { const c = window.civilcraft; c.select({ kind: 'alignment', id: c.project.state.alignments[0].id }); });
    await page.click('[data-start-profile]');
    await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].pvis.length === 2);
    await page.check('#cv-co-on');
    await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].corridor?.on);
    ok(/Draw a feature line/.test(await page.textContent('[data-props]').catch(() => '') || await page.evaluate(() => document.body.textContent)) && await page.isDisabled('[data-tg-add]'), 'with nothing to target: the Add button is off and says why');
    // a feature line on the right of the road (the alignment runs east: right = south), 25 ft out, over the middle half
    const f0 = await spot(0.35, 0.5), f1 = await spot(0.65, 0.5);
    const out = await E(page, () => 25 * window.civilcraft.view.zoom);
    await page.locator('[data-over]').focus();
    await page.keyboard.press('l');
    await page.mouse.click(f0.x, f0.y + out); await page.mouse.click(f1.x, f1.y + out);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => (window.civilcraft.project.state.features || []).length === 1);
    await page.keyboard.press('v');
    await E(page, () => { const c = window.civilcraft; c.select({ kind: 'alignment', id: c.project.state.alignments[0].id }); });
    await page.click('[data-tg-add]');
    await page.waitForSelector('[data-tg-row="0"]');
    const t0 = await E(page, () => window.civilcraft.project.state.alignments[0].corridor.targets);
    ok(t0.length === 1 && t0[0].side === 'R' && t0[0].part === 'eop' && t0[0].what === 'elev' && t0[0].from.kind === 'feature', 'Add a target: right edge of pavement, elevation, to the feature line', t0);
    await page.selectOption('[data-tg-row="0"] [data-tg-what]', 'width');
    await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].corridor.targets[0].what === 'width');
    const r = await E(page, () => { const c = window.civilcraft, a = c.project.state.alignments[0], al = c.project.alignment(a), f = c.project.state.features[0];
      const it = c.project.graded().items.find((x) => x.kind === 'corridor');
      const lineOff = (s) => { const so = al.stationOffset(s.R[1].x, s.R[1].y); return so.off; };
      const so0 = al.stationOffset(f.pts[0].x, f.pts[0].y), so1 = al.stationOffset(f.pts[1].x, f.pts[1].y);
      const inside = it.sections.filter((s) => s.sta > Math.min(so0.sta, so1.sta) + 1e-6 && s.sta < Math.max(so0.sta, so1.sta) - 1e-6);
      return { n: it.sections.length, inside: inside.length, onLine: inside.every((s) => Math.abs(al.stationOffset(s.R[1].x, s.R[1].y).off - (so0.off + (so1.off - so0.off) * (s.sta - so0.sta) / (so1.sta - so0.sta))) < 1e-6),
        leftSame: it.sections.every((s) => Math.abs(al.stationOffset(s.L[1].x, s.L[1].y).off + a.corridor.lane) < 1e-6), found: it.targets[0].found, lane: a.corridor.lane, wide: inside.map(lineOff).slice(0, 2) }; });
    ok(r.inside > 3 && r.onLine, 'width: between the line\'s ends the right edge of pavement is on the line (offsets ' + r.wide.map((x) => x.toFixed(2)).join(', ') + ')');
    ok(r.leftSame, 'the left edge stays at the lane width (' + r.lane + ')');
    ok(new RegExp('Reached at ' + r.found + ' of ' + r.n + ' sections').test(await page.textContent('[data-tg-row="0"] [data-tg-state]')), 'Result: ' + await page.textContent('[data-tg-row="0"] [data-tg-state]'));
    await shot(page, 'wl25-01-target');
    await page.locator('[data-over]').focus();
    await page.keyboard.press('Control+z');
    await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].corridor.targets[0].what === 'elev');
    ok(true, 'Ctrl+Z: back to the elevation target');
    await page.click('[data-tg-remove="0"]');
    await page.waitForFunction(() => !(window.civilcraft.project.state.alignments[0].corridor.targets || []).length);
    ok(true, 'the remove button takes it away');
  }

  if (want('wl27')) {
    console.log('\n== WL.27 structure builder');
    await openSample(page);
    const spot = (fx, fy) => E(page, ([a, b]) => { const c = window.civilcraft, bb = c.project.eg().surface.bounds; const x = bb.minX + (bb.maxX - bb.minX) * a, y = bb.minY + (bb.maxY - bb.minY) * b; return { ...c.toScreen(x, y), wx: x, wy: y }; }, [fx, fy]);
    const s0 = await spot(0.3, 0.4), s1 = await spot(0.6, 0.55);
    await page.locator('[data-over]').focus();
    await page.keyboard.press('p');
    await page.mouse.click(s0.x, s0.y); await page.mouse.click(s1.x, s1.y);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.civilcraft.project.state.network?.structures.length === 2);
    await page.keyboard.press('Escape');
    await E(page, () => window.civilcraft.select(null));
    await page.waitForSelector('[data-st-new]');
    ok(/No structure types yet/.test(await page.textContent('[data-props]')), 'the network shows Structure types (none yet)');
    await page.click('[data-st-new]');
    await page.waitForSelector('dialog[data-st-dialog][open]');
    await page.selectOption('[data-st-shape]', 'rect');
    await page.fill('#cv-st-dlg-w', '30'); await page.fill('#cv-st-dlg-l', '42');
    await page.selectOption('[data-st-fshape]', 'rect');
    await page.fill('#cv-st-dlg-name', 'Curb inlet');
    const words = await page.textContent('[data-st-dlg-words]');
    ok(/30" × 42" rectangular manhole, 5" wall|30" × 42" rectangular inlet/.test(words), 'the dialog says what it is building: ' + words);
    const ink = await E(page, () => { const c = document.querySelector('[data-st-canvas]'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
    ok(ink > 500, 'plan and section drawn as you type (' + ink + ' pixels)');
    await shot(page, 'wl27-01-builder');
    await page.click('[data-st-save]');
    await page.waitForFunction(() => window.civilcraft.project.state.network.types?.length === 1);
    const k = await E(page, () => window.civilcraft.project.state.network.types[0]);
    ok(k.shape === 'rect' && k.w === 30 && k.l === 42 && k.frame?.shape === 'rect' && k.name === 'Curb inlet', 'the type is in the network', k);
    const sid = await E(page, () => window.civilcraft.project.state.network.structures[0].id);
    await E(page, (id) => window.civilcraft.select({ kind: 'structure', id }), sid);
    await page.waitForSelector('[data-st-pick]');
    await page.selectOption('[data-st-pick]', k.id);
    await page.waitForFunction((id) => window.civilcraft.project.state.network.structures[0].type === id, k.id);
    const s = await E(page, () => window.civilcraft.project.state.network.structures[0]);
    ok(s.dia === 30 && await page.isDisabled('#cv-st-dia'), 'a structure takes the type: its size from the type (Diameter box off)');
    // edit the type: the structure follows
    await E(page, () => window.civilcraft.select(null));
    await page.click('[data-st-edit]');
    await page.waitForSelector('dialog[data-st-dialog][open]');
    await page.fill('#cv-st-dlg-w', '36');
    await page.click('[data-st-save]');
    await page.waitForFunction(() => window.civilcraft.project.state.network.structures[0].dia === 36);
    ok(true, 'the type edited to 36": the structure follows');
    await page.locator('[data-over]').focus();
    await page.keyboard.press('Control+z');
    await page.waitForFunction(() => window.civilcraft.project.state.network.structures[0].dia === 30);
    ok(true, 'Ctrl+Z: back to 30"');
    // save as a library item, open it again
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-st-item]')]);
    const itemFile = path.join(OUT, 'wl27.item.json');
    fs.copyFileSync(await dl.path(), itemFile);
    const item = JSON.parse(fs.readFileSync(itemFile, 'utf8'));
    ok(item.format === 'cadcraft-library-item' && item.source_attrs['CC-STRUCT-SHAPE'] === 'rect' && item.body?.type === 'mesh' && dl.suggestedFilename() === 'Curb inlet.item.json', 'Save as library item: ' + dl.suggestedFilename());
    await page.setInputFiles('[data-st-file]', itemFile);
    await page.waitForFunction(() => window.civilcraft.project.state.network.types.length === 2);
    const k2 = await E(page, () => window.civilcraft.project.state.network.types[1]);
    ok(k2.w === 30 && k2.l === 42 && k2.name === 'Curb inlet', 'Open a library item: the same type back');
    await page.waitForSelector('[data-st-types]');
    await shot(page, 'wl27-02-types');
    // the plan draws the rectangle
    const px = await E(page, () => { const c = window.civilcraft, s = c.project.state.network.structures[0]; c.view.fit?.({ minX: s.x - 20, minY: s.y - 20, maxX: s.x + 20, maxY: s.y + 20 }); return c.toScreen(s.x, s.y); });
    await wait(300);
    await shot(page, 'wl27-03-plan');
    ok(px && Number.isFinite(px.x), 'the plan shows the structure (shot wl27-03-plan)');
  }

  if (want('wl28')) {
    console.log('\n== WL.28 vehicle swept paths');
    await openSample(page);
    const spot = (fx, fy) => E(page, ([a, b]) => { const c = window.civilcraft, bb = c.project.eg().surface.bounds; const x = bb.minX + (bb.maxX - bb.minX) * a, y = bb.minY + (bb.maxY - bb.minY) * b; return { ...c.toScreen(x, y), wx: x, wy: y }; }, [fx, fy]);
    // a feature line: straight, then an arc round a corner
    const p0 = await spot(0.2, 0.25), p1 = await spot(0.2, 0.55), pm = await spot(0.3, 0.72), p2 = await spot(0.5, 0.78);
    await page.locator('[data-over]').focus();
    await page.keyboard.press('l');
    await page.mouse.click(p0.x, p0.y); await page.mouse.click(p1.x, p1.y);
    await page.keyboard.press('c');
    await page.mouse.click(pm.x, pm.y); await page.mouse.click(p2.x, p2.y);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => (window.civilcraft.project.state.features || []).length === 1);
    await page.keyboard.press('v');
    const fid = await E(page, () => window.civilcraft.project.state.features[0].id);
    await E(page, (id) => window.civilcraft.select({ kind: 'feature', id }), fid);
    await page.click('[data-sw-new="feature:' + fid + '"]');
    await page.waitForSelector('dialog[data-sw-dialog][open]');
    await page.selectOption('[data-sw-preset]', 'semi');
    ok(await page.isVisible('#cv-sw-dlg-twb0'), 'Start from the semitrailer: its trailer\'s sizes to edit');
    await shot(page, 'wl28-01-vehicle');
    await page.click('[data-sw-go]');
    await page.waitForFunction(() => window.civilcraft.sel?.kind === 'swept');
    const facts = await page.textContent('[data-sw-facts]');
    ok(/Length driven/.test(facts) && /Swept area/.test(facts) && /limit 30/.test(facts), 'Properties: length, steering against the 30° lock, articulation, area');
    const status = await page.textContent('[data-status]');
    ok(/Semitrailer|placeholder|problem|within/.test(status), 'the status says how it went: ' + status);
    // the slider puts the vehicle along the line
    const len = Number(await page.getAttribute('[data-sw-at]', 'max'));
    await page.locator('[data-sw-at]').focus();
    for (let k = 0; k < 12; k++) await page.keyboard.press('PageDown');   // a range moves by keys, as a person would
    await E(page, (v) => { const r = document.querySelector('[data-sw-at]'); if (Number(r.value) > v) { r.value = String(v); r.dispatchEvent(new Event('input', { bubbles: true })); } }, len / 2);
    ok(/^At \d/.test(await page.textContent('[data-sw-at-out]')), 'the slider: ' + await page.textContent('[data-sw-at-out]'));
    await shot(page, 'wl28-02-forward');
    // reversing
    await page.selectOption('[data-sw-props-mode]', 'reverse');
    await page.waitForFunction(() => window.civilcraft.project.state.swept[0].mode === 'reverse');
    const rev = await E(page, () => { const c = window.civilcraft, r = c.project.sweptOf(c.project.state.swept[0]), f = c.project.state.features[0], last = r.sim.frames.at(-1).units.at(-1), end = f.pts.at(-1); return { d: Math.hypot(last.x - end.x, last.y - end.y), n: r.sim.problems.length }; });
    ok(rev.d < 1e-6, 'reversing: the trailer\'s axle ends at the end of the line (' + rev.d.toExponential(1) + ')' + (rev.n ? ', ' + rev.n + ' problem(s) said' : ''));
    await shot(page, 'wl28-03-reverse');
    // the DXF carries it
    const [dd] = await Promise.all([page.waitForEvent('download'), page.click('[data-cmd="dxf"]')]);
    const dxf = fs.readFileSync(await dd.path(), 'utf8');
    ok((dxf.match(/\r\n  8\r\nC-ROAD-SWPT\r\n/g) || []).length >= 5, 'the DXF has the swept path on C-ROAD-SWPT');
    // delete and undo
    await page.locator('[data-over]').focus();
    await page.keyboard.press('Delete');
    await page.waitForFunction(() => !(window.civilcraft.project.state.swept || []).length);
    await page.keyboard.press('Control+z');
    await page.waitForFunction(() => (window.civilcraft.project.state.swept || []).length === 1);
    ok(true, 'Delete takes it away, Ctrl+Z brings it back');
    // a click inside the swept area selects it
    await E(page, () => window.civilcraft.select(null));
    // a place inside the swept area away from survey points and the line itself (those would be picked first)
    const inside = await E(page, () => {
      const c = window.civilcraft, r = c.project.sweptOf(c.project.state.swept[0]), v = c.project.state.swept[0].vehicle, f = c.project.state.features[0];
      const pts = c.project.points.map((p) => c.toScreen(p.x, p.y)), line = f.pts.map((p) => c.toScreen(p.x, p.y));
      for (const fr of r.sim.frames) for (const u of fr.units) {
        const q = c.toScreen(u.x + Math.cos(u.th) * v.wheelbase / 2 + Math.sin(u.th) * v.width / 4, u.y + Math.sin(u.th) * v.wheelbase / 2 - Math.cos(u.th) * v.width / 4);
        const near = pts.some((p) => Math.hypot(p.x - q.x, p.y - q.y) < 14) || line.some((p, i) => i && segD(line[i - 1], p, q) < 14);
        if (!near) return q;
      }
      return null;
      function segD(a, b, p) { const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy, t = L ? Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.y - a.y) * dy) / L)) : 0; return Math.hypot(p.x - a.x - dx * t, p.y - a.y - dy * t); }
    });
    await page.keyboard.press('v');
    await page.mouse.click(inside.x, inside.y);
    await page.waitForFunction(() => window.civilcraft.sel?.kind === 'swept', null, { timeout: 5000 }).catch(() => {});
    ok((await E(page, () => window.civilcraft.sel?.kind)) === 'swept', 'a click inside the swept area (away from points and the line) selects it');
  }

  if (want('df3')) {
    console.log('\n== DF.3 arithmetic where a length is typed');
    await openSample(page);
    const spot = (fx, fy) => E(page, ([a, b]) => { const c = window.civilcraft, bb = c.project.eg().surface.bounds; const x = bb.minX + (bb.maxX - bb.minX) * a, y = bb.minY + (bb.maxY - bb.minY) * b; return { ...c.toScreen(x, y), wx: x, wy: y }; }, [fx, fy]);
    const a0 = await spot(0.2, 0.5), a1 = await spot(0.8, 0.5);
    await page.locator('[data-over]').focus();
    await page.keyboard.press('l');
    await page.mouse.click(a0.x, a0.y); await page.mouse.click(a1.x, a1.y);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => (window.civilcraft.project.state.features || []).length === 1);
    const z0 = await E(page, () => window.civilcraft.project.state.features[0].pts[0].z);
    await page.fill('#cv-fl-raise', '4+7/16'); await page.press('#cv-fl-raise', 'Enter');
    await page.waitForFunction((z) => Math.abs(window.civilcraft.project.state.features[0].pts[0].z - (z + 4.4375)) < 1e-9, z0);
    ok(true, 'Raise "4+7/16": the line rises 4.4375 ft');
    await page.fill('#cv-fl-raise', `12'6" + 3/4"`); await page.press('#cv-fl-raise', 'Enter');
    await page.waitForFunction((z) => Math.abs(window.civilcraft.project.state.features[0].pts[0].z - (z + 4.4375 + 12.5625)) < 1e-9, z0);
    ok(true, `Raise 12'6" + 3/4": 12.5625 ft more`);
    await page.fill('#cv-fl-raise', '4+'); await page.press('#cv-fl-raise', 'Enter');
    ok((await page.getAttribute('#cv-fl-raise', 'aria-invalid')) === 'true' && /ends too soon \(character 3\)/.test(await page.textContent('[data-status]')), 'a sum that ends too soon: the box is marked, the status says where');
    // a station box keeps stations
    const b0 = await spot(0.2, 0.3), b1 = await spot(0.8, 0.3);
    await page.locator('[data-over]').focus();
    await page.keyboard.press('a');
    await page.mouse.click(b0.x, b0.y); await page.mouse.click(b1.x, b1.y);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1);
    await page.keyboard.press('v');
    await E(page, () => { const c = window.civilcraft; c.select({ kind: 'alignment', id: c.project.state.alignments[0].id }); });
    await page.fill('#cv-al-start', '10+00'); await page.press('#cv-al-start', 'Enter');
    await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].start === 1000);
    ok(true, 'the start station box reads 10+00 as station 1000, not a sum');
    await shot(page, 'df3-01');
  }

  if (want('tk5')) {
    console.log('\n== TK.5+ cut and fill to TakeoffCraft (round 2, takeoff-civil-extra_PART_2)');
    await openSample(page);
    // a pad in the middle of the site, 1 ft above the ground there (a set-up step: drawing pads is tested elsewhere)
    await E(page, () => {
      const c = window.civilcraft, b = c.project.eg().surface.bounds, cx = (b.minX + b.maxX) / 2, cy = (b.minY + b.maxY) / 2;
      const z = c.project.eg().surface.elevationAt(cx, cy) + 1;
      c.project.change('pad', (s) => { s.pads.push({ id: 'ptk5', name: 'Pad TK5', pts: [{ x: cx - 40, y: cy - 30 }, { x: cx + 40, y: cy - 30 }, { x: cx + 40, y: cy + 30 }, { x: cx - 40, y: cy + 30 }], z, cut: 2, fill: 2 }); });
      c.select(null);
    });
    await page.waitForSelector('[data-qty-send]');
    const shown = { cut: await page.textContent('[data-vol-cut]'), fill: await page.textContent('[data-vol-fill]') };
    const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-qty-send]')]);
    const keep = path.join(REPO, 'tmp/civilcraft-test/tk5.quantities.json');
    await dl.saveAs(keep);
    const j = JSON.parse(fs.readFileSync(keep, 'utf8'));
    ok(/\.quantities\.json$/.test(dl.suggestedFilename()) && j.format === 'cadcraft-quantities' && j.app === 'CivilCraft' && j.items.length === 2, `Send to TakeoffCraft downloads ${dl.suggestedFilename()} (two quantities)`);
    const v = await E(page, () => { const x = window.civilcraft.project.volumes(); return { cut: x.cut, fill: x.fill }; });
    ok(j.items[0].qty === Math.round(v.cut / 27 * 100) / 100 && j.items[1].qty === Math.round(v.fill / 27 * 100) / 100 && j.items.every((x) => x.unit === 'CY'), `cut ${j.items[0].qty} CY and fill ${j.items[1].qty} CY = the project's volumes ÷ 27`);
    const val = (s) => Number(s.replace(/[^\d.]/g, ''));
    ok(Math.abs(val(shown.cut) - j.items[0].qty) <= 0.05 && Math.abs(val(shown.fill) - j.items[1].qty) <= 0.05, `the same numbers as the Earthwork block (${shown.cut}, ${shown.fill})`);
    ok(/Saved .*\.quantities\.json: cut/.test(await page.textContent('[data-status]')), 'the status line says what was saved');
    await shot(page, 'tk5-01-earthwork');
  }

  if (want('lc16')) {
    console.log('\n== LC.16 S1 sanitary design flows (round 2, takeoff-civil-extra_PART_2)');
    await openSample(page);
    // set-up: a three-manhole run across the site, 8" pipes at 0.5 % (drawing networks is tested elsewhere)
    await E(page, () => {
      const c = window.civilcraft, b = c.project.eg().surface.bounds, y = (b.minY + b.maxY) / 2, x0 = b.minX + (b.maxX - b.minX) * 0.2;
      c.project.change('net', (s) => {
        s.network = { name: 'Sewer', type: 'storm', rules: { minSlope: 0.005, minCover: 2, minDrop: 0.1 },
          structures: [{ id: 's91', name: 'MH-1', x: x0, y, rim: null, sumpDepth: 0, dia: 48 }, { id: 's92', name: 'MH-2', x: x0 + 300, y, rim: null, sumpDepth: 0, dia: 48 }, { id: 's93', name: 'MH-3', x: x0 + 600, y, rim: null, sumpDepth: 0, dia: 48 }],
          pipes: [{ id: 'q91', name: 'P-1', from: 's91', to: 's92', dia: 8, invUp: 90, invDn: 88.5 }, { id: 'q92', name: 'P-2', from: 's92', to: 's93', dia: 8, invUp: 88.4, invDn: 86.9 }] };
      });
      c.select(null);
    });
    await page.waitForSelector('#cv-net-type');
    ok(!!(await page.$('[data-dr-head]')) && !(await page.$('[data-san-head]')), 'a storm network shows storm drainage');
    await page.selectOption('#cv-net-type', 'sanitary');
    await page.waitForSelector('[data-san-head]');
    ok(!(await page.$('[data-dr-head]')) && !!(await page.$('[data-san-none]')), 'Type › Sanitary: the sanitary design block instead, asking for people and area');
    await E(page, () => window.civilcraft.select({ kind: 'structure', id: 's91' }));
    await page.fill('#cv-san-pop', '1000'); await page.press('#cv-san-pop', 'Enter');
    await page.fill('#cv-san-area', '50'); await page.press('#cv-san-area', 'Enter');
    await page.waitForFunction(() => window.civilcraft.project.state.network.structures[0].sew?.area === 50);
    ok(true, 'MH-1: 1,000 people and 50 acres typed (two undo steps)');
    await E(page, () => { document.activeElement?.blur(); window.civilcraft.select({ kind: 'pipe', id: 'q92' }); });   // the panel is not rebuilt under a focused box
    await page.waitForSelector('[data-san-pipe]');
    const pipeText = await page.textContent('[data-san-pipe]');
    // by hand: 1,000 × 100 gpcd × Harmon 3.8 + 50 ac × 200 gpd/ac = 390,000 gpd = 271 gpm (0.603 cfs)
    ok(/1,000 people, 50\.00 ac/.test(pipeText) && /271 gpm \(0\.603 cfs\)/.test(pipeText) && /3\.80/.test(pipeText), 'P-2 carries MH-1\'s 1,000 people: Harmon 3.80, 271 gpm (0.603 cfs) — by hand');
    await E(page, () => { document.activeElement?.blur(); window.civilcraft.select(null); });
    await page.fill('#cv-san-maxfull', '50'); await page.press('#cv-san-maxfull', 'Enter');
    await E(page, () => { document.activeElement?.blur(); window.civilcraft.select(null); });
    await page.waitForSelector('[data-san-problems]');
    ok(/P-1 is 71% full at the peak flow; the limit is 50%/.test(await page.textContent('[data-san-problems]')), 'at a 50 % limit the 8" pipes are listed: "71% full … the limit is 50%"');
    await page.click('[data-san-size]');
    await page.waitForFunction(() => window.civilcraft.project.state.network.pipes.every((p) => p.dia === 10));
    await E(page, () => { document.activeElement?.blur(); window.civilcraft.select(null); });
    ok(!!(await page.$('[data-san-ok]')), 'Size the pipes: both become 10", every pipe within the limits');
    await shot(page, 'lc16-01-sanitary');
    await page.locator('[data-over]').focus();
    await page.keyboard.press('Control+z');
    await page.waitForFunction(() => window.civilcraft.project.state.network.pipes.every((p) => p.dia === 8));
    ok(true, 'one Ctrl+Z puts the 8" pipes back');
  }

  ok(!problems.length, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
  for (const p of ctx?.pages() || []) await p.screenshot({ path: path.join(OUT, 'zz-failure.png') }).catch(() => {});
  if (problems.length) console.log('  console: ' + problems.slice(0, 8).join(' | '));
} finally {
  await ctx?.close();
  await browser.close();
  if (!process.argv.includes('--stay-up')) admin('down');
}
console.log(`\n${pass} passed, ${fail} failed — screenshots in ${path.relative(REPO, OUT)}`);
process.exit(fail ? 1 : 0);
