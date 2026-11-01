#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
/**
 * make-classes-showcase.mjs — fixtures/showcase/cadcraft-classes.dwg, made ONCE (0.8 SU.912, session sx-classes; CC0, ours): the
 * sample house (fixtures/showcase/cadcraft-sample-house.dwg) with classes — Architecture-Walls / -Openings-Doors / -Openings-Windows,
 * Annotation-Text / -Dimensions, Finishes-Hatch — the walls and hatches taking colour, lineweight and fill by class, and the
 * A-101 FLOOR PLAN viewport hiding Annotation-Dimensions and drawing the walls red only there. Refuses to overwrite without --force.
 *
 *   node tools/cadcraft-test/make-classes-showcase.mjs [--force]
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/');
const OUT = path.join(ROOT, 'fixtures/showcase/cadcraft-classes.dwg');
if (fs.existsSync(OUT) && !process.argv.includes('--force')) { console.error('exists (made once): ' + OUT + ' — pass --force to remake'); process.exit(1); }
const load = (f) => import(pathToFileURL(APP + f).href);
const I18n = await load('i18n.js'); I18n.init({ strings: JSON.parse(fs.readFileSync(APP + 'lang/en.json', 'utf8')) });
const { Doc } = await load('doc.js'); const { importDwg } = await load('dwg-import.js'); const { readDwg } = await load('dwg/read.js');
const { saveDwg } = await load('dwg-save.js'); const C = await load('classes.js'); const V = await load('vpclass.js');
const src = new Uint8Array(fs.readFileSync(path.join(ROOT, 'fixtures/showcase/cadcraft-sample-house.dwg')));
const d = new Doc(); d.load(importDwg(readDwg(src), { versionTag: new TextDecoder().decode(src.subarray(0, 6)) }));
d.meta.name = 'cadcraft-classes';
C.addClass(d, { name: 'Architecture-Walls', color: 250, lw: 0.5 });
C.addClass(d, { name: 'Architecture-Openings-Doors', color: 5 });
C.addClass(d, { name: 'Architecture-Openings-Windows', color: 4 });
C.addClass(d, { name: 'Annotation-Text' });
C.addClass(d, { name: 'Annotation-Dimensions', color: 1 });
C.addClass(d, { name: 'Finishes-Hatch', fill: 9 });
const byLayer = { 'A-WALL': ['Architecture-Walls', C.BY.color | C.BY.lw], 'A-DOOR': ['Architecture-Openings-Doors', C.BY.color], 'A-GLAZ': ['Architecture-Openings-Windows', C.BY.color],
  'A-ANNO-TEXT': ['Annotation-Text', 0], 'A-ANNO-DIMS': ['Annotation-Dimensions', C.BY.color], 'A-HATCH': ['Finishes-Hatch', C.BY.fill] };
for (const [layer, [cls, flags]] of Object.entries(byLayer)) C.setClassOf(d, [...d.model.values()].filter((e) => e.layer === layer).map((e) => e.id), cls, { flags, map: d.model });
const plan = d.layouts.find((l) => l.name === 'A-101 FLOOR PLAN');
const vp = [...plan.entities.values()].find((e) => e.type === 'viewport');
V.setOverride(d, vp.id, 'Annotation-Dimensions', { hidden: true }, { map: plan.entities });
V.setOverride(d, vp.id, 'Architecture-Walls', { color: 1, lw: 0.7 }, { map: plan.entities });
const out = saveDwg(d, { version: '2018' });
fs.writeFileSync(OUT, out.bytes);
console.log('wrote ' + OUT + ' (' + out.bytes.length + ' bytes); classes: ' + C.classList(d).map((c) => c.name).join(', '));
