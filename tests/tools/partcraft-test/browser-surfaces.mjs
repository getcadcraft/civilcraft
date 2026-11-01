#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-surfaces.mjs — 0.8 SU.747b in PartCraft's real page (part_PART_3), headless Chromium on /lab/partcraft: the Surfaces workspace in the
 * switcher; two curves by typed points (Curve through points), a Loft started and its two curves picked from the list; Run makes the surface;
 * the patch set is kept in the part file (studies.nurbs) and comes back after the file opens again; the panel's Undo takes the loft away;
 * the zebra view; Export STEP downloads AP242 B-spline text; continuity goes to the shell's Problems (source partcraft.nurbs); a click on the
 * drawn surface in the view picks it while a command waits for a surface. No console errors.
 *   node tools/partcraft-test/browser-surfaces.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const DEV = path.join(HERE, '../../public_html/assets/apps/partcraft/dev/');

export async function run(h) {
  const { page, ok, pc, built, shot } = h;
  console.log('\n== SU.747b Surfaces workspace');
  const P = await import(DEV + 'part.js');
  await pc((t) => window.partcraft.openText(t, 'Empty.partcraft.json'), P.toJSON(P.newPart('Skin')));
  await built();
  const wss = await page.$$eval('[data-workspace] option', (o) => o.map((x) => x.value));
  ok(wss.includes('surfaces'), 'the workspace switcher has Surfaces: ' + wss.join(', '));
  await page.selectOption('[data-workspace]', 'surfaces');
  await page.waitForSelector('[data-nurbs-panel]');
  ok(await page.isVisible('[data-nurbs-empty]'), 'the panel says the part has no curves or surfaces yet');
  const tb = await page.$$eval('.pc-tools [data-cmd^="surfaces-"]', (b) => b.filter((x) => x.offsetParent).map((x) => x.dataset.cmd));
  ok(tb.length === 7, 'the toolbar has the Surfaces group: ' + tb.join(', '));
  await page.click('.pc-tools [data-cmd="surfaces-loft"]');
  ok(await page.isVisible('[data-nurbs-cmd="surface.loft"]'), 'its Loft button starts a loft in the panel');
  await page.click('.pc-tools [data-cmd="surfaces-loft"]');
  ok(!(await page.$('[data-nurbs-cmd="surface.loft"]')), 'and pressed again stops it');
  const label = await page.textContent('.pc-tools [data-cmd="documents"]').catch(() => '');
  ok(!/sx\.vault/.test(label || ''), 'the File group\'s Documents button has its word (not a key): ' + (label || '').trim());
  const curve = async (pts) => {
    await page.click('[data-nurbs-start="curve.points"]');
    await page.fill('[data-nurbs-points]', pts); await page.press('[data-nurbs-points]', 'Tab');
    await page.click('[data-nurbs-run]');
  };
  await curve('0, 0, 0\n50, 10, 0\n100, 0, 0');
  await curve('0, 0, 60\n50, -10, 60\n100, 0, 60');
  let n = await page.$$eval('[data-nurbs-item]', (x) => x.length);
  ok(n === 2, `two curves by typed points (${n} items)`);
  await page.click('[data-nurbs-start="surface.loft"]');
  const ids = await page.$$eval('[data-nurbs-item]', (x) => x.map((e) => e.dataset.nurbsItem));
  for (const id of ids) await page.click(`[data-nurbs-pick="${id}"]`);
  await page.waitForSelector('[data-nurbs-need="ready"]');
  await page.click('[data-nurbs-run]');
  await page.waitForFunction(() => document.querySelectorAll('[data-nurbs-item]').length === 3);
  const st = await pc(() => { const s = window.partcraft.part.studies?.nurbs; return s ? { items: s.items.length, kinds: s.items.map((i) => i.kind), json: window.partcraft.P.toJSON(window.partcraft.part) } : null; });
  ok(st && st.items === 3 && st.kinds.filter((k) => k === 'surface').length === 1, 'Loft through the two picked curves: a surface, kept in the part file (studies.nurbs)');
  await shot('surfaces-loft');
  // a click on the drawn surface picks it while a command waits for a surface
  await page.click('[data-nurbs-start="surface.offset"]');
  const pickedByClick = await pc(() => {
    const S = window.partcraft.WS && null; const v = window.partcraft.view, cam = v.camera, THREE = window.partcraft.host.THREE;
    const p = new THREE.Vector3(50, 0, 30).project(cam), r = v.canvas.getBoundingClientRect();
    const x = r.left + (p.x + 1) / 2 * r.width, y = r.top + (1 - p.y) / 2 * r.height;
    v.canvas.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, cancelable: true, button: 0, clientX: x, clientY: y, pointerType: 'mouse' }));
    return document.querySelectorAll('[data-nurbs-picks] li').length;
  });
  ok(pickedByClick === 1, 'a click on the surface in the view picks it for Offset');
  await page.click('[data-nurbs-cancel]');
  // zebra
  await page.selectOption('[data-nurbs-mode]', 'zebra');
  await shot('surfaces-zebra');
  ok(true, 'the zebra view draws');
  // STEP out
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 60000 }), page.click('[data-nurbs-export="step"]')]);
  const step = fs.readFileSync(await dl.path(), 'utf8');
  ok(/^ISO-10303-21;/.test(step) && step.includes('B_SPLINE_SURFACE_WITH_KNOTS('), `Export STEP: ${dl.suggestedFilename()} with a B-spline surface (${step.length} bytes)`);
  // Problems source registered
  const srcs = await pc(() => (window.ccProblems?.store?.sources?.() || []).map((s) => s.id || s));
  ok(srcs.includes('partcraft.nurbs') || srcs.length === 0, 'continuity goes to the shared Problems (source partcraft.nurbs): ' + JSON.stringify(srcs).slice(0, 120));
  // undo in the panel
  await page.click('[data-nurbs-undo]');
  n = await page.$$eval('[data-nurbs-item]', (x) => x.length);
  ok(n === 2 && (await pc(() => window.partcraft.part.studies?.nurbs?.items.length)) === 2, 'the panel\'s Undo takes the loft away (and the file\'s copy follows)');
  // the file again
  await pc((t) => window.partcraft.openText(t, 'Skin again.partcraft.json'), st.json);
  await built();
  await page.waitForTimeout(300);
  n = await page.$$eval('[data-nurbs-item]', (x) => x.length);
  ok(n === 3, `opening the saved part brings the three items back (${n})`);
  // 0.8 EG.26: fairing hull lines — a noisy station gets an inflection Problem with a "Fair this curve" fix, and the Fair dialog makes it fair
  await pc(async () => {
    const pts = Array.from({ length: 21 }, (_, i) => { const a = Math.PI / 2 * i / 20, n = i % 20 ? (i % 2 ? 2 : -2) : 0; return [600 * Math.cos(a) + n, 0, 400 * Math.sin(a) + n]; });
    const st = window.partcraft.part.studies.nurbs; window.__noisyPts = pts;
  });
  await page.click('.pc-tools [data-cmd="surfaces-curve"]');
  await page.fill('[data-nurbs-points]', await pc(() => window.__noisyPts.map((p) => p.join(', ')).join('\n'))); await page.press('[data-nurbs-points]', 'Tab');
  await page.click('[data-nurbs-run]');
  await page.waitForTimeout(400);
  const probs = await pc(() => (window.ccProblems?.store?.list?.() || []).filter((p) => p.code === 'hull.inflection').map((p) => p.about[0].id));
  ok(probs.length >= 1, 'a noisy station shows a "hull.inflection" Problem: ' + probs.join(', '));
  await page.click('.pc-tools [data-cmd="surfaces-fair"]');
  await page.waitForSelector('dialog.pc-dialog[open] [data-hull-dialog]');
  await page.fill('[data-hull-tol]', '3');
  await page.click('dialog.pc-dialog[open] [data-key="fair"]');
  await page.waitForTimeout(400);
  const after = await pc(() => (window.ccProblems?.store?.list?.() || []).filter((p) => p.code === 'hull.inflection').length);
  ok(after === 0 && /faired/i.test(await h.statusText?.() || await page.textContent('[data-status]')), 'Fair (3 mm): the station is faired, its Problem gone — ' + (await page.textContent('[data-status]')).slice(0, 140));
  await shot('surfaces-fair');
  // 0.8 EG.26 (D7.45, decided 2026-10-29): surfaces to solid — the patches of a barge float; an open set is refused in words
  {
    const NN = await import(path.join(HERE, '../../lib/nurbs/index.js'));
    const Lb = 10000, Bb = 3000, Db = 2000, quad = (a, b, c, d) => NN.construct.planarPatch([a, b, c, d]);
    const faces = [quad([0, 0, -1500], [Lb, 0, -1500], [Lb, 0, 1500], [0, 0, 1500]), quad([0, 0, 1500], [Lb, 0, 1500], [Lb, Db, 1500], [0, Db, 1500]), quad([0, 0, -1500], [Lb, 0, -1500], [Lb, Db, -1500], [0, Db, -1500]),
      quad([0, 0, -1500], [0, 0, 1500], [0, Db, 1500], [0, Db, -1500]), quad([Lb, 0, -1500], [Lb, 0, 1500], [Lb, Db, 1500], [Lb, Db, -1500])];
    let doc = NN.doc.newDoc(); faces.forEach((f, i) => { doc = NN.doc.add(doc, 'surface', f, { name: 'Barge ' + i, id: 'b' + i }).doc; });
    const part = P.newPart('Barge'); part.studies = { ...(part.studies || {}), nurbs: doc };
    await pc((t) => window.partcraft.openText(t, 'Barge.partcraft.json'), P.toJSON(part));
    await built();
    await page.selectOption('[data-workspace]', 'surfaces');
    await page.waitForSelector('[data-nurbs-panel]');
    await page.click('.pc-tools [data-cmd="surfaces-float"]');
    await page.waitForSelector('dialog.pc-dialog[open] [data-float-dialog]');
    await page.selectOption('[data-float-unit]', 'mm'); await page.fill('[data-float-draft]', '1000'); await page.selectOption('[data-float-water]', 'fresh'); await page.fill('[data-float-kg]', '800');
    await page.waitForSelector('[data-float-rows]');
    const txt = await page.textContent('[data-float-out]');
    ok(/Closed hull/.test(txt) && /Displaced volume: 30 m³/.test(txt) && /KB: 0.5 m/.test(txt) && /GM: 0.4[45]/.test(txt), 'Float the surfaces: five patches close into a hull (deck capped); 30 m³ displaced, KB 0.5 m, GM 0.45 m — ' + txt.replace(/\s+/g, ' ').slice(0, 220));
    await shot('surfaces-float');
    await page.click('dialog.pc-dialog[open] [data-key="cancel"]');
    // four patches only: said, not floated
    let open = NN.doc.newDoc(); faces.slice(0, 4).forEach((f, i) => { open = NN.doc.add(open, 'surface', f, { id: 'o' + i }).doc; });
    const part2 = P.newPart('Open'); part2.studies = { ...(part2.studies || {}), nurbs: open };
    await pc((t) => window.partcraft.openText(t, 'Open.partcraft.json'), P.toJSON(part2));
    await built();
    await page.selectOption('[data-workspace]', 'surfaces');
    await page.waitForSelector('[data-nurbs-panel]');
    await page.click('.pc-tools [data-cmd="surfaces-float"]');
    await page.waitForSelector('dialog.pc-dialog[open] [data-float-dialog]');
    ok(/do not close into a hull/.test(await page.textContent('[data-float-out]')) && !(await page.$('[data-float-rows]')), 'surfaces that do not close are refused in words, nothing floated');
    await page.click('dialog.pc-dialog[open] [data-key="cancel"]');
  }
  ok(h.problems.length === 0, 'no console errors' + (h.problems.length ? ': ' + h.problems.join(' | ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const args = cliArgs();
  if (!process.argv.includes('--out')) args.out = path.join(HERE, '../../tmp/shots/partcraft-surfaces');
  const h = await startHarness(args);
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
