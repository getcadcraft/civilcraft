#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * browser-simulation.mjs — the Simulation workspace in headless Chromium: a 100 × 10 × 10 steel cantilever set up by
 * clicks (New study, material, element size, Fixed on the left end face, Force on the right end face, direction),
 * solved in the compute worker; the tip deflection, stress and reactions in the panel match fea.js run in Node on the
 * same exact-kernel mesh; the plot colours the part, the legend's top equals the maximum, the hover probe reads
 * values, the deformed shape is an overlay with the part hidden; natural frequencies; Stop; the study saved in the
 * part file; one toolbar row; no console errors.
 *   node tools/partcraft-test/browser-simulation.mjs [--state /tmp/claude-0/pc-browser-state.json] [--out dir]
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(HERE, '../..');
const DEV = path.join(REPO, 'public_html/assets/apps/partcraft/dev/');

/** The cantilever as a part (front-plane rectangle 100 × 10, extruded 10). */
export async function cantileverPart(L = 100, H = 10, W = 10) {
  const S = await import(DEV + 'sketch.js'), P = await import(DEV + 'part.js');
  const part = P.newPart('Cantilever');
  const sk = S.newSketch(); S.addRect(sk, [0, 0], [L, H]);
  const s1 = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'front' }, sketch: sk });
  P.addFeature(part, 'extrude', { sketch: s1.id, op: 'add', end: 'blind', depth: W });
  return part;
}

/** Shared helpers: a screen point on the plane face with outward normal n, the Views menu. */
export function helpers(h) {
  const { page } = h;
  const facePoint = (n) => page.evaluate((n) => {
    const pcw = window.partcraft, view = pcw.view, THREE = pcw.host.THREE, rg = pcw.regen, m = rg.mesh;
    const fi = rg.faces.findIndex((f) => f.type === 'plane' && f.n[0] * n[0] + f.n[1] * n[1] + f.n[2] * n[2] > 0.999);
    if (fi < 0) return null;
    const rect = view.canvas.getBoundingClientRect();
    for (let t = 0; t < m.triFace.length; t++) {
      if (m.triFace[t] !== fi) continue;
      for (const w of [[1 / 3, 1 / 3, 1 / 3], [0.6, 0.2, 0.2], [0.2, 0.6, 0.2], [0.2, 0.2, 0.6]]) {
        const p = [0, 1, 2].map((c) => w[0] * m.positions[3 * m.indices[3 * t] + c] + w[1] * m.positions[3 * m.indices[3 * t + 1] + c] + w[2] * m.positions[3 * m.indices[3 * t + 2] + c]);
        const v = new THREE.Vector3(...p).project(view.camera);
        const x = rect.left + (v.x + 1) / 2 * rect.width, y = rect.top + (1 - v.y) / 2 * rect.height;
        if (x < rect.left + 4 || y < rect.top + 4 || x > rect.right - 4 || y > rect.bottom - 4) continue;
        const hit = view.pickAt(x, y, { edges: false });
        if (hit && hit.kind === 'face' && hit.face === fi) return { x, y, face: fi, name: rg.faces[fi].name };
      }
    }
    return null;
  }, n);
  const viewAs = async (name) => { await page.click('[data-views-menu] summary'); await page.click(`[data-views-menu] [data-cmd="view-${name}"]`); await page.waitForTimeout(100); };
  const rows = () => page.evaluate(() => new Set([...document.querySelectorAll('.pc-tools [role=group]')].filter((g) => !g.hidden).map((g) => g.offsetTop)).size);
  const choose = async (id) => { await page.selectOption('[data-workspace]', id); await page.waitForFunction((id) => window.partcraft.workspace === id, id); };
  const setNum = async (sel, v) => { await page.fill(sel, String(v)); await page.press(sel, 'Tab'); };
  return { facePoint, viewAs, rows, choose, setNum };
}

export async function run(h) {
  const { page, ok, pc, built, tool, shot } = h;
  const { facePoint, viewAs, rows, choose, setNum } = helpers(h);
  const near = (a, b, r) => Math.abs(a - b) <= r * Math.abs(b);

  console.log('\n== simulation: a cantilever set up by clicks');
  await pc(() => window.partcraft.exactReady());
  const part = await cantileverPart();
  await pc((t) => window.partcraft.openText(t, 'Cantilever.partcraft.json'), JSON.stringify(part));
  await built();
  await choose('simulation');
  ok((await rows()) === 1, 'Simulation: the toolbar is one row at 1440 px');
  ok(await page.isDisabled('.pc-tools [data-cmd="simulation-solve"]'), 'Solve is off before a study exists');
  await page.click('[data-sim-new]');
  await page.waitForFunction(() => !!window.partcraft.part.studies?.simulation);
  await page.selectOption('[data-sim-mesher]', 'voxel');   // this file checks the voxel mesh (new studies default to tets: browser-tet.mjs)
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.mesher === 'voxel');
  await page.selectOption('[data-sim-material]', 'steel');
  await setNum('[data-sim-size]', 2.5);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.h === 2.5 && window.partcraft.part.studies.simulation.material === 'steel');
  const est = Number(await page.getAttribute('[data-sim-estimate]', 'data-sim-estimate'));
  ok(est === 640, `material Steel and element size 2.5 mm from the panel; the estimate says ${est} cubes (exactly 640)`);
  // fixed: the left end face
  await viewAs('left');
  await tool('simulation-fixed');
  await page.waitForSelector('[data-sim-pick][aria-pressed="true"]');
  const left = await facePoint([-1, 0, 0]);
  ok(!!left, 'the left end face is on screen');
  await page.mouse.click(left.x, left.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.constraints[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  const c0 = await pc(() => window.partcraft.part.studies.simulation.constraints[0]);
  ok(c0.type === 'fixed' && c0.faces[0].name === left.name, `Fixed + a click on the end face: ${c0.faces[0].name}`);
  // force: the right end face, 100 N downwards
  await viewAs('right');
  await tool('simulation-force');
  const right = await facePoint([1, 0, 0]);
  await page.mouse.click(right.x, right.y);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.loads[0]?.faces.length === 1);
  await page.keyboard.press('Escape');
  await page.selectOption('[data-sim-dir]', '-y');
  await setNum('[data-sim-force]', 100);
  await page.waitForFunction(() => { const l = window.partcraft.part.studies.simulation.loads[0]; return l.total === 100 && Array.isArray(l.dir) && l.dir[1] === -1; });
  ok(true, 'Force + a click on the other end, 100 N down from the panel');
  await viewAs('iso');
  const markers = await pc(() => { const o = window.partcraft.view.overlays.get('simulation-markers'); let cones = 0, arrows = 0; o?.traverse((x) => { if (x.type === 'ArrowHelper') arrows++; else if (x.isMesh && x.geometry.type === 'ConeGeometry') cones++; }); return { cones, arrows }; });
  ok(markers.cones > 0 && markers.arrows > 0, `supports and loads are drawn in the view (${markers.cones} cones, ${markers.arrows} arrows)`);
  await shot('sim-setup');

  console.log('\n== simulation: solve, results, plots');
  ok(!(await page.isDisabled('.pc-tools [data-cmd="simulation-solve"]')), 'Solve is on once the study has a support and a load');
  await tool('simulation-solve');
  await page.waitForSelector('[data-sim-max-disp]', { timeout: 120000 });
  const got = await page.evaluate(() => ({ d: Number(document.querySelector('[data-sim-max-disp]').dataset.simMaxDisp), vm: Number(document.querySelector('[data-sim-max-vm]').dataset.simMaxVm), sf: Number(document.querySelector('[data-sim-safety]').dataset.simSafety), r: document.querySelector('[data-sim-reaction]').dataset.simReaction.split(',').map(Number) }));
  // the same study in Node on the same exact-kernel mesh
  const FE = await import(DEV + 'fea.js'), SIM = await import(DEV + 'sim.js'), B = await import(DEV + 'brep.js'), P = await import(DEV + 'part.js');
  await import(DEV + 'ws-simulation.js');   // registers the study reader
  const { default: init } = await import(path.join(REPO, 'public_html/assets/vendor/replicad-opencascadejs/current/replicad_single.js'));
  const oc = await init({ print: () => {}, printErr: () => {} });
  const saved = P.readPart(await pc(() => window.partcraft.host.P.toJSON(window.partcraft.part)));
  const rg = B.regenerateBrep(saved, oc);
  const { job } = SIM.simJob(saved.studies.simulation, rg);
  const ref = FE.solveStudy(job);
  ok(near(got.d, ref.maxDisp.value, 1e-6) && near(got.vm, ref.maxVm.value, 1e-6), `the panel's tip deflection ${got.d.toFixed(6)} mm and max stress ${got.vm.toFixed(3)} MPa equal fea.js in Node (${ref.maxDisp.value.toFixed(6)}, ${ref.maxVm.value.toFixed(3)})`);
  const I = 10 * 1000 / 12, eb = 100 * 1e6 / (3 * 200000 * I);
  ok(near(got.d, eb, 0.01), `and PL³/3EI = ${eb.toFixed(5)} mm within 1 % (${((got.d / eb - 1) * 100).toFixed(2)} %)`);
  ok(Math.abs(got.r[1] - 100) < 1e-4 && Math.abs(got.r[0]) < 1e-4, `reactions in the panel: ${got.r.map((v) => v.toFixed(4)).join(', ')} N (= the load)`);
  ok(near(got.sf, 250 / got.vm, 1e-9), 'safety factor = yield / max von Mises');
  const col = await pc(() => { const o = window.partcraft.view.overlays.get('simulation-plot'); return o && o.userData.simPlot === 'plot' && o.geometry.getAttribute('color') ? { tris: o.geometry.index.count / 3, part: window.partcraft.view.partVisible, partTris: window.partcraft.regen.mesh.indices.length / 3 } : null; });
  ok(col && col.part && col.tris > 100 * col.partTris, `the von Mises plot colours the part: per-vertex colours on its mesh split to the element size (${col && col.tris} triangles from ${col && col.partTris}), drawn over the part, which stays pickable`);
  await page.selectOption('[data-sim-plot]', 'disp');
  const tick = await page.evaluate(() => [...document.querySelectorAll('[data-sim-legend] .pc-sim-ticks span')].map((s) => Number(s.textContent)));
  ok(near(tick[4], got.d, 1e-3) && tick[0] === 0, `displacement plot: the legend runs 0 … ${tick[4]} mm (the maximum)`);
  // probe: hover the right end face (the tip)
  const tip = await facePoint([0, 1, 0]);
  await page.mouse.move(tip.x, tip.y);
  await page.waitForFunction(() => /Von Mises .* MPa, displacement .* mm/.test(document.querySelector('[data-sim-probe]').textContent));
  ok(true, 'hovering the part reads the result there: ' + (await page.textContent('[data-sim-probe]')));
  await shot('sim-displacement');
  await page.click('[data-sim-deformed]');
  await page.waitForFunction(() => window.partcraft.view.overlays.get('simulation-plot')?.userData.simPlot === 'deformed' && !window.partcraft.view.partVisible);
  const scale = Number(await page.inputValue('[data-sim-scale]'));
  ok(scale > 1, `deformed shape: an overlay, the part hidden, auto scale × ${scale}`);
  const root = await pc(() => { const v = window.partcraft.view, q = new window.partcraft.host.THREE.Vector3(8, 10, window.partcraft.regen.stats.bbox.min[2] + 5).project(v.camera), r = v.canvas.getBoundingClientRect(); return { x: r.left + (q.x + 1) / 2 * r.width, y: r.top + (1 - q.y) / 2 * r.height }; });
  await page.mouse.move(root.x, root.y + 1);
  await page.mouse.move(root.x, root.y);
  await page.waitForFunction(() => /Von Mises/.test(document.querySelector('[data-sim-probe]').textContent));
  ok(true, 'the probe reads the deformed overlay too');
  await shot('sim-deformed');
  await page.click('[data-sim-deformed]');
  await page.waitForFunction(() => window.partcraft.view.overlays.get('simulation-plot')?.userData.simPlot === 'plot' && window.partcraft.view.partVisible);

  console.log('\n== simulation: natural frequencies, stop, saving');
  await page.selectOption('[data-sim-kind]', 'modal');
  await page.click('[data-sim-solve]');
  await page.waitForSelector('[data-sim-f1]', { timeout: 120000 });
  const f1 = Number(await page.getAttribute('[data-sim-f1]', 'data-sim-f1'));
  const fe = 1.8751 ** 2 / (2 * Math.PI) * Math.sqrt(200000 * I / (7850e-12 * 100 * 1e8));
  ok(near(f1, fe, 0.03), `first natural frequency ${f1.toFixed(1)} Hz vs Euler–Bernoulli ${fe.toFixed(1)} Hz`);
  await shot('sim-modal');
  await page.selectOption('[data-sim-kind]', 'static');
  await setNum('[data-sim-size]', 0.5);
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.h === 0.5);
  await page.click('[data-sim-solve]');
  await page.waitForSelector('[data-sim-progress]');
  await page.click('[data-sim-stop]');
  await page.waitForFunction(() => /Stopped/.test(document.querySelector('[data-status]').textContent));
  ok(!(await page.isDisabled('[data-sim-solve]')), 'Stop ends a running solve; Solve is available again');
  const back = await pc(() => { const t = window.partcraft.host.P.toJSON(window.partcraft.part); const p = window.partcraft.host.P.readPart(t); return { v: JSON.parse(t).version, s: p.studies.simulation }; });
  ok(back.v === 3 && back.s.constraints.length === 1 && back.s.loads[0].total === 100 && back.s.h === 0.5, 'the study is saved in the part file (version 3) and reads back');
  await page.keyboard.press('Control+z');
  await page.waitForFunction(() => window.partcraft.part.studies.simulation.h === 2.5);
  ok(true, 'Ctrl+Z undoes a study change (element size back to 2.5)');
  await choose('design');
  ok(await pc(() => window.partcraft.view.partVisible && !window.partcraft.view.mesh.geometry.getAttribute('color') && !window.partcraft.view.overlays.size), 'back in Design: plain part, no overlays');
  ok(h.problems.length === 0, 'simulation: no console errors' + (h.problems.length ? ':\n    ' + h.problems.join('\n    ') : ''));
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const { startHarness, cliArgs } = await import('./browser-harness.mjs');
  const h = await startHarness(cliArgs());
  try { await run(h); } catch (err) { await h.failed(err); }
  await h.finish();
}
