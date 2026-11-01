#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-ifc-fixture.mjs — 0.7.1 71.24: the small IFC demo project and its three exports, made ONCE (memory: showcase/large files are
 * made once, never per test run). A metre project in ETRS89 / UTM 32N (a European road): existing ground (a gently rolling 800 × 800 m
 * grid), an alignment with a spiralled curve and a plain one starting at station 1000, a design profile with a vertical curve and a
 * grade break, an urban corridor (lanes, gutter, curb, strip, walk) with superelevation, a pad with a retaining wall on one side, a
 * storm sewer of two manholes and one pipe, one parcel; the lanes and walks carry pavement courses and the alignment a design speed
 * (80 km/h, class Collector) — 0.7.1 71.24 owner decisions.
 *
 *   node tools/civilcraft-test/make-ifc-fixture.mjs [--check]     (--check: write nothing; exit 1 when the files on disk differ)
 *
 * Writes tools/civilcraft-test/fixtures/ifc/demo.civilcraft.json and demo-{4x3,4,2x3}.ifc.
 */
import fs from 'node:fs';
import path from 'node:path';
import { registerHooks } from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(REPO, 'public_html/assets/apps/civilcraft/dev');
const OUT = path.join(REPO, 'tools/civilcraft-test/fixtures/ifc');
const manifest = JSON.parse(fs.readFileSync(path.join(APP, 'manifest.json'), 'utf8'));
registerHooks({ resolve(spec, ctx, next) { const m = manifest.imports?.[spec]; if (m && spec !== 'three') return { url: pathToFileURL(path.join(REPO, 'public_html', m)).href, shortCircuit: true }; return next(spec, ctx); } });
const mod = (f) => import(pathToFileURL(path.join(APP, f)).href);
(await mod('i18n.js')).init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const PJ = await mod('project.js'), CO = await mod('corridor.js'), SE = await mod('superelev.js');

/** The demo project (also used by the Node test, so the fixture and the test start from the same thing). */
export function demoProject() {
  const p = new PJ.Project(), s = p.state;
  s.name = 'IFC demo road';
  s.units = 'm';
  const db = JSON.parse(fs.readFileSync(path.join(APP, 'crs-db.json'), 'utf8')), f = db.fields;
  const row = db.crs.find((r) => r[f.indexOf('code')] === 25832);
  s.crs = { code: 25832, name: row[f.indexOf('name')], proj4: row[f.indexOf('proj4')], unit: 'm', local: null };
  const E0 = 500000, N0 = 5400000, pts = [];
  let n = 1;
  for (let i = 0; i <= 16; i++) for (let j = 0; j <= 16; j++) {
    const x = E0 - 50 + i * 50, y = N0 - 50 + j * 50;
    pts.push({ n: n++, x, y, z: +(100 + 0.02 * (x - E0) + 0.01 * (y - N0) + 1.5 * Math.sin((x - E0) / 90) * Math.cos((y - N0) / 120)).toFixed(3), d: 'EG' });
  }
  p.setPoints(pts, 'demo-ground.csv');
  // pavement courses (0.7.1 71.24) on the lanes and the walk: starting values for the demo, not a standard
  const urban = CO.presetParts('urban', 'm').map((q) => (q.type === 'lane' ? { ...q, layers: [{ name: 'Asphalt', material: 'Asphalt concrete', t: 0.1, course: 'surface' }, { name: 'Base course', material: 'Crushed stone 0/32', t: 0.25, course: 'base' }] }
    : q.type === 'walk' ? { ...q, layers: [{ name: 'Paving', material: 'Concrete pavers', t: 0.08, course: 'surface' }] } : q));
  s.alignments.push({
    id: 'a1', name: 'Main road', start: 1000, design: { speed: 80, unit: 'km/h', cls: 'Collector' },
    pis: [{ x: E0, y: N0 + 40, r: 0 }, { x: E0 + 240, y: N0 + 120, r: 400, ls1: 80, ls2: 80 }, { x: E0 + 500, y: N0 + 570, r: 300 }, { x: E0 + 660, y: N0 + 626, r: 0 }],
    pvis: [{ sta: 1000, z: 103, L: 0 }, { sta: 1300, z: 110, L: 120 }, { sta: 1700, z: 114, L: 0 }, { sta: 1900, z: 117, L: 0 }],
    corridor: { on: true, ...CO.defaultAssembly('m'), step: 40, parts: { L: urban, R: urban }, super: { ...SE.SUPER_DEFAULTS('m'), on: true } },
  });
  s.pads.push({ id: 'p2', name: 'Pad A', pts: [{ x: E0 + 380, y: N0 + 120 }, { x: E0 + 430, y: N0 + 120 }, { x: E0 + 430, y: N0 + 160 }, { x: E0 + 380, y: N0 + 160 }], z: 110.5, cut: 2, fill: 2,
    sides: { edges: [{ wall: true }], wallT: 0.3, wallLimit: 1, maxSlope: null, u: 'm' } });
  s.network = { name: 'Storm A', type: 'storm', rules: { minSlope: 0.005, minCover: 0.6, minDrop: 0.03 },
    structures: [{ id: 's3', name: 'MH-1', x: E0 + 300, y: N0 + 60, rim: null, sumpDepth: 0.3, dia: 1200 }, { id: 's4', name: 'MH-2', x: E0 + 360, y: N0 + 60, rim: null, sumpDepth: 0.3, dia: 1200 }],
    pipes: [{ id: 'q5', name: 'P-1', from: 's3', to: 's4', dia: 300, invUp: 103.6, invDn: 103.2 }] };
  s.parcels.push({ id: 'r6', name: 'Lot 1', pts: [{ x: E0 + 370, y: N0 + 110 }, { x: E0 + 440, y: N0 + 110 }, { x: E0 + 440, y: N0 + 170 }, { x: E0 + 370, y: N0 + 170 }] });
  s.seq = 7;
  return p;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const check = process.argv.includes('--check');
  const IM = await mod('ifc-civil-model.js'), IW = await mod('ifc-civil.js');
  const p = demoProject();
  const json = JSON.stringify({ ...p.toJSON(), saved: '2026-10-26T00:00:00.000Z' }, null, 1) + '\n';
  // the export reads the project back from its file, as a person would open it
  const q = PJ.Project.fromJSON(JSON.parse(json)).project;
  const model = IM.civilIfcModel(q, { lat: 48.75, lon: 9 });
  const files = [['demo.civilcraft.json', json]];
  for (const schema of IW.SCHEMAS) files.push(['demo-' + IW.SCHEMA_INFO[schema].file + '.ifc', IW.writeCivilIfc(model, { schema, now: new Date('2026-10-26T00:00:00Z'), seed: 'ifc-demo' }).text]);
  let diff = 0;
  if (!check) fs.mkdirSync(OUT, { recursive: true });
  for (const [name, text] of files) {
    const f = path.join(OUT, name), same = fs.existsSync(f) && fs.readFileSync(f, 'utf8') === text;
    if (!same) diff++;
    if (!check && !same) fs.writeFileSync(f, text);
    console.log((same ? 'same    ' : check ? 'differs ' : 'written ') + name + ' (' + (text.length / 1024).toFixed(0) + ' KB)');
  }
  process.exit(check && diff ? 1 : 0);
}
