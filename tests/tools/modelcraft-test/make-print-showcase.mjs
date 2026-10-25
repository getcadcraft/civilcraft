#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-print-showcase.mjs — fixtures/showcase/modelcraft-print.modelcraft (0.7 LC.21, session print-07): five parts in a row
 * for the print tools' shots and video, built by ModelCraft's own kernel, millimetres:
 *   Bridge (x 0–60)          two legs and a span 30 mm up: Supports preview (columns, then trees)
 *   Bracket (x 80–110)       a 0.6 mm fin on a 4 mm base: Wall thickness (two thin areas)
 *   Ball (x 140–180)         a 40 mm sphere: Hollow at 1.5 mm with a drain hole underneath
 *   Box + Round hole (x 200) a Beginner box with a round hole through it, not grouped yet: Group cuts it
 *   Broken box (x 240–270)   a 30 mm cube with no bottom and its top turned over: Repair
 * Made once: refuses to overwrite (KICKOFF rule 13, memory showcase-files); `--check` rebuilds in memory and compares.
 *   node tools/modelcraft-test/make-print-showcase.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
const OUT = path.join(ROOT, 'fixtures/showcase/modelcraft-print.modelcraft');
const I18N = await import(pathToFileURL(path.join(APP, 'i18n.js')));
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const M = await import(pathToFileURL(path.join(APP, 'model.js')));
const B = await import(pathToFileURL(path.join(APP, 'beginner.js')));

const mm = (v) => v / 1000;
const at = (x, y = 0, z = 0, s = 1) => [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, mm(x), mm(y), mm(z), 1];

function build() {
  const model = new M.Model();
  model.units = 'mm';
  model.change('showcase', (m) => {
    // a profile in the XZ plane (mm), pulled 20 mm along green
    const profile = (name, pts, color) => {
      const d = m.newDef('group', name);
      M.addPolygon(d, pts.map(([x, z]) => [mm(x), 0, mm(z)]));
      const f = [...d.faces.keys()][0], n = M.faceNormal(d, d.faces.get(f));
      M.pushPull(d, f, n[1] > 0 ? mm(20) : -mm(20));
      if (n[1] < 0) for (const [id, p] of d.verts) d.verts.set(id, [p[0], p[1] + mm(20), p[2]]);
      M.paintFaces(d, [...d.faces.keys()], color);
      return d;
    };
    const bridge = profile('Bridge', [[0, 0], [10, 0], [10, 30], [50, 30], [50, 0], [60, 0], [60, 40], [0, 40]], '#2e86de');
    m.place(m.root, bridge.id, at(0));
    const bracket = profile('Bracket', [[0, 0], [30, 0], [30, 4], [15.3, 4], [15.3, 20], [14.7, 20], [14.7, 4], [0, 4]], '#27ae60');
    m.place(m.root, bracket.id, at(80));
    const ball = B.buildShape(m, 'sphere', 'Ball');
    m.place(m.root, ball.id, at(160, 10, 0, 2));
    const box = B.buildShape(m, 'box', 'Box');
    m.place(m.root, box.id, at(210, 10));
    const hole = B.buildShape(m, 'hole-cylinder', 'Round hole');
    m.root.insts.set(m.place(m.root, hole.id, at(210, 10)), { def: hole.id, m: [0.5, 0, 0, 0, 0, 0.5, 0, 0, 0, 0, 1.5, 0, mm(210), mm(10), -mm(5), 1] });
    const broken = m.newDef('group', 'Broken box');
    M.addPolygon(broken, M.rectPts([0, 0, 0], [1, 0, 0], [0, 1, 0], mm(30), mm(30)));
    M.pushPull(broken, [...broken.faces.keys()][0], mm(30));
    const byZ = (z) => [...broken.faces].find(([, f]) => Math.abs(M.faceNormal(broken, f)[2] - z) < 1e-6)[0];
    broken.faces.delete(byZ(-1));
    M.reverseFaces(broken, [byZ(1)]);
    m.place(m.root, broken.id, at(240, -5));
  });
  return JSON.stringify(model.toJSON());
}

if (process.argv.includes('--check')) {
  const same = fs.existsSync(OUT) && fs.readFileSync(OUT, 'utf8') === build();
  console.log(same ? 'the showcase is as this script makes it' : 'differs (or missing): ' + path.relative(ROOT, OUT));
  process.exit(same ? 0 : 1);
}
if (fs.existsSync(OUT)) { console.log('exists, left alone: ' + path.relative(ROOT, OUT)); process.exit(0); }
fs.writeFileSync(OUT, build());
console.log('wrote ' + path.relative(ROOT, OUT));
