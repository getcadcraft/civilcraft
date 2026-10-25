/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-assembly-tools.mjs — Measure (in a part, in another workspace, in an assembly), Mass properties, the BOM and its CSV,
 * part properties, an exploded view (a step by the panel, the slider, saved without touching the placement), dragging an
 * unjoined part with the gizmo, typed moves, and the whole-assembly STEP — all by real clicks and keys.
 *   node tools/partcraft-test/browser-assembly-tools.mjs [--state file] [--out dir]   (or run(h) from browser.mjs)
 * Temporary files go to tmp/partcraft-assembly/.
 */
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const TMP = path.join(REPO, 'tmp/partcraft-assembly');
const PY = path.join(REPO, 'tools/partcraft-test/venv/bin/python');

export async function run(h) {
  const { page, ok, pc, shot } = h;
  fs.mkdirSync(TMP, { recursive: true });
  const PI = Math.PI;
  const rows = () => page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
  const scr = (p) => pc((q) => { const v = window.partcraft.view, T = window.partcraft.host.THREE; const r = v.canvas.getBoundingClientRect(); const s = new T.Vector3(q[0], q[1], q[2]).project(v.camera); return [r.left + (s.x + 1) / 2 * r.width, r.top + (1 - s.y) / 2 * r.height]; }, p);
  const clickAt = async (p, opts = {}) => { const [x, y] = await scr(p); await page.mouse.click(x, y, opts); };
  const menu = async (summarySel, cmd) => { await page.click(summarySel + ' > summary'); await page.click(`${summarySel} [data-cmd="${cmd}"]`); };
  const card = () => page.textContent('[data-measure]').catch(() => '');
  const cardRow = (label) => page.evaluate((l) => { const dl = document.querySelector('[data-measure] dl'); if (!dl) return null; const dts = [...dl.querySelectorAll('dt')]; const i = dts.findIndex((d) => d.textContent === l); return i < 0 ? null : dl.querySelectorAll('dd')[i].textContent; }, label);
  const settle = async () => { await page.waitForTimeout(120); await page.waitForFunction(() => !document.querySelector('[data-measure]')?.textContent.includes('Working it out'), null, { timeout: 20000 }); };
  const waitDownload = async (fn) => { const [d] = await Promise.all([page.waitForEvent('download'), fn()]); const f = path.join(TMP, d.suggestedFilename()); await d.saveAs(f); return f; };

  console.log('\n== assembly tools: Measure in a part');
  await pc((t) => window.partcraft.openText(t, 'Flange16.partcraft.json'), JSON.stringify(h.F.flange({ holeD: 16 }).part));
  await pc(() => window.partcraft.exactReady());
  await h.built();
  await pc(() => { window.partcraft.view.view('iso'); });
  await page.waitForTimeout(150);
  // two neighbouring holes: their top rims (circles on y = 30)
  const rims = await pc(() => {
    const r = window.partcraft.regen;
    const E = r.edges.map((e, i) => ({ ...e, i })).filter((e) => e.type === 'circle' && /wall/.test(e.key) && Math.abs(e.at[1] - 30) < 1e-6);
    const c = (e) => [(e.a[0] + e.at[0]) / 2, 30, (e.a[2] + e.at[2]) / 2];
    const list = E.map((e) => ({ i: e.i, at: e.at, c: c(e), ang: Math.atan2(c(e)[2], c(e)[0]) })).sort((p, q) => p.ang - q.ang);
    // the two nearest the viewer (+X +Z side)
    list.sort((p, q) => (q.c[0] + q.c[2]) - (p.c[0] + p.c[2]));
    return list.slice(0, 2);
  });
  ok(rims.length === 2, 'the flange has its hole rims on the top face');
  await menu('[data-views-menu]', 'view-measure');
  ok(await page.isVisible('[data-measure]') && /Click a vertex, edge or face/.test(await card()), 'Views › Measure opens the Measure card');
  await clickAt(rims[0].at); await settle();
  ok((await cardRow('Diameter')) === '16 mm' && (await cardRow('Edge')) === 'Circle', 'a click on a hole\'s rim: circle, diameter 16 mm (exact)');
  await clickAt(rims[1].at); await settle();
  const pitch = 2 * 75 * Math.sin(PI / 8);
  const dist = parseFloat(await cardRow('Minimum distance')), cc = parseFloat(await cardRow('Centre to centre'));
  ok(Math.abs(dist - (pitch - 16)) < 1e-4 && Math.abs(cc - pitch) < 1e-4 && !/approximate/.test(await cardRow('Minimum distance')), `the second rim: minimum distance ${dist} = 2·75·sin(π/8) − 16 (exact, OpenCascade), centre to centre ${cc}`);
  ok(await pc(() => !!window.partcraft.view.overlays.get('measure')), 'the closest points and their line are drawn');
  await h.ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: h.BASE });
  await page.click('[data-measure-copy]');
  await page.waitForTimeout(150);
  const clip = await pc(() => navigator.clipboard.readText().catch(() => ''));
  ok(/Minimum distance\t41\.40/.test(clip) && /Centre to centre/.test(clip), 'Copy puts the results on the clipboard, tab-separated');
  await page.keyboard.press('Escape');
  ok(/Click a vertex, edge or face/.test(await card()), 'Esc clears the picks');
  // centre snaps (screen space, over the hole's opening)
  await clickAt(rims[0].c); await settle();
  ok((await cardRow('1: Picked'))?.startsWith('Circle centre') || (await cardRow('Picked'))?.startsWith('Circle centre'), 'a click over a hole snaps to its centre');
  await clickAt(rims[1].c); await settle();
  ok(Math.abs(parseFloat(await cardRow('Minimum distance')) - pitch) < 1e-4 && (await cardRow('ΔY')) === '0 mm', `centre to centre ${pitch.toFixed(4)}, ΔY 0`);
  await shot('asm-tools-measure-part');
  // mass properties with a material
  await page.click('[data-measure-mass]'); await settle();
  await page.selectOption('[data-measure-material]', { label: 'Steel (A36) (7.85 g/cm³)' }); await settle();
  const V16 = PI * ((10000 - 1156) * 30 + (50 / 3) * (2704 + 2080 + 1600) - 1156 * 50) - 8 * PI * 64 * 30;
  const mass = await cardRow('Mass');
  ok(mass === String(Number((7.85 * V16 / 1e6).toFixed(4))) + ' kg' && /Exact/.test(await cardRow('Method')), `Mass properties, steel: ${mass} = 7.85·V/10⁶ kg (V exact), method exact`);
  const com = (await cardRow('Centre of mass')).split(',').map(Number);
  ok(Math.abs(com[0]) < 1e-3 && Math.abs(com[2]) < 1e-3 && com[1] > 0 && com[1] < 40, `centre of mass on the axis (${com.map((v) => v.toFixed(3)).join(', ')})`);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  ok(!(await page.isVisible('[data-measure]')) && !(await pc(() => window.partcraft.view.overlays.has('measure'))), 'Esc twice closes Measure and its marks');
  // M key + another workspace
  await page.selectOption('[data-workspace]', 'simulation');
  await page.click('[data-gl]', { position: { x: 5, y: 5 } }).catch(() => {});
  await page.keyboard.press('m');
  ok(await page.isVisible('[data-measure]'), 'M opens Measure in the Simulation workspace');
  await clickAt(rims[0].c); await settle(); await clickAt(rims[1].c); await settle();
  ok(Math.abs(parseFloat(await cardRow('Minimum distance')) - pitch) < 1e-4, 'Measure works there too (same centre distance)');
  ok((await rows()) === 1, 'Simulation: toolbar one row at 1440 px with Measure open');
  await page.selectOption('[data-workspace]', 'design');
  ok(!(await page.isVisible('[data-measure]')), 'switching workspace closes Measure');
  ok((await rows()) === 1, 'Design: toolbar still one row at 1440 px (Measure lives in the Views menu)');

  console.log('\n== assembly tools: assembly, measure, BOM');
  await h.tool('asm-new');
  await pc(() => window.partcraft.asmBuilt());
  await h.tool('asm-insert-copy');
  await pc(() => window.partcraft.asmBuilt());
  await page.waitForTimeout(200);
  const asm0 = await pc(() => ({ insts: window.partcraft.asm.instances.map((i) => ({ id: i.id, place: i.place })) }));
  const dx = asm0.insts[1].place[12] - asm0.insts[0].place[12];
  await pc(() => window.partcraft.view.fit());
  await page.waitForTimeout(150);
  await page.keyboard.press('m');
  await clickAt(rims[0].c); await settle();
  await clickAt([rims[0].c[0] + dx, rims[0].c[1], rims[0].c[2]]); await settle();
  const d2 = parseFloat(await cardRow('Minimum distance'));
  ok(Math.abs(d2 - Math.abs(dx)) < 1e-4 && /on Flange/.test(await card()), `in the assembly: the same hole centre on the two copies is ${d2} apart = the copy's offset ${dx}`);
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');
  // BOM: no selection shows it
  await page.keyboard.press('Escape');
  await page.waitForSelector('[data-bom]');
  const bom = await page.$$eval('[data-bom] tbody tr', (trs) => trs.map((tr) => [...tr.children].map((td) => td.textContent)));
  ok(bom.length === 1 && bom[0][1] === '2' && bom[0][3] === 'Flange', 'the BOM in the panel: Flange × 2');
  // part properties on the selected part
  await page.click('[data-tree] [data-inst="' + asm0.insts[1].id + '"]');
  await page.fill('[data-part-number]', 'FL-16, "rev A"'); await page.press('[data-part-number]', 'Enter');
  await page.waitForTimeout(150);
  await page.selectOption('[data-part-material]', 'Stainless steel 304');
  await pc(() => window.partcraft.asmBuilt());
  const props = await pc(() => { const a = window.partcraft.asm; return a.parts[a.instances[0].part]; });
  ok(props.number === 'FL-16, "rev A"' && props.material.density === 8, 'part number and material set in the panel (shared by both copies)');
  await page.keyboard.press('Escape');
  await page.waitForSelector('[data-bom]');
  const bom2 = await page.$$eval('[data-bom] tbody tr td', (tds) => tds.map((t) => t.textContent));
  ok(bom2[2] === 'FL-16, "rev A"' && bom2[4] === 'Stainless steel 304' && Math.abs(parseFloat(bom2[5]) - 8 * V16 / 1000) < 1e-2, 'the BOM shows the number, material and mass each');
  const csvFile = await waitDownload(() => page.click('[data-bom-csv]'));
  const csv = fs.readFileSync(csvFile, 'utf8');
  ok(csv.startsWith('﻿') && csv.includes('"FL-16, ""rev A"""') && /\r\n1,2,/.test(csv) && /Total/.test(csv), 'Download CSV: quoted part number with doubled quotes, item 1 × 2, a total row');
  // Mass properties of the whole assembly
  await menu('[data-views-menu]', 'view-mass'); await settle();
  ok((await cardRow('Of')) === '2 parts' && (await cardRow('Mass')) === String(Number((2 * 8 * V16 / 1e6).toFixed(4))) + ' kg', 'Mass properties of the assembly: 2 parts, 2 × 8·V/10⁶ kg');
  await page.keyboard.press('Escape'); await page.keyboard.press('Escape');

  console.log('\n== assembly tools: exploded view');
  await page.keyboard.press('Escape');
  await page.click('[data-explode-new]');
  await page.click(`[data-step-inst="${asm0.insts[1].id}"] input`);
  await page.selectOption('[data-step-dir]', 'y');
  await page.fill('[data-step-dist]', '100'); await page.press('[data-step-dist]', 'Enter');
  await page.click('[data-step-add]');
  await pc(() => window.partcraft.asmBuilt());
  await page.waitForTimeout(150);
  const shownY = () => pc((id) => window.partcraft.view.instances.find((o) => o.id === id).matrix[13], asm0.insts[1].id);
  ok(Math.abs((await shownY()) - (asm0.insts[1].place[13] + 100)) < 1e-9 && (await page.$$('[data-explode-steps] li')).length === 1, 'a step (copy 2, +Y, 100) by the panel: drawn 100 higher');
  ok(await pc(() => !!window.partcraft.view.overlays.get('asm-trails')), 'its trail line is drawn');
  await page.locator('[data-explode-slider]').fill('0.25');
  await page.waitForTimeout(100);
  ok(Math.abs((await shownY()) - (asm0.insts[1].place[13] + 25)) < 1e-9, 'slider at 0.25: drawn 25 up (collapse ↔ explode)');
  const realY = await pc((id) => window.partcraft.asm.instances.find((i) => i.id === id).place[13], asm0.insts[1].id);
  ok(realY === asm0.insts[1].place[13], 'the real placement did not move');
  const asmFile = await waitDownload(() => page.keyboard.press('Control+s'));
  const saved = JSON.parse(fs.readFileSync(asmFile, 'utf8'));
  ok(saved.version === 2 && saved.views.length === 1 && saved.views[0].steps[0].dist === 100 && saved.instances[1].place[13] === asm0.insts[1].place[13], 'saved: version 2 with the view and its step; the place is unchanged');
  await shot('asm-tools-explode');
  // the assembly drawing shows the exploded view
  const pdf = await waitDownload(() => page.click('[data-asm-drawing]'));
  if (spawnSync('which', ['pdftotext']).status === 0) {
    const txt = spawnSync('pdftotext', ['-layout', pdf, '-'], { encoding: 'utf8' }).stdout;
    ok(/exploded: Exploded 1/.test(txt) && txt.includes('FL-16') && txt.includes('Stainless steel 304') && /Part number/.test(txt), 'Drawing (PDF): the exploded isometric, balloons and the BOM table');
  } else ok(fs.statSync(pdf).size > 1000, 'Drawing (PDF) downloaded');
  await page.selectOption('[data-explode-view]', '');
  await pc(() => window.partcraft.asmBuilt());

  console.log('\n== assembly tools: moving by hand');
  await page.click('[data-tree] [data-inst="' + asm0.insts[1].id + '"]');
  await page.fill('[data-move="z"]', '-30');
  await page.click('[data-move-go]');
  await pc(() => window.partcraft.asmBuilt());
  const p1 = await pc((id) => window.partcraft.asm.instances.find((i) => i.id === id).place, asm0.insts[1].id);
  ok(Math.abs(p1[14] - (asm0.insts[1].place[14] - 30)) < 1e-9, 'typed move ΔZ −30');
  await page.click('[data-drag-move]');
  await page.waitForTimeout(150);
  ok(await pc(() => !!window.partcraft.view.overlays.get('asm-gizmo')), 'Drag to move shows the arrow gizmo');
  // drag the X arrow: a point along +X from the gizmo's centre, moved along the arrow's screen direction
  const g = await pc((id) => {
    const v = window.partcraft.view, cam = v.camera, T = window.partcraft.host.THREE;
    const o = v.instances.find((x) => x.id === id);
    const bb = new T.Box3().setFromBufferAttribute(o.mesh.geometry.attributes.position).applyMatrix4(new T.Matrix4().fromArray(o.matrix));
    const c = bb.getCenter(new T.Vector3());
    const factor = (cam.top - cam.bottom) / cam.zoom * 0.9 / 4;
    const r = v.canvas.getBoundingClientRect();
    const sp = (p) => { const s = p.clone().project(cam); return [r.left + (s.x + 1) / 2 * r.width, r.top + (1 - s.y) / 2 * r.height]; };
    const a = sp(c.clone().add(new T.Vector3(0.4 * factor, 0, 0))), b = sp(c.clone().add(new T.Vector3(0.4 * factor + 40, 0, 0)));
    return { a, b, pxPerMm: Math.hypot(b[0] - a[0], b[1] - a[1]) / 40 };
  }, asm0.insts[1].id);
  const before = p1[12];
  const dpx = 100, ux = (g.b[0] - g.a[0]) / (g.pxPerMm * 40), uy = (g.b[1] - g.a[1]) / (g.pxPerMm * 40);
  await page.mouse.move(g.a[0], g.a[1]);
  await page.waitForTimeout(50);
  await page.mouse.down();
  for (let k = 1; k <= 10; k++) await page.mouse.move(g.a[0] + ux * dpx * k / 10, g.a[1] + uy * dpx * k / 10);
  await page.mouse.up();
  await pc(() => window.partcraft.asmBuilt());
  await page.waitForTimeout(150);
  const p2 = await pc((id) => window.partcraft.asm.instances.find((i) => i.id === id).place, asm0.insts[1].id);
  const moved = p2[12] - before, want = dpx / g.pxPerMm;
  // TransformControls maps the pointer through its own drag plane, so the amount is of the order of the screen distance, not equal to it
  const drawn = await pc((id) => window.partcraft.view.instances.find((o) => o.id === id).matrix, asm0.insts[1].id);
  ok(moved > 0.5 * want && moved < 2 * want && Math.abs(p2[13] - p1[13]) < 1e-6 && Math.abs(p2[14] - p1[14]) < 1e-6 && drawn.every((v, k) => Math.abs(v - p2[k]) < 1e-9), `dragging the X arrow ${dpx} px moved the part ${moved.toFixed(2)} mm along X only (screen distance ≈ ${want.toFixed(2)} mm); drawn where it is saved`);
  const undo = await pc(() => window.partcraft.asmHist.undoStack.at(-1)?.label);
  ok(/by hand/.test(undo || ''), 'the drag is one undo step ("Move by hand")');
  await page.keyboard.press('Escape');
  ok(!(await pc(() => window.partcraft.view.overlays.has('asm-gizmo'))), 'Esc removes the gizmo');
  await shot('asm-tools-moved');

  console.log('\n== assembly tools: whole-assembly STEP');
  const step = await waitDownload(() => menu('[data-export-menu]', 'export-step'));
  const hasOcp = fs.existsSync(PY) && spawnSync(PY, ['-c', 'import OCP'], { encoding: 'utf8' }).status === 0;
  if (hasOcp) {
    const out = spawnSync(PY, ['-c', `
import sys, json
from OCP.STEPControl import STEPControl_Reader
from OCP.GProp import GProp_GProps
from OCP.BRepGProp import BRepGProp
from OCP.TopExp import TopExp_Explorer
from OCP.TopAbs import TopAbs_SOLID
from OCP.BRepCheck import BRepCheck_Analyzer
r = STEPControl_Reader(); r.ReadFile(sys.argv[1]); r.TransferRoots(); s = r.OneShape()
n = 0; e = TopExp_Explorer(s, TopAbs_SOLID)
while e.More(): n += 1; e.Next()
g = GProp_GProps(); BRepGProp.VolumeProperties_s(s, g)
print(json.dumps({'n': n, 'v': g.Mass(), 'ok': BRepCheck_Analyzer(s).IsValid()}))
`, step], { encoding: 'utf8' });
    const j = JSON.parse(out.stdout.trim().split('\n').pop());
    ok(j.ok && j.n === 2 && Math.abs(j.v - 2 * V16) / (2 * V16) < 1e-9, `Export › STEP in the assembly: native OpenCascade reads 2 valid solids, volume 2V (${j.v.toFixed(3)})`);
  } else ok(fs.readFileSync(step, 'utf8').startsWith('ISO-10303-21;'), 'Export › STEP in the assembly downloaded');
  ok((await rows()) === 1, 'assembly: toolbar one row at 1440 px');

  // back to a plain part in Design
  await pc(() => { window.partcraft.asmHist.clear(); });
  page.once('dialog', (d) => d.accept());
  await h.tool('asm-close');
  const dlg = await page.$('dialog[open] button[value="discard"], dialog[open] [data-key="discard"]');
  if (dlg) await dlg.click();
  else { const b = await page.$('dialog[open] button:has-text("Discard")'); if (b) await b.click(); }
  await page.waitForTimeout(200);
  ok(await pc(() => window.partcraft.mode === 'model' && !document.querySelector('dialog[open]')), 'assembly closed, back on the part');
  ok(h.problems.length === 0, 'assembly tools: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./rel-browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
