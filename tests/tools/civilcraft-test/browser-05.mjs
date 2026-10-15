#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-05.mjs — CivilCraft's 0.5 items (session `bim-civil`) in headless Chromium at https://getcadcraft.com/lab/civilcraft,
 * by real clicks, keys and file inputs. Grows one section per finished item. Run as root (admin tag civ05).
 *   node tools/civilcraft-test/browser-05.mjs [--out dir] [--only wl19,…] [--stay-up]
 *
 *   WL.19 survey points from blocks: the ODA DWG fixture (survey-blocks-2018.dwg) opened, the blocks section lists SURVEY_PT /
 *         SPOT / GROUP, ticking SURVEY_PT guesses PT / DESC / ELEV, linework unticked, Add → 11 points (numbers, descriptions,
 *         elevations from the attributes), a point's Properties name its block, one Ctrl+Z takes them away
 *   WL.20 feature lines in the profile view: the sample site, an alignment by clicks, a feature line drawn across it (L) and
 *         one alongside it; the profile shows the crossing (diamond, "<name> <elevation>" = the line's z there) and, with
 *         "Alongside within", the line running beside it; raising the line moves the label at once; a click on the mark
 *         selects the line; the Feature lines toggle hides them
 *   WL.21 the grade and elevation overlay: a feature line drawn, E (and the Display box) turns the overlay on — labels on the
 *         plan's overlay canvas (pixels counted), the status says screen only — and the DXF export is byte for byte the
 *         same with it on or off; E again turns it off
 *   WL.22 labels that face the camera in 3D: the sample site with an alignment, D → the 3D view draws a label mesh (alignment
 *         name, stations, contours), some shown and decluttered; orbiting keeps them upright and readable (pixels in the
 *         label colour at the alignment name's place before and after); Show › Points adds point labels; Show › Labels
 *         off removes them
 *   WL.23 the solver says why: a three-PI alignment by clicks, PI 2's radius typed far too big → the why block (tangent
 *         needed vs there, numbers) and its fix button → the alignment works again, Ctrl+Z brings the error back; a design
 *         minimum radius → the smallest radius that meets it offered and applied; a vertical curve too long → the longest
 *         that fits offered and applied
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
const OUT = arg('--out', path.join(REPO, 'tmp/shots/civilcraft-05'));
const STATE = path.join(REPO, 'tmp/civilcraft-test/state-civ05.json');
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
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', path.join(HERE, 'admin.php'), cmd, 'civ05'], { encoding: 'utf8' }));

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

  if (want('wl19')) {
    console.log('\n== WL.19 survey points from blocks');
    await page.setInputFiles('[data-file]', path.join(HERE, 'fixtures/cad/survey-blocks-2018.dwg'));
    await page.waitForSelector('dialog[data-cad-dialog][open] [data-blk-sec]:not([hidden])', { timeout: 30000 });
    const blocks = await page.$$eval('[data-blk-row]', (r) => r.map((x) => x.dataset.blkRow + ':' + x.children[2].textContent));
    ok(blocks.join() === 'SURVEY_PT:11,SPOT:7,GROUP:1', 'the blocks section lists the top-level references: ' + blocks.join(', '));
    ok((await page.textContent('[data-blk-what]')).trim() === 'No blocks chosen.', 'nothing chosen yet');
    await page.check('[data-blk-pick="SURVEY_PT"]');
    const how = await page.evaluate(() => ['num', 'desc', 'z'].map((k) => document.querySelector('[data-blk-' + k + ']').value));
    ok(how.join() === 'attr:PT,attr:DESC,attr:ELEV', 'ticking SURVEY_PT guesses the number, description and elevation attributes (the blocks sit at Z 0): ' + how.join(', '));
    ok(/^11 survey points from blocks\.$/.test((await page.textContent('[data-blk-what]')).trim()), 'the count: 11 survey points');
    for (const box of await page.$$('dialog[data-cad-dialog] [data-cad-layer] input[type="checkbox"]')) await box.uncheck();
    await shot(page, 'wl19-01-dialog');
    await page.click('dialog[data-cad-dialog] [data-cad-go]');
    await page.waitForFunction(() => window.civilcraft.project.points.length === 11);
    const st = await page.textContent('[data-status]');
    ok(/Added 11 survey points from the blocks/.test(st) && /1 number was taken already/.test(st) && /1 point has no elevation/.test(st), 'the status: added, one number renumbered, one point without an elevation (' + st + ')');
    const pts = await E(page, () => window.civilcraft.project.points.map((p) => ({ n: p.n, d: p.d, z: p.z, blk: p.blk })));
    ok(pts[0].n === '101' && pts[0].d === 'EP' && Math.abs(pts[0].z - 100) < 1e-9 && pts.every((p) => p.blk?.name === 'SURVEY_PT'), 'points numbered from PT, described from DESC, elevations from ELEV, each with its block');
    ok((await E(page, () => window.civilcraft.project.state.gis?.layers?.length || 0)) === 0, 'no linework layers were added (all unticked)');
    const s = await E(page, () => { const c = window.civilcraft, p = c.project.points[1]; c.fitAll?.(); const q = c.toScreen(p.x, p.y); return { n: p.n, x: q.x, y: q.y }; });
    await page.keyboard.press('v');
    await page.mouse.click(s.x, s.y);
    await page.waitForSelector('[data-point-edit] [data-pt-block]');
    ok(/^SURVEY_PT on V-NODE \(handle [0-9A-F]+\)$/.test(await page.textContent('[data-pt-block]')), 'a point\'s Properties: "From block ' + await page.textContent('[data-pt-block]') + '"');
    await shot(page, 'wl19-02-point');
    await page.keyboard.press('Escape');
    await page.locator('[data-over]').focus();
    await page.keyboard.press('Control+z');
    await page.waitForFunction(() => window.civilcraft.project.points.length === 0);
    ok(true, 'one Ctrl+Z takes all eleven away');
  }

  if (want('wl20')) {
    console.log('\n== WL.20 feature lines in profile views');
    await openSample(page);
    const spot = (fx, fy) => E(page, ([a, b]) => { const c = window.civilcraft, bb = c.project.eg().surface.bounds; const x = bb.minX + (bb.maxX - bb.minX) * a, y = bb.minY + (bb.maxY - bb.minY) * b; return { ...c.toScreen(x, y), wx: x, wy: y }; }, [fx, fy]);
    // an alignment across the middle (A, two clicks, Enter), its profile started
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
    // a feature line straight across (L, two clicks, Enter) and one alongside, 0.06 of the site north of it
    const f0 = await spot(0.4, 0.3), f1 = await spot(0.4, 0.7);
    await page.locator('[data-over]').focus();
    await page.keyboard.press('l');
    await page.mouse.click(f0.x, f0.y); await page.mouse.click(f1.x, f1.y);
    await page.keyboard.press('Enter');
    const g0 = await spot(0.3, 0.53), g1 = await spot(0.6, 0.53);
    await page.keyboard.press('l');
    await page.mouse.click(g0.x, g0.y); await page.mouse.click(g1.x, g1.y);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => (window.civilcraft.project.state.features || []).length === 2);
    await page.keyboard.press('v');
    await E(page, () => { const c = window.civilcraft; c.select({ kind: 'alignment', id: c.project.state.alignments[0].id }); });
    if (await page.isHidden('[data-profile-panel]')) await page.click('[data-start-profile]').catch(() => {});
    await page.waitForFunction(() => window.civilcraft.pview.data?.features?.length >= 1);
    const fx = await E(page, () => { const c = window.civilcraft, d = c.pview.data, f = c.project.state.features[0], al = c.project.alignment(c.project.state.alignments[0]);
      // the line's elevation where it crosses: z along its one segment, at the crossing's share of it
      const so0 = al.stationOffset(f.pts[0].x, f.pts[0].y), so1 = al.stationOffset(f.pts[1].x, f.pts[1].y), k = so0.off / (so0.off - so1.off);
      return { feats: d.features.map((x) => ({ id: x.id, name: x.name, n: x.crossings.length, runs: x.runs.length })), cross: d.features.find((x) => x.id === f.id)?.crossings[0], want: f.pts[0].z + k * (f.pts[1].z - f.pts[0].z), name: f.name, id: f.id }; });
    ok(fx.feats.length === 1 && fx.feats[0].id === fx.id && fx.feats[0].n === 1, 'the profile shows the line that crosses (one crossing); the one alongside is not shown yet (' + JSON.stringify(fx.feats) + ')');
    ok(fx.cross && Math.abs(fx.cross.z - fx.want) < 1e-6, 'the crossing\'s elevation is the line\'s own there: ' + fx.cross?.z.toFixed(3) + ' (' + fx.want.toFixed(3) + ')');
    await shot(page, 'wl20-01-crossing');
    await page.fill('[data-prof-fl-within]', '60');
    await page.press('[data-prof-fl-within]', 'Enter');
    await page.waitForFunction(() => window.civilcraft.pview.data.features.length === 2);
    const runs = await E(page, () => window.civilcraft.pview.data.features.find((x) => x.id === window.civilcraft.project.state.features[1].id)?.runs.length);
    ok(runs === 1 && (await E(page, () => window.civilcraft.project.state.display.profWithin)) === 60, 'Alongside within 60: the line beside the alignment shows as a run (kept in the display settings)');
    await shot(page, 'wl20-02-alongside');
    // the labels follow edits: raise the crossing line 2 ft
    await E(page, (id) => window.civilcraft.select({ kind: 'feature', id }), fx.id);
    await page.waitForSelector('#cv-fl-raise');
    await page.fill('#cv-fl-raise', '2'); await page.press('#cv-fl-raise', 'Enter');
    await page.waitForFunction((a) => { const f = window.civilcraft.pview.data.features.find((x) => x.id === a.id); return f && Math.abs(f.crossings[0].z - (a.z + 2)) < 1e-6; }, { id: fx.id, z: fx.cross.z });
    ok(true, 'raised 2 ft: the crossing (and its label) is 2 ft higher at once');
    await page.locator('[data-over]').focus();   // the raise box loses focus: it must not raise again
    await wait(200);
    ok(Math.abs((await E(page, (id) => window.civilcraft.pview.data.features.find((x) => x.id === id).crossings[0].z, fx.id)) - (fx.cross.z + 2)) < 1e-6, 'leaving the Raise box after Enter does not raise the line a second time');
    ok(await E(page, () => window.civilcraft.pview.data.featSel === window.civilcraft.sel.id), 'the selected line is drawn in the action colour in the profile');
    // a click on the mark selects the line
    await E(page, () => { const c = window.civilcraft; c.select({ kind: 'alignment', id: c.project.state.alignments[0].id }); });
    const m = await E(page, (id) => { const c = window.civilcraft, x = c.pview.data.features.find((f) => f.id === id).crossings[0]; return c.profToScreen(x.sta, x.z); }, fx.id);
    const barH = await page.$eval('[data-profile-panel] .cv-profile-bar', (b) => b.getBoundingClientRect().height);
    await page.mouse.move(m.x + 40, m.y + 30);   // a pointer over the profile fills the read-out: the bar must not wrap
    ok(Math.abs((await page.$eval('[data-profile-panel] .cv-profile-bar', (b) => b.getBoundingClientRect().height)) - barH) < 1, 'the read-out never wraps the profile bar (the plot stays put under the pointer)');
    const m2 = m;
    await page.mouse.click(m2.x, m2.y);
    await page.waitForFunction((id) => window.civilcraft.sel?.kind === 'feature' && window.civilcraft.sel.id === id, fx.id);
    ok(true, 'a click on the crossing mark selects that feature line');
    await page.click('[data-prof-fl]');
    ok((await E(page, () => window.civilcraft.pview.data.features.length)) === 0 && (await page.getAttribute('[data-prof-fl]', 'aria-pressed')) === 'false', 'the Feature lines toggle hides them');
    await page.click('[data-prof-fl]');
  }

  if (want('wl21')) {
    console.log('\n== WL.21 grade and elevation overlay');
    await openSample(page);
    const spot = (fx, fy) => E(page, ([a, b]) => { const c = window.civilcraft, bb = c.project.eg().surface.bounds; const x = bb.minX + (bb.maxX - bb.minX) * a, y = bb.minY + (bb.maxY - bb.minY) * b; return { ...c.toScreen(x, y), wx: x, wy: y }; }, [fx, fy]);
    await page.locator('[data-over]').focus();
    await page.keyboard.press('l');
    for (const v of [await spot(0.2, 0.35), await spot(0.45, 0.4), await spot(0.7, 0.3)]) await page.mouse.click(v.x, v.y);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => (window.civilcraft.project.state.features || []).length === 1);
    await page.keyboard.press('v'); await page.keyboard.press('Escape');
    await E(page, () => window.civilcraft.select(null));
    /** ink on the plan's overlay canvas (the overlay is transparent where nothing is drawn) */
    const ink = () => E(page, () => { const c = document.querySelector('[data-over]'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 0) n++; return n; });
    await wait(300);
    const before = await ink();
    const dxf = async () => { const [d] = await Promise.all([page.waitForEvent('download'), page.click('[data-cmd="dxf"]')]); return fs.readFileSync(await d.path(), 'utf8'); };
    const dxfOff = await dxf();
    await page.locator('[data-over]').focus();
    await page.keyboard.press('e');
    await page.waitForFunction(() => window.civilcraft.project.state.display.gradeOverlay === true);
    await wait(300);
    const after = await ink();
    ok(after > before + 300, 'E: grades and elevations drawn along the feature line on the overlay (' + before + ' → ' + after + ' inked pixels)');
    ok(/on the screen only/.test(await page.textContent('[data-status]')) && await page.isChecked('[data-show="gradeOverlay"]'), 'the status says screen only; the Display box is ticked');
    await shot(page, 'wl21-01-overlay');
    const dxfOn = await dxf();
    ok(dxfOn === dxfOff, 'the DXF export is the same with the overlay on (' + dxfOn.length + ' bytes): nothing is added to the drawing');
    await page.locator('[data-over]').focus();
    await page.keyboard.press('e');
    await page.waitForFunction(() => window.civilcraft.project.state.display.gradeOverlay === false);
    await wait(300);
    ok(Math.abs((await ink()) - before) < 50 && !(await page.isChecked('[data-show="gradeOverlay"]')), 'E again: the overlay is gone, the box unticked');
    await page.check('[data-show="gradeOverlay"]');
    ok(await E(page, () => window.civilcraft.project.state.display.gradeOverlay === true), 'the Display box turns it on too');
    await page.uncheck('[data-show="gradeOverlay"]');
  }

  if (want('wl22')) {
    console.log('\n== WL.22 labels that face the camera in 3D');
    await openSample(page);
    const spot = (fx, fy) => E(page, ([a, b]) => { const c = window.civilcraft, bb = c.project.eg().surface.bounds; const x = bb.minX + (bb.maxX - bb.minX) * a, y = bb.minY + (bb.maxY - bb.minY) * b; return { ...c.toScreen(x, y) }; }, [fx, fy]);
    const a0 = await spot(0.15, 0.5), a1 = await spot(0.85, 0.5);
    await page.locator('[data-over]').focus();
    await page.keyboard.press('a');
    await page.mouse.click(a0.x, a0.y); await page.mouse.click(a1.x, a1.y);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1);
    await page.keyboard.press('v'); await page.keyboard.press('Escape');
    await page.keyboard.press('d');
    await page.waitForFunction(() => window.civilcraft.view3d?.view?.labels && window.civilcraft.view3d.view.frames > 1, null, { timeout: 30000 });
    await wait(400);
    const st = await E(page, () => { const v = window.civilcraft.view3d.view; return { n: v.data.labels.length, shown: v.labelsShown, kinds: [...new Set(v.data.labels.map((l) => l.kind))].sort() }; });
    ok(st.n > 3 && st.shown > 0 && st.shown <= st.n && st.kinds.includes('alignment') && st.kinds.includes('station') && st.kinds.includes('contour'), '3D: labels for the alignment, its stations and the contours (' + st.shown + ' of ' + st.n + ' drawn, ' + st.kinds.join(', ') + ')');
    /** the label colour's pixels round where the alignment's name stands (the WebGL canvas read back) */
    const nameInk = () => E(page, () => {
      const api = window.civilcraft.view3d, v = api.view, l = v.data.labels.find((x) => x.kind === 'alignment');
      v.draw();
      const s = v.cam.project(l.at), c = v.canvas, g = document.createElement('canvas'); g.width = c.width; g.height = c.height;
      const k = c.width / v.w, cx = g.getContext('2d'); cx.drawImage(c, 0, 0);
      const x0 = Math.round((s[0] - l.w / 2) * k), y0 = Math.round((s[1] - 26) * k), d = cx.getImageData(Math.max(0, x0), Math.max(0, y0), Math.round(l.w * k), Math.round(22 * k)).data;
      const col = l.color.match(/[0-9a-f]{2}/gi).map((h) => parseInt(h, 16));
      let n = 0; for (let i = 0; i < d.length; i += 4) if (Math.abs(d[i] - col[0]) < 40 && Math.abs(d[i + 1] - col[1]) < 40 && Math.abs(d[i + 2] - col[2]) < 40) n++;
      return n;
    });
    const before = await nameInk();
    ok(before > 8, 'the alignment\'s name is drawn where it stands (' + before + ' pixels in its colour)');
    await shot(page, 'wl22-01-labels-iso');
    // orbit: drag across the canvas — the labels turn with the camera and stay upright
    const box = await page.$eval('[data-3d-canvas]', (c) => { const r = c.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await page.mouse.move(box.x, box.y); await page.mouse.down(); await page.mouse.move(box.x + 160, box.y + 30, { steps: 8 }); await page.mouse.up();
    await wait(300);
    const after = await nameInk();
    ok(after > 8, 'after orbiting the name still reads facing the camera (' + after + ' pixels)');
    await shot(page, 'wl22-02-labels-orbit');
    await page.click('[data-3d-show-menu] > summary');
    await page.check('[data-3d-show="points"]');
    await page.waitForFunction(() => window.civilcraft.view3d.view.data.labels.some((l) => l.kind === 'point'));
    ok(true, 'Show › Points: the survey points get labels too');
    await shot(page, 'wl22-03-point-labels');
    await page.uncheck('[data-3d-show="labels"]');
    await page.waitForFunction(() => !window.civilcraft.view3d.view.labels);
    ok(true, 'Show › Labels off: no labels drawn');
    await page.check('[data-3d-show="labels"]');
    await page.uncheck('[data-3d-show="points"]');
    await page.keyboard.press('Escape');
    await page.keyboard.press('d');
  }

  if (want('wl23')) {
    console.log('\n== WL.23 the solver says why');
    await openSample(page);
    const spot = (fx, fy) => E(page, ([a, b]) => { const c = window.civilcraft, bb = c.project.eg().surface.bounds; const x = bb.minX + (bb.maxX - bb.minX) * a, y = bb.minY + (bb.maxY - bb.minY) * b; return { ...c.toScreen(x, y) }; }, [fx, fy]);
    await page.locator('[data-over]').focus();
    await page.keyboard.press('a');
    for (const v of [await spot(0.1, 0.2), await spot(0.5, 0.25), await spot(0.6, 0.8)]) await page.mouse.click(v.x, v.y);
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.civilcraft.project.state.alignments.length === 1);
    await page.keyboard.press('v');
    await E(page, () => { const c = window.civilcraft; c.select({ kind: 'alignment', id: c.project.state.alignments[0].id }); });
    const rIn = page.locator('[aria-label="Radius at PI 2"], [aria-label="R at PI 2"]').first();
    const rLabel = await E(page, () => [...document.querySelectorAll('.cv-table input')].map((i) => i.getAttribute('aria-label')).find((l) => /2/.test(l || '') && /adius|R /.test(l || '')));
    const rBox = rLabel ? page.locator('[aria-label="' + rLabel + '"]') : rIn;
    await rBox.fill('5000'); await rBox.press('Enter');
    await page.locator('[data-over]').focus();   // Properties redraw once the box is left
    await page.waitForSelector('[data-why-block] [data-why="overlap"]');
    const txt = await page.textContent('[data-why-block]');
    ok(/The curve at PI 2 needs [\d.]+ ft of tangent towards PI [13], but the PIs are [\d.]+ ft apart\./.test(txt), 'R 5000 at PI 2: the why block says how much tangent the curve needs and how much there is');
    ok((await page.$$('[data-why-block] [data-why-fix]')).length === 1, 'the same fix is offered once, not once per tangent');
    await shot(page, 'wl23-01-why');
    const fixBtn = page.locator('[data-why-block] [data-why-fix]').first();
    const fixText = await fixBtn.textContent();
    await fixBtn.click();
    await page.waitForFunction(() => { const c = window.civilcraft, a = c.project.state.alignments[0]; return c.project.alignment(a).ok; });
    const r2 = await E(page, () => window.civilcraft.project.state.alignments[0].pis[1].r);
    ok(/largest that fits/.test(fixText) && r2 < 5000 && r2 > 0 && !(await page.$('[data-why-block]')), 'its button (' + fixText.trim() + ') sets R ' + r2 + ': the alignment builds again, the block is gone');
    await page.locator('[data-over]').focus();
    await page.keyboard.press('Control+z');
    await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].pis[1].r === 5000);
    ok(true, 'Ctrl+Z: back to R 5000 (the fix was one step)');
    await page.keyboard.press('Control+z');
    await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].pis[1].r !== 5000);
    // a design minimum radius above the radius drawn
    const r0 = await E(page, () => window.civilcraft.project.state.alignments[0].pis[1].r);
    const maxFit = await E(page, () => import(document.querySelector('script[type=importmap]') ? new URL('solve-why.js', [...document.scripts].find((s) => /civilcraft\.js/.test(s.src))?.src || location.href).href : '').then((W) => W.maxRadius(window.civilcraft.project.state.alignments[0].pis, 1)).catch(() => null));
    const minWant = Math.round(Math.min(r0 * 1.5, (maxFit || r0 * 1.5) * 0.9));
    await page.fill('#cv-al-minr', String(minWant)); await page.press('#cv-al-minr', 'Enter');
    await page.locator('[data-over]').focus();
    await page.waitForSelector('[data-why-block] [data-why="min"]');
    ok(/is under the design minimum of/.test(await page.textContent('[data-why-block]')), 'a design minimum of ' + minWant + ' over R ' + r0 + ': said');
    await page.click('[data-why-block] [data-why="min"] [data-why-fix]');
    await page.waitForFunction((m) => Math.abs(window.civilcraft.project.state.alignments[0].pis[1].r - m) < 0.011, minWant);
    ok(!(await page.$('[data-why-block]')), 'its button sets the smallest radius that meets it (' + minWant + '); nothing left to say');
    await shot(page, 'wl23-02-min');
    // a vertical curve too long for its PVIs
    await page.click('[data-start-profile]');
    await page.waitForFunction(() => window.civilcraft.project.state.alignments[0].pvis.length === 2);
    await E(page, () => { const c = window.civilcraft, p = c.project; p.change('mid PVI', (st) => { const a = st.alignments[0], v = a.pvis; const mid = (v[0].sta + v[1].sta) / 2; v.splice(1, 0, { sta: mid, z: (v[0].z + v[1].z) / 2 + 3, L: (v[1].sta - v[0].sta) * 3 }); }); c.select({ kind: 'alignment', id: p.state.alignments[0].id }); });
    await page.waitForSelector('[data-vwhy-block] [data-why="vc"]');
    ok(/runs (back into|past)/.test(await page.textContent('[data-vwhy-block]')), 'a vertical curve three times too long: the profile says why');
    await page.click('[data-vwhy-block] [data-why-fix]');
    await page.waitForFunction(() => { const c = window.civilcraft, a = c.project.state.alignments[0]; return c.project.designProfile(a).ok; });
    ok(!(await page.$('[data-vwhy-block]')), 'the longest that fits applied: the profile builds');
    await shot(page, 'wl23-03-vertical');
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
