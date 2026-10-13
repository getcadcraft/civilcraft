#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * civil-cases.mjs — CivilCraft's three DWG test drawings (the ones bin/test-civilcraft.mjs writes:
 * "fixture", "every-kind", "big"), as CivilCraft entity lists, for the writer section of compare.mjs.
 *
 *   node tools/dwg-test/civil-cases.mjs <outDir>
 *     → <outDir>/<name>.json   { name, units, layers, entities }   (CivilCraft's writeDwg input)
 *       <outDir>/<name>.seed.dwg  the same list written by CivilCraft's own R2000 dwg-write.js (the seed,
 *                                 a baseline row in the report)
 *
 * The fixture is built with CivilCraft's own modules (points.js, project.js, scene.js) from
 * tools/civilcraft-test/site-topo.csv, exactly as the test does; every-kind and big are the test's literal
 * lists (bin/test-civilcraft.mjs builds them inline and exports nothing, so they are repeated here —
 * keep them in step if the test changes). Runs in its own process because it installs the
 * CivilCraft import map (registerHooks) for delaunator / robust-predicates.
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { pathToFileURL } from 'node:url';
import { REPO } from './lib/util.mjs';

const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const TOOLS = path.join(REPO, 'tools/civilcraft-test');
const out = process.argv[2];
if (!out) { console.error('usage: civil-cases.mjs <outDir>'); process.exit(2); }
fs.mkdirSync(out, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({
  resolve(spec, ctx, next) {
    const m = manifest.imports?.[spec];
    if (m) return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true };
    return next(spec, ctx);
  },
});
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
const PTS = await mod('points.js');
const PJ = await mod('project.js');
const SC = await mod('scene.js');
const DW = await mod('dwg-write.js');
const FIX = await import(pathToFileURL(path.join(TOOLS, 'make-fixture.mjs')).href);

// ---- fixture (as bin/test-civilcraft.mjs "LandXML out and back in" + "DWG (R2000)")
const fx = PTS.parsePoints(fs.readFileSync(path.join(TOOLS, 'site-topo.csv'), 'utf8'));
const project = new PJ.Project();
project.setPoints(fx.points, 'site-topo.csv');
project.change('Breaklines from groups', (s) => { for (const k of ['FL', 'TBN', 'TBS', 'RIDGE']) s.surface.groups[k] = 'breakline'; s.surface.groups.CP = 'off'; });
const al = { id: 'a1', name: 'Access road', start: 1000, pis: [{ x: FIX.E0 + 10, y: FIX.N0 + 260, r: 0 }, { x: FIX.E0 + 200, y: FIX.N0 + 230, r: 120 }, { x: FIX.E0 + 300, y: FIX.N0 + 40, r: 90 }, { x: FIX.E0 + 390, y: FIX.N0 + 30, r: 0 }], pvis: [] };
project.change('Alignment', (s) => s.alignments.push(al));
{
  const a = project.alignment(project.state.alignments[0]);
  const egp = project.egProfile(project.state.alignments[0]).filter((p) => p.z !== null);
  const z0 = egp[0].z, z1 = egp[egp.length - 1].z, mid = a.start + a.length / 2;
  project.change('Profile', (s) => { s.alignments[0].pvis = [{ sta: a.start, z: Number(z0.toFixed(2)), L: 0 }, { sta: Number(mid.toFixed(2)), z: 256, L: 120 }, { sta: Number(a.end.toFixed(2)), z: Number(z1.toFixed(2)), L: 0 }]; });
}
const st = project.state;
const scene = SC.planScene({
  units: 'ft', points: fx.points, surface: project.eg().surface,
  contours: { interval: 1, major: 5, list: project.contours() }, breaklines: project.egBreaklines(),
  alignments: st.alignments.map((a) => ({ name: a.name, alignment: project.alignment(a) })), pads: [],
}, { mmPerUnit: 25.4 / 40 });
const cases = [{ name: 'fixture', units: 'ft', layers: SC.LAYERS.map((l) => ({ name: l.name, color: l.aci })), entities: SC.toDxfEntities(scene, 25.4 / 40) }];

// ---- every-kind (literal list from the test)
cases.push({
  name: 'every-kind', units: 'm', layers: [{ name: 'Lay/er:1', color: 3 }, { name: 'Lay_er_1', color: 4 }, { name: 'Pads', color: 'blue' }],
  entities: [
    { type: 'line', layer: 'Lay/er:1', a: { x: -12.5, y: 3.25, z: 1.5 }, b: { x: 100.125, y: -7, z: -2 } },
    { type: 'line', layer: 'Lay_er_1', a: { x: 0, y: 0 }, b: { x: 0, y: 10 } },
    { type: 'poly', layer: 'Pads', pts: [{ x: 1, y: 1 }, { x: 5, y: 1 }, { x: 5, y: 4 }], closed: true },
    { type: 'poly', layer: 'C-TOPO-MAJR', pts: [{ x: 0.1, y: 0.2 }, { x: 0.1, y: 0.3 }, { x: 0.4, y: 0.3 }], elev: -3.75 },
    { type: 'poly', layer: 'Pads', pts: [{ x: 1, y: 1 }] },
    { type: 'poly3d', layer: 'C-TOPO-BRKL', pts: [{ x: 1, y: 2, z: 3 }, { x: 4, y: 5, z: 6 }, { x: 7, y: 9, z: 8 }], closed: true },
    { type: 'arc', layer: 'C-ROAD-CNTR', c: { x: 50, y: 60 }, r: 12.5, a0: 5.5, a1: 0.5 },
    { type: 'circle', layer: 'C-STRM-STRC', c: { x: -5, y: -6 }, r: 0.6 },
    { type: 'point', layer: 'V-NODE', x: 3, y: 4, z: -1.25 },
    { type: 'text', layer: 'V-NODE-TEXT', x: 10, y: 20, h: 1.5, rot: 0, text: 'Left 12° ±0.5 Ω € — ½', align: 'left' },
    { type: 'text', layer: 'C-ROAD-STAN', x: 11, y: 21, h: 2, rot: 1.25, text: '11+00', align: 'center' },
    { type: 'text', layer: 'C-ROAD-STAN', x: 12, y: 22, h: 2.5, rot: -0.5, text: 'PC 12+34.56', align: 'right' },
  ],
});
// ---- big (literal generator from the test)
{
  const ents = [], layers = [];
  for (let i = 0; i < 300; i++) layers.push({ name: 'L' + i, color: 1 + (i % 255) });
  let s = 7; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < 70000; i++) ents.push({ type: 'point', layer: 'L' + (i % 300), x: 6.2e6 + r() * 1e4, y: 2.1e6 + r() * 1e4, z: r() * 100 });
  ents.push({ type: 'poly', layer: 'L1', pts: Array.from({ length: 20000 }, (_, i) => ({ x: i * 0.5, y: Math.sin(i / 100) * 50 })), elev: 250.5 });
  ents.push({ type: 'poly3d', layer: 'L2', pts: Array.from({ length: 3000 }, (_, i) => ({ x: i, y: Math.cos(i / 30) * 9, z: i / 10 })) });
  cases.push({ name: 'big', units: 'ft', layers, entities: ents });
}

const summary = [];
for (const c of cases) {
  fs.writeFileSync(path.join(out, c.name + '.json'), JSON.stringify(c));
  const t0 = performance.now();
  const { bytes, report } = DW.writeDwg({ units: c.units, layers: c.layers, entities: c.entities, created: new Date(Date.UTC(2026, 9, 10, 12)) });
  const ms = performance.now() - t0;
  fs.writeFileSync(path.join(out, c.name + '.seed.dwg'), bytes);
  fs.writeFileSync(path.join(out, c.name + '.seed.report.json'), JSON.stringify({ ms, layers: report.layers, notes: report.notes, objects: report.objects }));
  summary.push({ name: c.name, entities: c.entities.length, seedBytes: bytes.length, seedMs: Math.round(ms) });
}
console.log(JSON.stringify(summary));
