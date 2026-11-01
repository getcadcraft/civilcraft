#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-advanced-sim-showcase.mjs — "Two bars", two 10 × 10 × 50 mm steel bars end to end across a 0.01 mm gap, drawn with PartCraft's own part
 * document and mesh kernel (headless PartSession), with a static Simulation study set up in it (0.8 SU.891, add-on advanced-sim). Made ONCE:
 * writes fixtures/showcase/partcraft-two-bars-contact.partcraft.json and refuses to overwrite it without --force.
 *
 *   node tools/addons-test/make-advanced-sim-showcase.mjs [--force] [--out file]
 *
 * The study (not solved in the file): steel from PartCraft's list (E 200 GPa, yield 250 MPa), quadratic tets of 5 mm, the free end of the first bar
 * and the bottom and back faces of both bars held frictionless (symmetry), 27.5 kN pushing the far end of the second bar towards the first
 * (275 MPa: past yield). As saved it is a static study, which cannot be solved: the second bar is held only along its sides. The Advanced
 * simulation add-on turns it into a contact study (Find touching faces) — that is what the screenshots show. Made-up numbers to show the tool.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const args = process.argv.slice(2);
const out = args.includes('--out') ? path.resolve(args[args.indexOf('--out') + 1]) : path.join(ROOT, 'fixtures/showcase/partcraft-two-bars-contact.partcraft.json');
if (fs.existsSync(out) && !args.includes('--force')) { console.log('  --   ' + path.relative(ROOT, out) + ' is there: not made again (--force)'); process.exit(0); }

await import(ROOT + '/tools/partcraft-test/fixtures.mjs');
const H = await import(ROOT + '/tools/cli/headless/part.mjs');
const DEV = ROOT + '/public_html/assets/apps/partcraft/dev/';
const S = await import(DEV + 'sketch.js');
const SIM = await import(DEV + 'sim.js');
const B = await import(DEV + 'brep.js');
await import(DEV + 'ws-simulation.js');   // registers the Simulation study reader (as the app does)
const m = await H.partModules();
const P = m.P;
const part = P.newPart('Two bars');

const GAP = 0.01, W = 10, L = 50;
const sk = S.newSketch();
S.addRect(sk, [0, 0], [L, W]);
S.addRect(sk, [L + GAP, 0], [2 * L + GAP, W]);
const s = P.addFeature(part, 'sketch', { plane: { kind: 'base', name: 'top' }, sketch: sk });
P.addFeature(part, 'extrude', { sketch: s.id, op: 'add', end: 'blind', depth: W });

const rg = new H.PartSession(part, m).regen();
if (rg.error) throw new Error('the part did not build: ' + rg.error);
const bb = rg.stats.bbox;
const face = (n, c, xr = null) => {
  const ax = n.findIndex((v) => v !== 0);
  const i = rg.faces.findIndex((f) => f.type === 'plane' && f.n && f.n.every((v, k) => Math.abs(v - n[k]) < 1e-9) && Math.abs(f.o[ax] - c) < 1e-6 && (!xr || (f.at[0] > xr[0] && f.at[0] < xr[1])));
  if (i < 0) throw new Error('face not found ' + JSON.stringify([n, c, xr]));
  return B.faceRef(rg.faces[i]);
};
const spans = [[0, L], [L + GAP, 2 * L + GAP]];
const lows = [1, 2].flatMap((a) => spans.map((xr) => face([0, a === 1 ? -1 : 0, a === 2 ? -1 : 0], bb.min[a], xr)));
const st = SIM.newSimStudy();
Object.assign(st, {
  kind: 'static', material: 'steel', mesher: 'tet', h: 5,
  constraints: [{ id: 'c1', type: 'frictionless', faces: [face([-1, 0, 0], 0)] }, ...lows.map((f, k) => ({ id: 'c' + (k + 2), type: 'frictionless', faces: [f] }))],
  loads: [{ id: 'l1', type: 'force', faces: [face([1, 0, 0], 2 * L + GAP)], total: 27500, dir: [-1, 0, 0] }],
});
SIM.readSimStudy(st);   // checked as a file would be
part.studies = { simulation: st };
const bytes = new H.PartSession(P.readPart(JSON.parse(JSON.stringify(part))), m).save();
fs.writeFileSync(out, bytes);
console.log('  made ' + path.relative(ROOT, out) + ' (' + bytes.length + ' bytes): ' + rg.stats.bodies + ' pieces, ' + rg.faces.length + ' faces, volume ' + Math.round(rg.stats.volume) + ' mm³');
