#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-split-showcase.mjs — fixtures/showcase/modelcraft-split.modelcraft (0.8 SU.929, session sx-split): two parts too big
 * for a 220 × 220 × 250 mm bed, for Split for printing's shots and video, built by ModelCraft's own kernel, millimetres:
 *   Cube (x −150–150)      a 300 mm Beginner box: Fit the bed → 8 pieces, 24 pegs, 12 numbered joints
 *   Column (x 300–420)     a Beginner cylinder 120 mm across and 360 mm tall: Fit the bed → 2 pieces; or At places I give
 * Made once: refuses to overwrite (KICKOFF rule 13, memory showcase-files); `--check` rebuilds in memory and compares.
 *   node tools/modelcraft-test/make-split-showcase.mjs [--check]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/modelcraft/dev');
const OUT = path.join(ROOT, 'fixtures/showcase/modelcraft-split.modelcraft');
const I18N = await import(pathToFileURL(path.join(APP, 'i18n.js')));
I18N.init({ locale: 'en', strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const M = await import(pathToFileURL(path.join(APP, 'model.js')));
const B = await import(pathToFileURL(path.join(APP, 'beginner.js')));

const mm = (v) => v / 1000;
const place = (x, y, z, sx, sy, sz) => [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, mm(x), mm(y), mm(z), 1];

function build() {
  const model = new M.Model();
  model.units = 'mm';
  model.change('showcase', (m) => {
    const cube = B.buildShape(m, 'box', 'Cube');               // 20 mm, standing on z = 0, centred
    m.place(m.root, cube.id, place(0, 0, 0, 15, 15, 15));
    const col = B.buildShape(m, 'cylinder', 'Column');
    m.place(m.root, col.id, place(360, 0, 0, 6, 6, 18));
  });
  return JSON.stringify(model.toJSON());
}

if (process.argv.includes('--check')) {
  const same = fs.existsSync(OUT) && fs.readFileSync(OUT, 'utf8') === build();
  console.log(same ? 'same' : 'differs');
  process.exit(same ? 0 : 1);
}
if (fs.existsSync(OUT)) { console.log('exists, left alone: ' + path.relative(ROOT, OUT)); process.exit(0); }
fs.writeFileSync(OUT, build());
console.log('wrote ' + path.relative(ROOT, OUT));
