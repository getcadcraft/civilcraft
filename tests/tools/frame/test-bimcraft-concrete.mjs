#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-bimcraft-concrete.mjs — BimCraft's side of the Concrete and Seismic blocks (0.8 SU.1056, session bim-analysis_PART_4):
 * analysis-bim.js analyses a concrete element as concrete (E = 4700 sqrt(f'c), cracked bending stiffness), makes the floors
 * rigid diaphragms, leaves a model with no concrete settings exactly as before, and sectionsOfElements feeds the Concrete block.
 *
 *   node tools/frame/test-bimcraft-concrete.mjs [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { register } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + name); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);
const BC = path.join(ROOT, 'public_html/assets/apps/bimcraft/dev');
register('data:text/javascript,' + encodeURIComponent(`export async function resolve(spec, ctx, next) {
  if (spec === 'manifold-3d') return { url: ${JSON.stringify(pathToFileURL(path.join(ROOT, 'public_html/assets/vendor/manifold-3d/current/manifold.js')).href)}, shortCircuit: true };
  return next(spec, ctx);
}`), import.meta.url);
const bl = (f) => import(pathToFileURL(path.join(BC, f)).href);
(await bl('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(BC, 'lang/en.json'), 'utf8')) });
const AB = await bl('analysis-bim.js'), FPN = await bl('frame/frame-panel.js'), FS = await bl('frame/frame-solve.js'), FC = await bl('frame/frame-concrete.js');
const { t } = await bl('i18n.js');

const b = 400, I = b ** 4 / 12;
const sec = { name: 'C400', A: b * b, Iy: I, Iz: I, J: 0.141 * b ** 4 };
const mat = { name: 'Concrete', kind: 'concrete', E: 25000, G: 10400, rho: 2400 };
const U = [1, 0, 0], V = [0, 1, 0];
const col = (k, x, y, z0, z1) => ({ id: 10 + k, gid: 'COL' + k, cls: 'IfcColumn', type: 'column', name: 'Col ' + k, a: [x, y, z0], b: [x, y, z1], U, V, sec, size: b, mat });
const bm = (k, x0, x1, z) => ({ id: 20 + k, gid: 'BM' + k, cls: 'IfcBeam', type: 'beam', name: 'Beam ' + k, a: [x0, 0, z], b: [x1, 0, z], U, V, sec: { ...sec, name: 'B300' }, size: 300, mat });
const elements = [col(1, 0, 0, 0, 3500), col(2, 6000, 0, 0, 3500), col(3, 0, 0, 3500, 7000), col(4, 6000, 0, 3500, 7000), bm(1, 0, 6000, 3500), bm(2, 0, 6000, 7000)];
const A0 = FPN.defaultAnalysis((k) => k);

console.log('No concrete settings: as before');
{
  const f = AB.frameOfElements(elements, A0, {});
  const m0 = f.model.materials[0], s0 = f.model.sections.find((s) => s.name === 'C400');
  ok(m0.E === 25000 && !f.model.diaphragms?.length, 'the IFC material is kept and there are no diaphragms', JSON.stringify(m0));
  ok(rel(s0.Iy, I) < 1e-12, 'the section is gross');
}

console.log('With concrete settings');
{
  const A = FPN.cleanAnalysis({ ...A0, concrete: { mat: { fc: 30, cracked: true }, forms: {}, floors: [{ id: 'f1', name: 'Level 1', z: 3500, w: 0 }, { id: 'f2', name: 'Roof', z: 7000, w: 0 }] } });
  ok(A.concrete && A.concrete.floors.length === 2, 'cleanAnalysis keeps the concrete settings');
  const f = AB.frameOfElements(elements, A, {});
  const m = f.model;
  ok(m.materials.length === 1 && rel(m.materials[0].E, 4700 * Math.sqrt(30)) < 1e-12 && m.materials[0].rho === 2400, 'one concrete material, E = 4700 sqrt(30) (ACI 318-19 19.2.2.1.b)');
  const sc = m.sections.find((s) => s.name === 'C400'), sb = m.sections.find((s) => s.name === 'B300');
  ok(rel(sc.Iy, 0.7 * I) < 1e-9 && rel(sb.Iy, 0.35 * I) < 1e-9, 'columns 0.70 Ig, beams 0.35 Ig (Table 6.6.3.1.1(a))', sc.Iy / I + ' ' + sb.Iy / I);
  ok(sc.A === b * b, 'area is not reduced');
  ok(m.diaphragms.length === 2 && m.diaphragms[0].z === 3500, 'the two floors are rigid diaphragms');
  ok(f.notes.some((n) => n.key === 'frame.note.concrete-cracked' && n.n === 6), 'the note says six members use cracked stiffness');
  const sol = FS.solveFrame(m);
  ok(sol && sol.results, 'the model solves with diaphragms');
  // gross vs cracked: a sideways load on the top is moved further by the cracked frame
  const lat = (conc) => { const f2 = AB.frameOfElements(elements, FPN.cleanAnalysis({ ...A0, concrete: { ...A.concrete, mat: { ...A.concrete.mat, cracked: conc } }, cases: [{ id: 'W', name: 'Push', kind: 'wind', selfWeight: 0, loads: [{ type: 'node', at: [0, 0, 7000], F: [10000, 0, 0, 0, 0, 0] }] }], combos: [] }), {});
    const s = FS.solveFrame(f2.model); const k = f2.model.nodes.findIndex((n) => n.z === 7000 && n.x === 0); return Math.abs(s.results['case:W'].u[6 * k]); };
  const dg = lat(false), dc = lat(true);
  ok(Number.isFinite(dg) && Number.isFinite(dc) && dc > dg * 1.3, 'cracked stiffness moves the roof further than gross', dg + ' ' + dc);
}

console.log('Sections for the Concrete block');
{
  const s = AB.sectionsOfElements(elements);
  ok(s.length === 2 && s.some((x) => x.name === 'C400' && x.A === b * b), 'one entry per section name, with A, Iy, Iz');
  const R = FC.rcOf(FC.cleanConcrete({ forms: { C400: { b, h: b, cover: 40, role: 'column', bottom: { n: 4, d: 20 }, top: { n: 4, d: 20 }, cage: { ny: 3, nz: 3, d: 20 }, tie: { legs: 2, d: 10, s: 200 } } } }), AB.frameOfElements(elements, A0, {}).model);
  ok(R && typeof R === 'object', 'rcOf takes the BimCraft model (section name picks the form)');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
