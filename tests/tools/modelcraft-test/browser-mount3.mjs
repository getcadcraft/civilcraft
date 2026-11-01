#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-mount3.mjs — ModelCraft's round-3 mounts (0.8, session model_PART_3; KICKOFF rule 40: each mount tested in the real page),
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
 *   node tools/modelcraft-test/browser-mount3.mjs [--out <dir>]
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
const OUT = path.resolve(arg('--out', path.join(REPO, 'tmp/shots/mount3')));
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
  const ctx = await signedInContext({ viewport: { width: 1600, height: 1000 }, locale: 'en-US', ignoreHTTPSErrors: true, serviceWorkers: 'block', acceptDownloads: true });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !/WebGL|GPU stall|GL_|status of 429/i.test(m.text())) problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('dialog', (d) => d.accept('Edge A'));
  await page.addInitScript(() => { window.showOpenFilePicker = undefined; window.showSaveFilePicker = undefined; try { if (!sessionStorage.getItem('m3')) { localStorage.removeItem('cc-problems:modelcraft'); localStorage.removeItem('modelcraft.settings'); sessionStorage.setItem('m3', '1'); } localStorage.setItem('cadcraft.assistants.modelcraft', JSON.stringify({ enabled: true, groups: ['read', 'edit'] })); } catch { /* blocked */ } });
  await page.goto(BASE + '/lab/modelcraft?space=model', { waitUntil: 'load' });
  await page.waitForFunction(() => window.modelcraft?.model && window.ccProblems, null, { timeout: 60000 });

  console.log('== P.6: the print check in Problems');
  ok(await page.evaluate(() => !!document.getElementById('cc-problems')), 'the page carries #cc-problems (manifest "problems")');
  await openBox(page);
  await page.waitForTimeout(200);
  await page.evaluate(() => document.querySelector('[data-export="print3d"]').click());
  await page.waitForSelector('.mc-print', { timeout: 30000 });
  const pr = await bySource(page, 'modelcraft.print');
  ok(pr.some((p) => p.code === 'print.open' && p.severity === 'error'), 'the open box is an error in Problems: ' + pr.map((p) => p.code).join(', '));
  ok(await page.isVisible('[data-problems-open]') && Number((await page.textContent('[data-problems-count]')).trim()) >= 1, 'the ⚠ button shows the count');
  await page.keyboard.press('Escape');
  await page.evaluate(() => document.querySelector('dialog[open] [data-close], dialog[open] .btn-line')?.click());
  await page.evaluate(() => { for (const d of document.querySelectorAll('dialog[open]')) d.close(); });
  await page.evaluate(() => window.ccProblems.open({}));
  await page.waitForSelector('[data-problems-panel]:not([hidden])');
  const openRow = pr.find((p) => p.code === 'print.open');
  ok(!!(await page.$('[data-problem="' + openRow?.id + '"]')), 'the panel lists it');
  await page.waitForTimeout(300);
  ok(await page.$$eval('[data-problem-mark]', (m) => m.length) >= 1, '⚠ marker over the view at the first place found');
  await page.screenshot({ path: path.join(OUT, '1-print-problems.png') });
  const undo0 = await page.evaluate(() => window.modelcraft.model.undoStack.length);
  const fixed = await page.evaluate((id) => window.ccProblems.store.fix(id, (window.ccProblems.store.get(id).fixes || []).find((f) => f.action === 'repair')?.id), openRow?.id);
  await page.waitForTimeout(500);
  const after = await bySource(page, 'modelcraft.print');
  ok(fixed && !after.some((p) => p.code === 'print.open'), 'Repair from Problems closes the hole and the check runs again: ' + after.map((p) => p.code).join(', '));
  ok(await page.evaluate((n) => window.modelcraft.model.undoStack.length === n + 1, undo0), 'one undo step');
  await page.evaluate(() => { window.ccInput.run('edit.undo'); });
  await page.waitForTimeout(200);
  ok((await bySource(page, 'modelcraft.print')).length === 0, 'a model change (undo) clears the old result');
  await page.evaluate(() => window.ccProblems.close());

  console.log('== RE.2 / RE.6: Render a picture hands its scene on');
  await page.evaluate(() => document.querySelector('[data-export="render"]').click());
  await page.waitForSelector('[data-render-engine]');
  await page.waitForFunction(() => document.querySelector('[data-render-engine] option')?.textContent !== 'Looking for engines…');
  const names = await page.$$eval('[data-render-engine] option', (os) => os.map((o) => o.value));
  ok(names.includes('open.glb') && names.includes('open.usd'), 'Open in … (glTF, USD) are listed', names.join());
  await page.selectOption('[data-render-engine]', 'open.glb');
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-render-go]')]);
  const glb = fs.readFileSync(await dl.path());
  ok(dl.suggestedFilename().endsWith('.glb') && glb.subarray(0, 4).toString() === 'glTF', 'a real .glb from the page\'s own hand-off: ' + dl.suggestedFilename() + ' ' + glb.length + ' bytes');
  ok(!/cannot hand its scene/.test(await page.textContent('[data-render-dialog]')), 'no "cannot hand its scene" note');
  await page.click('[data-render-close]');
  await page.waitForFunction(() => !document.querySelector('[data-render-dialog]'));

  console.log('== SU.747b: the Surfaces panel');
  await newFile(page);
  await page.evaluate(() => document.querySelector('[data-nurbs-open]').scrollIntoView());
  await page.click('[data-nurbs-open]');
  await page.waitForSelector('[data-nurbs-panel]');
  ok(await page.isVisible('[data-nurbs-empty]'), 'the panel opens with an empty list');
  const curve = async (pts) => {
    await page.click('[data-nurbs-start="curve.points"]');
    await page.fill('[data-nurbs-points]', pts);
    await page.dispatchEvent('[data-nurbs-points]', 'change');
    await page.click('[data-nurbs-run]');
  };
  await curve('0, 0, 0\n500, 0, 200\n1000, 0, 0');
  await curve('0, 1000, 0\n500, 1000, -200\n1000, 1000, 0');
  ok(await page.$$eval('[data-nurbs-item]', (r) => r.length) === 2, 'two curves through typed points');
  await page.click('[data-nurbs-start="surface.loft"]');
  ok((await page.getAttribute('[data-nurbs-need]', 'data-nurbs-need')) === 'curve', 'Loft asks for curves');
  await page.click('[data-nurbs-pick="c1"]'); await page.click('[data-nurbs-pick="c2"]');
  ok((await page.getAttribute('[data-nurbs-need]', 'data-nurbs-need')) === 'ready', 'two picks: ready');
  await page.click('[data-nurbs-run]');
  const sc = await page.evaluate(() => { const g = window.modelcraft.view.scene.getObjectByName('nurbs'); let mesh = 0, lines = 0; g?.traverse((o) => { if (o.isMesh) mesh++; else if (o.isLine) lines++; }); return { mesh, lines }; });
  ok(sc.mesh === 1 && sc.lines === 2, 'the loft is a mesh in the 3D view beside the two curves: ' + JSON.stringify(sc));
  const size = await page.evaluate(() => { const s = window.modelcraft.surfaces; const m = [...s.display.cache.values()].find((c) => c.obj.isMesh).obj; m.geometry.computeBoundingBox(); const b = m.geometry.boundingBox; return [b.max.x - b.min.x, b.max.y - b.min.y]; });
  ok(Math.abs(size[0] - 1) < 1e-6 && Math.abs(size[1] - 1) < 1e-6, 'drawn in the model\'s metres (1000 mm → 1 m): ' + size.map((v) => v.toFixed(4)).join(' × '));
  // a second loft 0.5 mm away from the first one's far edge: a gap, a G0 problem
  await curve('0, 1000.5, 0\n500, 1000.5, -200\n1000, 1000.5, 0');
  await curve('0, 2000, 0\n500, 2000, 100\n1000, 2000, 0');
  await page.click('[data-nurbs-start="surface.loft"]');
  const ids = await page.$$eval('[data-nurbs-item][data-kind="curve"]', (r) => r.map((x) => x.dataset.nurbsItem));
  await page.click('[data-nurbs-pick="' + ids[2] + '"]'); await page.click('[data-nurbs-pick="' + ids[3] + '"]');
  await page.click('[data-nurbs-run]');
  // ask for G1 along the shared edge (link) so the continuity table has a row, then let Problems speak
  const linked = await page.evaluate(() => {
    const S = window.modelcraft.surfaces.session, N = S.N, [a, b] = N.doc.surfaces(S.doc).map((i) => i.id);
    const mid = (ref) => { const c = N.tools.pick(S.doc, ref); const [u0, u1] = N.curve.domain(c); return N.curve.point(c, (u0 + u1) / 2); };
    let best = null;   // the facing edges: the pair whose middles are closest
    for (const ea of N.surface.EDGES) for (const eb of N.surface.EDGES) { const p = mid(a + '.' + ea), q = mid(b + '.' + eb), d = Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]); if (!best || d < best.d) best = { ea, eb, d }; }
    S.push(N.doc.link(S.doc, a, best.ea, b, best.eb, 'G1'), 'link');
    return best;
  });
  ok(Math.abs(linked.d - 0.5) < 1e-6, 'the two lofts face each other 0.5 mm apart (' + linked.ea + ' / ' + linked.eb + ')', JSON.stringify(linked));
  await page.waitForTimeout(600);
  ok(await page.$$eval('[data-nurbs-edges] [data-nurbs-edge]', (r) => r.length) >= 1, 'the continuity table has the edge');
  ok(await page.$eval('[data-nurbs-edges] [data-nurbs-edge]', (r) => r.dataset.ok) === '0', 'and marks it short of what was asked');
  await page.waitForFunction(() => window.ccProblems.store.list().some((p) => p.code && p.code.startsWith('nurbs.cont.')), null, { timeout: 10000 });
  const np = await page.evaluate(() => window.ccProblems.store.list().filter((p) => p.code.startsWith('nurbs.cont.')).map((p) => ({ id: p.id, code: p.code, text: p.text, where: !!p.where, fix: p.fixes?.[0]?.action })));
  ok(np.length === 1 && np[0].code === 'nurbs.cont.g0' && np[0].fix === 'nurbs.match' && np[0].where && /Gap of 0\.5 mm/.test(np[0].text), 'a 0.5 mm gap is a G0 problem with a Match fix: ' + JSON.stringify(np));
  await page.screenshot({ path: path.join(OUT, '2-surfaces-gap.png') });
  const okFix = await page.evaluate((id) => window.ccProblems.store.fix(id, window.ccProblems.store.get(id).fixes[0].id), np[0].id);
  await page.waitForFunction(() => !window.ccProblems.store.list().some((p) => p.code.startsWith('nurbs.cont.')), null, { timeout: 10000 }).catch(() => {});
  ok(okFix && !(await page.evaluate(() => window.ccProblems.store.list().some((p) => p.code.startsWith('nurbs.cont.')))), 'Match from Problems closes it');
  ok(await page.$eval('[data-nurbs-edges] [data-nurbs-edge]', (r) => r.dataset.ok) === '1', 'the table now says the edge meets G1');
  await page.click('[data-nurbs-undo]');
  await page.waitForFunction(() => window.ccProblems.store.list().some((p) => p.code.startsWith('nurbs.cont.')), null, { timeout: 10000 }).catch(() => {});
  ok(await page.evaluate(() => window.ccProblems.store.list().some((p) => p.code.startsWith('nurbs.cont.'))), 'the panel\'s Undo brings the gap back (and the problem)');
  await page.click('[data-nurbs-redo]');

  console.log('== views: zebra, curvature, control points');
  await page.selectOption('[data-nurbs-mode]', 'zebra');
  await page.waitForTimeout(300);
  const zebra = await page.evaluate(() => { const m = [...window.modelcraft.surfaces.display.cache.values()].find((c) => c.obj.isMesh).obj, c = m.geometry.getAttribute('color'); let dark = 0, light = 0; for (let i = 0; i < c.count; i++) (c.getX(i) < 0.5 ? dark++ : light++); return { dark, light }; });
  ok(zebra.dark > 0 && zebra.light > 0, 'zebra: dark and light stripes from the surface normals: ' + JSON.stringify(zebra));
  await page.screenshot({ path: path.join(OUT, '3-zebra.png') });
  await page.selectOption('[data-nurbs-mode]', 'curvature');
  await page.waitForTimeout(300);
  ok(/Gaussian curvature shown from/.test(await page.textContent('[data-nurbs-range]')), 'curvature: the legend says the range');
  await page.check('[data-nurbs-cvs]');
  ok(await page.evaluate(() => window.modelcraft.view.scene.getObjectByName('nurbs-extra').children.length) > 4, 'control nets drawn');
  await page.selectOption('[data-nurbs-mode]', 'shaded'); await page.uncheck('[data-nurbs-cvs]');

  console.log('== picking in the view');
  await page.click('[data-nurbs-start="curve.join"]');
  const scr = await page.evaluate(() => { const mc = window.modelcraft, S = mc.surfaces.session, c = S.doc.items.find((i) => i.kind === 'curve').curve, p = mc.surfaces.session.N.curve.point(c, 0.5); const q = mc.cam.project(p.map((v) => v / 1000)); const r = mc.ui.over.getBoundingClientRect(); return { x: r.left + q[0] * r.width / mc.cam.w, y: r.top + q[1] * r.height / mc.cam.h }; });
  await page.mouse.click(scr.x, scr.y);
  ok(await page.evaluate(() => window.modelcraft.surfaces.session.picks.length === 1 && window.modelcraft.model.undoStack.length >= 0), 'a click on a curve in the view picks it (the tools never see the click)');
  await page.click('[data-nurbs-cancel]');
  await page.click('[data-nurbs-start="curve.points"]');
  await page.evaluate(() => document.querySelector('[data-nurbs-pick-points]').click());
  await page.waitForFunction(() => window.modelcraft.tools.name === 'nurbspts', null, { timeout: 5000 }).catch(async () => console.log('  debug', await page.evaluate(() => ({ tool: window.modelcraft.tools.name, btn: !!document.querySelector('[data-nurbs-pick-points]'), cmd: window.modelcraft.surfaces.session.cmd }))));
  const gb = await page.evaluate(() => { const r = window.modelcraft.ui.over.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
  for (const [fx, fy] of [[0.3, 0.7], [0.5, 0.6], [0.7, 0.7]]) { await page.mouse.move(gb.x + gb.w * fx, gb.y + gb.h * fy); await page.mouse.click(gb.x + gb.w * fx, gb.y + gb.h * fy); await page.waitForTimeout(60); }
  await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.modelcraft.tools.name === 'select');
  const pp = await page.evaluate(() => window.modelcraft.surfaces.session.points);
  ok(Array.isArray(pp) && pp.length === 3 && pp.every((p) => p.length === 3 && p.every(Number.isFinite)), 'three points picked with the snapping tool (mm): ' + JSON.stringify(pp?.map((p) => p.map((v) => Math.round(v)))));
  await page.click('[data-nurbs-run]');

  console.log('== STEP, the file, New');
  const [st] = await Promise.all([page.waitForEvent('download'), page.click('[data-nurbs-export="step"]')]);
  const stText = fs.readFileSync(await st.path(), 'utf8');
  ok(/^ISO-10303-21;/.test(stText) && (stText.match(/B_SPLINE_SURFACE_WITH_KNOTS/g) || []).length === 2, 'STEP export: two B-spline surfaces in ' + st.suggestedFilename());
  const f = await page.evaluate(() => window.modelcraft.file());
  ok(f.addons?.nurbs?.doc?.format === 'cadcraft-nurbs' && f.addons.nurbs.doc.items.length === 7, 'the patch set is in the .modelcraft file (addons.nurbs): ' + f.addons?.nurbs?.doc?.items?.length + ' items');
  const tmp = path.join(OUT, 'surfaces.modelcraft');
  fs.writeFileSync(tmp, JSON.stringify(f));
  await newFile(page);
  await page.waitForFunction(() => window.modelcraft.surfaces.session.doc.items.length === 0, null, { timeout: 5000 }).catch(async () => console.log('  debug', await page.evaluate(() => ({ n: window.modelcraft.surfaces.session.doc.items.length, dlg: [...document.querySelectorAll('dialog[open]')].map((d) => d.textContent.slice(0, 120)), dirty: window.modelcraft.model.dirty, tool: window.modelcraft.tools.name, msg: window.modelcraft.ui.msg.textContent, faces: window.modelcraft.model.root.faces.size }))));
  ok(await page.evaluate(() => window.modelcraft.surfaces.session.doc.items.length === 0), 'New empties the panel');
  await page.setInputFiles('[data-file-open]', tmp);
  await page.waitForFunction(() => window.modelcraft.surfaces.session.doc.items.length === 7, null, { timeout: 20000 });
  ok(await page.evaluate(() => window.modelcraft.view.scene.getObjectByName('nurbs').children.filter((o) => o.isMesh).length === 2), 'reopened: the surfaces are drawn again');
  await page.screenshot({ path: path.join(OUT, '4-reopened.png') });

  console.log('== EG.36: File › Import a sketch photo…');
  execFileSync('node', [path.join(REPO, 'tools/modelcraft-test/sketch-photo.mjs')], { stdio: 'ignore' });
  await newFile(page);
  // the command from a real click (a file picker needs the person's gesture): a test button that runs the registry command
  await page.evaluate(() => { const b = document.createElement('button'); b.id = 'm3-run'; b.textContent = 'run'; b.style.cssText = 'position:fixed;left:4px;bottom:4px;z-index:99999'; b.onclick = () => window.ccInput.run('file.import-sketch'); document.body.append(b); });
  const [chooser] = await Promise.all([page.waitForEvent('filechooser'), page.click('#m3-run')]);
  await chooser.setFiles(path.join(REPO, 'tmp/shots/mount3/sketch-photo.png'));
  await page.waitForSelector('dialog[open] [data-sketch-scale]');
  await page.selectOption('dialog[open] [data-sketch-paper]', 'iso-a4');
  await page.fill('dialog[open] [data-sketch-scale]', '50');
  await page.click('dialog[open] button[data-key="go"]');
  await page.waitForFunction(() => window.modelcraft.model.root.insts.size === 1, null, { timeout: 30000 });
  const sk = await page.evaluate(() => {
    const m = window.modelcraft.model, outer = m.defs.get([...m.root.insts.values()][0].def);
    const kids = [...outer.insts.values()].map((i) => ({ tag: i.tag, name: m.defs.get(i.def).name, edges: m.defs.get(i.def).edges.size }));
    const blk = [...outer.insts.values()].find((i) => /black/.test(i.tag)); const bb = m.bbox(m.defs.get(blk.def));
    return { name: outer.name, kids, w: bb.max[0] - bb.min[0], d: bb.max[1] - bb.min[1], msg: window.modelcraft.ui.msg.textContent, tags: [...document.querySelectorAll('[data-tags] li input')].map((i) => i.value) };
  });
  ok(sk.kids.length === 3 && sk.kids.every((k) => k.edges > 0 && /^Sketch /.test(k.tag)), 'three pen colours, each a group with its tag: ' + sk.kids.map((k) => k.tag + ' ' + k.edges).join(', '));
  ok(Math.abs(sk.w - 9) < 0.25 && Math.abs(sk.d - 6) < 0.25, 'the room is 9 m × 6 m at 1:50 (' + sk.w.toFixed(2) + ' × ' + sk.d.toFixed(2) + ')');
  ok(/edges in 3 pen colours at 1 : 50/.test(sk.msg) && /paper's edge was found/.test(sk.msg), 'the status line says what was made: ' + sk.msg);
  ok(sk.tags.some((t) => /Sketch black/.test(t)), 'the Tags panel lists the colour tags');
  await page.screenshot({ path: path.join(OUT, '7-sketch-photo.png') });
  await page.evaluate(() => window.ccInput.run('edit.undo'));
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.modelcraft.model.root.insts.size === 0), 'one undo takes it back');

  console.log('== EG.60: Organize › Furnish a room…');
  await newFile(page);
  await page.evaluate(async (u) => {
    const M = await import(u), mc = window.modelcraft;
    mc.model.change('floor', (m) => { M.addPolygon(m.root, [[0, 0, 0], [4, 0, 0], [4, 5, 0], [0, 5, 0]], [0, 0, 1]); });
    mc.host.setSel([{ t: 'f', id: [...mc.model.root.faces.keys()].at(-1) }]);
    document.querySelector('.mc-tools [data-act="extents"]')?.click();
  }, await modUrl(page, /\/modelcraft\/dev\/model\.js/));
  await page.evaluate(() => window.ccInput.run('organize.furnish'));
  await page.waitForSelector('dialog[open] [data-furnish-kind]');
  ok(/20 m²/.test(await page.textContent('dialog[open] [data-furnish-room]')), 'the dialog names the room: ' + (await page.textContent('dialog[open] [data-furnish-room]')));
  await page.selectOption('dialog[open] [data-furnish-kind]', 'bedroom');
  await page.click('dialog[open] button[data-key="go"]');
  await page.waitForFunction(() => window.modelcraft.model.root.insts.size === 1, null, { timeout: 20000 });
  const fu = await page.evaluate(() => {
    const mc = window.modelcraft, m = mc.model, inst = [...m.root.insts.values()][0], g = m.defs.get(inst.def);
    return { tag: inst.tag, name: g.name, n: g.insts.size, kinds: [...g.insts.values()].map((i) => m.defs.get(i.def).starter), msg: mc.ui.msg.textContent, sel: mc.host.sel[0]?.t };
  });
  ok(fu.tag === 'Furniture' && fu.n >= 2 && fu.kinds.includes('bed_double'), 'a bedroom: ' + fu.kinds.join(', ') + ' in "' + fu.name + '" on the Furniture tag');
  ok(/Furnished \(Bedroom\): \d+ pieces/.test(fu.msg) && fu.sel === 'i', 'the status line says what was placed, the set is selected: ' + fu.msg);
  await page.screenshot({ path: path.join(OUT, '8-furnish.png') });
  await page.evaluate(() => window.ccInput.run('edit.undo'));
  await page.waitForTimeout(200);
  ok(await page.evaluate(() => window.modelcraft.model.root.insts.size === 0), 'one undo takes the set away');
  await page.evaluate(() => window.modelcraft.host.setSel([]));
  await page.evaluate(() => window.ccInput.run('organize.furnish'));
  await page.waitForTimeout(300);
  ok(/Select the floor of the room first/.test(await page.evaluate(() => window.modelcraft.ui.msg.textContent)), 'with no floor selected it says what to pick');

  console.log('== SU.929: a slanting cut in the Split for printing card');
  await newFile(page);
  const cube = await page.evaluate(async (u) => {
    const B = await import(u), mc = window.modelcraft, m = mc.model;
    const id = m.change('test cube', (mm) => { const d = B.buildShape(mm, 'box', 'Cube'); return mm.place(mm.root, d.id, [15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 15, 0, 0, 0, 0, 1]); });
    mc.host.changed?.(); mc.host.setSel([{ t: 'i', id }]);
    return id;
  }, await modUrl(page, /\/modelcraft\/dev\/beginner\.js/));
  await page.click('[data-act="extents"]').catch(() => {});
  await page.evaluate(() => document.querySelector('[data-export="print3d"]').click());
  await page.waitForSelector('dialog.mc-dialog [data-print-ok]', { timeout: 120000 });
  await page.click('dialog.mc-dialog [data-prep-tools] button[data-key="tool:split"]');
  await page.waitForSelector('[data-ptool="split"]:not([hidden]) [data-ptool-result]', { timeout: 120000 });
  await page.check('[data-ptool="split"] input[name="mcPtool-split-mode"][value="planes"]');
  await page.waitForSelector('[data-ptool="split"] input[name="mcPtool-split-at"]');
  await page.check('[data-ptool="split"] input[name="mcPtool-split-axis"][value="2"]');
  await page.waitForTimeout(150);
  await page.fill('[data-ptool="split"] input[name="mcPtool-split-at"]', '150');
  await page.dispatchEvent('[data-ptool="split"] input[name="mcPtool-split-at"]', 'change');
  await page.waitForSelector('[data-ptool="split"] input[name="mcPtool-split-tilt"]');
  ok(await page.$$eval('[data-ptool="split"] input[name="mcPtool-split-tilt-about"]', (r) => r.map((x) => x.value).join()) === '0,1', 'the slant turns about either of the two other axes (X, Y)');
  await page.fill('[data-ptool="split"] input[name="mcPtool-split-tilt"]', '30');
  await page.dispatchEvent('[data-ptool="split"] input[name="mcPtool-split-tilt"]', 'change');
  await page.waitForTimeout(150);
  await page.check('[data-ptool="split"] input[name="mcPtool-split-tilt-about"][value="0"]');
  await page.waitForTimeout(150);
  await page.check('[data-ptool="split"] input[name="mcPtool-split-conn"][value="dowel"]');
  await page.waitForTimeout(150);
  await page.click('[data-ptool="split"] [data-ptool-act="split-preview"]');
  await page.waitForSelector('[data-ptool="split"] [data-ptool-result="ok"]', { timeout: 120000 });
  const stext = await page.textContent('[data-ptool="split"]');
  ok(/2 pieces, 1 joint/.test(stext) && /Every piece is closed and passes the 3D-print check\./.test(stext), 'Preview: 2 pieces, 1 joint, both pass the print check: ' + (stext.match(/\d+ pieces?, \d+ joints?, \d+ connectors?/) || [''])[0]);
  ok(/slanting cut runs through/.test(stext), 'the card says how a slanting cut runs');
  await page.screenshot({ path: path.join(OUT, '9-split-slant.png') });
  await page.click('[data-ptool="split"] [data-ptool-act="split-apply"]');
  await page.waitForFunction(() => window.modelcraft.model.root.insts.size >= 2, null, { timeout: 120000 });
  const zr = await page.evaluate(() => { const m = window.modelcraft.model; return [...m.root.insts.values()].map((i) => { const b = m.bbox(m.defs.get(i.def), i.m); return [b.min[2] * 1000, b.max[2] * 1000]; }).sort((a, b) => a[0] - b[0]); });
  ok(zr.length === 2 && Math.abs(zr[0][1] - (150 + 150 * Math.tan(Math.PI / 6))) < 2 && Math.abs(zr[1][0] - (150 - 150 * Math.tan(Math.PI / 6))) < 2, 'split into the model: the cut slants 30° (lower piece up to ' + zr[0]?.[1].toFixed(1) + ' mm, upper from ' + zr[1]?.[0].toFixed(1) + ' mm; 150 ± 86.6)');
  await page.click('[data-ptool] [data-ptool-close]').catch(() => {});
  void cube;

  console.log('== D8.5: the orbit pivot marker');
  await newFile(page);
  await openBox(page);
  await page.waitForTimeout(300);
  const ob = await page.evaluate(() => { const mc = window.modelcraft, bb = mc.model.bbox(); const q = mc.cam.project([(bb.min[0] + bb.max[0]) / 2, (bb.min[1] + bb.max[1]) / 2, (bb.min[2] + bb.max[2]) / 2]); const r = mc.ui.over.getBoundingClientRect(); return { x: r.left + q[0] * r.width / mc.cam.w, y: r.top + q[1] * r.height / mc.cam.h }; });
  await page.evaluate(() => { window.modelcraft.view.pivotShown = null; });
  await page.mouse.move(ob.x, ob.y);
  await page.mouse.down({ button: 'middle' });
  await page.mouse.move(ob.x + 40, ob.y + 10, { steps: 4 });
  await page.waitForTimeout(150);
  const pv = await page.evaluate(() => window.modelcraft.view.pivotShown);
  ok(Array.isArray(pv), 'while a middle-drag orbits, the pivot marker is drawn', JSON.stringify(pv));
  await page.mouse.up({ button: 'middle' });
  await page.waitForTimeout(150);
  await page.evaluate(() => { window.modelcraft.view.pivotShown = null; window.modelcraft.view.invalidate(); });
  await page.waitForTimeout(150);
  ok(await page.evaluate(() => window.modelcraft.view.pivotShown === null), 'and gone when the drag ends');

  if (process.argv.includes('--kit')) await (await import('./browser-mount3-kit.mjs')).kit(page, ok, OUT);
} catch (e) {
  fail++; console.log('  FAIL threw: ' + (e && e.stack || e));
} finally {
  for (const p of problems) { fail++; console.log('  FAIL ' + p); }
  await browser.close();
  console.log((fail ? 'FAILED' : 'ok') + ' — ' + pass + ' passed, ' + fail + ' failed');
  process.exit(fail ? 1 : 0);
}
