#!/usr/bin/env node
/* SPDX-License-Identifier: Apache-2.0 */
// VP-NAME test: view names and their live labels through DXF and DWG (0.8, dec-eg_PART_3)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
let pass = 0, fail = 0;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const APP = path.join(ROOT, 'public_html/assets/apps/cadcraft/dev/');
const imp = (f) => import(pathToFileURL(APP + f).href);
const ok = (c, m, extra = '') => { if (c) { pass++; console.log('  ok   ' + m); } else { fail++; console.log('  FAIL ' + m + (extra ? ' — ' + extra : '')); } };
const section = (s) => console.log('\n== ' + s);

const en = JSON.parse(fs.readFileSync(APP + 'lang/en.json', 'utf8'));
const I18n = await imp('i18n.js');
I18n.init({ strings: en });
const { Doc } = await imp('doc.js');
await imp('commands.js');
const { readDxf, writeDxf } = await imp('dxf.js');
const { writeDxf2000 } = await imp('dxf2000.js');
const { saveDwg } = await imp('dwg-save.js');
const { importDwg } = await imp('dwg-import.js');
const { readDwg } = await imp('dwg/read.js');

section('VP-NAME: view names and the labels that follow them, through every file format');
const d = new Doc();
d.change('s', () => d.setLayouts([{ name: 'A-101', paper: { w: 420, h: 297, unit: 'mm', x0: 0, y0: 0 }, entities: new Map() }]));
const L = d.layouts[0].entities;
d.change('v', () => {
  d.add({ type: 'viewport', x: 100, y: 150, w: 150, h: 100, cx: 0, cy: 0, s: 1, vname: 'Kitchen plan' }, L);
  d.add({ type: 'viewport', x: 300, y: 150, w: 150, h: 100, cx: 0, cy: 0, s: 2 }, L);
});
const vps = [...L.values()].filter((e) => e.type === 'viewport');
d.change('t', () => { d.add({ type: 'text', x: 30, y: 90, h: 3.5, rot: 0, s: 'Kitchen plan', ha: 'left', va: 'baseline', wf: 1, field: { k: 'vpview', vp: vps[0].id } }, L); d.add({ type: 'text', x: 30, y: 60, h: 3.5, rot: 0, s: 'plain', ha: 'left', va: 'baseline', wf: 1 }, L); });
const files = [['DXF R12', () => readDxf(writeDxf(d).text)], ['DXF 2000', () => readDxf(writeDxf2000(d).text)],
  ...['2000', '2004', '2007', '2010', '2013', '2018'].map((v) => ['DWG ' + v, () => importDwg(readDwg(saveDwg(d, { version: v }).bytes), { versionTag: 'x' })])];
for (const [label, read] of files) {
  let b;
  try { b = new Doc(); b.load(read()); } catch (err) { ok(false, label + ': reads', err.stack); continue; }
  const l = b.layouts.find((x) => x.name === 'A-101');
  const bv = [...l.entities.values()].filter((e) => e.type === 'viewport');
  const labels = [...l.entities.values()].filter((e) => e.type === 'text' && e.field?.k === 'vpview');
  ok(bv.length === 2 && bv[0].vname === 'Kitchen plan' && !bv[1].vname, label + ': the view name comes back on the right viewport', JSON.stringify(bv.map((v) => v.vname)));
  ok(labels.length === 1 && labels[0].field.vp === bv[0].id, label + ': the label is still a live field of that viewport');
  b.change('rename', () => b.update(bv[0].id, { ...b.get(bv[0].id), vname: 'Pantry' }, l.entities));
  ok(labels.length && b.get(labels[0].id) === undefined ? true : [...l.entities.values()].find((e) => e.field?.k === 'vpview').s === 'Pantry', label + ': renaming the view rewrites the label');
}
console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
