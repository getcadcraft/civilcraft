#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-autocomplete-showcase_PART_2.mjs — fixtures/showcase/cadcraft-autocomplete.dwg (0.8 EG.54, rule 37). Made ONCE (refuses to
 * overwrite): a wall framed with four studs at 16" (the fifth is the ghost), a stair of three steps drawn as one polyline (the
 * fourth step is the ghost), and a room drawn on three sides (the fourth wall is the ghost). Inches; layers FRAMING, STAIR, WALLS.
 * Shots: open it in /lab/cadcraft, Extents, rest the cursor beside the end of each group.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT = path.join(ROOT, 'fixtures/showcase/cadcraft-autocomplete.dwg');
if (fs.existsSync(OUT)) { console.log('exists, not overwritten:', OUT); process.exit(0); }
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev');
const load = (f) => import(pathToFileURL(path.join(APP, f)).href);
const I18n = await load('i18n.js');
I18n.init({ strings: JSON.parse(fs.readFileSync(path.join(APP, 'lang/en.json'), 'utf8')) });
const { Doc } = await load('doc.js');
const { saveDwg } = await load('dwg-save.js');
const doc = new Doc();
doc.meta.name = 'Autocomplete showcase'; doc.meta.units = 'in';
doc.addLayer({ name: 'FRAMING', color: 30 }); doc.addLayer({ name: 'STAIR', color: 5 }); doc.addLayer({ name: 'WALLS', color: 7 });
doc.change('Showcase', () => {
  doc.add({ type: 'line', layer: 'FRAMING', x1: 0, y1: 0, x2: 192, y2: 0 });          // bottom plate
  doc.add({ type: 'line', layer: 'FRAMING', x1: 0, y1: 3, x2: 192, y2: 3 });
  for (let i = 0; i < 4; i++) doc.add({ type: 'line', layer: 'FRAMING', x1: i * 16, y1: 3, x2: i * 16, y2: 99 });   // studs at 16"
  const pts = [{ x: 260, y: 0, b: 0 }]; let x = 260, y = 0;
  for (let i = 0; i < 3; i++) { y += 7.5; pts.push({ x, y, b: 0 }); x += 10; pts.push({ x, y, b: 0 }); }
  doc.add({ type: 'poly', layer: 'STAIR', closed: false, pts });
  doc.add({ type: 'line', layer: 'WALLS', x1: 400, y1: 0, x2: 640, y2: 0 });          // a 20' × 14' room on three sides
  doc.add({ type: 'line', layer: 'WALLS', x1: 640, y1: 0, x2: 640, y2: 168 });
  doc.add({ type: 'line', layer: 'WALLS', x1: 640, y1: 168, x2: 400, y2: 168 });
});
fs.writeFileSync(OUT, saveDwg(doc, { version: '2018' }).bytes);
console.log('wrote', OUT);
