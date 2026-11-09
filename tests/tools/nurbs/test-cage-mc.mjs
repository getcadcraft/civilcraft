#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * test-cage-mc.mjs — ModelCraft's SubD cage hand-over (0.9 D9.8, modelcraft/dev/print-mc.js cageQuads) and the Surfaces panel command
 * `cage.surfaces` (cc-nurbs tools.js), in Node: a real half-edge Mesh in a placement, scaled and moved, then run through the command.
 *   node tools/nurbs/test-cage-mc.mjs [--verbose]
 */
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const VERBOSE = process.argv.includes('--verbose');
let pass = 0, fail = 0;
const ok = (c, m, x = '') => { if (c) { pass++; if (VERBOSE) console.log('  ok   ' + m + (x ? ' - ' + x : '')); } else { fail++; console.log('  FAIL ' + m + (x ? ' - ' + x : '')); } };

const { Mesh } = await mod('mesh.js');
const PM = await mod('print-mc.js');
const V = await mod('vec.js');
const N = await mod('nurbs/index.js');

// an 8 × 8 grid mesh, 0.1 m apart, gently curved; one placement scaled by 2 and moved
const pts = [], faces = [];
for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) pts.push([i * 0.1, j * 0.1, 0.05 * Math.sin(i * 0.6) * Math.cos(j * 0.5)]);
for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) faces.push([i * 8 + j, (i + 1) * 8 + j, (i + 1) * 8 + j + 1, i * 8 + j + 1]);
const mesh = Mesh.fromLists(pts, faces);
const inst = { def: 'd1', m: [2, 0, 0, 0, 0, 2, 0, 0, 0, 0, 2, 0, 1, 0, 0, 1], hidden: false };
const def = { mesh, insts: new Map() }, root = { insts: new Map([['i1', inst]]) };
const model = { context: () => ({ def: root, m: V.ident() }), defs: new Map([['d1', def]]) };

const sel = [{ t: 'i', id: 'i1' }];
const cage = PM.cageQuads(model, { path: [], sel });
ok(cage && cage.verts.length === 64 && cage.quads.length === 49, `49 quads and 64 vertices handed over (${cage && cage.quads.length} / ${cage && cage.verts.length})`);
const v0 = cage.verts.find((p) => Math.abs(p[0] - 1000) < 1e-6 && Math.abs(p[1]) < 1e-6);
ok(!!v0, 'vertices are in the world, in millimetres: the origin vertex is at x = 1 m = 1000 mm after the placement');
ok(Math.abs(Math.max(...cage.verts.map((p) => p[0])) - (1000 + 0.7 * 2 * 1000)) < 1e-6, 'and the scale of 2 applies (0.7 m × 2 = 1400 mm further)');
ok(PM.cageQuads(model, { path: [], sel: [] }) === null, 'nothing selected: no cage');

// the Surfaces command
const d0 = N.doc.newDoc();
let res = null, err = null;
try { res = N.tools.run(d0, 'cage.surfaces', {}, { cage }); } catch (e) { err = e; }
ok(!!res && !err, 'cage.surfaces runs' + (err ? ': ' + (err.code || err.message) : ''));
if (res) {
  ok(res.report && res.report.cage && res.report.cage.patches === 25 && res.report.cage.boundary === 24, `25 exact surfaces, 24 border quads named (${JSON.stringify(res.report && res.report.cage)})`);
  const surfs = N.doc.surfaces(res.doc);
  ok(surfs.length === 25, '25 surfaces in the patch set');
  // one patch sits on the real mesh: the middle quad's patch passes within the cage's own bounds (the limit surface stays inside the cage's box)
  const bb = surfs.map((i) => N.surface.bbox(i.surface));
  const lo = Math.min(...bb.map((b) => b.min[2])), hi = Math.max(...bb.map((b) => b.max[2]));
  const zs = cage.verts.map((p) => p[2]);
  ok(lo >= Math.min(...zs) - 1e-6 && hi <= Math.max(...zs) + 1e-6, 'the limit surface stays inside the cage (convex hull property)', `${lo.toFixed(2)}…${hi.toFixed(2)} mm vs cage ${Math.min(...zs).toFixed(2)}…${Math.max(...zs).toFixed(2)}`);
}
const code = (f) => { try { f(); return null; } catch (e) { return e.code; } };
ok(code(() => N.tools.run(d0, 'cage.surfaces', {}, {})) === 'nurbs.err.cage_none', 'no cage in the environment: nurbs.err.cage_none');
const flatQuads = { verts: [[0, 0, 0], [1, 0, 0], [1, 1, 0], [0, 1, 0]], quads: [[0, 1, 2, 3]] };
ok(code(() => N.tools.run(d0, 'cage.surfaces', {}, { cage: flatQuads })) === 'nurbs.err.cage_nopatch', 'a single quad: nothing is exact, said so (nurbs.err.cage_nopatch)');
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
