#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser.mjs — CivilCraft in headless Chromium at https://getcadcraft.com/lab/civilcraft, by real
 * clicks and keys: open the sample points, breakline groups, display modes, draw an alignment, start
 * and edit a design profile (add, drag, curve length), draw and grade a pad, undo/redo, exports
 * (LandXML checked by check.py against the XSD, DXF by ezdxf, DWG by libredwg-web and the readers from
 * setup-dwg-readers.sh, PDF by poppler), save + reopen the
 * project, reopen the exported LandXML, a file with bad rows, the Edit group (real clicks on Copy, Paste and the
 * More menu; Ctrl+A/C/X/V/Shift+V/D, Delete, Esc; Shift+click and Shift+drag selection; renumbering; undo/redo;
 * point rows to and from the system clipboard), Settings › CivilCraft (persisted across a reload, used by paste and
 * point labels, reset), the toolbar on one row at 1440 px, dark theme, phone width. Fails on any console error.
 *
 *   node tools/civilcraft-test/browser.mjs [--out <dir for screenshots>] [--state <storageState.json>] [--stay-up]
 * (--stay-up leaves the test admin enabled so the saved sign-in keeps working between runs; run
 *  `sudo -u www-data php tools/civilcraft-test/admin.php down` when done)
 * Run as root: it calls `sudo -u www-data php tools/civilcraft-test/admin.php up|down` for the test admin
 * civilcrafttest+cadcraft@projectz.xyz (disabled again at the end). The sign-in is saved to --state and
 * reused while it works (the admin login throttle is shared).
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const BASE = 'https://getcadcraft.com';
const arg = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const OUT = arg('--out', path.join(REPO, 'tmp/shots/civilcraft'));
const STATE = arg('--state', path.join(REPO, 'tmp/civilcraft-test/state.json'));
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(STATE), { recursive: true });
const DL = fs.mkdtempSync('/tmp/civilcraft-dl-');

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m); } };
const python = fs.existsSync(path.join(HERE, 'venv/bin/python')) ? path.join(HERE, 'venv/bin/python') : 'python3';
const check = (mode, file) => JSON.parse(execFileSync(python, [path.join(HERE, 'check.py'), mode, file], { encoding: 'utf8' }));

const { chromium } = await import('playwright-core');
const cacheDir = path.join(process.env.HOME || '/root', '.cache/ms-playwright');
const build = fs.readdirSync(cacheDir).filter((d) => /^chromium-\d+$/.test(d)).sort((a, b) => parseInt(b.split('-')[1]) - parseInt(a.split('-')[1]))[0];
const exe = ['chrome-linux64/chrome', 'chrome-linux/chrome'].map((s) => path.join(cacheDir, build, s)).find((p) => fs.existsSync(p));
const adminPhp = path.join(HERE, 'admin.php');
const admin = (cmd) => JSON.parse(execFileSync('sudo', ['-u', 'www-data', 'php', adminPhp, cmd], { encoding: 'utf8' }));

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
async function download(page, action) {
  const [dl] = await Promise.all([page.waitForEvent('download'), action()]);
  const f = path.join(DL, dl.suggestedFilename());
  await dl.saveAs(f);
  return f;
}
async function clickWorld(page, x, y, opts) { const s = await page.evaluate(([x, y]) => window.civilcraft.toScreen(x, y), [x, y]); await page.mouse.click(s.x, s.y, opts); await wait(30); }
const E0 = 6150000, N0 = 2080000;

let ctx;
try {
  ctx = await signedInContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  watch(page);
  console.log('\n== open the lab app');
  const r = await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  ok(r.status() === 200, '/lab/civilcraft answers 200 for staff');
  ok(await page.evaluate(() => !!window.civilcraft), 'the app started (window.civilcraft)');
  ok(await page.evaluate(() => { const t = document.querySelector('main > [role="toolbar"]'); return !!t && t.parentElement.tagName === 'MAIN'; }), 'the toolbar is a role=toolbar child of <main>');
  await page.screenshot({ path: path.join(OUT, '01-empty-paper.png') });

  console.log('\n== screen modes');
  const sm = () => page.evaluate(() => ({ full: !!document.fullscreenElement, auto: document.body.classList.contains('shell-autohide'), tools: document.querySelector('.cv-tools').getBoundingClientRect().bottom, mainH: document.querySelector('body > main').getBoundingClientRect().height, winH: innerHeight, planH: window.civilcraft.view.h }));
  const sm0 = await sm();
  await page.click('[data-fs-cycle]'); await wait(300);
  await page.keyboard.press('Control+Shift+F'); await wait(500);
  const sm1 = await sm();
  ok(sm1.auto && sm1.tools <= 0 && sm1.mainH >= sm1.winH - 2, 'bars hidden: the CivilCraft toolbar slides away and <main> gets the window');
  ok(sm1.planH > sm0.planH, `the plan view grows with it (${Math.round(sm0.planH)} → ${Math.round(sm1.planH)} px)`);
  await page.keyboard.press('Control+Shift+F'); await wait(500);
  const sm2 = await sm();
  ok(!sm2.full && !sm2.auto && Math.abs(sm2.mainH - sm0.mainH) < 2, 'Ctrl+Shift+F again: back to normal');

  console.log('\n== points');
  await page.click('[data-sample]');
  await page.waitForSelector('[data-import][open]');
  ok((await page.textContent('[data-imp-summary]')).includes('276 points read as PNEZD (from the header row)'), 'import dialog: 276 points, PNEZD from the header');
  await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  ok(await page.evaluate(() => document.activeElement === document.querySelector('[data-over]')), 'after the dialog, focus is back on the plan');
  ok(await page.evaluate(() => window.civilcraft.project.eg().surface.nT > 400), 'surface built from the points');
  for (const [k, v] of [['FL', 'breakline'], ['TBN', 'breakline'], ['TBS', 'breakline'], ['RIDGE', 'breakline'], ['CP', 'off']]) {
    await page.selectOption(`[data-groups] select[aria-label="How group ${k} builds the surface"]`, v);
  }
  ok(await page.evaluate(() => window.civilcraft.project.eg().surface.constrainedEdges.length === 65), 'four groups as breaklines: 65 pieces forced into the surface');
  ok((await page.textContent('[data-surface-info]')).includes('Breaklines4'), 'surface facts list 4 breaklines');
  await page.screenshot({ path: path.join(OUT, '02-surface-paper.png') });
  for (const k of ['bands', 'slopes', 'triangles']) await page.check(`[data-show="${k}"]`);
  await wait(200);
  ok(await page.isVisible('[data-legend]'), 'elevation bands show a legend');
  await page.screenshot({ path: path.join(OUT, '03-bands-slopes-triangles.png') });
  for (const k of ['bands', 'slopes', 'triangles']) await page.uncheck(`[data-show="${k}"]`);

  console.log('\n== alignment');
  await page.keyboard.press('a');
  ok(await page.evaluate(() => window.civilcraft.tool === 'alignment'), 'A picks the alignment tool');
  for (const [u, v] of [[10, 260], [200, 230], [300, 40], [390, 30]]) await clickWorld(page, E0 + u, N0 + v);
  await page.keyboard.press('Enter');
  const al = await page.evaluate(() => { const p = window.civilcraft.project, a = p.state.alignments[0]; const al = p.alignment(a); return { n: p.state.alignments.length, ok: al.ok, arcs: al.elements.filter((e) => e.type === 'arc').length, len: al.length, r: a.pis.map((q) => q.r) }; });
  ok(al.n === 1 && al.ok && al.arcs === 2, `alignment drawn with 2 curves (radii ${al.r.join(', ')})`);
  ok((await page.textContent('[data-props-h]')) === 'Alignment', 'the new alignment is selected in Properties');
  // change a radius in the PI table
  const rIn = page.locator('input[aria-label="Radius at PI 2"]');
  await rIn.fill('80'); await rIn.press('Enter');
  ok(await page.evaluate(() => window.civilcraft.project.state.alignments[0].pis[1].r === 80), 'radius edited in the PI table');
  const s = await page.evaluate(([x, y]) => window.civilcraft.toScreen(x, y), [E0 + 100, N0 + 255]);
  await page.mouse.move(s.x, s.y);
  const so = await page.textContent('[data-staoff]');
  ok(/Sta 0\+\d\d\.\d\d, offset \d+\.\d\d L/.test(so), 'status bar: station and offset (' + so + ')');
  ok(/Ground 2\d\d\.\d\d/.test(await page.textContent('[data-elev]')), 'status bar: ground elevation under the cursor');
  // drag PI 3 a little, then undo
  const before = await page.evaluate(() => ({ ...window.civilcraft.project.state.alignments[0].pis[2] }));
  const g = await page.evaluate(([x, y]) => window.civilcraft.toScreen(x, y), [before.x, before.y]);
  await page.mouse.move(g.x, g.y); await page.mouse.down(); await page.mouse.move(g.x + 30, g.y + 10, { steps: 5 }); await page.mouse.up();
  const after = await page.evaluate(() => ({ ...window.civilcraft.project.state.alignments[0].pis[2] }));
  ok(Math.abs(after.x - before.x) > 1, 'a PI grip drags');
  await page.keyboard.press('Control+z');
  ok(await page.evaluate((b) => Math.abs(window.civilcraft.project.state.alignments[0].pis[2].x - b.x) < 1e-9, before), 'Ctrl+Z puts the PI back (one step)');

  console.log('\n== profile');
  await page.keyboard.press('r');
  ok(await page.isVisible('[data-profile-panel]'), 'R shows the profile view');
  await page.click('[data-start-profile]');
  ok(await page.evaluate(() => window.civilcraft.project.state.alignments[0].pvis.length === 2), 'design profile started from the ground (2 PVIs)');
  await page.click('[data-pvi-add]');
  const mid = await page.evaluate(() => { const p = window.civilcraft.project, a = p.state.alignments[0], al = p.alignment(a); const sta = al.start + al.length / 2; return window.civilcraft.profToScreen(sta, Math.max(a.pvis[0].z, a.pvis[1].z) + 3); });
  await page.mouse.click(mid.x, mid.y);
  ok(await page.evaluate(() => window.civilcraft.project.state.alignments[0].pvis.length === 3), 'a click with Add PVIs adds a PVI');
  await page.click('[data-pvi-add]');
  const L = page.locator('input[aria-label="PVI 2 curve length"]');
  await L.fill('120'); await L.press('Enter');
  await page.locator('[data-props-h]').click();
  await wait(100);
  const facts = await page.textContent('[data-profile-facts]');
  ok(/Crest at \d+\+\d\d\.\d\d: L 120\.00, K \d+\.\d/.test(facts) && /High point/.test(facts), 'a 120 ft crest curve with K and its high point: ' + facts.slice(0, 90));
  const pv = await page.evaluate(() => { const a = window.civilcraft.project.state.alignments[0]; return window.civilcraft.profToScreen(a.pvis[1].sta, a.pvis[1].z); });
  await page.mouse.move(pv.x, pv.y); await page.mouse.down(); await page.mouse.move(pv.x + 20, pv.y - 15, { steps: 5 }); await page.mouse.up();
  ok(await page.evaluate(() => { const v = window.civilcraft.project.state.alignments[0].pvis[1]; return v.L === 120; }) && /PVI/.test(await page.textContent('[data-prof-read]')), 'a PVI drags (and keeps its curve)');
  await page.screenshot({ path: path.join(OUT, '04-alignment-profile.png') });

  console.log('\n== pad and volumes');
  await page.keyboard.press('Escape');
  await page.keyboard.press('g');
  for (const [u, v] of [[150, 120], [230, 120], [230, 180], [150, 180]]) await clickWorld(page, E0 + u, N0 + v);
  await page.keyboard.press('Enter');
  await page.waitForSelector('[data-vol-cut]');
  const z = page.locator('#cv-pad-z');
  await z.fill('254'); await z.press('Enter');
  await page.locator('[data-props-h]').click();
  await wait(150);
  const cut = await page.textContent('[data-vol-cut]'), fill = await page.textContent('[data-vol-fill]');
  ok(/cu yd/.test(cut) && /cu yd/.test(fill), `pad at 254: cut ${cut}, fill ${fill}`);
  const v = await page.evaluate(() => window.civilcraft.project.volumes());
  ok(v.cut > 0 && v.fill > 0, 'both cut and fill on the sloping site');
  await page.selectOption('[data-show-surface]', 'fg');
  await wait(150);
  await page.screenshot({ path: path.join(OUT, '05-graded-paper.png') });
  await page.keyboard.press('Control+z');
  ok(await page.evaluate(() => Number(window.civilcraft.project.state.pads[0].z) !== 254), 'Ctrl+Z undoes the elevation');
  await page.keyboard.press('Control+y');
  ok(await page.evaluate(() => Number(window.civilcraft.project.state.pads[0].z) === 254), 'Ctrl+Y redoes it');

  console.log('\n== corridor');
  await page.evaluate(() => window.civilcraft.select({ kind: 'alignment', id: window.civilcraft.project.state.alignments[0].id }));
  await page.check('#cv-co-on');
  await page.waitForSelector('[data-corridor-facts]');
  const cf = await page.textContent('[data-corridor-facts]');
  ok(/\d+ sections from 0\+00\.00 to 4\+\d\d\.\d\d; cut [\d,.]+ cu yd, fill [\d,.]+ cu yd/.test(cf), 'corridor built along the design profile: ' + cf);
  const lw = page.locator('#cv-co-lane');
  await lw.fill('14'); await lw.press('Enter');
  await page.locator('[data-props-h]').click();
  await wait(100);
  ok(await page.evaluate(() => window.civilcraft.project.state.alignments[0].corridor.lane === 14), 'lane width edited');
  await page.screenshot({ path: path.join(OUT, '05a-corridor.png') });

  console.log('\n== pipe network');
  await page.locator('[data-props-h]').click();
  await page.keyboard.press('Escape');
  await page.keyboard.press('p');
  for (const [u, v] of [[60, 200], [60, 120], [120, 60], [260, 40]]) await clickWorld(page, E0 + u, N0 + v);
  await page.keyboard.press('Enter');
  const nw = await page.evaluate(() => { const p = window.civilcraft.project, n = p.state.network, c = p.networkCheck(); return { s: n.structures.length, p: n.pipes.length, inv: n.pipes.every((q) => Number.isFinite(q.invUp) && Number.isFinite(q.invDn)), slopes: n.pipes.map((q) => c.pipes.get(q.id).slope), probs: c.problems.map((x) => x.msg) }; });
  ok(nw.s === 4 && nw.p === 3 && nw.inv, 'a pipe run of 4 structures and 3 pipes, inverts set from the rules');
  ok(nw.slopes.every((g) => g >= 0.005 - 1e-9), 'every pipe at least the least slope (' + nw.slopes.map((g) => (g * 100).toFixed(2) + '%').join(', ') + ')');
  const mp = await page.evaluate(([x, y]) => window.civilcraft.toScreen(x, y), [E0 + 90, N0 + 90]);
  await page.mouse.click(mp.x, mp.y);
  ok((await page.textContent('[data-props-h]')) === 'Pipe', 'clicking a pipe selects it');
  const upBefore = await page.evaluate(() => { const c = window.civilcraft; return c.project.state.network.pipes.find((q) => q.id === c.sel.id).invUp; });
  const up = page.locator('#cv-pp-up');
  await up.fill('300'); await up.press('Enter');
  await page.locator('[data-props-h]').click();
  await wait(100);
  ok(/crown is above|cover/.test(await page.textContent('[data-props]')) || (await page.evaluate(() => window.civilcraft.project.networkCheck().problems.length)) > 0, 'an invert above the ground is flagged');
  await page.keyboard.press('Control+z');
  ok(await page.evaluate((v) => window.civilcraft.project.state.network.pipes.some((q) => q.invUp === v) && !window.civilcraft.project.state.network.pipes.some((q) => q.invUp === 300), upBefore), 'Ctrl+Z puts the invert back');
  await page.keyboard.press('Escape');
  await page.screenshot({ path: path.join(OUT, '05b-pipes.png') });

  console.log('\n== exports');
  const xml = await download(page, () => page.click('[data-cmd="landxml"]'));
  const cx = check('landxml', xml);
  ok(cx.schema === 'valid' || cx.schema === 'skipped', 'LandXML export validates against the 1.2 XSD (' + cx.schema + ')' + (cx.schema_errors?.length ? ' ' + cx.schema_errors.join(' | ') : ''));
  ok(cx.points === 276 && cx.surfaces.length === 2 && cx.alignments[0].curves === 2 && cx.alignments[0].paracurves[0] === 120, 'LandXML: points, existing + proposed surfaces, alignment with 2 curves, the 120 ft vertical curve');
  ok(cx.networks.length === 1 && cx.networks[0].structs === 4 && cx.networks[0].pipes === 3 && cx.networks[0].inverts === 6, 'LandXML: the storm network (4 structures, 3 pipes, 6 inverts)');
  const dxf = await download(page, () => page.click('[data-cmd="dxf"]'));
  const cd = check('dxf', dxf);
  ok(cd.skipped || (cd.version === 'AC1009' && cd.errors === 0 && cd.counts.ARC === 2 && cd.layers['C-GRAD-DAYL'] === 3 && cd.layers['C-STRM-PIPE'] >= 3), 'DXF export: R12, no audit errors, 2 arcs, 3 daylight lines (pad + both corridor sides), pipes');
  // DWG: the same drawing as the DXF, read back by libredwg-web (vendored) and by every installed
  // independent reader (setup-dwg-readers.sh); counts per layer, labels and contour elevations must match the DXF
  // the DWG button opens the format dialog (2000 by default, the pick remembered in this browser)
  const exportDwg = async (version) => {
    await page.click('[data-cmd="dwg"]');
    await page.waitForSelector('[data-dwg][open]');
    if (version) await page.selectOption('[data-dwg-format]', version);
    return download(page, () => page.click('[data-dwg-go]'));
  };
  const dwg = await exportDwg();
  ok(dwg.endsWith('.dwg') && fs.readFileSync(dwg).subarray(0, 6).toString('latin1') === 'AC1015', 'DWG export (dialog, default format) downloads an AC1015 (2000 format) file');
  ok(/Exported DWG \(2000 format\)/.test(await page.textContent('[data-status]')), 'the status line says what was exported');
  const dwg18 = await exportDwg('AC1032');
  ok(fs.readFileSync(dwg18).subarray(0, 6).toString('latin1') === 'AC1032' && /Exported DWG \(2018 format\)/.test(await page.textContent('[data-status]')), 'DWG export in the 2018 format: an AC1032 file, said in the status line');
  await page.click('[data-cmd="dwg"]');
  await page.waitForSelector('[data-dwg][open]');
  ok((await page.inputValue('[data-dwg-format]')) === 'AC1032', 'the DWG dialog remembers the last format');
  await page.keyboard.press('Escape');
  {
    const dd = check('dxfdump', dxf);
    if (!dd.skipped) {
      const sig = (ents) => {
        const byLayer = {}, texts = [], elevs = new Set();
        for (const e of ents) {
          byLayer[e.layer] = (byLayer[e.layer] || 0) + 1;
          if (e.t === 'text') texts.push(e.text.replace(/%%d/gi, '°').replace(/%%p/gi, '±').replace(/\\U\+([0-9A-F]{4})/gi, (m, h) => String.fromCharCode(parseInt(h, 16))));
          if (e.elev !== undefined && /TOPO-M/.test(e.layer)) elevs.add(e.elev);
        }
        return JSON.stringify([Object.entries(byLayer).sort(), texts.sort(), [...elevs].sort((a, b) => a - b)]);
      };
      // (R12 DXF contours are 2D POLYLINEs carrying the elevation; the DWG has LWPOLYLINEs — dxfdump gives both an elev)
      const fromDxf = dd.entities;
      const want = sig(fromDxf);
      const lw = await import(pathToFileURL(path.join(REPO, 'public_html/assets/vendor/libredwg-web/current/dist/libredwg-web.js')).href);
      const quiet = async (fn) => { const l = console.log, w = console.warn; console.log = console.warn = () => {}; try { return await fn(); } finally { console.log = l; console.warn = w; } };
      const L = await quiet(() => lw.LibreDwg.create(path.join(REPO, 'public_html/assets/vendor/libredwg-web/current/wasm') + '/'));
      const { availableReaders } = await import(pathToFileURL(path.join(HERE, 'dwg-readers.mjs')).href);
      for (const [file, year] of [[dwg, '2000'], [dwg18, '2018']]) {
        const raw = await quiet(() => L.dwg_read_data(fs.readFileSync(file), lw.Dwg_File_Type.DWG));
        const db = L.convert(raw); L.dwg_free(raw);
        const viaWeb = db.entities.map((e) => ({ layer: e.layer, t: e.type === 'TEXT' ? 'text' : e.type, text: e.text, elev: e.type === 'LWPOLYLINE' ? e.elevation : undefined }));
        ok(sig(viaWeb) === want, `libredwg-web reads the ${year} DWG: ${db.entities.length} entities, same layers, labels and contour elevations as the DXF`);
        for (const rd of availableReaders(HERE)) {
          const r = rd.run([file], DL).get(file);
          if (r.problems.length) { ok(false, rd.name + ` opens the ${year} DWG: ` + r.problems.join(' | ')); continue; }
          const d = JSON.parse(execFileSync(python, [path.join(HERE, 'check.py'), 'dxfdump', r.dxf, ...(r.encoding ? [r.encoding] : [])], { encoding: 'utf8', maxBuffer: 1 << 28 }));
          ok(sig(d.entities) === want, `${rd.name} opens the ${year} DWG with no errors: same layers, labels and contour elevations as the DXF`);
        }
      }
    }
  }
  await page.keyboard.press('Control+p');
  await page.waitForSelector('[data-plot][open]');
  ok((await page.inputValue('[data-plot-scale]')) === '1" = 40\'', 'plot dialog picks 1" = 40\' on tabloid');
  const pdf = await download(page, () => page.click('[data-plot-go]'));
  const info = execFileSync('pdfinfo', [pdf], { encoding: 'utf8' });
  const txt = execFileSync('pdftotext', [pdf, '-'], { encoding: 'utf8' });
  ok(/Pages:\s+1/.test(info) && txt.includes('Scale 1" = 40\''), 'PDF plot: one page, scale in the title strip');
  const vSaved = await page.evaluate(() => window.civilcraft.project.volumes().cut);
  const proj = await download(page, () => page.keyboard.press('Control+s'));
  ok(proj.endsWith('.civilcraft.json') && JSON.parse(fs.readFileSync(proj, 'utf8')).pads.length === 1, 'Ctrl+S downloads the project file');

  console.log('\n== reopen');
  await page.goto(BASE + '/lab/civilcraft?space=model', { waitUntil: 'networkidle' });
  await page.setInputFiles('[data-file]', proj);
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const re = await page.evaluate(() => { const p = window.civilcraft.project; return { al: p.state.alignments.length, pvis: p.state.alignments[0].pvis.length, pads: p.state.pads.length, cut: p.volumes()?.cut }; });
  ok(re.al === 1 && re.pvis === 3 && re.pads === 1 && re.cut === vSaved, 'the project file reopens with the same alignment, profile, corridor, pad and cut');
  await page.click('[data-cmd="profile"]');
  await wait(200);
  await page.screenshot({ path: path.join(OUT, '06-model-theme.png') });
  page.once('dialog', () => {});
  await page.setInputFiles('[data-file]', xml);
  const askBtn = await page.waitForSelector('dialog.cv-ask[open] button[data-key="discard"]', { timeout: 3000 }).catch(() => null);
  if (askBtn) await askBtn.click();
  await page.waitForFunction(() => !!window.civilcraft.project.state.surface.tin);
  const lx = await page.evaluate(() => { const p = window.civilcraft.project; return { pts: p.points.length, tri: p.eg().surface.nT, al: p.state.alignments.length, ok: p.alignment(p.state.alignments[0]).ok, pvis: p.state.alignments[0].pvis.length, notes: document.querySelector('[data-surface-report]').textContent }; });
  ok(lx.pts === 276 && lx.tri > 400 && lx.al === 1 && lx.ok && lx.pvis === 3, 'the exported LandXML reopens: points, TIN, alignment and its profile');
  ok(await page.evaluate(() => window.civilcraft.project.state.network?.pipes.length === 3), 'and its pipe network');
  ok(/Only the first surface/.test(lx.notes), 'the second surface in the file is named as not opened');

  console.log('\n== bad rows');
  const bad = path.join(DL, 'bad-points.csv');
  fs.writeFileSync(bad, '1,5000,1000,100,GRD\n2,abc,1000,100,GRD\n3,5010,1010\n4,5020,1005,101,"EP <b>x</b>"\n5,5005,1020,99,GRD\n');
  await page.setInputFiles('[data-file]', bad);
  await page.waitForSelector('[data-import][open]');
  const badTxt = await page.textContent('[data-imp-bad]');
  ok(/Line 2: northing or easting is not a number/.test(badTxt) && /Line 3: 3 columns/.test(badTxt), 'bad rows listed with line numbers and reasons');
  ok(await page.evaluate(() => !document.querySelector('[data-import] b')), 'file text is shown as text, never as HTML');
  await page.keyboard.press('Escape');
  await wait(100);
  ok(await page.evaluate(() => !document.querySelector('[data-import]').open), 'Esc closes the import dialog');

  console.log('\n== Edit group: select, copy, paste, duplicate, delete (survey points)');
  await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.evaluate(() => { try { localStorage.removeItem('civilcraft.clipboard'); localStorage.removeItem('civilcraft.settings'); } catch { /* fine */ } });
  await page.reload({ waitUntil: 'networkidle' });
  const tb = await page.evaluate(() => {
    const t = document.querySelector('main > [role="toolbar"]'), gs = [...t.querySelectorAll(':scope > [role="group"]')];
    const kids = (g) => [...g.querySelector('[class$="-tool-row"]').children].map((c) => c.dataset.cmd || (c.matches('details[data-edit-menu]') ? 'more' : c.tagName));
    return { tops: [...new Set(gs.map((g) => Math.round(g.getBoundingClientRect().top)))], names: gs.map((g) => g.getAttribute('aria-label')), edit: kids(gs.find((g) => g.getAttribute('aria-label') === 'Edit')), view: kids(gs.find((g) => g.getAttribute('aria-label') === 'View')), right: Math.round(Math.max(...gs.map((g) => g.getBoundingClientRect().right))) };
  });
  ok(tb.tops.length === 1, `toolbar: every group on one row at 1440 px, as before (right edge ${tb.right} px)`);
  ok(tb.names.join() === 'File,Export,Surface,Design,Edit,GIS,View', 'toolbar groups: ' + tb.names.join(', '));
  ok(tb.edit.join() === 'undo,redo,copy,paste,more' && tb.view.join() === 'select,fit,view3d', 'Edit = Undo, Redo, Copy, Paste, More; Select moved to View (with Fit and 3D) (' + tb.edit.join() + ' | ' + tb.view.join() + ')');
  await page.locator('.cv-tools').screenshot({ path: path.join(OUT, '09-toolbar-1440.png') });
  ok(await page.evaluate(() => { const b = document.querySelector('.cv-tool-row > [data-cmd="copy"]'); return b.disabled && /no survey points yet/.test(b.title); }), 'Copy is grayed out on an empty project, the tooltip says why');
  await page.click('[data-sample]');
  await page.waitForSelector('[data-import][open]');
  await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  const pt = (n) => page.evaluate((n) => { const p = window.civilcraft.project.points.find((q) => q.n === n); return p ? { x: p.x, y: p.y, z: p.z, d: p.d } : null; }, n);
  const picked = () => page.evaluate(() => window.civilcraft.picked.slice().sort((a, b) => a - b));
  const count = () => page.evaluate(() => window.civilcraft.project.points.length);
  const status = () => page.textContent('[data-status]');
  ok(await page.evaluate(() => { const b = document.querySelector('.cv-tool-row > [data-cmd="copy"]'); return b.disabled && /Select survey points first/.test(b.title); }), 'with points but none selected, Copy says "Select survey points first"');
  await page.click('[data-edit-menu] > summary');
  const menu = await page.evaluate(() => [...document.querySelectorAll('[data-edit-menu] [role="menuitem"]')].map((b) => ({ c: b.dataset.cmd, dis: b.disabled, title: b.title, kbd: b.querySelector('kbd')?.textContent })));
  ok(menu.map((m) => m.c).join() === 'cut,copy,paste,paste-in-place,duplicate,delete,select-all,select-none', 'More menu: Cut, Copy, Paste, Paste in place, Duplicate, Delete, Select all, Select none');
  ok(menu.every((m) => m.kbd) && menu.find((m) => m.c === 'paste-in-place').kbd === 'Ctrl+Shift+V', 'each item shows its shortcut');
  ok(['cut', 'duplicate', 'delete', 'select-none'].every((c) => { const m = menu.find((x) => x.c === c); return m.dis && / — /.test(m.title); }) && !menu.find((m) => m.c === 'select-all').dis, 'items that cannot act are grayed out with the reason in the tooltip; Select all is not');
  await page.screenshot({ path: path.join(OUT, '10-edit-menu.png') });
  await page.click('[data-edit-menu] [data-cmd="select-all"]');
  ok((await picked()).length === 276 && !(await page.evaluate(() => document.querySelector('[data-edit-menu]').open)), 'More › Select all points: 276 selected, the menu closes');
  await page.keyboard.press('Escape');
  ok((await picked()).length === 0, 'Esc selects none');
  // click, Shift+click, Shift+drag
  const p10 = await pt('10'), p11 = await pt('11');
  await clickWorld(page, p10.x, p10.y);
  ok(JSON.stringify(await picked()) === '["10"]' && (await page.textContent('[data-props-h]')) === 'Point 10', 'a click selects point 10 (Properties: Point 10)');
  await page.keyboard.down('Shift'); await clickWorld(page, p11.x, p11.y); await page.keyboard.up('Shift');
  ok(JSON.stringify(await picked()) === '["10","11"]' && (await page.textContent('[data-props-h]')) === '2 points', 'Shift+click adds point 11');
  const box = await page.evaluate(() => { const p = window.civilcraft.project.points, q = p.filter((x) => ['30', '31', '32'].includes(x.n)); const xs = q.map((x) => x.x), ys = q.map((x) => x.y); return { x0: Math.min(...xs) - 1, x1: Math.max(...xs) + 1, y0: Math.min(...ys) - 1, y1: Math.max(...ys) + 1, inside: p.filter((x) => x.x >= Math.min(...xs) - 1 && x.x <= Math.max(...xs) + 1 && x.y >= Math.min(...ys) - 1 && x.y <= Math.max(...ys) + 1).map((x) => x.n) }; });
  const b0 = await page.evaluate(([x, y]) => window.civilcraft.toScreen(x, y), [box.x0, box.y1]), b1 = await page.evaluate(([x, y]) => window.civilcraft.toScreen(x, y), [box.x1, box.y0]);
  await page.keyboard.down('Shift'); await page.mouse.move(b0.x, b0.y); await page.mouse.down(); await page.mouse.move(b1.x, b1.y, { steps: 6 }); await page.screenshot({ path: path.join(OUT, '11-box-select.png') }); await page.mouse.up(); await page.keyboard.up('Shift');
  const afterBox = await picked();
  ok(box.inside.every((n) => afterBox.includes(n)) && afterBox.includes('10') && afterBox.length === 2 + box.inside.filter((n) => n !== '10' && n !== '11').length, `Shift+drag adds the ${box.inside.length} points inside the box (${afterBox.length} selected)`);
  // Copy (toolbar), Paste (toolbar) at the pointer
  await page.click('[data-cmd="copy"]');
  const nSel = afterBox.length;
  ok(new RegExp('Copied ' + nSel + ' points').test(await status()), 'Copy button: "Copied ' + nSel + ' points"');
  ok(await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('civilcraft.clipboard')).pts.length; } catch { return 0; } }) === nSel, 'the copy is kept in localStorage civilcraft.clipboard');
  const sys = await page.evaluate(() => navigator.clipboard.readText());
  ok(sys.split(/\r?\n/).filter(Boolean).length === nSel && sys.startsWith('10,' + p10.y.toFixed(3).replace(/\.?0+$/, '') + ','), 'the system clipboard holds P,N,E,Z,D rows: ' + sys.split(/\r?\n/)[0]);
  await page.click('.cv-tool-row > [data-cmd="paste"]');
  await page.waitForFunction(() => window.civilcraft.tool === 'paste');
  const c0 = await page.evaluate(() => { const p = window.civilcraft.project.points.filter((q) => window.civilcraft.picked.includes(q.n)); const xs = p.map((q) => q.x), ys = p.map((q) => q.y); return { x: (Math.min(...xs) + Math.max(...xs)) / 2, y: (Math.min(...ys) + Math.max(...ys)) / 2 }; });
  const tgt = { x: E0 + 330, y: N0 + 230 };
  const ts = await page.evaluate(([x, y]) => window.civilcraft.toScreen(x, y), [tgt.x, tgt.y]);
  await page.mouse.move(ts.x - 20, ts.y - 10); await page.mouse.move(ts.x, ts.y, { steps: 3 });
  await page.screenshot({ path: path.join(OUT, '12-paste-follows.png') });
  await page.mouse.click(ts.x, ts.y); await wait(100);
  const after1 = await picked();
  ok((await count()) === 276 + nSel && after1.length === nSel && after1.every((n) => Number(n) >= 277), `Paste button + click: ${nSel} points added with new numbers ${after1[0]}–${after1[after1.length - 1]}`);
  ok(/got new numbers: .* became 277/.test(await status()), 'the status says how they were renumbered: ' + (await status()).slice(0, 120));
  const moved = await page.evaluate(([a, b]) => { const p = window.civilcraft.project.points; return { a: p.find((q) => q.n === a), b: p.find((q) => q.n === b) }; }, ['10', after1[0]]);
  const exp = { x: p10.x + (tgt.x - c0.x), y: p10.y + (tgt.y - c0.y) };
  ok(Math.hypot(moved.b.x - exp.x, moved.b.y - exp.y) < 0.5 && moved.b.z === moved.a.z && moved.b.d === moved.a.d, 'the copies land where clicked (the middle of the copy at the click), elevations and descriptions kept');
  ok(await page.evaluate(() => window.civilcraft.project.eg().surface.bounds.maxX) >= exp.x - 1e-6, 'the surface was rebuilt and reaches the pasted points');
  await page.keyboard.press('Control+z');
  ok((await count()) === 276, 'Ctrl+Z takes the paste back (one step)');
  await page.click('.cv-tool-row > [data-cmd="redo"]');
  ok((await count()) === 276 + nSel, 'Redo button pastes it again');
  // keys: Ctrl+A, Esc, Ctrl+C, Ctrl+Shift+V, Ctrl+D, Delete, Ctrl+X, More › Paste in place
  await page.keyboard.press('Escape');
  await clickWorld(page, p10.x, p10.y);
  await page.keyboard.press('Control+c'); await wait(250);
  ok(/Copied 1 point\b/.test(await status()), 'Ctrl+C copies the selected point');
  ok((await page.evaluate(() => navigator.clipboard.readText())).startsWith('10,'), 'Ctrl+C put its row on the system clipboard');
  await page.keyboard.press('Control+Shift+V'); await wait(250);
  const n0 = String(276 + nSel + 1);
  ok((await count()) === 276 + nSel + 1 && JSON.stringify(await picked()) === JSON.stringify([n0]), 'Ctrl+Shift+V pastes in place as point ' + n0);
  const pin = await pt(n0);
  ok(pin && pin.x === p10.x && pin.y === p10.y && pin.z === p10.z, 'paste in place keeps the coordinates exactly');
  await page.keyboard.press('Control+d');
  ok(await page.evaluate(() => window.civilcraft.tool === 'paste'), 'Ctrl+D: the duplicate follows the pointer');
  await clickWorld(page, E0 + 20, N0 + 20);
  const n1 = String(276 + nSel + 2);
  ok((await count()) === 276 + nSel + 2 && /Duplicated 1 point/.test(await status()) && (await pt(n1))?.x > E0 + 19, 'click: duplicated as point ' + n1);
  await page.keyboard.press('Delete');
  ok((await count()) === 276 + nSel + 1 && !(await pt(n1)), 'Delete deletes the selected point');
  await page.keyboard.press('Control+z');
  ok(!!(await pt(n1)), 'Ctrl+Z brings it back');
  await page.keyboard.press('Escape');
  await page.keyboard.press('Control+a');
  ok((await picked()).length === 276 + nSel + 2, 'Ctrl+A selects every point');
  await page.keyboard.press('Escape');
  await clickWorld(page, (await pt('5')).x, (await pt('5')).y);
  await page.keyboard.press('Control+x'); await wait(250);
  ok(!(await pt('5')) && /Cut 1 point/.test(await status()), 'Ctrl+X cuts point 5');
  await page.click('[data-edit-menu] > summary');
  await page.click('[data-edit-menu] [data-cmd="paste-in-place"]');
  await wait(500);
  ok(!!(await pt('5')) && /1 kept its number/.test(await status()), 'More › Paste in place: point 5 comes back with its own number (it was free again)');
  // point rows from a spreadsheet: newer than our copy, so they win
  await page.evaluate(() => navigator.clipboard.writeText('9001\t' + (2080000 + 120.5) + '\t' + (6150000 + 140.25) + '\t251.5\tSTAKE A\r\n9002\t' + (2080000 + 125) + '\t' + (6150000 + 150) + '\t\tSTAKE B\r\n'));
  await page.locator('[data-props-h]').click();
  await page.keyboard.press('Control+Shift+V'); await wait(300);
  const s1 = await pt('9001'), s2 = await pt('9002');
  ok(s1 && Math.abs(s1.y - 2080120.5) < 1e-9 && Math.abs(s1.x - 6150140.25) < 1e-9 && s1.z === 251.5 && s1.d === 'STAKE A' && s2 && s2.z === null, 'rows copied in a spreadsheet paste in place through the point parser (9001, 9002; empty elevation = none)');
  ok(await page.evaluate(() => window.civilcraft.project.groups().some((g) => g.key === 'STAKE')), 'their description code is a new point group');
  await page.screenshot({ path: path.join(OUT, '13-pasted-points.png') });

  console.log('\n== Settings › CivilCraft');
  await page.keyboard.press('Control+,');
  await page.waitForSelector('[data-app-settings][open]');
  await page.click('[data-settings-tab="app"]');
  ok(await page.isVisible('[data-cv-settings]') && (await page.textContent('[data-settings-tab="app"]')).trim() === 'CivilCraft', 'the Settings dialog has a CivilCraft tab with our fields');
  ok(await page.evaluate(() => ['cvOrder', 'cvRenumber', 'cvLabels'].every((n) => document.querySelector(`[data-app-settings] input[name="${n}"]:checked`))), 'the fields show the current settings when the dialog opens');
  await page.check('[data-app-settings] input[name="cvOrder"][value="PENZD"]');
  await page.check('[data-app-settings] input[name="cvRenumber"][value="always"]');
  await page.fill('[data-app-settings] input[name="cvStart"]', '5000'); await page.press('[data-app-settings] input[name="cvStart"]', 'Tab');
  await page.check('[data-app-settings] input[name="cvLabels"][value="n"]');
  await page.screenshot({ path: path.join(OUT, '14-settings-civilcraft.png') });
  await page.keyboard.press('Escape');
  const st = await page.evaluate(() => JSON.parse(localStorage.getItem('civilcraft.settings') || '{}'));
  ok(st.order === 'PENZD' && st.renumber === 'always' && st.start === 5000 && st.labels === 'n', 'stored in localStorage civilcraft.settings: ' + JSON.stringify(st));
  await page.check('[data-show="pointLabels"]');
  page.once('dialog', (d) => d.accept().catch(() => {}));   // "Leave site?" for the unsaved pasted points
  await page.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await page.click('[data-sample]'); await page.waitForSelector('[data-import][open]');
  ok((await page.textContent('[data-imp-summary]')).includes('from the header row'), 'after a reload, the sample still reads from its header (a header wins over the setting)');
  await page.click('[data-imp-ok]');
  await page.waitForFunction(() => window.civilcraft.project.points.length === 276);
  ok(await page.evaluate(() => { const s = window.civilcraft.settings; return s.order === 'PENZD' && s.renumber === 'always' && s.start === 5000 && s.labels === 'n'; }), 'the settings survive a reload');
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  ok(await page.evaluate(() => document.querySelector('[data-app-settings] input[name="cvOrder"][value="PENZD"]').checked && document.querySelector('[data-app-settings] input[name="cvRenumber"][value="always"]').checked && document.querySelector('[data-app-settings] input[name="cvStart"]').value === '5000' && document.querySelector('[data-app-settings] input[name="cvLabels"][value="n"]').checked), 'reopened after the reload, the dialog shows them');
  await page.keyboard.press('Escape');
  await clickWorld(page, (await pt('20')).x, (await pt('20')).y);
  await page.keyboard.press('Control+c'); await wait(250);
  const rowP = await page.evaluate(() => navigator.clipboard.readText());
  const p20 = await pt('20');
  ok(rowP.startsWith('20,' + String(Number(p20.x.toFixed(3))) + ',' + String(Number(p20.y.toFixed(3))) + ','), 'P,E,N,Z,D: the copied row has the easting first: ' + rowP.trim());
  await page.keyboard.press('Control+Shift+V'); await wait(250);
  ok(!!(await pt('5000')) && JSON.stringify(await picked()) === '["5000"]', 'New numbers start at 5000: the pasted point is 5000');
  await page.evaluate(() => navigator.clipboard.writeText('7001 ' + (6150000 + 60) + ' ' + (2080000 + 70) + ' 250 PENZ\n'));
  await page.keyboard.press('Control+Shift+V'); await wait(250);
  const pz = await page.evaluate(() => window.civilcraft.project.points.find((q) => q.d === 'PENZ'));
  ok(pz && pz.n === '5001' && Math.abs(pz.x - 6150060) < 1e-9 && Math.abs(pz.y - 2080070) < 1e-9, 'rows without a header read easting first, and "Always new numbers" renumbers 7001 as 5001');
  await page.check('[data-show="pointLabels"]');
  const labelOf = (n) => page.evaluate((n) => { const sc = window.civilcraft.view.scene(); const items = sc.items || sc; const p = window.civilcraft.project.points.find((q) => q.n === n); return items.filter((i) => i.layer === 'V-NODE-TEXT').map((i) => i.text).find((t) => t === n || t.startsWith(n + '  ')) || null; }, n);
  ok((await labelOf('20')) === '20', 'Point labels: Number — the plan label shows just "20"');
  await page.click('[data-settings-open]');
  await page.waitForSelector('[data-app-settings][open]');
  await page.click('[data-settings-reset]');
  await wait(150);
  ok(/^20  \d+\.\d\d  \S/.test(await labelOf('20') || ''), 'after Reset the label shows number, elevation and description again: ' + (await labelOf('20')));
  ok(await page.evaluate(() => { const s = window.civilcraft.settings, d = document.querySelector('[data-app-settings]'); return s.order === 'PNEZD' && s.renumber === 'clash' && s.start === null && s.labels === 'nzd' && d.querySelector('input[name="cvOrder"][value="PNEZD"]').checked && d.querySelector('input[name="cvStart"]').value === ''; }), 'Reset puts the CivilCraft settings back (P,N,E,Z,D, keep free numbers, no start, full labels)');
  await page.keyboard.press('Escape');

  console.log('\n== phone width');
  const phone = await signedInContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const pp = await phone.newPage();
  watch(pp);
  await pp.goto(BASE + '/lab/civilcraft?space=paper', { waitUntil: 'networkidle' });
  await pp.click('[data-sample]');
  await pp.click('[data-imp-ok]');
  await pp.waitForFunction(() => window.civilcraft.project.points.length === 276);
  await wait(200);
  await pp.screenshot({ path: path.join(OUT, '07-phone.png') });
  await pp.screenshot({ path: path.join(OUT, '08-phone-full.png'), fullPage: true });
  const sw = await pp.evaluate(() => ({ sw: document.scrollingElement.scrollWidth, cw: document.documentElement.clientWidth }));
  const wide = sw.sw > sw.cw ? await pp.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => e.getBoundingClientRect().right > document.documentElement.clientWidth + 1).slice(0, 6).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0] + ':' + Math.round(e.getBoundingClientRect().right)).join(' ')) : '';
  const inMain = await pp.evaluate(() => [...document.querySelectorAll('main *')].filter((e) => { if (e.closest('.cv-tools')) return false; return e.getBoundingClientRect().right > document.documentElement.clientWidth + 1; }).map((e) => e.tagName.toLowerCase() + '.' + String(e.className).split(' ')[0]).slice(0, 6));
  ok(inMain.length === 0, 'nothing in CivilCraft\'s own page is wider than 390 px (the toolbar scrolls inside itself)' + (inMain.length ? ': ' + inMain.join(' ') : ''));
  if (sw.sw > sw.cw) {
    await pp.goto(BASE + '/lab/cadcraft?space=paper', { waitUntil: 'networkidle' });
    const cc = await pp.evaluate(() => document.scrollingElement.scrollWidth);
    console.log(`  note: the page is ${sw.sw} px wide at 390 because of the shared app bar (${wide}); /lab/cadcraft measures ${cc} px the same way`);
  } else ok(true, `no horizontal page scroll at 390 px (${sw.sw} ≤ ${sw.cw})`);
  await phone.close();

  ok(problems.length === 0, 'no console errors' + (problems.length ? ': ' + problems.slice(0, 5).join(' | ') : ''));
} catch (e) {
  fail++;
  console.log('  FAIL ' + (e.stack || e.message));
} finally {
  await browser.close();
  if (!process.argv.includes('--stay-up')) { try { admin('down'); } catch { /* fine */ } }
  fs.rmSync(DL, { recursive: true, force: true });
}
console.log(`\n${pass} passed, ${fail} failed  (screenshots in ${OUT})`);
process.exit(fail ? 1 : 0);
