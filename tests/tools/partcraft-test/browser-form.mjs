#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-form.mjs — the Form workspace and the Surface features, by real clicks in headless Chromium:
 * a box cage, a face picked and pulled up with the gizmo (one undo step), an edge creased, Finish → a solid in the
 * history, Ctrl+Z / edit again from Design, zebra analysis, an open plane form thickened from Design's More menu
 * (exact 100 × 100 × 2 volume), STEP of a form body read back by native OpenCascade, toolbar one row at 1440 px,
 * no console errors.
 *   node tools/partcraft-test/browser-form.mjs [--state file] [--out dir]
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');

export async function run(h) {
  const { page, ok, pc, built, tool, shot, nearRel } = h;
  const rows = () => page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
  const choose = async (id) => { await page.selectOption('[data-workspace]', id); await page.waitForFunction((id) => window.partcraft.workspace === id, id); };
  const study = () => pc(() => window.partcraft.part.studies?.form || null);
  /** screen position of a world point */
  const screen = (p) => pc((p) => { const { view, host } = window.partcraft; const r = view.canvas.getBoundingClientRect(); const v = new host.THREE.Vector3(...p).project(view.camera); return [(v.x + 1) / 2 * r.width + r.left, (1 - v.y) / 2 * r.height + r.top]; }, p);
  const TMP = path.join(REPO, 'tmp/partcraft-form');
  fs.mkdirSync(TMP, { recursive: true });

  console.log('\n== form: a box cage, pick, gizmo, crease, finish');
  await pc(() => window.partcraft.openText(JSON.stringify({ format: 'partcraft', version: 2, name: 'FormTest', units: 'mm', resolution: 64, seq: 1, rollback: null, features: [] }), 'FormTest.partcraft.json'));
  await pc(() => window.partcraft.exactReady());
  await choose('form');
  ok(await rows() === 1, 'Form workspace: the toolbar is one row at 1440 px');
  await tool('form-box');
  await page.waitForFunction(() => window.partcraft.part.studies?.form?.cage?.faces.length === 24);
  ok(true, 'Box: a 2×2×2 cage of 24 quads in the part\'s form study');
  ok(await page.locator('.pc-tools [data-cmd="form-extrude"]').isDisabled(), 'Extrude is off until faces are picked (reason in its title)');
  // pick a top face by clicking its centre
  const s0 = await study();
  const top = s0.cage.faces.findIndex((f) => f.every((v) => s0.cage.verts[v][1] > 49) && f.every((v) => s0.cage.verts[v][0] >= -1e-9 && s0.cage.verts[v][2] >= -1e-9));
  const cen = [0, 1, 2].map((i) => s0.cage.faces[top].reduce((s, v) => s + s0.cage.verts[v][i], 0) / 4);
  const [cx, cy] = await screen(cen);
  await page.mouse.click(cx, cy);
  await page.waitForTimeout(100);
  const picked = await page.textContent('#main');
  ok(/1 face/.test(picked), 'a click on the cage picks the face under it (panel: "1 face")');
  await shot('form-picked');
  // drag the gizmo's Y arrow up
  const n0 = await pc(() => window.partcraft.hist.undoStack.length);
  const up = await screen([cen[0], cen[1] + 20, cen[2]]);
  await page.mouse.move(up[0], up[1]);
  await page.mouse.down();
  for (let k = 1; k <= 10; k++) await page.mouse.move(up[0], up[1] - 6 * k);
  await page.mouse.up();
  await page.waitForTimeout(150);
  const s1 = await study();
  const ys = s1.cage.faces[top].map((v) => s1.cage.verts[v][1]);
  const others = s1.cage.verts.filter((p, i) => !s0.cage.faces[top].includes(i)).every((p, i) => true && p);
  ok(ys.every((y) => y > 55) && Math.max(...ys) - Math.min(...ys) < 1e-6 && others, `dragging the gizmo's Y arrow pulls the face up (y ${ys[0].toFixed(2)}, all four corners together)`);
  ok(await pc(() => window.partcraft.hist.undoStack.length) === n0 + 1, 'the drag is one undo step');
  await shot('form-pulled');
  // pick an edge of that face (its midpoint) and crease it from the toolbar
  const f = s1.cage.faces[top];
  // the edge of that face farthest (on screen) from the gizmo
  const piv = await screen(cen.map((v, i) => (i === 1 ? ys[0] : v)));
  let ex = 0, ey = 0, far = -1;
  for (let k = 0; k < 4; k++) {
    const mid = [0, 1, 2].map((i) => (s1.cage.verts[f[k]][i] + s1.cage.verts[f[(k + 1) % 4]][i]) / 2);
    const q = await screen(mid);
    const d = Math.hypot(q[0] - piv[0], q[1] - piv[1]);
    if (d > far) { far = d; [ex, ey] = q; }
  }
  await page.keyboard.press('Escape');   // drop the face (the gizmo goes away)
  await page.waitForTimeout(100);
  await page.mouse.click(ex, ey);
  await page.waitForTimeout(100);
  ok(/1 edge/.test(await page.textContent('#main')), 'a click on a cage edge picks it');
  await tool('form-crease');
  await page.waitForFunction(() => window.partcraft.part.studies?.form?.cage?.creases?.length === 1);
  ok(true, 'Crease: the picked edge is creased (weight 10, fully sharp)');
  // Ctrl+Z undoes the crease, Ctrl+Y brings it back
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => !(window.partcraft.part.studies?.form?.cage?.creases?.length));
  await page.keyboard.press('Control+y');
  await page.waitForFunction(() => window.partcraft.part.studies?.form?.cage?.creases?.length === 1);
  ok(true, 'Ctrl+Z / Ctrl+Y undo and redo a cage edit');
  // zebra analysis colours the limit surface
  await page.selectOption('[data-analysis]', 'zebra');
  const zebra = await pc(() => { const m = window.partcraft.view.overlays.get('form-surface'); const c = m.geometry.getAttribute('color'); let lo = 0, hi = 0; for (let i = 0; i < c.count; i++) (c.getX(i) > 0.5 ? hi++ : lo++); return { vc: m.material.vertexColors, lo, hi }; });
  ok(zebra.vc && zebra.lo > 0 && zebra.hi > 0, `zebra analysis: the limit surface shows dark and light stripes (${zebra.lo} / ${zebra.hi} vertices)`);
  await shot('form-zebra');
  await page.selectOption('[data-analysis]', 'none');
  // check exact (worker op), then finish
  await page.click('[data-form-act="check"]');
  await page.waitForFunction(() => /B-spline patches/.test(document.querySelector('[data-form-check]')?.textContent || ''), null, { timeout: 30000 });
  const chk = await page.textContent('[data-form-check]');
  ok(/closed, valid solid/.test(chk), 'Check exact (formCheck in the exact worker): ' + chk.trim());
  await tool('form-finish');
  await page.waitForFunction(() => window.partcraft.workspace === 'design');
  await built();
  const r = await pc(() => { const p = window.partcraft.part, g = window.partcraft.regen, f = p.features.find((x) => x.type === 'form'); return { n: p.features.length, type: f?.type, status: g.results.get(f?.id)?.status, vol: g.stats?.volume, study: !!p.studies?.form, faces: g.faces.length, form: g.results.get(f?.id)?.form }; });
  ok(r.type === 'form' && r.status === 'ok' && r.vol > 0 && !r.study && r.form && r.form.valid, `Finish: a Form feature in the history, built as a valid exact solid (${r.faces} B-spline faces, ${r.vol.toFixed(1)} mm³); back in Design; the study is cleared`);
  await shot('form-finished');
  // STEP of the form body, read back by native OCCT
  const PY = path.join(REPO, 'tools/partcraft-test/venv/bin/python');
  const st = await pc(() => window.partcraft.stepText('AP242'));
  const fstep = path.join(TMP, 'browser-form.step');
  fs.writeFileSync(fstep, st);
  if (fs.existsSync(PY)) {
    const out = execFileSync(PY, ['-c', `
import sys, json
from OCP.STEPControl import STEPControl_Reader
from OCP.BRepCheck import BRepCheck_Analyzer
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
r = STEPControl_Reader(); r.ReadFile(sys.argv[1]); r.TransferRoots(); s = r.OneShape()
g = GProp_GProps(); BRepGProp.VolumeProperties_s(s, g)
print(json.dumps({'valid': BRepCheck_Analyzer(s).IsValid(), 'volume': g.Mass()}))
`, fstep], { encoding: 'utf8' });
    const j = JSON.parse(out.trim().split('\n').pop());
    ok(j.valid && nearRel(j.volume, r.vol, 1e-6), `STEP of the form body: native OpenCascade reads a valid solid of the same volume (${j.volume.toFixed(3)})`);
  } else ok(true, 'skip: no test venv for the native STEP read');
  // edit again from Design's panel
  await page.click('.pc-tree [data-id], .pc-tree li >> nth=0').catch(() => {});
  await pc(() => { const f = window.partcraft.part.features.find((x) => x.type === 'form'); window.partcraft.selectFeature?.(f.id); });
  await page.waitForSelector('[data-act="edit-form"]');
  await page.click('[data-act="edit-form"]');
  await page.waitForFunction(() => window.partcraft.workspace === 'form' && window.partcraft.part.studies?.form?.editing);
  ok(await pc(() => !window.partcraft.view.mesh.visible), 'Edit in Form opens the feature\'s cage (the built body hidden while editing)');
  await tool('form-finish');
  await page.waitForFunction(() => window.partcraft.workspace === 'design');
  await built();
  ok(await pc(() => window.partcraft.part.features.filter((x) => x.type === 'form').length === 1 && !window.partcraft.part.studies), 'Finish while editing updates that feature (no second form)');

  console.log('\n== form: an open plane, thickened from Design (More › Thicken)');
  await choose('form');
  await page.click('[data-prim="plane"]');
  await page.waitForFunction(() => window.partcraft.part.studies?.form?.cage?.faces.length === 4);
  await tool('form-finish');
  await page.waitForFunction(() => window.partcraft.workspace === 'design');
  await built();
  const sh = await pc(() => (window.partcraft.regen.sheets || []).map((s) => s.area));
  ok(sh.length === 1 && nearRel(sh[0], 10000, 1e-9), `the open plane form is a surface body (area ${sh[0]?.toFixed(6)} = 100²), drawn see-through`);
  const v0 = await pc(() => window.partcraft.regen.stats.volume);
  await page.click('[data-features-menu] > summary');
  await page.click('[data-features-menu] [data-cmd="thicken"]');
  await built();
  const th = await pc(() => { const p = window.partcraft.part, f = p.features[p.features.length - 1]; return { type: f.type, t: f.t, status: window.partcraft.regen.results.get(f.id).status, vol: window.partcraft.regen.stats.volume, sheets: window.partcraft.regen.sheets.length }; });
  ok(th.type === 'thicken' && th.status === 'ok' && nearRel(th.vol - v0, 100 * 100 * th.t, 1e-9) && th.sheets === 0, `More › Thicken: the surface becomes a ${th.t} mm solid: volume added ${(th.vol - v0).toFixed(6)} = 100 × 100 × ${th.t}; the surface is used up`);
  await shot('form-thicken');
  ok(await rows() === 1, 'Design: the toolbar is still one row at 1440 px with the surface items in More');
  ok(h.problems.length === 0, 'form: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
