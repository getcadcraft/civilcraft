#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-dc-concrete.mjs — DetailCraft's analysis with concrete sections and floors (0.8 SU.1056, concrete-08): analysis.js frameOf turns a
 * profile with a concrete form into concrete (E = 4700 √f'c, 2400 kg/m³, cracked bending stiffness), the floors into rigid diaphragms,
 * and the seismic cases made from them solve end to end. A two-storey frame of plate profiles (PL400x400 columns, PL300x600 beams).
 *
 *   node tools/frame/test-dc-concrete.mjs [--verbose]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DC = path.join(ROOT, 'public_html/assets/apps/detailcraft/dev');
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, name, extra = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + name + (extra ? ' — ' + extra : '')); } else { fail++; console.log('  FAIL ' + name + (extra ? ' — ' + extra : '')); } };
const rel = (a, b) => Math.abs(a - b) / Math.max(Math.abs(b), 1e-300);
const dl = (f) => import(pathToFileURL(path.join(DC, f)).href);
(await dl('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(DC, 'lang/en.json'), 'utf8')) });
const { Model } = await dl('model.js'), AN = await dl('analysis.js'), FC = await dl('frame/frame-concrete.js'), RD = await dl('frame/rc-design.js'), GEN = await dl('frame/frame-combos.js');

const model = new Model();
model.change('frame', (tx) => {
  const P = [[0, 0], [6000, 0], [6000, 5000], [0, 5000]];
  for (const [z0, z1] of [[0, 3500], [3500, 7000]]) P.forEach(([x, y]) => tx.addMember({ type: 'column', profile: 'PL400x400', start: [x, y, z0], end: [x, y, z1] }));
  for (const z of [3500, 7000]) P.forEach(([x, y], k) => { const [x2, y2] = P[(k + 1) % 4]; tx.addMember({ type: 'beam', profile: 'PL300x600', start: [x, y, z], end: [x2, y2, z] }); });
});
const state = model.state;
// a plate profile PL300x600 is 300 thick × 600 wide; which of b, h lies along the member's local y comes out of its own Iy, as the panel's "Set up" does
const pl = AN.sectionsOf(state).find((s) => s.name === 'PL300x600'), hB = Math.sqrt(12 * pl.Iy / pl.A), bB = pl.A / hB;
const forms = { PL400X400: { b: 400, h: 400, cover: 60, cage: { ny: 3, nz: 3, d: 25 }, tie: { legs: 2, d: 10, s: 100 } }, PL300X600: { b: Math.round(bB), h: Math.round(hB), cover: 60, top: { n: 2, d: 16 }, bottom: { n: 3, d: 20 }, tie: { legs: 2, d: 10, s: 150 } } };
const floors = [{ id: 'F1', name: 'F1', z: 3500, w: 3000 }, { id: 'F2', name: 'F2', z: 7000, w: 2000 }];
const base = AN.cleanAnalysis({ ...AN.ANALYSIS_DEFAULTS(), concrete: { forms, floors } });

console.log('Sections and settings');
{
  const secs = AN.sectionsOf(state);
  ok(secs.length === 2 && secs.map((s) => s.name).sort().join() === 'PL300x600,PL400x400', 'sectionsOf: the two profiles the members use');
  const sq = secs.find((s) => s.name === 'PL400x400'), h = Math.sqrt(12 * sq.Iy / sq.A);
  ok(rel(sq.A, 160000) < 1e-3 && rel(h, 400) < 1e-3, 'a rectangle is recovered from A and Iy: h = √(12 Iy / A) = 400 mm', h.toFixed(2));
  ok(AN.cleanAnalysis(AN.ANALYSIS_DEFAULTS()).concrete === undefined, 'an analysis with no concrete settings keeps none (older files unchanged)');
  ok(base.concrete.floors.length === 2 && base.concrete.forms.PL400X400.cage.d === 25, 'cleanAnalysis keeps the concrete settings');
  ok(AN.cleanAnalysis({ ...base, cases: [{ id: 'EX1', name: 'x', kind: 'seismic', gen: 'elf', loads: [] }] }).cases[0].gen === 'elf', 'a seismic case keeps the mark of the ELF generator');
}

console.log('The model that is analysed');
{
  const steel = AN.frameOf(state, AN.cleanAnalysis(AN.ANALYSIS_DEFAULTS()));
  ok(steel.model.materials.length === 1 && steel.model.materials[0].E === 200000 && !steel.model.diaphragms, 'no concrete settings: steel as before, no diaphragms');
  const f = AN.frameOf(state, base);
  const M = f.model, E = 4700 * Math.sqrt(28);
  ok(M.materials.length === 1 && rel(M.materials[0].E, E) < 1e-12 && rel(M.materials[0].G, E / 2.4) < 1e-12 && M.materials[0].rho === 2400, 'concrete members: E = 4700 √f\'c = 24 870 MPa, G = E / 2.4, 2400 kg/m³ (ACI 19.2.2.1.b)', M.materials[0].E.toFixed(0));
  const col = M.sections.find((s) => s.name === 'PL400x400'), beam = M.sections.find((s) => s.name === 'PL300x600');
  ok(rel(col.Iy, 0.7 * 400 ** 4 / 12) < 1e-3 && rel(col.A, 160000) < 1e-3, 'columns: 0.70 Ig, full area (Table 6.6.3.1.1(a))', col.Iy.toExponential(3));
  ok(M.sections.filter((s) => s.name === 'PL300x600').length === 1 && (rel(beam.Iy, 0.35 * 300 * 600 ** 3 / 12) < 1e-3 || rel(beam.Iy, 0.35 * 600 * 300 ** 3 / 12) < 1e-3), 'beams: 0.35 Ig');
  const gross = AN.frameOf(state, AN.cleanAnalysis({ ...base, concrete: { ...base.concrete, mat: { ...base.concrete.mat, cracked: false } } })).model;
  ok(rel(gross.sections.find((s) => s.name === 'PL400x400').Iy, 400 ** 4 / 12) < 1e-3, 'gross sections when the setting says so');
  ok(M.diaphragms.length === 2 && M.diaphragms.every((d) => d.nodes.length === 4), 'two floors → two rigid diaphragms of four nodes');
  ok(f.notes.some((n) => n.key === 'frame.note.concrete-cracked' && n.n === 16) && f.notes.some((n) => n.key === 'frame.note.concrete'), 'the assumptions say so: 16 members cracked, concrete material');
}

console.log('Seismic cases, check and drift');
{
  const f0 = AN.frameOf(state, base);
  const made = FC.seismicCases(f0, base.concrete);
  ok(made.ok && made.cases.length === 4, 'four seismic cases from the floors\' weights');
  const gen = GEN.generateCombos('asce-aisc', [{ id: 'D', kind: 'dead' }, { id: 'L', kind: 'live' }, ...made.cases.map((c) => ({ id: c.id, kind: 'seismic' }))], {});
  const A = AN.cleanAnalysis({ ...base, cases: [...base.cases, ...made.cases], combos: gen.combos });
  ok(A.cases.length === 6 && A.cases.filter((c) => c.gen === 'elf').length === 4 && A.cases.find((c) => c.id === 'EX1').loads.length === 2, 'the cases survive cleanAnalysis (node loads by position)');
  const { frame, sol } = AN.analyse(state, A);
  ok(sol.ok, 'solves with the floors, cracked sections and E, L, EX…');
  const rows = FC.driftRows(frame, sol, A.concrete);
  ok(rows.length === 8 && rows.every((r) => r.elastic > 0 && Number.isFinite(r.ratio)), 'drift: 2 floors × 4 cases');
  const rcRes = RD.checkRcFrame(frame.model, sol, FC.rcOf(A.concrete, frame.model));
  ok(rcRes.ok && rcRes.counts.checked === 16 && rcRes.counts.notChecked === 0, 'the concrete check runs on all 16 members', JSON.stringify(rcRes.counts));
  ok(!rcRes.members.some((m) => m.partial.includes('axes-mismatch') || m.partial.includes('area-mismatch')), 'with b and h read from the drawn profile no member is flagged as a different section');
  const swapped = RD.checkRcFrame(frame.model, sol, FC.rcOf({ ...A.concrete, forms: { ...A.concrete.forms, PL300X600: { ...forms.PL300X600, b: Math.round(hB), h: Math.round(bB) } } }, frame.model));
  ok(swapped.members.filter((m) => m.partial.includes('axes-mismatch')).length === 8, 'b and h swapped against the drawn profile: the 8 beams read "partly checked: axes do not match"');
  // stiffness: gross sections are stiffer, so they drift less than cracked
  const g = AN.analyse(state, AN.cleanAnalysis({ ...A, concrete: { ...A.concrete, mat: { ...A.concrete.mat, cracked: false } } }));
  const dg = FC.driftRows(g.frame, g.sol, A.concrete).find((r) => r.set === 'EX1' && r.id === 'F1'), dc = rows.find((r) => r.set === 'EX1' && r.id === 'F1');
  ok(dg.elastic < dc.elastic && dc.elastic / dg.elastic < 3, 'cracked sections drift more than gross ones, by less than the 1/0.35 bound', (dc.elastic / dg.elastic).toFixed(2) + '×');
  const drawn = new Map();
  for (const [id, list] of frame.parts) for (const q of list) drawn.set(frame.model.members[q.k].id, id);
  const probs = FC.problemsOf({ rc: rcRes, drift: rows, drawn: (id) => drawn.get(id) || id, label: () => '', t: (k) => k });
  ok(probs.every((p) => !p.about.length || state.members.some((m) => m.id === p.about[0].id)), 'a problem names a drawn member (not an analysed piece)');
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
