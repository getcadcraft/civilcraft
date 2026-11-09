#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-plates-app.mjs — slabs and walls of a building model as plates, end to end without an app (0.8 SU.1056 step 2, concrete-08):
 * plate-bim.js (elements → plates in the raw frame), the solve, plate-draw.js (contours, deflected outlines, report table) and the
 * guards (CraftScript refuses plates; a frame-only model draws as before).
 *
 *   node tools/frame/test-plates-app.mjs [--verbose]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + name + (extra ? ' — ' + extra : '')); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);
const load = (f) => import(pathToFileURL(path.join(ROOT, f)).href);
const FM = await load('lib/frame/frame-model.js'), FS = await load('lib/frame/frame-solve.js'), PB = await load('lib/frame/plate-bim.js');
const FC = await load('lib/frame/frame-concrete.js'), PD = await load('lib/frame/plate-draw.js'), FD = await load('lib/frame/frame-draw.js'), FCR = await load('lib/frame/frame-craft.js');

// four 400 × 400 columns 3.5 m high at the corners of a 6 × 5 m slab
const base = () => ({
  format: FM.FORMAT, version: FM.VERSION, name: 'slab on columns',
  nodes: [[0, 0], [6000, 0], [6000, 5000], [0, 5000]].flatMap(([x, y], k) => [{ id: 'b' + k, x, y, z: 0 }, { id: 't' + k, x, y, z: 3500 }]),
  materials: [{ id: 'st', name: 'steel', E: 200000, G: 77000, rho: 7850 }],
  sections: [{ id: 'c', name: 'COL', A: 160000, Iy: 400 ** 4 / 12, Iz: 400 ** 4 / 12, J: 3.6e9 }],
  members: [0, 1, 2, 3].map((k) => ({ id: 'c' + k, i: 'b' + k, j: 't' + k, section: 'c', material: 'st', roll: 0 })),
  supports: [0, 1, 2, 3].map((k) => ({ node: 'b' + k, fix: [true, true, true, true, true, true] })),
  cases: [{ id: 'D', name: 'Dead', kind: 'dead', selfWeight: 0, loads: [] }], combos: [],
});
const slab = { id: 'S1', ref: 'Slab 1', outline: [[0, 0], [6000, 0], [6000, 5000], [0, 5000]], z: 3500, t: 200, points: [[0, 0], [6000, 0], [6000, 5000], [0, 5000]] };

console.log('Elements → plates');
{
  const raw = base();
  const r = PB.addPlates(raw, { slabs: [slab] }, { fc: 28, size: 500 });
  ok(r.plates > 20 && r.skipped.length === 0 && raw.plates.length === r.plates, 'a 6 × 5 m slab meshed into ' + r.plates + ' plates, none skipped');
  ok(raw.plates.every((p) => p.from?.ref === 'Slab 1' && p.material === r.material), 'every plate remembers its element and carries the concrete material');
  const mat = raw.materials.find((m) => m.id === r.material);
  ok(rel(mat.E, 4700 * Math.sqrt(28)) < 1e-12 && mat.rho === 2400 && rel(mat.G, mat.E / 2.4) < 1e-12, 'concrete material E = 4700 √f\'c, G = E / 2.4, 2400 kg/m³ added to the model');
  const tops = raw.nodes.filter((n) => n.id.startsWith('t')).length;
  ok(tops === 4 && raw.nodes.length - 8 === r.nodes, 'the slab\'s corner nodes are the columns\' own top nodes (merged within 1 mm): 4 stay 4');
  const bad = base();
  const r2 = PB.addPlates(bad, { slabs: [{ id: 'X', outline: [[0, 0], [1000, 1000], [1000, 0], [0, 1000]], z: 0, t: 100 }, slab] }, { size: 500 });
  ok(r2.skipped.length === 1 && r2.skipped[0].id === 'slab-X' && bad.plates.length === r2.plates && r2.plates > 0, 'a bow-tie outline is skipped with its reason; the next element is still made, and nothing half-made is left behind', JSON.stringify(r2.skipped));
  const dup = PB.addPlates(base(), { slabs: [slab, { ...slab, outline: [[0, 0], [1000, 0], [1000, 1000], [0, 1000]], points: [] }] }, { size: 500 });
  ok(dup.plates > 0 && dup.skipped.length === 0, 'two elements with the same id are both made (ids made unique)');
  const huge = PB.addPlates(base(), { slabs: [{ id: 'H', outline: [[0, 0], [60000, 0], [60000, 50000], [0, 50000]], z: 0, t: 200 }] }, { size: 100 });
  ok(huge.skipped.length === 1 && huge.skipped[0].why !== undefined && huge.plates === 0, 'a mesh over the plate limit is refused, not truncated', JSON.stringify(huge.skipped));
}

console.log('Solve, draw, report');
{
  const raw = base();
  PB.addPlates(raw, { slabs: [slab], walls: [{ id: 'W1', ref: 'Wall 1', from: [0, 0], to: [6000, 0], z0: 3500, z1: 6500, t: 200, openings: [{ u0: 2000, v0: 800, u1: 3000, v1: 2200 }] }] }, { size: 500 });
  raw.cases[0].loads.push(...raw.plates.filter((p) => p.id.startsWith('slab-S1')).map((p) => ({ type: 'area', plate: p.id, dir: 'Z', p: -0.005 })));      // 5 kPa
  raw.combos.push({ id: 'K', name: 'D', factors: [{ case: 'D', f: 1 }] });
  const m = FM.cleanFrame(raw).model;
  const sol = FS.solveFrame(m);
  ok(sol.ok, 'slab + wall on four columns solves');
  const R = sol.results['case:D'];
  ok(rel(-R.applied[2], 0.005 * 6000 * 5000) < 1e-9 && rel(R.reacted[2], 0.005 * 6000 * 5000) < 1e-6, 'the 5 kPa on 6 × 5 m = 150 kN is applied and reacted', (R.reacted[2] / 1000).toFixed(3));
  const sets = ['plateMx', 'plateMy', 'plateMxy', 'plateW'];
  for (const mode of sets) {
    const g = PD.plateGeometry(sol, 'case:D', mode, FD.RAMP);
    ok(g.max > 0 && g.tris.length === 18 * m.plates.length && g.triColors.length === g.tris.length && g.lines.length === 24 * m.plates.length && g.labels.length > 0 && g.labels.every((l) => typeof l.text === 'string'), 'contour ' + mode + ': two triangles per plate, coloured, labelled', 'max ' + g.max.toFixed(3) + ' ' + g.unit);
  }
  const w = PD.plateGeometry(sol, 'case:D', 'plateW', FD.RAMP);
  ok(w.max > 0.01 && w.max < 50, 'the slab deflection is a plausible few mm', w.max.toFixed(2) + ' mm');
  const geo = FD.resultGeometry(sol, 'case:D', { mode: 'plateMx' });
  ok(geo.mode === 'plateMx' && geo.tris.length > 0, 'frame-draw resultGeometry hands plate modes to plate-draw');
  const defl = FD.resultGeometry(sol, 'case:D', { mode: 'deflected' });
  ok(defl.lines.length >= 24 * m.plates.length && defl.scale > 0, 'deflected shape also moves the plates\' outlines');
  const t = (k) => k;
  const tabs = PD.plateTables(m, sol, 'case:D', t);
  ok(tabs.length === 2 && tabs[0].rows.length === 2 && tabs[0].rows.every((r) => r.length === tabs[0].head.length), 'report: one row per element (slab, wall), a table of method and limits');
  ok(tabs[0].rows.map((r) => r[0]).sort().join() === 'Slab 1,Wall 1', 'rows named by the element\'s own name');
  let refused = null;
  try { FCR.toCraftScript(m, {}); } catch (e) { refused = e.code; }
  ok(refused === 'no-plates', 'CraftScript refuses a model with plates (frame3d has none)');
}

console.log('Storey weight with plates');
{
  const raw = base();
  const r = PB.addPlates(raw, { slabs: [slab] }, { size: 500 });
  raw.cases[0].selfWeight = 1;
  raw.cases[0].loads.push(...raw.plates.map((p) => ({ type: 'area', plate: p.id, dir: 'Z', p: -0.005 })));
  raw.diaphragms = [{ id: 'F1', z: 3500 }];
  raw.materials[0] = { id: 'st', name: 'steel', E: 200000, G: 77000, rho: 7850 };
  const m = FM.cleanFrame(raw).model;
  const w = FC.floorWeights(m, [{ id: 'D', f: 1 }], [{ id: 'F1', z: 3500 }]);
  // hand: slab 0.2 m × 30 m² × 2400 kg/m³ × g = 141.2 kN; 5 kPa × 30 m² = 150 kN; the four steel columns 0.16 m² × 3.5 m × 7850 kg/m³ × g: half of each to the floor
  const slabW = 0.2 * 30 * 2400 * 9.80665, cols = 4 * 0.16 * 3.5 * 7850 * 9.80665;
  ok(w.ok && r.plates === 120 && rel(w.weights.F1, slabW + 150e3 + cols / 2) < 1e-9 && rel(w.ground, cols / 2) < 1e-9, 'slab own weight + 5 kPa + half the columns on the floor', (w.weights.F1 / 1000).toFixed(2) + ' kN');
}

console.log('A frame-only model is untouched');
{
  const m = FM.cleanFrame({ ...base(), cases: [{ id: 'D', name: 'D', kind: 'dead', selfWeight: 1, loads: [{ type: 'node', node: 't0', F: [10000, 0, -50000, 0, 0, 0] }] }] }).model;
  const sol = FS.solveFrame(m);
  const g = FD.resultGeometry(sol, 'case:D', { mode: 'deflected' });
  ok(sol.ok && g.lines.length > 0 && !m.plates && !m.diaphragms, 'frame-only draws members only, no plates key on the model');
  ok(PD.plateGeometry(sol, 'case:D', 'plateMx', FD.RAMP).tris.length === 0 && PD.plateTables(m, sol, 'case:D', (k) => k).length === 0, 'plate geometry and tables of a frame with no plates are empty');
  ok(typeof FCR.toCraftScript(m, {}) === 'string', 'CraftScript still made for it');
}

console.log('Floor pressure on every slab (0.9 SU.1056)');
{
  const raw = base();
  PB.addPlates(raw, { slabs: [slab] }, { fc: 28, size: 500 });
  const settings = [{ id: 'D', name: 'Dead', kind: 'dead', selfWeight: 0, loads: [{ type: 'floor', p: -0.005 }] }];
  const n = PB.floorLoadCases(raw, settings);
  ok(n === raw.plates.length && raw.cases[0].loads.length === n && raw.cases[0].loads.every((l) => l.type === 'area' && l.dir === 'Z' && l.p === -0.005), '5 kN/m² on the slab becomes one downward area load per plate (' + n + ')');
  const m = FM.cleanFrame(raw).model, sol = FS.solveFrame(m), R = sol.results['case:D'];
  ok(sol.ok && rel(R.reacted[2], 0.005 * 6000 * 5000) < 1e-6, 'the supports carry the whole pressure: 5 kN/m² × 30 m² = 150 kN', (R.reacted[2] / 1000).toFixed(3) + ' kN');
  const FP = await load('lib/frame/frame-panel.js');
  const clean = FP.cleanAnalysis({ cases: [{ id: 'D', name: 'D', kind: 'dead', loads: [{ type: 'floor', p: -0.005 }, { type: 'floor', p: 0 }, { type: 'floor', p: 'x' }, { type: 'floor', p: -1e9 }] }] });
  ok(clean.cases[0].loads.length === 1 && clean.cases[0].loads[0].p === -0.005, 'the settings keep a floor pressure and drop a zero, a non-number and an absurd one');
  const none = base(); const k = PB.floorLoadCases(none, settings);
  ok(k === 0 && none.cases[0].loads.length === 0, 'a model with no slabs gets no loads (the panel says so)');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
